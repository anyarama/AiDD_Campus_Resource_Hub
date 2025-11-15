"""
Simple SMTP email client used for transactional notifications.
"""
import smtplib
from email.message import EmailMessage
from typing import Optional

from flask import current_app


class EmailClient:
    """Thin wrapper around smtplib with Flask-friendly configuration."""

    @staticmethod
    def is_configured() -> bool:
        """
        Check whether SMTP credentials are present.
        """
        try:
            config = current_app.config
        except RuntimeError:
            return False

        required = [
            config.get('MAIL_SERVER'),
            config.get('MAIL_USERNAME'),
            config.get('MAIL_PASSWORD')
        ]
        return all(required)

    @staticmethod
    def send_email(to_address: str, subject: str, body: str) -> bool:
        """
        Send an email using the configured SMTP server.

        Returns:
            bool: True when the provider confirms delivery, False otherwise.
        """
        if not to_address:
            return False

        try:
            config = current_app.config
        except RuntimeError:
            print('[EmailClient] No Flask application context; email skipped.')
            return False

        if not EmailClient.is_configured():
            print('[EmailClient] SMTP settings incomplete; email skipped.')
            return False

        sender = config.get('MAIL_DEFAULT_SENDER') or config.get('MAIL_USERNAME')
        if not sender:
            print('[EmailClient] Missing MAIL_DEFAULT_SENDER; email skipped.')
            return False

        message = EmailMessage()
        message['Subject'] = subject
        message['From'] = sender
        message['To'] = to_address
        message.set_content(body)

        host = config.get('MAIL_SERVER')
        port = config.get('MAIL_PORT', 587)
        use_ssl = config.get('MAIL_USE_SSL', False)
        use_tls = config.get('MAIL_USE_TLS', True)
        timeout = config.get('MAIL_TIMEOUT', 10)

        smtp = None
        try:
            if use_ssl:
                smtp = smtplib.SMTP_SSL(host, port, timeout=timeout)
            else:
                smtp = smtplib.SMTP(host, port, timeout=timeout)
            smtp.ehlo()
            if use_tls and not use_ssl:
                smtp.starttls()
                smtp.ehlo()
            username = config.get('MAIL_USERNAME')
            password = config.get('MAIL_PASSWORD')
            if username and password:
                smtp.login(username, password)
            smtp.send_message(message)
            return True
        except Exception as exc:
            print(f'[EmailClient] Failed to send email to {to_address}: {exc}')
            return False
        finally:
            if smtp:
                try:
                    smtp.quit()
                except Exception:
                    pass
