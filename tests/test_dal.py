from datetime import datetime

from src.data_access.booking_dal import BookingDAL
from src.data_access.resource_dal import ResourceDAL
from src.data_access.user_dal import UserDAL


def create_user(email='owner@iu.edu', name='Owner'):
    return UserDAL.create_user(
        name=name,
        email=email,
        password='StrongPass1',
        role='student',
        department='Engineering'
    )


def test_resource_dal_crud(temp_db):
    owner = create_user()

    created = ResourceDAL.create_resource(
        owner_id=owner.user_id,
        title='Campus Auditorium',
        description='Large auditorium with AV support.',
        category='Event Space',
        location='Main Building',
        capacity=250,
        images=None,
        equipment='Projector, Sound System',
        availability_rules='Weekdays 08:00-20:00',
        is_restricted=True,
        status='draft'
    )
    assert created.resource_id is not None

    fetched = ResourceDAL.get_resource_by_id(created.resource_id)
    assert fetched.title == 'Campus Auditorium'
    assert fetched.is_restricted is True

    ResourceDAL.update_resource(created.resource_id, status='published', capacity=300)
    updated = ResourceDAL.get_resource_by_id(created.resource_id)
    assert updated.status == 'published'
    assert updated.capacity == 300

    ResourceDAL.delete_resource(created.resource_id)
    assert ResourceDAL.get_resource_by_id(created.resource_id) is None


def test_sql_injection_guard(temp_db):
    owner = create_user(email='owner2@iu.edu', name='Owner 2')
    resource = ResourceDAL.create_resource(
        owner_id=owner.user_id,
        title='Innovation Lab',
        description='Prototyping lab with 3D printers.',
        category='Lab Equipment',
        location='Innovation Center',
        capacity=20,
        images=None,
        equipment='3D Printer',
        availability_rules=None,
        is_restricted=False,
        status='published'
    )

    malicious = "\"; DROP TABLE resources; --"
    results = ResourceDAL.search_resources(keyword=malicious)
    assert results == []

    # Ensure original resource still exists and table intact
    still_there = ResourceDAL.get_resource_by_id(resource.resource_id)
    assert still_there is not None


def test_booking_dal_roundtrip(temp_db):
    owner = create_user(email='owner3@iu.edu', name='Owner 3')
    requester = create_user(email='booker@iu.edu', name='Booker')
    resource = ResourceDAL.create_resource(
        owner_id=owner.user_id,
        title='Recording Studio',
        description='Soundproof studio for audio recording.',
        category='Other',
        location='Arts Center',
        capacity=4,
        images=None,
        equipment='Microphones',
        availability_rules=None,
        is_restricted=False,
        status='published'
    )

    start = datetime(2025, 3, 3, 14, 0)
    end = datetime(2025, 3, 3, 15, 0)
    booking = BookingDAL.create_booking(
        resource_id=resource.resource_id,
        requester_id=requester.user_id,
        start_datetime=start,
        end_datetime=end,
        status='pending'
    )

    fetched = BookingDAL.get_booking_by_id(booking.booking_id)
    assert fetched is not None
    assert fetched.start_datetime.startswith('2025-03-03T14:00')

    BookingDAL.delete_booking(booking.booking_id)
    assert BookingDAL.get_booking_by_id(booking.booking_id) is None


def test_count_helpers(temp_db):
    student = create_user(email='student.count@iu.edu', name='Student Count')
    staff = UserDAL.create_user(
        name='Staff Count',
        email='staff.count@iu.edu',
        password='StrongPass1',
        role='staff',
        department='Operations'
    )
    admin = UserDAL.create_user(
        name='Admin Count',
        email='admin.count@iu.edu',
        password='StrongPass1',
        role='admin',
        department='IT'
    )

    assert UserDAL.count_users() == 3
    assert UserDAL.count_users(role='student') == 1
    assert UserDAL.count_users(role=['staff', 'admin']) == 2

    published = ResourceDAL.create_resource(
        owner_id=staff.user_id,
        title='Published Lab',
        description='Open access lab.',
        category='Lab Equipment',
        location='Innovation Center',
        capacity=10,
        images=None,
        equipment='3D Printer',
        availability_rules=None,
        is_restricted=False,
        status='published'
    )
    ResourceDAL.create_resource(
        owner_id=staff.user_id,
        title='Draft Studio',
        description='Sound studio still being configured.',
        category='Other',
        location='Arts Building',
        capacity=4,
        images=None,
        equipment='Microphones',
        availability_rules=None,
        is_restricted=False,
        status='draft'
    )

    assert ResourceDAL.count_resources() == 2
    assert ResourceDAL.count_resources(status='published') == 1

    BookingDAL.create_booking(
        resource_id=published.resource_id,
        requester_id=student.user_id,
        start_datetime=datetime(2025, 4, 4, 10, 0),
        end_datetime=datetime(2025, 4, 4, 11, 0),
        status='approved'
    )
    BookingDAL.create_booking(
        resource_id=published.resource_id,
        requester_id=student.user_id,
        start_datetime=datetime(2025, 4, 5, 10, 0),
        end_datetime=datetime(2025, 4, 5, 11, 0),
        status='pending'
    )

    assert BookingDAL.count_bookings() == 2
    assert BookingDAL.count_bookings(status=['approved', 'completed']) == 1


def test_booking_analytics_helpers(temp_db):
    staff = UserDAL.create_user(
        name='Staff Analytics',
        email='staff.analytics@iu.edu',
        password='StrongPass1',
        role='staff',
        department='Operations'
    )
    requester_a = UserDAL.create_user(
        name='Req A',
        email='req.a@iu.edu',
        password='StrongPass1',
        role='student',
        department='Design'
    )
    requester_b = UserDAL.create_user(
        name='Req B',
        email='req.b@iu.edu',
        password='StrongPass1',
        role='student',
        department='Engineering'
    )
    resource = ResourceDAL.create_resource(
        owner_id=staff.user_id,
        title='Analytics Lab',
        description='Metrics friendly lab.',
        category='Lab Equipment',
        location='Center A',
        capacity=6,
        images=None,
        equipment='Monitors',
        availability_rules=None,
        is_restricted=False,
        status='published'
    )
    # Create bookings for different departments
    BookingDAL.create_booking(
        resource_id=resource.resource_id,
        requester_id=requester_a.user_id,
        start_datetime=datetime(2025, 5, 1, 9, 0),
        end_datetime=datetime(2025, 5, 1, 10, 0),
        status='approved'
    )
    BookingDAL.create_booking(
        resource_id=resource.resource_id,
        requester_id=requester_b.user_id,
        start_datetime=datetime(2025, 5, 2, 11, 0),
        end_datetime=datetime(2025, 5, 2, 12, 0),
        status='pending'
    )

    department_usage = BookingDAL.summarize_by_department()
    assert any(row['department'] == 'Design' and row['total'] == 1 for row in department_usage)
    assert any(row['department'] == 'Engineering' and row['total'] == 1 for row in department_usage)

    owner_usage = BookingDAL.summarize_owner_resources(staff.user_id)
    assert owner_usage[0]['title'] == 'Analytics Lab'
    assert owner_usage[0]['total'] == 2
