/**
 * Learning & Refinement System
 * Tracks improvements and learns from analyses
 */

import fs from 'fs';
import path from 'path';
import { getProjectDir } from './projectConfig';
import { analyzeWebsite, type WebsiteAnalysis } from './websiteAnalyzer';

/**
 * Auto-analyze a generated website
 */
export async function autoAnalyzeProject(projectSlug: string, websiteUrl?: string): Promise<WebsiteAnalysis | null> {
  try {
    // If URL provided, analyze it
    if (websiteUrl) {
      const analysis = await analyzeWebsite(websiteUrl);
      saveProjectAnalysis(projectSlug, analysis);
      return analysis;
    }
    
    // Otherwise, try to analyze generated HTML files
    const projectDir = getProjectDir(projectSlug);
    const outputDir = path.join(projectDir, 'output');
    
    if (fs.existsSync(outputDir)) {
      // Could implement HTML file analysis here
      // For now, return null if no URL
      return null;
    }
    
    return null;
  } catch (error) {
    console.error(`[Learning System] Error auto-analyzing ${projectSlug}:`, error);
    return null;
  }
}

/**
 * Save analysis report for a project
 */
export function saveProjectAnalysis(projectSlug: string, analysis: WebsiteAnalysis): void {
  const projectDir = getProjectDir(projectSlug);
  const analysisDir = path.join(projectDir, 'analysis');
  
  if (!fs.existsSync(analysisDir)) {
    fs.mkdirSync(analysisDir, { recursive: true });
  }
  
  const timestamp = analysis.timestamp.replace(/[:.]/g, '-');
  const analysisPath = path.join(analysisDir, `${timestamp}.json`);
  
  fs.writeFileSync(analysisPath, JSON.stringify(analysis, null, 2), 'utf-8');
}

/**
 * Get all analyses for a project
 */
export function getProjectAnalyses(projectSlug: string): WebsiteAnalysis[] {
  const projectDir = getProjectDir(projectSlug);
  const analysisDir = path.join(projectDir, 'analysis');
  
  if (!fs.existsSync(analysisDir)) {
    return [];
  }
  
  const files = fs.readdirSync(analysisDir)
    .filter(f => f.endsWith('.json'))
    .sort()
    .reverse(); // Most recent first
  
  return files.map(file => {
    try {
      const content = fs.readFileSync(path.join(analysisDir, file), 'utf-8');
      return JSON.parse(content) as WebsiteAnalysis;
    } catch (error) {
      console.error(`Error reading analysis ${file}:`, error);
      return null;
    }
  }).filter((a): a is WebsiteAnalysis => a !== null);
}

/**
 * Compare two analyses
 */
export function compareAnalyses(oldAnalysis: WebsiteAnalysis, newAnalysis: WebsiteAnalysis): {
  improved: string[];
  declined: string[];
  unchanged: string[];
  overallChange: number;
} {
  const categories = ['visualDesign', 'uxStructure', 'contentPositioning', 'conversionTrust', 'seoFoundations', 'creativityDifferentiation'] as const;
  
  const improved: string[] = [];
  const declined: string[] = [];
  const unchanged: string[] = [];
  
  for (const category of categories) {
    const oldScore = oldAnalysis.categoryScores[category];
    const newScore = newAnalysis.categoryScores[category];
    const diff = newScore - oldScore;
    
    if (diff > 0.5) {
      improved.push(category);
    } else if (diff < -0.5) {
      declined.push(category);
    } else {
      unchanged.push(category);
    }
  }
  
  const overallChange = newAnalysis.averageScore - oldAnalysis.averageScore;
  
  return { improved, declined, unchanged, overallChange };
}

