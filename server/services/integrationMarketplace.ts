/**
 * Integration Marketplace Service
 * 
 * 50+ ready-to-use integrations organized by category:
 * - Marketing & Analytics
 * - E-Commerce & Payments
 * - Communication
 * - Productivity
 * - Social Media
 * - CRM & Sales
 * - Customer Support
 * - Development & DevOps
 */

export interface Integration {
  id: string;
  name: string;
  description: string;
  category: IntegrationCategory;
  subcategory: string;
  icon: string;
  website: string;
  documentation?: string;
  pricing: 'free' | 'freemium' | 'paid' | 'enterprise';
  popularity: number; // 1-100
  features: string[];
  setupComplexity: 'easy' | 'medium' | 'complex';
  requiresApiKey: boolean;
  codeSnippet?: string;
  webhookSupport: boolean;
}

export type IntegrationCategory = 
  | 'analytics'
  | 'marketing'
  | 'payments'
  | 'ecommerce'
  | 'communication'
  | 'social'
  | 'crm'
  | 'support'
  | 'productivity'
  | 'development'
  | 'storage'
  | 'ai';

// ==============================================
// ANALYTICS INTEGRATIONS (8)
// ==============================================
const ANALYTICS_INTEGRATIONS: Integration[] = [
  {
    id: 'google-analytics',
    name: 'Google Analytics 4',
    description: 'The industry standard for web analytics. Track user behavior, conversions, and more.',
    category: 'analytics',
    subcategory: 'web-analytics',
    icon: 'google-analytics',
    website: 'https://analytics.google.com',
    documentation: 'https://developers.google.com/analytics',
    pricing: 'free',
    popularity: 98,
    features: ['Page views', 'User behavior', 'Conversions', 'Real-time data', 'Custom events'],
    setupComplexity: 'easy',
    requiresApiKey: true,
    webhookSupport: false,
  },
  {
    id: 'hotjar',
    name: 'Hotjar',
    description: 'Heatmaps, session recordings, and user feedback tools.',
    category: 'analytics',
    subcategory: 'user-behavior',
    icon: 'hotjar',
    website: 'https://hotjar.com',
    pricing: 'freemium',
    popularity: 85,
    features: ['Heatmaps', 'Session recordings', 'Surveys', 'Feedback', 'Funnels'],
    setupComplexity: 'easy',
    requiresApiKey: true,
    webhookSupport: false,
  },
  {
    id: 'mixpanel',
    name: 'Mixpanel',
    description: 'Product analytics for tracking user engagement and retention.',
    category: 'analytics',
    subcategory: 'product-analytics',
    icon: 'mixpanel',
    website: 'https://mixpanel.com',
    pricing: 'freemium',
    popularity: 82,
    features: ['Event tracking', 'User journeys', 'A/B testing', 'Cohort analysis'],
    setupComplexity: 'medium',
    requiresApiKey: true,
    webhookSupport: true,
  },
  {
    id: 'segment',
    name: 'Segment',
    description: 'Customer data platform to collect, unify, and route data.',
    category: 'analytics',
    subcategory: 'cdp',
    icon: 'segment',
    website: 'https://segment.com',
    pricing: 'freemium',
    popularity: 80,
    features: ['Data collection', 'Unified profiles', '300+ integrations', 'Privacy controls'],
    setupComplexity: 'medium',
    requiresApiKey: true,
    webhookSupport: true,
  },
  {
    id: 'plausible',
    name: 'Plausible Analytics',
    description: 'Simple, privacy-friendly alternative to Google Analytics.',
    category: 'analytics',
    subcategory: 'web-analytics',
    icon: 'plausible',
    website: 'https://plausible.io',
    pricing: 'paid',
    popularity: 70,
    features: ['Privacy-first', 'Lightweight', 'No cookies', 'Open source'],
    setupComplexity: 'easy',
    requiresApiKey: true,
    webhookSupport: false,
  },
  {
    id: 'clarity',
    name: 'Microsoft Clarity',
    description: 'Free heatmaps and session recordings from Microsoft.',
    category: 'analytics',
    subcategory: 'user-behavior',
    icon: 'microsoft',
    website: 'https://clarity.microsoft.com',
    pricing: 'free',
    popularity: 75,
    features: ['Heatmaps', 'Session recordings', 'Rage click detection', 'Dead click detection'],
    setupComplexity: 'easy',
    requiresApiKey: true,
    webhookSupport: false,
  },
  {
    id: 'amplitude',
    name: 'Amplitude',
    description: 'Enterprise product analytics with powerful cohort analysis.',
    category: 'analytics',
    subcategory: 'product-analytics',
    icon: 'amplitude',
    website: 'https://amplitude.com',
    pricing: 'freemium',
    popularity: 78,
    features: ['Behavioral analytics', 'User retention', 'Pathfinder', 'Charts'],
    setupComplexity: 'medium',
    requiresApiKey: true,
    webhookSupport: true,
  },
  {
    id: 'posthog',
    name: 'PostHog',
    description: 'Open source product analytics with feature flags and A/B testing.',
    category: 'analytics',
    subcategory: 'product-analytics',
    icon: 'posthog',
    website: 'https://posthog.com',
    pricing: 'freemium',
    popularity: 72,
    features: ['Event analytics', 'Session recording', 'Feature flags', 'Experiments'],
    setupComplexity: 'medium',
    requiresApiKey: true,
    webhookSupport: true,
  },
];

