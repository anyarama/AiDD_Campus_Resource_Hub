"""
Booking Controller
Handles booking creation, approval, and management

Context Grounding (AI-Assisted Development):
This controller implements booking workflows based on:
- Student persona requirements (/docs/context/personas/student_persona.md)
  - Quick booking completion (< 2 minutes)
  - Instant feedback for non-restricted resources
- Acceptance test AT-001 (/docs/context/acceptance_tests/booking_workflow.md)
  - Automatic approval for non-restricted resources
  - Manual approval workflow for restricted resources
  - Conflict detection before booking creation
- MVC architecture (/docs/context/architecture/mvc_structure.md)
  - Controllers coordinate workflows, DAL handles database
"""
from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify, current_app
from flask_login import login_required, current_user
from datetime import datetime, timedelta
from src.data_access.booking_dal import BookingDAL
from src.data_access.resource_dal import ResourceDAL
from src.data_access.waitlist_dal import WaitlistDAL
from src.data_access.user_dal import UserDAL
from src.utils.validators import Validator
from src.utils.notifications import NotificationService
from src.utils.datetime_helpers import (
    utc_now_naive,
    build_booking_calendar,
    humanize_datetime,
    describe_recurrence,
    parse_datetime,
)
from src.utils.availability import (
    parse_schedule,
    format_schedule_display,
    validate_booking_times,
    get_next_available_slot
)
from src.data_access.calendar_dal import CalendarCredentialDAL, CalendarEventDAL
from src.utils.calendar_sync import GOOGLE_PROVIDER
from src.utils.permissions import can_manage_resource, can_view_booking, can_act_on_booking, is_admin
from src.data_access.admin_log_dal import AdminLogDAL

booking_bp = Blueprint('booking', __name__, url_prefix='/bookings')
DEFAULT_RECURRENCE_COUNT = 3


def _promote_waitlist_for_resource(resource):
    """Scan for active waitlist entries and convert any that no longer conflict."""
    if not resource:
        return
    active_entries = WaitlistDAL.get_entries_for_resource(resource.resource_id, statuses=['active'])
    if not active_entries:
        return

    for entry in active_entries:
        start_dt = parse_datetime(entry.start_datetime)
        end_dt = parse_datetime(entry.end_datetime)
        if not start_dt or not end_dt:
            continue
        if BookingDAL.check_booking_conflict(resource.resource_id, start_dt, end_dt):
            continue
        requester = UserDAL.get_user_by_id(entry.requester_id)
        if not requester:
            WaitlistDAL.cancel_entry(entry.entry_id)
            continue

        requires_manual_approval = (
            resource.is_restricted and
            resource.owner_id != requester.user_id and
            requester.role != 'admin'
        )
        status = 'pending' if requires_manual_approval else 'approved'

        try:
            booking = BookingDAL.create_booking(
                resource_id=resource.resource_id,
                requester_id=requester.user_id,
                start_datetime=start_dt,
                end_datetime=end_dt,
                status=status,
                recurrence_rule=entry.recurrence_rule
            )
        except Exception as exc:
            current_app.logger.error(f"[Waitlist] Failed to create booking for entry {entry.entry_id}: {exc}")
            continue

        WaitlistDAL.mark_promoted(entry.entry_id, booking.booking_id)

        NotificationService.send_notification(
            user_id=requester.user_id,
            subject='Waitlist slot available',
            body=(
                f'Good news! Your waitlist request for "{resource.title}" '
                f'on {humanize_datetime(start_dt)} – {humanize_datetime(end_dt)} has been '
                f'{"confirmed" if status == "approved" else "converted to a pending request"}. '
                'Visit your dashboard to review the details.'
            )
        )

        if resource.owner_id != requester.user_id:
            owner_subject = (
                'Waitlist booking confirmed' if status == 'approved'
                else 'Waitlist request awaiting review'
            )
            owner_body = (
                f'The waitlist entry for "{resource.title}" requested by {requester.name or f"User #{requester.user_id}"} '
                f'({humanize_datetime(start_dt)} – {humanize_datetime(end_dt)}) '
                f'has been {"automatically approved" if status == "approved" else "queued for your review"}.'
            )
            NotificationService.send_notification(
                user_id=resource.owner_id,
                subject=owner_subject,
                body=owner_body
            )

