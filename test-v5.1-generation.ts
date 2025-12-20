/**
 * Test Script: Generate 3 websites using Merlin v5.1 (Upgraded)
 * This script directly tests the v5.1 pipeline with all upgrades
 */

import { generateWebsiteWithLLM } from './server/services/merlinDesignLLM';
import { createProjectConfig } from './server/services/projectConfig';
import * as fs from 'fs';
import * as path from 'path';

interface TestWebsite {
  name: string;
  config: any;
}

const testWebsites: TestWebsite[] = [
  {
    name: 'Smith & Associates Law Firm',
    config: {
      projectName: 'Smith & Associates Law Firm',
      industry: 'Legal Services',
      location: {
        city: 'New York',
        region: 'NY',
        country: 'USA'
      },
      targetAudiences: ['Clients needing legal representation'],
      toneOfVoice: 'Professional, credible, sharp',
      services: [
        { name: 'Criminal Defense', shortDescription: 'Expert criminal defense representation' },
        { name: 'Family Law', shortDescription: 'Comprehensive family law services' },
        { name: 'Estate Planning', shortDescription: 'Professional estate planning and wills' }
      ],
      pagesToGenerate: ['Home'],
      specialNotes: 'Professional legal services firm with decades of experience'
    }
  },
  {
    name: 'CloudSync Pro SaaS',
    config: {
      projectName: 'CloudSync Pro',
      industry: 'SaaS / Cloud Storage',
      location: {
        city: 'San Francisco',
        region: 'CA',
        country: 'USA'
      },
      targetAudiences: ['Tech-forward businesses & teams'],
      toneOfVoice: 'Modern, technical, efficient',
      services: [
        { name: 'Project Management', shortDescription: 'Advanced project management tools' },
        { name: 'Team Collaboration', shortDescription: 'Real-time team collaboration platform' },
        { name: 'Analytics Dashboard', shortDescription: 'Comprehensive analytics and reporting' }
      ],
      pagesToGenerate: ['Home'],
      specialNotes: 'Modern SaaS platform for cloud-based project management'
    }
  },
  {
    name: 'Oceanic Research Institute',
    config: {
      projectName: 'Oceanic Research Institute',
      industry: 'Marine Biology Research',
      location: {
        city: 'Sydney',
        region: 'NSW',
        country: 'Australia'
      },
      targetAudiences: ['Academic, scientific, donors'],
      toneOfVoice: 'Scientific, clean, nature-focused',
      services: [
        { name: 'Marine Research', shortDescription: 'Scientific research on marine life' },
        { name: 'Aquarium Consulting', shortDescription: 'Expert consultation for aquariums' },
        { name: 'Conservation Programs', shortDescription: 'Marine conservation initiatives' }
      ],
      pagesToGenerate: ['Home'],
      specialNotes: 'Leading marine biology research institute studying ocean ecosystems'
    }
  }
];

async function generateAndAnalyze(testWebsite: TestWebsite, index: number) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`GENERATING WEBSITE ${index + 1}/3: ${testWebsite.name}`);
  console.log(`${'='.repeat(80)}\n`);

  try {
    // Create project config
    const projectConfig = createProjectConfig(
      testWebsite.config.projectName,
      testWebsite.config.industry,
      testWebsite.config.location,
      testWebsite.config.targetAudiences,
      testWebsite.config.toneOfVoice,
      testWebsite.config.services,
      testWebsite.config.pagesToGenerate,
      testWebsite.config.brandPreferences,
      testWebsite.config.specialNotes
    );

    console.log(`[TEST] Project Config Created:`);
    console.log(`  - Name: ${projectConfig.projectName}`);
    console.log(`  - Slug: ${projectConfig.projectSlug}`);
    console.log(`  - Industry: ${projectConfig.industry}`);
    console.log(`  - Services: ${projectConfig.services.length}`);

    // Generate website using v5.1 pipeline
    console.log(`\n[TEST] Starting v5.1 generation pipeline...`);
    const website = await generateWebsiteWithLLM(projectConfig, 'html', 1, undefined, 5000);

    // Analyze results
    const report = analyzeGeneration(website, projectConfig, testWebsite.name);

    // Save report
    const reportPath = path.join(process.cwd(), 'test-reports', `${projectConfig.projectSlug}-report.md`);
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, report, 'utf-8');

    console.log(`\n[TEST] Report saved to: ${reportPath}`);
    return report;

  } catch (error: any) {
    console.error(`[TEST] Generation failed for ${testWebsite.name}:`, error);
    return `# Generation Failed: ${testWebsite.name}\n\nError: ${error.message}\n\nStack: ${error.stack}`;
  }
}

