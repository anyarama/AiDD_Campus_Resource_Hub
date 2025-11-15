from pathlib import Path

import pytest

from src.services.accessibility_audit import AccessibilityAuditService, contrast_ratio


def test_contrast_ratio_black_white():
    assert contrast_ratio('#000000', '#ffffff') == pytest.approx(21.0, rel=0.01)


def test_accessibility_audit_detects_skip_link():
    project_root = Path(__file__).resolve().parents[1] / 'src'
    audit = AccessibilityAuditService(project_root=project_root).run()
    skip_link = next((item for item in audit['structure_checks'] if item['id'] == 'skip_link'), None)
    assert skip_link is not None
    assert skip_link['status'] == 'pass'


def test_accessibility_page(client):
    resp = client.get('/accessibility/')
    assert resp.status_code == 200
    assert b'Inclusive by design' in resp.data
    assert b'Contrast checks' in resp.data