@booking_bp.route('/my-bookings')
@login_required
def my_bookings():
    """View all user's bookings with filtering"""
    valid_filters = ['upcoming', 'pending', 'approved', 'completed', 'cancelled', 'rejected', 'all']
    requested_filter = (request.args.get('status') or 'upcoming').lower()
    if requested_filter not in valid_filters:
        requested_filter = 'upcoming'

    all_bookings = BookingDAL.get_bookings_by_requester(current_user.user_id)

    # Filter bookings based on selected filter
    if requested_filter == 'upcoming':
        now = utc_now_naive()
        filtered_bookings = [
            b for b in all_bookings
            if b.status in ['approved', 'pending'] and parse_datetime(b.start_datetime) and parse_datetime(b.start_datetime) >= now
        ]
    elif requested_filter == 'all':
        filtered_bookings = all_bookings
    else:
        filtered_bookings = [b for b in all_bookings if b.status == requested_filter]

    # Sort by start datetime
    filtered_bookings.sort(key=lambda b: str(b.start_datetime or ''), reverse=False)

    # Enrich bookings with resource details
    booking_list = []
    for booking in filtered_bookings:
        resource = ResourceDAL.get_resource_by_id(booking.resource_id)
        booking_list.append({
            'booking': booking,
            'resource_title': resource.title if resource else f'Resource #{booking.resource_id}',
            'resource_category': resource.category if resource else 'Unknown',
            'resource': resource
        })

    # Count bookings by status for filter badges
    status_counts = {
        'upcoming': len([b for b in all_bookings if b.status in ['approved', 'pending'] and parse_datetime(b.start_datetime) and parse_datetime(b.start_datetime) >= utc_now_naive()]),
        'pending': len([b for b in all_bookings if b.status == 'pending']),
        'approved': len([b for b in all_bookings if b.status == 'approved']),
        'completed': len([b for b in all_bookings if b.status == 'completed']),
        'cancelled': len([b for b in all_bookings if b.status == 'cancelled']),
        'rejected': len([b for b in all_bookings if b.status == 'rejected']),
        'all': len(all_bookings)
    }

    # Get active waitlist entries for the user
    my_waitlist = WaitlistDAL.get_entries_by_requester(current_user.user_id, statuses=['active'])
    waitlist_with_resources = []
    for entry in my_waitlist:
        resource = ResourceDAL.get_resource_by_id(entry.resource_id)
        waitlist_with_resources.append({
            'entry': entry,
            'resource_title': resource.title if resource else f"Resource #{entry.resource_id}",
            'resource_category': resource.category if resource else 'Unknown',
            'resource': resource
        })

    return render_template(
        'bookings/my_bookings.html',
        bookings=booking_list,
        selected_status=requested_filter,
        valid_filters=valid_filters,
        status_counts=status_counts,
        my_waitlist=waitlist_with_resources
    )

