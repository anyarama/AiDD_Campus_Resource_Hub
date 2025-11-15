from contextlib import contextmanager

from src.services.concierge_service import ConciergeService
from src.services.llm_client import LocalLLMUnavailableError


@contextmanager
def _app_context(app):
    with app.app_context():
        yield app


def test_concierge_service_calls_local_llm(app, monkeypatch):
    """Concierge should call the configured local LLM with context attached."""
    app.config.update(
        LOCAL_LLM_BASE_URL='http://localhost:11434',
        LOCAL_LLM_MODEL='llama3.1',
        LOCAL_LLM_PROVIDER='ollama'
    )

    called = {}

    class FakeResponse:
        def __init__(self, status_code=200, payload=None):
            self.status_code = status_code
            self._payload = payload or {'message': {'content': 'Lab results'}}

        def json(self):
            return self._payload

    def fake_post(url, json=None, headers=None, timeout=None):
        called['url'] = url
        called['payload'] = json
        return FakeResponse()

    monkeypatch.setattr('requests.post', fake_post)

    with _app_context(app):
        service = ConciergeService()
        result = service.answer('Which spaces support 3D printing?')

    assert called['url'].endswith('/api/chat')
    assert 'messages' in called['payload']
    assert 'CONTEXT' in called['payload']['messages'][1]['content']
    assert result['used_llm'] is True
    assert any('Luddy School Prototyping Lab' in res['title'] for res in result['resources'])
    assert result['answer'] == 'Lab results'


def test_concierge_service_falls_back_when_llm_unavailable(app, monkeypatch):
    """Friendly fallback summaries should be returned when local AI is offline."""
    class OfflineClient:
        def chat(self, messages):
            raise LocalLLMUnavailableError('Ollama runtime not reachable')

    monkeypatch.setattr('src.services.llm_client.LocalLLMClient.from_app_config', lambda: OfflineClient())

    with _app_context(app):
        service = ConciergeService()
        result = service.answer('Tell me about study rooms')

    assert result['used_llm'] is False
    assert 'fallback' in result['answer'].lower()
    assert result['llm_error'] == 'Ollama runtime not reachable'
