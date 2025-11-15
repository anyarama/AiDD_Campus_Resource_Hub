-- Migration: Add structured availability fields to resources table
-- This allows resources to have defined operating hours and booking rules

-- Add new columns for structured availability
ALTER TABLE resources ADD COLUMN availability_schedule TEXT; -- JSON: weekly schedule
ALTER TABLE resources ADD COLUMN min_booking_minutes INTEGER DEFAULT 30; -- Minimum booking duration
ALTER TABLE resources ADD COLUMN max_booking_minutes INTEGER DEFAULT 480; -- Maximum booking duration (8 hours)
ALTER TABLE resources ADD COLUMN booking_increment_minutes INTEGER DEFAULT 30; -- Time slot increments
ALTER TABLE resources ADD COLUMN buffer_minutes INTEGER DEFAULT 0; -- Buffer time between bookings
ALTER TABLE resources ADD COLUMN advance_booking_days INTEGER DEFAULT 90; -- How far ahead can book
ALTER TABLE resources ADD COLUMN min_lead_time_hours INTEGER DEFAULT 0; -- Minimum notice required

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_resources_status ON resources(status);
CREATE INDEX IF NOT EXISTS idx_bookings_resource_datetime ON bookings(resource_id, start_datetime, end_datetime);

-- Example availability_schedule JSON format:
-- {
--   "monday": [{"start": "09:00", "end": "17:00"}],
--   "tuesday": [{"start": "09:00", "end": "17:00"}],
--   "wednesday": [{"start": "09:00", "end": "12:00"}, {"start": "13:00", "end": "17:00"}],
--   "thursday": [{"start": "09:00", "end": "17:00"}],
--   "friday": [{"start": "09:00", "end": "15:00"}],
--   "saturday": [],
--   "sunday": []
-- }
