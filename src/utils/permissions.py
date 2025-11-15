"""
Utility helpers for role and ownership checks.
Keeps RBAC logic centralized so controllers stay lean.
"""
from flask_login import current_user


def user_has_role(*roles):
    """Return True if the current user has one of the supplied roles."""
    return bool(current_user.is_authenticated and current_user.role in roles)


def is_admin():
    """Convenience helper for admin checks."""
    return user_has_role('admin')


def is_staff():
    """Convenience helper for staff checks (includes admins)."""
    return user_has_role('staff', 'admin')


def owns_resource(resource):
    """Return True if the current user owns the provided resource."""
    if not resource or not current_user.is_authenticated:
        return False
    return resource.owner_id == current_user.user_id


def can_manage_resource(resource):
    """
    Return True if the current user is allowed to manage the given resource.
    Admins always can; staff can manage their own resources.
    """
    return is_admin() or owns_resource(resource)


def can_view_booking(booking, resource):
    """
    Determine whether the current user can view the booking details page.
    Requesters can view their own bookings; resource owners and admins can view as well.
    """
    if not current_user.is_authenticated:
        return False
    if booking and booking.requester_id == current_user.user_id:
        return True
    return can_manage_resource(resource)


def can_act_on_booking(resource):
    """
    Return True if the current user can approve/reject a booking tied to the resource.
    """
    return can_manage_resource(resource)
