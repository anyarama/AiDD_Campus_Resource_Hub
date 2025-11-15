"""
Review Controller
Handles creation and removal of resource reviews
"""
from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required, current_user
from src.data_access.review_dal import ReviewDAL
from src.data_access.resource_dal import ResourceDAL
from src.data_access.booking_dal import BookingDAL
from src.utils.validators import Validator

review_bp = Blueprint('review', __name__, url_prefix='/reviews')

@review_bp.route('/create/<int:resource_id>', methods=['GET', 'POST'])
@login_required
def create(resource_id):
    """Create a new review for a resource"""
    resource = ResourceDAL.get_resource_by_id(resource_id)
    
    if not resource or resource.status != 'published':
        flash('Resource not found or unavailable', 'danger')
        return redirect(url_for('resource.list_resources'))
    
    if ReviewDAL.user_has_reviewed(resource_id, current_user.user_id):
        flash('You have already reviewed this resource', 'info')
        return redirect(url_for('resource.detail', resource_id=resource_id))

    if not BookingDAL.user_has_completed_booking(resource_id, current_user.user_id):
        flash('You can only review a resource after completing a booking.', 'warning')
        return redirect(url_for('resource.detail', resource_id=resource_id))
    
    rating_value = None
    comment_text = ''
    
    if request.method == 'POST':
        rating = request.form.get('rating')
        comment = request.form.get('comment', '').strip()
        
        valid, rating_value = Validator.validate_rating(rating)
        if not valid:
            flash(rating_value, 'danger')
            return render_template('reviews/create.html', resource=resource,
                                   selected_rating=rating, comment=comment)
        
        if comment:
            valid, msg = Validator.validate_string(comment, 3, 2000, "Comment")
            if not valid:
                flash(msg, 'danger')
                return render_template('reviews/create.html', resource=resource,
                                       selected_rating=rating_value, comment=comment)
            comment_text = Validator.sanitize_html(comment)
        else:
            comment_text = None
        
        try:
            ReviewDAL.create_review(
                resource_id=resource_id,
                reviewer_id=current_user.user_id,
                rating=rating_value,
                comment=comment_text
            )
            flash('Review submitted!', 'success')
            return redirect(url_for('resource.detail', resource_id=resource_id))
        except Exception as e:
            flash(f'Error submitting review: {str(e)}', 'danger')
    
    return render_template('reviews/create.html', resource=resource,
                           selected_rating=rating_value, comment=comment_text)

@review_bp.route('/<int:review_id>/delete', methods=['POST'])
@login_required
def delete(review_id):
    """Delete an existing review"""
    review = ReviewDAL.get_review_by_id(review_id)
    
    if not review:
        flash('Review not found', 'danger')
        return redirect(url_for('dashboard'))
    
    if review.reviewer_id != current_user.user_id and current_user.role != 'admin':
        flash('You do not have permission to delete this review', 'danger')
        return redirect(url_for('resource.detail', resource_id=review.resource_id))
    
    try:
        ReviewDAL.delete_review(review_id)
        flash('Review deleted', 'info')
    except Exception as e:
        flash(f'Error deleting review: {str(e)}', 'danger')
    
    return redirect(url_for('resource.detail', resource_id=review.resource_id))

@review_bp.route('/<int:review_id>/flag', methods=['POST'])
@login_required
def flag(review_id):
    """Report a review for moderator attention."""
    review = ReviewDAL.get_review_by_id(review_id)
    if not review:
        flash('Review not found', 'danger')
        return redirect(url_for('dashboard'))

    reason = request.form.get('reason', '').strip()
    valid, msg = Validator.validate_string(reason, 5, 500, "Reason")
    if not valid:
        flash(msg, 'danger')
        return redirect(url_for('resource.detail', resource_id=review.resource_id))

    reason = Validator.sanitize_html(reason)
    if ReviewDAL.flag_review(review_id, current_user.user_id, reason):
        flash('Thank you. Our moderators have been notified.', 'info')
    else:
        flash('Unable to flag this review right now.', 'danger')

    return redirect(url_for('resource.detail', resource_id=review.resource_id))
