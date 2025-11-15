"""
Database Performance Optimization - Add Indexes
Run this script to add indexes to frequently queried columns
"""
from src.data_access import get_db

def add_performance_indexes():
    """Add indexes to improve query performance"""
    indexes = [
        # Booking indexes for faster lookups
        ('idx_bookings_resource_id', 'bookings', 'resource_id'),
        ('idx_bookings_requester_id', 'bookings', 'requester_id'),
        ('idx_bookings_status', 'bookings', 'status'),
        ('idx_bookings_start_datetime', 'bookings', 'start_datetime'),
        ('idx_bookings_end_datetime', 'bookings', 'end_datetime'),

        # Resource indexes
        ('idx_resources_owner_id', 'resources', 'owner_id'),
        ('idx_resources_status', 'resources', 'status'),
        ('idx_resources_category', 'resources', 'category'),
        ('idx_resources_location', 'resources', 'location'),

        # Review indexes
        ('idx_reviews_resource_id', 'reviews', 'resource_id'),
        ('idx_reviews_user_id', 'reviews', 'user_id'),

        # Message indexes
        ('idx_messages_thread_id', 'messages', 'thread_id'),
        ('idx_messages_sender_id', 'messages', 'sender_id'),

        # Notification indexes
        ('idx_notifications_user_id', 'notifications', 'user_id'),
        ('idx_notifications_is_read', 'notifications', 'is_read'),

        # User indexes
        ('idx_users_email', 'users', 'email'),
        ('idx_users_role', 'users', 'role'),

        # Waitlist indexes
        ('idx_waitlist_resource_id', 'waitlist_entries', 'resource_id'),
        ('idx_waitlist_requester_id', 'waitlist_entries', 'requester_id'),
        ('idx_waitlist_status', 'waitlist_entries', 'status'),
    ]

    with get_db() as conn:
        cursor = conn.cursor()

        for index_name, table_name, column_name in indexes:
            try:
                # Check if index already exists
                cursor.execute("""
                    SELECT name FROM sqlite_master
                    WHERE type='index' AND name=?
                """, (index_name,))

                if cursor.fetchone() is None:
                    cursor.execute(f'CREATE INDEX {index_name} ON {table_name}({column_name})')
                    print(f'[OK] Created index: {index_name} on {table_name}.{column_name}')
                else:
                    print(f'[SKIP] Index already exists: {index_name}')
            except Exception as e:
                print(f'[ERROR] Error creating index {index_name}: {e}')

        conn.commit()
        print('\n[OK] Database indexing completed!')

if __name__ == '__main__':
    print('Adding performance indexes to database...\n')
    add_performance_indexes()
