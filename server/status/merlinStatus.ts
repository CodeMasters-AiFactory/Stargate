/**
 * Merlin v6.10 - Pipeline Status
 * Provides status information about the Merlin 6.x AI website generation pipeline
 */

export const MERLIN_PIPELINE_STATUS = {
  version: "6.10",
  stable: true,
  notes: "Merlin 6.x AI website pipeline fully active.",
  modules: {
    sectionPlanner: "6.1",
    styleDesigner: "6.2",
    sectionVariants: "6.3",
    responsiveEngine: "6.4",
    imagePlanner: "6.5",
    copywriter: "6.6",
    seoEngine: "6.7",
    multiPage: "6.8",
    themeEngine: "6.9"
  },
  features: [
    "AI-powered section planning",
    "AI style designer for niche industries",
    "Component variants system",
    "Responsive layout engine",
    "AI image planning",
    "AI copywriting 3.0",
    "AI SEO engine",
    "Multi-page architecture",
    "Global theme engine"
  ],
  activePipeline: "merlinDesignLLM.ts",
  deprecatedGenerators: [
    "unifiedWebsiteGenerator.ts",
    "sterlingWebsiteGenerator.ts",
    "multipageGenerator.ts (old)"
  ]
};

/**
 * Get current pipeline status
 */
export function getMerlinStatus() {
  return MERLIN_PIPELINE_STATUS;
}

/**
 * Check if pipeline is ready
 */
export function isPipelineReady(): boolean {
  return MERLIN_PIPELINE_STATUS.stable;
}

