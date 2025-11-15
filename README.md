# Campus Resource Hub 🎓

A modern full-stack web application for managing and booking campus resources including study rooms, lab equipment, event spaces, and more.

## ✨ Features

- **User Management**: Secure registration/login with role-aware access (Student, Staff, Admin)
- **Rich Resource Listings**: Capture availability rules, equipment, restricted access, and lifecycle status (draft/published/archived)
- **Powerful Search**: Filter by keyword, category, location, capacity, and availability window with sort options (recent, most booked, top rated)
- **Smart Booking Flow**: Calendar-based form with recurrence, automatic conflict detection, approval workflows, and simulated email notifications
- **Availability Planning**: Resource search shows a live availability calendar so students can see busy days before drilling into a resource
- **Messaging Threads**: Threaded conversations per resource between owners and requesters with contextual entry points
- **Reviews & Ratings**: Post-booking feedback gated to completed reservations with live aggregates and top-rated badges
- **Admin Suite**: Dedicated screens to manage users, resources, bookings, and moderate reviews
- **Responsive Design**: Polished UI that adapts to desktops, tablets, and phones
- **Moderation Controls**: Users can flag reviews/messages, and admins can suspend accounts, hide content, and log every action
- **Calendar Sync**: OAuth connection to Google Calendar plus downloadable iCal files for any booking
- **AI Resource Concierge**: Retrieval-based assistant that answers natural-language questions using docs/context markdown and the live resource directory

## 🚀 Quick Start

### Prerequisites

- Python 3.10 or higher
- pip (Python package manager)
- Git

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd aidd-capstone
```

2. **Create and activate virtual environment:**
```bash
# On Windows
python -m venv venv
venv\Scripts\activate

# On macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables**

Copy the example file and fill in your secrets (the `.env` file is ignored by git):

```bash
cp .env.example .env
```

Update `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and any other overrides you need. The app now loads this file automatically on startup via `python-dotenv`.

For day-to-day development, a committed `.flaskenv` already sets `FLASK_APP=src.app:create_app` and enables `FLASK_DEBUG=1`, so running `flask run` locally automatically provides hot reloading and the interactive debugger.

5. **Initialize (or upgrade) the database schema:**
```bash
python -c "from src.data_access import init_database; init_database()"
```

## 🛠️ Database Migrations

- For an existing `campus_hub.db`, re-run the initializer to apply the latest schema changes:

  ```bash
  python -c "from src.data_access import init_database; init_database()"
  ```

- Alternatively, run the SQL statements in `docs/migrations/001_schema_upgrade.sql` using your preferred SQLite client. Statements can be applied safely multiple times; duplicate-column errors may be ignored.

6. **Run the application (with live reload):**
```bash
flask run
```

> Tip: `python src/app.py` still works and now defaults to debug/reload mode unless you explicitly set `FLASK_DEBUG=0`.

7. **Access the application:**
Open your browser and navigate to `http://localhost:5000`

### Email Delivery Setup

Registration verification messages and transactional notifications are sent through SMTP when credentials are provided. By default they are only logged to the `notifications` table (and console) so development environments stay self-contained.

1. Set `EMAIL_NOTIFICATIONS_ENABLED=true` in your `.env`.
2. Provide `MAIL_SERVER`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, and `MAIL_DEFAULT_SENDER` (plus `MAIL_USE_TLS`/`MAIL_USE_SSL` if your provider requires specific security).
3. Restart `flask run`. Every call to `NotificationService.send_notification` will now attempt real delivery while still persisting the message for the in-app feed.

### Calendar Sync Setup

