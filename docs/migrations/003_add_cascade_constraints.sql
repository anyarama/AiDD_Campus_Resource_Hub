-- Migration: Add CASCADE DELETE constraints for proper data cleanup
-- This migration recreates tables with ON DELETE CASCADE to ensure
-- that when a user is deleted, all their related data is also deleted.
--
-- IMPORTANT: This is a destructive migration for production.
-- Backup your database before running!
--
-- For development: Safe to run, will preserve existing data

-- SQLite doesn't support ALTER TABLE for foreign keys, so we need to:
-- 1. Create new tables with CASCADE
-- 2. Copy data
-- 3. Drop old tables
-- 4. Rename new tables

BEGIN TRANSACTION;

-- ===================================================================
-- RESOURCES TABLE with CASCADE
-- ===================================================================

CREATE TABLE IF NOT EXISTS resources_new (
    resource_id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    location TEXT,
    capacity INTEGER,
    images TEXT,
    equipment TEXT,
    availability_rules TEXT,
    is_restricted INTEGER NOT NULL DEFAULT 0 CHECK(is_restricted IN (0, 1)),
    status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'archived')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Copy data if old table exists
INSERT OR IGNORE INTO resources_new
SELECT * FROM resources WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='resources');

-- ===================================================================
-- BOOKINGS TABLE with CASCADE
-- ===================================================================

CREATE TABLE IF NOT EXISTS bookings_new (
    booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
    resource_id INTEGER NOT NULL,
    requester_id INTEGER NOT NULL,
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected', 'cancelled', 'completed')),
    recurrence_rule TEXT,
    decision_notes TEXT,
    decision_by INTEGER,
    decision_timestamp DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resource_id) REFERENCES resources(resource_id) ON DELETE CASCADE,
    FOREIGN KEY (requester_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (decision_by) REFERENCES users(user_id) ON DELETE SET NULL
);

INSERT OR IGNORE INTO bookings_new
SELECT * FROM bookings WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='bookings');

-- ===================================================================
-- WAITLIST TABLE with CASCADE
-- ===================================================================

CREATE TABLE IF NOT EXISTS waitlist_entries_new (
    entry_id INTEGER PRIMARY KEY AUTOINCREMENT,
    resource_id INTEGER NOT NULL,
    requester_id INTEGER NOT NULL,
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'promoted', 'cancelled')),
    recurrence_rule TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    processed_at DATETIME,
    booking_id INTEGER,
    FOREIGN KEY (resource_id) REFERENCES resources(resource_id) ON DELETE CASCADE,
    FOREIGN KEY (requester_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_waitlist_resource_status_new ON waitlist_entries_new (resource_id, status);

INSERT OR IGNORE INTO waitlist_entries_new
SELECT * FROM waitlist_entries WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='waitlist_entries');

-- ===================================================================
-- MESSAGE THREADS TABLE with CASCADE
-- ===================================================================

CREATE TABLE IF NOT EXISTS message_threads_new (
    thread_id INTEGER PRIMARY KEY AUTOINCREMENT,
    thread_key TEXT NOT NULL UNIQUE,
    owner_id INTEGER NOT NULL,
    participant_id INTEGER NOT NULL,
    resource_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (participant_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (resource_id) REFERENCES resources(resource_id) ON DELETE SET NULL
);

INSERT OR IGNORE INTO message_threads_new
SELECT * FROM message_threads WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='message_threads');

-- ===================================================================
-- MESSAGES TABLE with CASCADE
-- ===================================================================

CREATE TABLE IF NOT EXISTS messages_new (
    message_id INTEGER PRIMARY KEY AUTOINCREMENT,
    thread_id INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    is_flagged INTEGER NOT NULL DEFAULT 0 CHECK(is_flagged IN (0, 1)),
    flag_reason TEXT,
    flagged_by INTEGER,
    flagged_at DATETIME,
    is_hidden INTEGER NOT NULL DEFAULT 0 CHECK(is_hidden IN (0, 1)),
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (thread_id) REFERENCES message_threads(thread_id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (flagged_by) REFERENCES users(user_id) ON DELETE SET NULL
);

INSERT OR IGNORE INTO messages_new
SELECT * FROM messages WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='messages');

-- ===================================================================
-- REVIEWS TABLE with CASCADE
-- ===================================================================

