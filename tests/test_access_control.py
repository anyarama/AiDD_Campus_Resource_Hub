from datetime import datetime, timedelta, timezone

from src.data_access.booking_dal import BookingDAL
from src.data_access.resource_dal import ResourceDAL
from src.data_access.user_dal import UserDAL


def _login(client, email, password):
    return client.post(
        '/auth/login',
        data={'email': email, 'password': password},
        follow_redirects=True
    )


def test_staff_cannot_access_admin_dashboard(client):
    login_resp = _login(client, 'staff@iu.edu', 'StaffPass1!')
    assert login_resp.status_code == 200

    resp = client.get('/admin/', follow_redirects=True)
    assert resp.status_code == 200
    assert b'Admin access required' in resp.data


def test_student_can_access_resource_creation(client):
    login_resp = _login(client, 'student@iu.edu', 'StudentPass1!')
    assert login_resp.status_code == 200

    resp = client.get('/resources/create', follow_redirects=True)
    assert resp.status_code == 200
    # Students can now create resources, so verify the create form is accessible
    assert b'Add resource' in resp.data or b'Create' in resp.data


def test_staff_cannot_manage_foreign_booking(client, app):
    with app.app_context():
        owner = UserDAL.create_user(
            name='Lab Owner',
            email='owner.staff@iu.edu',
            password='StrongPass1!',
            role='staff',
            department='Labs'
        )
        other_staff = UserDAL.create_user(
            name='Other Staff',
            email='other.staff@iu.edu',
            password='StrongPass1!',
            role='staff',
            department='Operations'
        )
        student = UserDAL.create_user(
            name='Student Booker',
            email='student.booker@iu.edu',
            password='StrongPass1!',
            role='student',
            department='Business'
        )
        resource = ResourceDAL.create_resource(
            owner_id=owner.user_id,
            title='Innovation Lab',
            description='Collaborative lab space.',
            category='Lab Equipment',
            location='Innovation Hall',
            capacity=12,
            images=None,
            equipment='3D printers',
            availability_rules='Weekdays 9-5',
            is_restricted=False,
            status='published'
        )
        base = datetime.now(timezone.utc)
        start = (base + timedelta(days=1)).replace(tzinfo=None)
        end = (base + timedelta(days=1, hours=1)).replace(tzinfo=None)
        booking = BookingDAL.create_booking(
            resource_id=resource.resource_id,
            requester_id=student.user_id,
            start_datetime=start,
            end_datetime=end,
            status='pending'
        )

    _login(client, 'other.staff@iu.edu', 'StrongPass1!')

    detail_resp = client.get(f'/bookings/{booking.booking_id}', follow_redirects=True)
    assert b'You do not have permission to view this booking' in detail_resp.data

    approve_resp = client.post(
        f'/bookings/{booking.booking_id}/approve',
        follow_redirects=True
    )
    assert b'You do not have permission to approve this booking' in approve_resp.data

    with app.app_context():
        persisted = BookingDAL.get_booking_by_id(booking.booking_id)
        assert persisted.status == 'pending'
