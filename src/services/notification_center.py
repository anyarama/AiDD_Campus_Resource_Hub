"""
Notification Center service
Aggregates actionable updates for the navbar notification badge.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional
from flask import url_for
from src.data_access.notification_dal import NotificationDAL
from src.data_access.message_dal import MessageDAL
from src.data_access.booking_dal import BookingDAL
from src.data_access.resource_dal import ResourceDAL
from src.utils.datetime_helpers import humanize_datetime


class NotificationCenter:
    """Compose a blended feed of notifications for the active user."""

    DEFAULT_LIMIT = 6
    ICONS = {
        'system': 'bi-broadcast-pin',
        'message': 'bi-chat-dots-fill',
        'booking': 'bi-calendar2-event',
        'resource': 'bi-patch-check-fill'
    }
    ACCENTS = {
        'system': 'muted',
        'message': 'info',
        'booking': 'warning',
        'resource': 'success'
    }

    def __init__(self, user):
        self.user = user
        self.last_seen_at = NotificationDAL.get_last_seen_timestamp(getattr(user, 'user_id', None))

    @classmethod
    def build_for_user(cls, user, limit: Optional[int] = None) -> Dict:
        """Return a payload containing nav-friendly notifications."""
        if not user or not getattr(user, 'user_id', None):
            return {'items': [], 'count': 0}
        builder = cls(user)
        return builder._build(limit or cls.DEFAULT_LIMIT)

    def _build(self, limit: int) -> Dict:
        feed: List[Dict] = []
        feed.extend(self._system_notifications())
        feed.extend(self._incoming_messages())
        feed.extend(self._resource_requests())
        feed.extend(self._resource_publications())

        feed.sort(key=lambda item: item.get('_sort_key') or datetime.min, reverse=True)
        trimmed = feed[:limit]
        for item in trimmed:
            item.pop('_sort_key', None)
        return {
            'items': trimmed,
            'count': len(trimmed),
            'new_count': sum(1 for item in trimmed if item.get('is_new'))
        }

    # Builders -----------------------------------------------------------------

    def _system_notifications(self) -> List[Dict]:
        rows = NotificationDAL.get_recent_notifications(self.user.user_id, limit=4)
        items = []
        for row in rows:
            dt_value = self._coerce_datetime(row.get('created_at'))
            items.append(self._format_item(
                item_id=f"system-{row.get('notification_id')}",
                category='system',
                title=row.get('subject') or 'Update',
                body=row.get('body'),
                timestamp=dt_value,
                url=url_for('dashboard')
            ))
        return items

    def _incoming_messages(self) -> List[Dict]:
        rows = MessageDAL.get_recent_incoming_messages(self.user.user_id, limit=3)
        items = []
        for row in rows:
            dt_value = self._coerce_datetime(row.get('timestamp'))
            sender = row.get('sender_name') or 'Participant'
            preview = self._truncate(row.get('content'))
            resource_hint = row.get('resource_title')
            subtitle = preview
            if resource_hint:
                subtitle = f"{preview} · {resource_hint}"
            items.append(self._format_item(
                item_id=f"message-{row.get('message_id')}",
                category='message',
                title=f"New message from {sender}",
                body=subtitle,
                timestamp=dt_value,
                url=url_for('message.view_thread', thread_id=row.get('thread_id'))
            ))
        return items

    def _resource_requests(self) -> List[Dict]:
        if self.user.role not in ('staff', 'admin'):
            return []
        rows = BookingDAL.get_recent_pending_requests_for_owner(self.user.user_id, limit=3)
        items = []
        for row in rows:
            dt_value = self._coerce_datetime(row.get('created_at') or row.get('start_datetime'))
            requester = row.get('requester_name') or 'Requester'
            resource_title = row.get('resource_title') or 'Resource'
            start_window = humanize_datetime(row.get('start_datetime'))
            subtitle = f"{requester} · {start_window}"
            items.append(self._format_item(
                item_id=f"booking-{row.get('booking_id')}",
                category='booking',
                title=f"Request for {resource_title}",
                body=subtitle,
                timestamp=dt_value,
                url=url_for('booking.detail', booking_id=row.get('booking_id'))
            ))
        return items

    def _resource_publications(self) -> List[Dict]:
        if self.user.role not in ('staff', 'admin'):
            return []
        resources = ResourceDAL.get_recently_published_by_owner(self.user.user_id, days=30, limit=3)
        items = []
        for resource in resources:
            dt_value = self._coerce_datetime(getattr(resource, 'created_at', None))
            items.append(self._format_item(
                item_id=f"resource-{resource.resource_id}",
                category='resource',
                title=f"\"{resource.title}\" is live",
                body='Your resource is published and visible in the directory.',
                timestamp=dt_value,
                url=url_for('resource.detail', resource_id=resource.resource_id)
            ))
        return items

    # Helpers ------------------------------------------------------------------

    def _format_item(self, *, item_id: str, category: str, title: str,
                     body: Optional[str], timestamp: Optional[datetime], url: str) -> Dict:
        dt_value = timestamp or self._utc_now()
        is_new = not self.last_seen_at or (dt_value and dt_value > self.last_seen_at)
        return {
            'id': item_id,
            'category': category,
            'icon': self.ICONS.get(category, 'bi-bell-fill'),
            'accent': self.ACCENTS.get(category, 'muted'),
            'title': title,
            'body': body,
            'url': url,
            'timestamp_iso': dt_value.isoformat() if dt_value else None,
            'time_display': self._relative_time(dt_value),
            '_sort_key': dt_value,
            'is_new': bool(is_new)
        }

    @staticmethod
    def _coerce_datetime(value) -> Optional[datetime]:
        if isinstance(value, datetime):
            return value
        if not value:
            return None
        for fmt in ('%Y-%m-%d %H:%M:%S', '%Y-%m-%dT%H:%M:%S', '%Y-%m-%dT%H:%M:%S.%f'):
            try:
                return datetime.strptime(str(value), fmt)
            except ValueError:
                continue
        try:
            return datetime.fromisoformat(str(value))
        except ValueError:
            return None

    @staticmethod
    def _relative_time(value: datetime) -> str:
        if not value:
            return ''
        now = NotificationCenter._utc_now()
        delta = now - value
        if delta < timedelta(minutes=1):
            return 'Just now'
        if delta < timedelta(hours=1):
            minutes = int(delta.total_seconds() // 60)
            return f"{minutes}m ago"
        if delta < timedelta(days=1):
            hours = int(delta.total_seconds() // 3600)
            return f"{hours}h ago"
        days = delta.days
        if days < 7:
            return f"{days}d ago"
        return value.strftime('%b %d')

    @staticmethod
    def _truncate(text: Optional[str], limit: int = 80) -> str:
        if not text:
            return ''
        stripped = text.strip()
        if len(stripped) <= limit:
            return stripped
        return stripped[:limit - 1].rstrip() + '…'

    @staticmethod
    def _utc_now() -> datetime:
        """Return a naive UTC timestamp for consistent comparisons."""
        return datetime.now(timezone.utc).replace(tzinfo=None)
