/**
 * Website Analyzer v4.0
 * Multi-Expert Panel with Human Perception Scoring
 */

import { captureScreenshots, ScreenshotAnalysis } from '../analyzer/screenshotEvaluator';
import {
  evaluateAsUXDesigner,
  evaluateAsProductDesigner,
  evaluateAsConversionStrategist,
  evaluateAsSEOSpecialist,
  evaluateAsBrandAnalyst,
  type ExpertEvaluation
} from '../analyzer/expertAgents';
import { generateConsensus, type ConsensusResult } from '../analyzer/consensus';
import { calculatePerceptionScore, type PerceptionScore } from '../analyzer/humanPerception';
import puppeteer, { Page } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

export interface V4AnalysisResult {
  url: string;
  timestamp: string;
  expertPanel: {
    uxDesigner: ExpertEvaluation;
    productDesigner: ExpertEvaluation;
    conversionStrategist: ExpertEvaluation;
    seoSpecialist: ExpertEvaluation;
    brandAnalyst: ExpertEvaluation;
  };
  consensus: ConsensusResult;
  perception: PerceptionScore;
  finalScore: {
    weightedScore: number; // 0-100
    verdict: 'Poor' | 'OK' | 'Good' | 'Excellent' | 'World-Class';
    meetsExcellentCriteria: boolean;
  };
}

/**
 * Main v4.0 analysis function
 */
export async function analyzeWebsiteV4(url: string): Promise<V4AnalysisResult> {
  const timestamp = new Date().toISOString();
  const domain = new URL(url).hostname.replace(/\./g, '-');
  const outputDir = path.join(process.cwd(), 'website_analysis_reports_v4', domain);
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  let browser: puppeteer.Browser | null = null;
  let page: Page | null = null;
  
  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    // Wait for page to fully load (replacement for deprecated waitForTimeout)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Get content
    const html = await page.content();
    const bodyText = await page.evaluate(() => document.body.innerText);
    
    // Capture screenshots
    const screenshots = await captureScreenshots(url, outputDir);
    
    // PHASE 1: Run all 5 expert evaluators in parallel
    const [
      uxDesigner,
      productDesigner,
      conversionStrategist,
      seoSpecialist,
      brandAnalyst
    ] = await Promise.all([
      evaluateAsUXDesigner(page, html, screenshots),
      evaluateAsProductDesigner(page, html, screenshots),
      evaluateAsConversionStrategist(page, bodyText),
      evaluateAsSEOSpecialist(page, html, bodyText),
      evaluateAsBrandAnalyst(page, html, bodyText, screenshots)
    ]);
    
    const expertPanel = {
      uxDesigner,
      productDesigner,
      conversionStrategist,
      seoSpecialist,
      brandAnalyst
    };
    
    // PHASE 2: Generate consensus
    const consensus = generateConsensus(
      [uxDesigner, productDesigner, conversionStrategist, seoSpecialist, brandAnalyst],
      url,
      bodyText
    );
    
    // PHASE 3: Calculate human perception score
    const perception = await calculatePerceptionScore(page, html, bodyText, screenshots);
    
    // Calculate final weighted score (combine consensus + perception)
    const finalWeightedScore = (consensus.weightedScore * 0.7) + (perception.totalScore * 0.3);
    
    // Determine if meets Excellent criteria
    const thresholds = {
      ux: 8.0,
      visual: 8.0,
      content: 8.0,
      conversion: 7.5,
      seo: 7.5,
      brand: 7.0
    };
    
    const normalizedScores = consensus.normalizedScores;
    const meetsExcellentCriteria = 
      normalizedScores.ux >= thresholds.ux &&
      normalizedScores.visual >= thresholds.visual &&
      normalizedScores.content >= thresholds.content &&
      normalizedScores.conversion >= thresholds.conversion &&
      normalizedScores.seo >= thresholds.seo &&
      normalizedScores.brand >= thresholds.brand &&
      finalWeightedScore >= 75.0;
    
    const finalScore = {
      weightedScore: Math.round(finalWeightedScore * 10) / 10,
      verdict: consensus.finalVerdict,
      meetsExcellentCriteria
    };
    
    // Save all reports
    await saveV4Reports(outputDir, url, {
      expertPanel,
      consensus,
      perception,
      finalScore
    });
    
    return {
      url,
      timestamp,
      expertPanel,
      consensus,
      perception,
      finalScore
    };
  } catch (error) {
    console.error('v4.0 Analysis failed:', error);
    throw error;
  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
  }
}

