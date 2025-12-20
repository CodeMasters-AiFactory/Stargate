/**
 * Email Sequence Service
 * Phase 3.3: Marketing Automation - Automated email sequences with triggers
 */

import * as fs from 'fs';
import * as path from 'path';
import { sendEmail } from './marketing';
// Note: getCampaign function doesn't exist yet - using stub
// import { getCampaign } from './emailMarketingService';

export interface SequenceTrigger {
  id: string;
  type: 'immediate' | 'delay' | 'event' | 'condition' | 'date';
  config: {
    // For 'delay' type
    delayDays?: number;
    delayHours?: number;
    delayMinutes?: number;

    // For 'event' type
    eventType?: 'form_submit' | 'page_view' | 'purchase' | 'download' | 'email_click' | 'email_open';
    eventValue?: string;

    // For 'condition' type
    conditionField?: string;
    conditionOperator?: 'equals' | 'contains' | 'greaterThan' | 'lessThan';
    conditionValue?: unknown;

    // For 'date' type
    specificDate?: Date;
    dayOfWeek?: number;
    timeOfDay?: string; // HH:mm format
  };
}

export interface SequenceNode {
  id: string;
  type: 'email' | 'delay' | 'condition' | 'split';
  position: { x: number; y: number };

  // For 'email' type
  emailCampaignId?: string;
  emailSubject?: string;
  emailBody?: string;
  emailTemplateId?: string;

  // For 'delay' type
  delayConfig?: {
    days: number;
    hours: number;
    minutes: number;
  };

  // For 'condition' type
  conditionConfig?: {
    field: string;
    operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan';
    value: unknown;
    trueBranch?: string; // Node ID for true condition
    falseBranch?: string; // Node ID for false condition
  };

  // For 'split' type (A/B testing)
  splitConfig?: {
    variantA?: string; // Node ID
    variantB?: string; // Node ID
    splitPercentage: number; // 0-100
    testSubject?: string;
    testDurationDays?: number;
  };

  // Connections
  nextNodeId?: string; // Default next node
  isStart?: boolean; // Start node flag
  isEnd?: boolean; // End node flag
}

export interface EmailSequence {
  id: string;
  websiteId: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  trigger: SequenceTrigger;
  nodes: SequenceNode[];
  segments?: string[]; // Subscriber segment IDs
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  stats: {
    totalEnrolled: number;
    totalCompleted: number;
    totalUnsubscribed: number;
    averageCompletionTime: number; // in hours
    emailsSent: number;
    emailsOpened: number;
    emailsClicked: number;
  };
}

export interface SequenceEnrollment {
  id: string;
  sequenceId: string;
  websiteId: string;
  subscriberId: string;
  subscriberEmail: string;
  currentNodeId: string;
  status: 'active' | 'completed' | 'paused' | 'unsubscribed';
  enrolledAt: Date;
  completedAt?: Date;
  nextActionDate?: Date; // When next email should be sent
  metadata: Record<string, unknown>;
}

/**
 * Get sequence directory
 */
function getSequenceDir(websiteId: string): string {
  const projectDir = path.join(process.cwd(), 'website_projects', websiteId);
  const sequenceDir = path.join(projectDir, 'email-sequences');

  if (!fs.existsSync(sequenceDir)) {
    fs.mkdirSync(sequenceDir, { recursive: true });
  }

  return sequenceDir;
}

/**
 * Sequence Management
 */

export async function getSequences(websiteId: string): Promise<EmailSequence[]> {
  const sequenceDir = getSequenceDir(websiteId);
  const sequencesPath = path.join(sequenceDir, 'sequences.json');

  if (!fs.existsSync(sequencesPath)) {
    return [];
  }

  try {
    const content = fs.readFileSync(sequencesPath, 'utf-8');
    const sequences: EmailSequence[] = JSON.parse(content);
    return sequences.map(seq => ({
      ...seq,
      trigger: {
        ...seq.trigger,
        config: {
          ...seq.trigger.config,
          specificDate: seq.trigger.config.specificDate ? new Date(seq.trigger.config.specificDate) : undefined,
        },
      },
      createdAt: new Date(seq.createdAt),
      updatedAt: new Date(seq.updatedAt),
    }));
  } catch (error) {
    console.error(`[Email Sequence] Failed to load sequences for ${websiteId}:`, error);
    return [];
  }
}

