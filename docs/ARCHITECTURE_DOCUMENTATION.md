# Architecture Documentation
## Campus Resource Hub

**Document Version:** 1.0  
**Last Updated:** November 14, 2024  
**System:** Campus Resource Hub  
**Architecture Pattern:** Model-View-Controller (MVC)  

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture Pattern](#2-architecture-pattern)
3. [Component Architecture](#3-component-architecture)
4. [Data Architecture](#4-data-architecture)
5. [Technology Stack](#5-technology-stack)
6. [Directory Structure](#6-directory-structure)
7. [Request Flow](#7-request-flow)
8. [Authentication & Authorization](#8-authentication--authorization)
9. [Integration Architecture](#9-integration-architecture)
10. [Deployment Architecture](#10-deployment-architecture)
11. [Scalability Considerations](#11-scalability-considerations)
12. [Security Architecture](#12-security-architecture)

---

## 1. System Overview

### 1.1 Purpose

The Campus Resource Hub is a centralized web application for managing and booking campus resources including study rooms, lab equipment, event spaces, and AV equipment at Indiana University Bloomington.

### 1.2 Key Capabilities

- **Resource Management**: Create, edit, publish, and archive campus resources
- **Booking System**: Calendar-based reservations with approval workflows
- **User Management**: Role-based access control (Student, Staff, Admin)
- **Communication**: Threaded messaging between resource owners and requesters
- **Reviews & Ratings**: Post-booking feedback with moderation controls
- **Calendar Integration**: Google Calendar sync via OAuth 2.0
- **AI Assistance**: Local LLM-powered resource discovery concierge

### 1.3 System Context

```
┌─────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SYSTEMS                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐         ┌──────────────┐                    │
│  │   Google     │         │   Local LLM  │                    │
│  │   Calendar   │ OAuth   │   Runtime    │ HTTP               │
│  │     API      │◄────────┤  (Ollama/    │◄─────────┐        │
│  └──────────────┘         │  LM Studio)  │          │         │
│                           └──────────────┘          │         │
└─────────────────────────────────────────────────────│─────────┘
                                                      │
                                                      │
┌─────────────────────────────────────────────────────│─────────┐
│                 CAMPUS RESOURCE HUB                 │         │
├─────────────────────────────────────────────────────│─────────┤
│                                                     │         │
│  ┌────────────────────────────────────────────┐    │         │
│  │         WEB APPLICATION (Flask)            │    │         │
│  │  • Authentication & Authorization          │    │         │
│  │  • Resource Catalog Management            │◄───┘         │
│  │  • Booking & Approval Workflows           │              │
│  │  • Messaging & Reviews                    │              │
│  │  • Admin Console                          │              │
│  │  • AI Concierge                          │              │
│  └────────────────────────────────────────────┘              │
│                        │                                      │
│                        ▼                                      │
│  ┌────────────────────────────────────────────┐              │
│  │        DATA LAYER (SQLite)                │              │
│  │  • Users, Resources, Bookings             │              │
│  │  • Messages, Reviews, Notifications       │              │
│  │  • Calendar Credentials, Audit Logs       │              │
│  └────────────────────────────────────────────┘              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────────┐
│                    USERS                                    │
├────────────────────────────────────────────────────────────┤
│  • Students (browse, book, review)                         │
│  • Staff (manage resources, approve bookings)              │
│  • Admins (system management, moderation)                  │
└────────────────────────────────────────────────────────────┘
```

---

## 2. Architecture Pattern

### 2.1 Model-View-Controller (MVC)

The application follows a strict MVC architecture to separate concerns and improve maintainability.

```
┌─────────────────────────────────────────────────────────────┐
│                         VIEW LAYER                          │
│              (src/views/ - Jinja2 Templates)                │
├─────────────────────────────────────────────────────────────┤
│  • HTML templates with template inheritance               │
│  • Client-side JavaScript for interactivity               │
│  • CSS styling with Bootstrap 5                           │
│  • No business logic (presentation only)                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     CONTROLLER LAYER                        │
│              (src/controllers/ - Flask Blueprints)          │
├─────────────────────────────────────────────────────────────┤
│  • Route handlers and request processing                  │
│  • Input validation and sanitization                      │
│  • Business logic orchestration                           │
│  • Response formatting                                    │
│  • No direct database access                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      MODEL LAYER                            │
│               (src/models/ - Python Classes)                │
├─────────────────────────────────────────────────────────────┤
│  • Data structures (User, Resource, Booking, etc.)        │
│  • Domain objects with methods                            │
│  • No persistence logic                                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                 DATA ACCESS LAYER (DAL)                     │
│             (src/data_access/ - DAL Modules)                │
├─────────────────────────────────────────────────────────────┤
│  • Database operations (CRUD)                             │
│  • Query construction                                     │
│  • Transaction management                                 │
│  • Connection handling                                    │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Benefits of MVC

1. **Separation of Concerns**: Each layer has a single responsibility
2. **Testability**: Layers can be tested independently
3. **Maintainability**: Changes to one layer don't affect others
4. **Scalability**: Easy to add new features or modify existing ones
5. **Code Reusability**: DAL and models can be reused across controllers

---

## 3. Component Architecture

### 3.1 Core Components

```
┌──────────────────────────────────────────────────────────────┐
│                     APPLICATION CORE                         │
│                      (src/app.py)                            │
├──────────────────────────────────────────────────────────────┤
│  • Flask application factory (create_app)                   │
│  • Blueprint registration                                   │
│  • Middleware configuration (CSRF, session)                 │
│  • Error handlers (404, 500)                                │
│  • Template filters and context processors                  │
│  • Before-request hooks (account suspension check)          │
└──────────────────────────────────────────────────────────────┘

┌────────────────────┬────────────────────┬──────────────────────┐
│   CONTROLLERS      │    SERVICES        │    UTILITIES         │
│   (Blueprints)     │  (Business Logic)  │    (Helpers)         │
├────────────────────┼────────────────────┼──────────────────────┤
│ • auth_controller  │ • concierge_service│ • validators         │
│ • resource_ctrl    │ • calendar_service │ • availability       │
│ • booking_ctrl     │ • notification_ctr │ • calendar_sync      │
│ • message_ctrl     │ • accessibility_   │ • email_client       │
│ • review_ctrl      │   audit            │ • email_verification │
│ • admin_ctrl       │ • llm_client       │ • notifications      │
│ • calendar_ctrl    │                    │ • permissions        │
│ • concierge_ctrl   │                    │ • datetime_helpers   │
│ • notification_ctrl│                    │                      │
│ • accessibility_ctrl│                   │                      │
└────────────────────┴────────────────────┴──────────────────────┘

┌────────────────────┬────────────────────┬──────────────────────┐
│    DATA ACCESS     │      MODELS        │    CONFIGURATION     │
│       LAYER        │   (Domain Objects) │                      │
├────────────────────┼────────────────────┼──────────────────────┤
│ • user_dal         │ • User             │ • config.py          │
│ • resource_dal     │ • Resource         │ • .env               │
│ • booking_dal      │ • Booking          │ • .flaskenv          │
│ • message_dal      │ • Message          │                      │
│ • review_dal       │ • Review           │                      │
│ • calendar_dal     │ • WaitlistEntry    │                      │
│ • notification_dal │                    │                      │
│ • admin_log_dal    │                    │                      │
│ • waitlist_dal     │                    │                      │
└────────────────────┴────────────────────┴──────────────────────┘
```

### 3.2 Controller Responsibilities

| Controller | Routes | Responsibilities |
|-----------|--------|-----------------|
| **auth_controller** | `/auth/*` | Registration, login, logout, email verification |
| **resource_controller** | `/resources/*` | Resource CRUD, search, detail views |
| **booking_controller** | `/bookings/*` | Booking creation, approval, cancellation, conflict detection |
| **message_controller** | `/messages/*` | Threaded messaging, flagging |
| **review_controller** | `/reviews/*` | Review creation, moderation |
| **admin_controller** | `/admin/*` | User management, content moderation, reporting |
| **calendar_controller** | `/calendar/*` | OAuth flow, Google Calendar sync, iCal export |
| **concierge_controller** | `/concierge/*` | AI assistant interface, query processing |
| **notification_controller** | `/notifications/*` | Notification center, mark as read |
| **accessibility_controller** | `/accessibility/*` | Accessibility audit, compliance reporting |

### 3.3 Service Layer

| Service | Purpose | Usage |
|---------|---------|-------|
| **ConciergeService** | AI-powered resource discovery | Natural language queries, RAG pipeline |
| **CalendarService** | Calendar integration | Google Calendar sync, iCal generation |
| **NotificationCenter** | User notifications | In-app notifications, email delivery |
| **LocalLLMClient** | LLM abstraction | Chat completion API for Ollama/LM Studio |
| **AccessibilityAudit** | WCAG compliance | Automated accessibility checks |

---

## 4. Data Architecture

### 4.1 Entity-Relationship Diagram

```
┌─────────────┐
│    users    │
├─────────────┤
│ user_id PK  │◄────┐
│ name        │     │
│ email       │     │
│ password_hash│    │
│ role        │     │
│ is_suspended│     │
│ email_verified│   │
└─────────────┘     │
       │            │
       │ owns       │
       ▼            │
┌─────────────┐     │
│  resources  │     │
├─────────────┤     │
│ resource_id PK│   │
│ owner_id FK ├─────┘
│ title       │
│ description │
│ category    │
│ location    │
│ capacity    │
│ status      │
│ availability_schedule│
└─────────────┘
       │
       │ belongs to
       ▼
┌─────────────┐
│  bookings   │
├─────────────┤
│ booking_id PK│
│ resource_id FK│──┐
│ requester_id FK│ │
│ start_datetime│  │
│ end_datetime│    │
│ status      │    │
│ decision_by FK│  │
└─────────────┘    │
       │           │
       │ has       │
       ▼           │
┌─────────────┐    │
│  messages   │    │
├─────────────┤    │
│ message_id PK│   │
│ thread_id   │    │
│ sender_id FK│    │
│ receiver_id FK│  │
│ content     │    │
│ is_flagged  │    │
└─────────────┘    │
                   │
                   ▼
┌─────────────┐    ┌─────────────┐
│  reviews    │    │  waitlist   │
├─────────────┤    ├─────────────┤
│ review_id PK│    │ entry_id PK │
│ resource_id FK│  │ resource_id FK│
│ reviewer_id FK│  │ requester_id FK│
│ rating      │    │ start_datetime│
│ comment     │    │ end_datetime│
│ is_flagged  │    │ status      │
└─────────────┘    └─────────────┘

┌─────────────────┐  ┌──────────────────┐
│ notifications   │  │ calendar_creds   │
├─────────────────┤  ├──────────────────┤
│ notification_id PK│ │ credential_id PK │
│ user_id FK      │  │ user_id FK       │
│ type            │  │ provider         │
│ title           │  │ access_token     │
│ body            │  │ refresh_token    │
│ is_read         │  │ expires_at       │
└─────────────────┘  └──────────────────┘

┌─────────────┐
│ admin_logs  │
├─────────────┤
│ log_id PK   │
│ action_type │
│ target_type │
│ target_id   │
│ performed_by FK│
│ notes       │
│ timestamp   │
└─────────────┘
```

### 4.2 Database Tables

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| **users** | User accounts | user_id, email, password_hash, role, is_suspended |
| **resources** | Campus resources | resource_id, owner_id, title, category, status |
| **bookings** | Reservations | booking_id, resource_id, requester_id, start_datetime, status |
| **messages** | Communication | message_id, thread_id, sender_id, receiver_id, content |
| **reviews** | Feedback | review_id, resource_id, reviewer_id, rating, comment |
| **notifications** | User alerts | notification_id, user_id, type, title, is_read |
| **calendar_credentials** | OAuth tokens | credential_id, user_id, provider, access_token |
| **admin_logs** | Audit trail | log_id, action_type, performed_by, timestamp |
| **waitlist** | Demand tracking | entry_id, resource_id, requester_id, status |

### 4.3 Key Relationships

- **One-to-Many**: User owns many Resources
- **One-to-Many**: Resource has many Bookings
- **One-to-Many**: User creates many Bookings (as requester)
- **Many-to-One**: Booking approved by User (decision_by)
- **One-to-Many**: Resource has many Reviews
- **One-to-Many**: User writes many Reviews
- **One-to-Many**: Booking has many Messages (thread_id)
- **One-to-Many**: User receives many Notifications

---

## 5. Technology Stack

### 5.1 Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Python** | 3.10+ | Core language |
| **Flask** | 3.0.0 | Web framework |
| **Flask-Login** | 0.6.3 | Authentication |
| **Flask-WTF** | 1.2.1 | CSRF protection |
| **Werkzeug** | 3.0.1 | WSGI utilities, password hashing |
| **SQLite** | 3.x | Database (development) |
| **Requests** | 2.31.0 | HTTP client (for LLM API) |
| **python-dotenv** | 1.0.0 | Environment configuration |

### 5.2 Frontend

| Technology | Purpose |
|-----------|---------|
| **HTML5** | Markup |
| **CSS3** | Styling |
| **Bootstrap 5.3** | UI framework |
| **JavaScript (Vanilla)** | Interactivity |
| **Jinja2** | Template engine |

### 5.3 External Services

| Service | Purpose | Integration |
|---------|---------|-------------|
| **Google Calendar API** | Calendar sync | OAuth 2.0 |
| **Ollama** | Local LLM runtime | HTTP API |
| **LM Studio** | Local LLM runtime | OpenAI-compatible API |

### 5.4 Development Tools

| Tool | Purpose |
|------|---------|
| **pytest** | Testing framework |
| **coverage.py** | Code coverage |
| **git** | Version control |
| **venv** | Virtual environment |

---

## 6. Directory Structure

```
aidd-capstone/
├── src/                          # Application source code
│   ├── app.py                    # Main Flask application (entry point)
│   ├── config.py                 # Configuration management
│   │
│   ├── controllers/              # MVC Controllers (Flask Blueprints)
│   │   ├── __init__.py
│   │   ├── auth_controller.py
│   │   ├── resource_controller.py
│   │   ├── booking_controller.py
│   │   ├── message_controller.py
│   │   ├── review_controller.py
│   │   ├── admin_controller.py
│   │   ├── calendar_controller.py
│   │   ├── concierge_controller.py
│   │   ├── notification_controller.py
│   │   └── accessibility_controller.py
│   │
│   ├── models/                   # MVC Models (Domain Objects)
│   │   ├── __init__.py
│   │   └── models.py             # User, Resource, Booking, etc.
│   │
│   ├── data_access/              # Data Access Layer
│   │   ├── __init__.py           # Database initialization
│   │   ├── user_dal.py
│   │   ├── resource_dal.py
│   │   ├── booking_dal.py
│   │   ├── message_dal.py
│   │   ├── review_dal.py
│   │   ├── calendar_dal.py
│   │   ├── notification_dal.py
│   │   ├── admin_log_dal.py
│   │   ├── waitlist_dal.py
│   │   └── sample_data.py        # Demo data seeding
│   │
│   ├── views/                    # MVC Views (Jinja2 Templates)
│   │   ├── layout.html           # Base template
│   │   ├── index.html            # Homepage
│   │   ├── auth/                 # Authentication templates
│   │   ├── resources/            # Resource templates
│   │   ├── bookings/             # Booking templates
│   │   ├── messages/             # Message templates
│   │   ├── dashboard/            # Dashboard templates
│   │   ├── admin/                # Admin templates
│   │   ├── concierge/            # AI concierge templates
│   │   ├── accessibility/        # Accessibility templates
│   │   └── errors/               # Error pages (404, 500)
│   │
│   ├── static/                   # Static assets
│   │   ├── css/
│   │   │   └── style.css         # Custom styles
│   │   ├── js/
│   │   │   ├── main.js           # Global JavaScript
│   │   │   ├── form-validation.js
│   │   │   ├── admin_dashboard.js
│   │   │   └── vendor/           # Third-party libraries
│   │   ├── images/               # Static images
│   │   └── uploads/              # User-uploaded files
│   │
│   ├── services/                 # Business Logic Services
│   │   ├── __init__.py
│   │   ├── concierge_service.py  # AI concierge
│   │   ├── llm_client.py         # LLM abstraction
│   │   ├── calendar_service.py   # Calendar integration
│   │   ├── notification_center.py# Notification aggregation
│   │   └── accessibility_audit.py# WCAG compliance
│   │
│   └── utils/                    # Utility Functions
│       ├── __init__.py
│       ├── validators.py         # Input validation
│       ├── availability.py       # Availability logic
│       ├── calendar_sync.py      # Calendar helpers
│       ├── datetime_helpers.py   # Date/time utilities
│       ├── email_client.py       # Email delivery
│       ├── email_verification.py # Email verification
│       ├── notifications.py      # Notification helpers
│       └── permissions.py        # RBAC helpers
│
├── docs/                         # Documentation
│   ├── PRD.md                    # Product Requirements
│   ├── SECURITY_COMPLIANCE_REPORT.md
│   ├── AI_FEATURE_DOCUMENTATION.md
│   ├── ARCHITECTURE_DOCUMENTATION.md
│   ├── context/                  # AI context documents
│   │   ├── personas/
│   │   ├── architecture/
│   │   └── acceptance_tests/
│   └── migrations/               # Database migrations
│       ├── 001_schema_upgrade.sql
│       ├── 002_moderation_and_notes.sql
│       └── 003_add_cascade_constraints.sql
│
├── tests/                        # Test Suite
│   ├── __init__.py
│   ├── conftest.py               # Pytest fixtures
│   ├── test_auth.py
│   ├── test_booking.py
│   ├── test_dal.py
│   ├── test_integration.py
│   ├── test_validators.py
│   ├── test_concierge.py
│   ├── test_calendar.py
│   ├── test_messages.py
│   ├── test_notifications.py
│   ├── test_access_control.py
│   ├── test_staff_rbac.py
│   └── test_accessibility.py
│
├── campus_hub.db                 # SQLite database (generated)
├── schema.sql                    # Database schema
├── requirements.txt              # Python dependencies
├── .env                          # Environment variables (not in git)
├── .env.example                  # Environment template
├── .flaskenv                     # Flask-specific env vars
├── .gitignore                    # Git ignore rules
└── README.md                     # Project README
```

---

## 7. Request Flow

### 7.1 Typical Request Lifecycle

```
1. CLIENT REQUEST
   ↓
   Browser sends HTTP request
   GET /resources/1 HTTP/1.1

2. FLASK ROUTING
   ↓
   Flask matches route to blueprint
   @resource_bp.route('/resources/<int:resource_id>')

3. BEFORE REQUEST HOOKS
   ↓
   • Check if user is authenticated
   • Enforce account suspension
   • Inject cache busting timestamp
   • Build notification payload

4. CONTROLLER PROCESSING
   ↓
   • Parse request parameters
   • Validate user permissions
   • Call DAL methods
   • Process business logic

5. DATA ACCESS LAYER
   ↓
   • Execute SQL queries (parameterized)
   • Map database rows to Model objects
   • Return results to controller

6. TEMPLATE RENDERING
   ↓
   • Controller passes data to template
   • Jinja2 renders HTML
   • Apply template filters (datetime_format, nl2br, etc.)
   • Auto-escape user content (XSS protection)

7. RESPONSE MIDDLEWARE
   ↓
   • Add security headers (if configured)
   • Set cache control headers
   • Apply CSRF token (for forms)

8. CLIENT RESPONSE
   ↓
   HTTP/1.1 200 OK
   Content-Type: text/html
   ...
   <html>...</html>
```

### 7.2 Example: Creating a Booking

```python
# 1. User submits booking form
POST /bookings/create
Form Data:
  - resource_id: 1
  - start_datetime: 2024-11-15T14:00:00
  - end_datetime: 2024-11-15T16:00:00
  - csrf_token: abc123

# 2. Controller receives request
@booking_bp.route('/create', methods=['POST'])
@login_required
def create():
    # 3. Validate CSRF token (automatic via Flask-WTF)
    
    # 4. Parse and validate input
    resource_id = int(request.form.get('resource_id'))
    start = request.form.get('start_datetime')
    end = request.form.get('end_datetime')
    
    # 5. Fetch resource
    resource = ResourceDAL.get_resource_by_id(resource_id)
    
    # 6. Check conflicts
    conflicts = BookingDAL.check_conflicts(resource_id, start, end)
    if conflicts:
        flash('Time slot unavailable', 'danger')
        return redirect(url_for('bookings.create'))
    
    # 7. Create booking
    booking = BookingDAL.create_booking(
        resource_id=resource_id,
        requester_id=current_user.user_id,
        start_datetime=start,
        end_datetime=end,
        status='pending'
    )
    
    # 8. Send notification
    NotificationService.send_notification(
        user_id=resource.owner_id,
        type='new_booking_request',
        title='New Booking Request',
        body=f'{current_user.name} requested {resource.title}'
    )
    
    # 9. Redirect with success message
    flash('Booking request submitted!', 'success')
    return redirect(url_for('bookings.detail', booking_id=booking.booking_id))
```

---

## 8. Authentication & Authorization

### 8.1 Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    REGISTRATION                             │
└─────────────────────────────────────────────────────────────┘
  POST /auth/register
  ↓
  1. Validate input (email, password, role)
  2. Check email domain (iu.edu only)
  3. Hash password (bcrypt)
  4. Create user record (email_verified=False)
  5. Generate verification token
  6. Display verification link
  ↓
  GET /auth/verify-email/<token>
  ↓
  1. Lookup user by token
  2. Check token expiry
  3. Mark email as verified
  4. Redirect to login

┌─────────────────────────────────────────────────────────────┐
│                        LOGIN                                │
└─────────────────────────────────────────────────────────────┘
  POST /auth/login
  ↓
  1. Lookup user by email
  2. Verify password (bcrypt.check_password_hash)
  3. Check if account suspended
  4. Check if email verified
  5. Create session (Flask-Login)
  6. Redirect to dashboard

┌─────────────────────────────────────────────────────────────┐
│                   SESSION MANAGEMENT                        │
└─────────────────────────────────────────────────────────────┘
  Every request with @login_required:
  ↓
  1. Flask-Login reads session cookie
  2. Load user via user_loader callback
  3. Check if user.is_suspended (before_request hook)
  4. If suspended: logout and redirect to login
  5. If valid: proceed to route handler
```

### 8.2 Authorization Model

**Role Hierarchy:**
```
Admin (full access)
  └─ Staff (resource management + student permissions)
      └─ Student (basic access)
```

**Permission Matrix:**

| Action | Student | Staff | Admin |
|--------|---------|-------|-------|
| Browse resources | ✅ | ✅ | ✅ |
| Book resources | ✅ | ✅ | ✅ |
| Leave reviews | ✅ | ✅ | ✅ |
| Create resources | ❌ | ✅ (own) | ✅ (all) |
| Edit resources | ❌ | ✅ (own) | ✅ (all) |
| Approve bookings | ❌ | ✅ (own resources) | ✅ (all) |
| Suspend users | ❌ | ❌ | ✅ |
| Moderate content | ❌ | ❌ | ✅ |
| View audit logs | ❌ | ❌ | ✅ |

**Implementation:**

```python
# src/utils/permissions.py

def is_admin():
    """Check if current user is admin"""
    return current_user.is_authenticated and current_user.role == 'admin'

def is_staff():
    """Check if current user is staff or admin"""
    return current_user.is_authenticated and current_user.role in ['staff', 'admin']

def owns_resource(resource):
    """Check if current user owns the resource"""
    return current_user.is_authenticated and resource.owner_id == current_user.user_id

def can_manage_resource(resource):
    """Check if current user can manage the resource"""
    return is_admin() or owns_resource(resource)

# Usage in controller
@resource_bp.route('/resources/<int:resource_id>/edit')
@login_required
def edit(resource_id):
    resource = ResourceDAL.get_resource_by_id(resource_id)
    
    if not can_manage_resource(resource):
        flash('Access denied', 'danger')
        return redirect(url_for('index'))
    
    # Proceed with editing...
```

---

## 9. Integration Architecture

### 9.1 Google Calendar Integration

```
┌─────────────────────────────────────────────────────────────┐
│                  OAUTH 2.0 AUTHORIZATION FLOW               │
└─────────────────────────────────────────────────────────────┘

1. User clicks "Connect Google Calendar"
   ↓
   GET /calendar/google/authorize
   ↓
2. Build OAuth URL with client_id, redirect_uri, scopes
   ↓
   Redirect to Google OAuth consent screen
   ↓
3. User approves access
   ↓
   Google redirects to /calendar/google/callback?code=xyz...
   ↓
4. Exchange authorization code for access token
   POST https://oauth2.googleapis.com/token
   ↓
5. Store credentials in calendar_credentials table
   • access_token (encrypted)
   • refresh_token (encrypted)
   • expires_at
   ↓
6. Mark user.calendar_connected = True
   ↓
   Redirect to dashboard (success message)

┌─────────────────────────────────────────────────────────────┐
│                    EVENT SYNCHRONIZATION                    │
└─────────────────────────────────────────────────────────────┘

User clicks "Sync to Google Calendar" on booking
   ↓
   POST /calendar/google/sync/<booking_id>
   ↓
1. Fetch booking and resource details
2. Retrieve user's access token
3. Check if token expired → refresh if needed
4. Build Google Calendar event JSON
   {
     "summary": "Wells Library Study Suite",
     "description": "Booking #123 via Campus Resource Hub",
     "start": {"dateTime": "2024-11-15T14:00:00-05:00"},
     "end": {"dateTime": "2024-11-15T16:00:00-05:00"},
     "location": "Wells Library - 1320 E 10th St"
   }
5. POST to Google Calendar API
   POST https://www.googleapis.com/calendar/v3/calendars/primary/events
6. Store event_id in booking record
7. Flash success message
```

### 9.2 Local LLM Integration

```
┌─────────────────────────────────────────────────────────────┐
│              AI CONCIERGE QUERY PROCESSING                  │
└─────────────────────────────────────────────────────────────┘

User: "Where can I find a podcast studio?"
   ↓
   POST /concierge/ask
   ↓
1. ConciergeService.answer(question)
   ↓
2. Extract keywords: ["podcast", "studio", "recording"]
   ↓
3. Search database (ResourceDAL)
   • Category matching: "AV Equipment"
   • Keyword scoring: title, description, equipment
   • Return top 4 results
   ↓
4. Search context documents
   • Load markdown files (cached)
   • Score by keyword relevance
   • Return top 2 snippets
   ↓
5. Format context block (compact)
   RESOURCES:
   - Kelley Podcast Studio (AV Equipment) | Kelley School | Cap:4 | ...
   
   DOCS:
   - personas/student_persona.md: Students often need flexible...
   ↓
6. Call LocalLLMClient.chat(messages)
   ↓
   POST http://localhost:11434/api/chat (Ollama)
   {
     "model": "llama3.1",
     "messages": [
       {"role": "system", "content": "You are a helpful concierge..."},
       {"role": "user", "content": "Where can I find a podcast studio?\n\nCONTEXT:\n..."}
     ],
     "options": {"num_predict": 200, "temperature": 0.5}
   }
   ↓
7. Receive LLM response (2-3 seconds)
   {
     "message": {"content": "I found an excellent podcast recording facility! ..."},
     "done": true
   }
   ↓
8. Format response with resource cards
   ↓
   Return JSON to frontend
   {
     "answer": "I found an excellent podcast recording facility! ...",
     "resources": [{...}],
     "used_llm": true,
     "llm_error": null
   }
```

---

## 10. Deployment Architecture

### 10.1 Development Environment

```
┌─────────────────────────────────────────────┐
│          DEVELOPER WORKSTATION              │
├─────────────────────────────────────────────┤
│  • Flask Development Server (port 5000)    │
│  • SQLite Database (local file)            │
│  • Ollama (optional, port 11434)           │
│  • Hot reload enabled                       │
│  • Debug mode ON                            │
│  • HTTPS: NO                                │
└─────────────────────────────────────────────┘
```

**Configuration:**
- `.flaskenv`: `FLASK_DEBUG=1`, `FLASK_APP=src.app:create_app`
- `.env`: Development secrets (Google OAuth, LLM settings)
- Database: `campus_hub.db` (SQLite)

### 10.2 Production Architecture (Recommended)

```
┌─────────────────────────────────────────────────────────────┐
│                    INTERNET / USERS                         │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTPS (443)
                             ▼
┌─────────────────────────────────────────────────────────────┐
│               REVERSE PROXY (Nginx/Apache)                  │
├─────────────────────────────────────────────────────────────┤
│  • TLS/SSL termination                                      │
│  • Static file serving (/static/)                           │
│  • Security headers (X-Frame-Options, CSP, etc.)            │
│  • Rate limiting (optional)                                 │
│  • Proxy pass to application server                         │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP (127.0.0.1:8000)
                             ▼
┌─────────────────────────────────────────────────────────────┐
│           APPLICATION SERVER (Gunicorn/uWSGI)               │
├─────────────────────────────────────────────────────────────┤
│  • WSGI server (Gunicorn recommended)                       │
│  • Worker processes: 2-4 per CPU core                       │
│  • Worker type: sync or gevent                              │
│  • Timeout: 30-60 seconds                                   │
│  • Graceful reloads for zero-downtime deploys               │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   FLASK APPLICATION                         │
├─────────────────────────────────────────────────────────────┤
│  • Debug mode OFF                                           │
│  • SESSION_COOKIE_SECURE = True                             │
│  • Strong SECRET_KEY                                        │
│  • Error logging to file or syslog                          │
└────────────────────────────┬────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│   Database    │  │   Local LLM   │  │ Google OAuth  │
│  PostgreSQL   │  │    (Ollama)   │  │      API      │
│  or SQLite    │  │ localhost:11434│  │   (External)  │
└───────────────┘  └───────────────┘  └───────────────┘
```

**Production Configuration:**
```bash
# Environment variables
FLASK_ENV=production
SECRET_KEY=<strong-random-value>
SESSION_COOKIE_SECURE=True
GOOGLE_CLIENT_ID=<production-client-id>
GOOGLE_CLIENT_SECRET=<production-secret>
EXTERNAL_BASE_URL=https://yourdomain.com
LOCAL_LLM_BASE_URL=http://localhost:11434
```

**Gunicorn Command:**
```bash
gunicorn --bind 127.0.0.1:8000 \
         --workers 4 \
         --worker-class sync \
         --timeout 60 \
         --access-logfile /var/log/gunicorn/access.log \
         --error-logfile /var/log/gunicorn/error.log \
         "src.app:create_app()"
```

**Nginx Configuration:**
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Static files
    location /static/ {
        alias /path/to/aidd-capstone/src/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Proxy to Gunicorn
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 11. Scalability Considerations

### 11.1 Database Scalability

**SQLite Limitations:**
- Single-writer (write concurrency bottleneck)
- File-based (not ideal for distributed systems)
- No built-in replication

**Migration Path to PostgreSQL:**

```python
# config.py - PostgreSQL configuration
DATABASE_URL = os.environ.get('DATABASE_URL') or 'sqlite:///campus_hub.db'

# Use SQLAlchemy for ORM (migration step)
from sqlalchemy import create_engine
engine = create_engine(DATABASE_URL)
```

**Benefits:**
- Multi-writer concurrency
- Advanced indexing
- JSON column support
- Full-text search
- Replication and high availability

### 11.2 Application Scalability

**Horizontal Scaling:**

```
      Load Balancer
            |
    ┌───────┼───────┐
    ▼       ▼       ▼
  App1    App2    App3
    └───────┼───────┘
            ▼
      PostgreSQL
```

**Considerations:**
- Use Redis for session storage (shared across app servers)
- File uploads to shared storage (S3, NFS)
- Database connection pooling (SQLAlchemy)

### 11.3 Caching Strategies

**Current:**
- Context files cached in memory (LRU cache)
- Browser cache for static assets (1 year)

**Future:**
- Redis for resource catalog caching
- CDN for static assets
- Query result caching (resource search)

---

## 12. Security Architecture

### 12.1 Defense in Depth

```
┌─────────────────────────────────────────────────────────────┐
│                    LAYER 7: User Education                  │
│  • Training on phishing, password security                 │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                  LAYER 6: Application Security              │
│  • Input validation, output encoding                        │
│  • CSRF protection, parameterized queries                   │
│  • Secure session management                                │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                   LAYER 5: Authentication                   │
│  • bcrypt password hashing                                  │
│  • Email verification                                       │
│  • Account suspension                                       │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                   LAYER 4: Authorization                    │
│  • Role-based access control (RBAC)                         │
│  • Ownership checks                                         │
│  • Admin-only actions                                       │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                    LAYER 3: Network Security                │
│  • HTTPS/TLS encryption                                     │
│  • Firewall rules                                           │
│  • Rate limiting                                            │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                  LAYER 2: Infrastructure                    │
│  • OS patching                                              │
│  • File permissions (600 for database)                      │
│  • Service isolation                                        │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                    LAYER 1: Physical Security               │
│  • Server room access control                               │
│  • Backup storage security                                  │
└─────────────────────────────────────────────────────────────┘
```

### 12.2 Security Controls

**See:** `SECURITY_COMPLIANCE_REPORT.md` for comprehensive security documentation.

**Key Controls:**
- ✅ bcrypt password hashing
- ✅ CSRF protection (Flask-WTF)
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS protection (output encoding)
- ✅ Secure session cookies (HttpOnly, Secure, SameSite)
- ✅ File upload validation
- ✅ Role-based access control
- ✅ Account suspension enforcement
- ✅ Email verification
- ✅ Audit logging

---

## Conclusion

The Campus Resource Hub follows a clean MVC architecture with strict separation of concerns, enabling maintainability, testability, and scalability. The system leverages modern Python web development practices and integrates seamlessly with external services while maintaining a privacy-first approach.

For further details, refer to:
- **Security**: `SECURITY_COMPLIANCE_REPORT.md`
- **AI Features**: `AI_FEATURE_DOCUMENTATION.md`
- **Deployment**: `DEPLOYMENT_GUIDE.md` (to be created)

---

**Document Maintained By:** Campus Resource Hub Development Team  
**Last Updated:** November 14, 2024  
**Next Review:** May 2025

