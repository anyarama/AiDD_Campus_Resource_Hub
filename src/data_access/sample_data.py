"""
Sample data helpers
Populate the database with Indiana University Bloomington themed content for demos.
"""
import json
from datetime import datetime, timedelta
from src.data_access.user_dal import UserDAL
from src.data_access.resource_dal import ResourceDAL
from src.data_access.message_dal import MessageDAL
from src.data_access.review_dal import ReviewDAL
from src.data_access.booking_dal import BookingDAL
from src.data_access.waitlist_dal import WaitlistDAL
from src.data_access import get_db


SAMPLE_USERS = [
    {
        'name': 'admin',
        'email': 'admin@iu.edu',
        'password': 'AdminPass1!',
        'role': 'admin',
        'department': 'Office of the Provost'
    },
    {
        'name': 'staff',
        'email': 'staff@iu.edu',
        'password': 'StaffPass1!',
        'role': 'staff',
        'department': 'Campus Operations'
    },
    {
        'name': 'student',
        'email': 'student@iu.edu',
        'password': 'StudentPass1!',
        'role': 'student',
        'department': 'Kelley School of Business'
    },
    {
        'name': 'student1',
        'email': 'student1@iu.edu',
        'password': 'StudentPass1!',
        'role': 'student',
        'department': 'School of Informatics'
    },
    {
        'name': 'staff1',
        'email': 'staff1@iu.edu',
        'password': 'StaffPass1!',
        'role': 'staff',
        'department': 'Department of Computer Science'
    }
]

SAMPLE_RESOURCES = [
    {
        'title': 'Wells Library West Tower Study Suite',
        'description': (
            'Glass-enclosed study suite on the 6th floor of the Herman B Wells Library with dual monitors, '
            'ceiling mounted microphones, and soft seating for collaborative group work.'
        ),
        'category': 'Study Room',
        'location': 'Herman B Wells Library, West Tower Level 6, Bloomington, IN 47405',
        'capacity': 10,
        'equipment': 'Dual 32" displays, HDMI/USB-C, movable whiteboards, Zoom Room kit',
        'availability_rules': 'Sunday–Thursday 7:00 AM – 11:00 PM | Friday–Saturday 7:00 AM – 8:00 PM',
        'availability_schedule': {
            'monday': [{'start': '07:00', 'end': '23:00'}],
            'tuesday': [{'start': '07:00', 'end': '23:00'}],
            'wednesday': [{'start': '07:00', 'end': '23:00'}],
            'thursday': [{'start': '07:00', 'end': '23:00'}],
            'friday': [{'start': '07:00', 'end': '20:00'}],
            'saturday': [{'start': '07:00', 'end': '20:00'}],
            'sunday': [{'start': '07:00', 'end': '23:00'}]
        },
        'is_restricted': False,
        'owner_email': 'staff@iu.edu',
        'images': 'images/wells.jpg'
    },
    {
        'title': 'Luddy School Prototyping Lab',
        'description': (
            'Hands-on prototyping lab featuring Prusa MK3 3D printers, laser cutters, soldering benches, and '
            'trained student mentors. Safety orientation required for first-time users.'
        ),
        'category': 'Lab Equipment',
        'location': 'Luddy Hall, 700 N Woodlawn Ave, Bloomington, IN 47408',
        'capacity': 24,
        'equipment': '3D printers, Glowforge laser cutter, PCB rework station, Oculus headsets',
        'availability_rules': 'Weekdays 9:00 AM – 9:00 PM with staff present; reservations limited to 3 hours',
        'availability_schedule': {
            'monday': [{'start': '09:00', 'end': '21:00'}],
            'tuesday': [{'start': '09:00', 'end': '21:00'}],
            'wednesday': [{'start': '09:00', 'end': '21:00'}],
            'thursday': [{'start': '09:00', 'end': '21:00'}],
            'friday': [{'start': '09:00', 'end': '21:00'}],
            'saturday': [],
            'sunday': []
        },
        'is_restricted': True,
        'owner_email': 'staff@iu.edu',
        'images': 'images/luddy.jpg'
    },
    {
        'title': 'IU Auditorium Main Stage',
        'description': (
            'Iconic performance venue suited for large lectures, concerts, and ceremonies. Includes stage lighting, '
            'full sound reinforcement, and backstage green rooms.'
        ),
        'category': 'Event Space',
        'location': '1211 E 7th St, Bloomington, IN 47405',
        'capacity': 3200,
        'equipment': 'Concert-grade audio, theatrical lighting, dual projection, Steinway grand piano',
        'availability_rules': 'Submit requests at least 14 days in advance; staff approval required',
        'availability_schedule': {
            'monday': [{'start': '08:00', 'end': '22:00'}],
            'tuesday': [{'start': '08:00', 'end': '22:00'}],
            'wednesday': [{'start': '08:00', 'end': '22:00'}],
            'thursday': [{'start': '08:00', 'end': '22:00'}],
            'friday': [{'start': '08:00', 'end': '22:00'}],
            'saturday': [{'start': '10:00', 'end': '22:00'}],
            'sunday': [{'start': '10:00', 'end': '22:00'}]
        },
        'is_restricted': True,
        'owner_email': 'admin@iu.edu',
        'images': 'images/auditorium.jpg'
    },
    {
        'title': 'Kelley School Podcast Studio',
        'description': (
            'Sound-treated recording studio with RODECaster Pro II mixer, dynamic microphones, and video capture '
            'lighting for polished podcasts or interview content.'
        ),
        'category': 'AV Equipment',
        'location': 'Hodge Hall 2030, Kelley School of Business, Bloomington, IN 47405',
        'capacity': 6,
        'equipment': 'RODECaster Pro II, Shure SM7B mics, 4K PTZ camera, acoustic treatment, lighting grid',
        'availability_rules': 'Bookings auto-approved for staff; students require a Kelley faculty sponsor',
        'availability_schedule': {
            'monday': [{'start': '08:00', 'end': '20:00'}],
            'tuesday': [{'start': '08:00', 'end': '20:00'}],
            'wednesday': [{'start': '08:00', 'end': '20:00'}],
            'thursday': [{'start': '08:00', 'end': '20:00'}],
            'friday': [{'start': '08:00', 'end': '20:00'}],
            'saturday': [{'start': '10:00', 'end': '18:00'}],
            'sunday': []
        },
        'is_restricted': True,
        'owner_email': 'admin@iu.edu',
        'images': 'images/podcast.jpg'
    },
    {
        'title': 'SRSC Court 6 (Recreation Pickup)',
        'description': (
            'Multi-purpose hardwood court inside the Student Recreational Sports Center ideal for club practices or '
            'intramural tournaments. Portable bleachers available upon request.'
        ),
        'category': 'Event Space',
        'location': 'SRSC, 1025 E 7th St, Bloomington, IN 47405',
        'capacity': 150,
        'equipment': 'Scoreboard, portable PA, divider netting, rolling bleachers',
        'availability_rules': 'Bookings available in 90-minute blocks; facility team confirms within 2 business days',
        'availability_schedule': {
            'monday': [{'start': '06:00', 'end': '23:00'}],
            'tuesday': [{'start': '06:00', 'end': '23:00'}],
            'wednesday': [{'start': '06:00', 'end': '23:00'}],
            'thursday': [{'start': '06:00', 'end': '23:00'}],
            'friday': [{'start': '06:00', 'end': '23:00'}],
            'saturday': [{'start': '08:00', 'end': '22:00'}],
            'sunday': [{'start': '08:00', 'end': '22:00'}]
        },
        'is_restricted': False,
        'owner_email': 'staff@iu.edu',
        'images': 'images/srsc.jpg'
    },
    {
        'title': 'IMU Georgian Room Collaboration Hall',
        'description': (
            'Recently renovated Georgian Room inside the Indiana Memorial Union featuring flexible seating, '
            'ceiling mounted projectors, and adjacent catering support for design sprints or leadership offsites.'
        ),
        'category': 'Event Space',
        'location': '900 E 7th St, Bloomington, IN 47405',
        'capacity': 120,
        'equipment': 'Dual laser projectors, zoned audio, modular tables, on-call catering',
        'availability_rules': 'Reservations approved by the IMU events desk; submit at least 7 days ahead',
        'availability_schedule': {
            'monday': [{'start': '08:00', 'end': '22:00'}],
            'tuesday': [{'start': '08:00', 'end': '22:00'}],
            'wednesday': [{'start': '08:00', 'end': '22:00'}],
            'thursday': [{'start': '08:00', 'end': '22:00'}],
            'friday': [{'start': '08:00', 'end': '22:00'}],
            'saturday': [{'start': '09:00', 'end': '20:00'}],
            'sunday': [{'start': '09:00', 'end': '20:00'}]
        },
        'is_restricted': True,
        'owner_email': 'staff@iu.edu',
        'images': 'images/georgian.jpg'
    }
]

