# API Documentation
## Campus Resource Hub

**Document Version:** 1.0  
**Last Updated:** November 14, 2024  
**Base URL:** `https://yourdomain.com`  
**API Style:** REST-like (HTML + JSON responses)  

---

## Table of Contents

1. [Overview](#1-overview)
2. [Authentication](#2-authentication)
3. [Resources API](#3-resources-api)
4. [Bookings API](#4-bookings-api)
5. [Messages API](#5-messages-api)
6. [Reviews API](#6-reviews-api)
7. [AI Concierge API](#7-ai-concierge-api)
8. [Calendar API](#8-calendar-api)
9. [Notifications API](#9-notifications-api)
10. [Admin API](#10-admin-api)
11. [Error Handling](#11-error-handling)
12. [Rate Limiting](#12-rate-limiting)

---

## 1. Overview

### 1.1 API Style

The Campus Resource Hub uses a **hybrid API approach**:
- **HTML responses** for browser-based navigation (primary use case)
- **JSON responses** for AJAX calls and potential future integrations
- **Form-based submissions** with CSRF protection

### 1.2 Base URL

```
Development:  http://localhost:5000
Production:   https://yourdomain.com
```

### 1.3 Response Formats

**HTML (default):**
```http
GET /resources/1
Accept: text/html
```

**JSON (optional):**
```http
GET /api/resources/1
Accept: application/json
```

### 1.4 HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET request |
| 201 | Created | Successful POST request (resource created) |
| 302 | Found | Redirect after successful POST |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Permission denied |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Server Error | Server error |

---

## 2. Authentication

### 2.1 Session-Based Authentication

The application uses **Flask-Login** for session-based authentication with secure cookies.

**Login:**
```http
POST /auth/login
Content-Type: application/x-www-form-urlencoded

email=student@iu.edu
password=StudentPass1!
csrf_token=abc123
```

**Response:**
```http
HTTP/1.1 302 Found
Location: /dashboard
Set-Cookie: session=...; HttpOnly; Secure; SameSite=Lax
```

**Logout:**
```http
GET /auth/logout
```

**Response:**
```http
HTTP/1.1 302 Found
Location: /
```

### 2.2 Protected Endpoints

All endpoints require authentication unless explicitly marked as public.

**Authentication Check:**
```python
@login_required
def protected_route():
    # Requires valid session cookie
    pass
```

**Public Endpoints:**
- `GET /` - Homepage
- `GET /resources` - Resource catalog (browse only)
- `GET /resources/<id>` - Resource details
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

### 2.3 CSRF Protection

All POST/PUT/DELETE requests require a valid CSRF token.

**Obtaining CSRF Token:**
```html
<!-- In HTML form -->
<form method="POST">
    <input type="hidden" name="csrf_token" value="{{ csrf_token() }}">
    <!-- form fields -->
</form>
```

**AJAX with CSRF:**
```javascript
// JavaScript
fetch('/api/endpoint', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCsrfToken()  // From meta tag or cookie
    },
    body: JSON.stringify(data)
});
```

---

## 3. Resources API

### 3.1 List Resources

**Endpoint:** `GET /resources`

**Query Parameters:**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `q` | string | Keyword search | `study room` |
| `category` | string | Filter by category | `Study Room` |
| `location` | string | Filter by location | `Wells Library` |
| `capacity` | integer | Minimum capacity | `8` |
| `sort` | string | Sort order | `recent`, `popular`, `rating` |
| `page` | integer | Page number | `1` |

**Example:**
```http
GET /resources?q=study&category=Study+Room&sort=rating&page=1
```

**Response (HTML):**
```html
<!DOCTYPE html>
<html>
  <body>
    <!-- Resource cards -->
  </body>
</html>
```

**Response (JSON - future):**
```json
{
  "resources": [
    {
      "resource_id": 1,
      "title": "Wells Library Study Suite",
      "category": "Study Room",
      "location": "Wells Library - 1320 E 10th St",
      "capacity": 8,
      "status": "published",
      "avg_rating": 4.5,
      "total_reviews": 12
    }
  ],
  "total": 25,
  "page": 1,
  "per_page": 12
}
```

### 3.2 Get Resource Details

**Endpoint:** `GET /resources/<resource_id>`

**Example:**
```http
GET /resources/1
```

**Response (HTML):**
```html
<!DOCTYPE html>
<html>
  <body>
    <h1>Wells Library Study Suite</h1>
    <p>Quiet collaborative space with whiteboards and HDMI connections</p>
    <!-- availability calendar, booking form, reviews -->
  </body>
</html>
```

### 3.3 Create Resource

**Endpoint:** `POST /resources/create`

**Authentication:** Required (Staff or Admin)

**Form Data:**
```http
POST /resources/create
Content-Type: application/x-www-form-urlencoded

csrf_token=abc123
title=Innovation Lab
description=State-of-the-art maker space
category=Lab Equipment
location=Luddy Hall
capacity=12
equipment=3D printers, laser cutters
is_restricted=1
status=published
```

**Response:**
```http
HTTP/1.1 302 Found
Location: /resources/5
```

### 3.4 Update Resource

**Endpoint:** `POST /resources/<resource_id>/edit`

**Authentication:** Required (Owner or Admin)

**Form Data:**
```http
POST /resources/1/edit
Content-Type: application/x-www-form-urlencoded

csrf_token=abc123
title=Wells Library Study Suite (Updated)
description=Updated description
```

**Response:**
```http
HTTP/1.1 302 Found
Location: /resources/1
```

### 3.5 Delete Resource

**Endpoint:** `POST /resources/<resource_id>/delete`

**Authentication:** Required (Owner or Admin)

**Form Data:**
```http
POST /resources/1/delete
Content-Type: application/x-www-form-urlencoded

csrf_token=abc123
```

**Response:**
```http
HTTP/1.1 302 Found
Location: /resources
```

---

## 4. Bookings API

### 4.1 Create Booking

**Endpoint:** `POST /bookings/create`

**Authentication:** Required

**Form Data:**
```http
POST /bookings/create
Content-Type: application/x-www-form-urlencoded

csrf_token=abc123
resource_id=1
start_datetime=2024-11-15T14:00:00
end_datetime=2024-11-15T16:00:00
purpose=Group study session
recurrence_rule=
```

**Response (Success):**
```http
HTTP/1.1 302 Found
Location: /bookings/123
```

**Response (Conflict):**
```http
HTTP/1.1 200 OK
Content-Type: text/html

<!-- Booking form with error message -->
<div class="alert alert-danger">
  Time slot unavailable (conflicts with existing booking)
</div>
```

### 4.2 Get Booking Details

**Endpoint:** `GET /bookings/<booking_id>`

**Authentication:** Required (Requester, Owner, or Admin)

**Example:**
```http
GET /bookings/123
```

**Response:**
```html
<!DOCTYPE html>
<html>
  <body>
    <h1>Booking #123</h1>
    <p>Resource: Wells Library Study Suite</p>
    <p>Date: November 15, 2024 at 02:00 PM - 04:00 PM</p>
    <p>Status: Pending Approval</p>
    <!-- Approve/Reject buttons (if owner) -->
  </body>
</html>
```

### 4.3 Approve Booking

**Endpoint:** `POST /bookings/<booking_id>/approve`

**Authentication:** Required (Owner or Admin)

**Form Data:**
```http
POST /bookings/123/approve
Content-Type: application/x-www-form-urlencoded

csrf_token=abc123
decision_notes=Approved - enjoy the space!
```

**Response:**
```http
HTTP/1.1 302 Found
Location: /bookings/123
```

### 4.4 Reject Booking

**Endpoint:** `POST /bookings/<booking_id>/reject`

**Authentication:** Required (Owner or Admin)

**Form Data:**
```http
POST /bookings/123/reject
Content-Type: application/x-www-form-urlencoded

csrf_token=abc123
decision_notes=Space unavailable due to maintenance
```

**Response:**
```http
HTTP/1.1 302 Found
Location: /bookings/123
```

### 4.5 Cancel Booking

**Endpoint:** `POST /bookings/<booking_id>/cancel`

**Authentication:** Required (Requester, Owner, or Admin)

**Form Data:**
```http
POST /bookings/123/cancel
Content-Type: application/x-www-form-urlencoded

csrf_token=abc123
```

**Response:**
```http
HTTP/1.1 302 Found
Location: /bookings/my-bookings
```

### 4.6 List My Bookings

**Endpoint:** `GET /bookings/my-bookings`

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status: `pending`, `approved`, `completed`, `cancelled` |

**Example:**
```http
GET /bookings/my-bookings?status=approved
```

---

## 5. Messages API

### 5.1 Send Message

**Endpoint:** `POST /messages/send`

**Authentication:** Required

**Form Data:**
```http
POST /messages/send
Content-Type: application/x-www-form-urlencoded

csrf_token=abc123
receiver_id=5
booking_id=123
content=Hi, is the space available earlier?
```

**Response:**
```http
HTTP/1.1 302 Found
Location: /messages/thread/T123
```

### 5.2 View Message Thread

**Endpoint:** `GET /messages/thread/<thread_id>`

**Authentication:** Required (Participant)

**Example:**
```http
GET /messages/thread/T123
```

**Response:**
```html
<!DOCTYPE html>
<html>
  <body>
    <h1>Conversation about Booking #123</h1>
    <div class="message">
      <strong>John Student:</strong> Hi, is the space available earlier?
      <span class="timestamp">2 hours ago</span>
    </div>
    <div class="message">
      <strong>Jane Staff:</strong> Yes, I can adjust the booking time.
      <span class="timestamp">1 hour ago</span>
    </div>
  </body>
</html>
```

### 5.3 List Message Threads

**Endpoint:** `GET /messages`

**Authentication:** Required

**Example:**
```http
GET /messages
```

**Response:**
```html
<!DOCTYPE html>
<html>
  <body>
    <h1>My Messages</h1>
    <ul>
      <li>
        <a href="/messages/thread/T123">Booking #123 - Wells Library Study Suite</a>
        <span class="preview">Hi, is the space available earlier?</span>
      </li>
    </ul>
  </body>
</html>
```

### 5.4 Flag Message

**Endpoint:** `POST /messages/<message_id>/flag`

**Authentication:** Required

**Form Data:**
```http
POST /messages/456/flag
Content-Type: application/x-www-form-urlencoded

csrf_token=abc123
flag_reason=Spam or inappropriate content
```

**Response:**
```http
HTTP/1.1 302 Found
Location: /messages/thread/T123
```

---

## 6. Reviews API

### 6.1 Create Review

**Endpoint:** `POST /reviews/create/<resource_id>`

**Authentication:** Required (Completed booking required)

**Form Data:**
```http
POST /reviews/create/1
Content-Type: application/x-www-form-urlencoded

csrf_token=abc123
rating=5
comment=Excellent study space with great amenities!
```

**Response:**
```http
HTTP/1.1 302 Found
Location: /resources/1
```

### 6.2 Flag Review

**Endpoint:** `POST /reviews/<review_id>/flag`

**Authentication:** Required

**Form Data:**
```http
POST /reviews/789/flag
Content-Type: application/x-www-form-urlencoded

csrf_token=abc123
flag_reason=Inappropriate language
```

**Response:**
```http
HTTP/1.1 302 Found
Location: /resources/1
```

---

## 7. AI Concierge API

### 7.1 Ask Question

**Endpoint:** `POST /concierge/ask`

**Authentication:** Optional (public)

**Form Data:**
```http
POST /concierge/ask
Content-Type: application/x-www-form-urlencoded

csrf_token=abc123
question=Where can I find a podcast studio?
```

**Response (JSON):**
```json
{
  "question": "Where can I find a podcast studio?",
  "answer": "I found an excellent podcast recording facility! **Kelley Podcast Studio** is a state-of-the-art recording space located at Kelley School of Business...",
  "resources": [
    {
      "resource_id": 5,
      "title": "Kelley Podcast Studio",
      "category": "AV Equipment",
      "location": "Kelley School - Godfrey Graduate Center",
      "capacity": 4,
      "is_restricted": true,
      "equipment": "Shure SM7B microphones, Audio interface, Acoustic treatment",
      "rating": 4.8,
      "status": "published"
    }
  ],
  "doc_snippets": [],
  "stats": {
    "most_requested": [
      {"resource_id": 1, "title": "Wells Library Study Suite", "total": 15}
    ]
  },
  "used_llm": true,
  "llm_error": null,
  "context_block": "RESOURCES:\n- Kelley Podcast Studio (AV Equipment) | ..."
}
```

**Error Response:**
```json
{
  "error": "Question must not be empty."
}
```

### 7.2 Get Concierge Interface

**Endpoint:** `GET /concierge`

**Authentication:** Optional

**Response:**
```html
<!DOCTYPE html>
<html>
  <body>
    <h1>AI Resource Concierge</h1>
    <form id="concierge-form">
      <textarea name="question" placeholder="Ask me anything about campus resources..."></textarea>
      <button type="submit">Ask</button>
    </form>
    <div id="concierge-response"></div>
  </body>
</html>
```

---

## 8. Calendar API

### 8.1 Google OAuth Authorization

**Endpoint:** `GET /calendar/google/authorize`

**Authentication:** Required

**Example:**
```http
GET /calendar/google/authorize
```

**Response:**
```http
HTTP/1.1 302 Found
Location: https://accounts.google.com/o/oauth2/v2/auth?client_id=...&redirect_uri=...&scope=...
```

### 8.2 OAuth Callback

**Endpoint:** `GET /calendar/google/callback`

**Query Parameters:**
| Parameter | Description |
|-----------|-------------|
| `code` | Authorization code from Google |
| `state` | CSRF state token |

**Example:**
```http
GET /calendar/google/callback?code=xyz123&state=abc456
```

**Response:**
```http
HTTP/1.1 302 Found
Location: /dashboard
```

### 8.3 Sync Booking to Google Calendar

**Endpoint:** `POST /calendar/google/sync/<booking_id>`

**Authentication:** Required

**Form Data:**
```http
POST /calendar/google/sync/123
Content-Type: application/x-www-form-urlencoded

csrf_token=abc123
```

**Response:**
```http
HTTP/1.1 302 Found
Location: /bookings/123
```

### 8.4 Download iCal

**Endpoint:** `GET /calendar/ical/<booking_id>`

**Authentication:** Required (Requester or Owner)

**Example:**
```http
GET /calendar/ical/123
```

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: text/calendar
Content-Disposition: attachment; filename="booking_123.ics"

BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Campus Resource Hub//EN
BEGIN:VEVENT
UID:booking-123@campushub.iu.edu
DTSTART:20241115T140000Z
DTEND:20241115T160000Z
SUMMARY:Wells Library Study Suite
LOCATION:Wells Library - 1320 E 10th St
DESCRIPTION:Booking #123 via Campus Resource Hub
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR
```

### 8.5 Disconnect Google Calendar

**Endpoint:** `POST /calendar/google/disconnect`

**Authentication:** Required

**Form Data:**
```http
POST /calendar/google/disconnect
Content-Type: application/x-www-form-urlencoded

csrf_token=abc123
```

**Response:**
```http
HTTP/1.1 302 Found
Location: /dashboard
```

---

## 9. Notifications API

### 9.1 List Notifications

**Endpoint:** `GET /notifications`

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `unread_only` | boolean | Show only unread notifications |
| `limit` | integer | Number of notifications (default: 20) |

**Example:**
```http
GET /notifications?unread_only=true&limit=10
```

**Response (HTML):**
```html
<!DOCTYPE html>
<html>
  <body>
    <h1>Notifications</h1>
    <div class="notification unread">
      <strong>Booking Approved</strong>
      <p>Your booking for Wells Library Study Suite has been approved!</p>
      <span class="timestamp">2 hours ago</span>
    </div>
  </body>
</html>
```

### 9.2 Mark Notification as Read

**Endpoint:** `POST /notifications/<notification_id>/read`

**Authentication:** Required

**Form Data:**
```http
POST /notifications/456/read
Content-Type: application/x-www-form-urlencoded

csrf_token=abc123
```

**Response:**
```http
HTTP/1.1 302 Found
Location: /notifications
```

### 9.3 Mark All as Read

**Endpoint:** `POST /notifications/read-all`

**Authentication:** Required

**Form Data:**
```http
POST /notifications/read-all
Content-Type: application/x-www-form-urlencoded

csrf_token=abc123
```

**Response:**
```http
HTTP/1.1 302 Found
Location: /notifications
```

---

## 10. Admin API

### 10.1 Dashboard

**Endpoint:** `GET /admin/dashboard`

**Authentication:** Required (Admin)

**Response:**
```html
<!DOCTYPE html>
<html>
  <body>
    <h1>Admin Dashboard</h1>
    <!-- Statistics, charts, recent activity -->
  </body>
</html>
```

### 10.2 Manage Users

**Endpoint:** `GET /admin/users`

**Authentication:** Required (Admin)

**Response:**
```html
<!DOCTYPE html>
<html>
  <body>
    <h1>User Management</h1>
    <table>
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Role</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
      <!-- User rows -->
    </table>
  </body>
</html>
```

### 10.3 Suspend User

**Endpoint:** `POST /admin/users/<user_id>/suspend`

**Authentication:** Required (Admin)

**Form Data:**
```http
POST /admin/users/5/suspend
Content-Type: application/x-www-form-urlencoded

csrf_token=abc123
notes=Policy violation - inappropriate content
```

**Response:**
```http
HTTP/1.1 302 Found
Location: /admin/users
```

### 10.4 Unsuspend User

**Endpoint:** `POST /admin/users/<user_id>/unsuspend`

**Authentication:** Required (Admin)

**Form Data:**
```http
POST /admin/users/5/unsuspend
Content-Type: application/x-www-form-urlencoded

csrf_token=abc123
```

**Response:**
```http
HTTP/1.1 302 Found
Location: /admin/users
```

### 10.5 Delete User

**Endpoint:** `POST /admin/users/<user_id>/delete`

**Authentication:** Required (Admin)

**Form Data:**
```http
POST /admin/users/5/delete
Content-Type: application/x-www-form-urlencoded

csrf_token=abc123
confirm=true
```

**Response:**
```http
HTTP/1.1 302 Found
Location: /admin/users
```

### 10.6 Moderate Review

**Endpoint:** `POST /admin/reviews/<review_id>/hide`

**Authentication:** Required (Admin)

**Form Data:**
```http
POST /admin/reviews/789/hide
Content-Type: application/x-www-form-urlencoded

csrf_token=abc123
```

**Response:**
```http
HTTP/1.1 302 Found
Location: /admin/reviews
```

### 10.7 View Audit Logs

**Endpoint:** `GET /admin/logs`

**Authentication:** Required (Admin)

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `action_type` | string | Filter by action type |
| `date_from` | date | Start date (YYYY-MM-DD) |
| `date_to` | date | End date (YYYY-MM-DD) |

**Example:**
```http
GET /admin/logs?action_type=suspend_user&date_from=2024-11-01
```

---

## 11. Error Handling

### 11.1 Error Response Format

**HTML Error (default):**
```html
<!DOCTYPE html>
<html>
  <body>
    <h1>404 - Not Found</h1>
    <p>The resource you requested does not exist.</p>
  </body>
</html>
```

**JSON Error (API):**
```json
{
  "error": "Resource not found",
  "code": 404,
  "message": "The resource with ID 999 does not exist."
}
```

### 11.2 Common Errors

**400 Bad Request:**
```json
{
  "error": "Validation error",
  "details": {
    "email": ["Invalid email address"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

**401 Unauthorized:**
```json
{
  "error": "Authentication required",
  "message": "Please log in to access this resource."
}
```

**403 Forbidden:**
```json
{
  "error": "Access denied",
  "message": "You do not have permission to perform this action."
}
```

**404 Not Found:**
```json
{
  "error": "Resource not found",
  "message": "The booking with ID 999 does not exist."
}
```

**409 Conflict:**
```json
{
  "error": "Booking conflict",
  "message": "This time slot is already booked.",
  "conflicting_booking_id": 123
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred. Please try again later."
}
```

---

## 12. Rate Limiting

### 12.1 Current Implementation

**Status:** ❌ Not implemented

**Recommended:** Implement rate limiting for production

### 12.2 Recommended Limits

| Endpoint | Rate Limit | Time Window |
|----------|-----------|-------------|
| `POST /auth/login` | 5 requests | 1 minute |
| `POST /auth/register` | 3 requests | 1 hour |
| `POST /concierge/ask` | 10 requests | 1 minute |
| All other endpoints | 100 requests | 1 minute |

### 12.3 Rate Limit Headers (Future)

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699900000
```

### 12.4 Rate Limit Response (Future)

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Retry-After: 60

{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again in 60 seconds."
}
```

---

## Appendix: Postman Collection

### Import Collection (Future)

**Collection Structure:**
```
Campus Resource Hub API
├── Authentication
│   ├── Register
│   ├── Login
│   └── Logout
├── Resources
│   ├── List Resources
│   ├── Get Resource
│   ├── Create Resource
│   └── Update Resource
├── Bookings
│   ├── Create Booking
│   ├── Approve Booking
│   └── Cancel Booking
└── AI Concierge
    └── Ask Question
```

### Environment Variables

```json
{
  "base_url": "https://yourdomain.com",
  "csrf_token": "{{csrf_token}}",
  "session_cookie": "{{session_cookie}}"
}
```

---

## Appendix: cURL Examples

### Register User
```bash
curl -X POST https://yourdomain.com/auth/register \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "name=John Student" \
  -d "email=john@iu.edu" \
  -d "password=SecurePass1!" \
  -d "confirm_password=SecurePass1!" \
  -d "role=student" \
  -d "csrf_token=abc123"
```

### Login
```bash
curl -X POST https://yourdomain.com/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=john@iu.edu" \
  -d "password=SecurePass1!" \
  -d "csrf_token=abc123" \
  -c cookies.txt
```

### List Resources
```bash
curl -X GET "https://yourdomain.com/resources?q=study&category=Study+Room" \
  -b cookies.txt
```

### Create Booking
```bash
curl -X POST https://yourdomain.com/bookings/create \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -b cookies.txt \
  -d "resource_id=1" \
  -d "start_datetime=2024-11-15T14:00:00" \
  -d "end_datetime=2024-11-15T16:00:00" \
  -d "csrf_token=abc123"
```

### AI Concierge Query
```bash
curl -X POST https://yourdomain.com/concierge/ask \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "question=Where can I find a podcast studio?" \
  -d "csrf_token=abc123"
```

---

**Document Maintained By:** Campus Resource Hub Development Team  
**Last Updated:** November 14, 2024  
**API Version:** 1.0  
**Next Review:** May 2025

---

**End of API Documentation**

