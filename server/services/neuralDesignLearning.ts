/**
 * Neural Design Learning Service
 * Tracks user design decisions and builds preference profiles using MemoryAwareAgent
 * Auto-applies learned styles to new components
 *
 * Week 2 of Phase 1A - 180% Competitive Advantage
 */

import { memoryAwareAgent } from '../ai/MemoryAwareAgent';

export interface DesignDecision {
  id: string;
  timestamp: Date;
  userId: string;
  projectId: string;
  decisionType: 'color' | 'typography' | 'spacing' | 'layout' | 'component';
  action: 'selected' | 'applied' | 'rejected' | 'modified';
  before?: any;
  after?: any;
  context: {
    componentType?: string;
    elementType?: string;
    pageType?: string;
    industryType?: string;
  };
  metadata?: {
    aiSuggested?: boolean;
    manualOverride?: boolean;
    confidence?: number;
  };
}

export interface DesignPreferenceProfile {
  userId: string;
  projectId: string;
  lastUpdated: Date;
  confidence: number; // 0-1, increases with more decisions
  preferences: {
    colors: {
      primaryColors: string[];
      accentColors: string[];
      backgroundStyles: string[];
      textColors: string[];
      preferredPalette?: string;
    };
    typography: {
      headingFonts: string[];
      bodyFonts: string[];
      fontSizes: {
        heading: string[];
        body: string[];
        small: string[];
      };
      fontWeights: string[];
      preferredStyle?: 'modern' | 'classic' | 'playful' | 'professional';
    };
    spacing: {
      sectionPadding: string[];
      elementMargin: string[];
      containerWidth: string[];
      preferredDensity?: 'compact' | 'comfortable' | 'spacious';
    };
    layout: {
      gridSystems: string[];
      alignments: string[];
      componentArrangements: string[];
      preferredStyle?: 'minimalist' | 'bold' | 'elegant';
    };
    components: {
      mostUsed: string[];
      leastUsed: string[];
      preferredVariants: Record<string, string>;
    };
  };
  patterns: {
    timeOfDayPreferences?: Record<string, any>;
    frequentCombinations: Array<{
      items: string[];
      frequency: number;
    }>;
    avoidedPatterns: string[];
  };
  insights: {
    designPhilosophy: string; // "Minimalist and modern" | "Bold and colorful" | etc
    expertiseLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    consistencyScore: number; // How consistent are their choices
    explorationScore: number; // How much do they experiment
  };
}

export interface LearningRecommendation {
  id: string;
  type: 'color' | 'typography' | 'spacing' | 'layout' | 'component';
  confidence: number;
  suggestion: string;
  reasoning: string;
  autoApply: boolean; // Auto-apply if confidence > 0.85
  preview?: {
    before: string;
    after: string;
  };
}

// In-memory storage (in production, use database)
const designDecisions: Map<string, DesignDecision[]> = new Map();
const preferenceProfiles: Map<string, DesignPreferenceProfile> = new Map();

/**
 * Track a design decision made by the user
 */