DRAFT_RESOURCES = [
    {
        'title': 'Music Practice Room 205',
        'description': (
            'Soundproof practice room with upright piano, music stands, and recording equipment. '
            'Ideal for individual or small group rehearsals.'
        ),
        'category': 'Study Room',
        'location': 'Simon Music Library, 2nd Floor, Bloomington, IN 47405',
        'capacity': 4,
        'equipment': 'Upright piano, music stands, basic recording setup',
        'availability_rules': 'Available during library hours. Booking required 24 hours in advance.',
        'is_restricted': False,
        'owner_email': 'staff@iu.edu',
        'images': None,
        'status': 'draft'
    },
    {
        'title': 'Chemistry Lab Equipment Set',
        'description': (
            'Portable chemistry lab equipment including microscopes, beakers, and safety equipment. '
            'Requires faculty supervision for student use.'
        ),
        'category': 'Lab Equipment',
        'location': 'Chemistry Building, Room 312, Bloomington, IN 47405',
        'capacity': 8,
        'equipment': 'Microscopes, glassware, safety equipment, digital scales',
        'availability_rules': 'Weekdays only. Faculty approval required.',
        'is_restricted': True,
        'owner_email': 'staff1@iu.edu',
        'images': None,
        'status': 'draft'
    },
    {
        'title': 'Outdoor Amphitheater',
        'description': (
            'Open-air amphitheater with stage and seating for outdoor events, performances, and gatherings. '
            'Weather-dependent availability.'
        ),
        'category': 'Event Space',
        'location': 'Dunn Meadow, Near Sample Gates, Bloomington, IN 47405',
        'capacity': 500,
        'equipment': 'Stage, sound system, lighting (weather permitting)',
        'availability_rules': 'Seasonal availability. Requires event permit and weather backup plan.',
        'is_restricted': True,
        'owner_email': 'admin@iu.edu',
        'images': None,
        'status': 'draft'
    },
    {
        'title': 'Video Production Studio',
        'description': (
            'Professional video production studio with green screen, lighting kit, and editing workstations. '
            'Suitable for video projects, interviews, and content creation.'
        ),
        'category': 'AV Equipment',
        'location': 'Franklin Hall, Media Production Lab, Bloomington, IN 47405',
        'capacity': 6,
        'equipment': 'Green screen, professional lighting, 4K cameras, editing stations',
        'availability_rules': 'Training session required for first-time users. Book in 2-hour blocks.',
        'is_restricted': True,
        'owner_email': 'staff@iu.edu',
        'images': None,
        'status': 'draft'
    },
    {
        'title': 'Fitness Equipment Rental',
        'description': (
            'Portable fitness equipment available for checkout including weights, yoga mats, and resistance bands. '
            'Perfect for outdoor fitness classes or home workouts.'
        ),
        'category': 'Equipment',
        'location': 'SRSC Equipment Desk, 1025 E 7th St, Bloomington, IN 47405',
        'capacity': 20,
        'equipment': 'Dumbbells, yoga mats, resistance bands, kettlebells',
        'availability_rules': 'Available for 7-day checkout periods. Equipment must be returned clean.',
        'is_restricted': False,
        'owner_email': 'staff@iu.edu',
        'images': None,
        'status': 'draft'
    },
    {
        'title': 'Collaborative Workspace - Innovation Hub',
        'description': (
            'Modern collaborative workspace designed for innovation and entrepreneurship projects. '
            'Features whiteboard walls, flexible furniture, and presentation technology.'
        ),
        'category': 'Study Room',
        'location': 'Innovation Center, 3rd Floor, Bloomington, IN 47405',
        'capacity': 15,
        'equipment': 'Interactive whiteboards, projection system, modular furniture',
        'availability_rules': 'Open to students and faculty. Priority given to innovation projects.',
        'is_restricted': False,
        'owner_email': 'staff1@iu.edu',
        'images': None,
        'status': 'draft'
    }
]

