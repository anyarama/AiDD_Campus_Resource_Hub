"""
Message Controller
Handles messaging between users
"""
from datetime import datetime
from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_required, current_user
from src.data_access.message_dal import MessageDAL
from src.data_access.resource_dal import ResourceDAL
from src.data_access.user_dal import UserDAL
from src.utils.validators import Validator

message_bp = Blueprint('message', __name__, url_prefix='/messages')


def _thread_participants(thread):
    """Return the IDs for both participants in a thread"""
    return thread['owner_id'], thread['participant_id']


def _resolve_other_user(thread):
    """Get the other participant and ensure current user belongs to the thread"""
    owner_id, participant_id = _thread_participants(thread)
    if current_user.user_id not in (owner_id, participant_id):
        return None
    other_user_id = participant_id if owner_id == current_user.user_id else owner_id
    return UserDAL.get_user_by_id(other_user_id)


def _wants_json_response():
    """Detect if the client prefers a JSON response"""
    accept = request.accept_mimetypes
    return request.headers.get('X-Requested-With') == 'XMLHttpRequest' or (
        accept['application/json'] >= accept['text/html']
    )


def _serialize_message(message, other_user):
    """Serialize message for JSON responses"""
    timestamp = message.timestamp
    if isinstance(timestamp, datetime):
        timestamp = timestamp.isoformat()
    return {
        'message_id': message.message_id,
        'thread_id': message.thread_id,
        'sender_id': message.sender_id,
        'receiver_id': message.receiver_id,
        'content': message.content,
        'timestamp': timestamp,
        'sender_name': 'You' if message.sender_id == current_user.user_id else (other_user.name if other_user else 'Participant')
    }

@message_bp.route('/')
@login_required
def list_threads():
    """List all message threads for current user"""
    threads = MessageDAL.get_user_threads(current_user.user_id)
    return render_template('messages/list.html', threads=threads)

@message_bp.route('/thread/<int:thread_id>')
@login_required
def view_thread(thread_id):
    """View a specific message thread"""
    thread = MessageDAL.get_thread_by_id(thread_id)
    if not thread:
        flash('Thread not found', 'danger')
        return redirect(url_for('message.list_threads'))

    other_user = _resolve_other_user(thread)
    if other_user is None:
        flash('You do not have access to this thread', 'danger')
        return redirect(url_for('message.list_threads'))

    messages = MessageDAL.get_thread_messages(thread_id)
    resource = ResourceDAL.get_resource_by_id(thread['resource_id']) if thread.get('resource_id') else None
    last_message_id = messages[-1].message_id if messages else 0
    
    return render_template(
        'messages/thread.html',
        messages=messages,
        other_user=other_user,
        thread_id=thread_id,
        resource=resource,
        thread=thread,
        last_message_id=last_message_id
    )

@message_bp.route('/send/<int:receiver_id>', methods=['GET', 'POST'])
@login_required
def send(receiver_id):
    """Send a message to another user"""
    receiver = UserDAL.get_user_by_id(receiver_id)
    
    if not receiver:
        flash('User not found', 'danger')
        return redirect(url_for('dashboard'))
    
    if receiver_id == current_user.user_id:
        flash('You cannot send messages to yourself', 'danger')
        return redirect(url_for('dashboard'))

    resource = None
    resource_id_value = None
    resource_param = request.values.get('resource_id')
    if resource_param:
        try:
            resource_id_value = int(resource_param)
            resource = ResourceDAL.get_resource_by_id(resource_id_value)
        except (TypeError, ValueError):
            resource_id_value = None
        if resource_param and resource is None:
            flash('Resource not found for this conversation', 'danger')
            return redirect(url_for('dashboard'))
    
    if request.method == 'POST':
        content = request.form.get('content', '').strip()
        
        valid, msg = Validator.validate_string(content, 1, 5000, "Message")
        if not valid:
            flash(msg, 'danger')
            return render_template('messages/send.html', receiver=receiver, resource=resource, form_data=request.form)
        
        content = Validator.sanitize_html(content)
        
        try:
            message = MessageDAL.create_message(
                sender_id=current_user.user_id,
                receiver_id=receiver_id,
                content=content,
                resource_id=resource.resource_id if resource else None
            )
            flash('Message sent!', 'success')
            return redirect(url_for('message.view_thread', thread_id=message.thread_id))
        except Exception as e:
            flash(f'Error sending message: {str(e)}', 'danger')
            return render_template('messages/send.html', receiver=receiver, resource=resource, form_data=request.form)

    return render_template('messages/send.html', receiver=receiver, resource=resource, form_data={})

