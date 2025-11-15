# MVC Architecture Documentation

## Overview

The Campus Resource Hub follows a strict **Model-View-Controller (MVC)** pattern with an additional **Data Access Layer (DAL)** for database encapsulation.

---

## Architecture Layers

### 1. Model Layer (`/src/models/`)

**Purpose:** Define data structures and business entities

**Files:**
- `models.py` - Python classes representing domain entities

**Example:**
```python
class Resource:
    def __init__(self, resource_id, owner_id, title, description, ...):
        self.resource_id = resource_id
        self.owner_id = owner_id
        self.title = title
        # ... additional fields
```

**Responsibilities:**
- Data structure definitions
- Business logic encapsulation
- Object initialization and validation

**Does NOT:**
- Query the database
- Handle HTTP requests
- Render HTML

---

### 2. View Layer (`/src/views/`)

**Purpose:** Present data to users through HTML templates

**Structure:**
```
/views/
  /auth/          - Login, registration forms
  /resources/     - Resource listing, detail, create/edit
  /bookings/      - Booking forms and lists
  /dashboard/     - User dashboard
  /admin/         - Admin interfaces
  /messages/      - Messaging UI
  layout.html     - Base template
```

**Technology:** Jinja2 templating with Bootstrap 5

**Example:**
```jinja2
{% extends "layout.html" %}
{% block content %}
  <h1>{{ resource.title }}</h1>
  <p>{{ resource.description }}</p>
{% endblock %}
```

**Responsibilities:**
- HTML structure and styling
- Display data passed from controllers
- Form inputs and user interactions
- Client-side validation (UX enhancement)

**Does NOT:**
- Contain business logic
- Query databases
- Process form data

---

### 3. Controller Layer (`/src/controllers/`)

**Purpose:** Coordinate requests, business logic, and responses

**Files:**
- `auth_controller.py` - Authentication routes
- `resource_controller.py` - Resource CRUD operations
- `booking_controller.py` - Booking workflows
- `admin_controller.py` - Administrative functions
- `message_controller.py` - Messaging features
- `review_controller.py` - Review submissions

**Example:**
```python
@resource_bp.route('/<int:resource_id>')
def detail(resource_id):
    # 1. Call DAL to fetch data
    resource = ResourceDAL.get_resource_by_id(resource_id)

    # 2. Apply business logic
    if not resource:
        flash('Resource not found', 'danger')
        return redirect(url_for('index'))

    # 3. Fetch related data
    reviews = ReviewDAL.get_reviews_for_resource(resource_id)

    # 4. Render view with data
    return render_template('resources/detail.html',
                          resource=resource,
                          reviews=reviews)
```

**Responsibilities:**
- Route handling (`@app.route()` decorators)
- Request parsing and validation
- Calling DAL methods
- Orchestrating business workflows
- Passing data to views
- Handling errors and redirects

**Does NOT:**
- Write raw SQL
- Directly interact with database
- Contain HTML

---

### 4. Data Access Layer (`/src/data_access/`)

**Purpose:** Encapsulate all database operations (CRUD)

**Files:**
- `__init__.py` - Database initialization and connection management
- `user_dal.py` - User CRUD operations
- `resource_dal.py` - Resource CRUD operations
- `booking_dal.py` - Booking CRUD operations
- `message_dal.py` - Message CRUD operations
- `review_dal.py` - Review CRUD operations
- `waitlist_dal.py` - Waitlist management
- `admin_log_dal.py` - Admin audit logging

**Example:**
```python
class ResourceDAL:
    @staticmethod
    def get_resource_by_id(resource_id):
        """Fetch resource by ID"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                'SELECT * FROM resources WHERE resource_id = ?',
                (resource_id,)
            )
            row = cursor.fetchone()
            return Resource(**dict(row)) if row else None

    @staticmethod
    def create_resource(owner_id, title, description, ...):
        """Create new resource"""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                'INSERT INTO resources (owner_id, title, ...) VALUES (?, ?, ...)',
                (owner_id, title, ...)
            )
            return ResourceDAL.get_resource_by_id(cursor.lastrowid)
```

