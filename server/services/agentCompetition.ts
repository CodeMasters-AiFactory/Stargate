/**
 * Agent Competition System
 * Multiple AI agents with different design philosophies compete to design components
 * User picks the winner, system learns from preferences
 * Phase 1A Week 4: Agent Competition Mode
 */

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Design philosophies for competing agents
export type DesignPhilosophy = 'minimalist' | 'bold' | 'elegant';

export interface AgentProfile {
  id: string;
  name: string;
  philosophy: DesignPhilosophy;
  description: string;
  personality: string;
  strengths: string[];
  designPrinciples: string[];
  exampleWebsites: string[];
}

export interface CompetitionRequest {
  componentType: string;
  context?: {
    pageType?: string;
    industry?: string;
    targetAudience?: string;
    brandPersonality?: string;
  };
  requirements?: string[];
  userId?: string;
  projectId?: string;
}

export interface AgentDesign {
  agentId: string;
  agentName: string;
  philosophy: DesignPhilosophy;
  html: string;
  css: string;
  reasoning: string;
  designChoices: {
    colors: string[];
    typography: string[];
    spacing: string;
    layout: string;
    visualStyle: string;
  };
  confidence: number;
  generationTime: number;
}

export interface CompetitionResult {
  competitionId: string;
  request: CompetitionRequest;
  designs: AgentDesign[];
  timestamp: Date;
  status: 'generating' | 'completed' | 'error';
  winner?: string; // Set when user picks winner
}

// Agent profiles with distinct design philosophies
const AGENT_PROFILES: AgentProfile[] = [
  {
    id: 'agent-minimalist',
    name: 'Minimalist Maven',
    philosophy: 'minimalist',
    description: 'Focuses on simplicity, whitespace, and clarity. Less is more.',
    personality: 'Calm, thoughtful, and precise. Believes in the power of restraint.',
    strengths: ['Clean layouts', 'Generous whitespace', 'Clear typography', 'Subtle colors'],
    designPrinciples: [
      'Remove everything that is not essential',
      'Let content breathe with whitespace',
      'Use subtle, neutral colors',
      'Sans-serif typography for clarity',
      'Grid-based layouts for order',
    ],
    exampleWebsites: ['Apple.com', 'Stripe.com', 'Linear.app'],
  },
  {
    id: 'agent-bold',
    name: 'Bold Innovator',
    philosophy: 'bold',
    description: 'Embraces vibrant colors, large typography, and high contrast. Make a statement.',
    personality: 'Confident, energetic, and daring. Believes in standing out.',
    strengths: ['Vibrant color palettes', 'Large, impactful typography', 'High contrast', 'Dynamic layouts'],
    designPrinciples: [
      'Use color to command attention',
      'Typography should be large and impactful',
      'Embrace asymmetry and dynamism',
      'Create visual hierarchy with contrast',
      'Be memorable and distinctive',
    ],
    exampleWebsites: ['Spotify.com', 'Airbnb.com', 'Dropbox.com'],
  },
  {
    id: 'agent-elegant',
    name: 'Elegant Craftsperson',
    philosophy: 'elegant',
    description: 'Prioritizes sophistication, refinement, and timeless beauty. Classic and polished.',
    personality: 'Refined, detail-oriented, and classic. Believes in timeless design.',
    strengths: ['Serif typography', 'Subtle color harmony', 'Balanced layouts', 'Refined details'],
    designPrinciples: [
      'Use serif fonts for sophistication',
      'Choose muted, harmonious colors',
      'Create balanced, symmetrical layouts',
      'Add refined details and flourishes',
      'Aim for timeless, not trendy',
    ],
    exampleWebsites: ['Chanel.com', 'Rolex.com', 'Tesla.com'],
  },
];

// In-memory storage for competitions
const competitions = new Map<string, CompetitionResult>();

/**
 * Get all agent profiles
 */
export function getAgentProfiles(): AgentProfile[] {
  return AGENT_PROFILES;
}

/**
 * Get agent profile by philosophy
 */
export function getAgentByPhilosophy(philosophy: DesignPhilosophy): AgentProfile | undefined {
  return AGENT_PROFILES.find((agent) => agent.philosophy === philosophy);
}

/**
 * Generate design prompt for specific agent
 */