// ==============================================
// MARKETING INTEGRATIONS (8)
// ==============================================
const MARKETING_INTEGRATIONS: Integration[] = [
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Email marketing and automation platform.',
    category: 'marketing',
    subcategory: 'email',
    icon: 'mailchimp',
    website: 'https://mailchimp.com',
    pricing: 'freemium',
    popularity: 95,
    features: ['Email campaigns', 'Automation', 'Landing pages', 'Audience insights'],
    setupComplexity: 'easy',
    requiresApiKey: true,
    webhookSupport: true,
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'All-in-one marketing, sales, and service platform.',
    category: 'marketing',
    subcategory: 'automation',
    icon: 'hubspot',
    website: 'https://hubspot.com',
    pricing: 'freemium',
    popularity: 90,
    features: ['CRM', 'Email marketing', 'Landing pages', 'Analytics', 'Automation'],
    setupComplexity: 'medium',
    requiresApiKey: true,
    webhookSupport: true,
  },
  {
    id: 'convertkit',
    name: 'ConvertKit',
    description: 'Email marketing for creators and bloggers.',
    category: 'marketing',
    subcategory: 'email',
    icon: 'convertkit',
    website: 'https://convertkit.com',
    pricing: 'freemium',
    popularity: 78,
    features: ['Email sequences', 'Landing pages', 'Forms', 'Subscriber tagging'],
    setupComplexity: 'easy',
    requiresApiKey: true,
    webhookSupport: true,
  },
  {
    id: 'klaviyo',
    name: 'Klaviyo',
    description: 'Email and SMS marketing for e-commerce.',
    category: 'marketing',
    subcategory: 'email',
    icon: 'klaviyo',
    website: 'https://klaviyo.com',
    pricing: 'freemium',
    popularity: 85,
    features: ['Email/SMS', 'Segmentation', 'Flows', 'Product recommendations'],
    setupComplexity: 'medium',
    requiresApiKey: true,
    webhookSupport: true,
  },
  {
    id: 'google-ads',
    name: 'Google Ads',
    description: 'Pay-per-click advertising platform.',
    category: 'marketing',
    subcategory: 'advertising',
    icon: 'google',
    website: 'https://ads.google.com',
    pricing: 'paid',
    popularity: 92,
    features: ['Search ads', 'Display ads', 'Video ads', 'Conversion tracking'],
    setupComplexity: 'medium',
    requiresApiKey: true,
    webhookSupport: false,
  },
  {
    id: 'facebook-pixel',
    name: 'Meta Pixel',
    description: 'Track conversions and optimize Facebook/Instagram ads.',
    category: 'marketing',
    subcategory: 'advertising',
    icon: 'facebook',
    website: 'https://business.facebook.com',
    pricing: 'free',
    popularity: 88,
    features: ['Conversion tracking', 'Retargeting', 'Custom audiences', 'Attribution'],
    setupComplexity: 'easy',
    requiresApiKey: true,
    webhookSupport: false,
  },
  {
    id: 'activecampaign',
    name: 'ActiveCampaign',
    description: 'Marketing automation and CRM platform.',
    category: 'marketing',
    subcategory: 'automation',
    icon: 'activecampaign',
    website: 'https://activecampaign.com',
    pricing: 'paid',
    popularity: 80,
    features: ['Email automation', 'CRM', 'Sales automation', 'Messaging'],
    setupComplexity: 'medium',
    requiresApiKey: true,
    webhookSupport: true,
  },
  {
    id: 'sendinblue',
    name: 'Brevo (Sendinblue)',
    description: 'Email, SMS, and chat marketing platform.',
    category: 'marketing',
    subcategory: 'email',
    icon: 'sendinblue',
    website: 'https://brevo.com',
    pricing: 'freemium',
    popularity: 75,
    features: ['Email marketing', 'SMS', 'Chat', 'CRM', 'Transactional email'],
    setupComplexity: 'easy',
    requiresApiKey: true,
    webhookSupport: true,
  },
];