@booking_bp.route('/create/<int:resource_id>', methods=['GET', 'POST'])
@login_required
def create(resource_id):
    """Create a booking request"""
    resource = ResourceDAL.get_resource_by_id(resource_id)
    
    if not resource or resource.status != 'published':
        flash('Resource not found or unavailable', 'danger')
        return redirect(url_for('resource.list_resources'))
    existing_bookings = BookingDAL.get_bookings_by_resource(resource_id)
    existing_bookings = sorted(existing_bookings, key=lambda b: str(b.start_datetime))
    upcoming_bookings = [
        booking for booking in existing_bookings
        if getattr(booking, 'status', '') not in ('cancelled', 'rejected')
    ]
    calendar_token = request.values.get('view_month')
    calendar_data = build_booking_calendar(existing_bookings, calendar_token)
    my_waitlist_entries = [
        entry for entry in WaitlistDAL.get_entries_by_requester(current_user.user_id, statuses=['active'])
        if entry.resource_id == resource_id
    ]

    def _format_input_value(value):
        if isinstance(value, datetime):
            return value.strftime('%Y-%m-%dT%H:%M')
        return str(value)

    def render_form(form_payload=None, waitlist_offer=None):
        return render_template(
            'bookings/create.html',
            resource=resource,
            existing_bookings=existing_bookings,
            upcoming_bookings=upcoming_bookings[:8],
            calendar_rows=calendar_data['rows'],
            calendar_label=calendar_data['label'],
            prev_month=calendar_data['prev_token'],
            next_month=calendar_data['next_token'],
            view_month=calendar_token,
            form_data=form_payload or {},
            waitlist_entries=my_waitlist_entries,
            waitlist_offer=waitlist_offer
        )
    
    if request.method == 'POST':
        start_datetime = request.form.get('start_datetime', '').strip()
        end_datetime = request.form.get('end_datetime', '').strip()
        recurrence_frequency = request.form.get('recurrence_frequency', 'none').strip().lower()
        request_action = request.form.get('request_action', 'book')
        
        # Validation - Parse datetimes
        valid, start_dt = Validator.validate_datetime(start_datetime, "Start date/time")
        if not valid:
            flash(start_dt, 'danger')
            return render_form(request.form)

        valid, end_dt = Validator.validate_datetime(end_datetime, "End date/time")
        if not valid:
            flash(end_dt, 'danger')
            return render_form(request.form)

        # Enhanced datetime range validation
        valid, error_msg = Validator.validate_datetime_range(start_dt, end_dt)
        if not valid:
            flash(error_msg, 'danger')
            return render_form(request.form)

        # Validate against resource availability schedule and booking rules
        schedule = parse_schedule(getattr(resource, 'availability_schedule', None))
        min_minutes = getattr(resource, 'min_booking_minutes', 30) or 30
        max_minutes = getattr(resource, 'max_booking_minutes', 480) or 480
        increment_minutes = getattr(resource, 'booking_increment_minutes', 30) or 30
        lead_time_hours = getattr(resource, 'min_lead_time_hours', 0) or 0

        valid, availability_error = validate_booking_times(
            start_dt, end_dt, schedule,
            min_minutes=min_minutes,
            max_minutes=max_minutes,
            increment_minutes=increment_minutes,
            lead_time_hours=lead_time_hours
        )
        if not valid:
            flash(availability_error, 'danger')
            return render_form(request.form)

        occurrences = [(start_dt, end_dt)]
        recurrence_rule = None
        if recurrence_frequency in ('daily', 'weekly'):
            raw_default = current_app.config.get('DEFAULT_RECURRENCE_COUNT', DEFAULT_RECURRENCE_COUNT)
            try:
                recurrence_total = max(2, int(raw_default))
            except (TypeError, ValueError):
                recurrence_total = DEFAULT_RECURRENCE_COUNT
            delta = timedelta(days=1) if recurrence_frequency == 'daily' else timedelta(weeks=1)
            for i in range(1, recurrence_total):
                occurrences.append((start_dt + delta * i, end_dt + delta * i))
            recurrence_rule = f"FREQ={recurrence_frequency.upper()};COUNT={recurrence_total}"
        elif recurrence_frequency not in ('none', ''):
            flash('Invalid recurrence option selected.', 'danger')
            return render_form(request.form)

        conflict_index = None
        for index, (occ_start, occ_end) in enumerate(occurrences):
            if BookingDAL.check_booking_conflict(resource_id, occ_start, occ_end):
                conflict_index = index
                break

        if conflict_index is not None:
            conflict_start, conflict_end = occurrences[conflict_index]
            if request_action == 'waitlist':
                if len(occurrences) > 1:
                    flash('Waitlists currently support single reservations only. Please adjust your recurrence.', 'warning')
                    return render_form(request.form)
                if WaitlistDAL.has_active_entry(resource_id, current_user.user_id, conflict_start, conflict_end):
                    flash('You are already on the waitlist for this time slot.', 'info')
                else:
                    entry = WaitlistDAL.create_entry(
                        resource_id=resource_id,
                        requester_id=current_user.user_id,
                        start_datetime=conflict_start,
                        end_datetime=conflict_end,
                        recurrence_rule=None
                    )
                    NotificationService.send_notification(
                        user_id=current_user.user_id,
                        subject='Waitlist joined',
                        body=(
                            f'You have been added to the waitlist for "{resource.title}" '
                            f'on {humanize_datetime(conflict_start)} – {humanize_datetime(conflict_end)}. '
                            'We will automatically complete the booking if the time becomes available.'
                        )
                    )
                    if resource.owner_id != current_user.user_id:
                        NotificationService.send_notification(
                            user_id=resource.owner_id,
                            subject='Waitlist activity',
                            body=(
                                f'{current_user.name} joined the waitlist for "{resource.title}" '
                                f'({humanize_datetime(conflict_start)} – {humanize_datetime(conflict_end)}).'
                            )
                        )
                flash('Added to the waitlist. We will notify you if the slot opens up.', 'success')
                return redirect(url_for('booking.create', resource_id=resource_id))

            label = 'your initial selection' if conflict_index == 0 else f'occurrence #{conflict_index + 1}'
            waitlist_offer = None
            if len(occurrences) == 1:
                waitlist_offer = {
                    'start_value': _format_input_value(conflict_start),
                    'end_value': _format_input_value(conflict_end),
                    'start_display': humanize_datetime(conflict_start),
                    'end_display': humanize_datetime(conflict_end)
                }
                flash(
                    'This time slot is currently booked, but you can join the waitlist to be auto-booked '
                    'when it becomes free.',
                    'warning'
                )
            else:
                flash(f'The time slot for {label} conflicts with an existing booking.', 'danger')
            return render_form(request.form, waitlist_offer=waitlist_offer)
        
        # Determine initial status based on resource configuration and requester role
        requires_manual_approval = (
            resource.is_restricted and
            resource.owner_id != current_user.user_id and
            current_user.role != 'admin'
        )
        initial_status = 'pending' if requires_manual_approval else 'approved'

        try:
            if len(occurrences) > 1:
                bookings = BookingDAL.create_recurring_bookings(
                    resource_id=resource_id,
                    requester_id=current_user.user_id,
                    occurrences=occurrences,
                    status=initial_status,
                    recurrence_rule=recurrence_rule
                )
                booking = bookings[0]
            else:
                booking = BookingDAL.create_booking(
                    resource_id=resource_id,
                    requester_id=current_user.user_id,
                    start_datetime=start_dt,
                    end_datetime=end_dt,
                    status=initial_status,
                    recurrence_rule=recurrence_rule
                )

            # Send notifications (simulated email)
            human_start = humanize_datetime(occurrences[0][0])
            human_end = humanize_datetime(occurrences[0][1])
            count_summary = f"{len(occurrences)} occurrence(s)" if len(occurrences) > 1 else "a single reservation"
            requester_subject = 'Booking confirmed' if initial_status == 'approved' else 'Booking request received'
            requester_body = (
                f"Hi {current_user.name},\n\n"
                f"Your booking for \"{resource.title}\" on {human_start} – {human_end} ({count_summary}) "
                f"has been {'approved' if initial_status == 'approved' else 'submitted for approval'}."
            )
            NotificationService.send_notification(
                user_id=current_user.user_id,
                subject=requester_subject,
                body=requester_body
            )

            if resource.owner_id != current_user.user_id:
                owner_subject = 'New booking request' if initial_status == 'pending' else 'Resource booked'
                owner_body = (
                    f"A user has {'requested a booking' if initial_status == 'pending' else 'booked'} "
                    f"\"{resource.title}\" starting {human_start}. Total occurrences: {len(occurrences)}."
                )
                NotificationService.send_notification(
                    user_id=resource.owner_id,
                    subject=owner_subject,
                    body=owner_body
                )
            
            if initial_status == 'approved':
                message = 'Recurring booking confirmed!' if len(occurrences) > 1 else 'Booking confirmed!'
                flash(message, 'success')
            else:
                flash('Booking request submitted! Awaiting approval.', 'info')
            
            return redirect(url_for('booking.detail', booking_id=booking.booking_id))
        except Exception as e:
            flash(f'Error creating booking: {str(e)}', 'danger')
            return render_form(request.form)
    
    return render_form({})

