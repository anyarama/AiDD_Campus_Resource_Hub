from datetime import datetime, timedelta

from src.data_access.booking_dal import BookingDAL
from src.data_access.resource_dal import ResourceDAL
from src.data_access.user_dal import UserDAL
from src.data_access.admin_log_dal import AdminLogDAL


def _login(client, email, password):
    return client.post(
        '/auth/login',
        data={'email': email, 'password': password},
        follow_redirects=True
    )


def _future_slot(hours=1):
    start = datetime.now().replace(microsecond=0) + timedelta(days=1)
    end = start + timedelta(hours=hours)
    fmt = '%Y-%m-%dT%H:%M'
    return start, end, start.strftime(fmt), end.strftime(fmt)


def _create_user(name, email, role):
    return UserDAL.create_user(
        name=name,
        email=email,
        password='StrongPass1!',
        role=role,
        department='Test'
    )


def _create_resource(owner_id, title, restricted=False):
    return ResourceDAL.create_resource(
        owner_id=owner_id,
        title=title,
        description=f'{title} description for testing.',
        category='Event Space',
        location='Innovation Hall',
        capacity=25,
        images=None,
        equipment='Microphones',
        availability_rules='Weekdays 9-5',
        is_restricted=restricted,
        status='published'
    )


def test_staff_can_create_edit_and_delete_own_resource(client, app):
    _login(client, 'staff@iu.edu', 'StaffPass1!')

    create_data = {
        'title': 'Studio Alpha',
        'description': 'A creative collaboration studio space.',
        'category': 'Event Space',
        'location': 'Building A',
        'capacity': '12',
        'equipment': 'Camera, Lights',
        'availability_rules': 'Weekdays 10-6',
        'is_restricted': 'on',
        'status': 'published'
    }
    create_resp = client.post('/resources/create', data=create_data, follow_redirects=True)
    assert b'Resource created successfully!' in create_resp.data

    with app.app_context():
        resource = ResourceDAL.get_resource_by_title('Studio Alpha')
        assert resource is not None
        staff_user = UserDAL.get_user_by_email('staff@iu.edu')
        assert resource.owner_id == staff_user.user_id
        resource_id = resource.resource_id

    edit_resp = client.post(
        f'/resources/{resource_id}/edit',
        data={
            **create_data,
            'title': 'Studio Beta',
            'status': 'archived'
        },
        follow_redirects=True
    )
    assert b'Resource updated successfully!' in edit_resp.data

    with app.app_context():
        resource = ResourceDAL.get_resource_by_id(resource_id)
        assert resource.title == 'Studio Beta'
        assert resource.status == 'archived'

    delete_resp = client.post(f'/resources/{resource_id}/delete', follow_redirects=True)
    assert b'Resource deleted successfully' in delete_resp.data

    with app.app_context():
        assert ResourceDAL.get_resource_by_id(resource_id) is None


def test_staff_cannot_modify_foreign_resource(client, app):
    with app.app_context():
        owner = _create_user('Owner', 'owner.foreign@iu.edu', 'staff')
        outsider = _create_user('Outsider', 'outsider.staff@iu.edu', 'staff')
        resource = _create_resource(owner.user_id, 'Owner Only Space')

    _login(client, 'outsider.staff@iu.edu', 'StrongPass1!')

    edit_resp = client.post(
        f'/resources/{resource.resource_id}/edit',
        data={'title': 'Tampered Title'},
        follow_redirects=True
    )
    assert b'You do not have permission to edit this resource' in edit_resp.data

    delete_resp = client.post(
        f'/resources/{resource.resource_id}/delete',
        follow_redirects=True
    )
    assert b'You do not have permission to delete this resource' in delete_resp.data

    with app.app_context():
        assert ResourceDAL.get_resource_by_id(resource.resource_id) is not None


def test_staff_request_for_restricted_foreign_resource_stays_pending(client, app):
    with app.app_context():
        owner = _create_user('Owner', 'owner.restricted@iu.edu', 'staff')
        requester = _create_user('Requester', 'requester.staff@iu.edu', 'staff')
        resource = _create_resource(owner.user_id, 'Restricted Lab', restricted=True)

    _login(client, 'requester.staff@iu.edu', 'StrongPass1!')
    _, _, start_value, end_value = _future_slot()

    resp = client.post(
        f'/bookings/create/{resource.resource_id}',
        data={
            'start_datetime': start_value,
            'end_datetime': end_value,
            'recurrence_frequency': 'none',
            'request_action': 'book'
        },
        follow_redirects=True
    )
    assert b'Booking request submitted! Awaiting approval.' in resp.data

    with app.app_context():
        bookings = BookingDAL.get_bookings_by_resource(resource.resource_id)
        assert bookings
        assert bookings[-1].status == 'pending'


def test_staff_owner_can_approve_booking(client, app):
    with app.app_context():
        owner = _create_user('Approver', 'owner.approve@iu.edu', 'staff')
        student = _create_user('Student', 'student.approve@iu.edu', 'student')
        resource = _create_resource(owner.user_id, 'Approval Hall')
        start, end, _, _ = _future_slot()
        booking = BookingDAL.create_booking(
            resource_id=resource.resource_id,
            requester_id=student.user_id,
            start_datetime=start,
            end_datetime=end,
            status='pending'
        )

    _login(client, 'owner.approve@iu.edu', 'StrongPass1!')
    resp = client.post(
        f'/bookings/{booking.booking_id}/approve',
        data={'decision_notes': 'Looks good'},
        follow_redirects=True
    )
    assert b'Booking approved successfully!' in resp.data

    with app.app_context():
        refreshed = BookingDAL.get_booking_by_id(booking.booking_id)
        assert refreshed.status == 'approved'


