import { assessGeneratedWebsite } from './server/services/qualityAssessment';
import express from 'express';

async function main() {
  const app = express();
  const projectSlug = 'the-roasted-bean';
  const port = 5000;

  console.log(`\n🔍 Assessing website: ${projectSlug}\n`);

  try {
    const assessment = await assessGeneratedWebsite(projectSlug, app, port);

    console.log('\n' + '='.repeat(80));
    console.log('📊 QUALITY ASSESSMENT RESULTS');
    console.log('='.repeat(80));
    console.log(`\n🎯 Overall Score: ${assessment.averageScore.toFixed(1)}/10`);
    console.log(`🏆 Verdict: ${assessment.verdict}`);
    console.log(`✅ Meets Thresholds: ${assessment.meetsThresholds ? 'YES' : 'NO'}`);

    console.log('\n📈 Category Scores:');
    console.log(
      `   Visual Design:        ${assessment.scores.visualDesign.toFixed(1)}/10 ${assessment.scores.visualDesign >= 7.5 ? '✅' : '❌'}`
    );
    console.log(
      `   UX & Structure:       ${assessment.scores.uxStructure.toFixed(1)}/10 ${assessment.scores.uxStructure >= 7.5 ? '✅' : '❌'}`
    );
    console.log(
      `   Content Quality:      ${assessment.scores.contentQuality.toFixed(1)}/10 ${assessment.scores.contentQuality >= 7.5 ? '✅' : '❌'}`
    );
    console.log(
      `   Conversion & Trust:   ${assessment.scores.conversionTrust.toFixed(1)}/10 ${assessment.scores.conversionTrust >= 7.5 ? '✅' : '❌'}`
    );
    console.log(
      `   SEO Foundations:      ${assessment.scores.seoFoundations.toFixed(1)}/10 ${assessment.scores.seoFoundations >= 7.5 ? '✅' : '❌'}`
    );
    console.log(
      `   Creativity:           ${assessment.scores.creativity.toFixed(1)}/10 ${assessment.scores.creativity >= 7.5 ? '✅' : '❌'}`
    );

    if (assessment.issues.length > 0) {
      console.log('\n⚠️  Issues Found:');
      assessment.issues.forEach((issue, i) => {
        console.log(`\n   ${i + 1}. [${issue.severity.toUpperCase()}] ${issue.category}`);
        console.log(`      ${issue.description}`);
        console.log(`      💡 ${issue.suggestion}`);
      });
    } else {
      console.log('\n✅ No issues found!');
    }

    console.log('\n' + '='.repeat(80) + '\n');

    // Also output JSON for easy reading
    console.log(JSON.stringify(assessment, null, 2));
  } catch (error: any) {
    console.error('❌ Assessment failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
