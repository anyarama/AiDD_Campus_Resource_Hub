from datetime import datetime, timedelta

from src.data_access.booking_dal import BookingDAL
from src.controllers.booking_controller import _promote_waitlist_for_resource
from src.data_access.resource_dal import ResourceDAL
from src.data_access.user_dal import UserDAL
from src.data_access.waitlist_dal import WaitlistDAL


def _create_user(name, email):
    return UserDAL.create_user(
        name=name,
        email=email,
        password='StrongPass1',
        role='student',
        department='Engineering'
    )


def _create_resource(owner_id):
    return ResourceDAL.create_resource(
        owner_id=owner_id,
        title='Makerspace 101',
        description='Fully equipped makerspace for prototyping.',
        category='Lab Equipment',
        location='Innovation Hall',
        capacity=10,
        images=None,
        equipment='3D Printer, Laser Cutter',
        availability_rules='Weekdays 09:00-17:00',
        is_restricted=False,
        status='published'
    )


def test_booking_conflict_detection(temp_db):
    owner = _create_user('Owner', 'owner@iu.edu')
    requester = _create_user('Requester', 'requester@iu.edu')
    resource = _create_resource(owner.user_id)

    start = datetime(2025, 1, 1, 10, 0)
    end = start + timedelta(hours=2)
    BookingDAL.create_booking(
        resource_id=resource.resource_id,
        requester_id=requester.user_id,
        start_datetime=start,
        end_datetime=end,
        status='approved'
    )

    # Overlapping booking should be flagged as a conflict
    overlap_start = datetime(2025, 1, 1, 11, 0)
    overlap_end = overlap_start + timedelta(hours=2)
    assert BookingDAL.check_booking_conflict(
        resource.resource_id,
        overlap_start,
        overlap_end
    ) is True

    # Non-overlapping booking passes
    later_start = datetime(2025, 1, 1, 13, 30)
    later_end = later_start + timedelta(hours=2)
    assert BookingDAL.check_booking_conflict(
        resource.resource_id,
        later_start,
        later_end
    ) is False


def test_booking_status_transitions(temp_db):
    owner = _create_user('Owner Two', 'owner2@iu.edu')
    requester = _create_user('Requester Two', 'requester2@iu.edu')
    resource = _create_resource(owner.user_id)

    booking = BookingDAL.create_booking(
        resource_id=resource.resource_id,
        requester_id=requester.user_id,
        start_datetime=datetime(2025, 2, 2, 9, 0),
        end_datetime=datetime(2025, 2, 2, 10, 0),
        status='pending'
    )

    assert booking.status == 'pending'

    assert BookingDAL.update_booking_status(booking.booking_id, 'approved') is True
    updated = BookingDAL.get_booking_by_id(booking.booking_id)
    assert updated.status == 'approved'

    BookingDAL.update_booking_status(booking.booking_id, 'cancelled')
    updated = BookingDAL.get_booking_by_id(booking.booking_id)
    assert updated.status == 'cancelled'


def test_waitlist_promotion_after_cancellation(temp_db):
    owner = _create_user('Owner Three', 'owner3@iu.edu')
    requester = _create_user('Requester Three', 'requester3@iu.edu')
    resource = _create_resource(owner.user_id)

    start = datetime(2025, 3, 5, 14, 0)
    end = start + timedelta(hours=2)

    blocking_booking = BookingDAL.create_booking(
        resource_id=resource.resource_id,
        requester_id=owner.user_id,
        start_datetime=start,
        end_datetime=end,
        status='approved'
    )

    entry = WaitlistDAL.create_entry(
        resource_id=resource.resource_id,
        requester_id=requester.user_id,
        start_datetime=start,
        end_datetime=end
    )
    assert entry.status == 'active'

    # Still blocked, so promotion should not happen yet
    _promote_waitlist_for_resource(resource)
    assert BookingDAL.get_bookings_by_requester(requester.user_id) == []

    BookingDAL.update_booking_status(blocking_booking.booking_id, 'cancelled')
    _promote_waitlist_for_resource(resource)

    promoted_bookings = BookingDAL.get_bookings_by_requester(requester.user_id)
    assert len(promoted_bookings) == 1
    assert promoted_bookings[0].status == 'approved'

    refreshed_entry = WaitlistDAL.get_entry(entry.entry_id)
    assert refreshed_entry.status == 'promoted'
    assert refreshed_entry.booking_id == promoted_bookings[0].booking_id
