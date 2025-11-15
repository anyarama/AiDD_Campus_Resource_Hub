import pytest

from src.data_access.user_dal import UserDAL
from src.data_access.message_dal import MessageDAL

TEST_PASSWORD = 'StrongPass1!'

def _login(client, email, password=TEST_PASSWORD):
    return client.post(
        '/auth/login',
        data={'email': email, 'password': password},
        follow_redirects=True
    )


def _create_pair(app):
    with app.app_context():
        sender = UserDAL.create_user(
            name='Realtime Sender',
            email='realtime.sender@iu.edu',
            password=TEST_PASSWORD,
            role='student',
            department='Testing'
        )
        receiver = UserDAL.create_user(
            name='Realtime Receiver',
            email='realtime.receiver@iu.edu',
            password=TEST_PASSWORD,
            role='staff',
            department='Testing'
        )
        initial_message = MessageDAL.create_message(
            sender_id=sender.user_id,
            receiver_id=receiver.user_id,
            content='Initial hello'
        )
    return sender, receiver, initial_message


def test_message_feed_returns_incremental_updates(app, client):
    sender, receiver, first_message = _create_pair(app)
    thread_id = first_message.thread_id

    login_resp = _login(client, sender.email)
    assert login_resp.status_code == 200

    resp = client.get(
        f'/messages/thread/{thread_id}/messages/feed',
        headers={'Accept': 'application/json'}
    )
    assert resp.status_code == 200
    payload = resp.get_json()
    assert payload['messages'][0]['content'] == 'Initial hello'

    with app.app_context():
        follow_up = MessageDAL.create_message(
            sender_id=receiver.user_id,
            receiver_id=sender.user_id,
            content='Reply from receiver',
            thread_id=thread_id
        )

    resp = client.get(
        f'/messages/thread/{thread_id}/messages/feed?after_id={first_message.message_id}',
        headers={'Accept': 'application/json'}
    )
    assert resp.status_code == 200
    payload = resp.get_json()
    assert len(payload['messages']) == 1
    assert payload['messages'][0]['content'] == 'Reply from receiver'
    assert payload['messages'][0]['message_id'] == follow_up.message_id


def test_reply_endpoint_supports_json_response(app, client):
    sender, receiver, first_message = _create_pair(app)
    thread_id = first_message.thread_id

    login_resp = _login(client, sender.email)
    assert login_resp.status_code == 200

    resp = client.post(
        f'/messages/reply/{thread_id}',
        data={'content': 'Quick ping'},
        headers={'Accept': 'application/json'}
    )
    assert resp.status_code == 200
    payload = resp.get_json()
    assert payload['success'] is True
    assert payload['message']['content'] == 'Quick ping'
    assert payload['message']['thread_id'] == thread_id
