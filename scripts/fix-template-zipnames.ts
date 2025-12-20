/**
 * Fix templates missing zipName in contentData
 * This script updates existing templates to include zipName so preview endpoint can find images
 */

import { db } from '../server/db.ts';
import { brandTemplates } from '../shared/schema.ts';
import { eq } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

async function fixTemplateZipNames() {
  console.log('🔧 Fixing template zipNames...\n');
  
  if (!db) {
    console.error('❌ Database not connected');
    return;
  }
  
  try {
    // Get all downloaded templates
    const templates = await db.select()
      .from(brandTemplates)
      .where(eq(brandTemplates.brand, 'Downloaded Template'));
    
    console.log(`Found ${templates.length} downloaded templates\n`);
    
    const extractedDir = path.join(process.cwd(), 'temp_extracted_templates');
    const dirs = fs.existsSync(extractedDir) 
      ? fs.readdirSync(extractedDir, { withFileTypes: true })
          .filter(d => d.isDirectory())
          .map(d => d.name)
      : [];
    
    console.log(`Found ${dirs.length} extracted template directories\n`);
    
    let updated = 0;
    let skipped = 0;
    
    for (const template of templates) {
      const contentData = (template.contentData as any) || {};
      const currentZipName = contentData.zipName;
      
      if (currentZipName) {
        console.log(`✅ ${template.name}: Already has zipName: ${currentZipName}`);
        skipped++;
        continue;
      }
      
      // Try to find matching directory
      // Template ID format: downloaded-{id}-{name-slug}
      // Directory format: templatemo_XXX_name
      const templateNameSlug = template.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      // Look for directory that might match
      let foundDir: string | null = null;
      for (const dir of dirs) {
        // Check if directory name contains template name keywords
        const dirLower = dir.toLowerCase();
        if (dirLower.includes('templatemo') || dirLower.includes('template')) {
          // Try to match by checking if template name words appear in directory
          const nameWords = template.name.toLowerCase().split(/\s+/).filter(w => w.length > 3);
          const matches = nameWords.filter(word => dirLower.includes(word)).length;
          if (matches > 0) {
            foundDir = dir;
            break;
          }
        }
      }
      
      // If not found, try to infer from template ID or use first available
      if (!foundDir && dirs.length > 0) {
        // Try extracting number from template ID
        const idMatch = template.id.match(/downloaded-\w+-([^-]+)/);
        if (idMatch) {
          const idSlug = idMatch[1];
          foundDir = dirs.find(d => d.toLowerCase().includes(idSlug)) || dirs[0];
        } else {
          foundDir = dirs[updated % dirs.length]; // Round-robin if can't match
        }
      }
      
      if (foundDir) {
        // Determine zipName - add .zip extension
        const zipName = foundDir.endsWith('.zip') ? foundDir : `${foundDir}.zip`;
        
        // Update template
        const updatedContentData = {
          ...contentData,
          zipName: zipName,
        };
        
        await db.update(brandTemplates)
          .set({
            contentData: updatedContentData,
            updatedAt: new Date(),
          })
          .where(eq(brandTemplates.id, template.id));
        
        console.log(`✅ Updated ${template.name}: zipName = ${zipName}`);
        updated++;
      } else {
        console.log(`⚠️  ${template.name}: Could not find matching directory`);
      }
    }
    
    console.log(`\n✅ Done! Updated: ${updated}, Skipped: ${skipped}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

fixTemplateZipNames();

