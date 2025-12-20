/**
 * Migration Script: Add Design Quality Fields to brand_templates
 * 
 * This script adds the following fields to the brand_templates table:
 * - is_design_quality (boolean, default false)
 * - design_category (text, nullable)
 * - design_score (text, nullable)
 * - design_award_source (text, nullable)
 * 
 * Run with: npx tsx server/scripts/migrate-design-quality-fields.ts
 */

import { db } from '../db';
import { sql } from 'drizzle-orm';

async function migrate() {
  if (!db) {
    console.error('❌ Database not available. Please set DATABASE_URL environment variable.');
    process.exit(1);
  }

  try {
    console.log('🔄 Starting migration: Add Design Quality Fields...');

    // Check if columns already exist
    const checkQuery = sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'brand_templates' 
      AND column_name IN ('is_design_quality', 'design_category', 'design_score', 'design_award_source')
    `;
    
    const existingColumns = await db.execute(checkQuery);
    const existingColumnNames = existingColumns.rows.map((row: any) => row.column_name);

    // Add is_design_quality column
    if (!existingColumnNames.includes('is_design_quality')) {
      console.log('  ➕ Adding is_design_quality column...');
      await db.execute(sql`
        ALTER TABLE brand_templates 
        ADD COLUMN is_design_quality BOOLEAN DEFAULT false NOT NULL
      `);
      console.log('  ✅ is_design_quality column added');
    } else {
      console.log('  ⏭️  is_design_quality column already exists');
    }

    // Add design_category column
    if (!existingColumnNames.includes('design_category')) {
      console.log('  ➕ Adding design_category column...');
      await db.execute(sql`
        ALTER TABLE brand_templates 
        ADD COLUMN design_category TEXT
      `);
      console.log('  ✅ design_category column added');
    } else {
      console.log('  ⏭️  design_category column already exists');
    }

    // Add design_score column
    if (!existingColumnNames.includes('design_score')) {
      console.log('  ➕ Adding design_score column...');
      await db.execute(sql`
        ALTER TABLE brand_templates 
        ADD COLUMN design_score TEXT
      `);
      console.log('  ✅ design_score column added');
    } else {
      console.log('  ⏭️  design_score column already exists');
    }

    // Add design_award_source column
    if (!existingColumnNames.includes('design_award_source')) {
      console.log('  ➕ Adding design_award_source column...');
      await db.execute(sql`
        ALTER TABLE brand_templates 
        ADD COLUMN design_award_source TEXT
      `);
      console.log('  ✅ design_award_source column added');
    } else {
      console.log('  ⏭️  design_award_source column already exists');
    }

    console.log('');
    console.log('✅ Migration completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log('  - is_design_quality: Boolean flag for design-quality templates');
    console.log('  - design_category: Category (Personal, Business, Corporate, etc.)');
    console.log('  - design_score: Design quality score (0-100)');
    console.log('  - design_award_source: Source (Awwwards, CSS Design Awards, etc.)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();