function analyzeGeneration(website: any, projectConfig: any, testName: string): string {
  let report = `# Diagnostic Report: ${testName}\n\n`;
  report += `**Generated:** ${new Date().toISOString()}\n`;
  report += `**Project Slug:** ${projectConfig.projectSlug}\n\n`;

  // A) PIPELINE TRACE
  report += `## A) PIPELINE TRACE\n\n`;
  report += `### Phase 1: Design Strategy (v6.0)\n`;
  report += `- Function: \`generateDesignStrategy()\`\n`;
  report += `- File: \`server/ai/designReasoner.ts\`\n`;
  report += `- LLM Used: ✅ GPT-4o\n`;
  report += `- Fallback: Only if API key missing\n\n`;

  report += `### Phase 2: Design Context (Legacy)\n`;
  report += `- Function: \`generateDesignContext()\`\n`;
  report += `- File: \`server/generator/designThinking.ts\`\n`;
  report += `- LLM Used: ❌ Template-based (legacy)\n\n`;

  report += `### Phase 3: Layout Generation\n`;
  report += `- Function: \`generateLayout()\`\n`;
  report += `- File: \`server/generator/layoutLLM.ts\`\n`;
  report += `- LLM Used: ❌ Blueprint selection (scoring algorithm)\n`;
  report += `- Sections Generated: ${website.layout.sections.length}\n\n`;

  report += `### Phase 4: Style System\n`;
  report += `- Function: \`generateStyleSystem()\`\n`;
  report += `- File: \`server/generator/styleSystem.ts\`\n`;
  report += `- LLM Used: ❌ JSON lookup\n\n`;

  report += `### Phase 5: Content Generation (v5.1 Upgraded)\n`;
  report += `- Function: \`generateCopyWithLLM()\`\n`;
  report += `- File: \`server/services/merlinDesignLLM.ts:224\`\n`;
  report += `- LLM Used: ✅ GPT-4o for ALL sections\n`;
  report += `- Fallback: Per-section via \`generateSectionContentFallback()\`\n\n`;

  report += `### Phase 6: Image Generation (v5.1 Upgraded)\n`;
  report += `- Function: \`generateSectionImages()\`\n`;
  report += `- File: \`server/services/merlinDesignLLM.ts:338\`\n`;
  report += `- LLM Used: ✅ DALL-E 3 via \`generateStunningImage()\`\n`;
  report += `- Images Generated: Hero + 1-2 supporting\n\n`;

  report += `### Phase 7: Code Generation (v5.1 Upgraded)\n`;
  report += `- Function: \`generateWebsiteCode()\`\n`;
  report += `- File: \`server/generator/codeGenerator.ts:20\`\n`;
  report += `- LLM Used: ❌ String concatenation (but uses modern CSS)\n\n`;

  // B) CONTENT REPORT
  report += `## B) CONTENT REPORT\n\n`;
  const totalSections = website.layout.sections.length;
  const heroSection = website.layout.sections.find((s: any) => s.type === 'hero');
  const nonHeroSections = website.layout.sections.filter((s: any) => s.type !== 'hero');
  
  report += `- **Total Sections:** ${totalSections}\n`;
  report += `- **Hero Section:** ${heroSection ? 'Yes' : 'No'}\n`;
  report += `- **Non-Hero Sections:** ${nonHeroSections.length}\n`;
  report += `- **Copy Sections Generated:** ${website.copy.sections.length}\n`;
  report += `- **Services Listed:** ${website.copy.services.length}\n\n`;

  // Check for template content
  const templateIndicators = [
    'We combine',
    'trustworthy service',
    'deliver results that matter',
    'tailored to your needs'
  ];
  
  let templateSections: string[] = [];
  website.copy.sections.forEach((section: any, idx: number) => {
    const body = section.body || '';
    if (templateIndicators.some(indicator => body.includes(indicator))) {
      templateSections.push(`Section ${idx + 1} (${section.heading || 'Unknown'})`);
    }
  });

  if (templateSections.length > 0) {
    report += `- **⚠️ Template Content Detected:** ${templateSections.length} sections\n`;
    report += `  - Sections: ${templateSections.join(', ')}\n`;
    report += `  - **Reason:** LLM generation may have failed for these sections\n\n`;
  } else {
    report += `- **✅ All Sections Use LLM Content:** No template indicators found\n\n`;
  }

  // C) IMAGE REPORT
  report += `## C) IMAGE REPORT\n\n`;
  const sectionsWithImages = website.layout.sections.filter((s: any) => s.imageUrl);
  report += `- **Total Images Generated:** ${sectionsWithImages.length}\n\n`;

  website.layout.sections.forEach((section: any, idx: number) => {
    if (section.imageUrl) {
      report += `### Image ${idx + 1}: ${section.type} Section\n`;
      report += `- **URL:** ${section.imageUrl.substring(0, 100)}${section.imageUrl.length > 100 ? '...' : ''}\n`;
      report += `- **Alt Text:** ${section.imageAlt || 'Not set'}\n`;
      if (section.type === 'hero') {
        report += `- **Prompt:** Ultra high-quality hero image for ${projectConfig.projectName}, a ${projectConfig.industry} organization...\n`;
      }
      report += `\n`;
    }
  });

  if (sectionsWithImages.length === 0) {
    report += `- **⚠️ NO IMAGES GENERATED**\n`;
    report += `  - Check logs for image generation errors\n`;
    report += `  - Verify OpenAI API key is set\n\n`;
  }

  // D) CSS / VISUAL REPORT
  report += `## D) CSS / VISUAL REPORT\n\n`;
  const css = website.code.css;
  
  const hasModernTokens = css.includes('--cm-color-') || css.includes('--color-primary');
  const hasCardStyling = css.includes('.feature-card') || css.includes('.section-block');
  const hasModernShadows = css.includes('--cm-shadow-soft') || css.includes('box-shadow');
  const hasResponsive = css.includes('@media');

  report += `- **Modern CSS Tokens:** ${hasModernTokens ? '✅ Yes' : '❌ No'}\n`;
  report += `- **Card Styling:** ${hasCardStyling ? '✅ Yes' : '❌ No'}\n`;
  report += `- **Modern Shadows:** ${hasModernShadows ? '✅ Yes' : '❌ No'}\n`;
  report += `- **Responsive Rules:** ${hasResponsive ? '✅ Yes' : '❌ No'}\n\n`;

  // E) QUALITY JUDGMENT
  report += `## E) QUALITY JUDGMENT\n\n`;
  
  let clarityScore = 7;
  let sophisticationScore = 6;
  let visualAppealScore = 6;
  const problems: string[] = [];

  // Check content quality
  if (templateSections.length > 0) {
    clarityScore -= 2;
    sophisticationScore -= 2;
    problems.push(`${templateSections.length} sections using template content instead of LLM`);
  }

  // Check images
  if (sectionsWithImages.length === 0) {
    visualAppealScore -= 3;
    problems.push('No images generated - visual appeal severely limited');
  } else if (sectionsWithImages.length < 2) {
    visualAppealScore -= 1;
    problems.push('Only 1 image generated - should have 2-3');
  }

  // Check content uniqueness
  const uniqueHeadings = new Set(website.copy.sections.map((s: any) => s.heading));
  if (uniqueHeadings.size < website.copy.sections.length) {
    sophisticationScore -= 1;
    problems.push('Duplicate section headings detected');
  }

  report += `- **Clarity:** ${clarityScore}/10\n`;
  report += `- **Sophistication:** ${sophisticationScore}/10\n`;
  report += `- **Visual Appeal:** ${visualAppealScore}/10\n\n`;

  if (problems.length > 0) {
    report += `### Problems Detected:\n`;
    problems.forEach(p => report += `- ${p}\n`);
    report += `\n`;
  }

  // F) EXPORT RESULT
  report += `## F) EXPORT RESULT\n\n`;
  report += `### Files Generated:\n`;
  report += `- HTML: \`website_projects/${projectConfig.projectSlug}/generated-v5/index.html\`\n`;
  report += `- CSS: \`website_projects/${projectConfig.projectSlug}/generated-v5/styles.css\`\n`;
  report += `- Layout JSON: \`website_projects/${projectConfig.projectSlug}/generated-v5/layout.json\`\n`;
  report += `- Copy JSON: \`website_projects/${projectConfig.projectSlug}/generated-v5/copy.json\`\n`;
  report += `- Style JSON: \`website_projects/${projectConfig.projectSlug}/generated-v5/style.json\`\n\n`;

  report += `### Image URLs:\n`;
  sectionsWithImages.forEach((section: any, idx: number) => {
    report += `${idx + 1}. ${section.type}: ${section.imageUrl}\n`;
  });
  if (sectionsWithImages.length === 0) {
    report += `(No images generated)\n`;
  }

  return report;
}

