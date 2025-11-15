import os
from datetime import timedelta

from dotenv import load_dotenv

# Automatically ingest local environment settings (e.g., Google OAuth secrets)
# so developers can keep credentials in a .env file ignored by git.
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
ENV_PATH = os.path.join(BASE_DIR, '..', '.env')
load_dotenv(ENV_PATH)


class Config:
    """Application configuration"""
    
    # Secret key for session management and CSRF
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    
    # Database configuration
    BASE_DIR = BASE_DIR
    DATABASE_PATH = os.path.join(BASE_DIR, '..', 'campus_hub.db')

    # File upload configuration
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'static', 'uploads')
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5MB max file size
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    
    # Session configuration
    PERMANENT_SESSION_LIFETIME = timedelta(hours=24)
    # Auto-detect production environment for secure cookies
    SESSION_COOKIE_SECURE = os.environ.get('FLASK_ENV') == 'production'
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'

    # WTForms CSRF protection
    WTF_CSRF_ENABLED = True
    WTF_CSRF_TIME_LIMIT = None  # No time limit for CSRF tokens

    # Security headers
    SEND_FILE_MAX_AGE_DEFAULT = 31536000  # 1 year for static files

    # Content Security Policy (CSP) - Additional protection against XSS
    # Note: Implement via middleware in app.py if needed
    CSP_ENABLED = os.environ.get('CSP_ENABLED', 'False').lower() == 'true'
    
    # Application settings
    RESOURCES_PER_PAGE = 12
    MESSAGES_PER_PAGE = 20
    DEFAULT_SCHEDULE_TEMPLATE = os.environ.get('DEFAULT_SCHEDULE_TEMPLATE', 'business')

    # Registration restrictions
    ALLOWED_EMAIL_DOMAINS = {'iu.edu'}

    # Email verification settings
    EMAIL_VERIFICATION_ENABLED = os.environ.get('EMAIL_VERIFICATION_ENABLED', 'True').lower() == 'true'
    EMAIL_VERIFICATION_TOKEN_EXPIRY_HOURS = int(os.environ.get('EMAIL_VERIFICATION_TOKEN_EXPIRY_HOURS', 24))

    # Email delivery settings
    EMAIL_NOTIFICATIONS_ENABLED = os.environ.get('EMAIL_NOTIFICATIONS_ENABLED', 'False').lower() == 'true'
    MAIL_SERVER = os.environ.get('MAIL_SERVER')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER')
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'True').lower() == 'true'
    MAIL_USE_SSL = os.environ.get('MAIL_USE_SSL', 'False').lower() == 'true'
    MAIL_TIMEOUT = int(os.environ.get('MAIL_TIMEOUT', 10))

    # Timezone configuration
    # Bloomington, Indiana is in Eastern Time Zone
    TIMEZONE = os.environ.get('TIMEZONE', 'America/Indiana/Indianapolis')

    # Calendar integrations
    GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')
    GOOGLE_OAUTH_REDIRECT_PATH = os.environ.get('GOOGLE_OAUTH_REDIRECT_PATH', '/calendar/google/callback')
    EXTERNAL_BASE_URL = os.environ.get('EXTERNAL_BASE_URL')
    GOOGLE_CALENDAR_SCOPES = ['https://www.googleapis.com/auth/calendar.events']
    CALENDAR_DEFAULT_TIMEZONE = os.environ.get('CALENDAR_DEFAULT_TIMEZONE', 'America/Indiana/Indianapolis')

    # Local LLM settings (Ollama, LM Studio, etc.)
    LOCAL_LLM_BASE_URL = os.environ.get('LOCAL_LLM_BASE_URL')
    LOCAL_LLM_MODEL = os.environ.get('LOCAL_LLM_MODEL', 'llama3.1')
    LOCAL_LLM_PROVIDER = os.environ.get('LOCAL_LLM_PROVIDER', 'ollama')
    LOCAL_LLM_API_KEY = os.environ.get('LOCAL_LLM_API_KEY')
    LOCAL_LLM_TIMEOUT = int(os.environ.get('LOCAL_LLM_TIMEOUT', 30))

    # Concierge inputs
    CONCIERGE_CONTEXT_DIR = os.environ.get('CONCIERGE_CONTEXT_DIR')
