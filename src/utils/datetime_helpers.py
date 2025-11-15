"""Shared datetime utilities for calendars and booking summaries."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
import calendar
from typing import Iterable, Optional


def utc_now_naive() -> datetime:
    """Return current UTC time as a naive datetime (legacy compatibility)."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


def local_to_utc(dt: datetime) -> datetime:
    """Convert local time (Bloomington, IN) to UTC naive datetime for database storage."""
    from zoneinfo import ZoneInfo
    from src.config import Config

    # If already has timezone info, convert to UTC
    if dt.tzinfo is not None:
        return dt.astimezone(ZoneInfo('UTC')).replace(tzinfo=None)

    # Otherwise, assume it's in local timezone
    local_tz = ZoneInfo(Config.TIMEZONE)
    dt_local = dt.replace(tzinfo=local_tz)
    return dt_local.astimezone(ZoneInfo('UTC')).replace(tzinfo=None)


def utc_to_local(dt: datetime) -> datetime:
    """Convert UTC naive datetime to local timezone (Bloomington, IN)."""
    from zoneinfo import ZoneInfo
    from src.config import Config

    # If naive, assume it's UTC
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=ZoneInfo('UTC'))

    # Convert to local timezone
    local_tz = ZoneInfo(Config.TIMEZONE)
    return dt.astimezone(local_tz)


def build_booking_calendar(bookings: Iterable, month_token: Optional[str] = None):
    """Return a matrix describing a month view with booking counts per day."""
    if month_token:
        try:
            base_date = datetime.strptime(month_token, '%Y-%m')
        except ValueError:
            base_date = utc_now_naive()
    else:
        base_date = utc_now_naive()

    active_statuses = {'pending', 'approved', 'completed'}
    bookings_by_day = {}
    for booking in bookings:
        status = getattr(booking, 'status', None)
        if status and status not in active_statuses:
            continue
        start_value = getattr(booking, 'start_datetime', None)
        if isinstance(start_value, datetime):
            day_key = start_value.date().isoformat()
        else:
            day_key = str(start_value)[:10]
        bookings_by_day[day_key] = bookings_by_day.get(day_key, 0) + 1

    cal = calendar.Calendar(firstweekday=6)  # Start week on Sunday
    today = utc_now_naive().date()
    month_rows = []
    for week in cal.monthdatescalendar(base_date.year, base_date.month):
        week_cells = []
        for day in week:
            day_key = day.strftime('%Y-%m-%d')
            week_cells.append({
                'date': day,
                'in_month': day.month == base_date.month,
                'booking_count': bookings_by_day.get(day_key, 0),
                'is_today': day == today
            })
        month_rows.append(week_cells)

    prev_month_token = (base_date.replace(day=1) - timedelta(days=1)).strftime('%Y-%m')
    next_month_token = (base_date.replace(day=28) + timedelta(days=4)).replace(day=1).strftime('%Y-%m')

    return {
        'rows': month_rows,
        'label': base_date.strftime('%B %Y'),
        'prev_token': prev_month_token,
        'next_token': next_month_token
    }


def humanize_datetime(value) -> str:
    """Render datetime objects or ISO strings into human-friendly text in local timezone."""
    from zoneinfo import ZoneInfo
    from src.config import Config
    
    if isinstance(value, datetime):
        dt_obj = value
    else:
        try:
            dt_obj = datetime.fromisoformat(str(value))
        except ValueError:
            return str(value)
    
    # If datetime is naive (from database), assume it's UTC and convert to local
    if dt_obj.tzinfo is None:
        dt_obj = dt_obj.replace(tzinfo=ZoneInfo('UTC'))
    
    # Convert to local timezone for display
    local_tz = ZoneInfo(Config.TIMEZONE)
    dt_local = dt_obj.astimezone(local_tz)
    
    return dt_local.strftime('%B %d, %Y %I:%M %p')


def describe_recurrence(rule: Optional[str]):
    """Convert a stored recurrence rule into a readable summary."""
    if not rule:
        return None
    parts = {}
    for segment in rule.split(';'):
        if '=' in segment:
            key, value = segment.split('=', 1)
            parts[key.upper()] = value
    freq_map = {'DAILY': 'Daily', 'WEEKLY': 'Weekly'}
    frequency = freq_map.get(parts.get('FREQ', '').upper(), parts.get('FREQ', '').title())
    count = parts.get('COUNT')
    if frequency and count:
        suffix = '' if count == '1' else 's'
        return f"{frequency} ({count} occurrence{suffix})"
    return frequency or rule


def parse_datetime(value, convert_to_local=False):
    """
    Parse ISO strings or datetime objects into datetime instances.
    
    Args:
        value: datetime object or ISO string
        convert_to_local: If True, convert from UTC to local timezone
    
    Returns:
        datetime object (naive UTC by default, or timezone-aware local if convert_to_local=True)
    """
    if isinstance(value, datetime):
        dt = value
    else:
        try:
            dt = datetime.fromisoformat(str(value))
        except ValueError:
            return None
    
    if convert_to_local:
        from zoneinfo import ZoneInfo
        from src.config import Config
        
        # If naive, assume it's UTC
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=ZoneInfo('UTC'))
        
        # Convert to local timezone
        local_tz = ZoneInfo(Config.TIMEZONE)
        return dt.astimezone(local_tz)
    
    return dt
