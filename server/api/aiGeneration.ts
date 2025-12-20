/**
 * AI Generation API - Leonardo AI for Images, OpenAI for Content
 * 
 * These endpoints power the real-time website transformation:
 * - /api/leonardo/generate - Generate images with Leonardo AI
 * - /api/openai/rewrite-content - Rewrite content with OpenAI
 */

import { Express, Request, Response } from 'express';

// Leonardo AI Configuration
const LEONARDO_API_KEY = process.env.LEONARDO_AI_API_KEY;
const LEONARDO_API_URL = 'https://cloud.leonardo.ai/api/rest/v1';

// OpenAI Configuration  
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1';

export function registerAIGenerationRoutes(app: Express) {
  
  /**
   * Generate image with Leonardo AI
   * POST /api/leonardo/generate
   */
  app.post('/api/leonardo/generate', async (req: Request, res: Response) => {
    try {
      const { prompt, width = 1024, height = 768, num_images = 1 } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }
      
      console.log('[Leonardo AI] Generating image with prompt:', prompt.substring(0, 100) + '...');
      
      // Check if Leonardo API key is configured
      if (!LEONARDO_API_KEY) {
        console.log('[Leonardo AI] API key not configured, using placeholder');
        // Return a relevant placeholder image
        return res.json({
          success: true,
          imageUrl: getPlaceholderImage(prompt),
          message: 'Using placeholder (Leonardo API not configured)',
        });
      }
      
      // Step 1: Create generation
      const createResponse = await fetch(`${LEONARDO_API_URL}/generations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LEONARDO_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          modelId: 'e316348f-7773-490e-adcd-46757c738eb7', // Leonardo Creative model
          width,
          height,
          num_images,
          guidance_scale: 7,
          public: false,
        }),
      });
      
      if (!createResponse.ok) {
        const errorData = await createResponse.text();
        console.error('[Leonardo AI] Creation failed:', errorData);
        throw new Error(`Leonardo API error: ${createResponse.status}`);
      }
      
      const createData = await createResponse.json() as { sdGenerationJob?: { generationId?: string } };
      const generationId = createData.sdGenerationJob?.generationId;
      
      if (!generationId) {
        throw new Error('No generation ID returned');
      }
      
      console.log('[Leonardo AI] Generation started:', generationId);
      
      // Step 2: Poll for completion
      let attempts = 0;
      const maxAttempts = 30;
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const statusResponse = await fetch(`${LEONARDO_API_URL}/generations/${generationId}`, {
          headers: {
            'Authorization': `Bearer ${LEONARDO_API_KEY}`,
          },
        });
        
        if (!statusResponse.ok) {
          throw new Error('Failed to check generation status');
        }
        
        const statusData = await statusResponse.json() as { 
          generations_by_pk?: { 
            status?: string;
            generated_images?: Array<{ url?: string }>;
          } 
        };
        const status = statusData.generations_by_pk?.status;
        
        if (status === 'COMPLETE') {
          const images = statusData.generations_by_pk?.generated_images || [];
          if (images.length > 0 && images[0].url) {
            console.log('[Leonardo AI] ✅ Image generated successfully');
            return res.json({
              success: true,
              imageUrl: images[0].url,
              images: images.map(img => ({ url: img.url })),
            });
          }
        } else if (status === 'FAILED') {
          throw new Error('Image generation failed');
        }
        
        attempts++;
      }
      
      throw new Error('Generation timed out');
      
    } catch (error) {
      console.error('[Leonardo AI] Error:', error);
      
      // Return placeholder on error
      return res.json({
        success: false,
        imageUrl: getPlaceholderImage(req.body.prompt || ''),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
  
  /**
   * Rewrite content with OpenAI
   * POST /api/openai/rewrite-content
   */
  app.post('/api/openai/rewrite-content', async (req: Request, res: Response) => {
    try {
      const { contentType, originalContent, businessName, industry, overview } = req.body;
      
      if (!contentType) {
        return res.status(400).json({ error: 'Content type is required' });
      }
      
      console.log('[OpenAI] Rewriting content:', contentType);
      
      // Check if OpenAI API key is configured
      if (!OPENAI_API_KEY) {
        console.log('[OpenAI] API key not configured, using default content');
        return res.json({
          success: true,
          content: getDefaultContent(contentType, businessName, industry, overview),
          message: 'Using default content (OpenAI API not configured)',
        });
      }
      
      // Generate content with OpenAI
      const systemPrompt = `You are a professional website copywriter. Rewrite the given content to be compelling, professional, and SEO-optimized. 
Keep the same general meaning but make it unique and tailored to the business.
Business: ${businessName}
Industry: ${industry}
Overview: ${overview || 'Not provided'}

Important: Return ONLY the rewritten text, no quotes, no explanations, just the content.`;
      
      const userPrompt = `Rewrite this ${contentType} content for ${businessName} (${industry}):
"${originalContent}"

Keep it concise and professional. For headlines, keep under 10 words. For descriptions, keep under 30 words.`;
      
      const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 150,
          temperature: 0.7,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('[OpenAI] API error:', errorData);
        throw new Error(`OpenAI API error: ${response.status}`);
      }
      
      const data = await response.json() as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = data.choices?.[0]?.message?.content?.trim() || originalContent;
      
      console.log('[OpenAI] ✅ Content rewritten:', content.substring(0, 50) + '...');
      
      return res.json({
        success: true,
        content,
      });
      
    } catch (error) {
      console.error('[OpenAI] Error:', error);
      
      // Return default content on error
      return res.json({
        success: false,
        content: getDefaultContent(
          req.body.contentType,
          req.body.businessName,
          req.body.industry,
          req.body.overview
        ),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
  
  /**
   * Stream content generation with OpenAI (for real-time typing effect)
   * POST /api/openai/stream-content
   */
  app.post('/api/openai/stream-content', async (req: Request, res: Response) => {
    try {
      const { contentType, businessName, industry, overview } = req.body;
      
      if (!OPENAI_API_KEY) {
        const content = getDefaultContent(contentType, businessName, industry, overview);
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        
        // Stream character by character
        for (const char of content) {
          res.write(`data: ${JSON.stringify({ char })}\n\n`);
          await new Promise(r => setTimeout(r, 20));
        }
        res.write('data: [DONE]\n\n');
        return res.end();
      }
      
      // Use OpenAI streaming
      const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a professional copywriter. Generate compelling content for a ${industry} business called ${businessName}.`,
            },
            {
              role: 'user',
              content: `Write a ${contentType} for this business. Be concise and professional.`,
            },
          ],
          stream: true,
          max_tokens: 150,
        }),
      });
      
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      // Pipe the stream
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');
      
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.startsWith('data: '));
        
        for (const line of lines) {
          const data = line.replace('data: ', '');
          if (data === '[DONE]') {
            res.write('data: [DONE]\n\n');
            break;
          }
          
          try {
            const parsed = JSON.parse(data) as {
              choices?: Array<{ delta?: { content?: string } }>;
            };
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
      
      res.end();
      
    } catch (error) {
      console.error('[OpenAI Stream] Error:', error);
      res.status(500).json({ error: 'Stream failed' });
    }
  });
  
  console.log('[AI Generation] Routes registered: /api/leonardo/generate, /api/openai/rewrite-content, /api/openai/stream-content');
}