To enable Google Calendar integration you will need OAuth credentials from the [Google Cloud Console](https://console.cloud.google.com):

1. Create an OAuth 2.0 Client (type **Web application**) and add `http://localhost:5000/calendar/google/callback` as an authorized redirect URI for local development. Repeat for any deployed hosts (e.g., `https://your-domain.com/calendar/google/callback`).
2. Add the issued `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` values to your `.env`. You can also override `CALENDAR_DEFAULT_TIMEZONE` there.
   - The optional `GOOGLE_OAUTH_REDIRECT_PATH` accepts either the callback path (`/calendar/google/callback`) or a fully qualified URL (e.g., `https://your-domain.com/calendar/google/callback`). Setting the full URL is helpful when your production host differs from the hostname Flask sees behind a proxy; Google must see an exact match.
   - If your Flask app sits behind a load balancer or proxy that terminates HTTPS, set `EXTERNAL_BASE_URL=https://your-domain.com` (no trailing slash). The app combines that base with the redirect path so the URL sent to Google always matches the one registered in Cloud Console, even when Flask itself only sees `http://localhost`.
3. On the OAuth consent screen in Google Cloud Console, either publish the app (if you have a verified production domain) or add every tester’s Google account under **Test users**—Google rejects logins from anyone who is not whitelisted while the app is in “Testing” status.
4. Restart the Flask app and head to *Dashboard → Calendar Sync* to connect your Google account. Each booking detail page now offers both **Sync to Google Calendar** and **Download iCal** actions.

## 🤖 Resource Concierge

The Resource Concierge blends information from the `/docs/context/*.md` knowledge pack with the published records in `campus_hub.db`. Ask natural-language questions (e.g., “Which 3D printer labs require approvals?”) and the assistant responds with:

- Verified answers that never leave the project sandbox
- Inline citations referencing the exact markdown section(s)
- Live resource matches pulled from the SQLite catalog

Access it from the global navigation via **Concierge** or visit [`/concierge`](http://localhost:5000/concierge).

### Optional: Local LLM reasoning

If you want richer language output (still grounded in the project data), point the app to a local LLM runtime such as [Ollama](https://ollama.com) or [LM Studio](https://lmstudio.ai). Both expose HTTP chat APIs, so configure them through environment variables:

```
LOCAL_LLM_BASE_URL=http://localhost:11434      # Ollama default or LM Studio host
LOCAL_LLM_PROVIDER=ollama                      # or "openai" for LM Studio/OpenAI-compatible APIs
LOCAL_LLM_MODEL=llama3.1                       # Model tag exposed by your runtime
LOCAL_LLM_API_KEY=                             # Optional (LM Studio/OpenAI style only)
LOCAL_LLM_TIMEOUT=30                           # Seconds
```

When these values are present, the concierge runs the retrieved snippets/local resource data through your local model and clearly labels the response as “Answer synthesized by your local AI using verified data.”

## 📁 Project Structure

```
campus-resource-hub/
├── .prompt/                  # AI development logs
│   ├── dev_notes.md
│   └── golden_prompts.md
├── docs/context/            # Context pack for AI tools
│   ├── APA/
│   ├── DT/
│   ├── PM/
│   └── shared/
├── src/
│   ├── controllers/         # Flask route handlers (MVC Controllers)
│   │   ├── auth_controller.py
│   │   ├── resource_controller.py
│   │   ├── booking_controller.py
│   │   ├── message_controller.py
│   │   ├── review_controller.py
│   │   ├── admin_controller.py
│   │   ├── calendar_controller.py
│   │   ├── accessibility_controller.py
│   │   ├── notification_controller.py
│   │   └── concierge_controller.py
│   ├── models/             # Data models (MVC Models)
│   │   └── models.py
│   ├── data_access/        # Data Access Layer (DAL)
│   │   ├── user_dal.py
│   │   ├── resource_dal.py
│   │   ├── booking_dal.py
│   │   ├── message_dal.py
│   │   ├── review_dal.py
│   │   ├── calendar_dal.py
│   │   ├── notification_dal.py
│   │   ├── admin_log_dal.py
│   │   ├── waitlist_dal.py
│   │   └── sample_data.py
│   ├── views/              # HTML templates (MVC Views)
│   │   ├── layout.html
│   │   ├── index.html
│   │   ├── auth/
│   │   ├── resources/
│   │   ├── bookings/
│   │   ├── messages/
│   │   ├── dashboard/
│   │   └── admin/
│   ├── static/             # CSS, JS, and uploads
│   │   ├── css/
│   │   ├── js/
│   │   └── uploads/
│   ├── utils/              # Utility functions
│   │   ├── validators.py
│   │   ├── availability.py
│   │   ├── calendar_sync.py
│   │   ├── datetime_helpers.py
│   │   ├── email_client.py
│   │   ├── email_verification.py
│   │   ├── notifications.py
│   │   └── permissions.py
│   ├── services/           # Business logic services
│   │   ├── accessibility_audit.py
│   │   ├── calendar_service.py
│   │   ├── concierge_service.py
│   │   ├── llm_client.py
│   │   └── notification_center.py
│   ├── config.py           # Application configuration
│   └── app.py              # Main Flask application
├── tests/                  # Test suite
│   ├── test_auth.py
│   ├── test_booking.py
│   ├── test_dal.py
│   ├── test_integration.py
│   └── ... (additional test files)
├── requirements.txt
└── README.md
```

## 🏗️ Architecture

### MVC Pattern

This application follows the Model-View-Controller (MVC) architecture:

- **Models** (`src/models/`): Define data structures
- **Views** (`src/views/`): Jinja2 HTML templates for presentation
- **Controllers** (`src/controllers/`): Flask routes handling business logic
- **Data Access Layer** (`src/data_access/`): Encapsulates all database operations

### Tech Stack

- **Backend**: Flask (Python)
- **Database**: SQLite (PostgreSQL-ready)
- **Frontend**: HTML5, CSS3, Bootstrap 5, Vanilla JavaScript
- **Authentication**: Flask-Login with bcrypt password hashing
- **Security**: CSRF protection, input validation, XSS prevention

## 👥 User Roles

1. **Student**: Browse and book resources, leave reviews
2. **Staff**: All student permissions + approve bookings for their resources
3. **Admin**: Full system access including user management

## 🎯 Demo Data & Sample Accounts

The application seeds a starter dataset focused on Indiana University Bloomington each time it launches. This includes curated resources like Wells Library study suites, the Luddy School prototyping lab, Kelley podcast studio, SRSC courts, and IU Auditorium so new users can immediately explore realistic bookings.

Sample login credentials are also provided so you can exercise every role without manual setup:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@iu.edu` | `AdminPass1!` |
| Staff | `staff@iu.edu` | `StaffPass1!` |
| Student | `student@iu.edu` | `StudentPass1!` |

Only these three accounts are created by default so role-based workflows stay focused on the primary personas.

## 🔒 Security Features

- ✅ Password hashing with bcrypt
- ✅ CSRF token protection on all forms
- ✅ Server-side input validation and sanitization
- ✅ SQL injection prevention via parameterized queries
- ✅ XSS protection through template escaping
- ✅ Secure file upload handling
- ✅ Role-based access control

## 🧪 Running Tests

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_booking.py

# Run with coverage
pytest --cov=src tests/
```

- Unit tests cover validation, DAL CRUD operations, and booking conflict/status logic.
- Integration tests exercise the auth workflow and an end-to-end booking scenario (`tests/test_integration.py`).
- Security regression checks guard against HTML injection and SQL injection attempts.

## 📝 Creating Your First Admin User

After running the application, register a new user and then update their role in the database:

```python
from src.data_access.user_dal import UserDAL
UserDAL.update_user(1, role='admin')  # Update user_id 1 to admin
```

## 🎨 Customization

### Changing Colors

Edit `src/static/css/style.css` and modify the CSS variables:

```css
:root {
    --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    /* ... more variables */
}
```

### Adding New Categories

Edit the categories list in `src/controllers/resource_controller.py`.

## 🐛 Troubleshooting

**Port already in use:**
```bash
# Change port in src/app.py:
app.run(debug=True, host='0.0.0.0', port=8080)
```

**Database locked error:**
- Make sure no other process is accessing the database
- Restart the application

**Import errors:**
- Ensure you're in the activated virtual environment
- Reinstall requirements: `pip install -r requirements.txt`

## 📦 Deployment

### Heroku Deployment

1. Create a `Procfile`:
```
web: gunicorn src.app:app
```

2. Add gunicorn to requirements.txt:
```bash
echo "gunicorn==21.2.0" >> requirements.txt
```

3. Deploy:
```bash
heroku create your-app-name
git push heroku main
```

## 🤝 Contributing

This is an academic project for the AiDD Core module. Contributions should follow the project requirements and include:

- Proper documentation in `.prompt/dev_notes.md`
- Test coverage for new features
- Code adhering to the MVC pattern

## 📄 License

This project is created for educational purposes as part of the AiDD 2025 Capstone Project.

## 🙏 Acknowledgments

- Built for the AI Driven Development (AiDD / X501) course
- Instructor: Prof. Jay Newquist
- Kelley School of Business, Fall 2025

## 📞 Support

For issues or questions:
- Check the troubleshooting section
- Review the project documentation
- Contact your course instructor

---

**Project Status**: ✅ Core features complete | 🚧 Optional features in progress
