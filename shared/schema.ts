import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, jsonb, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User roles enum
export type UserRole = 'administrator' | 'user' | 'technical' | 'designer' | 'marketing' | 'finance' | 'support';

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  role: text("role").notNull().default('user'), // 'administrator' | 'user' | 'technical' | 'designer'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Projects table - Website Builder Projects
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  userId: varchar("user_id").notNull(),
  templateId: varchar("template_id"), // Reference to the base template used
  templateName: text("template_name"), // Name of the template for display
  templatePreview: text("template_preview"), // Thumbnail URL

  // Project content
  html: text("html"), // Current HTML content
  css: text("css"), // Current CSS content

  // Project metadata
  status: text("status").notNull().default('draft'), // 'draft', 'published', 'archived'
  industry: text("industry"), // e.g., 'restaurant', 'healthcare', etc.
  description: text("description"),

  // Business info captured during wizard
  businessInfo: jsonb("business_info").default({}), // Store wizard answers

  isPublic: boolean("is_public").default(false),
  files: jsonb("files").notNull().default({}), // Additional files/assets

  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastEditedAt: timestamp("last_edited_at"),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastEditedAt: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// Deployments table
export const deployments = pgTable("deployments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'static', 'nodejs', 'python', etc.
  status: text("status").notNull().default('building'), // 'building', 'active', 'paused', 'failed'
  url: text("url"),
  buildCommand: text("build_command"),
  startCommand: text("start_command"),
  environmentVars: jsonb("environment_vars").default({}),
  resources: jsonb("resources").default({}),
  config: jsonb("config").default({}),
  lastDeployedAt: timestamp("last_deployed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDeploymentSchema = createInsertSchema(deployments).omit({
  id: true,
  createdAt: true,
  lastDeployedAt: true,
});

export type InsertDeployment = z.infer<typeof insertDeploymentSchema>;
export type Deployment = typeof deployments.$inferSelect;

