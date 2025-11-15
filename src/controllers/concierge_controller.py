"""
Routes for the AI Resource Concierge experience.
"""
from flask import Blueprint, current_app, render_template, request

from src.services.concierge_service import ConciergeService


concierge_bp = Blueprint('concierge', __name__, url_prefix='/concierge')


@concierge_bp.route('/', methods=['GET', 'POST'])
@concierge_bp.route('', methods=['GET', 'POST'])
def index():
    service = ConciergeService()
    doc_chunks = ConciergeService._load_context_chunks(service.context_root)
    doc_sources = sorted({chunk.source for chunk in doc_chunks})

    question = ''
    concierge_result = None
    error_message = None

    if request.method == 'POST':
        question = (request.form.get('question') or '').strip()

        if not question:
            error_message = 'Please enter a question before asking the concierge.'
        else:
            try:
                # Use sensible defaults: only published resources, no category filter
                concierge_result = service.answer(
                    question,
                    category=None,
                    published_only=True
                )
            except ValueError as exc:
                error_message = str(exc)
            except Exception as exc:  # pragma: no cover - defensive path
                current_app.logger.exception('Concierge request failed: %s', exc)
                error_message = 'Something went wrong while contacting the concierge. Please try again.'

    return render_template(
        'concierge/index.html',
        question=question,
        concierge_result=concierge_result,
        error_message=error_message,
        doc_sources=doc_sources
    )