@message_bp.route('/thread/<int:thread_id>/messages/feed')
@login_required
def thread_feed(thread_id):
    """Return JSON payload of new messages for a thread"""
    thread = MessageDAL.get_thread_by_id(thread_id)
    if not thread:
        return jsonify({'error': 'Thread not found'}), 404

    other_user = _resolve_other_user(thread)
    if other_user is None:
        return jsonify({'error': 'You do not have access to this thread'}), 403

    after_id = request.args.get('after_id', type=int) or None
    messages = MessageDAL.get_thread_messages(thread_id, after_id)
    payload = [_serialize_message(message, other_user) for message in messages]
    return jsonify({'messages': payload})

@message_bp.route('/reply/<int:thread_id>', methods=['POST'])
@login_required
def reply(thread_id):
    """Reply to a message thread"""
    thread = MessageDAL.get_thread_by_id(thread_id)
    if not thread:
        if _wants_json_response():
            return jsonify({'error': 'Thread not found'}), 404
        flash('Thread not found', 'danger')
        return redirect(url_for('message.list_threads'))

    other_user = _resolve_other_user(thread)
    if other_user is None:
        if _wants_json_response():
            return jsonify({'error': 'You do not have access to this thread'}), 403
        flash('You do not have access to this thread', 'danger')
        return redirect(url_for('message.list_threads'))

    receiver_id = other_user.user_id
    resource_id = thread.get('resource_id')
    
    content = request.form.get('content', '').strip()
    
    valid, msg = Validator.validate_string(content, 1, 5000, "Message")
    if not valid:
        if _wants_json_response():
            return jsonify({'error': msg}), 400
        flash(msg, 'danger')
        return redirect(url_for('message.view_thread', thread_id=thread_id))
    
    content = Validator.sanitize_html(content)
    
    try:
        message = MessageDAL.create_message(
            sender_id=current_user.user_id,
            receiver_id=receiver_id,
            content=content,
            thread_id=thread_id,
            resource_id=resource_id
        )
        if _wants_json_response():
            return jsonify({'success': True, 'message': _serialize_message(message, other_user)})
        flash('Reply sent!', 'success')
    except Exception as e:
        if _wants_json_response():
            return jsonify({'error': f'Error sending reply: {str(e)}'}), 500
        flash(f'Error sending reply: {str(e)}', 'danger')
    
    return redirect(url_for('message.view_thread', thread_id=thread_id))

@message_bp.route('/flag/<int:message_id>', methods=['POST'])
@login_required
def flag_message(message_id):
    """Allow a participant to flag a message."""
    message = MessageDAL.get_message_by_id(message_id)
    if not message:
        flash('Message not found', 'danger')
        return redirect(url_for('message.list_threads'))

    thread = MessageDAL.get_thread_by_id(message.thread_id)
    if not thread or current_user.user_id not in _thread_participants(thread):
        flash('You do not have access to that message', 'danger')
        return redirect(url_for('message.list_threads'))

    reason = request.form.get('reason', '').strip()
    valid, msg = Validator.validate_string(reason, 5, 500, "Reason")
    if not valid:
        flash(msg, 'danger')
        return redirect(url_for('message.view_thread', thread_id=message.thread_id))

    reason = Validator.sanitize_html(reason)
    if MessageDAL.flag_message(message_id, current_user.user_id, reason):
        flash('Message reported to moderators.', 'info')
    else:
        flash('Unable to report that message right now.', 'danger')

    return redirect(url_for('message.view_thread', thread_id=message.thread_id))
