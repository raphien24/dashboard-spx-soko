-- Target Appeals Table
-- Stores weekly productivity target adjustments after hub appeals are approved

CREATE TABLE IF NOT EXISTS target_appeals (
  id BIGSERIAL PRIMARY KEY,
  week_start DATE NOT NULL,
  contract TEXT NOT NULL,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('2WH', '4WH')),
  appeal_target NUMERIC(10,2) NOT NULL CHECK (appeal_target > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT,
  
  -- Ensure only one appeal per week/contract/vehicle combination
  UNIQUE(week_start, contract, vehicle_type)
);

-- Index for fast lookups by week/contract/vehicle
CREATE INDEX IF NOT EXISTS idx_target_appeals_lookup 
ON target_appeals(week_start, contract, vehicle_type);

-- Index for sorting by date
CREATE INDEX IF NOT EXISTS idx_target_appeals_date 
ON target_appeals(week_start DESC);

-- Enable Row Level Security (optional, for future auth)
ALTER TABLE target_appeals ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for now (anon key)
CREATE POLICY "Allow all operations" ON target_appeals
FOR ALL
USING (true)
WITH CHECK (true);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_target_appeals_updated_at
BEFORE UPDATE ON target_appeals
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Sample data (optional, for testing)
-- INSERT INTO target_appeals (week_start, contract, vehicle_type, appeal_target, updated_by) VALUES
-- ('2024-01-08', 'DPK', '2WH', 95, 'admin'),
-- ('2024-01-08', 'SPX', '4WH', 88, 'admin');