export async function trackDesignDecision(decision: Omit<DesignDecision, 'id' | 'timestamp'>): Promise<void> {
  const fullDecision: DesignDecision = {
    ...decision,
    id: `decision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
  };

  // Store decision
  const key = `${decision.userId}-${decision.projectId}`;
  if (!designDecisions.has(key)) {
    designDecisions.set(key, []);
  }
  designDecisions.get(key)!.push(fullDecision);

  // Update preference profile
  await updatePreferenceProfile(decision.userId, decision.projectId);

  // Notify MemoryAwareAgent for long-term learning
  await notifyMemoryAgent(fullDecision);
}

/**
 * Get user's design preference profile
 */
export function getPreferenceProfile(userId: string, projectId: string): DesignPreferenceProfile | null {
  const key = `${userId}-${projectId}`;
  return preferenceProfiles.get(key) || null;
}

/**
 * Generate recommendations based on learned preferences
 */
export async function getLearnedRecommendations(
  userId: string,
  projectId: string,
  context: {
    componentType?: string;
    pageType?: string;
  }
): Promise<LearningRecommendation[]> {
  const profile = getPreferenceProfile(userId, projectId);

  if (!profile || profile.confidence < 0.3) {
    // Not enough data to make recommendations
    return [];
  }

  const recommendations: LearningRecommendation[] = [];

  // Color recommendations
  if (profile.preferences.colors.primaryColors.length > 0 && profile.confidence > 0.5) {
    const mostUsedColor = getMostFrequent(profile.preferences.colors.primaryColors);
    recommendations.push({
      id: `rec-color-${Date.now()}`,
      type: 'color',
      confidence: profile.confidence,
      suggestion: `Use ${mostUsedColor} as primary color`,
      reasoning: `You've chosen this color ${getFrequency(profile.preferences.colors.primaryColors, mostUsedColor)} times. It aligns with your design philosophy: "${profile.insights.designPhilosophy}"`,
      autoApply: profile.confidence > 0.85,
    });
  }

  // Typography recommendations
  if (profile.preferences.typography.headingFonts.length > 0 && profile.confidence > 0.6) {
    const preferredFont = getMostFrequent(profile.preferences.typography.headingFonts);
    const preferredSize = getMostFrequent(profile.preferences.typography.fontSizes.heading);
    recommendations.push({
      id: `rec-typography-${Date.now()}`,
      type: 'typography',
      confidence: profile.confidence,
      suggestion: `Use ${preferredFont} at ${preferredSize} for headings`,
      reasoning: `Based on ${profile.preferences.typography.headingFonts.length} previous heading choices, you prefer ${profile.preferences.typography.preferredStyle || 'modern'} typography.`,
      autoApply: profile.confidence > 0.85,
    });
  }

  // Spacing recommendations
  if (profile.preferences.spacing.sectionPadding.length > 0 && profile.confidence > 0.5) {
    const preferredPadding = getMostFrequent(profile.preferences.spacing.sectionPadding);
    recommendations.push({
      id: `rec-spacing-${Date.now()}`,
      type: 'spacing',
      confidence: profile.confidence,
      suggestion: `Apply ${preferredPadding} section padding`,
      reasoning: `You typically prefer ${profile.preferences.spacing.preferredDensity || 'comfortable'} layouts. This spacing matches your style.`,
      autoApply: profile.confidence > 0.85,
    });
  }

  // Component recommendations
  if (context.componentType && profile.preferences.components.preferredVariants[context.componentType]) {
    const preferredVariant = profile.preferences.components.preferredVariants[context.componentType];
    recommendations.push({
      id: `rec-component-${Date.now()}`,
      type: 'component',
      confidence: profile.confidence,
      suggestion: `Use ${preferredVariant} variant for ${context.componentType}`,
      reasoning: `You consistently choose this variant for ${context.componentType} components.`,
      autoApply: profile.confidence > 0.9, // Higher threshold for components
    });
  }

  // Layout recommendations based on patterns
  if (profile.patterns.frequentCombinations.length > 0) {
    const topPattern = profile.patterns.frequentCombinations[0];
    if (topPattern.frequency > 3) {
      recommendations.push({
        id: `rec-layout-${Date.now()}`,
        type: 'layout',
        confidence: Math.min(profile.confidence * 1.2, 1), // Boost confidence for patterns
        suggestion: `Consider using ${topPattern.items.join(' + ')} combination`,
        reasoning: `You've used this combination ${topPattern.frequency} times. It's a signature part of your design style.`,
        autoApply: false, // Never auto-apply layout changes
      });
    }
  }

  return recommendations;
}

/**
 * Auto-apply learned styles to a component
 */
