-- Migration to add AI Citable Lead column to services
ALTER TABLE services
ADD COLUMN IF NOT EXISTS ai_citable_lead TEXT;