SAMPLE_MESSAGES = [
    {
        'resource_title': 'Wells Library West Tower Study Suite',
        'messages': [
            {
                'sender': 'student@iu.edu',
                'receiver': 'staff@iu.edu',
                'content': 'Hi! Could my capstone team reserve the Wells suite on Thursday evening for a design sprint?'
            },
            {
                'sender': 'staff@iu.edu',
                'receiver': 'student@iu.edu',
                'content': 'Absolutely. I blocked 6–8 PM for you and added the rolling whiteboard you requested.'
            },
            {
                'sender': 'student@iu.edu',
                'receiver': 'staff@iu.edu',
                'content': 'Perfect, thank you for the quick turnaround!'
            }
        ]
    },
    {
        'resource_title': 'IU Auditorium Main Stage',
        'messages': [
            {
                'sender': 'staff@iu.edu',
                'receiver': 'admin@iu.edu',
                'content': 'Our leadership forum wants the main stage on March 8. Is that date free?'
            },
            {
                'sender': 'admin@iu.edu',
                'receiver': 'staff@iu.edu',
                'content': 'March 8 works. I will connect you with production support for lights and livestream setup.'
            }
        ]
    },
    {
        'resource_title': 'SRSC Court 6 (Recreation Pickup)',
        'messages': [
            {
                'sender': 'student@iu.edu',
                'receiver': 'staff@iu.edu',
                'content': 'Could Hoosier eSports reserve Court 6 next Friday for a charity dodgeball event?'
            },
            {
                'sender': 'staff@iu.edu',
                'receiver': 'student@iu.edu',
                'content': 'That sounds fun! Court 6 is free after 8 PM. Please submit the booking with the expected headcount.'
            }
        ]
    },
    {
        'resource_title': 'Kelley School Podcast Studio',
        'messages': [
            {
                'sender': 'admin@iu.edu',
                'receiver': 'student@iu.edu',
                'content': 'You are approved for the podcast studio at 2 PM. Do you need an operator on site?'
            },
            {
                'sender': 'student@iu.edu',
                'receiver': 'admin@iu.edu',
                'content': 'Thank you! A quick orientation when we arrive would be perfect.'
            }
        ]
    },
    {
        'resource_title': 'Luddy School Prototyping Lab',
        'messages': [
            {
                'sender': 'staff@iu.edu',
                'receiver': 'admin@iu.edu',
                'content': 'We have a wave of capstone builds coming. May we extend lab hours next Wednesday?'
            },
            {
                'sender': 'admin@iu.edu',
                'receiver': 'staff@iu.edu',
                'content': 'Approved. I noted the change on the resource page so students see the extra availability.'
            }
        ]
    },
    {
        'resource_title': 'IMU Georgian Room Collaboration Hall',
        'messages': [
            {
                'sender': 'student@iu.edu',
                'receiver': 'staff@iu.edu',
                'content': 'Could we host the student leadership retreat in the Georgian Room next month?'
            },
            {
                'sender': 'staff@iu.edu',
                'receiver': 'student@iu.edu',
                'content': 'Yes, submit the booking so we can loop in IMU catering. I will earmark the date until paperwork arrives.'
            }
        ]
    }
]

SAMPLE_REVIEWS = [
    {
        'resource_title': 'Wells Library West Tower Study Suite',
        'reviews': [
            {
                'reviewer': 'student@iu.edu',
                'rating': 5,
                'comment': 'Amazing view of campus and plenty of screens for hybrid collaboration.'
            },
            {
                'reviewer': 'staff@iu.edu',
                'rating': 4,
                'comment': 'Technology is solid, just book a little early because it fills fast.'
            }
        ]
    },
    {
        'resource_title': 'Luddy School Prototyping Lab',
        'reviews': [
            {
                'reviewer': 'student@iu.edu',
                'rating': 5,
                'comment': 'Mentors walked us through laser cutter safety and we finished our mock-up in one sitting.'
            }
        ]
    },
    {
        'resource_title': 'IU Auditorium Main Stage',
        'reviews': [
            {
                'reviewer': 'staff@iu.edu',
                'rating': 5,
                'comment': 'Production support was flawless for our leadership summit.'
            },
            {
                'reviewer': 'admin@iu.edu',
                'rating': 4,
                'comment': 'Acoustics are great, but schedule well ahead to coordinate crews.'
            }
        ]
    },
    {
        'resource_title': 'Kelley School Podcast Studio',
        'reviews': [
            {
                'reviewer': 'student@iu.edu',
                'rating': 5,
                'comment': 'Studio lighting and audio chain made our podcast sound professional.'
            }
        ]
    },
    {
        'resource_title': 'SRSC Court 6 (Recreation Pickup)',
        'reviews': [
            {
                'reviewer': 'student@iu.edu',
                'rating': 4,
                'comment': 'Plenty of bleachers and the staff helped with setup.'
            }
        ]
    },
    {
        'resource_title': 'IMU Georgian Room Collaboration Hall',
        'reviews': [
            {
                'reviewer': 'staff@iu.edu',
                'rating': 5,
                'comment': 'Flexible layout let us run breakout stations without any extra furniture rentals.'
            }
        ]
    }
]


