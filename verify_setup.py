#!/usr/bin/env python3
"""
Verify the complete availability system setup
"""
import sqlite3
import json

DB_PATH = 'campus_hub.db'

def verify_setup():
    """Check that all resources have schedules and bookings exist"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Get all resources
    cursor.execute('''
        SELECT resource_id, title, category, availability_schedule,
               min_booking_minutes, max_booking_minutes,
               booking_increment_minutes, buffer_minutes,
               advance_booking_days, min_lead_time_hours
        FROM resources
    ''')
    resources = cursor.fetchall()

    print(f"📊 RESOURCES OVERVIEW ({len(resources)} total)\n")
    print("=" * 80)

    resources_with_schedules = 0
    resources_without_schedules = 0

    for res in resources:
        title = res['title']
        category = res['category'] or 'N/A'
        has_schedule = bool(res['availability_schedule'])

        # Count bookings for this resource
        cursor.execute('SELECT COUNT(*) as count FROM bookings WHERE resource_id = ?', (res['resource_id'],))
        booking_count = cursor.fetchone()['count']

        # Parse schedule if exists
        schedule_summary = "❌ No schedule"
        if has_schedule:
            resources_with_schedules += 1
            try:
                schedule = json.loads(res['availability_schedule'])
                # Count days with availability
                days_available = sum(1 for day, slots in schedule.items() if slots)
                schedule_summary = f"✅ {days_available} days/week"
            except:
                schedule_summary = "⚠️  Invalid JSON"
        else:
            resources_without_schedules += 1

        booking_summary = f"{booking_count} booking(s)" if booking_count > 0 else "No bookings"

        print(f"\n{title}")
        print(f"  Category: {category}")
        print(f"  Schedule: {schedule_summary}")
        print(f"  Bookings: {booking_summary}")
        print(f"  Rules: {res['min_booking_minutes']}-{res['max_booking_minutes']} min, "
              f"{res['booking_increment_minutes']} min increments, "
              f"{res['buffer_minutes']} min buffer")

    print("\n" + "=" * 80)
    print(f"\n📈 SUMMARY:")
    print(f"  ✅ Resources with schedules: {resources_with_schedules}")
    print(f"  ❌ Resources without schedules: {resources_without_schedules}")

    # Total bookings
    cursor.execute('SELECT COUNT(*) as total FROM bookings')
    total_bookings = cursor.fetchone()['total']
    print(f"  📅 Total bookings in database: {total_bookings}")

    # Bookings by status
    cursor.execute('SELECT status, COUNT(*) as count FROM bookings GROUP BY status')
    status_counts = cursor.fetchall()
    print(f"\n  Bookings by status:")
    for row in status_counts:
        print(f"    {row['status']}: {row['count']}")

    conn.close()

    if resources_without_schedules == 0:
        print("\n✅ All resources have availability schedules configured!")
        return True
    else:
        print(f"\n⚠️  {resources_without_schedules} resources still need schedules")
        return False

if __name__ == '__main__':
    verify_setup()