function generateAgentPrompt(agent: AgentProfile, request: CompetitionRequest): string {
  const { componentType, context, requirements } = request;

  let prompt = `You are ${agent.name}, a ${agent.philosophy} designer with a distinct design philosophy.\n\n`;
  prompt += `**Your Personality**: ${agent.personality}\n\n`;
  prompt += `**Your Design Principles**:\n`;
  agent.designPrinciples.forEach((principle) => {
    prompt += `- ${principle}\n`;
  });
  prompt += `\n**Your Task**: Design a ${componentType} component that embodies your ${agent.philosophy} philosophy.\n\n`;

  if (context) {
    prompt += `**Context**:\n`;
    if (context.pageType) prompt += `- Page Type: ${context.pageType}\n`;
    if (context.industry) prompt += `- Industry: ${context.industry}\n`;
    if (context.targetAudience) prompt += `- Target Audience: ${context.targetAudience}\n`;
    if (context.brandPersonality) prompt += `- Brand Personality: ${context.brandPersonality}\n`;
    prompt += `\n`;
  }

  if (requirements && requirements.length > 0) {
    prompt += `**Requirements**:\n`;
    requirements.forEach((req) => {
      prompt += `- ${req}\n`;
    });
    prompt += `\n`;
  }

  prompt += `**Output Format** (JSON):\n`;
  prompt += `{\n`;
  prompt += `  "html": "<!-- Your HTML here with inline Tailwind classes -->",\n`;
  prompt += `  "css": "/* Any custom CSS if needed */",\n`;
  prompt += `  "reasoning": "Why this design embodies ${agent.philosophy} philosophy",\n`;
  prompt += `  "designChoices": {\n`;
  prompt += `    "colors": ["color1", "color2"],\n`;
  prompt += `    "typography": ["font1", "font2"],\n`;
  prompt += `    "spacing": "description",\n`;
  prompt += `    "layout": "description",\n`;
  prompt += `    "visualStyle": "description"\n`;
  prompt += `  },\n`;
  prompt += `  "confidence": 0.85\n`;
  prompt += `}\n\n`;

  prompt += `**Remember**: Stay true to your ${agent.philosophy} philosophy. Your design should be distinctly different from other philosophies.\n`;

  return prompt;
}

/**
 * Generate design using Claude (Minimalist agent)
 */
async function generateClaudeDesign(agent: AgentProfile, request: CompetitionRequest): Promise<AgentDesign> {
  const startTime = Date.now();

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const prompt = generateAgentPrompt(agent, request);

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

  // Parse JSON response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  let parsedResponse;
  if (jsonMatch) {
    parsedResponse = JSON.parse(jsonMatch[0]);
  } else {
    throw new Error('Failed to parse agent response');
  }

  const generationTime = Date.now() - startTime;

  return {
    agentId: agent.id,
    agentName: agent.name,
    philosophy: agent.philosophy,
    html: parsedResponse.html || '<div>Error: No HTML generated</div>',
    css: parsedResponse.css || '',
    reasoning: parsedResponse.reasoning || 'No reasoning provided',
    designChoices: parsedResponse.designChoices || {
      colors: [],
      typography: [],
      spacing: '',
      layout: '',
      visualStyle: '',
    },
    confidence: parsedResponse.confidence || 0.5,
    generationTime,
  };
}

/**
 * Generate design using GPT-4o (Bold agent)
 */
async function generateGPTDesign(agent: AgentProfile, request: CompetitionRequest): Promise<AgentDesign> {
  const startTime = Date.now();

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = generateAgentPrompt(agent, request);

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are ${agent.name}, a ${agent.philosophy} designer. Always respond with valid JSON.`,
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
  });

  const responseText = completion.choices[0].message.content || '';

  // Parse JSON response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  let parsedResponse;
  if (jsonMatch) {
    parsedResponse = JSON.parse(jsonMatch[0]);
  } else {
    throw new Error('Failed to parse agent response');
  }

  const generationTime = Date.now() - startTime;

  return {
    agentId: agent.id,
    agentName: agent.name,
    philosophy: agent.philosophy,
    html: parsedResponse.html || '<div>Error: No HTML generated</div>',
    css: parsedResponse.css || '',
    reasoning: parsedResponse.reasoning || 'No reasoning provided',
    designChoices: parsedResponse.designChoices || {
      colors: [],
      typography: [],
      spacing: '',
      layout: '',
      visualStyle: '',
    },
    confidence: parsedResponse.confidence || 0.5,
    generationTime,
  };
}

/**
 * Generate design using Gemini (Elegant agent)
 */
async function generateGeminiDesign(agent: AgentProfile, request: CompetitionRequest): Promise<AgentDesign> {
  const startTime = Date.now();

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = generateAgentPrompt(agent, request);

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  // Parse JSON response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  let parsedResponse;
  if (jsonMatch) {
    parsedResponse = JSON.parse(jsonMatch[0]);
  } else {
    throw new Error('Failed to parse agent response');
  }

  const generationTime = Date.now() - startTime;

  return {
    agentId: agent.id,
    agentName: agent.name,
    philosophy: agent.philosophy,
    html: parsedResponse.html || '<div>Error: No HTML generated</div>',
    css: parsedResponse.css || '',
    reasoning: parsedResponse.reasoning || 'No reasoning provided',
    designChoices: parsedResponse.designChoices || {
      colors: [],
      typography: [],
      spacing: '',
      layout: '',
      visualStyle: '',
    },
    confidence: parsedResponse.confidence || 0.5,
    generationTime,
  };
}

/**
 * Start agent competition - all 3 agents generate designs in parallel
 */
export async function startAgentCompetition(request: CompetitionRequest): Promise<CompetitionResult> {
  const competitionId = `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const competition: CompetitionResult = {
    competitionId,
    request,
    designs: [],
    timestamp: new Date(),
    status: 'generating',
  };

  competitions.set(competitionId, competition);

  try {
    // Generate designs in parallel
    const [minimalistDesign, boldDesign, elegantDesign] = await Promise.all([
      generateClaudeDesign(AGENT_PROFILES[0], request), // Minimalist
      generateGPTDesign(AGENT_PROFILES[1], request), // Bold
      generateGeminiDesign(AGENT_PROFILES[2], request), // Elegant
    ]);

    competition.designs = [minimalistDesign, boldDesign, elegantDesign];
    competition.status = 'completed';
    competitions.set(competitionId, competition);

    console.log(`✅ Agent competition ${competitionId} completed with 3 designs`);

    return competition;
  } catch (error) {
    console.error('Agent competition error:', error);
    competition.status = 'error';
    competitions.set(competitionId, competition);
    throw error;
  }
}

