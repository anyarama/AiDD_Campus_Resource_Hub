import pytest

from src.utils.validators import Validator


@pytest.mark.parametrize(
    'value,expected',
    [
        ('Valid Name', True),
        ('A', False),
        ('', False),
    ],
)
def test_validate_string_enforces_length(value, expected):
    """validate_string should enforce minimum and maximum length constraints."""
    is_valid, _ = Validator.validate_string(value, min_len=2, max_len=10, field_name='Name')
    assert is_valid is expected


def test_validate_email_rejects_invalid_formats():
    """Email validation must detect malformed addresses."""
    assert Validator.validate_email('student@iu.edu')
    assert not Validator.validate_email('bad-email')
    assert not Validator.validate_email('toolong@' + 'a' * 260 + '.com')


def test_validate_password_strength_rules():
    """Password validator enforces minimum length and character diversity."""
    assert Validator.validate_password('StrongPass1')[0] is True
    assert Validator.validate_password('short')[0] is False
    assert Validator.validate_password('alllowercase1')[0] is False
    assert Validator.validate_password('NOLOWERCASE1')[0] is False
    assert Validator.validate_password('NoDigitsHere')[0] is False


def test_sanitize_html_strips_dangerous_content():
    """Sanitization helper should remove scripts and inline handlers."""
    dirty = '<script>alert(1)</script><div onclick="evil()">Hello</div><a href="javascript:bad()">x</a>'
    cleaned = Validator.sanitize_html(dirty)
    assert '<script>' not in cleaned
    assert 'onclick' not in cleaned.lower()
    assert 'javascript:' not in cleaned.lower()