// Helper: Get placeholder image based on prompt
function getPlaceholderImage(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('hero')) {
    return 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80';
  }
  if (lowerPrompt.includes('team')) {
    return 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80';
  }
  if (lowerPrompt.includes('office')) {
    return 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80';
  }
  if (lowerPrompt.includes('consulting') || lowerPrompt.includes('service')) {
    return 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80';
  }
  if (lowerPrompt.includes('tech') || lowerPrompt.includes('development')) {
    return 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80';
  }
  if (lowerPrompt.includes('growth') || lowerPrompt.includes('chart')) {
    return 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80';
  }
  
  // Default professional image
  return 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80';
}

// Helper: Get default content
function getDefaultContent(
  contentType: string,
  businessName: string = 'Your Business',
  industry: string = 'Professional Services',
  overview: string = ''
): string {
  const defaults: Record<string, string> = {
    'brand': businessName,
    'eyebrow': `Welcome to ${businessName}`,
    'headline': businessName,
    'subheadline': overview || `Professional ${industry} solutions designed to transform your business.`,
    'services-title': 'Our Services',
    'services-subtitle': `Discover how ${businessName} can help you succeed`,
    'service-1-title': 'Expert Consulting',
    'service-1-desc': `Strategic ${industry} guidance from experienced professionals.`,
    'service-2-title': 'Custom Solutions',
    'service-2-desc': `Tailored ${industry} solutions built for your unique needs.`,
    'service-3-title': 'Growth Strategy',
    'service-3-desc': `Accelerate your business with proven ${industry} strategies.`,
    'features-title': `Why Choose ${businessName}`,
    'features-subtitle': 'Excellence in everything we do',
    'cta-title': `Ready to Transform Your Business?`,
    'cta-button': 'Contact Us Today',
    'footer': `© ${new Date().getFullYear()} ${businessName}. All rights reserved.`,
  };
  
  return defaults[contentType] || contentType;
}