/**
 * Save all v4.0 reports
 */
async function saveV4Reports(
  outputDir: string,
  url: string,
  data: {
    expertPanel: any;
    consensus: ConsensusResult;
    perception: PerceptionScore;
    finalScore: any;
  }
): Promise<void> {
  // Create expert-panel directory
  const expertDir = path.join(outputDir, 'expert-panel');
  if (!fs.existsSync(expertDir)) {
    fs.mkdirSync(expertDir, { recursive: true });
  }
  
  // Save expert evaluations
  fs.writeFileSync(
    path.join(expertDir, 'ux-designer.json'),
    JSON.stringify(data.expertPanel.uxDesigner, null, 2)
  );
  
  fs.writeFileSync(
    path.join(expertDir, 'product-designer.json'),
    JSON.stringify(data.expertPanel.productDesigner, null, 2)
  );
  
  fs.writeFileSync(
    path.join(expertDir, 'conversion-strategist.json'),
    JSON.stringify(data.expertPanel.conversionStrategist, null, 2)
  );
  
  fs.writeFileSync(
    path.join(expertDir, 'seo-specialist.json'),
    JSON.stringify(data.expertPanel.seoSpecialist, null, 2)
  );
  
  fs.writeFileSync(
    path.join(expertDir, 'brand-analyst.json'),
    JSON.stringify(data.expertPanel.brandAnalyst, null, 2)
  );
  
  // Save consensus
  fs.writeFileSync(
    path.join(outputDir, 'consensus.json'),
    JSON.stringify(data.consensus, null, 2)
  );
  
  // Save perception
  fs.writeFileSync(
    path.join(outputDir, 'perception.json'),
    JSON.stringify(data.perception, null, 2)
  );
  
  // Save final score
  const finalScoreData = {
    url,
    timestamp: new Date().toISOString(),
    expertScores: {
      ux: data.expertPanel.uxDesigner.score,
      visual: data.expertPanel.productDesigner.score,
      conversion: data.expertPanel.conversionStrategist.score,
      seo: data.expertPanel.seoSpecialist.score,
      brand: data.expertPanel.brandAnalyst.score
    },
    consensusScore: data.consensus.weightedScore,
    perceptionScore: data.perception.totalScore,
    weightedFinalScore: data.finalScore.weightedScore,
    verdict: data.finalScore.verdict,
    meetsExcellentCriteria: data.finalScore.meetsExcellentCriteria
  };
  
  fs.writeFileSync(
    path.join(outputDir, 'final-score.json'),
    JSON.stringify(finalScoreData, null, 2)
  );
  
  // Generate summary markdown
  await generateV4Summary(outputDir, url, data);
}

/**
 * Generate v4.0 summary markdown
 */
