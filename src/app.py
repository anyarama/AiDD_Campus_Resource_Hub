"""
Main Flask Application
Campus Resource Hub
"""
import os
import sys

# Avoid writing to /dev/shm when the environment disallows it by forcing
# multiprocessing arenas to use the fallback temp directory instead.
try:
    import multiprocessing.heap as mp_heap
    mp_heap.Arena._dir_candidates = []
except ImportError:
    pass

# Ensure the project root is on the Python path when running as a script
PROJECT_ROOT = os.path.dirname(os.path.abspath(os.path.join(__file__, os.pardir)))
if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)

from flask import Flask, render_template, redirect, url_for, flash
from flask_login import LoginManager, current_user, logout_user
from flask_wtf import CSRFProtect
from datetime import datetime
from src.config import Config
from src.data_access import init_database
from src.data_access.user_dal import UserDAL
from src.data_access.resource_dal import ResourceDAL
from src.data_access.booking_dal import BookingDAL
from src.data_access.review_dal import ReviewDAL
from src.data_access.message_dal import MessageDAL
from src.data_access.calendar_dal import CalendarCredentialDAL
from src.data_access.sample_data import ensure_sample_content
from src.controllers import (
    auth_bp,
    resource_bp,
    booking_bp,
    message_bp,
    review_bp,
    admin_bp,
    calendar_bp,
    accessibility_bp,
    notification_bp,
    concierge_bp
)
from src.utils.calendar_sync import GOOGLE_PROVIDER
from src.services.notification_center import NotificationCenter