export async function getSequence(websiteId: string, sequenceId: string): Promise<EmailSequence | null> {
  const sequences = await getSequences(websiteId);
  return sequences.find(s => s.id === sequenceId) || null;
}

export async function saveSequence(websiteId: string, sequence: EmailSequence): Promise<void> {
  const sequenceDir = getSequenceDir(websiteId);
  const sequencesPath = path.join(sequenceDir, 'sequences.json');

  const sequences = await getSequences(websiteId);
  const existingIndex = sequences.findIndex(s => s.id === sequence.id);

  if (existingIndex >= 0) {
    sequences[existingIndex] = { ...sequence, updatedAt: new Date() };
  } else {
    sequences.push({ ...sequence, createdAt: new Date(), updatedAt: new Date() });
  }

  fs.writeFileSync(sequencesPath, JSON.stringify(sequences, null, 2), 'utf-8');
  // Log sequence save (using console for now - can be replaced with proper logger)
  // eslint-disable-next-line no-console
  console.log(`[Email Sequence] Saved sequence: ${sequence.name} (${sequence.id}) for ${websiteId}`);
}

export async function deleteSequence(websiteId: string, sequenceId: string): Promise<void> {
  const sequenceDir = getSequenceDir(websiteId);
  const sequencesPath = path.join(sequenceDir, 'sequences.json');

  const sequences = await getSequences(websiteId);
  const filtered = sequences.filter(s => s.id !== sequenceId);

  fs.writeFileSync(sequencesPath, JSON.stringify(filtered, null, 2), 'utf-8');
  // Log sequence deletion (using console for now - can be replaced with proper logger)
  // eslint-disable-next-line no-console
  console.log(`[Email Sequence] Deleted sequence: ${sequenceId} for ${websiteId}`);
}

/**
 * Enrollment Management
 */

export async function getEnrollments(websiteId: string, sequenceId?: string): Promise<SequenceEnrollment[]> {
  const sequenceDir = getSequenceDir(websiteId);
  const enrollmentsPath = path.join(sequenceDir, 'enrollments.json');

  if (!fs.existsSync(enrollmentsPath)) {
    return [];
  }

  try {
    const content = fs.readFileSync(enrollmentsPath, 'utf-8');
    const enrollments: SequenceEnrollment[] = JSON.parse(content);
    const filtered = sequenceId ? enrollments.filter(e => e.sequenceId === sequenceId) : enrollments;

    return filtered.map(e => ({
      ...e,
      enrolledAt: new Date(e.enrolledAt),
      completedAt: e.completedAt ? new Date(e.completedAt) : undefined,
      nextActionDate: e.nextActionDate ? new Date(e.nextActionDate) : undefined,
    }));
  } catch (error) {
    console.error(`[Email Sequence] Failed to load enrollments for ${websiteId}:`, error);
    return [];
  }
}

