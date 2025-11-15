"""
Availability Schedule & Booking Rules Utilities

Handles resource availability schedules, booking validation,
and smart availability calculations.
"""
import json
from datetime import datetime, timedelta, time
from typing import Optional, Dict, List, Tuple


# Preset schedule templates
SCHEDULE_TEMPLATES = {
    '24/7': {
        'name': '24/7 Access',
        'schedule': {
            'monday': [{'start': '00:00', 'end': '23:59'}],
            'tuesday': [{'start': '00:00', 'end': '23:59'}],
            'wednesday': [{'start': '00:00', 'end': '23:59'}],
            'thursday': [{'start': '00:00', 'end': '23:59'}],
            'friday': [{'start': '00:00', 'end': '23:59'}],
            'saturday': [{'start': '00:00', 'end': '23:59'}],
            'sunday': [{'start': '00:00', 'end': '23:59'}]
        }
    },
    'business': {
        'name': 'Business Hours (Mon-Fri 9AM-5PM)',
        'schedule': {
            'monday': [{'start': '09:00', 'end': '17:00'}],
            'tuesday': [{'start': '09:00', 'end': '17:00'}],
            'wednesday': [{'start': '09:00', 'end': '17:00'}],
            'thursday': [{'start': '09:00', 'end': '17:00'}],
            'friday': [{'start': '09:00', 'end': '17:00'}],
            'saturday': [],
            'sunday': []
        }
    },
    'extended': {
        'name': 'Extended Hours (Mon-Fri 7AM-10PM)',
        'schedule': {
            'monday': [{'start': '07:00', 'end': '22:00'}],
            'tuesday': [{'start': '07:00', 'end': '22:00'}],
            'wednesday': [{'start': '07:00', 'end': '22:00'}],
            'thursday': [{'start': '07:00', 'end': '22:00'}],
            'friday': [{'start': '07:00', 'end': '22:00'}],
            'saturday': [],
            'sunday': []
        }
    },
    'academic': {
        'name': 'Academic Hours (Mon-Fri 8AM-8PM, Sat 10AM-6PM)',
        'schedule': {
            'monday': [{'start': '08:00', 'end': '20:00'}],
            'tuesday': [{'start': '08:00', 'end': '20:00'}],
            'wednesday': [{'start': '08:00', 'end': '20:00'}],
            'thursday': [{'start': '08:00', 'end': '20:00'}],
            'friday': [{'start': '08:00', 'end': '20:00'}],
            'saturday': [{'start': '10:00', 'end': '18:00'}],
            'sunday': []
        }
    },
    'weekends': {
        'name': 'Weekends Only (Sat-Sun 10AM-6PM)',
        'schedule': {
            'monday': [],
            'tuesday': [],
            'wednesday': [],
            'thursday': [],
            'friday': [],
            'saturday': [{'start': '10:00', 'end': '18:00'}],
            'sunday': [{'start': '10:00', 'end': '18:00'}]
        }
    }
}


def parse_schedule(schedule_json: Optional[str]) -> Dict:
    """Parse availability schedule JSON string"""
    if not schedule_json:
        return None
    try:
        return json.loads(schedule_json)
    except (json.JSONDecodeError, TypeError):
        return None


def get_template_schedule(template_key: str) -> Dict:
    """Get a preset schedule template"""
    template = SCHEDULE_TEMPLATES.get(template_key)
    return template['schedule'] if template else None


def parse_time_string(time_str: str) -> time:
    """Parse time string like '09:00' to time object"""
    try:
        hour, minute = map(int, time_str.split(':'))
        return time(hour, minute)
    except (ValueError, AttributeError):
        return None


def is_time_in_schedule(dt: datetime, schedule: Dict) -> bool:
    """Check if a datetime falls within the resource's availability schedule"""
    if not schedule:
        return True  # No schedule = always available

    # Get day of week (lowercase)
    day_name = dt.strftime('%A').lower()
    day_schedule = schedule.get(day_name, [])

    if not day_schedule:
        return False  # Day is closed

    # Check if time falls in any of the day's time windows
    check_time = dt.time()
    for window in day_schedule:
        start_time = parse_time_string(window.get('start', '00:00'))
        end_time = parse_time_string(window.get('end', '23:59'))

        if start_time and end_time:
            if start_time <= check_time <= end_time:
                return True

    return False


