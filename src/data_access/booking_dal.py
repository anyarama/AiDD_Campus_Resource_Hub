"""
Booking Data Access Layer
Handles all database operations for bookings
"""
from datetime import datetime
from src.data_access import get_db
from src.models.models import Booking

class BookingDAL:
    """Data access layer for booking operations"""
    
    @staticmethod
    def _normalize_datetime(value):
        """Ensure datetimes are stored as ISO 8601 strings"""
        if isinstance(value, datetime):
            return value.isoformat()
        return value
    
    @staticmethod
    def create_booking(resource_id, requester_id, start_datetime, end_datetime, status='pending', recurrence_rule=None):
        """Create a new booking"""
        start_value = BookingDAL._normalize_datetime(start_datetime)
        end_value = BookingDAL._normalize_datetime(end_datetime)
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO bookings (resource_id, requester_id, start_datetime, end_datetime, status, recurrence_rule)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (resource_id, requester_id, start_value, end_value, status, recurrence_rule))
            booking_id = cursor.lastrowid
            row = cursor.execute('SELECT * FROM bookings WHERE booking_id = ?', (booking_id,)).fetchone()
        
        return Booking(**dict(row)) if row else None

    @staticmethod
    def create_recurring_bookings(resource_id, requester_id, occurrences, status='pending', recurrence_rule=None):
        """Create multiple bookings in a single transaction."""
        created = []
        with get_db() as conn:
            cursor = conn.cursor()
            for start_datetime, end_datetime in occurrences:
                start_value = BookingDAL._normalize_datetime(start_datetime)
                end_value = BookingDAL._normalize_datetime(end_datetime)
                cursor.execute('''
                    INSERT INTO bookings (resource_id, requester_id, start_datetime, end_datetime, status, recurrence_rule)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (resource_id, requester_id, start_value, end_value, status, recurrence_rule))
                booking_id = cursor.lastrowid
                row = cursor.execute('SELECT * FROM bookings WHERE booking_id = ?', (booking_id,)).fetchone()
                if row:
                    created.append(Booking(**dict(row)))
        return created
    
    @staticmethod
    def get_booking_by_id(booking_id):
        """Get booking by ID"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM bookings WHERE booking_id = ?', (booking_id,))
            row = cursor.fetchone()
            
        if row:
            return Booking(**dict(row))
        return None
    
    @staticmethod
    def check_booking_conflict(resource_id, start_datetime, end_datetime, exclude_booking_id=None):
        """Check if a booking conflicts with existing approved bookings"""
        start_value = BookingDAL._normalize_datetime(start_datetime)
        end_value = BookingDAL._normalize_datetime(end_datetime)
        query = '''
            SELECT COUNT(*) as conflict_count
            FROM bookings
            WHERE resource_id = ?
            AND status IN ('pending', 'approved')
            AND (
                (start_datetime < ? AND end_datetime > ?)
                OR (start_datetime < ? AND end_datetime > ?)
                OR (start_datetime >= ? AND end_datetime <= ?)
            )
        '''
        params = [resource_id, end_value, start_value, end_value, start_value, start_value, end_value]
        
        if exclude_booking_id:
            query += ' AND booking_id != ?'
            params.append(exclude_booking_id)
        
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(query, params)
            result = cursor.fetchone()
            
        return result['conflict_count'] > 0
    
    @staticmethod
    def get_bookings_by_requester(requester_id):
        """Get all bookings made by a user"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM bookings 
                WHERE requester_id = ? 
                ORDER BY start_datetime DESC
            ''', (requester_id,))
            rows = cursor.fetchall()
            
        return [Booking(**dict(row)) for row in rows]
    
    @staticmethod
    def get_bookings_by_resource(resource_id):
        """Get all bookings for a resource with requester names"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT b.*, u.name as requester_name
                FROM bookings b
                LEFT JOIN users u ON b.requester_id = u.user_id
                WHERE b.resource_id = ?
                ORDER BY b.start_datetime DESC
            ''', (resource_id,))
            rows = cursor.fetchall()

        return [Booking(**dict(row)) for row in rows]

    @staticmethod
    def get_bookings_for_resources(resource_ids, statuses=None):
        """Fetch bookings for a list of resources (used for availability summaries)."""
        if not resource_ids:
            return []

        placeholders = ','.join('?' for _ in resource_ids)
        query = f'SELECT * FROM bookings WHERE resource_id IN ({placeholders})'
        params = list(resource_ids)

        if statuses:
            status_placeholders = ','.join('?' for _ in statuses)
            query += f' AND status IN ({status_placeholders})'
            params.extend(list(statuses))

        query += ' ORDER BY start_datetime ASC'

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(query, params)
            rows = cursor.fetchall()

        return [Booking(**dict(row)) for row in rows]

    @staticmethod
    def get_bookings_for_owner(owner_id, statuses=None, limit=None, offset=0):
        """Return bookings tied to resources owned by the provided user."""
        query = '''
            SELECT b.*,
                   r.title AS resource_title,
                   r.category AS resource_category,
                   r.location AS resource_location,
                   u.name AS requester_name,
                   u.email AS requester_email
            FROM bookings b
            JOIN resources r ON b.resource_id = r.resource_id
            JOIN users u ON b.requester_id = u.user_id
            WHERE r.owner_id = ?
        '''
        params = [owner_id]

        if statuses:
            if isinstance(statuses, (list, tuple, set)):
                placeholders = ','.join('?' for _ in statuses)
                query += f' AND b.status IN ({placeholders})'
                params.extend(list(statuses))
            else:
                query += ' AND b.status = ?'
                params.append(statuses)

        query += ' ORDER BY b.start_datetime DESC'

        if limit:
            query += ' LIMIT ? OFFSET ?'
            params.extend([limit, offset])

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(query, params)
            rows = cursor.fetchall()

        return [dict(row) for row in rows]

    @staticmethod
    def get_recent_pending_requests_for_owner(owner_id, limit=3):
        """Return recent pending booking requests that target the user's resources."""
        if not owner_id:
            return []

        query = '''
            SELECT b.*,
                   r.title AS resource_title,
                   u.name AS requester_name,
                   u.email AS requester_email
            FROM bookings b
            JOIN resources r ON b.resource_id = r.resource_id
            JOIN users u ON b.requester_id = u.user_id
            WHERE r.owner_id = ?
              AND b.status = 'pending'
            ORDER BY datetime(b.created_at) DESC
            LIMIT ?
        '''

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (owner_id, limit))
            rows = cursor.fetchall()

        return [dict(row) for row in rows]

    @staticmethod
    def update_booking_status(booking_id, status, decision_notes=None, decision_by=None):
        """Update booking status and optionally capture reviewer context."""
        set_clauses = ['status = ?', 'updated_at = CURRENT_TIMESTAMP']
        params = [status]
        update_decision_time = False

        if decision_notes is not None:
            set_clauses.append('decision_notes = ?')
            params.append(decision_notes)
            update_decision_time = True

        if decision_by is not None:
            set_clauses.append('decision_by = ?')
            params.append(decision_by)
            update_decision_time = True

        if update_decision_time:
            set_clauses.append('decision_timestamp = CURRENT_TIMESTAMP')

        params.append(booking_id)

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                f"UPDATE bookings SET {' , '.join(set_clauses)} WHERE booking_id = ?",
                params
            )

        return cursor.rowcount > 0
    
    @staticmethod
    def get_pending_bookings():
        """Get all pending bookings for admin review"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM bookings 
                WHERE status = 'pending' 
                ORDER BY created_at ASC
            ''')
            rows = cursor.fetchall()
            
        return [Booking(**dict(row)) for row in rows]
    
    @staticmethod
    def delete_booking(booking_id):
        """Delete a booking"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('DELETE FROM bookings WHERE booking_id = ?', (booking_id,))
            
        return cursor.rowcount > 0

    @staticmethod
    def summarize_by_department(limit=6):
        """Return aggregate booking counts grouped by requester department."""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                '''
                SELECT COALESCE(u.department, 'Unspecified') AS department,
                       COUNT(*) AS total
                FROM bookings b
                JOIN users u ON b.requester_id = u.user_id
                GROUP BY department
                ORDER BY total DESC
                LIMIT ?
                ''',
                (limit,)
            )
            rows = cursor.fetchall()
        return [dict(row) for row in rows]

    @staticmethod
    def monthly_booking_trend(months=6):
        """Return booking counts grouped by month for the provided window."""
        window = max(1, int(months or 1))
        offset = f'-{window - 1} months' if window > 1 else '0 months'
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                '''
                SELECT strftime('%Y-%m', created_at) AS month,
                       COUNT(*) AS total,
                       SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved,
                       SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
                       SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed,
                       SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected
                FROM bookings
                WHERE created_at >= date('now', 'start of month', ?)
                GROUP BY month
                ORDER BY month ASC
                ''',
                (offset,)
            )
            rows = cursor.fetchall()
        return [dict(row) for row in rows]

    @staticmethod
    def booking_status_breakdown():
        """Return total bookings grouped by status for overview charts."""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                '''
                SELECT status, COUNT(*) AS total
                FROM bookings
                GROUP BY status
                ORDER BY total DESC
                '''
            )
            rows = cursor.fetchall()
        return [dict(row) for row in rows]

    @staticmethod
    def summarize_owner_resources(owner_id, limit=5):
        """Return booking counts per resource for a specific owner."""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                '''
                SELECT r.title, COUNT(b.booking_id) AS total
                FROM resources r
                LEFT JOIN bookings b ON r.resource_id = b.resource_id
                WHERE r.owner_id = ?
                GROUP BY r.resource_id
                ORDER BY total DESC, r.title ASC
                LIMIT ?
                ''',
                (owner_id, limit)
            )
            rows = cursor.fetchall()
        return [dict(row) for row in rows]
    
    @staticmethod
    def get_booking_with_details(booking_id):
        """Get booking with resource and user details"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT b.*, 
                       r.title as resource_title, 
                       r.location, 
                       r.category,
                       r.owner_id as owner_id,
                       u.name as requester_name, 
                       u.email as requester_email,
                       o.name as owner_name,
                       o.email as owner_email,
                       reviewer.name as decision_by_name
                FROM bookings b
                JOIN resources r ON b.resource_id = r.resource_id
                JOIN users u ON b.requester_id = u.user_id
                JOIN users o ON r.owner_id = o.user_id
                LEFT JOIN users reviewer ON b.decision_by = reviewer.user_id
                WHERE b.booking_id = ?
            ''', (booking_id,))
            row = cursor.fetchone()
            
        if not row:
            return None
        result = dict(row)
        result['decision_by_name'] = row['decision_by_name'] if 'decision_by_name' in row.keys() else None
        return result

    @staticmethod
    def get_bookings_with_details(status=None, limit=None, offset=0):
        """Get a list of bookings with associated resource and user information"""
        query = '''
            SELECT b.*,
                   r.title AS resource_title,
                   r.category,
                   r.owner_id AS owner_id,
                   u.name AS requester_name,
                   u.email AS requester_email,
                   o.name AS owner_name,
                   reviewer.name AS decision_by_name
            FROM bookings b
            JOIN resources r ON b.resource_id = r.resource_id
            JOIN users u ON b.requester_id = u.user_id
            JOIN users o ON r.owner_id = o.user_id
            LEFT JOIN users reviewer ON b.decision_by = reviewer.user_id
        '''
        params = []

        if status is None:
            pass
        elif isinstance(status, (list, tuple, set)):
            placeholders = ','.join('?' for _ in status)
            query += f' WHERE b.status IN ({placeholders})'
            params.extend(list(status))
        else:
            query += ' WHERE b.status = ?'
            params.append(status)

        query += ' ORDER BY b.start_datetime DESC'

        if limit:
            query += ' LIMIT ? OFFSET ?'
            params.extend([limit, offset])

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(query, params)
            rows = cursor.fetchall()
            
        return [dict(row) for row in rows]

    @staticmethod
    def count_bookings(status=None):
        """Return total number of bookings with optional status filtering."""
        query = 'SELECT COUNT(*) as total FROM bookings'
        params = []

        if status is None:
            pass
        elif isinstance(status, (list, tuple, set)):
            placeholders = ','.join('?' for _ in status)
            query += f' WHERE status IN ({placeholders})'
            params.extend(list(status))
        else:
            query += ' WHERE status = ?'
            params.append(status)

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(query, params)
            row = cursor.fetchone()

        return row['total'] if row else 0

    @staticmethod
    def user_has_completed_booking(resource_id, user_id):
        """Check if a user has a completed booking for a resource"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT COUNT(*) AS completed_count
                FROM bookings
                WHERE resource_id = ?
                  AND requester_id = ?
                  AND status = 'completed'
            ''', (resource_id, user_id))
            result = cursor.fetchone()
        return bool(result and result['completed_count'])
