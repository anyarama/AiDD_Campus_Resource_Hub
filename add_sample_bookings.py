#!/usr/bin/env python3
"""
Add sample bookings to resources for demonstration purposes.
Creates realistic bookings across different times and days.
"""
import sqlite3
import random
import os
from datetime import datetime, timedelta

# Get the database path
DB_PATH = os.getenv('DATABASE_PATH', 'campus_hub.db')

def add_sample_bookings():
    """Add sample bookings to all published resources"""
    if not os.path.exists(DB_PATH):
        print(f"❌ Database not found at: {DB_PATH}")
        return False

    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # Get all published resources
        cursor.execute('''
            SELECT resource_id, title
            FROM resources
            WHERE status = 'published'
        ''')
        resources = cursor.fetchall()

        if not resources:
            print("❌ No published resources found")
            return False

        # Get all users to assign as requesters
        cursor.execute('SELECT user_id FROM users')
        users = [row['user_id'] for row in cursor.fetchall()]

        if not users:
            print("❌ No users found")
            return False

        print(f"📋 Adding sample bookings to {len(resources)} resources...")

        now = datetime.now()
        total_bookings = 0

        for resource in resources:
            resource_id = resource['resource_id']
            title = resource['title']

            # Add 3-8 random bookings per resource
            num_bookings = random.randint(3, 8)

            for i in range(num_bookings):
                # Random date within next 30 days
                days_ahead = random.randint(0, 30)
                booking_date = now + timedelta(days=days_ahead)

                # Random time during business hours (8 AM - 6 PM)
                hour = random.randint(8, 17)
                minute = random.choice([0, 30])
                start_time = booking_date.replace(hour=hour, minute=minute, second=0, microsecond=0)

                # Random duration: 30 min, 1 hour, 2 hours, or 3 hours
                duration_minutes = random.choice([30, 60, 120, 180])
                end_time = start_time + timedelta(minutes=duration_minutes)

                # Random requester
                requester_id = random.choice(users)

                # Random status (mostly approved, some pending)
                status = random.choices(['approved', 'pending'], weights=[0.8, 0.2])[0]

                # Insert booking
                cursor.execute('''
                    INSERT INTO bookings (resource_id, requester_id, start_datetime, end_datetime, status, created_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    resource_id,
                    requester_id,
                    start_time.isoformat(),
                    end_time.isoformat(),
                    status,
                    now.isoformat()
                ))

                total_bookings += 1

            print(f"  ✓ {title}: Added {num_bookings} bookings")

        conn.commit()
        conn.close()

        print(f"\n✅ Successfully added {total_bookings} sample bookings!")
        return True

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    add_sample_bookings()
