import sqlite3

from src.config import Config
from src.data_access import get_db, init_database
from src.data_access.user_dal import UserDAL
from src.utils.notifications import NotificationService


def test_notification_logged_status_persists(app):
    """Regression test for IntegrityError when storing logged notifications."""
    with app.app_context():
        user = UserDAL.create_user('Notify User', 'notify.user@iu.edu', 'Str0ngPass!')
        app.config['EMAIL_NOTIFICATIONS_ENABLED'] = False

        NotificationService.send_notification(
            user_id=user.user_id,
            subject='Waitlist Update',
            body='Your waitlist request has been recorded.'
        )

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                'SELECT status FROM notifications WHERE user_id = ? ORDER BY notification_id DESC LIMIT 1',
                (user.user_id,)
            )
            row = cursor.fetchone()

        assert row is not None
        assert row['status'] == 'logged'


def test_notification_upgrade_removes_orphans(temp_db):
    """Ensure schema migration drops orphan notifications before rebuild."""
    conn = sqlite3.connect(Config.DATABASE_PATH)
    conn.execute('PRAGMA foreign_keys = OFF')
    cursor = conn.cursor()
    cursor.execute('DROP TABLE IF EXISTS notifications')
    cursor.execute(
        '''
        CREATE TABLE notifications (
            notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            channel TEXT NOT NULL,
            subject TEXT NOT NULL,
            body TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'sent')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
        '''
    )
    # Insert an orphan row referencing a deleted user
    cursor.execute(
        '''
        INSERT INTO notifications (user_id, channel, subject, body, status)
        VALUES (9999, 'email', 'Legacy', 'Orphan row', 'pending')
        '''
    )
    conn.commit()
    conn.close()

    # Re-run init to trigger migration/cleanup
    init_database()

    conn = sqlite3.connect(Config.DATABASE_PATH)
    cursor = conn.cursor()
    cursor.execute(
        'SELECT COUNT(*) FROM notifications WHERE user_id NOT IN (SELECT user_id FROM users)'
    )
    assert cursor.fetchone()[0] == 0
    cursor.execute(
        "SELECT sql FROM sqlite_master WHERE type='table' AND name='notifications'"
    )
    sql = cursor.fetchone()[0]
    conn.close()
    assert "CHECK(status IN ('pending', 'sent', 'logged', 'error'))" in sql
