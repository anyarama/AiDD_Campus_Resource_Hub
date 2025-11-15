"""
Review Data Access Layer
Handles all database operations for reviews
"""
from src.data_access import get_db
from src.models.models import Review

class ReviewDAL:
    """Data access layer for review operations"""
    
    @staticmethod
    def create_review(resource_id, reviewer_id, rating, comment=None):
        """Create a new review"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO reviews (resource_id, reviewer_id, rating, comment)
                VALUES (?, ?, ?, ?)
            ''', (resource_id, reviewer_id, rating, comment))
            review_id = cursor.lastrowid
            
        return ReviewDAL.get_review_by_id(review_id)
    
    @staticmethod
    def get_review_by_id(review_id):
        """Get review by ID"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM reviews WHERE review_id = ?', (review_id,))
            row = cursor.fetchone()
            
        if row:
            return Review(**dict(row))
        return None
    
    @staticmethod
    def get_reviews_by_resource(resource_id):
        """Get all reviews for a resource"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT r.*, u.name as reviewer_name
                FROM reviews r
                JOIN users u ON r.reviewer_id = u.user_id
                WHERE r.resource_id = ? AND r.is_hidden = 0
                ORDER BY r.timestamp DESC
            ''', (resource_id,))
            rows = cursor.fetchall()
        
        return [dict(row) for row in rows]
    
    @staticmethod
    def get_reviews_by_reviewer(reviewer_id):
        """Get all reviews by a reviewer"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM reviews 
                WHERE reviewer_id = ? 
                ORDER BY timestamp DESC
            ''', (reviewer_id,))
            rows = cursor.fetchall()
            
        return [Review(**dict(row)) for row in rows]
    
    @staticmethod
    def user_has_reviewed(resource_id, reviewer_id):
        """Check if user has already reviewed a resource"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT COUNT(*) as count 
                FROM reviews 
                WHERE resource_id = ? AND reviewer_id = ?
            ''', (resource_id, reviewer_id))
            result = cursor.fetchone()
            
        return result['count'] > 0
    
    @staticmethod
    def delete_review(review_id):
        """Delete a review"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('DELETE FROM reviews WHERE review_id = ?', (review_id,))
            
        return cursor.rowcount > 0
    
    @staticmethod
    def get_resource_rating_stats(resource_id):
        """Get rating statistics for a resource"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT 
                    AVG(rating) as avg_rating,
                    COUNT(*) as total_reviews,
                    SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
                    SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
                    SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
                    SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
                    SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
                FROM reviews
                WHERE resource_id = ? AND is_hidden = 0
            ''', (resource_id,))
            row = cursor.fetchone()
        
        return dict(row) if row else None

    @staticmethod
    def get_all_reviews(limit=None, offset=0):
        """Fetch all reviews with reviewer and resource context"""
        query = '''
            SELECT rv.*,
                   res.title AS resource_title,
                   u.name AS reviewer_name
            FROM reviews rv
            JOIN resources res ON rv.resource_id = res.resource_id
            JOIN users u ON rv.reviewer_id = u.user_id
            ORDER BY rv.timestamp DESC
        '''
        params = []
        if limit:
            query += ' LIMIT ? OFFSET ?'
            params.extend([limit, offset])

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(query, params)
            rows = cursor.fetchall()

        return [dict(row) for row in rows]

    @staticmethod
    def flag_review(review_id, flagged_by, reason):
        """Mark a review as flagged for moderation."""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE reviews
                SET is_flagged = 1,
                    flag_reason = ?,
                    flagged_by = ?,
                    flagged_at = CURRENT_TIMESTAMP
                WHERE review_id = ?
            ''', (reason, flagged_by, review_id))
        return cursor.rowcount > 0

    @staticmethod
    def clear_review_flag(review_id):
        """Clear the flagged state for a review."""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE reviews
                SET is_flagged = 0,
                    flag_reason = NULL,
                    flagged_by = NULL,
                    flagged_at = NULL
                WHERE review_id = ?
            ''', (review_id,))
        return cursor.rowcount > 0

    @staticmethod
    def set_review_hidden(review_id, hidden=True):
        """Toggle visibility for a review."""
        with get_db() as conn:
            cursor = conn.cursor()
            if hidden:
                cursor.execute('''
                    UPDATE reviews
                    SET is_hidden = 1,
                        is_flagged = 0,
                        flag_reason = NULL,
                        flagged_by = NULL,
                        flagged_at = NULL
                    WHERE review_id = ?
                ''', (review_id,))
            else:
                cursor.execute('UPDATE reviews SET is_hidden = 0 WHERE review_id = ?', (review_id,))
        return cursor.rowcount > 0

    @staticmethod
    def get_flagged_reviews():
        """Return all reviews currently flagged for moderation."""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT rv.*, res.title AS resource_title, u.name AS reviewer_name
                FROM reviews rv
                JOIN resources res ON rv.resource_id = res.resource_id
                JOIN users u ON rv.reviewer_id = u.user_id
                WHERE rv.is_flagged = 1
                ORDER BY rv.flagged_at DESC
            ''')
            rows = cursor.fetchall()
        return [dict(row) for row in rows]
