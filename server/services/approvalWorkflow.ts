/**
 * Approval Workflow Service
 * Manages approval stages for website generation
 */

import { db } from '../db';
import { approvalRequests } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { getErrorMessage, logError } from '../utils/errorHandler';
import { saveApprovalRequest as hybridSaveApproval, processApproval as hybridProcessApproval, getApprovalStatus as hybridGetApprovalStatus } from './hybridStorage';

export type ApprovalStage = 'design' | 'content' | 'images' | 'final';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'changes_requested';

export interface ChangeRequest {
  type: string; // 'text', 'image', 'layout', etc.
  section: string;
  description: string;
  currentValue?: string;
  requestedValue?: string;
}

export interface ApprovalRequest {
  id: string;
  websiteId: string;
  stage: ApprovalStage;
  status: ApprovalStatus;
  requestedBy: string;
  reviewedBy?: string;
  comments?: string;
  changeRequests?: ChangeRequest[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Submit for approval
 */
export async function submitForApproval(
  websiteId: string,
  stage: ApprovalStage,
  requestedBy: string,
  comments?: string
): Promise<string> {
  try {
    // Use hybrid storage (PostgreSQL → SQLite → Memory)
    const approvalId = await hybridSaveApproval(websiteId, stage, requestedBy, comments);
    console.log(`[ApprovalWorkflow] ✅ Submitted ${stage} approval request for website ${websiteId}`);
    return approvalId;
  } catch (error) {
    logError(error, 'ApprovalWorkflow - SubmitForApproval');
    throw error;
  }
}

/**
 * Process approval
 */
export async function processApproval(
  approvalId: string,
  approved: boolean,
  reviewedBy: string,
  comments?: string,
  changeRequests?: ChangeRequest[]
): Promise<ApprovalRequest> {
  try {
    // Use hybrid storage (PostgreSQL → SQLite → Memory)
    const approval = await hybridProcessApproval(approvalId, approved, reviewedBy, comments, changeRequests);
    console.log(`[ApprovalWorkflow] ✅ Processed approval ${approvalId}: ${approval.status}`);
    return approval as ApprovalRequest;
  } catch (error) {
    logError(error, 'ApprovalWorkflow - ProcessApproval');
    throw error;
  }
}

/**
 * Get approval status for website
 */
export async function getApprovalStatus(
  websiteId: string,
  stage?: ApprovalStage
): Promise<ApprovalRequest[]> {
  try {
    // Use hybrid storage (PostgreSQL → SQLite → Memory)
    return await hybridGetApprovalStatus(websiteId, stage) as ApprovalRequest[];
  } catch (error) {
    logError(error, 'ApprovalWorkflow - GetApprovalStatus');
    return [];
  }
}