def ensure_sample_content():
    """Create demo users/resources if they do not exist."""
    user_lookup = {}
    for user in SAMPLE_USERS:
        record = UserDAL.get_user_by_email(user['email'])
        if record is None:
            record = UserDAL.create_user(
                name=user['name'],
                email=user['email'],
                password=user['password'],
                role=user['role'],
                department=user['department']
            )
        else:
            # Ensure stored name/role/department stay aligned with the sample expectations
            needs_update = False
            updates = {}
            if record.name != user['name']:
                updates['name'] = user['name']
                needs_update = True
            if record.role != user['role']:
                updates['role'] = user['role']
                needs_update = True
            if user['department'] and record.department != user['department']:
                updates['department'] = user['department']
                needs_update = True
            if needs_update:
                UserDAL.update_user(record.user_id, **updates)
                record = UserDAL.get_user_by_id(record.user_id)
        if record and not getattr(record, 'email_verified', False):
            UserDAL.mark_email_verified(record.user_id)
            record = UserDAL.get_user_by_id(record.user_id)
        user_lookup[user['email']] = record

    created_count = 0
    draft_count = 0
    resource_lookup = {}
    
    # Create published resources
    for resource in SAMPLE_RESOURCES:
        existing = ResourceDAL.get_resource_by_title(resource['title'])
        if existing:
            resource_lookup[resource['title']] = existing
            continue
        owner = user_lookup.get(resource['owner_email'])
        if not owner:
            continue
        
        # Convert availability_schedule dict to JSON string if present
        availability_schedule_json = None
        if 'availability_schedule' in resource and resource['availability_schedule']:
            availability_schedule_json = json.dumps(resource['availability_schedule'])
        
        created = ResourceDAL.create_resource(
            owner_id=owner.user_id,
            title=resource['title'],
            description=resource['description'],
            category=resource['category'],
            location=resource['location'],
            capacity=resource['capacity'],
            images=resource.get('images'),
            equipment=resource['equipment'],
            availability_rules=resource['availability_rules'],
            is_restricted=resource['is_restricted'],
            status='published',
            availability_schedule=availability_schedule_json
        )
        resource_lookup[resource['title']] = created
        created_count += 1

    # Create draft resources
    for resource in DRAFT_RESOURCES:
        existing = ResourceDAL.get_resource_by_title(resource['title'])
        if existing:
            resource_lookup[resource['title']] = existing
            continue
        owner = user_lookup.get(resource['owner_email'])
        if not owner:
            continue
        created = ResourceDAL.create_resource(
            owner_id=owner.user_id,
            title=resource['title'],
            description=resource['description'],
            category=resource['category'],
            location=resource['location'],
            capacity=resource['capacity'],
            images=resource.get('images'),
            equipment=resource['equipment'],
            availability_rules=resource['availability_rules'],
            is_restricted=resource['is_restricted'],
            status='draft'
        )
        resource_lookup[resource['title']] = created
        draft_count += 1

    if not resource_lookup:
        for resource in SAMPLE_RESOURCES:
            existing = ResourceDAL.get_resource_by_title(resource['title'])
            if existing:
                resource_lookup[resource['title']] = existing
        for resource in DRAFT_RESOURCES:
            existing = ResourceDAL.get_resource_by_title(resource['title'])
            if existing:
                resource_lookup[resource['title']] = existing

    seed_sample_messages(user_lookup, resource_lookup)
    seed_sample_reviews(user_lookup, resource_lookup)
    seed_sample_bookings(user_lookup, resource_lookup)
    seed_additional_reviews(user_lookup, resource_lookup)
    seed_additional_messages(user_lookup, resource_lookup)
    seed_notifications(user_lookup, resource_lookup)
    seed_flagged_reviews(user_lookup, resource_lookup)
    seed_flagged_messages(user_lookup, resource_lookup)

    if created_count:
        print(f'[OK] Added {created_count} IU Bloomington sample resources')
    else:
        print('[OK] Sample resources already present')
    
    if draft_count:
        print(f'[OK] Added {draft_count} draft resources')
    else:
        print('[OK] Draft resources already present')


def seed_sample_messages(user_lookup, resource_lookup):
    """Populate demo message threads if they have not been seeded yet."""
    for convo in SAMPLE_MESSAGES:
        resource = resource_lookup.get(convo['resource_title'])
        if not resource or not convo['messages']:
            continue

        first_msg = convo['messages'][0]
        sender = user_lookup.get(first_msg['sender'])
        receiver = user_lookup.get(first_msg['receiver'])
        if not sender or not receiver:
            continue

        thread_id = MessageDAL.ensure_thread(sender.user_id, receiver.user_id, resource.resource_id)
        existing_messages = MessageDAL.get_thread_messages(thread_id)
        if existing_messages:
            continue

        for message in convo['messages']:
            sender_user = user_lookup.get(message['sender'])
            receiver_user = user_lookup.get(message['receiver'])
            if not sender_user or not receiver_user:
                continue
            MessageDAL.create_message(
                sender_id=sender_user.user_id,
                receiver_id=receiver_user.user_id,
                content=message['content'],
                thread_id=thread_id,
                resource_id=resource.resource_id
            )


def seed_sample_reviews(user_lookup, resource_lookup):
    """Populate a baseline set of reviews for demo resources."""
    for entry in SAMPLE_REVIEWS:
        resource = resource_lookup.get(entry['resource_title'])
        if not resource:
            continue
        existing_reviews = ReviewDAL.get_reviews_by_resource(resource.resource_id)
        if existing_reviews:
            continue

        for review in entry.get('reviews', []):
            reviewer = user_lookup.get(review['reviewer'])
            if not reviewer:
                continue
            ReviewDAL.create_review(
                resource_id=resource.resource_id,
                reviewer_id=reviewer.user_id,
                rating=review['rating'],
                comment=review.get('comment')
            )


