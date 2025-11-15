-- Campus Resource Hub incremental schema upgrade
-- Execute each statement individually; ignore "duplicate column" errors if re-running.

-- Extend resources with richer metadata
ALTER TABLE resources ADD COLUMN equipment TEXT;
ALTER TABLE resources ADD COLUMN availability_rules TEXT;
ALTER TABLE resources ADD COLUMN is_restricted INTEGER NOT NULL DEFAULT 0 CHECK(is_restricted IN (0, 1));

-- Support recurring bookings
ALTER TABLE bookings ADD COLUMN recurrence_rule TEXT;

-- Store messaging threads explicitly (per participant pair/resource)
CREATE TABLE IF NOT EXISTS message_threads (
    thread_id INTEGER PRIMARY KEY AUTOINCREMENT,
    thread_key TEXT NOT NULL UNIQUE,
    owner_id INTEGER NOT NULL,
    participant_id INTEGER NOT NULL,
    resource_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(user_id),
    FOREIGN KEY (participant_id) REFERENCES users(user_id),
    FOREIGN KEY (resource_id) REFERENCES resources(resource_id)
);

-- Persist simulated email notifications
CREATE TABLE IF NOT EXISTS notifications (
    notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    channel TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'sent')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Waitlist tracking for fully booked resources
CREATE TABLE IF NOT EXISTS waitlist_entries (
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
    FOREIGN KEY (resource_id) REFERENCES resources(resource_id),
    FOREIGN KEY (requester_id) REFERENCES users(user_id),
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
);

CREATE INDEX IF NOT EXISTS idx_waitlist_resource_status ON waitlist_entries (resource_id, status);