// ==============================================
// PAYMENT INTEGRATIONS (8)
// ==============================================
const PAYMENT_INTEGRATIONS: Integration[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Complete payment infrastructure for the internet.',
    category: 'payments',
    subcategory: 'processing',
    icon: 'stripe',
    website: 'https://stripe.com',
    documentation: 'https://stripe.com/docs',
    pricing: 'paid',
    popularity: 98,
    features: ['Payments', 'Subscriptions', 'Invoicing', 'Connect', 'Radar fraud'],
    setupComplexity: 'easy',
    requiresApiKey: true,
    webhookSupport: true,
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Global payment platform with buyer protection.',
    category: 'payments',
    subcategory: 'processing',
    icon: 'paypal',
    website: 'https://paypal.com',
    pricing: 'paid',
    popularity: 95,
    features: ['Payments', 'PayPal Checkout', 'Subscriptions', 'Pay Later'],
    setupComplexity: 'easy',
    requiresApiKey: true,
    webhookSupport: true,
  },
  {
    id: 'square',
    name: 'Square',
    description: 'Payment processing for businesses of all sizes.',
    category: 'payments',
    subcategory: 'processing',
    icon: 'square',
    website: 'https://squareup.com',
    pricing: 'paid',
    popularity: 85,
    features: ['Online payments', 'In-person payments', 'Invoicing', 'Subscriptions'],
    setupComplexity: 'easy',
    requiresApiKey: true,
    webhookSupport: true,
  },
  {
    id: 'klarna',
    name: 'Klarna',
    description: 'Buy now, pay later payment solutions.',
    category: 'payments',
    subcategory: 'bnpl',
    icon: 'klarna',
    website: 'https://klarna.com',
    pricing: 'paid',
    popularity: 80,
    features: ['Pay in 4', 'Pay in 30 days', 'Financing', 'On-site messaging'],
    setupComplexity: 'medium',
    requiresApiKey: true,
    webhookSupport: true,
  },
  {
    id: 'afterpay',
    name: 'Afterpay',
    description: 'Interest-free installment payments.',
    category: 'payments',
    subcategory: 'bnpl',
    icon: 'afterpay',
    website: 'https://afterpay.com',
    pricing: 'paid',
    popularity: 75,
    features: ['Pay in 4', 'No interest', 'Instant approval'],
    setupComplexity: 'medium',
    requiresApiKey: true,
    webhookSupport: true,
  },
  {
    id: 'apple-pay',
    name: 'Apple Pay',
    description: 'Seamless payments on Apple devices.',
    category: 'payments',
    subcategory: 'wallets',
    icon: 'apple',
    website: 'https://apple.com/apple-pay',
    pricing: 'free',
    popularity: 88,
    features: ['Touch ID/Face ID', 'Secure tokenization', 'Express checkout'],
    setupComplexity: 'medium',
    requiresApiKey: false,
    webhookSupport: false,
  },
  {
    id: 'google-pay',
    name: 'Google Pay',
    description: 'Fast, simple checkout with Google.',
    category: 'payments',
    subcategory: 'wallets',
    icon: 'google',
    website: 'https://pay.google.com',
    pricing: 'free',
    popularity: 85,
    features: ['One-tap checkout', 'Saved cards', 'Loyalty cards'],
    setupComplexity: 'medium',
    requiresApiKey: false,
    webhookSupport: false,
  },
  {
    id: 'braintree',
    name: 'Braintree',
    description: 'PayPal-owned payment gateway with global reach.',
    category: 'payments',
    subcategory: 'processing',
    icon: 'braintree',
    website: 'https://braintreepayments.com',
    pricing: 'paid',
    popularity: 78,
    features: ['Credit cards', 'PayPal', 'Venmo', 'Apple Pay', 'Google Pay'],
    setupComplexity: 'medium',
    requiresApiKey: true,
    webhookSupport: true,
  },
];