@booking_bp.route('/waitlist/<int:entry_id>/cancel', methods=['POST'])
@login_required
def cancel_waitlist(entry_id):
    """Allow users to drop from a waitlist."""
    entry = WaitlistDAL.get_entry(entry_id)
    if not entry or entry.requester_id != current_user.user_id:
        flash('Waitlist entry not found or access denied.', 'danger')
        return redirect(request.referrer or url_for('dashboard'))
    if WaitlistDAL.cancel_entry(entry_id):
        flash('Waitlist entry removed.', 'info')
    else:
        flash('Unable to update waitlist entry.', 'danger')
    return redirect(request.referrer or url_for('dashboard'))

@booking_bp.route('/<int:booking_id>')
@login_required
def detail(booking_id):
    """View booking details"""
    booking_details = BookingDAL.get_booking_with_details(booking_id)
    
    if not booking_details:
        flash('Booking not found', 'danger')
        return redirect(url_for('dashboard'))
    
    # Check if user has permission to view
    booking = BookingDAL.get_booking_by_id(booking_id)
    resource = ResourceDAL.get_resource_by_id(booking.resource_id)
    resource_title = resource.title if resource else f"Resource #{booking.resource_id}"
    
    if not can_view_booking(booking, resource):
        flash('You do not have permission to view this booking', 'danger')
        return redirect(url_for('dashboard'))
    
    recurrence_summary = describe_recurrence(booking_details.get('recurrence_rule'))
    end_dt_obj = parse_datetime(booking_details.get('end_datetime'))
    completion_window = (
        booking_details.get('status') == 'approved' and
        end_dt_obj is not None and
        end_dt_obj <= utc_now_naive()
    )
    can_mark_complete_owner = completion_window and (
        resource.owner_id == current_user.user_id or current_user.role == 'admin'
    )
    can_mark_complete_requester = completion_window and booking_details.get('requester_id') == current_user.user_id

    google_connection = CalendarCredentialDAL.get_credentials(current_user.user_id, GOOGLE_PROVIDER)
    calendar_event = CalendarEventDAL.get_event(booking_id, current_user.user_id, GOOGLE_PROVIDER)

    # Add availability schedule information
    schedule = parse_schedule(getattr(resource, 'availability_schedule', None))
    schedule_display = format_schedule_display(schedule) if schedule else None

    return render_template(
        'bookings/detail.html',
        booking=booking_details,
        recurrence_summary=recurrence_summary,
        can_mark_complete_owner=can_mark_complete_owner,
        can_mark_complete_requester=can_mark_complete_requester,
        google_connection=google_connection,
        calendar_event=calendar_event,
        schedule_display=schedule_display
    )

