"""
Message Data Access Layer
Handles all database operations for messages
"""
from typing import List, Dict
from src.data_access import get_db
from src.models.models import Message

class MessageDAL:
    """Data access layer for message operations"""

    @staticmethod
    def _build_thread_key(user_a, user_b, resource_id=None):
        """Generate a stable thread key for two participants and optional resource"""
        first, second = sorted([user_a, user_b])
        resource_part = str(resource_id) if resource_id is not None else 'none'
        return f"{first}:{second}:{resource_part}"

    @staticmethod
    def ensure_thread(sender_id, receiver_id, resource_id=None):
        """Ensure a message thread exists and return its ID"""
        thread_key = MessageDAL._build_thread_key(sender_id, receiver_id, resource_id)
        owner_id, participant_id = sorted([sender_id, receiver_id])

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT thread_id FROM message_threads WHERE thread_key = ?', (thread_key,))
            row = cursor.fetchone()
            if row:
                return row['thread_id']

            cursor.execute('''
                INSERT INTO message_threads (thread_key, owner_id, participant_id, resource_id)
                VALUES (?, ?, ?, ?)
            ''', (thread_key, owner_id, participant_id, resource_id))
            return cursor.lastrowid
    
    @staticmethod
    def create_message(sender_id, receiver_id, content, thread_id=None, resource_id=None):
        """Create a new message"""
        if thread_id is None:
            thread_id = MessageDAL.ensure_thread(sender_id, receiver_id, resource_id)
        
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO messages (thread_id, sender_id, receiver_id, content)
                VALUES (?, ?, ?, ?)
            ''', (thread_id, sender_id, receiver_id, content))
            message_id = cursor.lastrowid
            
        return MessageDAL.get_message_by_id(message_id)

    @staticmethod
    def get_thread_by_id(thread_id):
        """Fetch thread metadata"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM message_threads WHERE thread_id = ?', (thread_id,))
            row = cursor.fetchone()
        return dict(row) if row else None
    
    @staticmethod
    def get_message_by_id(message_id):
        """Get message by ID"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM messages WHERE message_id = ?', (message_id,))
            row = cursor.fetchone()
            
        if row:
            return Message(**dict(row))
        return None
    
    @staticmethod
    def get_thread_messages(thread_id, after_message_id=None):
        """Get messages in a thread, optionally only those after a given message ID"""
        with get_db() as conn:
            cursor = conn.cursor()
            query = '''
                SELECT * FROM messages 
                WHERE thread_id = ? AND is_hidden = 0
            '''
            params = [thread_id]
            if after_message_id:
                query += ' AND message_id > ?'
                params.append(after_message_id)
            query += ' ORDER BY timestamp ASC'
            cursor.execute(query, tuple(params))
            rows = cursor.fetchall()
            
        return [Message(**dict(row)) for row in rows]
    
    @staticmethod
    def get_user_threads(user_id):
        """Get all message threads for a user"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT 
                    mt.thread_id,
                    mt.resource_id,
                    res.title AS resource_title,
                    CASE WHEN mt.owner_id = ? THEN mt.participant_id ELSE mt.owner_id END AS other_user_id,
                    u.name AS other_user_name,
                    MAX(m.timestamp) AS last_message_time,
                    (SELECT content FROM messages WHERE thread_id = mt.thread_id 
                     ORDER BY timestamp DESC LIMIT 1) AS last_message
                FROM message_threads mt
                LEFT JOIN messages m ON m.thread_id = mt.thread_id
                LEFT JOIN resources res ON res.resource_id = mt.resource_id
                JOIN users u ON u.user_id = CASE WHEN mt.owner_id = ? THEN mt.participant_id ELSE mt.owner_id END
                WHERE mt.owner_id = ? OR mt.participant_id = ?
                GROUP BY mt.thread_id
                ORDER BY COALESCE(last_message_time, '0000-01-01') DESC
            ''', (user_id, user_id, user_id, user_id))
            rows = cursor.fetchall()
        
        return [dict(row) for row in rows]

    @staticmethod
    def get_recent_incoming_messages(user_id: int, limit: int = 3) -> List[Dict]:
        """Return the latest messages sent to the specified user."""
        if not user_id:
            return []

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                '''
                SELECT m.*,
                       mt.thread_id,
                       sender.name AS sender_name,
                       res.title AS resource_title
                FROM messages m
                JOIN message_threads mt ON m.thread_id = mt.thread_id
                JOIN users sender ON sender.user_id = m.sender_id
                LEFT JOIN resources res ON res.resource_id = mt.resource_id
                WHERE m.receiver_id = ? AND m.is_hidden = 0
                ORDER BY datetime(m.timestamp) DESC
                LIMIT ?
                ''',
                (user_id, limit)
            )
            rows = cursor.fetchall()

        return [dict(row) for row in rows]
    
    @staticmethod
    def delete_message(message_id):
        """Delete a message"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('DELETE FROM messages WHERE message_id = ?', (message_id,))
            
        return cursor.rowcount > 0

    @staticmethod
    def flag_message(message_id, flagged_by, reason):
        """Flag a message for moderation."""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE messages
                SET is_flagged = 1,
                    flag_reason = ?,
                    flagged_by = ?,
                    flagged_at = CURRENT_TIMESTAMP
                WHERE message_id = ?
            ''', (reason, flagged_by, message_id))
        return cursor.rowcount > 0

    @staticmethod
    def clear_message_flag(message_id):
        """Clear the flagged state for a message."""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE messages
                SET is_flagged = 0,
                    flag_reason = NULL,
                    flagged_by = NULL,
                    flagged_at = NULL
                WHERE message_id = ?
            ''', (message_id,))
        return cursor.rowcount > 0

    @staticmethod
    def set_message_hidden(message_id, hidden=True):
        """Hide or restore a message."""
        with get_db() as conn:
            cursor = conn.cursor()
            if hidden:
                cursor.execute('''
                    UPDATE messages
                    SET is_hidden = 1,
                        is_flagged = 0,
                        flag_reason = NULL,
                        flagged_by = NULL,
                        flagged_at = NULL
                    WHERE message_id = ?
                ''', (message_id,))
            else:
                cursor.execute('UPDATE messages SET is_hidden = 0 WHERE message_id = ?', (message_id,))
        return cursor.rowcount > 0

    @staticmethod
    def get_flagged_messages():
        """Return all flagged messages for moderation."""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT m.*, 
                       sender.name AS sender_name,
                       receiver.name AS receiver_name,
                       res.title AS resource_title,
                       mt.resource_id,
                       mt.thread_id
                FROM messages m
                JOIN users sender ON m.sender_id = sender.user_id
                JOIN users receiver ON m.receiver_id = receiver.user_id
                JOIN message_threads mt ON m.thread_id = mt.thread_id
                LEFT JOIN resources res ON mt.resource_id = res.resource_id
                WHERE m.is_flagged = 1
                ORDER BY m.flagged_at DESC
            ''')
            rows = cursor.fetchall()
        return [dict(row) for row in rows]
