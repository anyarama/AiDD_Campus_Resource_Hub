"""
Notification utilities
Provides a simple way to persist and (optionally) send outbound emails.
"""
from flask import current_app

from src.data_access import get_db
from src.data_access.user_dal import UserDAL
from src.utils.email_client import EmailClient


class NotificationService:
    """Utility for recording notifications and triggering outbound delivery."""

    @staticmethod
    def send_notification(user_id, subject, body, channel='email', recipient_email=None):
        """Persist a notification and optionally deliver it via email."""
        if not user_id:
            return

        delivery_status = 'sent'
        if channel == 'email':
            delivered, attempted = NotificationService._deliver_email(
                user_id=user_id,
                subject=subject,
                body=body,
                recipient_email=recipient_email
            )
            if not attempted:
                delivery_status = 'logged'
            else:
                delivery_status = 'sent' if delivered else 'error'

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                '''
                INSERT INTO notifications (user_id, channel, subject, body, status)
                VALUES (?, ?, ?, ?, ?)
                ''',
                (user_id, channel, subject, body, delivery_status)
            )

        # Also log to stdout to aid developers during local testing
        print(f"[Notification::{channel}] → User {user_id} | {subject}\n{body}\n")

    @staticmethod
    def _deliver_email(user_id, subject, body, recipient_email=None):
        """Deliver an email if SMTP is configured for the application.

        Returns:
            Tuple[bool, bool]: (success, attempted_delivery)
        """
        try:
            config = current_app.config
        except RuntimeError:
            print('[NotificationService] No application context; skipping email delivery.')
            return False, False

        if not config.get('EMAIL_NOTIFICATIONS_ENABLED'):
            return False, False

        to_address = recipient_email or NotificationService._lookup_user_email(user_id)
        if not to_address:
            print(f'[NotificationService] No email address for user {user_id}; skipping delivery.')
            return False, False

        success = EmailClient.send_email(to_address, subject, body)
        return success, True

    @staticmethod
    def _lookup_user_email(user_id):
        """Fetch the recipient email for a given user."""
        try:
            user = UserDAL.get_user_by_id(user_id)
        except Exception as exc:
            print(f'[NotificationService] Failed to fetch user {user_id}: {exc}')
            return None
        return getattr(user, 'email', None)