@booking_bp.route('/review-requests')
@login_required
def review_requests():
    """List booking requests that require action from the current user."""
    owned_resources = ResourceDAL.get_resources_by_owner(current_user.user_id)
    manages_resources = current_user.role in ['staff', 'admin'] or bool(owned_resources)
    if not manages_resources:
        flash('You do not manage any resources yet.', 'info')
        return redirect(url_for('dashboard'))

    valid_filters = ['pending', 'approved', 'rejected', 'cancelled', 'completed', 'all']
    requested_filter = (request.args.get('status') or 'pending').lower()
    if requested_filter not in valid_filters:
        requested_filter = 'pending'

    query_status = None if requested_filter == 'all' else requested_filter
    bookings = BookingDAL.get_bookings_for_owner(current_user.user_id, statuses=query_status)
    total_pending = len(BookingDAL.get_bookings_for_owner(current_user.user_id, statuses='pending'))

    return render_template(
        'bookings/review_requests.html',
        bookings=bookings,
        selected_status=requested_filter,
        valid_filters=valid_filters,
        total_pending=total_pending,
        owns_resources=bool(owned_resources)
    )

@booking_bp.route('/<int:booking_id>/approve', methods=['POST'])
@login_required
def approve(booking_id):
    """Approve a booking"""
    booking = BookingDAL.get_booking_by_id(booking_id)
    redirect_next = request.form.get('next')
    if redirect_next and not redirect_next.startswith('/'):
        redirect_next = None
    
    if not booking:
        flash('Booking not found', 'danger')
        return redirect(redirect_next or url_for('dashboard'))
    
    resource = ResourceDAL.get_resource_by_id(booking.resource_id)
    
    # Check permission (resource owner, staff, or admin)
    if not can_act_on_booking(resource):
        flash('You do not have permission to approve this booking', 'danger')
        return redirect(redirect_next or url_for('booking.detail', booking_id=booking_id))
    
    resource_title = resource.title if resource else f"Resource #{booking.resource_id}"
    notes_raw = request.form.get('decision_notes', '').strip()
    decision_notes = None
    if notes_raw:
        valid, msg = Validator.validate_string(notes_raw, 3, 1000, "Notes")
        if not valid:
            flash(msg, 'danger')
            return redirect(redirect_next or url_for('booking.detail', booking_id=booking_id))
        decision_notes = Validator.sanitize_html(notes_raw)
    admin_override = is_admin() and resource.owner_id != current_user.user_id
    try:
        BookingDAL.update_booking_status(
            booking_id,
            'approved',
            decision_notes=decision_notes,
            decision_by=current_user.user_id
        )
        booking.status = 'approved'
        requester_message = (
            f"Your booking for \"{resource_title}\" starting {humanize_datetime(booking.start_datetime)} "
            f"has been approved."
        )
        if decision_notes:
            requester_message += f"\n\nNotes from reviewer: {decision_notes}"
        NotificationService.send_notification(
            user_id=booking.requester_id,
            subject='Booking approved',
            body=requester_message
        )
        if admin_override:
            AdminLogDAL.record(
                current_user.user_id,
                'booking_approve_override',
                'bookings',
                f'booking_id={booking.booking_id};resource_owner={resource.owner_id}'
            )
        flash('Booking approved successfully!', 'success')
    except Exception as e:
        flash(f'Error approving booking: {str(e)}', 'danger')
    
    return redirect(redirect_next or url_for('booking.detail', booking_id=booking_id))

