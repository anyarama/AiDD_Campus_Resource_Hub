#!/usr/bin/env python3
"""
Add availability schedules to all existing resources that don't have them.
Randomly assigns appropriate schedule templates based on resource category.
"""
import sqlite3
import json
import random
import os

# Get the database path
DB_PATH = os.getenv('DATABASE_PATH', 'campus_hub.db')

# Schedule templates (matching availability.py)
SCHEDULE_TEMPLATES = {
    '24/7': {
        'monday': [{'start': '00:00', 'end': '23:59'}],
        'tuesday': [{'start': '00:00', 'end': '23:59'}],
        'wednesday': [{'start': '00:00', 'end': '23:59'}],
        'thursday': [{'start': '00:00', 'end': '23:59'}],
        'friday': [{'start': '00:00', 'end': '23:59'}],
        'saturday': [{'start': '00:00', 'end': '23:59'}],
        'sunday': [{'start': '00:00', 'end': '23:59'}]
    },
    'business': {
        'monday': [{'start': '09:00', 'end': '17:00'}],
        'tuesday': [{'start': '09:00', 'end': '17:00'}],
        'wednesday': [{'start': '09:00', 'end': '17:00'}],
        'thursday': [{'start': '09:00', 'end': '17:00'}],
        'friday': [{'start': '09:00', 'end': '17:00'}],
        'saturday': [],
        'sunday': []
    },
    'extended': {
        'monday': [{'start': '07:00', 'end': '22:00'}],
        'tuesday': [{'start': '07:00', 'end': '22:00'}],
        'wednesday': [{'start': '07:00', 'end': '22:00'}],
        'thursday': [{'start': '07:00', 'end': '22:00'}],
        'friday': [{'start': '07:00', 'end': '22:00'}],
        'saturday': [],
        'sunday': []
    },
    'academic': {
        'monday': [{'start': '08:00', 'end': '20:00'}],
        'tuesday': [{'start': '08:00', 'end': '20:00'}],
        'wednesday': [{'start': '08:00', 'end': '20:00'}],
        'thursday': [{'start': '08:00', 'end': '20:00'}],
        'friday': [{'start': '08:00', 'end': '20:00'}],
        'saturday': [{'start': '10:00', 'end': '18:00'}],
        'sunday': []
    }
}

# Category-based schedule assignment
CATEGORY_SCHEDULES = {
    'Study Room': ['24/7', 'academic', 'extended'],
    'Lab Equipment': ['business', 'academic'],
    'Event Space': ['business', 'extended'],
    'AV Equipment': ['business', 'academic'],
    'Tutoring': ['business', 'academic'],
    'Other': ['business', 'academic', 'extended']
}

# Default booking rules
DEFAULT_RULES = {
    'min_booking_minutes': 30,
    'max_booking_minutes': 480,
    'booking_increment_minutes': 30,
    'buffer_minutes': 15,
    'advance_booking_days': 90,
    'min_lead_time_hours': 0
}

def add_schedules():
    """Add schedules to all resources without them"""
    if not os.path.exists(DB_PATH):
        print(f"❌ Database not found at: {DB_PATH}")
        return False

    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # Get all resources without schedules
        cursor.execute('''
            SELECT resource_id, title, category
            FROM resources
            WHERE availability_schedule IS NULL OR availability_schedule = ''
        ''')

        resources = cursor.fetchall()

        if not resources:
            print("✅ All resources already have schedules!")
            return True

        print(f"📋 Found {len(resources)} resources without schedules")
        updated = 0

        for resource in resources:
            resource_id = resource['resource_id']
            title = resource['title']
            category = resource['category'] or 'Other'

            # Select appropriate schedule for this category
            possible_schedules = CATEGORY_SCHEDULES.get(category, ['business', 'academic'])
            template_key = random.choice(possible_schedules)
            schedule = SCHEDULE_TEMPLATES[template_key]
            schedule_json = json.dumps(schedule)

            # Update resource with schedule
            cursor.execute('''
                UPDATE resources
                SET availability_schedule = ?,
                    min_booking_minutes = ?,
                    max_booking_minutes = ?,
                    booking_increment_minutes = ?,
                    buffer_minutes = ?,
                    advance_booking_days = ?,
                    min_lead_time_hours = ?
                WHERE resource_id = ?
            ''', (
                schedule_json,
                DEFAULT_RULES['min_booking_minutes'],
                DEFAULT_RULES['max_booking_minutes'],
                DEFAULT_RULES['booking_increment_minutes'],
                DEFAULT_RULES['buffer_minutes'],
                DEFAULT_RULES['advance_booking_days'],
                DEFAULT_RULES['min_lead_time_hours'],
                resource_id
            ))

            updated += 1
            template_name = {
                '24/7': '24/7 Access',
                'business': 'Business Hours',
                'extended': 'Extended Hours',
                'academic': 'Academic Hours'
            }[template_key]

            print(f"  ✓ {title} → {template_name}")

        conn.commit()
        conn.close()

        print(f"\n✅ Successfully updated {updated} resources with schedules!")
        return True

    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == '__main__':
    add_schedules()
