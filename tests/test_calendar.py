from datetime import datetime, timedelta

from src.data_access.booking_dal import BookingDAL
from src.data_access.calendar_dal import CalendarCredentialDAL, CalendarEventDAL
from src.data_access.resource_dal import ResourceDAL
from src.data_access.user_dal import UserDAL
from src.services.calendar_service import upcoming_bookings_for_requester
from src.utils.calendar_sync import GOOGLE_PROVIDER, build_ics_for_booking


def _create_user(name, email, role='student'):
    return UserDAL.create_user(
        name=name,
        email=email,
        password='StrongPass1!',
        role=role,
        department='Engineering'
    )


def _create_resource(owner_id):
    return ResourceDAL.create_resource(
        owner_id=owner_id,
        title='Innovation Lab',
        description='Prototype anything.',
        category='Lab',
        location='Innovation Hall',
        capacity=20,
        images=None,
        equipment='Laser cutter',
        availability_rules='Mon-Fri 9-5',
        is_restricted=False,
        status='published'
    )


def test_calendar_credentials_round_trip(temp_db):
    user = _create_user('Calendar User', 'calendar.user@iu.edu')
    payload = '{"token": "abc", "refresh_token": "def"}'

    CalendarCredentialDAL.upsert_credentials(user.user_id, GOOGLE_PROVIDER, payload)
    record = CalendarCredentialDAL.get_credentials(user.user_id, GOOGLE_PROVIDER)
    assert record is not None
    assert payload in record['credentials_json']

    removed = CalendarCredentialDAL.delete_credentials(user.user_id, GOOGLE_PROVIDER)
    assert removed is True
    assert CalendarCredentialDAL.get_credentials(user.user_id, GOOGLE_PROVIDER) is None


def test_calendar_event_upsert(temp_db):
    owner = _create_user('Owner', 'owner.calendar@iu.edu', role='staff')
    requester = _create_user('Requester', 'requester.calendar@iu.edu')
    resource = _create_resource(owner.user_id)
    booking = BookingDAL.create_booking(
        resource_id=resource.resource_id,
        requester_id=requester.user_id,
        start_datetime=datetime(2025, 5, 1, 9, 0),
        end_datetime=datetime(2025, 5, 1, 10, 0),
        status='approved'
    )

    CalendarEventDAL.upsert_event(
        booking_id=booking.booking_id,
        user_id=requester.user_id,
        provider=GOOGLE_PROVIDER,
        external_event_id='evt_123',
        html_link='https://calendar.google.com/event?eid=evt_123'
    )
    record = CalendarEventDAL.get_event(booking.booking_id, requester.user_id, GOOGLE_PROVIDER)
    assert record['external_event_id'] == 'evt_123'

    CalendarEventDAL.upsert_event(
        booking_id=booking.booking_id,
        user_id=requester.user_id,
        provider=GOOGLE_PROVIDER,
        external_event_id='evt_456',
        html_link='https://calendar.google.com/event?eid=evt_456'
    )
    updated = CalendarEventDAL.get_event(booking.booking_id, requester.user_id, GOOGLE_PROVIDER)
    assert updated['external_event_id'] == 'evt_456'
    assert 'evt_456' in updated['html_link']


def test_build_ics_for_booking(temp_db):
    owner = _create_user('Owner ICS', 'owner.ics@iu.edu', role='staff')
    requester = _create_user('Requester ICS', 'requester.ics@iu.edu')
    resource = _create_resource(owner.user_id)
    start_time = datetime(2025, 6, 10, 14, 0)
    booking = BookingDAL.create_booking(
        resource_id=resource.resource_id,
        requester_id=requester.user_id,
        start_datetime=start_time,
        end_datetime=start_time + timedelta(hours=2),
        status='approved',
        recurrence_rule='FREQ=WEEKLY;COUNT=3'
    )
    details = BookingDAL.get_booking_with_details(booking.booking_id)

    ics_bytes = build_ics_for_booking(details, 'America/New_York')
    ics_text = ics_bytes.decode('utf-8')
    assert 'BEGIN:VEVENT' in ics_text
    assert resource.title in ics_text
    assert 'RRULE' in ics_text


def test_upcoming_bookings_for_requester_filters_status_and_time(temp_db):
    owner = _create_user('Owner Filter', 'owner.filter@iu.edu', role='staff')
    requester = _create_user('Requester Filter', 'requester.filter@iu.edu')
    resource = _create_resource(owner.user_id)
    reference_time = datetime(2025, 1, 1, 8, 0)

    approved_future = BookingDAL.create_booking(
        resource_id=resource.resource_id,
        requester_id=requester.user_id,
        start_datetime=datetime(2025, 1, 2, 10, 0),
        end_datetime=datetime(2025, 1, 2, 11, 0),
        status='approved'
    )
    pending_future = BookingDAL.create_booking(
        resource_id=resource.resource_id,
        requester_id=requester.user_id,
        start_datetime=datetime(2025, 1, 3, 9, 0),
        end_datetime=datetime(2025, 1, 3, 10, 0),
        status='pending'
    )
    BookingDAL.create_booking(
        resource_id=resource.resource_id,
        requester_id=requester.user_id,
        start_datetime=datetime(2025, 1, 4, 9, 0),
        end_datetime=datetime(2025, 1, 4, 10, 0),
        status='rejected'
    )
    BookingDAL.create_booking(
        resource_id=resource.resource_id,
        requester_id=requester.user_id,
        start_datetime=datetime(2024, 12, 28, 9, 0),
        end_datetime=datetime(2024, 12, 28, 10, 0),
        status='approved'
    )

    results = upcoming_bookings_for_requester(
        requester.user_id,
        statuses={'pending', 'approved'},
        reference_time=reference_time
    )
    result_ids = {booking['booking_id'] for booking in results}

    assert approved_future.booking_id in result_ids
    assert pending_future.booking_id in result_ids
    assert len(result_ids) == 2
