-- Add ad settings to creators
ALTER TABLE creators ADD COLUMN IF NOT EXISTS ad_frequency INTEGER DEFAULT 4;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS ads_enabled BOOLEAN DEFAULT true;

-- Add creator_id to ad_placements for better filtering
ALTER TABLE ad_placements ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES creators(id) ON DELETE CASCADE;

-- Update existing placements to have a creator_id from their campaign
UPDATE ad_placements 
SET creator_id = (SELECT creator_id FROM ad_campaigns WHERE id = campaign_id)
WHERE creator_id IS NULL;

-- Add Unique constraints for upsert logic
ALTER TABLE ad_clients ADD CONSTRAINT ad_clients_creator_name_key UNIQUE (creator_id, name);
ALTER TABLE ad_campaigns ADD CONSTRAINT ad_campaigns_creator_name_key UNIQUE (creator_id, name);