// ==============================================
// SOCIAL MEDIA INTEGRATIONS (8)
// ==============================================
const SOCIAL_INTEGRATIONS: Integration[] = [
  {
    id: 'twitter',
    name: 'Twitter/X',
    description: 'Share content and engage with Twitter/X.',
    category: 'social',
    subcategory: 'sharing',
    icon: 'twitter',
    website: 'https://x.com',
    pricing: 'free',
    popularity: 90,
    features: ['Share buttons', 'Embedded tweets', 'Follow buttons', 'Timeline widgets'],
    setupComplexity: 'easy',
    requiresApiKey: false,
    webhookSupport: false,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    description: 'Facebook social plugins and sharing.',
    category: 'social',
    subcategory: 'sharing',
    icon: 'facebook',
    website: 'https://facebook.com',
    pricing: 'free',
    popularity: 92,
    features: ['Share buttons', 'Like buttons', 'Comments', 'Page plugin'],
    setupComplexity: 'easy',
    requiresApiKey: true,
    webhookSupport: false,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Embed Instagram feeds and posts.',
    category: 'social',
    subcategory: 'feeds',
    icon: 'instagram',
    website: 'https://instagram.com',
    pricing: 'free',
    popularity: 88,
    features: ['Feed embed', 'Post embed', 'Hashtag feeds'],
    setupComplexity: 'medium',
    requiresApiKey: true,
    webhookSupport: false,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'LinkedIn sharing and company plugins.',
    category: 'social',
    subcategory: 'sharing',
    icon: 'linkedin',
    website: 'https://linkedin.com',
    pricing: 'free',
    popularity: 82,
    features: ['Share buttons', 'Follow buttons', 'Company profile'],
    setupComplexity: 'easy',
    requiresApiKey: false,
    webhookSupport: false,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    description: 'Embed YouTube videos and channels.',
    category: 'social',
    subcategory: 'video',
    icon: 'youtube',
    website: 'https://youtube.com',
    pricing: 'free',
    popularity: 95,
    features: ['Video embed', 'Channel embed', 'Playlist embed', 'Subscribe button'],
    setupComplexity: 'easy',
    requiresApiKey: false,
    webhookSupport: false,
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    description: 'Embed TikTok videos and profiles.',
    category: 'social',
    subcategory: 'video',
    icon: 'tiktok',
    website: 'https://tiktok.com',
    pricing: 'free',
    popularity: 85,
    features: ['Video embed', 'Follow button', 'Profile widget'],
    setupComplexity: 'easy',
    requiresApiKey: false,
    webhookSupport: false,
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    description: 'Pinterest pins, boards, and save buttons.',
    category: 'social',
    subcategory: 'sharing',
    icon: 'pinterest',
    website: 'https://pinterest.com',
    pricing: 'free',
    popularity: 75,
    features: ['Pin button', 'Board widget', 'Profile widget', 'Rich pins'],
    setupComplexity: 'easy',
    requiresApiKey: false,
    webhookSupport: false,
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Discord widgets and server invites.',
    category: 'social',
    subcategory: 'community',
    icon: 'discord',
    website: 'https://discord.com',
    pricing: 'free',
    popularity: 78,
    features: ['Server widget', 'Chat embed', 'Member count'],
    setupComplexity: 'easy',
    requiresApiKey: true,
    webhookSupport: true,
  },
];

