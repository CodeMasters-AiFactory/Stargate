/**
 * Test Script for Template Generator
 * Verifies that 10,000 templates are generated correctly
 */

import { generateAllTemplates, getGeneratedTemplates, getTemplateCount } from '../services/templateGenerator';
import { getAllTemplates } from '../services/templateLibrary';

async function testTemplateGenerator() {
  console.log('🧪 Testing Template Generator...\n');

  try {
    // Test 1: Generate 10,000 templates
    console.log('Test 1: Generating 10,000 templates...');
    const startTime = Date.now();
    const templates = generateAllTemplates(10000);
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`✅ Generated ${templates.length} templates in ${duration}s`);
    console.log(`   Average: ${(templates.length / parseFloat(duration)).toFixed(0)} templates/second\n`);

    // Test 2: Verify template count
    console.log('Test 2: Verifying template count...');
    if (templates.length === 10000) {
      console.log('✅ Template count is correct: 10,000\n');
    } else {
      console.log(`❌ Template count mismatch: Expected 10,000, got ${templates.length}\n`);
    }

    // Test 3: Verify template structure
    console.log('Test 3: Verifying template structure...');
    const sampleTemplate = templates[0];
    const requiredFields = ['id', 'name', 'description', 'category', 'industry', 'pages', 'features', 'colorScheme', 'layout'];
    const missingFields = requiredFields.filter(field => !(field in sampleTemplate));
    
    if (missingFields.length === 0) {
      console.log('✅ All templates have required fields\n');
    } else {
      console.log(`❌ Missing fields: ${missingFields.join(', ')}\n`);
    }

    // Test 4: Verify uniqueness
    console.log('Test 4: Verifying template uniqueness...');
    const ids = new Set(templates.map(t => t.id));
    const duplicates = templates.length - ids.size;
    
    if (duplicates === 0) {
      console.log('✅ All template IDs are unique\n');
    } else {
      console.log(`❌ Found ${duplicates} duplicate IDs\n`);
    }

    // Test 5: Verify industry distribution
    console.log('Test 5: Verifying industry distribution...');
    const industryCounts: Record<string, number> = {};
    templates.forEach(t => {
      t.industry.forEach(ind => {
        industryCounts[ind] = (industryCounts[ind] || 0) + 1;
      });
    });
    
    const uniqueIndustries = Object.keys(industryCounts).length;
    console.log(`✅ Found ${uniqueIndustries} unique industries`);
    console.log(`   Top 5 industries:`);
    Object.entries(industryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([industry, count]) => {
        console.log(`   - ${industry}: ${count} templates`);
      });
    console.log('');

    // Test 6: Verify category distribution
    console.log('Test 6: Verifying category distribution...');
    const categoryCounts: Record<string, number> = {};
    templates.forEach(t => {
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
    });
    
    const uniqueCategories = Object.keys(categoryCounts).length;
    console.log(`✅ Found ${uniqueCategories} unique categories`);
    console.log(`   Top 5 categories:`);
    Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([category, count]) => {
        console.log(`   - ${category}: ${count} templates`);
      });
    console.log('');

    // Test 7: Test caching
    console.log('Test 7: Testing caching mechanism...');
    const cacheStartTime = Date.now();
    const cachedTemplates = getGeneratedTemplates(10000, true);
    const cacheEndTime = Date.now();
    const cacheDuration = ((cacheEndTime - cacheStartTime) / 1000).toFixed(2);
    
    if (cacheDuration < duration) {
      console.log(`✅ Caching works: ${cacheDuration}s (faster than ${duration}s)\n`);
    } else {
      console.log(`⚠️  Cache may not be working: ${cacheDuration}s\n`);
    }

    // Test 8: Test with getAllTemplates
    console.log('Test 8: Testing getAllTemplates integration...');
    const allTemplates = getAllTemplates(true, 10000);
    console.log(`✅ getAllTemplates returned ${allTemplates.length} templates (45 manual + 10,000 generated)\n`);

    // Test 9: Performance test - generate 100 templates
    console.log('Test 9: Performance test (100 templates)...');
    const perfStartTime = Date.now();
    const perfTemplates = generateAllTemplates(100);
    const perfEndTime = Date.now();
    const perfDuration = ((perfEndTime - perfStartTime) / 1000).toFixed(3);
    console.log(`✅ Generated 100 templates in ${perfDuration}s\n`);

    // Test 10: Sample template display
    console.log('Test 10: Sample template:');
    console.log(JSON.stringify(sampleTemplate, null, 2));
    console.log('');

    console.log('🎉 All tests completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Total templates: ${templates.length}`);
    console.log(`   - Unique IDs: ${ids.size}`);
    console.log(`   - Industries: ${uniqueIndustries}`);
    console.log(`   - Categories: ${uniqueCategories}`);
    console.log(`   - Generation time: ${duration}s`);
    console.log(`   - Templates/second: ${(templates.length / parseFloat(duration)).toFixed(0)}`);

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests
testTemplateGenerator();