/**
 * Get competition result by ID
 */
export function getCompetitionResult(competitionId: string): CompetitionResult | undefined {
  return competitions.get(competitionId);
}

/**
 * Get all competitions for a user/project
 */
export function getCompetitionsForProject(userId: string, projectId: string): CompetitionResult[] {
  const results: CompetitionResult[] = [];
  for (const competition of competitions.values()) {
    if (competition.request.userId === userId && competition.request.projectId === projectId) {
      results.push(competition);
    }
  }
  return results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

/**
 * Record winner selection
 */
export function selectWinner(
  competitionId: string,
  winnerAgentId: string,
  userId?: string,
  projectId?: string
): CompetitionResult | undefined {
  const competition = competitions.get(competitionId);
  if (!competition) {
    return undefined;
  }

  competition.winner = winnerAgentId;
  competitions.set(competitionId, competition);

  // Track decision in neural learning (if userId/projectId provided)
  if (userId && projectId) {
    const winningDesign = competition.designs.find((d) => d.agentId === winnerAgentId);
    if (winningDesign) {
      // This will integrate with neuralDesignLearning.ts
      // Track that user prefers this philosophy
      console.log(`✅ User ${userId} selected ${winningDesign.philosophy} design`);
    }
  }

  return competition;
}

/**
 * Get competition statistics for a user
 */
export function getCompetitionStats(userId: string, projectId: string): {
  totalCompetitions: number;
  winsByPhilosophy: Record<DesignPhilosophy, number>;
  averageGenerationTime: number;
  preferredPhilosophy: DesignPhilosophy | null;
} {
  const userCompetitions = getCompetitionsForProject(userId, projectId);
  const completedWithWinner = userCompetitions.filter((c) => c.winner);

  const winsByPhilosophy: Record<DesignPhilosophy, number> = {
    minimalist: 0,
    bold: 0,
    elegant: 0,
  };

  let totalGenerationTime = 0;
  let totalDesigns = 0;

  for (const competition of completedWithWinner) {
    const winningDesign = competition.designs.find((d) => d.agentId === competition.winner);
    if (winningDesign) {
      winsByPhilosophy[winningDesign.philosophy]++;
    }

    for (const design of competition.designs) {
      totalGenerationTime += design.generationTime;
      totalDesigns++;
    }
  }

  const averageGenerationTime = totalDesigns > 0 ? totalGenerationTime / totalDesigns : 0;

  // Determine preferred philosophy
  let preferredPhilosophy: DesignPhilosophy | null = null;
  let maxWins = 0;
  for (const [philosophy, wins] of Object.entries(winsByPhilosophy)) {
    if (wins > maxWins) {
      maxWins = wins;
      preferredPhilosophy = philosophy as DesignPhilosophy;
    }
  }

  return {
    totalCompetitions: userCompetitions.length,
    winsByPhilosophy,
    averageGenerationTime,
    preferredPhilosophy: maxWins > 0 ? preferredPhilosophy : null,
  };
}

/**
 * Generate single design (non-competitive mode)
 */
export async function generateSingleDesign(
  philosophy: DesignPhilosophy,
  request: CompetitionRequest
): Promise<AgentDesign> {
  const agent = getAgentByPhilosophy(philosophy);
  if (!agent) {
    throw new Error(`Agent with philosophy ${philosophy} not found`);
  }

  switch (philosophy) {
    case 'minimalist':
      return await generateClaudeDesign(agent, request);
    case 'bold':
      return await generateGPTDesign(agent, request);
    case 'elegant':
      return await generateGeminiDesign(agent, request);
    default:
      throw new Error(`Unknown philosophy: ${philosophy}`);
  }
}
