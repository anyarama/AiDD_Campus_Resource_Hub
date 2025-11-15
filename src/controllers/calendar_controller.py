"""
Calendar integration controller.
"""
from __future__ import annotations

from flask import (
    Blueprint,
    Response,
    current_app,
    flash,
    redirect,
    request,
    session,
    url_for,
)
from flask_login import current_user, login_required

from src.config import Config
from src.data_access.booking_dal import BookingDAL
from src.data_access.calendar_dal import CalendarCredentialDAL, CalendarEventDAL
from src.services.calendar_service import upcoming_bookings_for_requester
from src.utils.calendar_sync import (
    GOOGLE_PROVIDER,
    CalendarSyncError,
    build_google_flow,
    build_ics_for_booking,
    credentials_from_record,
    serialize_credentials,
    sync_booking_to_google,
)

calendar_bp = Blueprint('calendar', __name__, url_prefix='/calendar')


def _resolved_redirect_uri():
    """Return the Google OAuth callback URI honoring any configured override."""
    override = (Config.GOOGLE_OAUTH_REDIRECT_PATH or '').strip()
    if override:
        if override.startswith(('http://', 'https://')):
            return override
        target_path = '/' + override.lstrip('/')
    else:
        target_path = url_for('calendar.google_callback', _external=False)

    base_url = (Config.EXTERNAL_BASE_URL or request.host_url).rstrip('/')
    return f"{base_url}{target_path}"


def _booking_for_user(booking_id: int):
    booking = BookingDAL.get_booking_with_details(booking_id)
    if not booking:
        flash('Booking not found.', 'danger')
        return None

    allowed_ids = {
        booking.get('requester_id'),
        booking.get('owner_id'),
    }
    if current_user.role == 'admin' or current_user.user_id in allowed_ids:
        return booking

    flash('You do not have permission to modify this booking.', 'danger')
    return None


def _auto_sync_existing_bookings(credentials, user_id: int):
    """Push existing bookings into Google Calendar right after connecting."""
    eligible_bookings = upcoming_bookings_for_requester(user_id)
    if not eligible_bookings:
        return 0, 0

    synced = 0
    failures = 0
    for booking in eligible_bookings:
        booking_id = booking.get('booking_id')
        try:
            event_record = CalendarEventDAL.get_event(booking_id, user_id, GOOGLE_PROVIDER)
            existing_event_id = event_record['external_event_id'] if event_record else None
            event_id, html_link = sync_booking_to_google(
                credentials,
                booking,
                Config.CALENDAR_DEFAULT_TIMEZONE,
                event_id=existing_event_id
            )
            CalendarEventDAL.upsert_event(
                booking_id=booking_id,
                user_id=user_id,
                provider=GOOGLE_PROVIDER,
                external_event_id=event_id,
                html_link=html_link
            )
            synced += 1
        except CalendarSyncError as exc:
            failures += 1
            current_app.logger.warning(
                'Calendar backfill failed for booking %s: %s',
                booking_id,
                exc
            )
        except Exception as exc:  # noqa: BLE001
            failures += 1
            current_app.logger.exception(
                'Unexpected error syncing booking %s to Google Calendar: %s',
                booking_id,
                exc
            )
    return synced, failures


@calendar_bp.route('/google/connect')
@login_required
def google_connect():
    """Kick off OAuth consent for Google Calendar sync."""
    next_url = request.args.get('next') or url_for('dashboard')
    session['calendar_next'] = next_url
    redirect_uri = _resolved_redirect_uri()

    try:
        flow = build_google_flow(redirect_uri)
        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent'
        )
        session['google_auth_state'] = state
        return redirect(authorization_url)
    except CalendarSyncError as exc:
        flash(str(exc), 'danger')
        return redirect(next_url)


