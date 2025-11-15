"""
Helper utilities for synchronizing bookings with external calendar providers.
"""
from __future__ import annotations

from typing import Iterable, List, Optional

from src.data_access.booking_dal import BookingDAL
from src.utils.datetime_helpers import parse_datetime, utc_now_naive


def upcoming_bookings_for_requester(
    requester_id: int,
    statuses: Optional[Iterable[str]] = None,
    reference_time=None
) -> List[dict]:
    """
    Return booking detail dicts for future reservations requested by the user.

    This helper is used by the Google Calendar backfill to automatically sync
    bookings that already existed before the user connected their calendar.
    """
    allowed_statuses = {status.lower() for status in statuses} if statuses else {'pending', 'approved'}
    reference_point = reference_time or utc_now_naive()
    upcoming: List[dict] = []

    bookings = BookingDAL.get_bookings_by_requester(requester_id)
    if not bookings:
        return upcoming

    for booking in bookings:
        status = (getattr(booking, 'status', None) or '').lower()
        if allowed_statuses and status not in allowed_statuses:
            continue

        end_dt = parse_datetime(getattr(booking, 'end_datetime', None))
        if end_dt is None or end_dt < reference_point:
            continue

        details = BookingDAL.get_booking_with_details(booking.booking_id)
        if details:
            upcoming.append(details)

    return upcoming
