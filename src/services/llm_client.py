"""
Local LLM client that supports Ollama and LM Studio style chat endpoints.
"""
from __future__ import annotations

import logging
from typing import List, Optional

import requests
from flask import current_app, has_app_context

from src.config import Config

ChatMessage = List[dict]


class LocalLLMUnavailableError(RuntimeError):
    """Raised when the configured local LLM cannot fulfill the request."""


class LocalLLMClient:
    """
    Thin abstraction for local LLM runtimes such as Ollama or LM Studio.

    The client intentionally mirrors the OpenAI chat completion request schema
    so downstream services can supply a standard list of chat messages.
    """

    def __init__(self, *, base_url: str, model: str, provider: str,
                 api_key: Optional[str] = None, timeout: int = 30) -> None:
        self.base_url = (base_url or '').rstrip('/')
        self.model = model
        self.provider = (provider or 'ollama').lower()
        self.api_key = api_key
        self.timeout = timeout

    # Construction helpers -------------------------------------------------

    @classmethod
    def from_app_config(cls) -> Optional['LocalLLMClient']:
        """Instantiate the client using the active Flask config when available."""
        base_url = _config_value('LOCAL_LLM_BASE_URL')
        model = _config_value('LOCAL_LLM_MODEL') or 'llama3.1'
        provider = _config_value('LOCAL_LLM_PROVIDER') or 'ollama'
        api_key = _config_value('LOCAL_LLM_API_KEY')
        timeout = int(_config_value('LOCAL_LLM_TIMEOUT') or 30)

        if not base_url:
            return None

        return cls(
            base_url=base_url,
            model=model,
            provider=provider,
            api_key=api_key,
            timeout=timeout
        )

    # Chat API --------------------------------------------------------------

    def chat(self, messages: ChatMessage) -> str:
        """
        Send a chat completion request to the configured backend.

        Parameters
        ----------
        messages: list
            Ordered conversation (system/user/assistant) to evaluate.
        """
        if not messages:
            raise ValueError('messages cannot be empty')

        if self.provider == 'ollama':
            return self._chat_via_ollama(messages)

        # Treat LM Studio and other OpenAI-compatible runtimes the same way
        return self._chat_via_openai(messages)

    # Provider implementations ---------------------------------------------

    def _chat_via_ollama(self, messages: ChatMessage) -> str:
        endpoint = f'{self.base_url}/api/chat'
        payload = {
            'model': self.model,
            'messages': messages,
            'stream': False,
            'options': {
                'num_predict': 200,  # Reduced for faster responses while maintaining quality
                'temperature': 0.5,  # Slightly higher for more natural, conversational tone
            }
        }
        self._log_debug('Posting prompt to Ollama', payload_summary=_safe_prompt_preview(messages))

        try:
            response = requests.post(endpoint, json=payload, timeout=self.timeout)
        except requests.RequestException as exc:
            raise LocalLLMUnavailableError(f'Ollama runtime not reachable: {exc}') from exc

        if response.status_code >= 500:
            raise LocalLLMUnavailableError('Ollama responded with a server error.')

        if response.status_code >= 400:
            raise LocalLLMUnavailableError(
                f'Ollama rejected the request ({response.status_code}).'
            )

        data = response.json()
        message = data.get('message') or {}
        content = (message.get('content') or '').strip()
        if not content:
            raise LocalLLMUnavailableError('Ollama returned an empty response.')
        return content

    def _chat_via_openai(self, messages: ChatMessage) -> str:
        endpoint = f'{self.base_url}/v1/chat/completions'
        payload = {
            'model': self.model,
            'stream': False,
            'temperature': 0.5,  # Slightly higher for more natural, conversational tone
            'max_tokens': 200,  # Reduced for faster responses while maintaining quality
            'messages': messages
        }
        headers = {'Content-Type': 'application/json'}
        if self.api_key:
            headers['Authorization'] = f'Bearer {self.api_key}'

        provider_name = 'LM Studio' if self.provider == 'lmstudio' else 'local OpenAI-compatible'
        self._log_debug(f'Posting prompt to {provider_name}', payload_summary=_safe_prompt_preview(messages))

        try:
            response = requests.post(endpoint, json=payload, headers=headers, timeout=self.timeout)
        except requests.RequestException as exc:
            raise LocalLLMUnavailableError(f'{provider_name} runtime not reachable: {exc}') from exc

        if response.status_code >= 500:
            raise LocalLLMUnavailableError(f'{provider_name} returned a server error.')

        if response.status_code >= 400:
            raise LocalLLMUnavailableError(
                f'{provider_name} rejected the request ({response.status_code}).'
            )

        data = response.json()
        choices = data.get('choices') or []
        if not choices:
            raise LocalLLMUnavailableError(f'{provider_name} returned an empty response.')
        return (choices[0].get('message') or {}).get('content', '').strip()

    # Logging ---------------------------------------------------------------

    def _log_debug(self, message: str, *, payload_summary: Optional[str] = None) -> None:
        logger = current_app.logger if has_app_context() else logging.getLogger(__name__)
        if not logger.isEnabledFor(logging.DEBUG):
            return
        if payload_summary:
            logger.debug('[LLM] %s | %s', message, payload_summary)
        else:
            logger.debug('[LLM] %s', message)


def _config_value(name: str) -> Optional[str]:
    """Resolve a configuration value even when outside an app context."""
    if has_app_context():
        return current_app.config.get(name)
    return getattr(Config, name, None)


def _safe_prompt_preview(messages: ChatMessage) -> str:
    """Return a truncated representation that avoids logging sensitive content."""
    sanitized = []
    for message in messages[-2:]:
        role = message.get('role')
        content = (message.get('content') or '')[:160]
        sanitized.append(f'{role}: {content!r}')
    return ' | '.join(sanitized)
