"""
Notification Data Access Layer
Provides helper queries for surfacing recent notifications in the UI.
"""
from typing import List, Dict, Optional
from datetime import datetime
from src.data_access import get_db


class NotificationDAL:
    """Query helpers for notifications."""

    @staticmethod
    def get_recent_notifications(user_id: int, limit: int = 5) -> List[Dict]:
        """Return the most recent notifications for a user."""
        if not user_id:
            return []

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                '''
                SELECT notification_id,
                       user_id,
                       channel,
                       subject,
                       body,
                       status,
                       created_at
                FROM notifications
                WHERE user_id = ?
                ORDER BY datetime(created_at) DESC
                LIMIT ?
                ''',
                (user_id, limit)
            )
            rows = cursor.fetchall()

        return [dict(row) for row in rows]

    @staticmethod
    def get_last_seen_timestamp(user_id: int) -> Optional[datetime]:
        """Return the timestamp when the user last viewed notifications."""
        if not user_id:
            return None

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                'SELECT last_seen_at FROM user_notification_state WHERE user_id = ?',
                (user_id,)
            )
            row = cursor.fetchone()

        if not row or not row['last_seen_at']:
            return None

        try:
            return datetime.fromisoformat(row['last_seen_at'])
        except ValueError:
            return None

    @staticmethod
    def update_last_seen(user_id: int, timestamp: datetime):
        """Upsert the last seen timestamp for a user."""
        if not user_id or not timestamp:
            return

        iso_value = timestamp.isoformat(sep=' ', timespec='seconds')
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                '''
                INSERT INTO user_notification_state (user_id, last_seen_at)
                VALUES (?, ?)
                ON CONFLICT(user_id) DO UPDATE SET last_seen_at = excluded.last_seen_at
                ''',
                (user_id, iso_value)
            )
