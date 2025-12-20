-- Add new fields to projects table for website builder

-- Add template_id column
ALTER TABLE projects ADD COLUMN IF NOT EXISTS template_id VARCHAR;

-- Add template_name column
ALTER TABLE projects ADD COLUMN IF NOT EXISTS template_name TEXT;

-- Add template_preview column
ALTER TABLE projects ADD COLUMN IF NOT EXISTS template_preview TEXT;

-- Add html column
ALTER TABLE projects ADD COLUMN IF NOT EXISTS html TEXT;

-- Add css column
ALTER TABLE projects ADD COLUMN IF NOT EXISTS css TEXT;

-- Add status column with default
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';

-- Add industry column
ALTER TABLE projects ADD COLUMN IF NOT EXISTS industry TEXT;

-- Add description column
ALTER TABLE projects ADD COLUMN IF NOT EXISTS description TEXT;

-- Add business_info column (JSONB)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS business_info JSONB DEFAULT '{}';

-- Add updated_at column
ALTER TABLE projects ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Add last_edited_at column
ALTER TABLE projects ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMP;

-- Drop old template column if it exists (migrate data first if needed)
-- ALTER TABLE projects DROP COLUMN IF EXISTS template;