async function generateV4Summary(
  outputDir: string,
  url: string,
  data: {
    expertPanel: any;
    consensus: ConsensusResult;
    perception: PerceptionScore;
    finalScore: any;
  }
): Promise<void> {
  const summary = `# Website Analysis Report v4.0
## Multi-Expert Panel Evaluation

**Analysis Date:** ${new Date().toISOString()}  
**Industry:** ${data.consensus.industry}  
**Final Verdict:** ${data.finalScore.verdict}  
**Weighted Score:** ${data.finalScore.weightedScore}/100

---

## Expert Panel Scores

| Expert | Score | Verdict | Focus |
|--------|-------|---------|-------|
| UX Designer | ${data.expertPanel.uxDesigner.score.toFixed(1)}/10 | ${data.expertPanel.uxDesigner.verdict} | Layout, flow, spacing, navigation |
| Product Designer | ${data.expertPanel.productDesigner.score.toFixed(1)}/10 | ${data.expertPanel.productDesigner.verdict} | Visual design, typography, brand identity |
| Conversion Strategist | ${data.expertPanel.conversionStrategist.score.toFixed(1)}/10 | ${data.expertPanel.conversionStrategist.verdict} | CTAs, trust, funnels, messaging |
| SEO Specialist | ${data.expertPanel.seoSpecialist.score.toFixed(1)}/10 | ${data.expertPanel.seoSpecialist.verdict} | Structure, metadata, keywords |
| Brand Analyst | ${data.expertPanel.brandAnalyst.score.toFixed(1)}/10 | ${data.expertPanel.brandAnalyst.verdict} | Uniqueness, consistency, narrative |

**Expert Agreement:** ${data.consensus.expertAgreement}%

---

## Consensus Engine

**Industry:** ${data.consensus.industry}  
**Weighted Score:** ${data.consensus.weightedScore}/100  
**Verdict:** ${data.consensus.finalVerdict}

### Normalized Scores (with industry weights):
${Object.entries(data.consensus.normalizedScores).map(([cat, score]) => 
  `- ${cat}: ${(score as number).toFixed(1)}/10`
).join('\n')}

${data.consensus.anomalies.length > 0 ? `\n### Anomalies Detected:\n${data.consensus.anomalies.map(a => `- ${a}`).join('\n')}` : ''}

---

## Human Perception Score

**Total:** ${data.perception.totalScore}/100

- **First Impression:** ${data.perception.firstImpression}/25
- **Emotional Resonance:** ${data.perception.emotionalResonance}/25
- **Cohesion:** ${data.perception.cohesion}/25
- **Identity Recognition:** ${data.perception.identityRecognition}/25

### Breakdown:
- **Trust:** ${data.perception.breakdown.trust}
- **Premium Feel:** ${data.perception.breakdown.premium}
- **Memorable:** ${data.perception.breakdown.memorable}

---

## Final Assessment

**Weighted Final Score:** ${data.finalScore.weightedFinalScore}/100  
**Verdict:** ${data.finalScore.verdict}  
**Meets Excellent Criteria:** ${data.finalScore.meetsExcellentCriteria ? '✅ Yes' : '❌ No'}

---

## Expert Insights

### UX Designer
**Strengths:**
${data.expertPanel.uxDesigner.strengths.map(s => `- ${s}`).join('\n')}

**Weaknesses:**
${data.expertPanel.uxDesigner.weaknesses.map(w => `- ${w}`).join('\n')}

### Product Designer
**Strengths:**
${data.expertPanel.productDesigner.strengths.map(s => `- ${s}`).join('\n')}

**Weaknesses:**
${data.expertPanel.productDesigner.weaknesses.map(w => `- ${w}`).join('\n')}

### Conversion Strategist
**Strengths:**
${data.expertPanel.conversionStrategist.strengths.map(s => `- ${s}`).join('\n')}

**Weaknesses:**
${data.expertPanel.conversionStrategist.weaknesses.map(w => `- ${w}`).join('\n')}

### SEO Specialist
**Strengths:**
${data.expertPanel.seoSpecialist.strengths.map(s => `- ${s}`).join('\n')}

**Weaknesses:**
${data.expertPanel.seoSpecialist.weaknesses.map(w => `- ${w}`).join('\n')}

### Brand Analyst
**Strengths:**
${data.expertPanel.brandAnalyst.strengths.map(s => `- ${s}`).join('\n')}

**Weaknesses:**
${data.expertPanel.brandAnalyst.weaknesses.map(w => `- ${w}`).join('\n')}

---

*Generated by Merlin Website Analyzer v4.0 - Multi-Expert Panel*
`;

  fs.writeFileSync(path.join(outputDir, 'summary.md'), summary);
}

