# Acceptance Test Scenarios
## Campus Resource Hub

### Test Scenario 1: Student Books Study Room

**Given**: Sarah (student) is logged in and needs a study room for tomorrow  
**When**: She:
1. Navigates to search page
2. Filters by category "Study Room"
3. Sets date filter to tomorrow 2:00 PM - 4:00 PM
4. Clicks "Book" on an available room
5. Confirms booking details

**Then**: 
- Booking created with status "pending" or "approved" (depending on room settings)
- Confirmation message displayed
- Email notification sent (simulated)
- Room appears as "booked" for that time slot in search
- Sarah can see booking in "My Bookings" dashboard

**Test Data**:
- User: sarah@example.com
- Resource: Study Room 305 (auto-approval enabled)
- Time: Tomorrow 14:00-16:00

**Pass Criteria**: Booking appears in database with correct times, no conflicts allowed

---

### Test Scenario 2: Staff Approves Equipment Request

**Given**: Prof. Martinez (staff) receives booking request for lab microscope  
**When**: He:
1. Logs into staff dashboard
2. Navigates to "Approval Queue"
3. Reviews booking request details (student name, time, purpose)
4. Clicks "Approve"

**Then**:
- Booking status changes from "pending" to "approved"
- Student receives approval notification
- Equipment marked as booked for that time
- Action logged in admin_logs table

**Test Data**:
- Staff: martinez@university.edu
- Resource: Lab Microscope #3
- Requester: student@example.com

**Pass Criteria**: Status transition tracked, notifications sent, time slot blocked

---

### Test Scenario 3: Conflict Detection Prevents Double Booking

**Given**: Room 101 has approved booking 10:00 AM - 12:00 PM  
**When**: Another user attempts to book same room 11:00 AM - 1:00 PM  
**Then**: 
- Booking rejected with error message
- Suggestion to choose different time
- Original booking unaffected
- Conflict logged

**Test Data**:
- Existing booking: 10:00-12:00 (approved)
- New attempt: 11:00-13:00 (should fail)
- Edge case: 12:00-14:00 (should succeed - back-to-back OK)

**Pass Criteria**: Algorithm correctly identifies overlaps, allows adjacent bookings

---

### Test Scenario 4: User Leaves Review After Completed Booking

**Given**: Student completed a booking 2 days ago  
**When**: They:
1. Navigate to "My Bookings" history
2. Click "Leave Review" on completed booking
3. Select 4-star rating
4. Write comment: "Great space, clean and quiet"
5. Submit review

**Then**:
- Review saved with reviewer_id, resource_id, rating, comment
- Resource aggregate rating updated
- Review appears on resource detail page
- User cannot submit duplicate review

**Test Data**:
- Booking status: "completed"
- Rating: 4 stars
- Previous reviews for this resource: 2 (5-star, 3-star)
- New average: (5+3+4)/3 = 4.0 stars

**Pass Criteria**: Unique constraint enforced, aggregate calculated correctly

---

### Test Scenario 5: Admin Suspends Abusive User

**Given**: Admin notices user posting inappropriate reviews  
**When**: Admin:
1. Logs into admin dashboard
2. Searches for user by email
3. Clicks "Suspend User"
4. Confirms suspension with reason

**Then**:
- User account marked as suspended
- User cannot log in (redirect with message)
- Action logged in admin_logs
- Existing bookings/reviews preserved
- Admin can reactivate later

**Test Data**:
- Target user: badactor@example.com
- Reason: "Posted offensive content in reviews"

**Pass Criteria**: User locked out, data retained, action audited

---

**Test Execution**: Manual testing during development, automated tests in CI/CD (future)  
**Coverage Goal**: All P0 (Critical) acceptance criteria tested before Day 15  
**Last Updated**: November 4, 2025
