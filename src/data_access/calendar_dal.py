"""
Calendar integration data operations.
"""
from __future__ import annotations

from typing import Optional

from src.data_access import get_db


class CalendarCredentialDAL:
    """Persist OAuth credentials for calendar providers."""

    @staticmethod
    def upsert_credentials(user_id: int, provider: str, credentials_json: str) -> None:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                '''
                INSERT INTO calendar_credentials (user_id, provider, credentials_json, updated_at)
                VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(user_id, provider)
                DO UPDATE SET
                    credentials_json = excluded.credentials_json,
                    updated_at = CURRENT_TIMESTAMP
                ''',
                (user_id, provider, credentials_json)
            )

    @staticmethod
    def get_credentials(user_id: int, provider: str) -> Optional[dict]:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                '''
                SELECT * FROM calendar_credentials
                WHERE user_id = ? AND provider = ?
                ''',
                (user_id, provider)
            )
            row = cursor.fetchone()
        return dict(row) if row else None

    @staticmethod
    def delete_credentials(user_id: int, provider: str) -> bool:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                '''
                DELETE FROM calendar_credentials
                WHERE user_id = ? AND provider = ?
                ''',
                (user_id, provider)
            )
        return cursor.rowcount > 0


class CalendarEventDAL:
    """Track external calendar events per booking."""

    @staticmethod
    def upsert_event(
        booking_id: int,
        user_id: int,
        provider: str,
        external_event_id: str,
        html_link: Optional[str] = None
    ) -> None:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                '''
                INSERT INTO calendar_events (booking_id, user_id, provider, external_event_id, html_link, synced_at)
                VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(booking_id, user_id, provider)
                DO UPDATE SET
                    external_event_id = excluded.external_event_id,
                    html_link = excluded.html_link,
                    synced_at = CURRENT_TIMESTAMP
                ''',
                (booking_id, user_id, provider, external_event_id, html_link)
            )

    @staticmethod
    def get_event(booking_id: int, user_id: int, provider: str) -> Optional[dict]:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                '''
                SELECT * FROM calendar_events
                WHERE booking_id = ? AND user_id = ? AND provider = ?
                ''',
                (booking_id, user_id, provider)
            )
            row = cursor.fetchone()
        return dict(row) if row else None

    @staticmethod
    def delete_events_for_booking(booking_id: int) -> None:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                '''
                DELETE FROM calendar_events
                WHERE booking_id = ?
                ''',
                (booking_id,)
            )
