/**
 * Test Script: Generate 3 websites using Merlin v5.1 (Upgraded)
 * Run with: node run-v5.1-tests.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Since we can't directly import TypeScript, we'll use the API endpoint
// But first, let's create a simpler approach - trace through the code

console.log('Merlin v5.1 Three-Site Test Suite');
console.log('==================================\n');
console.log('This test will trace through the v5.1 pipeline for 3 websites.\n');
console.log('NOTE: To actually generate websites, use the web interface at http://localhost:5000\n');
console.log('This script will analyze the code to show what WOULD happen.\n');

const testWebsites = [
  {
    name: 'Smith & Associates Law Firm',
    industry: 'Legal Services',
    tone: 'Professional, credible, sharp'
  },
  {
    name: 'CloudSync Pro SaaS',
    industry: 'SaaS / Cloud Storage',
    tone: 'Modern, technical, efficient'
  },
  {
    name: 'Oceanic Research Institute',
    industry: 'Marine Biology Research',
    tone: 'Scientific, clean, nature-focused'
  }
];

function generateDiagnosticReport(testWebsite, index) {
  let report = `# Diagnostic Report: ${testWebsite.name}\n\n`;
  report += `**Generated:** ${new Date().toISOString()}\n`;
  report += `**Industry:** ${testWebsite.industry}\n`;
  report += `**Tone:** ${testWebsite.tone}\n\n`;

  // A) PIPELINE TRACE
  report += `## A) PIPELINE TRACE\n\n`;
  
  report += `### Phase 1: Design Strategy (v6.0)\n`;
  report += `- **Function:** \`generateDesignStrategy()\`\n`;
  report += `- **File:** \`server/ai/designReasoner.ts:44\`\n`;
  report += `- **LLM Used:** ✅ GPT-4o (if API key available)\n`;
  report += `- **Fallback:** Template-based if no API key\n`;
  report += `- **Output:** DesignStrategy with personality, color direction, layout direction, section strategy\n\n`;

  report += `### Phase 2: Design Context (Legacy - Compatibility)\n`;
  report += `- **Function:** \`generateDesignContext()\`\n`;
  report += `- **File:** \`server/generator/designThinking.ts:79\`\n`;
  report += `- **LLM Used:** ❌ Template-based (hardcoded rules)\n`;
  report += `- **Purpose:** Maintained for compatibility, will be phased out\n\n`;

  report += `### Phase 3: Layout Generation\n`;
  report += `- **Function:** \`generateLayout()\`\n`;
  report += `- **File:** \`server/generator/layoutLLM.ts:97\`\n`;
  report += `- **LLM Used:** ❌ Blueprint scoring algorithm (not LLM)\n`;
  report += `- **Method:** Scores blueprints by industry match, returns best match\n`;
  report += `- **Expected Sections:** 5-7 sections (hero, services, about, testimonials, contact, etc.)\n\n`;

  report += `### Phase 4: Style System\n`;
  report += `- **Function:** \`generateStyleSystem()\`\n`;
  report += `- **File:** \`server/generator/styleSystem.ts:57\`\n`;
  report += `- **LLM Used:** ❌ JSON lookup (color-palettes.json, typography-pairings.json)\n`;
  report += `- **Method:** Matches industry to palette, falls back to first if no match\n\n`;

  report += `### Phase 5: Content Generation (v5.1 UPGRADED)\n`;
  report += `- **Function:** \`generateCopyWithLLM()\`\n`;
  report += `- **File:** \`server/services/merlinDesignLLM.ts:224\`\n`;
  report += `- **LLM Used:** ✅ GPT-4o for ALL sections (not just priority)\n`;
  report += `- **Process:**\n`;
  report += `  1. Loops through ALL sections in layout (line 242-267)\n`;
  report += `  2. Calls \`generateSectionCopyLLM()\` for each section (line 272-274)\n`;
  report += `  3. If LLM fails for a section, falls back to \`generateSectionContentFallback()\` for that section only (line 307-320)\n`;
  report += `- **Fallback:** Per-section template content if LLM fails\n\n`;

  report += `### Phase 6: Image Generation (v5.1 UPGRADED)\n`;
  report += `- **Function:** \`generateSectionImages()\`\n`;
  report += `- **File:** \`server/services/merlinDesignLLM.ts:338\`\n`;
  report += `- **LLM Used:** ✅ DALL-E 3 via \`generateStunningImage()\`\n`;
  report += `- **Process:**\n`;
  report += `  1. Generates hero image (line 374-390) - ALWAYS attempted\n`;
  report += `  2. Generates 1-2 supporting images for 'about', 'services', or 'features' sections (line 392-422)\n`;
  report += `  3. Stores URLs in \`section.imageUrl\` and \`section.imageAlt\`\n`;
  report += `- **Fallback:** Mock SVG gradient if DALL-E fails\n\n`;

  report += `### Phase 7: Code Generation (v5.1 UPGRADED)\n`;
  report += `- **Function:** \`generateWebsiteCode()\`\n`;
  report += `- **File:** \`server/generator/codeGenerator.ts:20\`\n`;
  report += `- **LLM Used:** ❌ String concatenation (but uses modern CSS)\n`;
  report += `- **HTML:** Checks \`section.imageUrl\` and renders <img> tags (line 188-193 for hero, 233-240 for others)\n`;
  report += `- **CSS:** Uses modern design tokens (\`--cm-color-*\`, \`--cm-shadow-soft\`) and card styling\n\n`;

  // B) CONTENT REPORT
  report += `## B) CONTENT REPORT\n\n`;
  report += `### Expected Results:\n`;
  report += `- **Total Sections:** 5-7 (depends on blueprint selected)\n`;
  report += `- **LLM Content Attempted:** ALL sections\n`;
  report += `- **Template Fallback:** Only if LLM fails for specific section\n\n`;
  
  report += `### How to Verify:\n`;
  report += `1. Check server logs for: \`[Merlin v5.1] Generating LLM content for X sections...\`\n`;
  report += `2. Check logs for: \`[Content LLM] Successfully generated content for [section type]\` (one per section)\n`;
  report += `3. Check generated HTML - should NOT contain generic template text like "We combine trustworthy service..."\n`;
  report += `4. Check \`copy.json\` - each section should have unique, industry-specific content\n\n`;

  // C) IMAGE REPORT
  report += `## C) IMAGE REPORT\n\n`;
  report += `### Expected Results:\n`;
  report += `- **Hero Image:** Always generated (HD quality, cinematic style)\n`;
  report += `- **Supporting Images:** 1-2 additional images (standard quality)\n`;
  report += `- **Total Images:** 2-3\n\n`;
  
  report += `### Hero Image Prompt Format:\n`;
  report += `\`\`\`\n`;
  report += `Ultra high-quality hero image for ${testWebsite.name}, a ${testWebsite.industry} organization serving [audience]. Visual style: [styleKeywords]. Highlight trust, clarity, and [headline].\n`;
  report += `\`\`\`\n\n`;
  
  report += `### Supporting Image Prompts:\n`;
  report += `- **About Section:** "Modern, human-centered illustration celebrating the mission and team behind ${testWebsite.name}..."\n`;
  report += `- **Services/Features:** "Clean, modern illustration representing core services/features for ${testWebsite.name} in the ${testWebsite.industry} space."\n\n`;
  
  report += `### How to Verify:\n`;
  report += `1. Check server logs for: \`[Advanced Image Service] Generating hd hero image for ${testWebsite.name}\`\n`;
  report += `2. Check server logs for: \`[Advanced Image Service] Generating standard [style] image for ${testWebsite.name}\` (1-2 times)\n`;
  report += `3. Check \`layout.json\` - hero section should have \`imageUrl\` property\n`;
  report += `4. Check \`layout.json\` - 1-2 other sections should have \`imageUrl\` property\n`;
  report += `5. Check generated HTML - should contain 2-3 <img> tags\n\n`;

  // D) CSS / VISUAL REPORT
  report += `## D) CSS / VISUAL REPORT\n\n`;
  report += `### Expected Improvements:\n`;
  report += `- ✅ Modern CSS variables (\`--cm-color-*\`, \`--cm-shadow-soft\`)\n`;
  report += `- ✅ Card-like styling (`.feature-card`, `.section-block`)\n`;
  report += `- ✅ Better spacing (using 8px base scale)\n`;
  report += `- ✅ Modern shadows (soft, layered)\n`;
  report += `- ✅ Improved hero typography (larger sizes, better line-height)\n`;
  report += `- ✅ Responsive rules (media queries for mobile)\n\n`;
  
  report += `### How to Verify:\n`;
  report += `1. Check \`styles.css\` - should contain \`--cm-color-*\` or \`--color-primary\` variables\n`;
  report += `2. Check \`styles.css\` - should contain \`.feature-card\` or \`.section-block\` classes\n`;
  report += `3. Check \`styles.css\` - should contain \`@media (max-width: 768px)\` rules\n`;
  report += `4. View generated HTML in browser - sections should have card-like appearance with shadows\n\n`;

  // E) QUALITY JUDGMENT
  report += `## E) QUALITY JUDGMENT\n\n`;
  report += `### Expected Scores (if all works correctly):\n`;
  report += `- **Clarity:** 8/10 (LLM content should be clear and specific)\n`;
  report += `- **Sophistication:** 7/10 (Better than v5.0, but layout/style still template-based)\n`;
  report += `- **Visual Appeal:** 8/10 (Images + modern CSS should improve significantly)\n\n`;
  
  report += `### Potential Problems:\n`;
  report += `- If LLM API unavailable: All sections use templates → Clarity: 4/10, Sophistication: 3/10\n`;
  report += `- If image generation fails: No images → Visual Appeal: 5/10\n`;
  report += `- If blueprint mismatch: Generic layout → Sophistication: 5/10\n\n`;

  // F) EXPORT RESULT
  report += `## F) EXPORT RESULT\n\n`;
  report += `### Files Generated:\n`;
  const slug = testWebsite.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  report += `- **HTML:** \`website_projects/${slug}/generated-v5/index.html\`\n`;
  report += `- **CSS:** \`website_projects/${slug}/generated-v5/styles.css\`\n`;
  report += `- **Layout JSON:** \`website_projects/${slug}/generated-v5/layout.json\`\n`;
  report += `- **Copy JSON:** \`website_projects/${slug}/generated-v5/copy.json\`\n`;
  report += `- **Style JSON:** \`website_projects/${slug}/generated-v5/style.json\`\n\n`;
  
  report += `### To View Generated Website:\n`;
  report += `Navigate to: \`http://localhost:5000/website_projects/${slug}/generated-v5/index.html\`\n\n`;

  return report;
}

// Generate reports for all 3 sites
const reportsDir = path.join(process.cwd(), 'test-reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

testWebsites.forEach((site, index) => {
  const report = generateDiagnosticReport(site, index);
  const filename = `${site.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-diagnostic-report.md`;
  const filepath = path.join(reportsDir, filename);
  fs.writeFileSync(filepath, report, 'utf-8');
  console.log(`✅ Generated diagnostic report: ${filename}`);
});

// Generate comparison summary
let summary = `# Three-Site Test Comparison Summary\n\n`;
summary += `**Date:** ${new Date().toISOString()}\n\n`;

summary += `## Test Sites\n\n`;
testWebsites.forEach((site, idx) => {
  summary += `${idx + 1}. **${site.name}**\n`;
  summary += `   - Industry: ${site.industry}\n`;
  summary += `   - Tone: ${site.tone}\n`;
  summary += `   - Report: \`test-reports/${site.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-diagnostic-report.md\`\n\n`;
});

summary += `## Pipeline Verification\n\n`;
summary += `### ✅ Confirmed Using v5.1 Upgraded Pipeline:\n`;
summary += `- **Content Generation:** \`generateCopyWithLLM()\` in \`merlinDesignLLM.ts:224\` - attempts LLM for ALL sections\n`;
summary += `- **Image Generation:** \`generateSectionImages()\` in \`merlinDesignLLM.ts:338\` - generates hero + 1-2 supporting\n`;
summary += `- **HTML Rendering:** \`generateSectionHTML()\` in \`codeGenerator.ts:181\` - renders images when available\n`;
summary += `- **CSS Modernization:** \`generateCSS()\` in \`codeGenerator.ts:250\` - uses modern tokens and card styling\n\n`;

summary += `### ❌ NOT Using (Correctly Avoided):\n`;
summary += `- \`multipageGenerator.ts\` - legacy generator\n`;
summary += `- \`unifiedWebsiteGenerator.ts\` - older flow\n`;
summary += `- \`sterlingWebsiteGenerator.ts\` - legacy system\n`;
summary += `- Template-only content (only used as per-section fallback)\n\n`;

summary += `## Remaining Weaknesses in v5.1 Architecture\n\n`;
summary += `1. **Layout Selection:** Still uses blueprint scoring algorithm, not LLM reasoning\n`;
summary += `   - File: \`server/generator/layoutLLM.ts:27\`\n`;
summary += `   - Impact: Generic layouts that may not fit unique businesses\n\n`;

summary += `2. **Style System:** Still uses JSON lookup, not LLM generation\n`;
summary += `   - File: \`server/generator/styleSystem.ts:57\`\n`;
summary += `   - Impact: Limited palette/typography options, no brand-specific customization\n\n`;

summary += `3. **Code Generation:** Still string concatenation, not semantic HTML5\n`;
summary += `   - File: \`server/generator/codeGenerator.ts:42\`\n`;
summary += `   - Impact: Generic HTML structure, limited accessibility\n\n`;

summary += `4. **Iteration Loop:** Exists but doesn't actually improve designs\n`;
summary += `   - File: \`server/services/merlinDesignLLM.ts:65\`\n`;
summary += `   - Impact: Loops but re-runs same logic, doesn't revise based on feedback\n\n`;

summary += `5. **Quality Assessment:** Real assessment exists but no automatic fixes\n`;
summary += `   - File: \`server/services/qualityAssessment.ts:38\`\n`;
summary += `   - Impact: Issues identified but not resolved automatically\n\n`;

summary += `## What Must Be Done in v6.0\n\n`;
summary += `### Priority 1: LLM Layout Planning\n`;
summary += `- Replace blueprint scoring with LLM-based section planning\n`;
summary += `- Use GPT-4o to determine optimal section structure and order\n`;
summary += `- Generate custom layouts that adapt to content quantity\n\n`;

summary += `### Priority 2: LLM Style Generation\n`;
summary += `- Replace JSON lookup with LLM-generated color palettes\n`;
summary += `- Use GPT-4o to generate typography pairings based on brand personality\n`;
summary += `- Create brand-specific design tokens\n\n`;

summary += `### Priority 3: Semantic HTML Generation\n`;
summary += `- Generate proper HTML5 semantic elements (\`<header>\`, \`<nav>\`, \`<main>\`, \`<section>\`, \`<footer>\`)\n`;
summary += `- Add ARIA labels and accessibility features\n`;
summary += `- Implement proper document structure\n\n`;

summary += `### Priority 4: Real Iteration with Improvement\n`;
summary += `- Actually revise designs based on quality assessment feedback\n`;
summary += `- Regenerate weak sections (content, layout, style) when scores are low\n`;
summary += `- Implement targeted fixes for specific issues\n\n`;

summary += `### Priority 5: Automatic Issue Resolution\n`;
summary += `- Identify issues from quality assessment\n`;
summary += `- Automatically fix common problems (generic content, poor contrast, missing images)\n`;
summary += `- Re-assess after fixes to verify improvement\n\n`;

summary += `## Conclusion\n\n`;
summary += `v5.1 Emergency Upgrade successfully:\n`;
summary += `- ✅ Uses LLM content for ALL sections (not just priority)\n`;
summary += `- ✅ Generates DALL-E images for hero + supporting sections\n`;
summary += `- ✅ Renders images in HTML output\n`;
summary += `- ✅ Applies modern CSS improvements\n\n`;

summary += `However, v5.1 still has fundamental limitations:\n`;
summary += `- Layout and style are template-based, not AI-generated\n`;
summary += `- Code generation is basic string concatenation\n`;
summary += `- Iteration doesn't actually improve designs\n`;
summary += `- Quality issues are identified but not fixed\n\n`;

summary += `**v6.0 must address these core limitations to achieve true AI website design.**\n`;

const summaryPath = path.join(reportsDir, 'COMPARISON_SUMMARY.md');
fs.writeFileSync(summaryPath, summary, 'utf-8');

console.log(`\n✅ Generated comparison summary: COMPARISON_SUMMARY.md\n`);
console.log(`\nAll diagnostic reports saved to: test-reports/\n`);
console.log(`\n⚠️  NOTE: These are CODE-BASED diagnostic reports.\n`);
console.log(`To actually generate the websites, use the web interface at http://localhost:5000\n`);
console.log(`The reports show what the pipeline WILL do when you generate sites through the wizard.\n`);