def create_app():
    """Application factory"""
    # Use absolute paths for static and template folders
    static_folder = os.path.abspath(os.path.join(os.path.dirname(__file__), 'static'))
    template_folder = os.path.abspath(os.path.join(os.path.dirname(__file__), 'views'))
    app = Flask(__name__, template_folder=template_folder, static_folder=static_folder)
    app.config.from_object(Config)

    # Configure caching based on environment
    # In production, cache static files for 1 year (31536000 seconds)
    # In development, disable caching for easier CSS/JS changes
    is_production = app.config.get('ENV') == 'production' or os.environ.get('FLASK_ENV') == 'production'
    app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 31536000 if is_production else 0

    # Enable CSRF protection for forms
    CSRFProtect(app)
    
    # Ensure upload folder exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Initialize database and load demo fixtures
    init_database()
    ensure_sample_content()
    
    # Setup Flask-Login
    login_manager = LoginManager()
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    login_manager.login_message = 'Please log in to access this page'
    login_manager.login_message_category = 'info'
    
    @login_manager.user_loader
    def load_user(user_id):
        """Load user for Flask-Login"""
        user = UserDAL.get_user_by_id(int(user_id))
        return user
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(resource_bp)
    app.register_blueprint(booking_bp)
    app.register_blueprint(message_bp)
    app.register_blueprint(review_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(calendar_bp)
    app.register_blueprint(accessibility_bp)
    app.register_blueprint(notification_bp)
    app.register_blueprint(concierge_bp)

    @app.before_request
    def enforce_account_health():
        """Force logout for suspended users before handling the request."""
        if current_user.is_authenticated and getattr(current_user, 'is_suspended', False):
            logout_user()
            flash('Your account is currently suspended. Please contact an administrator.', 'danger')
            return redirect(url_for('auth.login'))

    @app.context_processor
    def inject_cache_bust():
        """Add cache busting timestamp to templates."""
        import time
        return dict(cache_bust=int(time.time()))

    @app.context_processor
    def inject_nav_notifications():
        """Expose notification payload to every template."""
        payload = {'items': [], 'count': 0}
        if current_user.is_authenticated:
            payload = NotificationCenter.build_for_user(current_user, limit=6)
        return {
            'nav_notifications': payload.get('items', []),
            'nav_notification_total': payload.get('count', 0),
            'nav_notification_new_count': payload.get('new_count', 0)
        }
    
    # Main routes
    @app.route('/')
    def index():
        """Homepage"""
        featured_resources = ResourceDAL.get_all_resources(status='published', limit=6)
        resources_with_ratings = []
        top_rated_threshold = 4.5
        for resource in featured_resources:
            stats = ReviewDAL.get_resource_rating_stats(resource.resource_id)
            avg_rating = stats['avg_rating'] if stats and stats['avg_rating'] else 0
            total_reviews = stats['total_reviews'] if stats else 0
            resources_with_ratings.append({
                'resource': resource,
                'avg_rating': round(avg_rating, 1),
                'total_reviews': total_reviews,
                'is_top_rated': avg_rating >= top_rated_threshold and total_reviews >= 3
            })

        # Get total count of published resources for homepage stats
        all_resources = ResourceDAL.get_all_resources(status='published')
        total_resources_count = len(all_resources) if all_resources else 0

        return render_template('index.html',
                               featured_resources=resources_with_ratings,
                               total_resources_count=total_resources_count)
    
    @app.route('/dashboard')
    def dashboard():
        """User dashboard"""
        if not current_user.is_authenticated:
            return redirect(url_for('auth.login'))

        my_bookings = BookingDAL.get_bookings_by_requester(current_user.user_id)
        my_resources = ResourceDAL.get_resources_by_owner(current_user.user_id)
        google_connection = CalendarCredentialDAL.get_credentials(current_user.user_id, GOOGLE_PROVIDER)
        can_manage_resources = True  # All authenticated users can create and manage resources
        listings_preview = my_resources[:3]
        message_threads = MessageDAL.get_user_threads(current_user.user_id)
        recent_threads = message_threads[:3]
        calendar_connected = bool(getattr(current_user, 'calendar_connected', False) or google_connection)
        calendar_last_synced = (
            google_connection.get('updated_at') if google_connection else None
        )

        # Get active waitlist entries
        from src.data_access.waitlist_dal import WaitlistDAL
        my_waitlist = WaitlistDAL.get_entries_by_requester(current_user.user_id, statuses=['active'])

        # Cache resources so we can display titles in the dashboard
        resource_cache = {resource.resource_id: resource for resource in my_resources}
        booking_details = {}
        user_cache = {current_user.user_id: current_user}

        def resolve_resource(resource_id):
            """Fetch resource details with simple caching"""
            resource = resource_cache.get(resource_id)
            if resource is None:
                resource = ResourceDAL.get_resource_by_id(resource_id)
                resource_cache[resource_id] = resource
            return resource

        def resolve_user(user_id):
            """Fetch user details with simple caching"""
            user = user_cache.get(user_id)
            if user is None:
                user = UserDAL.get_user_by_id(user_id)
                user_cache[user_id] = user
            return user

        def ensure_booking_metadata(booking):
            """Attach metadata for rendering dashboard tables"""
            if booking.booking_id not in booking_details:
                resource = resolve_resource(booking.resource_id)
                title = resource.title if resource else f"Resource #{booking.resource_id}"
                requester = resolve_user(booking.requester_id)
                requester_name = requester.name if requester else f"User #{booking.requester_id}"
                booking_details[booking.booking_id] = {
                    'title': title,
                    'requester_name': requester_name
                }

        for booking in my_bookings:
            ensure_booking_metadata(booking)
        
        # Get bookings for my resources
        resource_bookings = []
        for resource in my_resources:
            bookings = BookingDAL.get_bookings_by_resource(resource.resource_id)
            for booking in bookings:
                ensure_booking_metadata(booking)
                if (
                    booking.status == 'pending'
                    and booking.requester_id != current_user.user_id
                ):
                    resource_bookings.append(booking)
        resource_bookings.sort(key=lambda b: str(b.start_datetime or ''))

        # Calculate activity stats
        booking_stats = {
            'total': len(my_bookings),
            'upcoming': len([b for b in my_bookings if b.status in ['approved', 'pending']]),
            'completed': len([b for b in my_bookings if b.status == 'completed']),
            'pending': len([b for b in my_bookings if b.status == 'pending']),
            'cancelled': len([b for b in my_bookings if b.status == 'cancelled'])
        }

        # Get category breakdown for user's bookings
        category_counts = {}
        for booking in my_bookings:
            resource = resolve_resource(booking.resource_id)
            if resource and resource.category:
                category_counts[resource.category] = category_counts.get(resource.category, 0) + 1

        most_used_category = max(category_counts.items(), key=lambda x: x[1])[0] if category_counts else None

        # Enrich waitlist entries with resource details
        waitlist_with_resources = []
        for entry in my_waitlist:
            resource = resolve_resource(entry.resource_id)
            waitlist_with_resources.append({
                'entry': entry,
                'resource_title': resource.title if resource else f"Resource #{entry.resource_id}",
                'resource': resource
            })

        return render_template(
            'dashboard/dashboard.html',
            my_bookings=my_bookings,
            my_resources=my_resources,
            resource_bookings=resource_bookings,
            booking_details=booking_details,
            google_connection=google_connection,
            calendar_connected=calendar_connected,
            calendar_last_synced=calendar_last_synced,
            listings_preview=listings_preview,
            can_manage_resources=can_manage_resources,
            recent_message_threads=recent_threads,
            total_message_threads=len(message_threads),
            booking_stats=booking_stats,
            most_used_category=most_used_category,
            my_waitlist=waitlist_with_resources
        )
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(e):
        return render_template('errors/404.html'), 404
    
    @app.errorhandler(500)
    def server_error(e):
        return render_template('errors/500.html'), 500
    
    # Template filters
    def _parse_datetime(value):
        """Convert ISO strings or datetimes into datetime objects, and convert from UTC to local timezone."""
        from zoneinfo import ZoneInfo
        
        if isinstance(value, datetime):
            dt = value
        elif isinstance(value, str):
            try:
                normalized = value.replace('Z', '+00:00')
                dt = datetime.fromisoformat(normalized)
            except ValueError:
                return None
        else:
            return None
        
        # If datetime is naive (no timezone), assume it's UTC (from database)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=ZoneInfo('UTC'))
        
        # Convert to local timezone for display
        local_tz = ZoneInfo(Config.TIMEZONE)
        dt_local = dt.astimezone(local_tz)
        
        return dt_local

    @app.template_filter('datetime_format')
    def datetime_format(value, format='%B %d, %Y at %I:%M %p'):
        """Format datetime for display in local timezone"""
        dt_val = _parse_datetime(value)
        return dt_val.strftime(format) if dt_val else (value or '')

    @app.template_filter('relative_time')
    def relative_time(value):
        """Return a short relative time string such as '2h ago'."""
        from zoneinfo import ZoneInfo
        
        dt_val = _parse_datetime(value)
        if dt_val is None:
            return ''
        
        # Get current time in local timezone
        now = datetime.now(ZoneInfo(Config.TIMEZONE))
        delta = now - dt_val
        seconds = delta.total_seconds()
        
        if seconds < 0:
            seconds = abs(seconds)
        
        minutes = int(seconds // 60)
        hours = int(seconds // 3600)
        days = int(seconds // 86400)
        
        if seconds < 60:
            return 'Just now'
        if minutes < 60:
            return f"{minutes} min ago"
        if hours < 24:
            return f"{hours}h ago"
        if days == 1:
            return 'Yesterday'
        if days < 7:
            return f"{days}d ago"
        return dt_val.strftime('%b %d, %Y')
    
    @app.template_filter('nl2br')
    def nl2br(value):
        """Convert newlines to <br> tags for HTML display."""
        if value is None:
            return ''
        return str(value).replace('\n', '<br>')
    
    @app.template_filter('markdown_bold')
    def markdown_bold(value):
        """Convert markdown-style **bold** to HTML <strong> tags."""
        if value is None:
            return ''
        import re
        # Convert **text** to <strong>text</strong>
        text = str(value)
        text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
        return text
    
    return app

def _can_enable_debug():
    """Return True when the runtime can allocate the IPC resources debugger needs."""
    try:
        from multiprocessing import Lock
        lock = Lock()
    except PermissionError:
        return False

    try:
        lock.acquire()
        lock.release()
        return True
    except PermissionError:
        return False


if __name__ == '__main__':
    app = create_app()
    debug_env = os.environ.get('FLASK_DEBUG')
    debug_mode = True if debug_env is None else debug_env == '1'

    if debug_mode and not _can_enable_debug():
        debug_mode = False
        print('Debug mode disabled: insufficient permissions for multiprocessing locks.', file=sys.stderr)

    app.run(debug=debug_mode, host='0.0.0.0', port=5000)
