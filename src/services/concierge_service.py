"""
Concierge service that retrieves database context and consults a local LLM.
"""
from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache
import logging
import os
from pathlib import Path
import re
from typing import Dict, Iterable, List, Optional, Sequence, Tuple

from flask import current_app, has_app_context

from src.config import Config
from src.data_access import get_db
from src.data_access.resource_dal import ResourceDAL
from src.services.llm_client import LocalLLMClient, LocalLLMUnavailableError


@dataclass(frozen=True)
class ContextChunk:
    source: str
    heading: str
    content: str

    @property
    def preview(self) -> str:
        snippet = self.content.strip()
        if len(snippet) > 200:
            return f"{snippet[:197].rstrip()}..."
        return snippet


class ConciergeService:
    """High-level helper that powers the AI Resource Concierge experience."""

    STOP_WORDS = {
        'the', 'and', 'is', 'a', 'an', 'of', 'to', 'in', 'for', 'with', 'on', 'at',
        'by', 'from', 'or', 'that', 'this', 'these', 'those', 'how', 'what', 'which',
        'can', 'i', 'we', 'about', 'need', 'use', 'it', 'are', 'be', 'do', 'does',
        'me', 'my', 'you', 'your', 'their', 'our', 'any', 'info', 'resource',
        'resources', 'if', 'tell', 'show', 'list'
    }
    MAX_RESOURCES = 4  # Reduced from 6 for faster processing
    MAX_DOC_SNIPPETS = 2  # Reduced from 3 for faster processing

    def __init__(self, *, llm_client: Optional[LocalLLMClient] = None,
                 context_dir: Optional[str] = None) -> None:
        default_root = Path(Config.BASE_DIR).parent / 'docs' / 'context'
        configured = None
        if has_app_context():
            configured = current_app.config.get('CONCIERGE_CONTEXT_DIR')
        self.context_root = Path(context_dir or configured or default_root)
        self.logger = current_app.logger if has_app_context() else logging.getLogger(__name__)
        try:
            self.llm_client = llm_client or LocalLLMClient.from_app_config()
            if self.llm_client:
                self.logger.info('LLM client initialized: %s/%s at %s', 
                               self.llm_client.provider, self.llm_client.model, self.llm_client.base_url)
            else:
                self.logger.info('LLM client not configured (LOCAL_LLM_BASE_URL not set)')
        except Exception as exc:
            self.logger.warning('Failed to initialize LLM client: %s', exc)
            self.llm_client = None

    # Public API --------------------------------------------------------------

    def answer(self, question: str, *,
               category: Optional[str] = None,
               published_only: bool = True) -> Dict:
        """Return an AI-assisted response for the supplied natural language question."""
        cleaned = (question or '').strip()
        if not cleaned:
            raise ValueError('Question must not be empty.')
        if len(cleaned) > 1000:
            raise ValueError('Question must be 1000 characters or fewer.')

        # Detect if this is a greeting/small talk vs. actual resource query
        is_greeting = self._is_greeting_or_small_talk(cleaned)
        
        keywords = self._extract_keywords(cleaned) or self._tokenize(cleaned)
        
        # Only search for resources if it's not just a greeting
        resources = []
        doc_chunks = []
        if not is_greeting:
            resources = self._resource_matches(cleaned, keywords, category=category, published_only=published_only)
            doc_chunks = self._context_matches(keywords)
        
        # Build stats lazily - only if we have resources (skip for greetings)
        stats = {} if is_greeting else self._build_insights()
        context_block = self._format_context_block(resources, doc_chunks, {})  # Empty stats to skip in context

        llm_answer, llm_error = self._call_llm(cleaned, context_block, is_greeting=is_greeting)
        
        # Use personalized fallback for greetings
        if is_greeting and not llm_answer:
            fallback = "Hello! 👋 I'm your Campus Resource Concierge, and I'm here to help you find the perfect study spaces, maker labs, equipment, and event venues around IU Bloomington. What can I help you discover today?"
        else:
            fallback = self._compose_fallback(resources, doc_chunks, stats)
        
        answer = llm_answer or fallback

        return {
            'question': cleaned,
            'answer': answer,
            'resources': [self._serialize_resource(resource) for resource in resources] if not is_greeting else [],
            'doc_snippets': [self._serialize_chunk(chunk) for chunk in doc_chunks],
            'stats': stats,
            'used_llm': llm_answer is not None,
            'llm_error': llm_error,
            'context_block': context_block
        }

    # Retrieval helpers -------------------------------------------------------

    def _context_matches(self, keywords: Sequence[str]) -> List[ContextChunk]:
        chunks = self._load_context_chunks(self.context_root)
        scored: List[Tuple[float, ContextChunk]] = []
        for chunk in chunks:
            score = self._score_text(chunk.content, keywords, heading=chunk.heading)
            if score <= 0:
                continue
            scored.append((score, chunk))

        scored.sort(key=lambda item: item[0], reverse=True)
        return [chunk for _, chunk in scored[: self.MAX_DOC_SNIPPETS]]

    def _resource_matches(self, question: str, keywords: Sequence[str], *,
                          category: Optional[str], published_only: bool) -> List:
        tokens = list(keywords) if keywords else self._tokenize(question)
        filtered_terms = [
            token for token in tokens
            if token and token not in self.STOP_WORDS
        ]
        if not filtered_terms:
            filtered_terms = [token for token in self._tokenize(question) if token]

        scored: Dict[int, Tuple[float, object]] = {}
        status_filter = 'published' if published_only else None

        # Detect category from question if not explicitly provided
        detected_category = category
        if not detected_category:
            question_lower = question.lower()
            category_keywords = {
                'Study Room': ['study', 'study room', 'study space', 'quiet', 'reading', 'library'],
                'Lab Equipment': ['lab', 'laboratory', 'equipment', 'scientific', 'research', 'experiment'],
                'Event Space': ['event', 'venue', 'meeting', 'conference', 'presentation', 'gathering', 'auditorium', 'hall'],
                'AV Equipment': ['av', 'audio', 'video', 'microphone', 'projector', 'sound', 'recording', 'podcast', 'studio', 'broadcast'],
                'Tutoring': ['tutor', 'tutoring', 'help', 'academic support', 'academic help']
            }
            for cat, keywords_list in category_keywords.items():
                if any(kw in question_lower for kw in keywords_list):
                    detected_category = cat
                    break

        # Optimized: Use the full question for a single search instead of multiple term searches
        # This reduces database queries from up to 5 to just 1-2
        if filtered_terms:
            # First, try searching with category filter if detected
            rows = ResourceDAL.search_resources(
                keyword=question,  # Use full question for better context matching
                category=detected_category,  # Use detected category to filter results
                status=status_filter,
                per_page=self.MAX_RESOURCES * 4,  # Get more candidates in one query
                page=1
            ) or []
            
            # Score all results at once with minimum threshold
            for resource in rows:
                if resource.resource_id in scored:
                    continue
                score = self._score_resource(resource, filtered_terms)
                # Only include resources with meaningful relevance (minimum threshold)
                if score >= 1.0:  # Require at least some relevance
                    scored[resource.resource_id] = (score, resource)
            
            # If we have a strong title match but no category match, also search without category filter
            # This handles cases like "podcast room" where title matches but category might not
            if detected_category and len(scored) < 2:
                # Check if we have strong title matches that might be in different categories
                rows_no_category = ResourceDAL.search_resources(
                    keyword=question,
                    category=None,  # Search all categories
                    status=status_filter,
                    per_page=self.MAX_RESOURCES * 6,
                    page=1
                ) or []
                
                for resource in rows_no_category:
                    if resource.resource_id in scored:
                        continue
                    score = self._score_resource(resource, filtered_terms)
                    # For title-based matches, be more lenient if title matches strongly
                    title = (getattr(resource, 'title', None) or '').lower()
                    has_strong_title_match = any(
                        keyword in title and len(keyword) >= 4 
                        for keyword in filtered_terms
                    )
                    # Include if strong title match (even if category doesn't match) or good overall score
                    if has_strong_title_match and score >= 2.0:
                        scored[resource.resource_id] = (score, resource)

        if scored:
            ranked = sorted(scored.values(), key=lambda item: item[0], reverse=True)
            # Only return top results that meet a quality threshold
            # If top result has high score, be more selective
            top_score = ranked[0][0] if ranked else 0
            if top_score >= 5.0:
                # High-quality matches - only return very relevant ones
                threshold = max(2.0, top_score * 0.3)  # At least 30% of top score
                filtered = [(s, r) for s, r in ranked if s >= threshold]
                return [resource for _, resource in filtered[: self.MAX_RESOURCES]]
            else:
                # Lower quality matches - return best available
                return [resource for _, resource in ranked[: self.MAX_RESOURCES]]

        # Fallback: get some resources if no matches
        fallback = ResourceDAL.search_resources(
            keyword=None,
            category=category,
            status=status_filter,
            per_page=self.MAX_RESOURCES,
            page=1
        )
        return fallback or []

    # Prompt + completion helpers --------------------------------------------

    def _call_llm(self, question: str, context_block: str, *, is_greeting: bool = False) -> Tuple[Optional[str], Optional[str]]:
        if not self.llm_client:
            self.logger.info('LLM client not available - using fallback summary')
            return None, 'Local AI runtime is not configured.'

        self.logger.info('Calling LLM with question: %s', question[:50])
        
        if is_greeting:
            # Friendly greeting response with personality
            system_prompt = (
                "You are a friendly and helpful Campus Resource Concierge for Indiana University Bloomington. "
                "You're enthusiastic about helping students, faculty, and staff find the perfect campus resources. "
                "Respond warmly to greetings and small talk. Be conversational, friendly, and show genuine interest. "
                "Mention that you can help them find study rooms, maker spaces, equipment, event venues, and more. "
                "Keep it brief (2-3 sentences) and inviting. Use a warm, approachable tone. "
                "Write in clear, well-formatted paragraphs with proper spacing."
            )
            user_prompt = question.strip()
        else:
            # Resource-focused response with personality
            system_prompt = (
                "You are a knowledgeable and friendly Campus Resource Concierge for Indiana University Bloomington. "
                "You help students, faculty, and staff find the perfect campus resources. "
                "You're enthusiastic, helpful, and genuinely want to make their campus experience better. "
                "Answer ONLY using the CONTEXT below. Be conversational and engaging (3-5 sentences). "
                "IMPORTANT: Only mention resources from the CONTEXT that are ACTUALLY relevant to the question. "
                "If the user asks for 'study rooms', only mention resources in the 'Study Room' category. "
                "If they ask for 'lab equipment', only mention 'Lab Equipment' resources. "
                "Do NOT mention resources from unrelated categories (e.g., don't mention auditoriums when asked about study rooms). "
                "If the CONTEXT contains relevant resources, mention them naturally using **bold** for resource names and explain why they're helpful. "
                "If the CONTEXT doesn't contain relevant resources, be honest and suggest they try rephrasing or ask about something else. "
                "Never invent or guess details. Show personality while staying accurate and helpful. "
                "Format your response with clear paragraphs, proper spacing, and use **bold** for important resource names or key terms."
            )
            user_prompt = f"{question.strip()}\n\nCONTEXT:\n{context_block.strip()}"
        
        messages = [
            {'role': 'system', 'content': system_prompt},
            {'role': 'user', 'content': user_prompt}
        ]

        try:
            answer = self.llm_client.chat(messages)
            self.logger.info('LLM response received (length: %d)', len(answer))
            # Clean up and format the response
            answer = self._format_response(answer)
            return answer, None
        except LocalLLMUnavailableError as exc:
            self.logger.warning('Local AI unavailable: %s', exc)
            return None, str(exc)

    def _compose_fallback(self, resources: Sequence, doc_chunks: Sequence[ContextChunk],
                          stats: Dict) -> str:
        """Compose a well-formatted fallback response when LLM is unavailable."""
        segments: List[str] = []

        if resources:
            intro = f"I found {len(resources)} resource{'s' if len(resources) != 1 else ''} that might help:"
            segments.append(intro)
            
            for resource in resources:
                title = getattr(resource, 'title', 'Unknown')
                category = getattr(resource, 'category', None) or 'General'
                location = getattr(resource, 'location', None) or 'Location TBD'
                capacity = getattr(resource, 'capacity', None)
                desc = (getattr(resource, 'description', None) or '').strip()
                
                resource_info = f"• **{title}** ({category})"
                if location and location != 'Location TBD':
                    resource_info += f" — located at {location}"
                if capacity:
                    resource_info += f" — {capacity} seats"
                
                if desc:
                    # Truncate description to first sentence or 120 chars
                    first_sentence = desc.split('.')[0]
                    if len(first_sentence) > 120:
                        first_sentence = first_sentence[:117] + '...'
                    resource_info += f"\n  {first_sentence}"
                
                segments.append(resource_info)
        else:
            segments.append("I couldn't find any specific resources matching your question in the current catalog.")

        if stats.get('most_requested'):
            segments.append("\nHere are some popular resources that might interest you:")
            for item in stats['most_requested']:
                segments.append(f"• {item['title']} ({item['total']} recent bookings)")

        return "\n\n".join(segments)

    def _format_context_block(self, resources: Sequence, doc_chunks: Sequence[ContextChunk],
                              stats: Dict) -> str:
        """Format context block in a compact way to reduce prompt size."""
        lines: List[str] = []
        if resources:
            lines.append("RESOURCES:")
            for resource in resources:
                # More compact format - shorter descriptions
                description = (getattr(resource, 'description', None) or '')[:100].strip()
                desc_text = description + ('…' if len(getattr(resource, 'description', None) or '') > 100 else '')
                lines.append(
                    f"- {getattr(resource, 'title', 'Unknown')} ({getattr(resource, 'category', None) or 'General'}) | "
                    f"{getattr(resource, 'location', None) or 'TBD'} | "
                    f"Cap:{getattr(resource, 'capacity', None) or 'varies'} | "
                    f"{'Approval req' if getattr(resource, 'is_restricted', False) else 'Auto'} | "
                    f"{desc_text}"
                )
        else:
            lines.append("RESOURCES: None found.")

        # Skip stats to reduce context size - they're not critical for most queries
        if doc_chunks:
            lines.append("DOCS:")
            for chunk in doc_chunks:
                # Shorter preview
                preview = chunk.preview[:120] + ('…' if len(chunk.preview) > 120 else '')
                lines.append(f"- {chunk.heading}: {preview}")

        return "\n".join(lines)

    # Statistical context ----------------------------------------------------

    def _build_insights(self) -> Dict:
        """Build lightweight insights - only essential stats to reduce query overhead."""
        # Only get most requested (most useful for fallback), skip others for speed
        return {
            'most_requested': self._most_requested_resources(limit=2),  # Reduced from 3
            'category_counts': [],  # Skip - not critical for responses
            'total_resources': 0  # Skip - not critical for responses
        }

    @staticmethod
    def _most_requested_resources(limit: int = 3) -> List[Dict[str, object]]:
        query = '''
            SELECT r.resource_id,
                   r.title,
                   COUNT(b.booking_id) AS total
            FROM bookings b
            JOIN resources r ON r.resource_id = b.resource_id
            WHERE b.status IN ('pending', 'approved', 'completed')
            GROUP BY r.resource_id, r.title
            ORDER BY total DESC
            LIMIT ?
        '''
        with get_db() as conn:
            cursor = conn.cursor()
            rows = cursor.execute(query, (limit,)).fetchall()
        return [dict(row) for row in rows]

    # Serialization helpers --------------------------------------------------

    @staticmethod
    def _serialize_resource(resource) -> Dict:
        return {
            'resource_id': getattr(resource, 'resource_id', None),
            'title': getattr(resource, 'title', 'Unknown'),
            'category': getattr(resource, 'category', None),
            'location': getattr(resource, 'location', None),
            'description': getattr(resource, 'description', None) or '',
            'capacity': getattr(resource, 'capacity', None),
            'is_restricted': getattr(resource, 'is_restricted', False),
            'equipment': getattr(resource, 'equipment', None),
            'rating': getattr(resource, 'avg_rating', None),
            'status': getattr(resource, 'status', 'draft')
        }

    @staticmethod
    def _serialize_chunk(chunk: ContextChunk) -> Dict:
        return {
            'source': chunk.source,
            'heading': chunk.heading,
            'preview': chunk.preview,
            'content': chunk.content.strip()
        }

    # Response formatting ------------------------------------------------------

    def _format_response(self, text: str) -> str:
        """Clean up and format LLM response for better display."""
        if not text:
            return text
        
        # Remove excessive whitespace
        lines = [line.strip() for line in text.split('\n')]
        
        # Remove empty lines at start/end
        while lines and not lines[0]:
            lines.pop(0)
        while lines and not lines[-1]:
            lines.pop()
        
        # Join with proper spacing (single blank line between paragraphs)
        formatted = []
        prev_empty = False
        for line in lines:
            if not line:
                if not prev_empty:
                    formatted.append('')
                prev_empty = True
            else:
                formatted.append(line)
                prev_empty = False
        
        return '\n'.join(formatted)

    # Question classification --------------------------------------------------

    def _is_greeting_or_small_talk(self, question: str) -> bool:
        """Detect if the question is a greeting or small talk rather than a resource query."""
        question_lower = question.lower().strip()
        
        # Common greetings and small talk patterns
        greeting_patterns = [
            'hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening',
            'how are you', 'what\'s up', 'sup', 'howdy', 'hi there', 'hello there',
            'thanks', 'thank you', 'bye', 'goodbye', 'see you', 'nice to meet you'
        ]
        
        # Check if it's just a greeting (very short and matches patterns)
        if len(question_lower.split()) <= 3:
            for pattern in greeting_patterns:
                if pattern in question_lower:
                    return True
        
        # Check if it's a question about the AI itself (not resources)
        ai_self_patterns = [
            'who are you', 'what are you', 'what can you do', 'how do you work',
            'tell me about yourself', 'what is this', 'what is concierge'
        ]
        for pattern in ai_self_patterns:
            if pattern in question_lower:
                return True
        
        return False

    # Tokenization + scoring --------------------------------------------------

    def _extract_keywords(self, text: str) -> List[str]:
        """Extract keywords with category awareness."""
        tokens = self._tokenize(text)
        keywords = [
            token for token in tokens
            if token not in self.STOP_WORDS and len(token) >= 2
        ]
        
        # Expand common terms to their full category names
        category_expansions = {
            'study': 'study room',
            'room': 'study room',
            'lab': 'lab equipment',
            'equipment': 'lab equipment',
            'event': 'event space',
            'space': 'event space',
            'av': 'av equipment',
            'audio': 'av equipment',
            'video': 'av equipment',
            'podcast': 'podcast recording studio',
            'recording': 'recording studio',
            'studio': 'recording studio',
            'tutor': 'tutoring',
            'tutoring': 'tutoring'
        }
        
        expanded = []
        for token in keywords:
            if token in category_expansions:
                # Add both the token and expanded form
                expanded.append(token)
                expanded_category = category_expansions[token]
                expanded.extend(expanded_category.split())
            else:
                expanded.append(token)
        
        # Remove duplicates while preserving order
        seen = set()
        ordered = []
        for token in expanded:
            if token in seen:
                continue
            seen.add(token)
            ordered.append(token)
        return ordered

    @staticmethod
    def _tokenize(text: str) -> List[str]:
        return re.findall(r'[a-z0-9]+', text.lower())

    def _score_text(self, text: str, keywords: Sequence[str], *, heading: str = '') -> float:
        if not text:
            return 0.0
        haystack = text.lower()
        heading_tokens = heading.lower()
        score = 0.0
        for keyword in keywords:
            occurrences = haystack.count(keyword)
            if occurrences:
                score += 1.0 + 0.5 * (occurrences - 1)
            if keyword in heading_tokens:
                score += 0.5
        return score

    def _score_resource(self, resource, keywords: Sequence[str]) -> float:
        """Score a resource based on keyword relevance with category weighting."""
        score = 0.0
        category = (getattr(resource, 'category', None) or '').lower()
        title = (getattr(resource, 'title', None) or '').lower()
        description = (getattr(resource, 'description', None) or '').lower()
        
        # Category matching gets highest weight (most important for relevance)
        for keyword in keywords:
            if keyword in category:
                score += 5.0  # Strong category match
            # Partial category match (e.g., "study" matches "Study Room")
            if len(keyword) >= 4 and keyword in category:
                score += 3.0
        
        # Title matching gets high weight
        for keyword in keywords:
            if keyword in title:
                score += 3.0
                # Exact title match is even better
                if title == keyword or title.startswith(keyword + ' ') or title.endswith(' ' + keyword):
                    score += 2.0
        
        # Description matching gets moderate weight
        for keyword in keywords:
            if keyword in description:
                score += 1.0
        
        # Equipment and location get lower weight
        equipment = (getattr(resource, 'equipment', None) or '').lower()
        location = (getattr(resource, 'location', None) or '').lower()
        for keyword in keywords:
            if keyword in equipment:
                score += 0.5
            if keyword in location:
                score += 0.5
        
        return score

    # Context loading --------------------------------------------------------

    @classmethod
    @lru_cache(maxsize=1)
    def _load_context_chunks(cls, root: Path) -> Tuple[ContextChunk, ...]:
        chunks: List[ContextChunk] = []
        if not root.exists():
            return tuple()

        for filepath in sorted(root.rglob('*.md')):
            try:
                text = filepath.read_text(encoding='utf-8')
            except OSError:
                continue
            rel_path = os.path.relpath(filepath, root)
            chunks.extend(cls._split_markdown_into_chunks(text, rel_path))
        return tuple(chunks)

    @staticmethod
    def _split_markdown_into_chunks(text: str, source: str) -> List[ContextChunk]:
        chunks: List[ContextChunk] = []
        current_heading = None
        current_lines: List[str] = []

        def push_chunk():
            content = '\n'.join(current_lines).strip()
            if not content:
                return
            heading = current_heading or 'Overview'
            chunks.append(ContextChunk(source=source, heading=heading, content=content))

        for line in text.splitlines():
            heading_match = re.match(r'^\s{0,3}#{1,6}\s+(.*)', line)
            if heading_match:
                if current_lines:
                    push_chunk()
                    current_lines.clear()
                current_heading = heading_match.group(1).strip()
                continue
            current_lines.append(line)

        if current_lines:
            push_chunk()

        if not chunks:
            cleaned = text.strip()
            if cleaned:
                chunks.append(ContextChunk(source=source, heading='Overview', content=cleaned))
        return chunks