def validate_booking_times(
    start_dt: datetime,
    end_dt: datetime,
    schedule: Dict,
    min_minutes: int = 30,
    max_minutes: int = 480,
    increment_minutes: int = 30,
    lead_time_hours: int = 0
) -> Tuple[bool, Optional[str]]:
    """
    Validate booking times against resource availability and rules.

    Returns: (is_valid, error_message)
    """
    # Use UTC time (naive) for internal calculations since all DB times are UTC
    from zoneinfo import ZoneInfo
    now = datetime.now(ZoneInfo('UTC')).replace(tzinfo=None)

    # Check duration
    duration = (end_dt - start_dt).total_seconds() / 60

    if duration < min_minutes:
        return False, f"Booking must be at least {min_minutes} minutes long"

    if duration > max_minutes:
        hours = max_minutes / 60
        return False, f"Booking cannot exceed {hours:.1f} hours"

    # Check increment
    if increment_minutes and duration % increment_minutes != 0:
        return False, f"Booking duration must be in {increment_minutes}-minute increments"

    # Check lead time
    if lead_time_hours > 0:
        min_start_time = now + timedelta(hours=lead_time_hours)
        if start_dt < min_start_time:
            return False, f"Booking must be made at least {lead_time_hours} hours in advance"

    # Check against schedule
    if schedule:
        # Check if start and end times are within schedule
        if not is_time_in_schedule(start_dt, schedule):
            return False, f"Resource is not available at {start_dt.strftime('%A %I:%M %p')}"

        if not is_time_in_schedule(end_dt, schedule):
            return False, f"Resource closes before {end_dt.strftime('%I:%M %p')} on {end_dt.strftime('%A')}"

        # For multi-day bookings, check each day
        current = start_dt
        while current < end_dt:
            if not is_time_in_schedule(current, schedule):
                return False, f"Resource is not available during requested time period"
            current += timedelta(hours=1)

    return True, None