export async function enrollSubscriber(
  websiteId: string,
  sequenceId: string,
  subscriberId: string,
  subscriberEmail: string,
  metadata: Record<string, unknown> = {}
): Promise<SequenceEnrollment> {
  const sequence = await getSequence(websiteId, sequenceId);
  if (!sequence) {
    throw new Error('Sequence not found');
  }

  // Find start node
  const startNode = sequence.nodes.find(n => n.isStart);
  if (!startNode) {
    throw new Error('Sequence has no start node');
  }

  // Calculate next action date based on trigger
  let nextActionDate: Date | undefined;
  if (sequence.trigger.type === 'immediate') {
    nextActionDate = new Date();
  } else if (sequence.trigger.type === 'delay') {
    const delayMs =
      (sequence.trigger.config.delayDays || 0) * 24 * 60 * 60 * 1000 +
      (sequence.trigger.config.delayHours || 0) * 60 * 60 * 1000 +
      (sequence.trigger.config.delayMinutes || 0) * 60 * 1000;
    nextActionDate = new Date(Date.now() + delayMs);
  }

  const enrollment: SequenceEnrollment = {
    id: `enrollment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    sequenceId,
    websiteId,
    subscriberId,
    subscriberEmail,
    currentNodeId: startNode.id,
    status: 'active',
    enrolledAt: new Date(),
    nextActionDate,
    metadata,
  };

  await saveEnrollment(websiteId, enrollment);

  // Update sequence stats
  sequence.stats.totalEnrolled++;
  await saveSequence(websiteId, sequence);

  // Process immediately if trigger is immediate
  if (sequence.trigger.type === 'immediate') {
    await processEnrollment(websiteId, enrollment);
  }

  return enrollment;
}

async function saveEnrollment(websiteId: string, enrollment: SequenceEnrollment): Promise<void> {
  const sequenceDir = getSequenceDir(websiteId);
  const enrollmentsPath = path.join(sequenceDir, 'enrollments.json');

  const enrollments = await getEnrollments(websiteId);
  const existingIndex = enrollments.findIndex(e => e.id === enrollment.id);

  if (existingIndex >= 0) {
    enrollments[existingIndex] = enrollment;
  } else {
    enrollments.push(enrollment);
  }

  fs.writeFileSync(enrollmentsPath, JSON.stringify(enrollments, null, 2), 'utf-8');
}

/**
 * Process enrollment - execute current node
 */
export async function processEnrollment(
  websiteId: string,
  enrollment: SequenceEnrollment
): Promise<SequenceEnrollment | null> {
  if (enrollment.status !== 'active') {
    return enrollment;
  }

  const sequence = await getSequence(websiteId, enrollment.sequenceId);
  if (!sequence) {
    return null;
  }

  const currentNode = sequence.nodes.find(n => n.id === enrollment.currentNodeId);
  if (!currentNode) {
    // Mark as completed if node not found
    enrollment.status = 'completed';
    enrollment.completedAt = new Date();
    await saveEnrollment(websiteId, enrollment);
    return enrollment;
  }

  // Execute node based on type
  let nextNodeId: string | undefined;

  switch (currentNode.type) {
    case 'email':
      // Send email
      await sendSequenceEmail(websiteId, enrollment, currentNode);
      nextNodeId = currentNode.nextNodeId;
      break;

    case 'delay':
      // Schedule next action after delay
      if (currentNode.delayConfig) {
        const delayMs =
          (currentNode.delayConfig.days || 0) * 24 * 60 * 60 * 1000 +
          (currentNode.delayConfig.hours || 0) * 60 * 60 * 1000 +
          (currentNode.delayConfig.minutes || 0) * 60 * 1000;
        enrollment.nextActionDate = new Date(Date.now() + delayMs);
        nextNodeId = currentNode.nextNodeId;
      }
      break;

    case 'condition':
      // Evaluate condition and branch
      if (currentNode.conditionConfig) {
        const conditionMet = evaluateCondition(enrollment.metadata, currentNode.conditionConfig);
        nextNodeId = conditionMet
          ? currentNode.conditionConfig.trueBranch
          : currentNode.conditionConfig.falseBranch;
      }
      break;

    case 'split':
      // A/B test split
      if (currentNode.splitConfig) {
        const random = Math.random() * 100;
        nextNodeId = random < currentNode.splitConfig.splitPercentage
          ? currentNode.splitConfig.variantA
          : currentNode.splitConfig.variantB;
      }
      break;
  }

  // Move to next node or complete
  if (nextNodeId) {
    const nextNode = sequence.nodes.find(n => n.id === nextNodeId);
    if (nextNode) {
      enrollment.currentNodeId = nextNodeId;

      // Check if next node is immediate
      if (nextNode.type === 'email' || nextNode.type === 'condition') {
        enrollment.nextActionDate = new Date(); // Process immediately
      }
    } else {
      // No next node - sequence complete
      enrollment.status = 'completed';
      enrollment.completedAt = new Date();
      enrollment.nextActionDate = undefined;
    }
  } else {
    // No next node - sequence complete
    enrollment.status = 'completed';
    enrollment.completedAt = new Date();
    enrollment.nextActionDate = undefined;
  }

  await saveEnrollment(websiteId, enrollment);

  // Update sequence stats
  if (enrollment.status === 'completed') {
    sequence.stats.totalCompleted++;
    const completionTime = (enrollment.completedAt!.getTime() - enrollment.enrolledAt.getTime()) / (1000 * 60 * 60);
    sequence.stats.averageCompletionTime =
      (sequence.stats.averageCompletionTime * (sequence.stats.totalCompleted - 1) + completionTime) / sequence.stats.totalCompleted;
  }

  await saveSequence(websiteId, sequence);

  // Process next node immediately if it's not delayed
  if (enrollment.nextActionDate && enrollment.nextActionDate <= new Date()) {
    return await processEnrollment(websiteId, enrollment);
  }

  return enrollment;
}

/**
 * Send sequence email
 */
async function sendSequenceEmail(
  websiteId: string,
  enrollment: SequenceEnrollment,
  node: SequenceNode
): Promise<void> {
  if (node.type !== 'email') return;

  let subject = node.emailSubject || 'Hello';
  let body = node.emailBody || '';

  // Use email campaign if specified
  if (node.emailCampaignId) {
    // TODO: Implement getCampaign function in emailMarketingService
    // const campaign = await getCampaign(websiteId, node.emailCampaignId);
    // if (campaign) {
    //   subject = campaign.subject;
    //   body = campaign.content;
    // }
  }

  // Replace template variables
  subject = replaceVariables(subject, enrollment.metadata);
  body = replaceVariables(body, enrollment.metadata);

  // Send email
  await sendEmail(enrollment.subscriberEmail, subject, body);

  // Update sequence stats
  const sequence = await getSequence(websiteId, enrollment.sequenceId);
  if (sequence) {
    sequence.stats.emailsSent++;
    await saveSequence(websiteId, sequence);
  }
}

/**
 * Replace template variables
 */
function replaceVariables(text: string, metadata: Record<string, unknown>): string {
  let result = text;

  // Replace {{variable}} patterns
  result = result.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return metadata[key] || match;
  });

  return result;
}

/**
 * Evaluate condition
 */
function evaluateCondition(
  metadata: Record<string, unknown>,
  config: NonNullable<SequenceNode['conditionConfig']>
): boolean {
  const value = metadata[config.field];

  switch (config.operator) {
    case 'equals':
      return value === config.value;
    case 'contains':
      return String(value || '').toLowerCase().includes(String(config.value).toLowerCase());
    case 'greaterThan':
      return Number(value || 0) > Number(config.value);
    case 'lessThan':
      return Number(value || 0) < Number(config.value);
    default:
      return false;
  }
}

/**
 * Process pending enrollments (for scheduled actions)
 */
export async function processPendingEnrollments(websiteId: string): Promise<{ processed: number; errors: number }> {
  const enrollments = await getEnrollments(websiteId);
  const now = new Date();

  const pending = enrollments.filter(e =>
    e.status === 'active' &&
    e.nextActionDate &&
    e.nextActionDate <= now
  );

  let processed = 0;
  let errors = 0;

  for (const enrollment of pending) {
    try {
      await processEnrollment(websiteId, enrollment);
      processed++;
    } catch (error) {
      console.error(`[Email Sequence] Failed to process enrollment ${enrollment.id}:`, error);
      errors++;
    }
  }

  return { processed, errors };
}

