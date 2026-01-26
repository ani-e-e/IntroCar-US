-- ============================================
-- IntroCar US - T2 Chassis Master Table
-- ============================================
-- This is the KEY reference table for all chassis lookups.
-- The row order (sort_order) is critical for matching fitment ranges.
--
-- Run this in Supabase SQL Editor to create the table.
-- ============================================

-- Drop existing table if needed (uncomment if re-creating)
-- DROP TABLE IF EXISTS t2_chassis_master;

CREATE TABLE IF NOT EXISTS t2_chassis_master (
  id SERIAL PRIMARY KEY,

  -- Core data
  make VARCHAR(50) NOT NULL,
  model VARCHAR(100) NOT NULL,
  chassis VARCHAR(50),  -- Can be alphanumeric like "B2AK" or numeric like "1001"

  -- Year range for this chassis
  year_start INTEGER,
  year_end INTEGER,

  -- Adjusted model name (for grouping)
  adjusted VARCHAR(100),

  -- Composite key for lookups
  make_model_chassis_key VARCHAR(200),

  -- CRITICAL: Sort order determines chronological sequence
  -- This is used to compare chassis ranges (e.g., "B2AN" to "B50HA")
  sort_order INTEGER NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_t2_make ON t2_chassis_master(make);
CREATE INDEX IF NOT EXISTS idx_t2_model ON t2_chassis_master(model);
CREATE INDEX IF NOT EXISTS idx_t2_chassis ON t2_chassis_master(chassis);
CREATE INDEX IF NOT EXISTS idx_t2_make_model ON t2_chassis_master(make, model);
CREATE INDEX IF NOT EXISTS idx_t2_sort_order ON t2_chassis_master(sort_order);
CREATE INDEX IF NOT EXISTS idx_t2_key ON t2_chassis_master(make_model_chassis_key);

-- Unique constraint on the composite key
CREATE UNIQUE INDEX IF NOT EXISTS idx_t2_unique_key ON t2_chassis_master(make_model_chassis_key);

-- Comments
COMMENT ON TABLE t2_chassis_master IS 'Master chassis reference - 581,354 rows. Sort order is critical for range matching.';
COMMENT ON COLUMN t2_chassis_master.sort_order IS 'Row position from original T2 spreadsheet - determines chronological order';
COMMENT ON COLUMN t2_chassis_master.chassis IS 'Chassis number - can be alphanumeric (B2AK) or numeric (1001)';

-- ============================================
-- Helper function to find chassis position
-- ============================================
CREATE OR REPLACE FUNCTION get_chassis_sort_order(
  p_make TEXT,
  p_model TEXT,
  p_chassis TEXT
) RETURNS INTEGER AS $$
DECLARE
  v_sort_order INTEGER;
BEGIN
  SELECT sort_order INTO v_sort_order
  FROM t2_chassis_master
  WHERE make = p_make
    AND model = p_model
    AND chassis = p_chassis
  LIMIT 1;

  RETURN v_sort_order;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Helper function to check if chassis is in range
-- ============================================
CREATE OR REPLACE FUNCTION is_chassis_in_range(
  p_make TEXT,
  p_model TEXT,
  p_chassis TEXT,
  p_range_start TEXT,
  p_range_end TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_chassis_order INTEGER;
  v_start_order INTEGER;
  v_end_order INTEGER;
BEGIN
  -- Get sort orders
  v_chassis_order := get_chassis_sort_order(p_make, p_model, p_chassis);
  v_start_order := get_chassis_sort_order(p_make, p_model, p_range_start);
  v_end_order := get_chassis_sort_order(p_make, p_model, p_range_end);

  -- If any not found, return false
  IF v_chassis_order IS NULL OR v_start_order IS NULL OR v_end_order IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check if in range
  RETURN v_chassis_order >= v_start_order AND v_chassis_order <= v_end_order;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- View: T2 summary by model
-- ============================================
CREATE OR REPLACE VIEW t2_model_summary AS
SELECT
  make,
  model,
  COUNT(*) as chassis_count,
  MIN(year_start) as first_year,
  MAX(year_end) as last_year,
  MIN(sort_order) as first_sort_order,
  MAX(sort_order) as last_sort_order
FROM t2_chassis_master
WHERE chassis IS NOT NULL
GROUP BY make, model
ORDER BY make, model;

COMMENT ON VIEW t2_model_summary IS 'Summary of chassis counts and year ranges by model';