@booking_bp.route('/<int:booking_id>/reject', methods=['POST'])
@login_required
def reject(booking_id):
    """Reject a booking"""
    booking = BookingDAL.get_booking_by_id(booking_id)
    redirect_next = request.form.get('next')
    if redirect_next and not redirect_next.startswith('/'):
        redirect_next = None
    
    if not booking:
        flash('Booking not found', 'danger')
        return redirect(redirect_next or url_for('dashboard'))
    
    resource = ResourceDAL.get_resource_by_id(booking.resource_id)
    
    if not can_act_on_booking(resource):
        flash('You do not have permission to reject this booking', 'danger')
        return redirect(redirect_next or url_for('booking.detail', booking_id=booking_id))
    
    resource_title = resource.title if resource else f"Resource #{booking.resource_id}"
    notes_raw = request.form.get('decision_notes', '').strip()
    decision_notes = None
    if notes_raw:
        valid, msg = Validator.validate_string(notes_raw, 3, 1000, "Notes")
        if not valid:
            flash(msg, 'danger')
            return redirect(redirect_next or url_for('booking.detail', booking_id=booking_id))
        decision_notes = Validator.sanitize_html(notes_raw)
    admin_override = is_admin() and resource.owner_id != current_user.user_id
    try:
        BookingDAL.update_booking_status(
            booking_id,
            'rejected',
            decision_notes=decision_notes,
            decision_by=current_user.user_id
        )
        booking.status = 'rejected'
        requester_message = (
            f"Your booking for \"{resource_title}\" starting {humanize_datetime(booking.start_datetime)} "
            "was declined. Please choose a different time."
        )
        if decision_notes:
            requester_message += f"\n\nNotes from reviewer: {decision_notes}"
        NotificationService.send_notification(
            user_id=booking.requester_id,
            subject='Booking rejected',
            body=requester_message
        )
        if admin_override:
            AdminLogDAL.record(
                current_user.user_id,
                'booking_reject_override',
                'bookings',
                f'booking_id={booking.booking_id};resource_owner={resource.owner_id}'
            )
        flash('Booking rejected', 'info')
        _promote_waitlist_for_resource(resource)
    except Exception as e:
        flash(f'Error rejecting booking: {str(e)}', 'danger')
    
    return redirect(url_for('booking.detail', booking_id=booking_id))

