"""
Admin Controller
Handles administrative functions and dashboard
"""
from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required, current_user
from functools import wraps
from datetime import datetime
from src.data_access.user_dal import UserDAL
from src.data_access.resource_dal import ResourceDAL
from src.data_access.booking_dal import BookingDAL
from src.data_access.review_dal import ReviewDAL
from src.data_access.message_dal import MessageDAL
from src.data_access.admin_log_dal import AdminLogDAL
from src.utils.notifications import NotificationService
from src.utils.validators import Validator

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

def admin_required(f):
    """Decorator to require admin role"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or current_user.role != 'admin':
            flash('Admin access required', 'danger')
            return redirect(url_for('index'))
        return f(*args, **kwargs)
    return decorated_function


def format_datetime(value):
    """Format datetime or ISO strings for admin tables"""
    if isinstance(value, datetime):
        dt_obj = value
    else:
        try:
            dt_obj = datetime.fromisoformat(str(value))
        except ValueError:
            return value
    return dt_obj.strftime('%b %d, %Y %I:%M %p')


def parse_datetime(value):
    """Convert strings or datetimes into datetime objects."""
    if isinstance(value, datetime):
        return value
    if not value:
        return None
    try:
        return datetime.fromisoformat(str(value))
    except ValueError:
        return None

@admin_bp.route('/')
@login_required
@admin_required
def dashboard():
    """Admin dashboard"""
    users = UserDAL.get_all_users()
    all_resources = ResourceDAL.get_all_resources(status=None)
    pending_bookings = BookingDAL.get_pending_bookings()
    booking_trend = BookingDAL.monthly_booking_trend(months=6)
    user_trend = UserDAL.monthly_registration_trend(months=6)
    booking_status_rows = BookingDAL.booking_status_breakdown()
    category_summary = ResourceDAL.category_distribution(limit=6)
    
    stats = {
        'total_users': len(users),
        'total_resources': len(all_resources),
        'pending_bookings': len(pending_bookings),
        'students': len([u for u in users if u.role == 'student']),
        'staff': len([u for u in users if u.role == 'staff']),
        'admins': len([u for u in users if u.role == 'admin'])
    }
    status_counts = {
        'draft': len([r for r in all_resources if r.status == 'draft']),
        'published': len([r for r in all_resources if r.status == 'published']),
        'archived': len([r for r in all_resources if r.status == 'archived'])
    }
    department_usage = BookingDAL.summarize_by_department()
    department_total = sum(row.get('total', 0) for row in department_usage)
    resource_lookup = {resource.resource_id: resource for resource in all_resources}
    draft_resources = [resource for resource in all_resources if resource.status == 'draft']

    def month_sequence(window=6):
        base = datetime.utcnow().replace(day=1)
        keys = []
        for offset in range(window - 1, -1, -1):
            year = base.year
            month = base.month - offset
            while month <= 0:
                month += 12
                year -= 1
            keys.append(f"{year}-{month:02d}")
        return keys

    def format_month_label(month_value):
        if not month_value:
            return 'Unknown'
        try:
            dt_obj = datetime.strptime(f"{month_value}-01", '%Y-%m-%d')
            return dt_obj.strftime('%b %Y')
        except ValueError:
            return month_value

    def attach_labels(rows, window=6):
        lookup = {row['month']: row for row in (rows or []) if row.get('month')}
        formatted = []
        for key in month_sequence(window):
            entry = dict(lookup.get(key) or {'month': key})
            entry.setdefault('total', 0)
            entry.setdefault('approved', 0)
            entry.setdefault('pending', 0)
            entry.setdefault('completed', 0)
            entry.setdefault('rejected', 0)
            entry['label'] = format_month_label(key)
            formatted.append(entry)
        return formatted

    booking_status_map = {row['status']: row['total'] for row in booking_status_rows}
    booking_status_labels = [
        ('Pending', 'pending'),
        ('Approved', 'approved'),
        ('Completed', 'completed'),
        ('Rejected', 'rejected'),
        ('Cancelled', 'cancelled')
    ]
    booking_series = attach_labels(booking_trend)
    user_series = attach_labels(user_trend)
    chart_data = {
        'bookingTrend': booking_series,
        'userGrowth': user_series,
        'roleMix': [
            {'label': 'Students', 'value': stats['students']},
            {'label': 'Staff', 'value': stats['staff']},
            {'label': 'Admins', 'value': stats['admins']}
        ],
        'resourceStatus': [
            {'label': 'Draft', 'value': status_counts['draft']},
            {'label': 'Published', 'value': status_counts['published']},
            {'label': 'Archived', 'value': status_counts['archived']}
        ],
        'bookingStatus': [
            {'label': label, 'value': booking_status_map.get(key, 0)}
            for label, key in booking_status_labels
        ],
        'departmentUsage': department_usage,
        'topCategories': category_summary
    }

    def summarize_delta(series, key='total'):
        current = series[-1].get(key, 0) if series else 0
        previous = series[-2].get(key, 0) if len(series) > 1 else 0
        delta = current - previous
        delta_pct = (delta / previous * 100) if previous else None
        return current, delta, delta_pct

    user_current, user_delta, user_delta_pct = summarize_delta(user_series)
    booking_current, booking_delta, booking_delta_pct = summarize_delta(booking_series)

    booking_status_total = sum(booking_status_map.values())
    approval_rate_pct = 0
    if booking_status_total:
        approved = booking_status_map.get('approved', 0)
        completed = booking_status_map.get('completed', 0)
        approval_rate_pct = ((approved + completed) / booking_status_total) * 100

    publish_rate_pct = (status_counts['published'] / stats['total_resources']) * 100 if stats['total_resources'] else 0
    draft_share_pct = (status_counts['draft'] / stats['total_resources']) * 100 if stats['total_resources'] else 0

    now = datetime.utcnow()
    pending_dates = []
    for booking in pending_bookings:
        created_value = parse_datetime(getattr(booking, 'created_at', None))
        start_value = parse_datetime(getattr(booking, 'start_datetime', None))
        pending_dates.append(created_value or start_value)
    pending_dates = [dt for dt in pending_dates if dt]
    queue_age_days = None
    if pending_dates:
        oldest = min(pending_dates)
        queue_age_days = max((now - oldest).days, 0)

    if queue_age_days is None:
        queue_age_text = ''
    elif queue_age_days == 0:
        queue_age_text = 'today'
    elif queue_age_days == 1:
        queue_age_text = '1 day ago'
    else:
        queue_age_text = f'{queue_age_days} days ago'

    insights = {
        'queue_age_days': queue_age_days,
        'queue_age_text': queue_age_text,
        'monthly_new_users': user_current,
        'user_delta': user_delta,
        'user_delta_pct': user_delta_pct,
        'publish_rate_pct': publish_rate_pct,
        'draft_share_pct': draft_share_pct,
        'booking_delta': booking_delta,
        'booking_delta_pct': booking_delta_pct,
        'booking_status_total': booking_status_total,
        'approval_rate_pct': approval_rate_pct
    }

    return render_template(
        'admin/admin_dashboard.html',
        stats=stats,
        resource_status=status_counts,
        department_usage=department_usage,
        department_total=department_total,
        users=users[:10],
        draft_resources=draft_resources[:6],
        pending_bookings=pending_bookings[:8],
        chart_data=chart_data,
        insights=insights,
        resource_lookup=resource_lookup
    )

@admin_bp.route('/users')
@login_required
@admin_required
def manage_users():
    """Manage all users"""
    users = UserDAL.get_all_users()
    return render_template('admin/users.html', users=users)

@admin_bp.route('/users/<int:user_id>/delete', methods=['POST'])
@login_required
@admin_required
def delete_user(user_id):
    """Delete a user"""
    if user_id == current_user.user_id:
        flash('You cannot delete your own account', 'danger')
        return redirect(url_for('admin.manage_users'))
    
    try:
        UserDAL.delete_user(user_id)
        AdminLogDAL.record(current_user.user_id, 'delete_user', 'users', f'user_id={user_id}')
        flash('User deleted successfully', 'success')
    except Exception as e:
        flash(f'Error deleting user: {str(e)}', 'danger')
    
    return redirect(url_for('admin.manage_users'))

@admin_bp.route('/resources')
@login_required
@admin_required
def manage_resources():
    """Manage all resources"""
    status_filter = request.args.get('status')
    valid_statuses = ['draft', 'published', 'archived']
    if status_filter not in valid_statuses:
        status_filter = None

    resources = ResourceDAL.get_all_resources(status=status_filter if status_filter else None)
    owner_map = {}
    if resources:
        owner_ids = {resource.owner_id for resource in resources}
        owner_map = {
            owner_id: UserDAL.get_user_by_id(owner_id)
            for owner_id in owner_ids
        }
    return render_template(
        'admin/resources.html',
        resources=resources,
        selected_status=status_filter,
        valid_statuses=valid_statuses,
        owners=owner_map
    )

@admin_bp.route('/resources/<int:resource_id>/status', methods=['POST'])
@login_required
@admin_required
def update_resource_status(resource_id):
    """Update the publication status for a resource"""
    new_status = request.form.get('status', '').strip()
    valid, msg = Validator.validate_status(new_status, ['draft', 'published', 'archived'])
    if not valid:
        flash(msg, 'danger')
        return redirect(url_for('admin.manage_resources', status=request.form.get('return_status')))

    try:
        ResourceDAL.update_resource(resource_id, status=new_status)
        flash('Resource status updated.', 'success')
    except Exception as e:
        flash(f'Error updating resource: {str(e)}', 'danger')

    return redirect(url_for('admin.manage_resources', status=request.form.get('return_status')))

@admin_bp.route('/bookings')
@login_required
@admin_required
def manage_bookings():
    """Manage bookings from the admin panel"""
    status_filter = request.args.get('status')
    valid_statuses = ['pending', 'approved', 'rejected', 'cancelled', 'completed']
    if status_filter not in valid_statuses:
        status_filter = None

    bookings = BookingDAL.get_bookings_with_details(status=status_filter if status_filter else None)
    return render_template(
        'admin/bookings.html',
        bookings=bookings,
        selected_status=status_filter,
        valid_statuses=valid_statuses,
        format_datetime=format_datetime
    )

@admin_bp.route('/bookings/<int:booking_id>/status', methods=['POST'])
@login_required
@admin_required
def admin_update_booking_status(booking_id):
    """Update booking status from admin panel"""
    new_status = request.form.get('status', '').strip()
    notes_raw = request.form.get('decision_notes', '').strip()
    decision_notes = None
    if notes_raw:
        valid, msg = Validator.validate_string(notes_raw, 3, 1000, "Notes")
        if not valid:
            flash(msg, 'danger')
            return redirect(url_for('admin.manage_bookings', status=request.form.get('return_status')))
        decision_notes = Validator.sanitize_html(notes_raw)
    valid_statuses = ['pending', 'approved', 'rejected', 'cancelled', 'completed']
    valid, msg = Validator.validate_status(new_status, valid_statuses)
    if not valid:
        flash(msg, 'danger')
        return redirect(url_for('admin.manage_bookings', status=request.form.get('return_status')))

    booking = BookingDAL.get_booking_by_id(booking_id)
    if not booking:
        flash('Booking not found', 'danger')
        return redirect(url_for('admin.manage_bookings', status=request.form.get('return_status')))

    resource = ResourceDAL.get_resource_by_id(booking.resource_id)
    resource_title = resource.title if resource else f"Resource #{booking.resource_id}"

    try:
        BookingDAL.update_booking_status(
            booking_id,
            new_status,
            decision_notes=decision_notes,
            decision_by=current_user.user_id
        )

        start_display = format_datetime(booking.start_datetime)
        if new_status == 'approved':
            NotificationService.send_notification(
                user_id=booking.requester_id,
                subject='Booking approved',
                body=(
                    f'Your booking for "{resource_title}" on {start_display} has been approved by an administrator.'
                    + (f"\n\nNotes: {decision_notes}" if decision_notes else '')
                )
            )
        elif new_status == 'rejected':
            NotificationService.send_notification(
                user_id=booking.requester_id,
                subject='Booking rejected',
                body=(
                    f'Your booking for "{resource_title}" on {start_display} was rejected by an administrator.'
                    + (f"\n\nNotes: {decision_notes}" if decision_notes else '')
                )
            )
        elif new_status == 'cancelled':
            NotificationService.send_notification(
                user_id=booking.requester_id,
                subject='Booking cancelled',
                body=(
                    f'Your booking for "{resource_title}" on {start_display} was cancelled by an administrator.'
                    + (f"\n\nNotes: {decision_notes}" if decision_notes else '')
                )
            )
            if resource and resource.owner_id != booking.requester_id:
                NotificationService.send_notification(
                    user_id=resource.owner_id,
                    subject='Booking cancelled',
                    body=f'The booking for "{resource_title}" scheduled for {start_display} was cancelled by an administrator.'
                )
        elif new_status == 'completed':
            NotificationService.send_notification(
                user_id=booking.requester_id,
                subject='Booking completed',
                body=(
                    f'Your booking for "{resource_title}" on {start_display} is now marked as completed by an administrator.'
                    + (f"\n\nNotes: {decision_notes}" if decision_notes else '')
                )
            )

        flash('Booking status updated.', 'success')
    except Exception as e:
        flash(f'Error updating booking: {str(e)}', 'danger')

    return redirect(url_for('admin.manage_bookings', status=request.form.get('return_status')))

@admin_bp.route('/reviews')
@login_required
@admin_required
def manage_reviews():
    """Moderate reviews"""
    reviews = ReviewDAL.get_all_reviews()
    return render_template('admin/reviews.html', reviews=reviews, format_datetime=format_datetime)

@admin_bp.route('/reviews/<int:review_id>/delete', methods=['POST'])
@login_required
@admin_required
def admin_delete_review(review_id):
    """Delete a review from the admin panel"""
    try:
        ReviewDAL.delete_review(review_id)
        AdminLogDAL.record(current_user.user_id, 'delete_review', 'reviews', f'review_id={review_id}')
        flash('Review removed.', 'info')
    except Exception as e:
        flash(f'Error removing review: {str(e)}', 'danger')

    return redirect(url_for('admin.manage_reviews'))

@admin_bp.route('/reviews/<int:review_id>/hide', methods=['POST'])
@login_required
@admin_required
def admin_hide_review(review_id):
    """Hide a flagged review from public view."""
    if ReviewDAL.set_review_hidden(review_id, hidden=True):
        AdminLogDAL.record(current_user.user_id, 'hide_review', 'reviews', f'review_id={review_id}')
        flash('Review hidden from public view.', 'info')
    else:
        flash('Could not hide that review.', 'danger')
    return redirect(request.referrer or url_for('admin.moderation_reports'))

@admin_bp.route('/reviews/<int:review_id>/unhide', methods=['POST'])
@login_required
@admin_required
def admin_unhide_review(review_id):
    if ReviewDAL.set_review_hidden(review_id, hidden=False):
        AdminLogDAL.record(current_user.user_id, 'unhide_review', 'reviews', f'review_id={review_id}')
        flash('Review restored.', 'success')
    else:
        flash('Could not restore that review.', 'danger')
    return redirect(request.referrer or url_for('admin.manage_reviews'))

@admin_bp.route('/reviews/<int:review_id>/clear_flag', methods=['POST'])
@login_required
@admin_required
def admin_clear_review_flag(review_id):
    if ReviewDAL.clear_review_flag(review_id):
        AdminLogDAL.record(current_user.user_id, 'clear_review_flag', 'reviews', f'review_id={review_id}')
        flash('Flag cleared.', 'success')
    else:
        flash('Nothing to clear for that review.', 'warning')
    return redirect(request.referrer or url_for('admin.moderation_reports'))

@admin_bp.route('/messages/<int:message_id>/hide', methods=['POST'])
@login_required
@admin_required
def admin_hide_message(message_id):
    if MessageDAL.set_message_hidden(message_id, hidden=True):
        AdminLogDAL.record(current_user.user_id, 'hide_message', 'messages', f'message_id={message_id}')
        flash('Message hidden.', 'info')
    else:
        flash('Unable to hide that message.', 'danger')
    return redirect(request.referrer or url_for('admin.moderation_reports'))

@admin_bp.route('/messages/<int:message_id>/unhide', methods=['POST'])
@login_required
@admin_required
def admin_unhide_message(message_id):
    if MessageDAL.set_message_hidden(message_id, hidden=False):
        AdminLogDAL.record(current_user.user_id, 'unhide_message', 'messages', f'message_id={message_id}')
        flash('Message restored.', 'success')
    else:
        flash('Unable to restore that message.', 'danger')
    return redirect(request.referrer or url_for('admin.moderation_reports'))

@admin_bp.route('/messages/<int:message_id>/clear_flag', methods=['POST'])
@login_required
@admin_required
def admin_clear_message_flag(message_id):
    if MessageDAL.clear_message_flag(message_id):
        AdminLogDAL.record(current_user.user_id, 'clear_message_flag', 'messages', f'message_id={message_id}')
        flash('Flag cleared.', 'success')
    else:
        flash('No active flag for that message.', 'warning')
    return redirect(request.referrer or url_for('admin.moderation_reports'))

@admin_bp.route('/messages/<int:message_id>/delete', methods=['POST'])
@login_required
@admin_required
def admin_delete_message(message_id):
    if MessageDAL.delete_message(message_id):
        AdminLogDAL.record(current_user.user_id, 'delete_message', 'messages', f'message_id={message_id}')
        flash('Message deleted.', 'info')
    else:
        flash('Unable to delete message.', 'danger')
    return redirect(request.referrer or url_for('admin.moderation_reports'))

@admin_bp.route('/reports')
@login_required
@admin_required
def moderation_reports():
    """Dashboard for flagged reviews/messages."""
    flagged_reviews = ReviewDAL.get_flagged_reviews()
    flagged_messages = MessageDAL.get_flagged_messages()
    return render_template(
        'admin/reports.html',
        flagged_reviews=flagged_reviews,
        flagged_messages=flagged_messages
    )

@admin_bp.route('/users/<int:user_id>/suspend', methods=['POST'])
@login_required
@admin_required
def toggle_user_suspension(user_id):
    if user_id == current_user.user_id:
        flash('You cannot change your own suspension.', 'danger')
        return redirect(url_for('admin.manage_users'))

    action = request.form.get('action')
    target = UserDAL.get_user_by_id(user_id)
    if not target:
        flash('User not found', 'danger')
        return redirect(url_for('admin.manage_users'))

    suspend = action == 'suspend'
    if UserDAL.set_suspension(user_id, suspend):
        verb = 'suspended' if suspend else 'reinstated'
        AdminLogDAL.record(current_user.user_id, f'{verb}_user', 'users', f'user_id={user_id}')
        flash(f'User {verb}.', 'success' if suspend else 'info')
    else:
        flash('Unable to update user status.', 'danger')

    return redirect(url_for('admin.manage_users'))
