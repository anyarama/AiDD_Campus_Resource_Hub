-- Adds decision tracking to bookings plus moderation metadata for reviews, messages, and users.

ALTER TABLE bookings ADD COLUMN decision_notes TEXT;
ALTER TABLE bookings ADD COLUMN decision_by INTEGER;
ALTER TABLE bookings ADD COLUMN decision_timestamp DATETIME;

ALTER TABLE messages ADD COLUMN is_flagged INTEGER NOT NULL DEFAULT 0 CHECK(is_flagged IN (0, 1));
ALTER TABLE messages ADD COLUMN flag_reason TEXT;
ALTER TABLE messages ADD COLUMN flagged_by INTEGER;
ALTER TABLE messages ADD COLUMN flagged_at DATETIME;
ALTER TABLE messages ADD COLUMN is_hidden INTEGER NOT NULL DEFAULT 0 CHECK(is_hidden IN (0, 1));

ALTER TABLE reviews ADD COLUMN is_flagged INTEGER NOT NULL DEFAULT 0 CHECK(is_flagged IN (0, 1));
ALTER TABLE reviews ADD COLUMN flag_reason TEXT;
ALTER TABLE reviews ADD COLUMN flagged_by INTEGER;
ALTER TABLE reviews ADD COLUMN flagged_at DATETIME;
ALTER TABLE reviews ADD COLUMN is_hidden INTEGER NOT NULL DEFAULT 0 CHECK(is_hidden IN (0, 1));

ALTER TABLE users ADD COLUMN is_suspended INTEGER NOT NULL DEFAULT 0 CHECK(is_suspended IN (0, 1));