def get_next_available_slot(
    schedule: Dict,
    existing_bookings: List,
    duration_minutes: int = 60,
    buffer_minutes: int = 0,
    start_from: Optional[datetime] = None,
    lead_time_hours: int = 0,
    max_days_ahead: int = 7,
    increment_minutes: int = 30
) -> Optional[datetime]:
    """
    Find the next available time slot for a booking.

    Args:
        schedule: Resource availability schedule
        existing_bookings: List of existing bookings
        duration_minutes: Required booking duration
        buffer_minutes: Buffer time needed between bookings
        start_from: Start searching from this time (default: now)
        lead_time_hours: Minimum lead time required
        max_days_ahead: Maximum days to search ahead
        increment_minutes: Time slot increment (default: 30 minutes)

    Returns:
        Next available start datetime, or None if not found
    """
    if not schedule:
        return None

    # Start from now
    # Use UTC time (naive) for internal calculations since all DB times are UTC
    from zoneinfo import ZoneInfo
    now = datetime.now(ZoneInfo('UTC')).replace(tzinfo=None)
    if start_from is None:
        start_from = now

    # Apply lead time requirement
    if lead_time_hours > 0:
        min_start_time = now + timedelta(hours=lead_time_hours)
        start_from = max(start_from, min_start_time)

    # Round down to the nearest increment to avoid skipping available slots
    # This ensures we check from the current time, not skip ahead unnecessarily
    if start_from <= now:
        # Start from now, rounded down to nearest increment
        rounded_minute = (now.minute // increment_minutes) * increment_minutes
        start_from = now.replace(minute=rounded_minute, second=0, microsecond=0)
        # If we rounded down into the past, move to next increment
        if start_from < now:
            start_from += timedelta(minutes=increment_minutes)
    else:
        # Round down to nearest increment for future start times
        rounded_minute = (start_from.minute // increment_minutes) * increment_minutes
        start_from = start_from.replace(minute=rounded_minute, second=0, microsecond=0)

    # Build list of blocked time ranges from existing bookings (only future bookings)
    blocked_ranges = []
    for booking in existing_bookings:
        if hasattr(booking, 'start_datetime') and hasattr(booking, 'end_datetime'):
            booking_start = booking.start_datetime
            booking_end = booking.end_datetime

            if isinstance(booking_start, str):
                booking_start = datetime.fromisoformat(booking_start)
            if isinstance(booking_end, str):
                booking_end = datetime.fromisoformat(booking_end)

            # Only consider future bookings (or bookings that haven't ended yet)
            if booking_end <= now:
                continue  # Skip past bookings

            # Buffer is added AFTER bookings end (not before start)
            # This creates a gap after each booking for cleanup/preparation
            if buffer_minutes > 0:
                booking_end = booking_end + timedelta(minutes=buffer_minutes)

            blocked_ranges.append((booking_start, booking_end))

    # Sort blocked ranges by start time for efficiency
    blocked_ranges.sort(key=lambda x: x[0])

    # Search for available slot
    end_search = start_from + timedelta(days=max_days_ahead)
    current = start_from

    while current < end_search:
        proposed_end = current + timedelta(minutes=duration_minutes)

        # Check if start time is within schedule
        if is_time_in_schedule(current, schedule):
            # Check if end time is also within schedule
            if is_time_in_schedule(proposed_end, schedule):
                # Check for conflicts with existing bookings
                has_conflict = False
                for block_start, block_end in blocked_ranges:
                    # Skip blocked ranges that are completely in the past
                    if block_end <= current:
                        continue
                    # If we've passed all relevant blocked ranges, we can stop checking
                    if block_start > proposed_end:
                        break
                    # Check if proposed slot overlaps with blocked range
                    if (current < block_end and proposed_end > block_start):
                        has_conflict = True
                        break

                if not has_conflict:
                    return current

        # Move to next time slot using the specified increment
        current += timedelta(minutes=increment_minutes)

    return None


def format_schedule_display(schedule: Dict) -> List[str]:
    """Format schedule for human-readable display"""
    if not schedule:
        return ["No schedule defined - bookings subject to owner approval"]

    lines = []
    days_order = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

    for day in days_order:
        day_schedule = schedule.get(day, [])
        day_name = day.capitalize()

        if not day_schedule:
            lines.append(f"{day_name}: Closed")
        else:
            times = []
            for window in day_schedule:
                start = window.get('start', '00:00')
                end = window.get('end', '23:59')

                # Format times nicely
                try:
                    start_time = datetime.strptime(start, '%H:%M').strftime('%I:%M %p').lstrip('0')
                    end_time = datetime.strptime(end, '%H:%M').strftime('%I:%M %p').lstrip('0')
                    times.append(f"{start_time} - {end_time}")
                except ValueError:
                    times.append(f"{start} - {end}")

            lines.append(f"{day_name}: {', '.join(times)}")

    return lines


def get_booking_rules_summary(resource) -> Dict:
    """Get a summary of all booking rules for display"""
    summary = {}

    if hasattr(resource, 'min_booking_minutes') and resource.min_booking_minutes:
        summary['min_duration'] = f"{resource.min_booking_minutes} minutes"

    if hasattr(resource, 'max_booking_minutes') and resource.max_booking_minutes:
        hours = resource.max_booking_minutes / 60
        summary['max_duration'] = f"{hours:.1f} hours"

    if hasattr(resource, 'booking_increment_minutes') and resource.booking_increment_minutes:
        summary['increment'] = f"{resource.booking_increment_minutes} minutes"

    if hasattr(resource, 'buffer_minutes') and resource.buffer_minutes:
        summary['buffer'] = f"{resource.buffer_minutes} minutes between bookings"

    if hasattr(resource, 'min_lead_time_hours') and resource.min_lead_time_hours:
        summary['lead_time'] = f"{resource.min_lead_time_hours} hours advance notice"

    if hasattr(resource, 'advance_booking_days') and resource.advance_booking_days:
        summary['advance_limit'] = f"{resource.advance_booking_days} days ahead"

    return summary
