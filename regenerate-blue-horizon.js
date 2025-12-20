/**
 * Regenerate Blue Horizon Consulting website with fixed navigation
 * Uses the API endpoint instead of direct imports
 */

import fetch from 'node-fetch';

async function regenerateWebsite() {
  console.log('🚀 Regenerating Blue Horizon Consulting website...\n');

  const intakeData = {
    businessName: 'Blue Horizon Consulting',
    businessType: 'Consulting',
    location: {
      city: 'New York',
      region: 'NY',
      country: 'USA',
    },
    services: [
      { name: 'Strategy Development', description: 'Develop robust business strategies.' },
      { name: 'Leadership Training', description: 'Train leaders for future challenges.' },
      { name: 'Market Analysis', description: 'Provide in-depth market insights.' },
    ],
    targetAudience: 'Corporate clients, SMEs, executives',
    primaryGoal: 'Generate leads and establish thought leadership',
    tone: 'Professional',
    brandColors: {
      primary: '#1E40AF',
      secondary: '#DBEAFE',
      accent: '#F59E0B',
    },
    pages: ['Home', 'About', 'Services', 'Contact', 'FAQ'],
    competitorUrl: 'https://mckinsey.com',
    stylePreferences: {
      modern: true,
      minimalist: true,
    },
    contentTone: 'professional',
    seoFocus: ['consulting services', 'business strategy', 'leadership development'],
    targetKeywords: ['business consulting', 'strategy consultant', 'executive coaching'],
  };

  try {
    console.log('📡 Calling Merlin 7.0 API...\n');

    const response = await fetch('http://localhost:5000/api/merlin7/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ intakeData }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Read SSE stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let result = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));

          if (data.type === 'progress') {
            process.stdout.write(
              `\r[Phase ${data.phase}/30] ${data.phaseName}: ${data.message} (${data.progress}%)`
            );
          } else if (data.type === 'complete') {
            result = data;
            console.log('\n');
          } else if (data.type === 'error') {
            throw new Error(data.error);
          }
        }
      }
    }

    if (result) {
      console.log('\n✅ Generation complete!');
      console.log(`Project Slug: ${result.projectSlug}`);
      console.log(`Success: ${result.success}`);
      console.log(`Duration: ${(result.duration / 1000).toFixed(1)}s`);

      // QA Report Summary
      if (result.qaReport) {
        console.log('\n📊 QA Report Summary:');
        console.log(`  Overall Score: ${result.qaReport.overallScore.toFixed(1)}/10`);
        console.log(`  Verdict: ${result.qaReport.verdict}`);
        console.log(
          `  Navigation Integrity: ${result.qaReport.navigation?.integrityScore || 'N/A'}/10`
        );
        console.log(`  Navigation Status: ${result.qaReport.navigation?.status || 'N/A'}`);
        console.log(`  Visual Style: ${result.qaReport.visual?.score || 'N/A'}/10`);
        console.log(`  Meets Thresholds: ${result.qaReport.meetsThresholds ? '✅ YES' : '❌ NO'}`);

        if (result.qaReport.navigation?.issues && result.qaReport.navigation.issues.length > 0) {
          console.log(`\n⚠️  Navigation Issues: ${result.qaReport.navigation.issues.length}`);
          result.qaReport.navigation.issues.forEach((issue, i) => {
            console.log(
              `  ${i + 1}. ${issue.page}: ${issue.link} → ${issue.href} (${issue.reason})`
            );
          });
        } else {
          console.log('\n✅ No navigation issues found!');
        }
      }

      console.log(
        `\n🌐 View at: http://localhost:5000/website_projects/${result.projectSlug}/generated-v5/index.html`
      );

      if (result.errors && result.errors.length > 0) {
        console.log('\n⚠️  Errors:');
        result.errors.forEach(err => console.log(`  - ${err}`));
      }
    }
  } catch (error) {
    console.error('\n❌ Generation failed:', error.message);
    if (error.stack) console.error(error.stack);
  }
}

regenerateWebsite();