// ==============================================
// CRM & SALES INTEGRATIONS (6)
// ==============================================
const CRM_INTEGRATIONS: Integration[] = [
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Enterprise CRM platform.',
    category: 'crm',
    subcategory: 'enterprise',
    icon: 'salesforce',
    website: 'https://salesforce.com',
    pricing: 'paid',
    popularity: 95,
    features: ['Lead management', 'Opportunity tracking', 'Sales automation', 'Reports'],
    setupComplexity: 'complex',
    requiresApiKey: true,
    webhookSupport: true,
  },
  {
    id: 'pipedrive',
    name: 'Pipedrive',
    description: 'Sales-focused CRM for small teams.',
    category: 'crm',
    subcategory: 'sales',
    icon: 'pipedrive',
    website: 'https://pipedrive.com',
    pricing: 'paid',
    popularity: 82,
    features: ['Pipeline management', 'Activity tracking', 'Email integration', 'Reporting'],
    setupComplexity: 'easy',
    requiresApiKey: true,
    webhookSupport: true,
  },
  {
    id: 'zoho-crm',
    name: 'Zoho CRM',
    description: 'All-in-one CRM with AI assistant.',
    category: 'crm',
    subcategory: 'all-in-one',
    icon: 'zoho',
    website: 'https://zoho.com/crm',
    pricing: 'freemium',
    popularity: 80,
    features: ['Lead/contact management', 'Sales automation', 'AI predictions', 'Workflows'],
    setupComplexity: 'medium',
    requiresApiKey: true,
    webhookSupport: true,
  },
  {
    id: 'freshsales',
    name: 'Freshsales',
    description: 'AI-powered CRM by Freshworks.',
    category: 'crm',
    subcategory: 'sales',
    icon: 'freshworks',
    website: 'https://freshworks.com/crm',
    pricing: 'freemium',
    popularity: 75,
    features: ['Lead scoring', 'Sales sequences', 'AI insights', 'Built-in phone'],
    setupComplexity: 'easy',
    requiresApiKey: true,
    webhookSupport: true,
  },
  {
    id: 'close',
    name: 'Close',
    description: 'CRM built for inside sales teams.',
    category: 'crm',
    subcategory: 'sales',
    icon: 'close',
    website: 'https://close.com',
    pricing: 'paid',
    popularity: 72,
    features: ['Calling', 'Email', 'SMS', 'Pipeline management', 'Reporting'],
    setupComplexity: 'medium',
    requiresApiKey: true,
    webhookSupport: true,
  },
  {
    id: 'monday-crm',
    name: 'monday sales CRM',
    description: 'CRM built on monday.com platform.',
    category: 'crm',
    subcategory: 'all-in-one',
    icon: 'monday',
    website: 'https://monday.com/crm',
    pricing: 'paid',
    popularity: 78,
    features: ['Deal tracking', 'Contact management', 'Automations', 'Dashboards'],
    setupComplexity: 'easy',
    requiresApiKey: true,
    webhookSupport: true,
  },
];