export async function autoApplyLearnedStyles(
  userId: string,
  projectId: string,
  componentType: string,
  baseStyles: any
): Promise<{ styles: any; applied: string[] }> {
  const recommendations = await getLearnedRecommendations(userId, projectId, { componentType });
  const autoApplyRecs = recommendations.filter(rec => rec.autoApply);

  const updatedStyles = { ...baseStyles };
  const appliedRecommendations: string[] = [];

  for (const rec of autoApplyRecs) {
    switch (rec.type) {
      case 'color':
        // Extract color from suggestion
        const colorMatch = rec.suggestion.match(/#[0-9a-fA-F]{6}/);
        if (colorMatch) {
          updatedStyles.color = colorMatch[0];
          appliedRecommendations.push(rec.suggestion);
        }
        break;

      case 'typography':
        // Extract font and size from suggestion
        const fontMatch = rec.suggestion.match(/Use (.+) at (.+) for/);
        if (fontMatch) {
          updatedStyles.fontFamily = fontMatch[1];
          updatedStyles.fontSize = fontMatch[2];
          appliedRecommendations.push(rec.suggestion);
        }
        break;

      case 'spacing':
        // Extract padding from suggestion
        const paddingMatch = rec.suggestion.match(/Apply (.+) section padding/);
        if (paddingMatch) {
          updatedStyles.padding = paddingMatch[1];
          appliedRecommendations.push(rec.suggestion);
        }
        break;

      case 'component':
        // Component variant selection (handled separately)
        appliedRecommendations.push(rec.suggestion);
        break;
    }
  }

  return {
    styles: updatedStyles,
    applied: appliedRecommendations,
  };
}

/**
 * Get insights about user's design preferences
 */
export function getDesignInsights(userId: string, projectId: string): string[] {
  const profile = getPreferenceProfile(userId, projectId);

  if (!profile || profile.confidence < 0.3) {
    return ['Keep designing! I need more decisions to learn your style.'];
  }

  const insights: string[] = [];

  // Design philosophy
  insights.push(`Your design philosophy: ${profile.insights.designPhilosophy}`);

  // Expertise level
  insights.push(`Expertise level: ${profile.insights.expertiseLevel}`);

  // Consistency
  if (profile.insights.consistencyScore > 0.8) {
    insights.push(`You have a very consistent design style (${Math.round(profile.insights.consistencyScore * 100)}% consistency)`);
  } else if (profile.insights.consistencyScore < 0.4) {
    insights.push(`You like to experiment with different styles (${Math.round(profile.insights.explorationScore * 100)}% exploration)`);
  }

  // Color preferences
  if (profile.preferences.colors.primaryColors.length > 0) {
    const topColor = getMostFrequent(profile.preferences.colors.primaryColors);
    insights.push(`Favorite primary color: ${topColor}`);
  }

  // Typography preferences
  if (profile.preferences.typography.preferredStyle) {
    insights.push(`Typography style: ${profile.preferences.typography.preferredStyle}`);
  }

  // Layout preferences
  if (profile.preferences.layout.preferredStyle) {
    insights.push(`Layout style: ${profile.preferences.layout.preferredStyle}`);
  }

  // Most used components
  if (profile.preferences.components.mostUsed.length > 0) {
    insights.push(`Most used components: ${profile.preferences.components.mostUsed.slice(0, 3).join(', ')}`);
  }

  return insights;
}

/**
 * Private: Update preference profile based on new decisions
 */
async function updatePreferenceProfile(userId: string, projectId: string): Promise<void> {
  const key = `${userId}-${projectId}`;
  const decisions = designDecisions.get(key) || [];

  if (decisions.length === 0) return;

  // Initialize or get existing profile
  let profile = preferenceProfiles.get(key);
  if (!profile) {
    profile = createEmptyProfile(userId, projectId);
  }

  // Update confidence based on number of decisions
  profile.confidence = Math.min(decisions.length / 20, 1); // Max confidence at 20 decisions
  profile.lastUpdated = new Date();

  // Analyze color decisions
  const colorDecisions = decisions.filter(d => d.decisionType === 'color' && d.action === 'applied');
  if (colorDecisions.length > 0) {
    profile.preferences.colors.primaryColors = colorDecisions
      .filter(d => d.after?.type === 'primary')
      .map(d => d.after?.value)
      .filter(Boolean);

    profile.preferences.colors.accentColors = colorDecisions
      .filter(d => d.after?.type === 'accent')
      .map(d => d.after?.value)
      .filter(Boolean);
  }

  // Analyze typography decisions
  const typographyDecisions = decisions.filter(d => d.decisionType === 'typography' && d.action === 'applied');
  if (typographyDecisions.length > 0) {
    profile.preferences.typography.headingFonts = typographyDecisions
      .filter(d => d.context.elementType === 'heading')
      .map(d => d.after?.fontFamily)
      .filter(Boolean);

    profile.preferences.typography.fontSizes.heading = typographyDecisions
      .filter(d => d.context.elementType === 'heading')
      .map(d => d.after?.fontSize)
      .filter(Boolean);

    // Detect typography style
    profile.preferences.typography.preferredStyle = detectTypographyStyle(profile.preferences.typography.headingFonts);
  }

  // Analyze spacing decisions
  const spacingDecisions = decisions.filter(d => d.decisionType === 'spacing' && d.action === 'applied');
  if (spacingDecisions.length > 0) {
    profile.preferences.spacing.sectionPadding = spacingDecisions
      .filter(d => d.context.componentType === 'section')
      .map(d => d.after?.padding)
      .filter(Boolean);

    // Detect spacing density
    profile.preferences.spacing.preferredDensity = detectSpacingDensity(profile.preferences.spacing.sectionPadding);
  }

  // Analyze layout decisions
  const layoutDecisions = decisions.filter(d => d.decisionType === 'layout' && d.action === 'applied');
  if (layoutDecisions.length > 0) {
    profile.preferences.layout.gridSystems = layoutDecisions
      .map(d => d.after?.gridType)
      .filter(Boolean);

    // Detect layout style
    profile.preferences.layout.preferredStyle = detectLayoutStyle(layoutDecisions);
  }

  // Analyze component usage
  const componentDecisions = decisions.filter(d => d.decisionType === 'component' && d.action === 'applied');
  const componentCounts = countFrequency(componentDecisions.map(d => d.context.componentType).filter(Boolean) as string[]);
  profile.preferences.components.mostUsed = Object.keys(componentCounts).sort((a, b) => componentCounts[b] - componentCounts[a]);

  // Track preferred component variants
  componentDecisions.forEach(d => {
    if (d.context.componentType && d.after?.variant) {
      profile.preferences.components.preferredVariants[d.context.componentType] = d.after.variant;
    }
  });

  // Detect patterns
  profile.patterns.frequentCombinations = detectFrequentCombinations(decisions);

  // Calculate insights
  profile.insights.designPhilosophy = generateDesignPhilosophy(profile);
  profile.insights.expertiseLevel = calculateExpertiseLevel(decisions.length, profile.confidence);
  profile.insights.consistencyScore = calculateConsistencyScore(decisions);
  profile.insights.explorationScore = calculateExplorationScore(decisions);

  // Save updated profile
  preferenceProfiles.set(key, profile);
}

/**
 * Private: Notify MemoryAwareAgent about design decision for long-term learning
 */
async function notifyMemoryAgent(decision: DesignDecision): Promise<void> {
  try {
    // Build context message for memory agent
    const message = `User made a ${decision.decisionType} decision: ${decision.action} ${JSON.stringify(decision.after)}`;

    const context = {
      agentId: 'frontend-specialist',
      conversationContext: {
        history: [{
          type: 'system',
          content: `Design decision tracked: ${decision.decisionType}`,
          timestamp: decision.timestamp.toISOString(),
        }],
      },
      userPreferences: {
        experienceLevel: 'intermediate',
        communicationStyle: 'professional',
      },
      projectContext: {
        name: decision.projectId,
        developmentPhase: 'design',
      },
    };

    // Process through memory agent (this stores it in persistent memory)
    await memoryAwareAgent.processMessage('design-session', message, context, decision.projectId);
  } catch (error) {
    console.error('Failed to notify memory agent:', error);
    // Don't throw - learning should never block main functionality
  }
}

/**
 * Helper functions
 */
function createEmptyProfile(userId: string, projectId: string): DesignPreferenceProfile {
  return {
    userId,
    projectId,
    lastUpdated: new Date(),
    confidence: 0,
    preferences: {
      colors: {
        primaryColors: [],
        accentColors: [],
        backgroundStyles: [],
        textColors: [],
      },
      typography: {
        headingFonts: [],
        bodyFonts: [],
        fontSizes: {
          heading: [],
          body: [],
          small: [],
        },
        fontWeights: [],
      },
      spacing: {
        sectionPadding: [],
        elementMargin: [],
        containerWidth: [],
      },
      layout: {
        gridSystems: [],
        alignments: [],
        componentArrangements: [],
      },
      components: {
        mostUsed: [],
        leastUsed: [],
        preferredVariants: {},
      },
    },
    patterns: {
      frequentCombinations: [],
      avoidedPatterns: [],
    },
    insights: {
      designPhilosophy: 'Still learning your style...',
      expertiseLevel: 'beginner',
      consistencyScore: 0,
      explorationScore: 0,
    },
  };
}

function getMostFrequent<T>(arr: T[]): T {
  const counts = countFrequency(arr);
  return Object.keys(counts).reduce((a, b) => counts[a as any] > counts[b as any] ? a : b) as T;
}

function getFrequency<T>(arr: T[], item: T): number {
  return arr.filter(x => x === item).length;
}

function countFrequency<T>(arr: T[]): Record<string, number> {
  return arr.reduce((acc, item) => {
    const key = String(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

function detectTypographyStyle(fonts: string[]): 'modern' | 'classic' | 'playful' | 'professional' {
  const modernFonts = ['Inter', 'Roboto', 'Poppins', 'Montserrat'];
  const classicFonts = ['Georgia', 'Times New Roman', 'Garamond', 'Baskerville'];
  const playfulFonts = ['Comic Sans', 'Pacifico', 'Lobster', 'Quicksand'];

  const fontList = fonts.join(' ').toLowerCase();

  if (modernFonts.some(f => fontList.includes(f.toLowerCase()))) return 'modern';
  if (classicFonts.some(f => fontList.includes(f.toLowerCase()))) return 'classic';
  if (playfulFonts.some(f => fontList.includes(f.toLowerCase()))) return 'playful';

  return 'professional';
}

function detectSpacingDensity(paddings: string[]): 'compact' | 'comfortable' | 'spacious' {
  const avgPadding = paddings.reduce((sum, p) => {
    const num = parseInt(p.replace(/[^0-9]/g, '')) || 0;
    return sum + num;
  }, 0) / (paddings.length || 1);

  if (avgPadding < 32) return 'compact';
  if (avgPadding > 64) return 'spacious';
  return 'comfortable';
}

function detectLayoutStyle(decisions: DesignDecision[]): 'minimalist' | 'bold' | 'elegant' {
  // Simplified detection based on decision patterns
  const hasSimplicity = decisions.some(d => d.after?.simple === true);
  const hasBoldness = decisions.some(d => d.after?.bold === true);

  if (hasSimplicity) return 'minimalist';
  if (hasBoldness) return 'bold';
  return 'elegant';
}

function detectFrequentCombinations(decisions: DesignDecision[]): Array<{ items: string[]; frequency: number }> {
  // Group decisions by time window (5 minutes)
  const timeWindow = 5 * 60 * 1000;
  const groups: Map<number, DesignDecision[]> = new Map();

  decisions.forEach(d => {
    const bucket = Math.floor(d.timestamp.getTime() / timeWindow);
    if (!groups.has(bucket)) groups.set(bucket, []);
    groups.get(bucket)!.push(d);
  });

  // Extract combinations
  const combinations: Record<string, number> = {};
  groups.forEach(group => {
    if (group.length >= 2) {
      const items = group.map(d => d.decisionType).sort();
      const key = items.join('+');
      combinations[key] = (combinations[key] || 0) + 1;
    }
  });

  return Object.entries(combinations)
    .map(([key, frequency]) => ({
      items: key.split('+'),
      frequency,
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5);
}

function generateDesignPhilosophy(profile: DesignPreferenceProfile): string {
  const parts: string[] = [];

  if (profile.preferences.layout.preferredStyle) {
    parts.push(profile.preferences.layout.preferredStyle);
  }

  if (profile.preferences.typography.preferredStyle) {
    parts.push(profile.preferences.typography.preferredStyle);
  }

  if (profile.preferences.spacing.preferredDensity) {
    parts.push(profile.preferences.spacing.preferredDensity);
  }

  return parts.length > 0 ? parts.join(' and ') : 'Exploring different styles';
}

function calculateExpertiseLevel(decisionCount: number, confidence: number): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
  const score = decisionCount * confidence;

  if (score > 50) return 'expert';
  if (score > 25) return 'advanced';
  if (score > 10) return 'intermediate';
  return 'beginner';
}

function calculateConsistencyScore(decisions: DesignDecision[]): number {
  if (decisions.length < 5) return 0;

  // Group by decision type
  const groups = new Map<string, any[]>();
  decisions.forEach(d => {
    if (!groups.has(d.decisionType)) groups.set(d.decisionType, []);
    groups.get(d.decisionType)!.push(d.after);
  });

  // Calculate consistency within each group
  let totalConsistency = 0;
  let groupCount = 0;

  groups.forEach(group => {
    if (group.length >= 3) {
      const uniqueValues = new Set(group.map(g => JSON.stringify(g))).size;
      const consistency = 1 - (uniqueValues / group.length);
      totalConsistency += consistency;
      groupCount++;
    }
  });

  return groupCount > 0 ? totalConsistency / groupCount : 0;
}

function calculateExplorationScore(decisions: DesignDecision[]): number {
  if (decisions.length < 5) return 1;

  // Count unique decision types
  const uniqueTypes = new Set(decisions.map(d => d.decisionType)).size;
  const maxTypes = 5; // color, typography, spacing, layout, component

  return uniqueTypes / maxTypes;
}