def seed_sample_bookings(user_lookup, resource_lookup):
    """Create bookings for each resource with various statuses."""
    now = datetime.now()
    
    # Get all resources
    all_resources = ResourceDAL.get_all_resources(status='published')
    if not all_resources:
        return
    
    # Get users
    admin = user_lookup.get('admin@iu.edu')
    staff = user_lookup.get('staff@iu.edu')
    student = user_lookup.get('student@iu.edu')
    student1 = user_lookup.get('student1@iu.edu')
    staff1 = user_lookup.get('staff1@iu.edu')
    
    if not all([admin, staff, student]):
        return
    
    booking_count = 0
    
    for resource in all_resources:
        # Check if we've already seeded bookings for this resource
        # (check for a completed booking from student as a marker)
        existing_bookings = BookingDAL.get_bookings_by_resource(resource.resource_id)
        has_seeded = any(b.requester_id == student.user_id and b.status == 'completed' for b in existing_bookings)
        if has_seeded:
            continue
        
        # Create bookings with different statuses
        # Past completed booking
        past_start = now - timedelta(days=7)
        past_end = past_start + timedelta(hours=2)
        BookingDAL.create_booking(
            resource_id=resource.resource_id,
            requester_id=student.user_id,
            start_datetime=past_start,
            end_datetime=past_end,
            status='completed'
        )
        booking_count += 1
        
        # Upcoming approved booking
        future_start = now + timedelta(days=3)
        future_end = future_start + timedelta(hours=2)
        booking = BookingDAL.create_booking(
            resource_id=resource.resource_id,
            requester_id=student.user_id,
            start_datetime=future_start,
            end_datetime=future_end,
            status='approved'
        )
        if booking and resource.is_restricted:
            # Add decision notes for restricted resource approval
            BookingDAL.update_booking_status(
                booking.booking_id,
                'approved',
                decision_notes='Approved for student project',
                decision_by=staff.user_id if resource.owner_id == staff.user_id else admin.user_id
            )
        booking_count += 1
        
        # Pending booking (for restricted resources, this will show pending approval)
        pending_start = now + timedelta(days=5)
        pending_end = pending_start + timedelta(hours=1.5)
        if resource.is_restricted:
            # Create pending booking for restricted resource
            BookingDAL.create_booking(
                resource_id=resource.resource_id,
                requester_id=student1.user_id if student1 else student.user_id,
                start_datetime=pending_start,
                end_datetime=pending_end,
                status='pending'
            )
            booking_count += 1
        else:
            # Auto-approved for non-restricted
            BookingDAL.create_booking(
                resource_id=resource.resource_id,
                requester_id=student1.user_id if student1 else student.user_id,
                start_datetime=pending_start,
                end_datetime=pending_end,
                status='approved'
            )
            booking_count += 1
        
        # Another upcoming booking from staff
        staff_start = now + timedelta(days=7)
        staff_end = staff_start + timedelta(hours=3)
        BookingDAL.create_booking(
            resource_id=resource.resource_id,
            requester_id=staff1.user_id if staff1 else staff.user_id,
            start_datetime=staff_start,
            end_datetime=staff_end,
            status='approved'
        )
        booking_count += 1
        
        # Cancelled booking
        cancelled_start = now + timedelta(days=8)
        cancelled_end = cancelled_start + timedelta(hours=2)
        cancelled_booking = BookingDAL.create_booking(
            resource_id=resource.resource_id,
            requester_id=student.user_id,
            start_datetime=cancelled_start,
            end_datetime=cancelled_end,
            status='cancelled'
        )
        booking_count += 1
        
        # Rejected booking (for restricted resources)
        if resource.is_restricted:
            rejected_start = now + timedelta(days=9)
            rejected_end = rejected_start + timedelta(hours=3)
            rejected_booking = BookingDAL.create_booking(
                resource_id=resource.resource_id,
                requester_id=student1.user_id if student1 else student.user_id,
                start_datetime=rejected_start,
                end_datetime=rejected_end,
                status='rejected'
            )
            if rejected_booking:
                BookingDAL.update_booking_status(
                    rejected_booking.booking_id,
                    'rejected',
                    decision_notes='Requested time slot conflicts with maintenance schedule',
                    decision_by=staff.user_id if resource.owner_id == staff.user_id else admin.user_id
                )
            booking_count += 1
            
            # Recurring booking (weekly for 4 weeks)
            recurring_start = now + timedelta(days=14)
            recurring_end = recurring_start + timedelta(hours=2)
            occurrences = []
            for week in range(4):
                week_start = recurring_start + timedelta(weeks=week)
                week_end = recurring_end + timedelta(weeks=week)
                occurrences.append((week_start, week_end))
            
            BookingDAL.create_recurring_bookings(
                resource_id=resource.resource_id,
                requester_id=staff.user_id,
                occurrences=occurrences,
                status='approved',
                recurrence_rule='FREQ=WEEKLY;COUNT=4'
            )
            booking_count += len(occurrences)
        
        # For restricted resources, create waitlist entries
        if resource.is_restricted:
            waitlist_start = now + timedelta(days=10)
            waitlist_end = waitlist_start + timedelta(hours=2)
            WaitlistDAL.create_entry(
                resource_id=resource.resource_id,
                requester_id=student.user_id,
                start_datetime=waitlist_start,
                end_datetime=waitlist_end
            )
            
            # Another waitlist entry
            waitlist_start2 = now + timedelta(days=12)
            waitlist_end2 = waitlist_start2 + timedelta(hours=1.5)
            WaitlistDAL.create_entry(
                resource_id=resource.resource_id,
                requester_id=student1.user_id if student1 else student.user_id,
                start_datetime=waitlist_start2,
                end_datetime=waitlist_end2
            )
    
    if booking_count > 0:
        print(f'[OK] Created {booking_count} sample bookings')