CREATE TABLE IF NOT EXISTS reviews_new (
    review_id INTEGER PRIMARY KEY AUTOINCREMENT,
    resource_id INTEGER NOT NULL,
    reviewer_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comment TEXT,
    is_flagged INTEGER NOT NULL DEFAULT 0 CHECK(is_flagged IN (0, 1)),
    flag_reason TEXT,
    flagged_by INTEGER,
    flagged_at DATETIME,
    is_hidden INTEGER NOT NULL DEFAULT 0 CHECK(is_hidden IN (0, 1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resource_id) REFERENCES resources(resource_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (flagged_by) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_review_new ON reviews_new (resource_id, reviewer_id);

INSERT OR IGNORE INTO reviews_new
SELECT * FROM reviews WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='reviews');

-- ===================================================================
-- ADMIN LOGS TABLE with CASCADE
-- ===================================================================

CREATE TABLE IF NOT EXISTS admin_logs_new (
    log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    target_table TEXT,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE CASCADE
);

INSERT OR IGNORE INTO admin_logs_new
SELECT * FROM admin_logs WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='admin_logs');

-- ===================================================================
-- NOTIFICATIONS TABLE with CASCADE
-- ===================================================================

CREATE TABLE IF NOT EXISTS notifications_new (
    notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

INSERT OR IGNORE INTO notifications_new
SELECT * FROM notifications WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='notifications');

-- ===================================================================
-- USER NOTIFICATION STATE TABLE with CASCADE
-- ===================================================================

CREATE TABLE IF NOT EXISTS user_notification_state_new (
    user_id INTEGER PRIMARY KEY,
    last_seen_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

INSERT OR IGNORE INTO user_notification_state_new
SELECT * FROM user_notification_state WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='user_notification_state');

-- ===================================================================
-- CALENDAR CREDENTIALS TABLE with CASCADE
-- ===================================================================

CREATE TABLE IF NOT EXISTS calendar_credentials_new (
    user_id INTEGER PRIMARY KEY,
    provider TEXT NOT NULL,
    credentials_json TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

INSERT OR IGNORE INTO calendar_credentials_new
SELECT * FROM calendar_credentials WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='calendar_credentials');

-- ===================================================================
-- CALENDAR EVENTS TABLE with CASCADE
-- ===================================================================

CREATE TABLE IF NOT EXISTS calendar_events_new (
    event_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    booking_id INTEGER NOT NULL,
    provider TEXT NOT NULL,
    external_event_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_calendar_event_new ON calendar_events_new (user_id, provider, external_event_id);

INSERT OR IGNORE INTO calendar_events_new
SELECT * FROM calendar_events WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='calendar_events');

-- ===================================================================
-- DROP OLD TABLES AND RENAME NEW ONES
-- ===================================================================

DROP TABLE IF EXISTS calendar_events;
ALTER TABLE calendar_events_new RENAME TO calendar_events;

DROP TABLE IF EXISTS calendar_credentials;
ALTER TABLE calendar_credentials_new RENAME TO calendar_credentials;

DROP TABLE IF EXISTS user_notification_state;
ALTER TABLE user_notification_state_new RENAME TO user_notification_state;

DROP TABLE IF EXISTS notifications;
ALTER TABLE notifications_new RENAME TO notifications;

DROP TABLE IF EXISTS admin_logs;
ALTER TABLE admin_logs_new RENAME TO admin_logs;

DROP TABLE IF EXISTS reviews;
ALTER TABLE reviews_new RENAME TO reviews;

DROP TABLE IF EXISTS messages;
ALTER TABLE messages_new RENAME TO messages;

DROP TABLE IF EXISTS message_threads;
ALTER TABLE message_threads_new RENAME TO message_threads;

DROP TABLE IF EXISTS waitlist_entries;
ALTER TABLE waitlist_entries_new RENAME TO waitlist_entries;

DROP TABLE IF EXISTS bookings;
ALTER TABLE bookings_new RENAME TO bookings;

DROP TABLE IF EXISTS resources;
ALTER TABLE resources_new RENAME TO resources;

COMMIT;

-- Verify foreign keys are still enabled
PRAGMA foreign_keys = ON;

SELECT 'Migration 003 completed successfully - CASCADE constraints added' AS status;
