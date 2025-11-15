"""
Waitlist Data Access Layer
Provides helpers for managing waitlist entries when resources are fully booked.
"""
from datetime import datetime

from src.data_access import get_db
from src.models.models import WaitlistEntry


class WaitlistDAL:
    """Data access helpers for waitlists."""

    @staticmethod
    def _normalize_datetime(value):
        if isinstance(value, datetime):
            return value.isoformat()
        return value

    @staticmethod
    def create_entry(resource_id, requester_id, start_datetime, end_datetime, recurrence_rule=None):
        """Insert a waitlist entry and return it."""
        start_value = WaitlistDAL._normalize_datetime(start_datetime)
        end_value = WaitlistDAL._normalize_datetime(end_datetime)
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                '''
                INSERT INTO waitlist_entries (resource_id, requester_id, start_datetime, end_datetime, recurrence_rule)
                VALUES (?, ?, ?, ?, ?)
                ''',
                (resource_id, requester_id, start_value, end_value, recurrence_rule)
            )
            entry_id = cursor.lastrowid
            row = cursor.execute('SELECT * FROM waitlist_entries WHERE entry_id = ?', (entry_id,)).fetchone()
        return WaitlistEntry(**dict(row)) if row else None

    @staticmethod
    def get_entry(entry_id):
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM waitlist_entries WHERE entry_id = ?', (entry_id,))
            row = cursor.fetchone()
        return WaitlistEntry(**dict(row)) if row else None

    @staticmethod
    def get_entries_for_resource(resource_id, statuses=None):
        """Return waitlist entries for a resource filtered by status."""
        query = 'SELECT * FROM waitlist_entries WHERE resource_id = ?'
        params = [resource_id]
        if statuses:
            placeholders = ','.join('?' for _ in statuses)
            query += f' AND status IN ({placeholders})'
            params.extend(list(statuses))
        query += ' ORDER BY created_at ASC'
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(query, params)
            rows = cursor.fetchall()
        return [WaitlistEntry(**dict(row)) for row in rows]

    @staticmethod
    def get_entries_by_requester(requester_id, statuses=None):
        """Return waitlist entries created by a specific user."""
        query = 'SELECT * FROM waitlist_entries WHERE requester_id = ?'
        params = [requester_id]
        if statuses:
            placeholders = ','.join('?' for _ in statuses)
            query += f' AND status IN ({placeholders})'
            params.extend(list(statuses))
        query += ' ORDER BY created_at DESC'
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(query, params)
            rows = cursor.fetchall()
        return [WaitlistEntry(**dict(row)) for row in rows]

    @staticmethod
    def has_active_entry(resource_id, requester_id, start_datetime, end_datetime):
        """Return True if the user already has an active waitlist entry for the same slot."""
        start_value = WaitlistDAL._normalize_datetime(start_datetime)
        end_value = WaitlistDAL._normalize_datetime(end_datetime)
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                '''
                SELECT COUNT(*) as total
                FROM waitlist_entries
                WHERE resource_id = ?
                  AND requester_id = ?
                  AND start_datetime = ?
                  AND end_datetime = ?
                  AND status = 'active'
                ''',
                (resource_id, requester_id, start_value, end_value)
            )
            row = cursor.fetchone()
        return bool(row and row['total'])

    @staticmethod
    def mark_promoted(entry_id, booking_id):
        """Update an entry once it has been converted into a booking."""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                '''
                UPDATE waitlist_entries
                SET status = 'promoted',
                    booking_id = ?,
                    processed_at = CURRENT_TIMESTAMP
                WHERE entry_id = ?
                ''',
                (booking_id, entry_id)
            )
        return cursor.rowcount > 0

    @staticmethod
    def cancel_entry(entry_id):
        """Soft-cancel a waitlist entry."""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                '''
                UPDATE waitlist_entries
                SET status = 'cancelled',
                    processed_at = CURRENT_TIMESTAMP
                WHERE entry_id = ? AND status = 'active'
                ''',
                (entry_id,)
            )
        return cursor.rowcount > 0