def seed_additional_reviews(user_lookup, resource_lookup):
    """Add more reviews for each resource from different users."""
    all_resources = ResourceDAL.get_all_resources(status='published')
    if not all_resources:
        return
    
    student = user_lookup.get('student@iu.edu')
    staff = user_lookup.get('staff@iu.edu')
    admin = user_lookup.get('admin@iu.edu')
    student1 = user_lookup.get('student1@iu.edu')
    staff1 = user_lookup.get('staff1@iu.edu')
    
    review_count = 0
    
    # Additional reviews for each resource
    additional_reviews = {
        'Wells Library West Tower Study Suite': [
            {'reviewer': 'student1@iu.edu', 'rating': 5, 'comment': 'Perfect for group projects! The dual monitors are a game changer.'},
            {'reviewer': 'staff1@iu.edu', 'rating': 4, 'comment': 'Great space, but can get noisy during peak hours.'}
        ],
        'Luddy School Prototyping Lab': [
            {'reviewer': 'student1@iu.edu', 'rating': 5, 'comment': 'The 3D printers are amazing! Staff is super helpful.'},
            {'reviewer': 'staff1@iu.edu', 'rating': 5, 'comment': 'Excellent facility for rapid prototyping.'}
        ],
        'IU Auditorium Main Stage': [
            {'reviewer': 'student@iu.edu', 'rating': 5, 'comment': 'Incredible venue for our graduation ceremony!'},
            {'reviewer': 'student1@iu.edu', 'rating': 4, 'comment': 'Great acoustics, but booking process takes time.'}
        ],
        'Kelley School Podcast Studio': [
            {'reviewer': 'student1@iu.edu', 'rating': 5, 'comment': 'Professional quality audio. Highly recommend!'},
            {'reviewer': 'staff1@iu.edu', 'rating': 5, 'comment': 'Best podcast studio on campus.'}
        ],
        'SRSC Court 6 (Recreation Pickup)': [
            {'reviewer': 'student1@iu.edu', 'rating': 4, 'comment': 'Great for basketball practice. Court is well maintained.'},
            {'reviewer': 'staff1@iu.edu', 'rating': 4, 'comment': 'Good space for team activities.'}
        ],
        'IMU Georgian Room Collaboration Hall': [
            {'reviewer': 'student@iu.edu', 'rating': 5, 'comment': 'Perfect for our leadership workshop. Catering was excellent!'},
            {'reviewer': 'student1@iu.edu', 'rating': 5, 'comment': 'Beautiful space with great tech support.'}
        ]
    }
    
    for resource in all_resources:
        reviews_to_add = additional_reviews.get(resource.title, [])
        for review_data in reviews_to_add:
            reviewer = user_lookup.get(review_data['reviewer'])
            if not reviewer:
                continue
            
            # Check if this user already reviewed this resource
            already_reviewed = ReviewDAL.user_has_reviewed(resource.resource_id, reviewer.user_id)
            
            if not already_reviewed:
                ReviewDAL.create_review(
                    resource_id=resource.resource_id,
                    reviewer_id=reviewer.user_id,
                    rating=review_data['rating'],
                    comment=review_data.get('comment')
                )
                review_count += 1
    
    if review_count > 0:
        print(f'[OK] Added {review_count} additional reviews')
    
    # Add reviews for completed bookings
    all_bookings = []
    for resource in all_resources:
        bookings = BookingDAL.get_bookings_by_resource(resource.resource_id)
        all_bookings.extend([(b, resource) for b in bookings if b.status == 'completed'])
    
    completed_review_count = 0
    for booking, resource in all_bookings[:3]:  # Add reviews for first 3 completed bookings
        requester = UserDAL.get_user_by_id(booking.requester_id)
        if requester and not ReviewDAL.user_has_reviewed(resource.resource_id, requester.user_id):
            ReviewDAL.create_review(
                resource_id=resource.resource_id,
                reviewer_id=requester.user_id,
                rating=5,
                comment=f'Great experience using {resource.title}. Everything worked perfectly!'
            )
            completed_review_count += 1
    
    if completed_review_count > 0:
        print(f'[OK] Added {completed_review_count} reviews for completed bookings')


def seed_additional_messages(user_lookup, resource_lookup):
    """Add more message threads between users."""
    all_resources = ResourceDAL.get_all_resources(status='published')
    if not all_resources:
        return
    
    student = user_lookup.get('student@iu.edu')
    staff = user_lookup.get('staff@iu.edu')
    admin = user_lookup.get('admin@iu.edu')
    student1 = user_lookup.get('student1@iu.edu')
    staff1 = user_lookup.get('staff1@iu.edu')
    
    if not all([student, staff]):
        return
    
    message_count = 0
    
    # Additional message threads
    additional_conversations = [
        {
            'resource_title': 'Wells Library West Tower Study Suite',
            'messages': [
                {
                    'sender': 'student1@iu.edu',
                    'receiver': 'staff@iu.edu',
                    'content': 'Hi, I need to book the study suite for a group project next week. Are there any available slots?'
                },
                {
                    'sender': 'staff@iu.edu',
                    'receiver': 'student1@iu.edu',
                    'content': 'Yes, we have availability on Tuesday and Thursday afternoons. Which works better for your group?'
                },
                {
                    'sender': 'student1@iu.edu',
                    'receiver': 'staff@iu.edu',
                    'content': 'Thursday afternoon would be perfect. I\'ll submit the booking request now.'
                }
            ]
        },
        {
            'resource_title': 'Luddy School Prototyping Lab',
            'messages': [
                {
                    'sender': 'student@iu.edu',
                    'receiver': 'staff@iu.edu',
                    'content': 'I\'m interested in using the 3D printer for my capstone project. Do I need any special training?'
                },
                {
                    'sender': 'staff@iu.edu',
                    'receiver': 'student@iu.edu',
                    'content': 'Yes, we require a safety orientation for first-time users. I can schedule that for you.'
                }
            ]
        },
        {
            'resource_title': 'IU Auditorium Main Stage',
            'messages': [
                {
                    'sender': 'staff1@iu.edu',
                    'receiver': 'admin@iu.edu',
                    'content': 'We need the auditorium for a department event next month. Can you check availability?'
                },
                {
                    'sender': 'admin@iu.edu',
                    'receiver': 'staff1@iu.edu',
                    'content': 'I\'ll check the calendar and get back to you by end of day.'
                }
            ]
        },
        {
            'resource_title': 'SRSC Court 6 (Recreation Pickup)',
            'messages': [
                {
                    'sender': 'student1@iu.edu',
                    'receiver': 'staff@iu.edu',
                    'content': 'Can we reserve the court for a basketball tournament this weekend?'
                },
                {
                    'sender': 'staff@iu.edu',
                    'receiver': 'student1@iu.edu',
                    'content': 'The court is available Saturday afternoon. Please submit the booking with expected attendance.'
                }
            ]
        }
    ]
    
    for convo in additional_conversations:
        resource = resource_lookup.get(convo['resource_title'])
        if not resource or not convo['messages']:
            continue
        
        first_msg = convo['messages'][0]
        sender = user_lookup.get(first_msg['sender'])
        receiver = user_lookup.get(first_msg['receiver'])
        if not sender or not receiver:
            continue
        
        thread_id = MessageDAL.ensure_thread(sender.user_id, receiver.user_id, resource.resource_id)
        existing_messages = MessageDAL.get_thread_messages(thread_id)
        if existing_messages:
            continue
        
        for message in convo['messages']:
            sender_user = user_lookup.get(message['sender'])
            receiver_user = user_lookup.get(message['receiver'])
            if not sender_user or not receiver_user:
                continue
            MessageDAL.create_message(
                sender_id=sender_user.user_id,
                receiver_id=receiver_user.user_id,
                content=message['content'],
                thread_id=thread_id,
                resource_id=resource.resource_id
            )
            message_count += 1
    
    if message_count > 0:
        print(f'[OK] Added {message_count} additional messages')