def test_student_cannot_approve_booking(client, app):
    with app.app_context():
        owner = _create_user('Owner', 'owner.limit@iu.edu', 'staff')
        student = _create_user('Student', 'student.limit@iu.edu', 'student')
        resource = _create_resource(owner.user_id, 'Student Limit Lab')
        start, end, _, _ = _future_slot()
        booking = BookingDAL.create_booking(
            resource_id=resource.resource_id,
            requester_id=student.user_id,
            start_datetime=start,
            end_datetime=end,
            status='pending'
        )

    _login(client, 'student.limit@iu.edu', 'StrongPass1!')
    resp = client.post(
        f'/bookings/{booking.booking_id}/approve',
        follow_redirects=True
    )
    assert b'You do not have permission to approve this booking' in resp.data

    with app.app_context():
        persisted = BookingDAL.get_booking_by_id(booking.booking_id)
        assert persisted.status == 'pending'


def test_admin_can_approve_any_booking(client, app):
    with app.app_context():
        owner = _create_user('Owner', 'owner.admin@iu.edu', 'staff')
        student = _create_user('Student', 'student.admin@iu.edu', 'student')
        resource = _create_resource(owner.user_id, 'Admin Oversight Space')
        start, end, _, _ = _future_slot()
        booking = BookingDAL.create_booking(
            resource_id=resource.resource_id,
            requester_id=student.user_id,
            start_datetime=start,
            end_datetime=end,
            status='pending'
        )

    _login(client, 'admin@iu.edu', 'AdminPass1!')
    resp = client.post(
        f'/bookings/{booking.booking_id}/approve',
        follow_redirects=True
    )
    assert b'Booking approved successfully!' in resp.data

    with app.app_context():
        persisted = BookingDAL.get_booking_by_id(booking.booking_id)
        assert persisted.status == 'approved'


def test_admin_override_is_logged(client, app):
    with app.app_context():
        owner = _create_user('Owner', 'owner.log@iu.edu', 'staff')
        admin = _create_user('Admin Logger', 'admin.logger@iu.edu', 'admin')
        student = _create_user('Student Logger', 'student.logger@iu.edu', 'student')
        resource = _create_resource(owner.user_id, 'Override Studio')
        start, end, _, _ = _future_slot()
        booking = BookingDAL.create_booking(
            resource_id=resource.resource_id,
            requester_id=student.user_id,
            start_datetime=start,
            end_datetime=end,
            status='pending'
        )

    _login(client, 'admin.logger@iu.edu', 'StrongPass1!')
    client.post(f'/bookings/{booking.booking_id}/approve', follow_redirects=True)

    with app.app_context():
        entries = AdminLogDAL.recent(5)
        assert any('booking_approve_override' in entry['action'] for entry in entries)


def test_staff_dashboard_limits_resources_to_ownership(client, app):
    with app.app_context():
        staff_one = _create_user('Staff One', 'staff.one@iu.edu', 'staff')
        staff_two = _create_user('Staff Two', 'staff.two@iu.edu', 'staff')
        student = _create_user('Student', 'dashboard.student@iu.edu', 'student')
        resource_one = _create_resource(staff_one.user_id, 'Staff One Lab')
        resource_two = _create_resource(staff_two.user_id, 'Staff Two Studio')
        start, end, _, _ = _future_slot()
        BookingDAL.create_booking(
            resource_id=resource_one.resource_id,
            requester_id=student.user_id,
            start_datetime=start,
            end_datetime=end,
            status='pending'
        )
        BookingDAL.create_booking(
            resource_id=resource_two.resource_id,
            requester_id=student.user_id,
            start_datetime=start + timedelta(hours=2),
            end_datetime=end + timedelta(hours=2),
            status='pending'
        )

    _login(client, 'staff.one@iu.edu', 'StrongPass1!')
    resp = client.get('/dashboard')
    assert resp.status_code == 200
    assert b'Staff One Lab' in resp.data
    assert b'Staff Two Studio' not in resp.data


def test_student_dashboard_shows_only_own_bookings(client, app):
    with app.app_context():
        owner = _create_user('Owner', 'owner.dashboard@iu.edu', 'staff')
        student_one = _create_user('Student One', 'student.one@iu.edu', 'student')
        student_two = _create_user('Student Two', 'student.two@iu.edu', 'student')
        resource_alpha = _create_resource(owner.user_id, 'Alpha Venue')
        resource_beta = _create_resource(owner.user_id, 'Beta Venue')
        start, end, _, _ = _future_slot()
        BookingDAL.create_booking(
            resource_id=resource_alpha.resource_id,
            requester_id=student_one.user_id,
            start_datetime=start,
            end_datetime=end,
            status='pending'
        )
        BookingDAL.create_booking(
            resource_id=resource_beta.resource_id,
            requester_id=student_two.user_id,
            start_datetime=start + timedelta(hours=2),
            end_datetime=end + timedelta(hours=2),
            status='pending'
        )

    _login(client, 'student.one@iu.edu', 'StrongPass1!')
    resp = client.get('/dashboard')
    assert resp.status_code == 200
    assert b'Alpha Venue' in resp.data
    assert b'Beta Venue' not in resp.data
