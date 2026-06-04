-- Add explicit stat fields for conditions
ALTER TABLE conditions
  ADD COLUMN IF NOT EXISTS stat_turnaround_time VARCHAR(255),
  ADD COLUMN IF NOT EXISTS stat_turnaround_note VARCHAR(255),
  ADD COLUMN IF NOT EXISTS stat_consultation_type VARCHAR(255),
  ADD COLUMN IF NOT EXISTS stat_consultation_note VARCHAR(255),
  ADD COLUMN IF NOT EXISTS stat_starting_price VARCHAR(255),
  ADD COLUMN IF NOT EXISTS stat_provider VARCHAR(255);