def seed_notifications(user_lookup, resource_lookup):
    """Create sample notifications for users."""
    student = user_lookup.get('student@iu.edu')
    staff = user_lookup.get('staff@iu.edu')
    admin = user_lookup.get('admin@iu.edu')
    student1 = user_lookup.get('student1@iu.edu')
    staff1 = user_lookup.get('staff1@iu.edu')
    
    if not all([student, staff, admin]):
        return
    
    notification_count = 0
    now = datetime.now()
    
    # Create notifications directly in database to avoid app context issues
    notifications = [
        {
            'user': student,
            'subject': 'Booking Approved',
            'body': 'Your booking for Wells Library West Tower Study Suite has been approved for tomorrow at 2:00 PM.',
            'created_at': now - timedelta(hours=2)
        },
        {
            'user': student1,
            'subject': 'New Message',
            'body': 'You have a new message from staff regarding your booking request.',
            'created_at': now - timedelta(hours=5)
        },
        {
            'user': staff,
            'subject': 'New Booking Request',
            'body': 'You have a new pending booking request for Luddy School Prototyping Lab.',
            'created_at': now - timedelta(hours=1)
        },
        {
            'user': staff1,
            'subject': 'Booking Reminder',
            'body': 'Reminder: You have a booking for SRSC Court 6 tomorrow at 3:00 PM.',
            'created_at': now - timedelta(hours=12)
        },
        {
            'user': admin,
            'subject': 'System Update',
            'body': 'New resources have been added to the system. Review and approve as needed.',
            'created_at': now - timedelta(days=1)
        },
        {
            'user': student,
            'subject': 'Review Request',
            'body': 'Please consider leaving a review for your recent booking at Wells Library.',
            'created_at': now - timedelta(days=2)
        }
    ]
    
    with get_db() as conn:
        cursor = conn.cursor()
        for notif in notifications:
            if not notif['user']:
                continue
            created_at = notif.get('created_at', now).isoformat()
            cursor.execute('''
                INSERT INTO notifications (user_id, channel, subject, body, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (notif['user'].user_id, 'email', notif['subject'], notif['body'], 'logged', created_at))
            notification_count += 1
    
    if notification_count > 0:
        print(f'[OK] Created {notification_count} sample notifications')


def seed_flagged_reviews(user_lookup, resource_lookup):
    """Create and flag some reviews for the admin reports dashboard."""
    all_resources = ResourceDAL.get_all_resources(status='published')
    if not all_resources:
        return
    
    admin = user_lookup.get('admin@iu.edu')
    staff = user_lookup.get('staff@iu.edu')
    student = user_lookup.get('student@iu.edu')
    student1 = user_lookup.get('student1@iu.edu')
    
    if not all([admin, staff]):
        return
    
    flagged_count = 0
    
    # Check if we've already seeded flagged reviews
    existing_flagged = ReviewDAL.get_flagged_reviews()
    if existing_flagged:
        return  # Already have flagged reviews
    
    # Create some reviews that will be flagged
    flagged_review_data = [
        {
            'resource_title': 'Wells Library West Tower Study Suite',
            'reviewer': 'student1@iu.edu',
            'rating': 1,
            'comment': 'This place is terrible! Waste of time and money. Staff was rude.',
            'flag_reason': 'Inappropriate language',
            'flagged_by': 'staff@iu.edu'
        },
        {
            'resource_title': 'Luddy School Prototyping Lab',
            'reviewer': 'student@iu.edu',
            'rating': 2,
            'comment': 'Equipment was broken and nobody helped. Very disappointed.',
            'flag_reason': 'Unsubstantiated claims',
            'flagged_by': 'admin@iu.edu'
        },
        {
            'resource_title': 'SRSC Court 6 (Recreation Pickup)',
            'reviewer': 'student1@iu.edu',
            'rating': 1,
            'comment': 'SPAM SPAM SPAM - Click here for free stuff! www.fake-link.com',
            'flag_reason': 'Spam',
            'flagged_by': 'staff@iu.edu'
        },
        {
            'resource_title': 'Kelley School Podcast Studio',
            'reviewer': 'student@iu.edu',
            'rating': 3,
            'comment': 'The audio quality was okay but the lighting needs improvement. Also, the room was a bit cramped.',
            'flag_reason': 'Needs review',
            'flagged_by': 'admin@iu.edu'
        },
        {
            'resource_title': 'IMU Georgian Room Collaboration Hall',
            'reviewer': 'student1@iu.edu',
            'rating': 1,
            'comment': 'This is the worst resource ever! Do not book this!',
            'flag_reason': 'Inappropriate content',
            'flagged_by': 'staff@iu.edu'
        }
    ]
    
    for review_data in flagged_review_data:
        resource = resource_lookup.get(review_data['resource_title'])
        if not resource:
            continue
        
        reviewer = user_lookup.get(review_data['reviewer'])
        if not reviewer:
            continue
        
        # Check if reviewer already reviewed this resource
        already_reviewed = ReviewDAL.user_has_reviewed(resource.resource_id, reviewer.user_id)
        
        if not already_reviewed:
            # Create the review first
            review = ReviewDAL.create_review(
                resource_id=resource.resource_id,
                reviewer_id=reviewer.user_id,
                rating=review_data['rating'],
                comment=review_data.get('comment')
            )
            
            if review:
                # Flag the review
                flagged_by_user = user_lookup.get(review_data['flagged_by'])
                if flagged_by_user:
                    ReviewDAL.flag_review(
                        review_id=review.review_id,
                        flagged_by=flagged_by_user.user_id,
                        reason=review_data['flag_reason']
                    )
                    flagged_count += 1
        else:
            # If review already exists, try to find and flag it
            reviews = ReviewDAL.get_reviews_by_reviewer(reviewer.user_id)
            for review in reviews:
                if review.resource_id == resource.resource_id and not review.is_flagged:
                    flagged_by_user = user_lookup.get(review_data['flagged_by'])
                    if flagged_by_user:
                        ReviewDAL.flag_review(
                            review_id=review.review_id,
                            flagged_by=flagged_by_user.user_id,
                            reason=review_data['flag_reason']
                        )
                        flagged_count += 1
                    break
    
    if flagged_count > 0:
        print(f'[OK] Created {flagged_count} flagged reviews for moderation')


def seed_flagged_messages(user_lookup, resource_lookup):
    """Create and flag some messages for the admin reports dashboard."""
    all_resources = ResourceDAL.get_all_resources(status='published')
    if not all_resources:
        return
    
    admin = user_lookup.get('admin@iu.edu')
    staff = user_lookup.get('staff@iu.edu')
    student = user_lookup.get('student@iu.edu')
    student1 = user_lookup.get('student1@iu.edu')
    
    if not all([admin, staff, student]):
        return
    
    flagged_count = 0
    
    # Check if we've already seeded flagged messages
    existing_flagged = MessageDAL.get_flagged_messages()
    if existing_flagged:
        return  # Already have flagged messages
    
    # Create some messages that will be flagged
    flagged_message_data = [
        {
            'resource_title': 'Wells Library West Tower Study Suite',
            'sender': 'student1@iu.edu',
            'receiver': 'staff@iu.edu',
            'content': 'Hey, can you give me a discount? I know the owner. Also check out my website www.spam-site.com for great deals!',
            'flag_reason': 'Spam',
            'flagged_by': 'staff@iu.edu'
        },
        {
            'resource_title': 'Luddy School Prototyping Lab',
            'sender': 'student@iu.edu',
            'receiver': 'staff@iu.edu',
            'content': 'This is ridiculous! Your equipment is garbage and your staff are incompetent. I demand a refund immediately!',
            'flag_reason': 'Inappropriate language',
            'flagged_by': 'admin@iu.edu'
        },
        {
            'resource_title': 'SRSC Court 6 (Recreation Pickup)',
            'sender': 'student1@iu.edu',
            'receiver': 'staff@iu.edu',
            'content': 'URGENT: Click here now for free money!!! http://scam-link.com/claim',
            'flag_reason': 'Spam',
            'flagged_by': 'staff@iu.edu'
        },
        {
            'resource_title': 'IU Auditorium Main Stage',
            'sender': 'student@iu.edu',
            'receiver': 'admin@iu.edu',
            'content': 'I need to book this for a private event. Can we do it off the books? I can pay cash.',
            'flag_reason': 'Suspicious activity',
            'flagged_by': 'admin@iu.edu'
        },
        {
            'resource_title': 'Kelley School Podcast Studio',
            'sender': 'student1@iu.edu',
            'receiver': 'admin@iu.edu',
            'content': 'You guys are terrible at your jobs. This whole system is broken and you should be fired.',
            'flag_reason': 'Harassment',
            'flagged_by': 'admin@iu.edu'
        },
        {
            'resource_title': 'IMU Georgian Room Collaboration Hall',
            'sender': 'student@iu.edu',
            'receiver': 'staff@iu.edu',
            'content': 'Can you help me with something? I need to access the system admin panel. My password is...',
            'flag_reason': 'Security concern',
            'flagged_by': 'staff@iu.edu'
        }
    ]
    
    for message_data in flagged_message_data:
        resource = resource_lookup.get(message_data['resource_title'])
        if not resource:
            continue
        
        sender = user_lookup.get(message_data['sender'])
        receiver = user_lookup.get(message_data['receiver'])
        if not sender or not receiver:
            continue
        
        # Create the message
        message = MessageDAL.create_message(
            sender_id=sender.user_id,
            receiver_id=receiver.user_id,
            content=message_data['content'],
            resource_id=resource.resource_id
        )
        
        if message:
            # Flag the message
            flagged_by_user = user_lookup.get(message_data['flagged_by'])
            if flagged_by_user:
                MessageDAL.flag_message(
                    message_id=message.message_id,
                    flagged_by=flagged_by_user.user_id,
                    reason=message_data['flag_reason']
                )
                flagged_count += 1
    
    if flagged_count > 0:
        print(f'[OK] Created {flagged_count} flagged messages for moderation')
