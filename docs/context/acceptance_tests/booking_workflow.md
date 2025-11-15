# Acceptance Test: Booking Workflow

## Test ID: AT-001
**Feature:** Resource Booking
**Priority:** High
**Status:** Implemented

---

## Scenario 1: Student Books Non-Restricted Resource

### Given
- Student user is logged in
- Resource "Study Room A" is published and non-restricted
- Time slot 2:00 PM - 4:00 PM tomorrow is available

### When
1. Student searches for "Study Room"
2. Clicks on "Study Room A"
3. Selects date: Tomorrow
4. Selects time: 2:00 PM - 4:00 PM
5. Clicks "Book Now"

### Then
- Booking is created with status "approved" (automatic)
- Student sees confirmation message
- Student receives notification
- Booking appears in "My Bookings"
- Resource owner is notified

### Acceptance Criteria
- [ ] Search finds the resource
- [ ] Calendar shows availability
- [ ] Booking completes in < 3 seconds
- [ ] Confirmation displays booking details
- [ ] Email/notification sent to both parties

---

## Scenario 2: Student Requests Restricted Resource

### Given
- Student user is logged in
- Resource "3D Printer Lab" is published and restricted
- Time slot 10:00 AM - 12:00 PM in 2 days is available
- Resource owner is Dr. Martinez (staff)

### When
1. Student searches for "3D Printer"
2. Clicks on "3D Printer Lab"
3. Sees "Requires approval" badge
4. Selects date and time
5. Adds request note: "Need to print senior project prototype"
6. Clicks "Request Booking"

### Then
- Booking is created with status "pending"
- Student sees "Request submitted, awaiting approval"
- Dr. Martinez receives notification
- Booking appears in student's "My Bookings" as "Pending"
- Booking appears in Dr. Martinez's approval queue

### Acceptance Criteria
- [ ] UI clearly indicates approval required
- [ ] Request note field is available
- [ ] Status correctly set to "pending"
- [ ] Owner notified immediately
- [ ] Student can view pending status

---

## Scenario 3: Booking Conflict Detection

### Given
- Resource "Conference Room B" exists
- Existing booking: 1:00 PM - 3:00 PM on Jan 15
- New booking attempt: 2:00 PM - 4:00 PM on Jan 15 (overlaps)

### When
- Student attempts to book overlapping time slot

### Then
- System detects conflict
- Error message: "This resource is already booked for part of the selected time"
- Suggests nearby available times or waitlist option
- Booking is NOT created

### Acceptance Criteria
- [ ] Conflict detected before database insert
- [ ] Clear error message displayed
- [ ] Alternative options suggested
- [ ] No double-booking possible

---

## Scenario 4: Recurring Booking

### Given
- Resource "Tutoring Room" allows recurring bookings
- Student wants weekly session for 4 weeks

### When
1. Student selects "Recurring" option
2. Chooses "Weekly" frequency
3. Sets occurrences: 4
4. Books Monday 3:00 PM - 4:00 PM

### Then
- System creates 4 separate bookings (if no conflicts)
- All show same recurrence rule
- Each can be cancelled independently
- Student sees all 4 in calendar view

### Acceptance Criteria
- [ ] Recurrence UI is clear and intuitive
- [ ] All occurrences checked for conflicts
- [ ] Partial booking if some slots unavailable
- [ ] Calendar shows all occurrences

---

## Test Data Setup

### Users
```python
student = {
    'email': 'alex.chen@iu.edu',
    'role': 'student',
    'name': 'Alex Chen'
}

staff = {
    'email': 'sarah.martinez@iu.edu',
    'role': 'staff',
    'name': 'Dr. Sarah Martinez'
}
```

### Resources
```python
resources = [
    {
        'title': 'Study Room A',
        'category': 'Study Room',
        'is_restricted': False,
        'capacity': 6,
        'owner': staff
    },
    {
        'title': '3D Printer Lab',
        'category': 'Lab Equipment',
        'is_restricted': True,
        'capacity': 4,
        'owner': staff
    }
]
```

---

## Notes for AI Tools

**Context for AI-assisted development:**

When implementing booking features, AI tools should reference:
- User personas (student vs staff workflows)
- Business rules (automatic vs manual approval)
- Conflict detection algorithm requirements
- Notification requirements per persona

**Example AI prompt grounding:**
> "Based on the student persona in `/docs/context/personas/student_persona.md`, implement a booking workflow that completes in under 2 minutes and provides instant feedback for non-restricted resources, as specified in acceptance test AT-001."
