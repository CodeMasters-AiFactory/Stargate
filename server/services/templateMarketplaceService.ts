/**
 * Template Marketplace Service
 * Phase 3.1: Template Expansion - User submission and monetization
 */

import * as fs from 'fs';
import * as path from 'path';

export interface TemplateSubmission {
  id: string;
  submitterId: string;
  submitterEmail: string;
  template: {
    name: string;
    description: string;
    category: string;
    industry?: string[];
    previewImage?: string;
    html?: string;
    css?: string;
    js?: string;
    thumbnail?: string;
    tags: string[];
  };
  status: 'pending' | 'approved' | 'rejected' | 'published';
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  submittedAt: Date;
  publishedAt?: Date;
  monetization?: {
    isPremium: boolean;
    price?: number;
    revenueShare?: number; // percentage for creator
  };
  stats: {
    downloads: number;
    rating: number;
    reviews: number;
  };
}

export interface TemplateReview {
  id: string;
  templateId: string;
  userId: string;
  userName?: string;
  rating: number; // 1-5
  comment?: string;
  helpful: number;
  createdAt: Date;
}

/**
 * Get template marketplace directory
 */
function getMarketplaceDir(): string {
  const marketplaceDir = path.join(process.cwd(), 'template-marketplace');
  
  if (!fs.existsSync(marketplaceDir)) {
    fs.mkdirSync(marketplaceDir, { recursive: true });
  }
  
  return marketplaceDir;
}

/**
 * Template Submission Management
 */

export async function getSubmissions(status?: TemplateSubmission['status']): Promise<TemplateSubmission[]> {
  const marketplaceDir = getMarketplaceDir();
  const submissionsPath = path.join(marketplaceDir, 'submissions.json');
  
  if (!fs.existsSync(submissionsPath)) {
    return [];
  }
  
  try {
    const content = fs.readFileSync(submissionsPath, 'utf-8');
    const submissions: TemplateSubmission[] = JSON.parse(content);
    
    const filtered = status ? submissions.filter(s => s.status === status) : submissions;
    
    return filtered.map(s => ({
      ...s,
      submittedAt: new Date(s.submittedAt),
      reviewedAt: s.reviewedAt ? new Date(s.reviewedAt) : undefined,
      publishedAt: s.publishedAt ? new Date(s.publishedAt) : undefined,
    }));
  } catch (error) {
    console.error('[Template Marketplace] Failed to load submissions:', error);
    return [];
  }
}

export async function saveSubmission(submission: TemplateSubmission): Promise<void> {
  const marketplaceDir = getMarketplaceDir();
  const submissionsPath = path.join(marketplaceDir, 'submissions.json');
  
  const submissions = await getSubmissions();
  const existingIndex = submissions.findIndex(s => s.id === submission.id);
  
  if (existingIndex >= 0) {
    submissions[existingIndex] = submission;
  } else {
    submissions.push(submission);
  }
  
  fs.writeFileSync(submissionsPath, JSON.stringify(submissions, null, 2), 'utf-8');
  console.log(`[Template Marketplace] Saved submission: ${submission.id}`);
}

export async function reviewSubmission(
  submissionId: string,
  status: 'approved' | 'rejected',
  reviewNotes: string,
  reviewerId: string
): Promise<void> {
  const submissions = await getSubmissions();
  const submission = submissions.find(s => s.id === submissionId);
  
  if (!submission) {
    throw new Error('Submission not found');
  }
  
  submission.status = status;
  submission.reviewNotes = reviewNotes;
  submission.reviewedBy = reviewerId;
  submission.reviewedAt = new Date();
  
  if (status === 'approved') {
    submission.status = 'published';
    submission.publishedAt = new Date();
  }
  
  await saveSubmission(submission);
}

/**
 * Template Reviews Management
 */

export async function getTemplateReviews(templateId: string): Promise<TemplateReview[]> {
  const marketplaceDir = getMarketplaceDir();
  const reviewsPath = path.join(marketplaceDir, 'reviews.json');
  
  if (!fs.existsSync(reviewsPath)) {
    return [];
  }
  
  try {
    const content = fs.readFileSync(reviewsPath, 'utf-8');
    const reviews: TemplateReview[] = JSON.parse(content);
    
    return reviews
      .filter(r => r.templateId === templateId)
      .map(r => ({
        ...r,
        createdAt: new Date(r.createdAt),
      }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error('[Template Marketplace] Failed to load reviews:', error);
    return [];
  }
}

export async function saveReview(review: TemplateReview): Promise<void> {
  const marketplaceDir = getMarketplaceDir();
  const reviewsPath = path.join(marketplaceDir, 'reviews.json');
  
  let reviews: TemplateReview[] = [];
  if (fs.existsSync(reviewsPath)) {
    try {
      const content = fs.readFileSync(reviewsPath, 'utf-8');
      reviews = JSON.parse(content);
    } catch (error) {
      console.error('[Template Marketplace] Failed to load reviews:', error);
    }
  }
  
  const existingIndex = reviews.findIndex(r => r.id === review.id);
  if (existingIndex >= 0) {
    reviews[existingIndex] = review;
  } else {
    reviews.push(review);
  }
  
  fs.writeFileSync(reviewsPath, JSON.stringify(reviews, null, 2), 'utf-8');
  
  // Update template rating
  await updateTemplateRating(review.templateId);
}

/**
 * Update template rating based on reviews
 */
async function updateTemplateRating(templateId: string): Promise<void> {
  const reviews = await getTemplateReviews(templateId);
  
  if (reviews.length === 0) return;
  
  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  
  const submissions = await getSubmissions();
  const submission = submissions.find(s => s.id === templateId || s.template.name === templateId);
  
  if (submission) {
    submission.stats.rating = Math.round(averageRating * 10) / 10; // Round to 1 decimal
    submission.stats.reviews = reviews.length;
    await saveSubmission(submission);
  }
}

/**
 * Get creator dashboard stats
 */
export async function getCreatorStats(creatorId: string): Promise<{
  totalSubmissions: number;
  publishedTemplates: number;
  totalDownloads: number;
  totalRevenue: number;
  averageRating: number;
  pendingSubmissions: number;
}> {
  const submissions = await getSubmissions();
  const creatorSubmissions = submissions.filter(s => s.submitterId === creatorId);
  
  const published = creatorSubmissions.filter(s => s.status === 'published');
  const totalDownloads = published.reduce((sum, s) => sum + s.stats.downloads, 0);
  const totalRevenue = published.reduce((sum, s) => sum + (s.monetization?.price || 0) * s.stats.downloads, 0);
  const averageRating = published.length > 0
    ? published.reduce((sum, s) => sum + s.stats.rating, 0) / published.length
    : 0;
  
  return {
    totalSubmissions: creatorSubmissions.length,
    publishedTemplates: published.length,
    totalDownloads,
    totalRevenue,
    averageRating: Math.round(averageRating * 10) / 10,
    pendingSubmissions: creatorSubmissions.filter(s => s.status === 'pending').length,
  };
}

