#!/usr/bin/env node

/**
 * Automated Documentation Generation Script
 * Generates API documentation, extracts code comments, and updates README
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

/**
 * Extract JSDoc/TSDoc comments from code
 */
function extractComments(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const comments = [];
    
    // Match JSDoc/TSDoc comments
    const commentRegex = /\/\*\*[\s\S]*?\*\//g;
    const matches = content.match(commentRegex);
    
    if (matches) {
      matches.forEach(comment => {
        // Extract function/class name if available
        const nameMatch = comment.match(/@(function|class|interface|type)\s+(\w+)/);
        const descriptionMatch = comment.match(/\*\s+([^\n@]+)/);
        
        comments.push({
          file: filePath.replace(projectRoot, ''),
          name: nameMatch ? nameMatch[2] : 'Unknown',
          description: descriptionMatch ? descriptionMatch[1].trim() : '',
          comment: comment
        });
      });
    }
    
    return comments;
  } catch (error) {
    console.warn(`⚠️ Could not read ${filePath}: ${error.message}`);
    return [];
  }
}

/**
 * Generate API documentation
 */
function generateAPIDocs() {
  console.log('📚 Generating API documentation...');
  
  const apiFiles = [];
  const serverDir = join(projectRoot, 'server');
  
  function walkDir(dir) {
    const files = readdirSync(dir);
    
    files.forEach(file => {
      const filePath = join(dir, file);
      const stat = statSync(filePath);
      
      if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('dist')) {
        walkDir(filePath);
      } else if (file.endsWith('.ts') && (file.includes('route') || file.includes('api'))) {
        apiFiles.push(filePath);
      }
    });
  }
  
  walkDir(serverDir);
  
  const allComments = [];
  apiFiles.forEach(file => {
    const comments = extractComments(file);
    allComments.push(...comments);
  });
  
  // Generate markdown documentation
  let markdown = '# API Documentation\n\n';
  markdown += `*Generated automatically on ${new Date().toISOString()}*\n\n`;
  markdown += `## Overview\n\n`;
  markdown += `This documentation is auto-generated from code comments.\n\n`;
  markdown += `## Endpoints\n\n`;
  
  allComments.forEach(comment => {
    markdown += `### ${comment.name}\n\n`;
    markdown += `**File**: \`${comment.file}\`\n\n`;
    if (comment.description) {
      markdown += `${comment.description}\n\n`;
    }
    markdown += `\`\`\`typescript\n${comment.comment}\n\`\`\`\n\n`;
    markdown += `---\n\n`;
  });
  
  // Write to docs directory
  const docsDir = join(projectRoot, 'docs');
  try {
    require('fs').mkdirSync(docsDir, { recursive: true });
  } catch (e) {
    // Directory might already exist
  }
  
  writeFileSync(join(docsDir, 'API.md'), markdown);
  console.log(`✅ API documentation generated: docs/API.md`);
  
  return allComments.length;
}

/**
 * Generate changelog entry
 */
function generateChangelog() {
  console.log('📝 Generating changelog...');
  
  // This would typically read from git commits
  // For now, create a template
  const changelog = `# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Automated documentation generation
- Code review agent
- Suggestion system

### Changed
- Enhanced CI/CD pipeline

### Fixed
- Various bug fixes

---

*This changelog is auto-generated. Update manually for detailed changes.*
`;
  
  writeFileSync(join(projectRoot, 'CHANGELOG.md'), changelog);
  console.log('✅ Changelog generated: CHANGELOG.md');
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Starting documentation generation...\n');
  
  try {
    const commentCount = generateAPIDocs();
    generateChangelog();
    
    console.log(`\n✅ Documentation generation complete!`);
    console.log(`   - Extracted ${commentCount} code comments`);
    console.log(`   - Generated API documentation`);
    console.log(`   - Updated changelog`);
  } catch (error) {
    console.error('❌ Documentation generation failed:', error);
    process.exit(1);
  }
}

main();

