from datetime import datetime, timedelta, timezone

from src.data_access.booking_dal import BookingDAL
from src.data_access.resource_dal import ResourceDAL
from src.data_access.user_dal import UserDAL


def test_auth_flow_register_login_dashboard(client):
    register_resp = client.post(
        '/auth/register',
        data={
            'name': 'Integration User',
            'email': 'integration@iu.edu',
            'password': 'StrongPass1',
            'confirm_password': 'StrongPass1',
            'department': 'Science',
            'role': 'student'
        },
        follow_redirects=True
    )
    assert b'Registration successful' in register_resp.data

    login_resp = client.post(
        '/auth/login',
        data={
            'email': 'integration@iu.edu',
            'password': 'StrongPass1',
        },
        follow_redirects=True
    )
    assert b'Welcome back' in login_resp.data

    dashboard_resp = client.get('/dashboard')
    assert dashboard_resp.status_code == 200
    assert b'At a glance' in dashboard_resp.data


def test_register_rejects_non_campus_email(client):
    resp = client.post(
        '/auth/register',
        data={
            'name': 'External User',
            'email': 'external@gmail.com',
            'password': 'StrongPass1',
            'confirm_password': 'StrongPass1',
            'department': 'None',
            'role': 'student'
        },
        follow_redirects=True
    )
    assert b'Registration is limited to iu.edu email addresses' in resp.data


def test_booking_end_to_end(app, client):
    with app.app_context():
        owner = UserDAL.create_user(
            name='Resource Owner',
            email='owner@iu.edu',
            password='StrongPass1',
            role='staff',
            department='Operations'
        )
        resource = ResourceDAL.create_resource(
            owner_id=owner.user_id,
            title='Conference Room A',
            description='Spacious conference room with conferencing equipment.',
            category='Event Space',
            location='Building A',
            capacity=12,
            images=None,
            equipment='Projector, Whiteboard',
            availability_rules='Weekdays 09:00-17:00',
            is_restricted=False,
            status='published'
        )
        resource_id = resource.resource_id

    # Register and log in as requester
    client.post(
        '/auth/register',
        data={
            'name': 'Booking User',
            'email': 'booker@iu.edu',
            'password': 'StrongPass1',
            'confirm_password': 'StrongPass1',
            'department': 'Business',
            'role': 'student'
        },
        follow_redirects=True
    )
    client.post(
        '/auth/login',
        data={
            'email': 'booker@iu.edu',
            'password': 'StrongPass1'
        },
        follow_redirects=True
    )

    start = (datetime.now(timezone.utc) + timedelta(days=1)).replace(minute=0, second=0, microsecond=0, tzinfo=None)
    end = start + timedelta(hours=1)

    # Visit booking page then submit form
    client.get(f'/bookings/create/{resource_id}')
    booking_resp = client.post(
        f'/bookings/create/{resource_id}',
        data={
            'start_datetime': start.strftime('%Y-%m-%dT%H:%M'),
            'end_datetime': end.strftime('%Y-%m-%dT%H:%M'),
            'recurrence_frequency': 'none'
        },
        follow_redirects=True
    )

    assert booking_resp.status_code == 200
    assert b'Booking confirmed' in booking_resp.data or b'Booking request submitted' in booking_resp.data

    with app.app_context():
        bookings = BookingDAL.get_bookings_by_resource(resource_id)
        assert len(bookings) == 1
        assert bookings[0].status in {'approved', 'pending'}


def test_resource_description_sanitized(app, client):
    client.post(
        '/auth/register',
        data={
            'name': 'Owner Sanitizer',
            'email': 'sanitize-owner@iu.edu',
            'password': 'StrongPass1',
            'confirm_password': 'StrongPass1',
            'department': 'IT',
            'role': 'staff'
        },
        follow_redirects=True
    )
    client.post(
        '/auth/login',
        data={
            'email': 'sanitize-owner@iu.edu',
            'password': 'StrongPass1'
        },
        follow_redirects=True
    )

    malicious_description = '<script>alert("xss")</script>Safe description.'
    resp = client.post(
        '/resources/create',
        data={
            'title': 'Secure Lab',
            'description': malicious_description,
            'category': 'Lab Equipment',
            'location': 'Secure Building',
            'capacity': '5',
            'equipment': '',
            'availability_rules': '',
            'status': 'published'
        },
        follow_redirects=True
    )
    assert resp.status_code == 200
    assert b'<script>' not in resp.data
    assert b'Safe description.' in resp.data
