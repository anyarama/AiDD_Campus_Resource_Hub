"""
Resource Data Access Layer
Handles all database operations for resources
"""
from datetime import datetime, timedelta, timezone
from src.data_access import get_db
from src.models.models import Resource

class ResourceDAL:
    """Data access layer for resource operations"""
    
    @staticmethod
    def create_resource(owner_id, title, description, category, location,
                       capacity=None, images=None, availability_rules=None,
                       equipment=None, is_restricted=False, status='draft',
                       availability_schedule=None, min_booking_minutes=30,
                       max_booking_minutes=480, booking_increment_minutes=30,
                       buffer_minutes=0, advance_booking_days=90, min_lead_time_hours=0):
        """Create a new resource with availability schedule"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO resources (owner_id, title, description, category, location,
                                      capacity, images, equipment, availability_rules, is_restricted, status,
                                      availability_schedule, min_booking_minutes, max_booking_minutes,
                                      booking_increment_minutes, buffer_minutes, advance_booking_days,
                                      min_lead_time_hours)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (owner_id, title, description, category, location, capacity,
                  images, equipment, availability_rules, int(is_restricted), status,
                  availability_schedule, min_booking_minutes, max_booking_minutes,
                  booking_increment_minutes, buffer_minutes, advance_booking_days,
                  min_lead_time_hours))
            resource_id = cursor.lastrowid

        return ResourceDAL.get_resource_by_id(resource_id)
    
    @staticmethod
    def get_resource_by_id(resource_id):
        """Get resource by ID"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM resources WHERE resource_id = ?', (resource_id,))
            row = cursor.fetchone()
            
        if row:
            return Resource(**dict(row))
        return None
    
    @staticmethod
    def get_all_resources(status='published', limit=None, offset=0):
        """Get resources with optional status filtering"""
        query = 'SELECT * FROM resources'
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

        query += ' ORDER BY created_at DESC'

        if limit:
            query += ' LIMIT ? OFFSET ?'
            params.extend([limit, offset])
        
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(query, params)
            rows = cursor.fetchall()
            
        return [Resource(**dict(row)) for row in rows]
    
    @staticmethod
    def search_resources(keyword=None, category=None, location=None, status='published',
                         min_capacity=None, available_start=None, available_end=None,
                         sort='recent', page=1, per_page=None, include_total=False):
        """Search resources with filters"""
        joins = []
        wheres = []
        params = []
        keyword_value = keyword.strip().lower() if keyword else None
        location_value = location.strip().lower() if location else None
        category_value = category.strip() if category else None

        if status is None:
            pass
        elif isinstance(status, (list, tuple, set)):
            placeholders = ','.join('?' for _ in status)
            wheres.append(f'r.status IN ({placeholders})')
            params.extend(list(status))
        else:
            wheres.append('r.status = ?')
            params.append(status)

        if keyword_value:
            wheres.append('('
                          'LOWER(r.title) LIKE ? OR '
                          'LOWER(r.description) LIKE ? OR '
                          'LOWER(COALESCE(r.equipment, \"\")) LIKE ?'
                          ')')
            search_term = f'%{keyword_value}%'
            params.extend([search_term, search_term, search_term])

        if category_value:
            wheres.append('r.category = ?')
            params.append(category_value)

        if location_value:
            wheres.append('LOWER(r.location) LIKE ?')
            params.append(f'%{location_value}%')

        if min_capacity is not None:
            wheres.append('COALESCE(r.capacity, 0) >= ?')
            params.append(min_capacity)

        if available_start and available_end:
            wheres.append('r.resource_id NOT IN ('
                          'SELECT resource_id FROM bookings '
                          'WHERE status IN ("pending", "approved") '
                          'AND ((start_datetime < ? AND end_datetime > ?) '
                               'OR (start_datetime < ? AND end_datetime > ?) '
                               'OR (start_datetime >= ? AND end_datetime <= ?))'
                          ')')
            params.extend([
                available_end, available_start,
                available_end, available_start,
                available_start, available_end
            ])

        # Handle sort options that require joins
        needs_booking_join = sort == 'most_booked'
        needs_review_join = sort == 'top_rated'
        
        if needs_booking_join:
            joins.append('LEFT JOIN bookings b ON r.resource_id = b.resource_id AND b.status IN ("approved", "completed")')
        if needs_review_join:
            joins.append('LEFT JOIN reviews rv ON r.resource_id = rv.resource_id AND rv.is_hidden = 0')
        
        sort_map = {
            'recent': 'r.created_at DESC',
            'most_booked': 'booking_count DESC, r.created_at DESC',
            'top_rated': 'avg_rating DESC, review_count DESC, r.created_at DESC',
            'name_az': 'LOWER(r.title) ASC, r.created_at DESC',
            'capacity_desc': 'COALESCE(r.capacity, 0) DESC, r.title ASC',
            'capacity_asc': 'COALESCE(r.capacity, 999999) ASC, r.title ASC',
            'location_az': 'LOWER(r.location) ASC, r.title ASC'
        }
        order_clause = sort_map.get(sort, sort_map['recent'])

        # Build SELECT clause with aggregations if needed
        if needs_booking_join:
            select_clause = 'SELECT r.*, COUNT(DISTINCT b.booking_id) AS booking_count'
        elif needs_review_join:
            select_clause = 'SELECT r.*, COALESCE(AVG(rv.rating), 0) AS avg_rating, COUNT(DISTINCT rv.review_id) AS review_count'
        else:
            select_clause = 'SELECT r.*'

        result_parts = [select_clause, 'FROM resources r']
        if joins:
            result_parts.extend(joins)
        if wheres:
            result_parts.append('WHERE ' + ' AND '.join(wheres))
        
        # Add GROUP BY for aggregated sorts
        if needs_booking_join or needs_review_join:
            result_parts.append('GROUP BY r.resource_id')
        
        result_parts.append('ORDER BY ' + order_clause)

        result_params = list(params)
        limit_clause = ''
        if per_page:
            safe_page = max(page or 1, 1)
            offset = (safe_page - 1) * per_page
            limit_clause = ' LIMIT ? OFFSET ?'
            result_params.extend([per_page, offset])

        query = ' '.join(result_parts) + limit_clause
        total_count = None

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(query, result_params)
            rows = cursor.fetchall()

            if include_total:
                # For count, we don't need GROUP BY even if the main query has it
                count_parts = ['SELECT COUNT(DISTINCT r.resource_id) AS total', 'FROM resources r']
                if joins:
                    count_parts.extend(joins)
                if wheres:
                    count_parts.append('WHERE ' + ' AND '.join(wheres))
                count_query = ' '.join(count_parts)
                cursor.execute(count_query, params)
                count_row = cursor.fetchone()
                total_count = count_row['total'] if count_row else 0
            
        # Filter out extra fields (booking_count, avg_rating, review_count) before creating Resource objects
        resource_fields = {
            'resource_id', 'owner_id', 'title', 'description', 'category', 'location',
            'capacity', 'images', 'equipment', 'availability_rules', 'is_restricted',
            'status', 'created_at', 'availability_schedule', 'min_booking_minutes',
            'max_booking_minutes', 'booking_increment_minutes', 'buffer_minutes',
            'advance_booking_days', 'min_lead_time_hours'
        }
        resources = []
        for row in rows:
            row_dict = dict(row)
            # Remove extra fields that aren't part of Resource model
            resource_dict = {k: v for k, v in row_dict.items() if k in resource_fields}
            resources.append(Resource(**resource_dict))
        
        if include_total:
            return resources, total_count
        return resources
    
    @staticmethod
    def get_resources_by_owner(owner_id):
        """Get all resources owned by a user"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM resources 
                WHERE owner_id = ? 
                ORDER BY created_at DESC
            ''', (owner_id,))
            rows = cursor.fetchall()
            
        return [Resource(**dict(row)) for row in rows]

    @staticmethod
    def get_recently_published_by_owner(owner_id, days=30, limit=3):
        """Return recently published resources for a specific owner."""
        if not owner_id:
            return []

        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        cutoff_str = cutoff.replace(tzinfo=None).strftime('%Y-%m-%d %H:%M:%S')

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                '''
                SELECT *
                FROM resources
                WHERE owner_id = ?
                  AND status = 'published'
                  AND datetime(created_at) >= datetime(?)
                ORDER BY datetime(created_at) DESC
                LIMIT ?
                ''',
                (owner_id, cutoff_str, limit)
            )
            rows = cursor.fetchall()

        return [Resource(**dict(row)) for row in rows]
    
    @staticmethod
    def update_resource(resource_id, **kwargs):
        """Update resource fields"""
        allowed_fields = ['title', 'description', 'category', 'location',
                         'capacity', 'images', 'equipment', 'availability_rules', 'is_restricted', 'status',
                         'availability_schedule', 'min_booking_minutes', 'max_booking_minutes',
                         'booking_increment_minutes', 'buffer_minutes', 'advance_booking_days',
                         'min_lead_time_hours']
        updates = {k: v for k, v in kwargs.items() if k in allowed_fields}

        if not updates:
            return False

        set_clause = ', '.join(f"{k} = ?" for k in updates.keys())
        values = [int(v) if k == 'is_restricted' else v for k, v in updates.items()]
        values.append(resource_id)

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(f'UPDATE resources SET {set_clause} WHERE resource_id = ?', values)

        return cursor.rowcount > 0
    
    @staticmethod
    def delete_resource(resource_id):
        """Delete a resource"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('DELETE FROM resources WHERE resource_id = ?', (resource_id,))
            
        return cursor.rowcount > 0
    
    @staticmethod
    def get_resource_with_avg_rating(resource_id):
        """Get resource with average rating"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT r.*, 
                       COALESCE(AVG(rv.rating), 0) as avg_rating,
                       COUNT(rv.review_id) as review_count
                FROM resources r
                LEFT JOIN reviews rv ON r.resource_id = rv.resource_id
                WHERE r.resource_id = ?
                GROUP BY r.resource_id
            ''', (resource_id,))
            row = cursor.fetchone()
            
        if row:
            resource_dict = dict(row)
            avg_rating = resource_dict.pop('avg_rating', 0)
            review_count = resource_dict.pop('review_count', 0)
            resource = Resource(**resource_dict)
            return resource, round(avg_rating, 1), review_count
        return None, 0, 0

    @staticmethod
    def category_distribution(limit=6):
        """Return counts of resources grouped by category."""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                '''
                SELECT COALESCE(category, 'Uncategorized') AS category,
                       COUNT(*) AS total
                FROM resources
                GROUP BY category
                ORDER BY total DESC, category ASC
                LIMIT ?
                ''',
                (limit,)
            )
            rows = cursor.fetchall()
        return [dict(row) for row in rows]

    @staticmethod
    def count_resources(status=None):
        """Return total number of resources with optional status filtering."""
        query = 'SELECT COUNT(*) as total FROM resources'
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
    def get_resource_by_title(title):
        """Lookup a resource by its exact title"""
        if not title:
            return None
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM resources WHERE title = ?', (title,))
            row = cursor.fetchone()
        return Resource(**dict(row)) if row else None
