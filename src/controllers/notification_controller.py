"""
Notification Controller
Exposes lightweight endpoints for nav notification UX.
"""
from datetime import datetime, timezone
from flask import Blueprint, jsonify
from flask_login import login_required, current_user

from src.data_access.notification_dal import NotificationDAL
from src.services.notification_center import NotificationCenter

notification_bp = Blueprint('notification', __name__, url_prefix='/notifications')


@notification_bp.route('/feed')
@login_required
def feed():
    """Return JSON payload for the notification dropdown."""
    payload = NotificationCenter.build_for_user(current_user)
    return jsonify(payload)


@notification_bp.route('/ack', methods=['POST'])
@login_required
def ack():
    """Mark notifications as seen."""
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    NotificationDAL.update_last_seen(current_user.user_id, now)
    payload = NotificationCenter.build_for_user(current_user)
    return jsonify({'success': True, 'payload': payload})