// ==============================================
// CUSTOMER SUPPORT INTEGRATIONS (6)
// ==============================================
const SUPPORT_INTEGRATIONS: Integration[] = [
  {
    id: 'intercom',
    name: 'Intercom',
    description: 'Customer messaging platform with live chat and bots.',
    category: 'support',
    subcategory: 'messaging',
    icon: 'intercom',
    website: 'https://intercom.com',
    pricing: 'paid',
    popularity: 90,
    features: ['Live chat', 'Bots', 'Help center', 'Product tours', 'Inbox'],
    setupComplexity: 'easy',
    requiresApiKey: true,
    webhookSupport: true,
  },
  {
    id: 'zendesk',
    name: 'Zendesk',
    description: 'Enterprise customer service software.',
    category: 'support',
    subcategory: 'helpdesk',
    icon: 'zendesk',
    website: 'https://zendesk.com',
    pricing: 'paid',
    popularity: 88,
    features: ['Ticketing', 'Live chat', 'Knowledge base', 'Analytics'],
    setupComplexity: 'medium',
    requiresApiKey: true,
    webhookSupport: true,
  },
  {
    id: 'crisp',
    name: 'Crisp',
    description: 'All-in-one messaging platform.',
    category: 'support',
    subcategory: 'messaging',
    icon: 'crisp',
    website: 'https://crisp.chat',
    pricing: 'freemium',
    popularity: 78,
    features: ['Live chat', 'Chatbot', 'Shared inbox', 'Knowledge base'],
    setupComplexity: 'easy',
    requiresApiKey: true,
    webhookSupport: true,
  },
  {
    id: 'freshdesk',
    name: 'Freshdesk',
    description: 'Customer support software by Freshworks.',
    category: 'support',
    subcategory: 'helpdesk',
    icon: 'freshworks',
    website: 'https://freshdesk.com',
    pricing: 'freemium',
    popularity: 82,
    features: ['Ticketing', 'Self-service', 'Automations', 'Reporting'],
    setupComplexity: 'easy',
    requiresApiKey: true,
    webhookSupport: true,
  },
  {
    id: 'tawk',
    name: 'tawk.to',
    description: 'Free live chat software.',
    category: 'support',
    subcategory: 'messaging',
    icon: 'tawk',
    website: 'https://tawk.to',
    pricing: 'free',
    popularity: 80,
    features: ['Live chat', 'Ticketing', 'Knowledge base', 'Mobile apps'],
    setupComplexity: 'easy',
    requiresApiKey: true,
    webhookSupport: true,
  },
  {
    id: 'helpscout',
    name: 'Help Scout',
    description: 'Customer service platform for growing businesses.',
    category: 'support',
    subcategory: 'helpdesk',
    icon: 'helpscout',
    website: 'https://helpscout.com',
    pricing: 'paid',
    popularity: 75,
    features: ['Shared inbox', 'Knowledge base', 'Beacon chat', 'Reports'],
    setupComplexity: 'easy',
    requiresApiKey: true,
    webhookSupport: true,
  },
];

// ==============================================
// AI INTEGRATIONS (6)
// ==============================================
const AI_INTEGRATIONS: Integration[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4, DALL-E, and other AI models.',
    category: 'ai',
    subcategory: 'language',
    icon: 'openai',
    website: 'https://openai.com',
    documentation: 'https://platform.openai.com/docs',
    pricing: 'paid',
    popularity: 98,
    features: ['GPT-4', 'DALL-E', 'Whisper', 'Embeddings', 'Fine-tuning'],
    setupComplexity: 'easy',
    requiresApiKey: true,
    webhookSupport: false,
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    description: 'Safe, helpful AI assistant.',
    category: 'ai',
    subcategory: 'language',
    icon: 'anthropic',
    website: 'https://anthropic.com',
    pricing: 'paid',
    popularity: 85,
    features: ['Claude 3', 'Long context', 'Safety focus', 'Vision'],
    setupComplexity: 'easy',
    requiresApiKey: true,
    webhookSupport: false,
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Google\'s multimodal AI model.',
    category: 'ai',
    subcategory: 'language',
    icon: 'google',
    website: 'https://ai.google.dev',
    pricing: 'freemium',
    popularity: 82,
    features: ['Text generation', 'Vision', 'Code', 'Multimodal'],
    setupComplexity: 'easy',
    requiresApiKey: true,
    webhookSupport: false,
  },
  {
    id: 'replicate',
    name: 'Replicate',
    description: 'Run ML models in the cloud.',
    category: 'ai',
    subcategory: 'ml-platform',
    icon: 'replicate',
    website: 'https://replicate.com',
    pricing: 'paid',
    popularity: 75,
    features: ['1000+ models', 'Image generation', 'Video', 'Audio'],
    setupComplexity: 'medium',
    requiresApiKey: true,
    webhookSupport: true,
  },
  {
    id: 'stability',
    name: 'Stability AI',
    description: 'Stable Diffusion and other image models.',
    category: 'ai',
    subcategory: 'image',
    icon: 'stability',
    website: 'https://stability.ai',
    pricing: 'paid',
    popularity: 80,
    features: ['Stable Diffusion', 'Image generation', 'Upscaling', 'Inpainting'],
    setupComplexity: 'medium',
    requiresApiKey: true,
    webhookSupport: false,
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    description: 'AI voice synthesis and cloning.',
    category: 'ai',
    subcategory: 'voice',
    icon: 'elevenlabs',
    website: 'https://elevenlabs.io',
    pricing: 'freemium',
    popularity: 78,
    features: ['Text to speech', 'Voice cloning', 'Multiple languages', 'API'],
    setupComplexity: 'easy',
    requiresApiKey: true,
    webhookSupport: false,
  },
];