@calendar_bp.route('/google/callback')
@login_required
def google_callback():
    """Persist OAuth credentials after Google redirects back."""
    state = request.args.get('state')
    stored_state = session.pop('google_auth_state', None)
    next_url = session.pop('calendar_next', url_for('dashboard'))
    if not state or stored_state != state:
        flash('Google authentication state mismatch. Please try again.', 'danger')
        return redirect(next_url)

    redirect_uri = _resolved_redirect_uri()
    try:
        flow = build_google_flow(redirect_uri, state=state)
        flow.fetch_token(authorization_response=request.url)
        credentials = flow.credentials
        CalendarCredentialDAL.upsert_credentials(
            current_user.user_id,
            GOOGLE_PROVIDER,
            serialize_credentials(credentials)
        )
        synced, failures = _auto_sync_existing_bookings(credentials, current_user.user_id)
        if synced:
            plural = 's' if synced != 1 else ''
            flash(
                f'Google Calendar connected. Synced {synced} existing booking{plural} automatically.',
                'success'
            )
        else:
            flash('Google Calendar connected. You can sync bookings now.', 'success')
        if failures:
            plural = 's' if failures != 1 else ''
            flash(
                f'{failures} booking{plural} could not sync automatically. Open each booking and choose "Resync Google Calendar."',
                'warning'
            )
    except CalendarSyncError as exc:
        flash(str(exc), 'danger')
    except Exception as exc:  # noqa: BLE001
        flash(f'Unable to complete Google authentication: {exc}', 'danger')

    return redirect(next_url)


@calendar_bp.route('/google/disconnect', methods=['POST'])
@login_required
def google_disconnect():
    """Remove stored Google credentials for the current user."""
    CalendarCredentialDAL.delete_credentials(current_user.user_id, GOOGLE_PROVIDER)
    flash('Google Calendar connection removed.', 'info')
    return redirect(request.referrer or url_for('dashboard'))


@calendar_bp.route('/sync/<int:booking_id>', methods=['POST'])
@login_required
def sync_booking(booking_id):
    """Sync a booking into the user's Google Calendar."""
    booking = _booking_for_user(booking_id)
    if not booking:
        return redirect(request.referrer or url_for('dashboard'))

    record = CalendarCredentialDAL.get_credentials(current_user.user_id, GOOGLE_PROVIDER)
    if not record:
        flash('Please connect Google Calendar before syncing.', 'warning')
        return redirect(
            url_for('calendar.google_connect', next=url_for('booking.detail', booking_id=booking_id))
        )

    try:
        credentials = credentials_from_record(record)
        event_record = CalendarEventDAL.get_event(booking_id, current_user.user_id, GOOGLE_PROVIDER)
        existing_event_id = event_record['external_event_id'] if event_record else None
        event_id, html_link = sync_booking_to_google(
            credentials,
            booking,
            Config.CALENDAR_DEFAULT_TIMEZONE,
            event_id=existing_event_id
        )
        CalendarEventDAL.upsert_event(
            booking_id=booking_id,
            user_id=current_user.user_id,
            provider=GOOGLE_PROVIDER,
            external_event_id=event_id,
            html_link=html_link
        )
        flash('Booking synced to your Google Calendar.', 'success')
    except CalendarSyncError as exc:
        flash(str(exc), 'danger')
    except Exception as exc:  # noqa: BLE001
        flash(f'Unable to sync with Google Calendar: {exc}', 'danger')

    return redirect(url_for('booking.detail', booking_id=booking_id))


@calendar_bp.route('/export/booking/<int:booking_id>.ics')
@login_required
def export_booking_ics(booking_id):
    """Generate an iCal file for a booking."""
    booking = _booking_for_user(booking_id)
    if not booking:
        return redirect(url_for('dashboard'))

    try:
        ics_bytes = build_ics_for_booking(booking, Config.CALENDAR_DEFAULT_TIMEZONE)
    except CalendarSyncError as exc:
        flash(str(exc), 'danger')
        return redirect(url_for('booking.detail', booking_id=booking_id))

    filename = f"booking-{booking_id}.ics"
    return Response(
        ics_bytes,
        mimetype='text/calendar',
        headers={'Content-Disposition': f'attachment; filename={filename}'}
    )
