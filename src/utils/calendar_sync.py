"""
Calendar synchronization helpers (Google + iCal export).
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Dict, Optional, Tuple
from zoneinfo import ZoneInfo

try:
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import Flow
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
    GOOGLE_LIB_ERROR = None
except ModuleNotFoundError as exc:  # pragma: no cover - exercised when deps missing
    Credentials = None  # type: ignore[assignment]
    Flow = None  # type: ignore[assignment]
    Request = None  # type: ignore[assignment]
    build = None  # type: ignore[assignment]

    class HttpError(Exception):  # type: ignore[misc]
        """Fallback HttpError when Google libs are unavailable."""

    GOOGLE_LIB_ERROR = exc

from src.config import Config
from src.utils.datetime_helpers import parse_datetime


GOOGLE_PROVIDER = 'google'
CALENDAR_EVENT_COLOR = '4'  # Google Calendar blue


class CalendarSyncError(RuntimeError):
    """Custom exception for calendar failures."""


def _ensure_google_libs():
    if GOOGLE_LIB_ERROR is not None:
        raise CalendarSyncError(
            'Google client libraries are not installed. '
            'Run "pip install google-auth google-auth-oauthlib google-api-python-client".'
        )


def _localize(dt_value, tz_name: str):
    dt_obj = parse_datetime(dt_value)
    if not dt_obj:
        return None
    tz = ZoneInfo(tz_name)
    if dt_obj.tzinfo:
        return dt_obj.astimezone(tz)
    return dt_obj.replace(tzinfo=tz)


def _escape_ics(value) -> str:
    if value is None:
        return ''
    return (
        str(value)
        .replace('\\', '\\\\')
        .replace('\n', '\\n')
        .replace(',', '\\,')
        .replace(';', '\\;')
    )


def build_google_flow(redirect_uri: str, state: Optional[str] = None) -> Flow:
    """Prepare an OAuth flow for Google Calendar."""
    _ensure_google_libs()
    if not Config.GOOGLE_CLIENT_ID or not Config.GOOGLE_CLIENT_SECRET:
        raise CalendarSyncError('Google OAuth is not configured. Please set client credentials.')

    client_config = {
        "web": {
            "client_id": Config.GOOGLE_CLIENT_ID,
            "client_secret": Config.GOOGLE_CLIENT_SECRET,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
        }
    }
    flow = Flow.from_client_config(client_config, scopes=Config.GOOGLE_CALENDAR_SCOPES, state=state)
    flow.redirect_uri = redirect_uri
    return flow


def credentials_from_record(record: dict) -> Credentials:
    _ensure_google_libs()
    if not record:
        raise CalendarSyncError('No stored credentials were found.')
    return Credentials.from_authorized_user_info(json.loads(record['credentials_json']))


def serialize_credentials(credentials: Credentials) -> str:
    _ensure_google_libs()
    return credentials.to_json()


def refresh_credentials(credentials: Credentials) -> Credentials:
    _ensure_google_libs()
    if credentials.expired and credentials.refresh_token:
        credentials.refresh(Request())
    if not credentials.valid and not credentials.refresh_token:
        raise CalendarSyncError('Stored credentials are no longer valid. Please reconnect Google Calendar.')
    return credentials


def build_google_event_payload(booking: dict, tz_name: str) -> Dict:
    start = _localize(booking.get('start_datetime'), tz_name)
    end = _localize(booking.get('end_datetime'), tz_name)
    if not start or not end:
        raise CalendarSyncError('Unable to parse booking dates for calendar export.')

    description_lines = [
        f"Resource: {booking.get('resource_title')}",
        f"Location: {booking.get('location') or 'TBD'}",
        f"Requested by: {booking.get('requester_name')}",
    ]
    if booking.get('recurrence_rule'):
        description_lines.append(f"Recurrence: {booking['recurrence_rule']}")
    if booking.get('status') == 'pending':
        description_lines.append('Status: Pending approval')
    elif booking.get('status'):
        description_lines.append(f"Status: {booking['status'].title()}")

    body = {
        "summary": f"{booking.get('resource_title')} reservation",
        "description": "\n".join(description_lines),
        "location": booking.get('location'),
        "colorId": CALENDAR_EVENT_COLOR,
        "start": {
            "dateTime": start.isoformat(),
            "timeZone": tz_name,
        },
        "end": {
            "dateTime": end.isoformat(),
            "timeZone": tz_name,
        },
        "reminders": {
            "useDefault": False,
            "overrides": [
                {"method": "popup", "minutes": 30},
                {"method": "email", "minutes": 12 * 60},
            ],
        },
    }

    return body


def sync_booking_to_google(credentials: Credentials, booking: dict, tz_name: str, event_id: Optional[str] = None) -> Tuple[str, Optional[str]]:
    """Create or update an event in the user's Google Calendar."""
    _ensure_google_libs()
    refreshed = refresh_credentials(credentials)
    try:
        service = build('calendar', 'v3', credentials=refreshed, cache_discovery=False)
        event_body = build_google_event_payload(booking, tz_name)
        if event_id:
            event = service.events().update(calendarId='primary', eventId=event_id, body=event_body).execute()
        else:
            event = service.events().insert(calendarId='primary', body=event_body).execute()
    except HttpError as exc:
        raise CalendarSyncError(f'Google Calendar API error: {exc}') from exc
    return event.get('id'), event.get('htmlLink')


def build_ics_for_booking(booking: dict, tz_name: str) -> bytes:
    start = _localize(booking.get('start_datetime'), tz_name)
    end = _localize(booking.get('end_datetime'), tz_name)
    if not start or not end:
        raise CalendarSyncError('Unable to generate ICS without valid start/end timestamps.')
    dtstamp = datetime.now(timezone.utc)
    start_utc = start.astimezone(timezone.utc)
    end_utc = end.astimezone(timezone.utc)

    status_label = (booking.get('status') or 'pending').title()
    description_lines = [
        f"Resource: {booking.get('resource_title')}",
        f"Location: {booking.get('location') or 'TBD'}",
        f"Requester: {booking.get('requester_name')} ({booking.get('requester_email')})",
        f"Status: {status_label}",
    ]
    if booking.get('recurrence_rule'):
        description_lines.append(f"Recurrence: {booking['recurrence_rule']}")
    description_text = '\\n'.join(_escape_ics(line) for line in description_lines)

    lines = [
        "BEGIN:VCALENDAR",
        "PRODID:-//Campus Resource Hub//Calendar Sync//EN",
        "VERSION:2.0",
        f"X-WR-TIMEZONE:{tz_name}",
        "BEGIN:VEVENT",
        f"UID:booking-{booking.get('booking_id')}@resource-hub",
        f"DTSTAMP:{dtstamp.strftime('%Y%m%dT%H%M%SZ')}",
        f"DTSTART:{start_utc.strftime('%Y%m%dT%H%M%SZ')}",
        f"DTEND:{end_utc.strftime('%Y%m%dT%H%M%SZ')}",
        f"SUMMARY:{_escape_ics(booking.get('resource_title'))} reservation",
        f"DESCRIPTION:{description_text}",
    ]
    if booking.get('location'):
        lines.append(f"LOCATION:{_escape_ics(booking.get('location'))}")
    if booking.get('recurrence_rule'):
        lines.append(f"RRULE:{booking['recurrence_rule']}")
    lines.append("END:VEVENT")
    lines.append("END:VCALENDAR")

    return '\r\n'.join(lines).encode('utf-8')
