"""
Input validation utilities
Server-side validation for all user inputs
"""
import re
from datetime import datetime
import bleach

class Validator:
    """Input validation utilities"""
    
    @staticmethod
    def validate_email(email):
        """Validate email format"""
        if not email or len(email) > 254:
            return False
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
    
    @staticmethod
    def validate_password(password):
        """Validate password strength (min 8 chars, 1 upper, 1 lower, 1 digit)"""
        if not password or len(password) < 8:
            return False, "Password must be at least 8 characters long"
        if not re.search(r'[A-Z]', password):
            return False, "Password must contain at least one uppercase letter"
        if not re.search(r'[a-z]', password):
            return False, "Password must contain at least one lowercase letter"
        if not re.search(r'\d', password):
            return False, "Password must contain at least one digit"
        return True, "Valid"
    
    @staticmethod
    def validate_string(value, min_len=1, max_len=1000, field_name="Field"):
        """Validate string length"""
        if not value or not isinstance(value, str):
            return False, f"{field_name} is required"
        if len(value.strip()) < min_len:
            return False, f"{field_name} must be at least {min_len} characters"
        if len(value) > max_len:
            return False, f"{field_name} must not exceed {max_len} characters"
        return True, "Valid"
    
    @staticmethod
    def validate_integer(value, min_val=None, max_val=None, field_name="Field"):
        """Validate integer value"""
        try:
            val = int(value)
            if min_val is not None and val < min_val:
                return False, f"{field_name} must be at least {min_val}"
            if max_val is not None and val > max_val:
                return False, f"{field_name} must not exceed {max_val}"
            return True, val
        except (ValueError, TypeError):
            return False, f"{field_name} must be a valid number"
    
    @staticmethod
    def validate_datetime(datetime_str, field_name="Date/Time"):
        """Validate datetime string and convert from local timezone to UTC"""
        try:
            from zoneinfo import ZoneInfo
            from src.config import Config

            # Parse the datetime string (from datetime-local input)
            dt = datetime.fromisoformat(datetime_str.replace('Z', '+00:00'))

            # If datetime is naive (no timezone info from form), assume it's in local timezone
            if dt.tzinfo is None:
                local_tz = ZoneInfo(Config.TIMEZONE)
                dt = dt.replace(tzinfo=local_tz)

            # Convert to UTC and make naive for database storage
            utc_dt = dt.astimezone(ZoneInfo('UTC')).replace(tzinfo=None)
            return True, utc_dt
        except (ValueError, AttributeError):
            return False, f"{field_name} must be a valid date and time"

    @staticmethod
    def validate_datetime_range(start_dt, end_dt, allow_past=False, max_days_future=365):
        """
        Validate datetime range for bookings.

        Args:
            start_dt: Start datetime object (in UTC, naive)
            end_dt: End datetime object (in UTC, naive)
            allow_past: Whether to allow dates in the past (default False)
            max_days_future: Maximum days in future allowed (default 365)

        Returns:
            Tuple (is_valid, error_message)
        """
        from datetime import datetime, timedelta
        from zoneinfo import ZoneInfo
        from src.config import Config

        # Get current time in UTC (naive) for comparison with database times
        now = datetime.now(ZoneInfo('UTC')).replace(tzinfo=None)

        # Check end is after start
        if end_dt <= start_dt:
            return False, "End time must be after start time"

        # Check not in the past (unless explicitly allowed)
        if not allow_past and start_dt < now:
            return False, "Cannot book dates in the past"

        # Check reasonable booking duration (max 7 days per booking)
        duration = (end_dt - start_dt).total_seconds() / 3600  # hours
        if duration > 168:  # 7 days
            return False, "Booking duration cannot exceed 7 days"

        # Check minimum duration (at least 30 minutes)
        if duration < 0.5:
            return False, "Booking must be at least 30 minutes"

        # Check not too far in future
        if max_days_future and (start_dt - now).days > max_days_future:
            return False, f"Cannot book more than {max_days_future} days in advance"

        return True, "Valid"

    @staticmethod
    def validate_file_type(filename, allowed_extensions=None):
        """
        Validate file extension.

        Args:
            filename: Name of the file
            allowed_extensions: Set of allowed extensions (default: images only)

        Returns:
            Tuple (is_valid, error_message)
        """
        if not filename:
            return False, "Filename is required"

        if allowed_extensions is None:
            allowed_extensions = {'png', 'jpg', 'jpeg', 'gif'}

        if '.' not in filename:
            return False, "File must have an extension"

        extension = filename.rsplit('.', 1)[1].lower()

        if extension not in allowed_extensions:
            return False, f"File type .{extension} not allowed. Allowed types: {', '.join(allowed_extensions)}"

        return True, extension
    
    @staticmethod
    def validate_rating(rating):
        """Validate rating (1-5)"""
        return Validator.validate_integer(rating, 1, 5, "Rating")
    
    @staticmethod
    def validate_role(role):
        """Validate user role"""
        valid_roles = ['student', 'staff', 'admin']
        if role not in valid_roles:
            return False, f"Role must be one of: {', '.join(valid_roles)}"
        return True, "Valid"
    
    @staticmethod
    def validate_status(status, valid_statuses):
        """Validate status against allowed values"""
        if status not in valid_statuses:
            return False, f"Status must be one of: {', '.join(valid_statuses)}"
        return True, "Valid"
    
    @staticmethod
    def sanitize_html(text):
        """
        Production-grade HTML sanitization using bleach library.
        Removes all HTML tags and attributes for maximum security.
        """
        if not text:
            return ""

        # Use bleach to strip all HTML tags and attributes
        # This is the safest approach for user-generated content
        cleaned = bleach.clean(
            text,
            tags=[],  # Allow no HTML tags
            attributes={},  # Allow no attributes
            strip=True  # Remove tags instead of escaping them
        )

        return cleaned.strip()

    @staticmethod
    def sanitize_html_basic(text, allowed_tags=None):
        """
        HTML sanitization that allows specific safe tags.
        Use only when you need to preserve formatting.
        """
        if not text:
            return ""

        if allowed_tags is None:
            # Safe tags that don't allow script execution
            allowed_tags = ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li']

        # Safe attributes (none by default for maximum security)
        allowed_attributes = {}

        cleaned = bleach.clean(
            text,
            tags=allowed_tags,
            attributes=allowed_attributes,
            strip=True
        )

        return cleaned.strip()
