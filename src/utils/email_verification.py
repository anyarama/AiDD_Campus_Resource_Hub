"""
Email Verification Utility
Handles generation and validation of email verification tokens
"""
import secrets
from datetime import datetime, timedelta
from flask import url_for


class EmailVerificationService:
    """Service for handling email verification"""

    # Token expiry time (24 hours)
    TOKEN_EXPIRY_HOURS = 24

    @staticmethod
    def generate_verification_token():
        """Generate a secure random verification token"""
        return secrets.token_urlsafe(32)

    @staticmethod
    def get_token_expiry():
        """Get the expiry datetime for a new token"""
        return datetime.utcnow() + timedelta(hours=EmailVerificationService.TOKEN_EXPIRY_HOURS)

    @staticmethod
    def build_verification_url(token, absolute=False):
        """Return the verification URL for a token."""
        return url_for('auth.verify_email', token=token, _external=absolute)

    @staticmethod
    def is_token_valid(token_expiry):
        """
        Check if a verification token is still valid

        Args:
            token_expiry: Datetime when token expires

        Returns:
            bool: True if token is still valid, False otherwise
        """
        if not token_expiry:
            return False

        # Parse token_expiry if it's a string
        if isinstance(token_expiry, str):
            try:
                token_expiry = datetime.fromisoformat(token_expiry.replace('Z', '+00:00'))
            except (ValueError, AttributeError):
                return False

        return datetime.utcnow() < token_expiry