@booking_bp.route('/<int:booking_id>/cancel', methods=['POST'])
@login_required
def cancel(booking_id):
    """Cancel a booking"""
    booking = BookingDAL.get_booking_by_id(booking_id)
    
    if not booking:
        flash('Booking not found', 'danger')
        return redirect(url_for('dashboard'))
    resource = ResourceDAL.get_resource_by_id(booking.resource_id)

    can_cancel = (
        booking.requester_id == current_user.user_id or
        current_user.role == 'admin' or
        (resource and resource.owner_id == current_user.user_id)
    )
    if not can_cancel:
        flash('You do not have permission to cancel this booking', 'danger')
        return redirect(url_for('booking.detail', booking_id=booking_id))
    
    resource_title = resource.title if resource else f"Resource #{booking.resource_id}"
    try:
        BookingDAL.update_booking_status(booking_id, 'cancelled')
        booking.status = 'cancelled'
        cancellation_actor = current_user.name
        requester_message = (
            f"Your booking for \"{resource_title}\" starting {humanize_datetime(booking.start_datetime)} "
            "was cancelled."
        )
        NotificationService.send_notification(
            user_id=booking.requester_id,
            subject='Booking cancelled',
            body=requester_message
        )
        if resource and resource.owner_id != booking.requester_id:
            owner_message = (
                f"The booking for \"{resource_title}\" starting {humanize_datetime(booking.start_datetime)} "
                f"was cancelled by {cancellation_actor}."
            )
            NotificationService.send_notification(
                user_id=resource.owner_id,
                subject='Booking cancelled',
                body=owner_message
            )
        flash('Booking cancelled', 'info')
        _promote_waitlist_for_resource(resource)
    except Exception as e:
        flash(f'Error cancelling booking: {str(e)}', 'danger')
    
    return redirect(url_for('dashboard'))

@booking_bp.route('/<int:booking_id>/complete', methods=['POST'])
@login_required
def complete(booking_id):
    """Mark an approved booking as completed"""
    booking = BookingDAL.get_booking_by_id(booking_id)

    if not booking:
        flash('Booking not found', 'danger')
        return redirect(url_for('dashboard'))

    resource = ResourceDAL.get_resource_by_id(booking.resource_id)
    end_dt = parse_datetime(booking.end_datetime)

    allowed = (
        booking.requester_id == current_user.user_id or
        (resource and resource.owner_id == current_user.user_id) or
        current_user.role == 'admin'
    )
    if not allowed:
        flash('You do not have permission to complete this booking', 'danger')
        return redirect(url_for('booking.detail', booking_id=booking_id))

    if booking.status != 'approved':
        flash('Only approved bookings can be marked as completed.', 'warning')
        return redirect(url_for('booking.detail', booking_id=booking_id))

    if end_dt and end_dt > utc_now_naive():
        flash('This booking has not finished yet.', 'warning')
        return redirect(url_for('booking.detail', booking_id=booking_id))

    try:
        BookingDAL.update_booking_status(booking_id, 'completed')
        booking.status = 'completed'
        resource_title = resource.title if resource else f"Resource #{booking.resource_id}"

        NotificationService.send_notification(
            user_id=booking.requester_id,
            subject='Booking completed',
            body=(
                f'Your booking for "{resource_title}" starting '
                f'{humanize_datetime(booking.start_datetime)} is now marked as completed.'
            )
        )

        if resource and resource.owner_id != booking.requester_id:
            NotificationService.send_notification(
                user_id=resource.owner_id,
                subject='Booking completed',
                body=(
                    f'The booking for "{resource_title}" requested by user #{booking.requester_id} '
                    'has been confirmed as completed.'
                )
            )

        flash('Booking marked as completed.', 'success')
    except Exception as e:
        flash(f'Error completing booking: {str(e)}', 'danger')

    return redirect(url_for('booking.detail', booking_id=booking_id))
