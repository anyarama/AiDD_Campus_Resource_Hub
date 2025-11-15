"""Data access helper for admin action logs."""
from src.data_access import get_db


class AdminLogDAL:
    """Persist and retrieve administrative actions."""

    @staticmethod
    def record(admin_id, action, target_table=None, details=None):
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO admin_logs (admin_id, action, target_table, details)
                VALUES (?, ?, ?, ?)
            ''', (admin_id, action, target_table, details))

    @staticmethod
    def recent(limit=50):
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT l.*, u.name AS admin_name
                FROM admin_logs l
                JOIN users u ON l.admin_id = u.user_id
                ORDER BY l.timestamp DESC
                LIMIT ?
            ''', (limit,))
            rows = cursor.fetchall()
        return [dict(row) for row in rows]