// Secrets table
export const secrets = pgTable("secrets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  key: text("key").notNull(),
  value: text("value").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSecretSchema = createInsertSchema(secrets).omit({
  id: true,
  createdAt: true,
});

export type InsertSecret = z.infer<typeof insertSecretSchema>;
export type Secret = typeof secrets.$inferSelect;

// Website Builder Sessions table
export const websiteBuilderSessions = pgTable("website_builder_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  
  // Build mode: 'auto' or 'manual'
  buildMode: text("build_mode").notNull().default('manual'), // 'auto' or 'manual'
  
  // Workflow stage
  stage: text("stage").notNull().default('discover'), // 'discover', 'define', 'investigate', 'confirm', 'build', 'review'
  
  // Project Overview
  projectOverview: text("project_overview"),
  expandedBrief: text("expanded_brief"), // AI-refined version
  
  // Business Information
  businessName: text("business_name"),
  businessEmail: text("business_email"),
  businessPhone: text("business_phone"),
  businessAddress: text("business_address"),
  domainStatus: text("domain_status"), // 'have_domain', 'need_domain', 'undecided'
  domainName: text("domain_name"),
  
  // Services (up to 10, ranked by importance)
  services: jsonb("services").default([]), // Array of {name: string, description: string, rank: number}
  
  // Competitors (3-5 URLs)
  competitors: jsonb("competitors").default([]), // Array of {url: string, analysis?: object}
  competitorReport: jsonb("competitor_report").default({}),
  
  // Uploads
  businessPhotos: jsonb("business_photos").default([]), // Array of {url: string, filename: string}
  colorPreferenceImages: jsonb("color_preference_images").default([]), // Array of {url: string, filename: string}
  extractedColorPalette: jsonb("extracted_color_palette").default({}), // {primary, secondary, accent, etc}
  
  // Inspirational Websites (3 URLs)
  inspirationalSites: jsonb("inspirational_sites").default([]), // Array of {url: string, screenshot?: string}
  
  // Location & SEO
  country: text("country"),
  region: text("region"),
  
  // Social Media Links
  socialMedia: jsonb("social_media").default({}), // {facebook, instagram, whatsapp, linkedin, twitter, etc}
  
  // Content & Theme Preferences
  contentMode: text("content_mode").default('ai_generated'), // 'ai_generated' or 'user_provided'
  themeMode: text("theme_mode").default('light'), // 'light' or 'dark'
  
  // Page Structure
  pageNames: jsonb("page_names").default([]), // Array of {name: string, suggested: boolean}
  websiteBlueprint: jsonb("website_blueprint").default({}),
  
  // Scoring & Analytics
  designScore: jsonb("design_score").default({}), // {design: 0-100, seo: 0-100, performance: 0-100, ux: 0-100, conversion: 0-100, total: 0-100}
  
  // Investigation Results
  investigationResults: jsonb("investigation_results").default({}),
  
  // Legacy fields
  requirements: jsonb("requirements").default({}),
  messages: jsonb("messages").default([]),
  currentDraftId: varchar("current_draft_id"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertWebsiteBuilderSessionSchema = createInsertSchema(websiteBuilderSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertWebsiteBuilderSession = z.infer<typeof insertWebsiteBuilderSessionSchema>;
export type WebsiteBuilderSession = typeof websiteBuilderSessions.$inferSelect;

// Website Drafts table
export const websiteDrafts = pgTable("website_drafts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  template: text("template"),
  requirements: jsonb("requirements").notNull().default({}),
  code: jsonb("code").notNull().default({}),
  status: text("status").notNull().default('draft'), // 'draft', 'preview', 'committed'
  version: text("version").notNull().default('1'),
  parentDraftId: varchar("parent_draft_id"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertWebsiteDraftSchema = createInsertSchema(websiteDrafts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertWebsiteDraft = z.infer<typeof insertWebsiteDraftSchema>;
export type WebsiteDraft = typeof websiteDrafts.$inferSelect;

// Permissions table
export const permissions = pgTable("permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(), // e.g., 'view_all_billing', 'manage_invoices'
  category: text("category").notNull(), // e.g., 'billing', 'users', 'websites', 'technical'
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Permission = typeof permissions.$inferSelect;

// Role Permissions junction table
export const rolePermissions = pgTable("role_permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  role: text("role").notNull(), // 'administrator' | 'user' | 'technical' | 'designer'
  permissionId: varchar("permission_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type RolePermission = typeof rolePermissions.$inferSelect;

// Invoices table
export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  amount: text("amount").notNull(), // Store as text to handle decimals precisely
  currency: text("currency").default('USD'),
  status: text("status").notNull().default('pending'), // 'pending', 'paid', 'overdue', 'cancelled'
  dueDate: timestamp("due_date"),
  paidDate: timestamp("paid_date"),
  description: text("description"),
  items: jsonb("items").default([]), // Array of invoice line items
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Invoice = typeof invoices.$inferSelect;

// Usage tracking table
export const usageTracking = pgTable("usage_tracking", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  resource: text("resource").notNull(), // e.g., 'website_generation', 'api_calls', 'storage'
  quantity: text("quantity").notNull(), // Amount used
  unit: text("unit").notNull(), // e.g., 'websites', 'calls', 'gb'
  cost: text("cost").default('0'), // Cost for this usage
  metadata: jsonb("metadata").default({}),
  trackedAt: timestamp("tracked_at").defaultNow(),
});

export type UsageTracking = typeof usageTracking.$inferSelect;

// Template Sources table - Track companies/websites being monitored
export const templateSources = pgTable("template_sources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyName: text("company_name").notNull(),
  websiteUrl: text("website_url").notNull().unique(),
  industry: text("industry").notNull(), // Matches INDUSTRIES list
  country: text("country"), // e.g., "United States" (nullable for existing data)
  state: text("state"), // e.g., "Georgia" (nullable)
  city: text("city"), // e.g., "Atlanta" (nullable)
  currentRanking: text("current_ranking"), // Google ranking position (nullable, can be string like "1-3" or integer)
  lastChecked: timestamp("last_checked"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type TemplateSource = typeof templateSources.$inferSelect;
export type InsertTemplateSource = typeof templateSources.$inferInsert;

// Ranking History table - Track ranking changes over time
export const rankingHistory = pgTable("ranking_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sourceId: varchar("source_id").notNull().references(() => templateSources.id, { onDelete: 'cascade' }),
  ranking: text("ranking").notNull(), // Can be string or number
  checkedAt: timestamp("checked_at").defaultNow(),
  notes: text("notes"), // Optional notes about ranking change
});

export type RankingHistory = typeof rankingHistory.$inferSelect;
export type InsertRankingHistory = typeof rankingHistory.$inferInsert;

// Scraped Content table - Store scraped website content
export const scrapedContent = pgTable("scraped_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sourceId: varchar("source_id").notNull().references(() => templateSources.id, { onDelete: 'cascade' }),
  htmlContent: text("html_content"), // Full HTML
  cssContent: text("css_content"), // Extracted CSS
  images: jsonb("images").default([]), // Array of image URLs/data
  textContent: jsonb("text_content").default({}), // Structured text content (headings, paragraphs, etc.)
  designTokens: jsonb("design_tokens").default({}), // Colors, fonts, spacing, etc.
  scrapedAt: timestamp("scraped_at").defaultNow(),
  version: text("version").default("1"), // For tracking updates
});

export type ScrapedContent = typeof scrapedContent.$inferSelect;
export type InsertScrapedContent = typeof scrapedContent.$inferInsert;

// Brand Templates table (for admin management) - Updated with location, ranking, and design quality
export const brandTemplates = pgTable("brand_templates", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  category: text("category").notNull(), // 'corporate', 'automotive', 'tech', etc.
  industry: text("industry"), // 'Technology', 'E-commerce', etc.
  thumbnail: text("thumbnail"),
  colors: jsonb("colors").notNull(), // {primary, secondary, accent, background, surface, text, textMuted}
  typography: jsonb("typography").notNull(), // {headingFont, bodyFont, headingWeight}
  layout: jsonb("layout").notNull(), // {heroStyle, maxWidth, borderRadius, sections}
  css: text("css").notNull(),
  darkMode: boolean("dark_mode").default(false),
  tags: jsonb("tags").default([]), // Array of strings
  ranking: jsonb("ranking"), // Optional ranking data (legacy)
  // New fields for location and source tracking
  sourceId: varchar("source_id").references(() => templateSources.id, { onDelete: 'set null' }),
  locationCountry: text("location_country"), // e.g., "United States"
  locationState: text("location_state"), // e.g., "Georgia" (nullable)
  locationCity: text("location_city"), // e.g., "Atlanta" (nullable)
  rankingPosition: text("ranking_position"), // Current ranking position (nullable)
  contentData: jsonb("content_data").default({}), // Store scraped content
  // NEW: Design Quality fields
  isDesignQuality: boolean("is_design_quality").default(false), // True if scraped for design quality (not rankings)
  designCategory: text("design_category"), // 'Personal', 'Business', 'Corporate', 'E-commerce', 'Portfolio', etc.
  designScore: text("design_score"), // Optional design quality score (0-100)
  designAwardSource: text("design_award_source"), // 'Awwwards', 'CSS Design Awards', 'FWA', etc.
  // NEW: Template Manager fields
  lastChecked: timestamp("last_checked"), // Last time template was checked for updates
  sourceHash: text("source_hash"), // Hash of source HTML for change detection
  autoUpdate: boolean("auto_update").default(true), // Enable/disable auto-update
  // NEW: Premium/Free Template System
  isPremium: boolean("is_premium").default(false), // True if template requires payment
  price: text("price"), // Optional price (e.g., "9.99", "19.99")
  // Approval system - templates need approval before being active
  isApproved: boolean("is_approved").default(false), // True when admin approves template
  isActive: boolean("is_active").default(true), // True when template is active (must be approved first)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBrandTemplateSchema = createInsertSchema(brandTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBrandTemplate = z.infer<typeof insertBrandTemplateSchema>;
export type BrandTemplate = typeof brandTemplates.$inferSelect;

// Template Pages table - Store multiple pages per template
export const templatePages = pgTable("template_pages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateId: varchar("template_id").notNull().references(() => brandTemplates.id, { onDelete: 'cascade' }),
  url: text("url").notNull(), // Full URL of the page
  path: text("path").notNull(), // Path relative to base URL (e.g., "/about", "/contact")
  htmlContent: text("html_content").notNull(), // Full HTML of this page
  cssContent: text("css_content"), // CSS specific to this page (if any)
  jsContent: text("js_content"), // JavaScript specific to this page (if any)
  images: jsonb("images").default([]), // Images found on this page
  textContent: jsonb("text_content").default({}), // Structured text content
  title: text("title"), // Page title
  isHomePage: boolean("is_home_page").default(false), // True if this is the homepage
  order: integer("order").default(0), // Order for navigation
  scrapedAt: timestamp("scraped_at").defaultNow(),
});

export type TemplatePage = typeof templatePages.$inferSelect;
export type InsertTemplatePage = typeof templatePages.$inferInsert;

// Template Update Logs table
export const templateUpdateLogs = pgTable("template_update_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateId: varchar("template_id").notNull(),
  updateType: text("update_type").notNull(), // 'scrape', 'auto_update', 'manual'
  changesDetected: jsonb("changes_detected").default({}), // What changed
  status: text("status").notNull(), // 'success', 'failed'
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type TemplateUpdateLog = typeof templateUpdateLogs.$inferSelect;

// Website Versions table - Track version history
export const websiteVersions = pgTable("website_versions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  websiteId: varchar("website_id").notNull(), // References website_drafts or projects
  stage: text("stage").notNull(), // 'design', 'content', 'images', 'final'
  snapshot: jsonb("snapshot").notNull(), // Full website snapshot
  version: text("version").notNull().default('1'),
  metadata: jsonb("metadata").default({}), // Additional metadata
  createdAt: timestamp("created_at").defaultNow(),
});

export type WebsiteVersion = typeof websiteVersions.$inferSelect;
export type InsertWebsiteVersion = typeof websiteVersions.$inferInsert;

// Approval Requests table - Track approval workflow
export const approvalRequests = pgTable("approval_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  websiteId: varchar("website_id").notNull(),
  stage: text("stage").notNull(), // 'design', 'content', 'images', 'final'
  status: text("status").notNull().default('pending'), // 'pending', 'approved', 'rejected', 'changes_requested'
  requestedBy: varchar("requested_by").notNull(), // User ID
  reviewedBy: varchar("reviewed_by"), // User ID (if reviewed)
  comments: text("comments"),
  changeRequests: jsonb("change_requests").default([]), // Array of change requests
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type ApprovalRequest = typeof approvalRequests.$inferSelect;
export type InsertApprovalRequest = typeof approvalRequests.$inferInsert;

// Template Health Logs table - Track template quality over time
export const templateHealthLogs = pgTable("template_health_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateId: varchar("template_id").notNull(),
  qualityScore: text("quality_score").notNull(), // 0-100
  checksPassed: jsonb("checks_passed").default({}), // Which checks passed
  issues: jsonb("issues").default([]), // Array of issues found
  status: text("status").notNull(), // 'healthy', 'warning', 'critical'
  checkedAt: timestamp("checked_at").defaultNow(),
});

export type TemplateHealthLog = typeof templateHealthLogs.$inferSelect;
export type InsertTemplateHealthLog = typeof templateHealthLogs.$inferInsert;

// Analytics Events table - Store website visitor tracking events
export const analyticsEvents = pgTable("analytics_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  websiteId: varchar("website_id").notNull(),
  eventType: text("event_type").notNull(), // 'pageview', 'click', 'conversion', 'purchase', 'scroll', 'time_on_page', 'exit_intent'
  path: text("path"), // Page path
  referrer: text("referrer"), // Referrer URL
  userAgent: text("user_agent"), // User agent string
  ip: text("ip"), // IP address (hashed for privacy)
  sessionId: text("session_id"), // Session identifier
  deviceType: text("device_type"), // 'Mobile', 'Tablet', 'Desktop'
  browser: text("browser"), // Browser name
  os: text("os"), // Operating system
  country: text("country"), // Country code (from IP geolocation)
  metadata: jsonb("metadata").default({}), // Additional event data
  timestamp: timestamp("timestamp").defaultNow(),
});

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = typeof analyticsEvents.$inferInsert;

// Email Subscribers table - Store email subscribers for campaigns
export const emailSubscribers = pgTable("email_subscribers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  websiteId: varchar("website_id").notNull(),
  email: text("email").notNull(),
  name: text("name"),
  status: text("status").notNull().default('subscribed'), // 'subscribed', 'unsubscribed', 'bounced', 'complained'
  source: text("source"), // 'form', 'import', 'api', 'manual'
  tags: jsonb("tags").default([]), // Array of tag strings
  metadata: jsonb("metadata").default({}), // Additional subscriber data
  subscribedAt: timestamp("subscribed_at").defaultNow(),
  unsubscribedAt: timestamp("unsubscribed_at"),
  lastEmailSentAt: timestamp("last_email_sent_at"),
  lastEmailOpenedAt: timestamp("last_email_opened_at"),
  lastEmailClickedAt: timestamp("last_email_clicked_at"),
});

export type EmailSubscriber = typeof emailSubscribers.$inferSelect;
export type InsertEmailSubscriber = typeof emailSubscribers.$inferInsert;

// Email Campaigns table - Store email campaigns
export const emailCampaigns = pgTable("email_campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  websiteId: varchar("website_id").notNull(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  htmlContent: text("html_content").notNull(),
  textContent: text("text_content"),
  templateId: varchar("template_id"), // Reference to email template
  status: text("status").notNull().default('draft'), // 'draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled'
  scheduledAt: timestamp("scheduled_at"),
  sentAt: timestamp("sent_at"),
  recipientCount: integer("recipient_count").default(0),
  stats: jsonb("stats").default({
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
    unsubscribed: 0,
  }),
  segments: jsonb("segments").default([]), // Array of segment IDs or filters
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type EmailCampaign = typeof emailCampaigns.$inferSelect;
export type InsertEmailCampaign = typeof emailCampaigns.$inferInsert;

// Email Templates table - Reusable email templates
export const emailTemplates = pgTable("email_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  websiteId: varchar("website_id").notNull(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  htmlContent: text("html_content").notNull(),
  textContent: text("text_content"),
  category: text("category"), // 'welcome', 'newsletter', 'promotional', 'transactional', 'abandoned_cart', etc.
  variables: jsonb("variables").default([]), // Array of variable names that can be replaced
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = typeof emailTemplates.$inferInsert;

// Email Tracking table - Track email opens, clicks, bounces
export const emailTracking = pgTable("email_tracking", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").references(() => emailCampaigns.id, { onDelete: 'cascade' }),
  subscriberId: varchar("subscriber_id").references(() => emailSubscribers.id, { onDelete: 'cascade' }),
  email: text("email").notNull(),
  eventType: text("event_type").notNull(), // 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed', 'complained'
  linkUrl: text("link_url"), // For 'clicked' events
  userAgent: text("user_agent"),
  ip: text("ip"),
  metadata: jsonb("metadata").default({}),
  timestamp: timestamp("timestamp").defaultNow(),
});

export type EmailTracking = typeof emailTracking.$inferSelect;
export type InsertEmailTracking = typeof emailTracking.$inferInsert;

// Blog Posts table - Store blog posts
export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  websiteId: varchar("website_id").notNull(),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  content: text("content").notNull(), // HTML or Markdown content
  excerpt: text("excerpt"), // Short summary
  featuredImage: text("featured_image"), // URL to featured image
  authorId: varchar("author_id").references(() => blogAuthors.id, { onDelete: 'set null' }),
  status: text("status").notNull().default('draft'), // 'draft', 'published', 'scheduled', 'archived'
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  tags: jsonb("tags").default([]), // Array of tag strings
  categories: jsonb("categories").default([]), // Array of category IDs
  seoMetadata: jsonb("seo_metadata").default({}), // SEO title, description, keywords
  readingTime: integer("reading_time"), // Estimated reading time in minutes
  viewCount: integer("view_count").default(0),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

// Blog Categories table
export const blogCategories = pgTable("blog_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  websiteId: varchar("website_id").notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type BlogCategory = typeof blogCategories.$inferSelect;
export type InsertBlogCategory = typeof blogCategories.$inferInsert;

// Blog Tags table
export const blogTags = pgTable("blog_tags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  websiteId: varchar("website_id").notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type BlogTag = typeof blogTags.$inferSelect;
export type InsertBlogTag = typeof blogTags.$inferInsert;

// Blog Comments table
export const blogComments = pgTable("blog_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => blogPosts.id, { onDelete: 'cascade' }),
  authorName: text("author_name").notNull(),
  authorEmail: text("author_email").notNull(),
  content: text("content").notNull(),
  status: text("status").notNull().default('pending'), // 'pending', 'approved', 'spam', 'rejected'
  parentId: varchar("parent_id").references(() => blogComments.id, { onDelete: 'cascade' }), // For nested comments
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type BlogComment = typeof blogComments.$inferSelect;
export type InsertBlogComment = typeof blogComments.$inferInsert;

// Blog Authors table
export const blogAuthors = pgTable("blog_authors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  websiteId: varchar("website_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  bio: text("bio"),
  avatar: text("avatar"), // URL to avatar image
  userId: varchar("user_id").references(() => users.id, { onDelete: 'set null' }), // Link to user account
  createdAt: timestamp("created_at").defaultNow(),
});

export type BlogAuthor = typeof blogAuthors.$inferSelect;
export type InsertBlogAuthor = typeof blogAuthors.$inferInsert;

// Content Types table - Define custom content types
export const contentTypes = pgTable("content_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  websiteId: varchar("website_id").notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  fields: jsonb("fields").notNull(), // Array of field definitions
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type ContentType = typeof contentTypes.$inferSelect;
export type InsertContentType = typeof contentTypes.$inferInsert;

// Content Entries table - Store content entries
export const contentEntries = pgTable("content_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contentTypeId: varchar("content_type_id").notNull().references(() => contentTypes.id, { onDelete: 'cascade' }),
  websiteId: varchar("website_id").notNull(),
  data: jsonb("data").notNull(), // Dynamic content data based on content type fields
  status: text("status").notNull().default('draft'), // 'draft', 'published', 'archived'
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type ContentEntry = typeof contentEntries.$inferSelect;
export type InsertContentEntry = typeof contentEntries.$inferInsert;

// Content Relations table - Store relationships between content entries
export const contentRelations = pgTable("content_relations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entryId: varchar("entry_id").notNull().references(() => contentEntries.id, { onDelete: 'cascade' }),
  relatedEntryId: varchar("related_entry_id").notNull().references(() => contentEntries.id, { onDelete: 'cascade' }),
  relationType: text("relation_type").notNull(), // 'one-to-one', 'one-to-many', 'many-to-many'
  createdAt: timestamp("created_at").defaultNow(),
});

export type ContentRelation = typeof contentRelations.$inferSelect;
export type InsertContentRelation = typeof contentRelations.$inferInsert;

// Content Revisions table - Version history for content entries
export const contentRevisions = pgTable("content_revisions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entryId: varchar("entry_id").notNull().references(() => contentEntries.id, { onDelete: 'cascade' }),
  data: jsonb("data").notNull(), // Snapshot of content data
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: varchar("created_by").references(() => users.id, { onDelete: 'set null' }),
});

export type ContentRevision = typeof contentRevisions.$inferSelect;
export type InsertContentRevision = typeof contentRevisions.$inferInsert;

// Performance Metrics table - Store Core Web Vitals and performance data
export const performanceMetrics = pgTable("performance_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  websiteId: varchar("website_id").notNull(),
  url: text("url").notNull(),
  metricName: text("metric_name").notNull(), // 'lcp', 'fid', 'cls', 'fcp', 'ttfb', 'inp'
  value: numeric("value").notNull(), // Metric value in milliseconds or score
  rating: text("rating").notNull(), // 'good', 'needs-improvement', 'poor'
  deviceType: text("device_type"), // 'desktop', 'mobile', 'tablet'
  browser: text("browser"),
  connectionType: text("connection_type"), // '4g', '3g', 'slow-4g', etc.
  timestamp: timestamp("timestamp").defaultNow(),
  metadata: jsonb("metadata").default({}), // Additional metric data
});

export type PerformanceMetric = typeof performanceMetrics.$inferSelect;
export type InsertPerformanceMetric = typeof performanceMetrics.$inferInsert;

// Performance Reports table - Store Lighthouse and performance reports
export const performanceReports = pgTable("performance_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  websiteId: varchar("website_id").notNull(),
  url: text("url").notNull(),
  scores: jsonb("scores").notNull().default({}), // { performance, accessibility, bestPractices, seo }
  coreWebVitals: jsonb("core_web_vitals").default({}), // { lcp, fid, cls, fcp, ttfb, inp }
  metrics: jsonb("metrics").default([]), // Array of detailed metrics
  timestamp: timestamp("timestamp").defaultNow(),
  lighthouseReport: jsonb("lighthouse_report"), // Full Lighthouse report JSON
});

export type PerformanceReport = typeof performanceReports.$inferSelect;
export type InsertPerformanceReport = typeof performanceReports.$inferInsert;