**Responsibilities:**
- All database queries (SELECT, INSERT, UPDATE, DELETE)
- Parameterized SQL (prevents SQL injection)
- Result mapping to Model objects
- Transaction management
- Database connection handling

**Does NOT:**
- Handle HTTP requests
- Validate user input (done in controller)
- Render HTML
- Contain business workflow logic

---

## Separation of Concerns

### Request Flow

```
User Request
    ↓
[Controller] - Parse request, validate input
    ↓
[DAL] - Query database, return Models
    ↓
[Controller] - Apply business logic
    ↓
[View] - Render HTML with data
    ↓
HTTP Response
```

### Example: Creating a Booking

**Controller** (`booking_controller.py`):
```python
@booking_bp.route('/create/<int:resource_id>', methods=['POST'])
@login_required
def create(resource_id):
    # 1. Validate input (controller responsibility)
    start_dt = request.form.get('start_datetime')
    end_dt = request.form.get('end_datetime')

    valid, error = Validator.validate_datetime_range(start_dt, end_dt)
    if not valid:
        flash(error, 'danger')
        return redirect(...)

    # 2. Check business rules (controller + DAL)
    if BookingDAL.check_booking_conflict(resource_id, start_dt, end_dt):
        flash('Conflict detected', 'danger')
        return redirect(...)

    # 3. Persist data (DAL only)
    booking = BookingDAL.create_booking(
        resource_id=resource_id,
        requester_id=current_user.user_id,
        start_datetime=start_dt,
        end_datetime=end_dt
    )

    # 4. Send notifications (controller orchestration)
    NotificationService.send_booking_confirmation(booking)

    # 5. Render response (view)
    return render_template('bookings/confirmation.html', booking=booking)
```

**DAL** (`booking_dal.py`):
```python
@staticmethod
def create_booking(resource_id, requester_id, start_datetime, end_datetime):
    """Pure database operation - no business logic"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO bookings (resource_id, requester_id, start_datetime, end_datetime)
            VALUES (?, ?, ?, ?)
        ''', (resource_id, requester_id, start_datetime, end_datetime))
        return BookingDAL.get_booking_by_id(cursor.lastrowid)
```

---

## Benefits of This Architecture

1. **Separation of Concerns** - Each layer has a single, clear responsibility
2. **Testability** - DAL can be tested independently of controllers
3. **Maintainability** - Changes to database schema only affect DAL
4. **Security** - All SQL in one layer, easy to audit for injection vulnerabilities
5. **Reusability** - DAL methods can be called from multiple controllers
6. **Scalability** - Easy to swap SQLite for PostgreSQL (only DAL changes)

---

## Testing Each Layer

### DAL Tests (`tests/test_dal.py`)
```python
def test_resource_dal_crud(temp_db):
    # Test database operations independently
    resource = ResourceDAL.create_resource(...)
    assert resource.resource_id is not None

    fetched = ResourceDAL.get_resource_by_id(resource.resource_id)
    assert fetched.title == resource.title
```

### Controller Tests (`tests/test_integration.py`)
```python
def test_booking_flow(client):
    # Test HTTP requests through controllers
    response = client.post('/bookings/create/1', data={...})
    assert response.status_code == 200
```

### View Tests
- Visual inspection
- Automated UI tests (Selenium/Playwright)
- Accessibility checks

---

## AI Tool Integration

**How AI tools should use this architecture:**

When generating code, AI assistants should:
1. **Identify the layer** - "This is a controller change" vs "This is a DAL method"
2. **Respect boundaries** - Controllers never write SQL, DALs never handle HTTP
3. **Follow patterns** - Use existing DAL methods as templates
4. **Reference context** - Check `/docs/context/architecture/` before implementing

**Example AI grounding:**
> "Based on the MVC architecture in `/docs/context/architecture/mvc_structure.md`, implement a new DAL method in `resource_dal.py` to search resources by keyword. The method should return Model objects and use parameterized SQL queries. The controller will handle request parsing and response rendering."