// ==============================================
// COMBINE ALL INTEGRATIONS
// ==============================================
export const INTEGRATION_MARKETPLACE: Integration[] = [
  ...ANALYTICS_INTEGRATIONS,
  ...MARKETING_INTEGRATIONS,
  ...PAYMENT_INTEGRATIONS,
  ...SOCIAL_INTEGRATIONS,
  ...CRM_INTEGRATIONS,
  ...SUPPORT_INTEGRATIONS,
  ...AI_INTEGRATIONS,
];

// ==============================================
// HELPER FUNCTIONS
// ==============================================

/**
 * Get all integrations
 */
export function getAllIntegrations(): Integration[] {
  return INTEGRATION_MARKETPLACE;
}

/**
 * Get integrations by category
 */
export function getIntegrationsByCategory(category: IntegrationCategory): Integration[] {
  return INTEGRATION_MARKETPLACE.filter(i => i.category === category);
}

/**
 * Get integration by ID
 */
export function getIntegrationById(id: string): Integration | undefined {
  return INTEGRATION_MARKETPLACE.find(i => i.id === id);
}

/**
 * Get popular integrations
 */
export function getPopularIntegrations(limit: number = 10): Integration[] {
  return [...INTEGRATION_MARKETPLACE]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit);
}

/**
 * Search integrations
 */
export function searchIntegrations(query: string): Integration[] {
  const lowerQuery = query.toLowerCase();
  return INTEGRATION_MARKETPLACE.filter(i =>
    i.name.toLowerCase().includes(lowerQuery) ||
    i.description.toLowerCase().includes(lowerQuery) ||
    i.category.toLowerCase().includes(lowerQuery) ||
    i.features.some(f => f.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get all categories
 */
export function getCategories(): { category: IntegrationCategory; count: number }[] {
  const counts: Record<string, number> = {};
  INTEGRATION_MARKETPLACE.forEach(i => {
    counts[i.category] = (counts[i.category] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([category, count]) => ({ category: category as IntegrationCategory, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get integration statistics
 */
export function getIntegrationStats(): {
  total: number;
  byCategory: Record<IntegrationCategory, number>;
  byPricing: Record<string, number>;
  freeCount: number;
} {
  const byCategory: Record<string, number> = {};
  const byPricing: Record<string, number> = {};
  let freeCount = 0;

  INTEGRATION_MARKETPLACE.forEach(i => {
    byCategory[i.category] = (byCategory[i.category] || 0) + 1;
    byPricing[i.pricing] = (byPricing[i.pricing] || 0) + 1;
    if (i.pricing === 'free' || i.pricing === 'freemium') {
      freeCount++;
    }
  });

  return {
    total: INTEGRATION_MARKETPLACE.length,
    byCategory: byCategory as Record<IntegrationCategory, number>,
    byPricing,
    freeCount,
  };
}

// Log stats on load
const stats = getIntegrationStats();
console.log(`[Integration Marketplace] 🔌 Loaded ${stats.total} integrations (${stats.freeCount} free/freemium)`);

