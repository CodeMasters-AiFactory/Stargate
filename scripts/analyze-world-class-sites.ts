/**
 * Analyze World-Class Websites
 * Uses the strict quality standards to analyze top-tier sites
 * Run with: npx tsx scripts/analyze-world-class-sites.ts
 */

import { analyzeWebsite, saveAnalysisReport } from '../server/services/websiteAnalyzer';
import fs from 'fs';
import path from 'path';

const sites = [
  { name: 'Apple', url: 'https://www.apple.com/' },
  { name: 'Stripe', url: 'https://stripe.com/' },
  { name: 'Airbnb', url: 'https://www.airbnb.com/' },
  { name: 'Shopify', url: 'https://www.shopify.com/' },
  { name: 'Notion', url: 'https://www.notion.so/' },
  { name: 'Tesla', url: 'https://www.tesla.com/' },
  { name: 'Slack', url: 'https://slack.com/' },
  { name: 'IBM Design', url: 'https://www.ibm.com/design/' },
  { name: 'Monday.com', url: 'https://monday.com/' },
  { name: 'Dropbox', url: 'https://www.dropbox.com/' }
];

async function analyzeAllSites() {
  console.log('🌍 Analyzing World-Class Websites...\n');
  console.log('Using strict quality standards (0-10 scale)\n');
  console.log('='.repeat(60) + '\n');

  const results: Array<{
    name: string;
    url: string;
    analysis: any;
  }> = [];

  for (let i = 0; i < sites.length; i++) {
    const site = sites[i];
    console.log(`[${i + 1}/${sites.length}] Analyzing ${site.name}...`);
    console.log(`   URL: ${site.url}`);

    try {
      const analysis = await analyzeWebsite(site.url);
      results.push({ name: site.name, url: site.url, analysis });

      // Save report
      saveAnalysisReport(analysis);

      // Display summary
      console.log(`   Average Score: ${analysis.averageScore.toFixed(1)}/10`);
      console.log(`   Verdict: ${analysis.finalVerdict}`);
      console.log(`   Categories:`);
      console.log(`     - Visual Design: ${analysis.categoryScores.visualDesign}/10`);
      console.log(`     - UX & Structure: ${analysis.categoryScores.uxStructure}/10`);
      console.log(`     - Content: ${analysis.categoryScores.contentPositioning}/10`);
      console.log(`     - Conversion: ${analysis.categoryScores.conversionTrust}/10`);
      console.log(`     - SEO: ${analysis.categoryScores.seoFoundations}/10`);
      console.log(`     - Creativity: ${analysis.categoryScores.creativityDifferentiation}/10`);
      console.log('');

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`   ❌ Error analyzing ${site.name}:`, error);
      console.log('');
    }
  }

  // Summary table
  console.log('='.repeat(60));
  console.log('SUMMARY - World-Class Website Analysis');
  console.log('='.repeat(60));
  console.log('');
  console.log('Site Name'.padEnd(20) + 'Score'.padEnd(10) + 'Verdict');
  console.log('-'.repeat(60));

  results.forEach(r => {
    const score = r.analysis.averageScore.toFixed(1);
    const verdict = r.analysis.finalVerdict;
    console.log(r.name.padEnd(20) + score.padEnd(10) + verdict);
  });

  console.log('');
  console.log('='.repeat(60));
  console.log('Detailed reports saved to: website_analysis_reports/');
  console.log('='.repeat(60));

  // Save combined report
  const combinedReport = {
    analyzedAt: new Date().toISOString(),
    sites: results.map(r => ({
      name: r.name,
      url: r.url,
      averageScore: r.analysis.averageScore,
      verdict: r.analysis.finalVerdict,
      categoryScores: r.analysis.categoryScores
    }))
  };

  const reportPath = path.join(process.cwd(), 'website_analysis_reports', 'world-class-benchmark.json');
  fs.writeFileSync(reportPath, JSON.stringify(combinedReport, null, 2), 'utf-8');
  console.log(`\nCombined benchmark saved to: ${reportPath}`);
}

analyzeAllSites().catch(console.error);