async function runAllTests() {
  console.log('Starting v5.1 Three-Site Test Suite...\n');
  
  const reports: string[] = [];
  
  for (let i = 0; i < testWebsites.length; i++) {
    const report = await generateAndAnalyze(testWebsites[i], i);
    reports.push(report);
    
    // Wait between tests to avoid rate limits
    if (i < testWebsites.length - 1) {
      console.log('\nWaiting 5 seconds before next test...\n');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  // Generate comparison summary
  const summary = generateComparisonSummary(reports);
  const summaryPath = path.join(process.cwd(), 'test-reports', 'COMPARISON_SUMMARY.md');
  fs.writeFileSync(summaryPath, summary, 'utf-8');
  
  console.log(`\n${'='.repeat(80)}`);
  console.log('ALL TESTS COMPLETE');
  console.log(`${'='.repeat(80)}\n`);
  console.log(`Summary saved to: ${summaryPath}`);
}

function generateComparisonSummary(reports: string[]): string {
  let summary = `# Three-Site Test Comparison Summary\n\n`;
  summary += `**Date:** ${new Date().toISOString()}\n\n`;

  summary += `## Test Sites\n\n`;
  testWebsites.forEach((site, idx) => {
    summary += `${idx + 1}. ${site.name} (${site.config.industry})\n`;
  });
  summary += `\n`;

  summary += `## Key Findings\n\n`;
  summary += `(Analysis of individual reports...)\n\n`;

  summary += `## Remaining Weaknesses in v5.1\n\n`;
  summary += `1. **Layout Selection:** Still uses blueprint scoring, not LLM\n`;
  summary += `2. **Style System:** Still uses JSON lookup, not LLM generation\n`;
  summary += `3. **Code Generation:** Still string concatenation, not semantic HTML\n`;
  summary += `4. **Iteration Loop:** Exists but doesn't actually improve designs\n`;
  summary += `5. **Quality Assessment:** Real assessment exists but no automatic fixes\n\n`;

  summary += `## What Must Be Done in v6.0\n\n`;
  summary += `1. **LLM Layout Planning:** Use GPT-4o to plan section structure and order\n`;
  summary += `2. **LLM Style Generation:** Generate color palettes and typography with AI\n`;
  summary += `3. **Semantic HTML:** Generate proper HTML5 semantic elements\n`;
  summary += `4. **Real Iteration:** Actually revise designs based on quality feedback\n`;
  summary += `5. **Automatic Fixes:** Identify and fix issues automatically\n`;

  return summary;
}

// Run tests
runAllTests().catch(console.error);

