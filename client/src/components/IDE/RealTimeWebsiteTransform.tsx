/**
 * Real-Time Website Transform - The World's Best Website Builder
 * 
 * Shows the actual scraped template full-screen, then:
 * 1. Real-time image regeneration with Leonardo AI (old fades, new streams in)
 * 2. Real-time content rewriting with OpenAI (word-by-word animation)
 * 
 * The scraped templates are ALREADY PERFECT - ranked high for a reason.
 * We just transform them with client's info while keeping the perfect design.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Image as ImageIcon,
  FileText,
  Maximize2,
  Minimize2,
  Eye,
  Check,
  Loader2,
  ChevronLeft,
  AlertCircle,
} from 'lucide-react';
import type { BrandTemplate } from '@/types/templates';
import type { WebsiteRequirements } from '@/types/websiteBuilder';

interface RealTimeWebsiteTransformProps {
  selectedTemplate: BrandTemplate;
  requirements: WebsiteRequirements;
  onComplete: (transformedHtml: string) => void;
  onBack?: () => void;
}

type TransformPhase = 'preview' | 'images' | 'content' | 'complete';

interface TransformProgress {
  phase: TransformPhase;
  currentItem: number;
  totalItems: number;
  message: string;
}

// Get the base template HTML - ALWAYS loads EXACT scraped HTML from backend
async function getTemplateHtml(template: BrandTemplate, requirements: WebsiteRequirements): Promise<string> {
  // CRITICAL: Always fetch EXACT scraped HTML from backend API
  try {
    console.log('[RealTimeTransform] Fetching EXACT scraped template HTML from backend:', template.id);
    
    // Try to get template from scraper API
    const response = await fetch(`/api/admin/scraper/templates/${template.id}`);
    if (response.ok) {
      const data = await response.json();
      if (data.template?.contentData?.html) {
        console.log('[RealTimeTransform] ✅ Loaded EXACT scraped HTML from backend');
        return data.template.contentData.html;
      }
      if (data.template?.html) {
        console.log('[RealTimeTransform] ✅ Loaded HTML from backend (top level)');
        return data.template.html;
      }
    }
  } catch (error) {
    console.warn('[RealTimeTransform] Failed to fetch from backend, trying local contentData:', error);
  }

  // Fallback: Check if we have HTML in the template object (from frontend state)
  if (template.contentData && typeof template.contentData === 'object') {
    const contentData = template.contentData as any;
    if (contentData.html) {
      console.log('[RealTimeTransform] Using HTML from template object:', template.name);
      return contentData.html;
    }
    if (contentData.htmlContent) {
      console.log('[RealTimeTransform] Using htmlContent from template object:', template.name);
      return contentData.htmlContent;
    }
  }
  
  // LAST RESORT: Generate placeholder (should never happen if templates are properly scraped)
  console.error('[RealTimeTransform] ⚠️ NO TEMPLATE HTML FOUND - This should not happen! Template:', template.id);
  
  // Create a minimal placeholder
  const colors = template.colors || {
    primary: '#0071e3',
    secondary: '#1d1d1f',
    accent: '#0077ed',
    background: '#ffffff',
    text: '#1d1d1f',
    textMuted: '#86868b',
  };
  
  const typography = template.typography || {
    headingFont: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif',
    bodyFont: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
    headingWeight: '600',
  };
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${requirements.businessName || template.brand} - ${requirements.industry || 'Professional Services'}</title>
  <style>
    :root {
      --primary: ${colors.primary};
      --secondary: ${colors.secondary};
      --accent: ${colors.accent};
      --background: ${colors.background};
      --text: ${colors.text};
      --text-muted: ${colors.textMuted};
      --heading-font: ${typography.headingFont};
      --body-font: ${typography.bodyFont};
    }
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: var(--body-font);
      color: var(--text);
      background: var(--background);
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }
    
    /* Navigation */
    .nav {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 48px;
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: saturate(180%) blur(20px);
      -webkit-backdrop-filter: saturate(180%) blur(20px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      border-bottom: 1px solid rgba(0,0,0,0.1);
    }
    
    .nav-container {
      max-width: 980px;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 22px;
    }
    
    .nav-logo {
      font-family: var(--heading-font);
      font-size: 21px;
      font-weight: 600;
      color: var(--text);
      text-decoration: none;
    }
    
    .nav-links {
      display: flex;
      gap: 32px;
      list-style: none;
    }
    
    .nav-links a {
      color: var(--text);
      text-decoration: none;
      font-size: 14px;
      font-weight: 400;
      transition: opacity 0.2s;
    }
    
    .nav-links a:hover {
      opacity: 0.7;
    }
    
    .nav-cta {
      background: var(--primary);
      color: white;
      padding: 8px 16px;
      border-radius: 980px;
      font-size: 14px;
      font-weight: 400;
      text-decoration: none;
      transition: all 0.2s;
    }
    
    .nav-cta:hover {
      background: var(--accent);
    }
    
    /* Hero Section */
    .hero {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 100px 24px 60px;
      background: linear-gradient(180deg, #fbfbfd 0%, #ffffff 100%);
    }
    
    .hero-eyebrow {
      color: var(--primary);
      font-size: 17px;
      font-weight: 400;
      margin-bottom: 8px;
    }
    
    .hero-title {
      font-family: var(--heading-font);
      font-size: clamp(40px, 8vw, 80px);
      font-weight: 600;
      line-height: 1.05;
      letter-spacing: -0.015em;
      color: var(--text);
      margin-bottom: 16px;
      max-width: 900px;
    }
    
    .hero-subtitle {
      font-size: clamp(17px, 3vw, 28px);
      font-weight: 400;
      color: var(--text-muted);
      margin-bottom: 32px;
      max-width: 600px;
    }
    
    .hero-cta {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      justify-content: center;
    }
    
    .hero-cta a {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      font-size: 17px;
      font-weight: 400;
      border-radius: 980px;
      text-decoration: none;
      transition: all 0.3s;
    }
    
    .btn-primary {
      background: var(--primary);
      color: white;
    }
    
    .btn-primary:hover {
      background: var(--accent);
    }
    
    .btn-secondary {
      color: var(--primary);
    }
    
    .btn-secondary:hover {
      text-decoration: underline;
    }
    
    .hero-image {
      margin-top: 48px;
      max-width: 100%;
      width: 1000px;
      border-radius: 24px;
      box-shadow: 0 20px 80px rgba(0,0,0,0.15);
      transition: opacity 0.5s ease-out;
    }
    
    .hero-image.fading {
      opacity: 0.3;
    }
    
    /* Services Section */
    .services {
      padding: 100px 24px;
      background: var(--background);
    }
    
    .section-header {
      text-align: center;
      margin-bottom: 60px;
    }
    
    .section-title {
      font-family: var(--heading-font);
      font-size: clamp(32px, 5vw, 48px);
      font-weight: 600;
      color: var(--text);
      margin-bottom: 16px;
    }
    
    .section-subtitle {
      font-size: 19px;
      color: var(--text-muted);
      max-width: 600px;
      margin: 0 auto;
    }
    
    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 32px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .service-card {
      background: #fbfbfd;
      border-radius: 24px;
      padding: 40px;
      text-align: center;
      transition: transform 0.3s, box-shadow 0.3s;
    }
    
    .service-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(0,0,0,0.1);
    }
    
    .service-icon {
      width: 80px;
      height: 80px;
      border-radius: 20px;
      margin: 0 auto 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
      transition: opacity 0.5s ease-out;
    }
    
    .service-icon.fading {
      opacity: 0.3;
    }
    
    .service-title {
      font-family: var(--heading-font);
      font-size: 24px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 12px;
    }
    
    .service-desc {
      font-size: 16px;
      color: var(--text-muted);
      line-height: 1.6;
    }
    
    /* Features Section */
    .features {
      padding: 100px 24px;
      background: linear-gradient(180deg, #000000 0%, #1d1d1f 100%);
      color: white;
    }
    
    .features .section-title {
      color: white;
    }
    
    .features .section-subtitle {
      color: rgba(255,255,255,0.7);
    }
    
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 40px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .feature-item {
      text-align: center;
    }
    
    .feature-number {
      font-size: 56px;
      font-weight: 600;
      background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 16px;
    }
    
    .feature-label {
      font-size: 17px;
      color: rgba(255,255,255,0.7);
    }
    
    /* CTA Section */
    .cta-section {
      padding: 120px 24px;
      text-align: center;
      background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
      color: white;
    }
    
    .cta-title {
      font-family: var(--heading-font);
      font-size: clamp(32px, 5vw, 56px);
      font-weight: 600;
      margin-bottom: 24px;
    }
    
    .cta-button {
      display: inline-block;
      background: white;
      color: var(--primary);
      padding: 16px 32px;
      border-radius: 980px;
      font-size: 17px;
      font-weight: 500;
      text-decoration: none;
      transition: transform 0.3s;
    }
    
    .cta-button:hover {
      transform: scale(1.05);
    }
    
    /* Footer */
    footer {
      padding: 60px 24px;
      background: #f5f5f7;
      text-align: center;
    }
    
    .footer-text {
      color: var(--text-muted);
      font-size: 14px;
    }
    
    /* Animation classes for transformation */
    .transforming {
      position: relative;
    }
    
    .transforming::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(90deg, transparent, rgba(0,113,227,0.1), transparent);
      animation: shimmer 2s infinite;
    }
    
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    
    .text-streaming {
      border-right: 2px solid var(--primary);
      animation: blink 0.7s infinite;
    }
    
    @keyframes blink {
      0%, 50% { border-color: var(--primary); }
      51%, 100% { border-color: transparent; }
    }
  </style>
</head>
<body>
  <!-- Navigation -->
  <nav class="nav">
    <div class="nav-container">
      <a href="#" class="nav-logo" data-content="brand">${template.brand}</a>
      <ul class="nav-links">
        <li><a href="#services">Services</a></li>
        <li><a href="#features">Features</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
      <a href="#contact" class="nav-cta">Get Started</a>
    </div>
  </nav>
  
  <!-- Hero Section -->
  <section class="hero" id="home">
    <p class="hero-eyebrow" data-content="eyebrow">Introducing</p>
    <h1 class="hero-title" data-content="headline">${template.brand}</h1>
    <p class="hero-subtitle" data-content="subheadline">Professional solutions designed to transform your business and drive exceptional results.</p>
    <div class="hero-cta">
      <a href="#contact" class="btn-primary">Learn More →</a>
      <a href="#services" class="btn-secondary">Watch the film →</a>
    </div>
    <img 
      src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1000&q=80" 
      alt="Hero Image" 
      class="hero-image"
      data-image="hero"
    />
  </section>
  
  <!-- Services Section -->
  <section class="services" id="services">
    <div class="section-header">
      <h2 class="section-title" data-content="services-title">Our Services</h2>
      <p class="section-subtitle" data-content="services-subtitle">Discover how we can help you achieve your goals</p>
    </div>
    <div class="services-grid">
      <div class="service-card">
        <div class="service-icon" data-image="service-1">💼</div>
        <h3 class="service-title" data-content="service-1-title">Consulting</h3>
        <p class="service-desc" data-content="service-1-desc">Expert guidance to help you navigate complex business challenges and find effective solutions.</p>
      </div>
      <div class="service-card">
        <div class="service-icon" data-image="service-2">🚀</div>
        <h3 class="service-title" data-content="service-2-title">Development</h3>
        <p class="service-desc" data-content="service-2-desc">Custom solutions built with cutting-edge technology to meet your specific needs.</p>
      </div>
      <div class="service-card">
        <div class="service-icon" data-image="service-3">📈</div>
        <h3 class="service-title" data-content="service-3-title">Growth</h3>
        <p class="service-desc" data-content="service-3-desc">Strategic approaches to accelerate your growth and maximize your potential.</p>
      </div>
    </div>
  </section>
  
  <!-- Features Section -->
  <section class="features" id="features">
    <div class="section-header">
      <h2 class="section-title" data-content="features-title">Why Choose Us</h2>
      <p class="section-subtitle" data-content="features-subtitle">Numbers that speak for themselves</p>
    </div>
    <div class="features-grid">
      <div class="feature-item">
        <div class="feature-number">500+</div>
        <div class="feature-label" data-content="feature-1">Projects Completed</div>
      </div>
      <div class="feature-item">
        <div class="feature-number">99%</div>
        <div class="feature-label" data-content="feature-2">Client Satisfaction</div>
      </div>
      <div class="feature-item">
        <div class="feature-number">24/7</div>
        <div class="feature-label" data-content="feature-3">Support Available</div>
      </div>
      <div class="feature-item">
        <div class="feature-number">10+</div>
        <div class="feature-label" data-content="feature-4">Years Experience</div>
      </div>
    </div>
  </section>
  
  <!-- CTA Section -->
  <section class="cta-section" id="contact">
    <h2 class="cta-title" data-content="cta-title">Ready to Get Started?</h2>
      <a href="tel:${requirements.businessPhone || ''}" class="cta-button" data-content="cta-button">Contact Us Today</a>
  </section>
  
  <!-- Footer -->
  <footer>
    <p class="footer-text" data-content="footer">© ${new Date().getFullYear()} ${template.brand}. All rights reserved.</p>
  </footer>
</body>
</html>
  `.trim();
}

export function RealTimeWebsiteTransform({
  selectedTemplate,
  requirements,
  onComplete,
  onBack,
}: RealTimeWebsiteTransformProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [phase, setPhase] = useState<TransformPhase>('preview');
  const [progress, setProgress] = useState<TransformProgress>({
    phase: 'preview',
    currentItem: 0,
    totalItems: 0,
    message: 'Your selected template is ready',
  });
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformedHtml, setTransformedHtml] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  // Initialize the template - Loads EXACT scraped HTML from backend
  useEffect(() => {
    let cancelled = false;
    
    const loadTemplate = async () => {
      console.log('[RealTimeTransform] Loading EXACT scraped template from backend:', {
        id: selectedTemplate.id,
        name: selectedTemplate.name,
        brand: selectedTemplate.brand,
      });
      
      try {
        // CRITICAL: Load EXACT scraped HTML from backend
        const html = await getTemplateHtml(selectedTemplate, requirements);
        
        if (cancelled) return;
        
        console.log('[RealTimeTransform] ✅ Loaded template HTML length:', html.length);
        setTransformedHtml(html);
        
        // Update iframe content
        if (iframeRef.current) {
          const doc = iframeRef.current.contentDocument;
          if (doc) {
            doc.open();
            doc.write(html);
            doc.close();
            console.log('[RealTimeTransform] ✅ Iframe content updated with EXACT scraped template');
          }
        }
      } catch (error) {
        console.error('[RealTimeTransform] Failed to load template:', error);
        setError(error instanceof Error ? error.message : 'Failed to load template');
      }
    };
    
    loadTemplate();
    
    return () => {
      cancelled = true;
    };
  }, [selectedTemplate, requirements]);
  
  // Regenerate images with Leonardo AI
  const regenerateImages = async () => {
    setIsTransforming(true);
    setPhase('images');
    setError(null);
    
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    
    // Find all images to transform
    const images = doc.querySelectorAll('[data-image]');
    const totalImages = images.length;
    
    setProgress({
      phase: 'images',
      currentItem: 0,
      totalItems: totalImages,
      message: 'Preparing to regenerate images...',
    });
    
    for (let i = 0; i < images.length; i++) {
      const img = images[i] as HTMLElement;
      const imageType = img.dataset.image;
      
      setProgress({
        phase: 'images',
        currentItem: i + 1,
        totalItems: totalImages,
        message: `Regenerating ${imageType} image... (${i + 1}/${totalImages})`,
      });
      
      // Add fading class
      img.classList.add('fading');
      
      // Call Leonardo AI to generate new image
      try {
        const prompt = getImagePrompt(imageType || 'hero', requirements);
        const newImageUrl = await generateImageWithLeonardo(prompt);
        
        // Wait for fade effect
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Update the image
        if (img.tagName === 'IMG') {
          (img as HTMLImageElement).src = newImageUrl;
        } else {
          // For div icons, we might want to set background
          img.style.backgroundImage = `url(${newImageUrl})`;
          img.style.backgroundSize = 'cover';
          img.textContent = ''; // Remove emoji
        }
        
        img.classList.remove('fading');
        
      } catch (err) {
        console.error('Image generation failed:', err);
        // Continue with placeholder
        img.classList.remove('fading');
      }
      
      // Small delay between images for visual effect
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    setProgress({
      phase: 'images',
      currentItem: totalImages,
      totalItems: totalImages,
      message: 'All images regenerated!',
    });
    
    setIsTransforming(false);
  };
  
  // Regenerate content with OpenAI
  const regenerateContent = async () => {
    setIsTransforming(true);
    setPhase('content');
    setError(null);
    
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    
    // Find all content elements to transform
    const contentElements = doc.querySelectorAll('[data-content]');
    const totalContent = contentElements.length;
    
    setProgress({
      phase: 'content',
      currentItem: 0,
      totalItems: totalContent,
      message: 'Preparing to rewrite content...',
    });
    
    for (let i = 0; i < contentElements.length; i++) {
      const element = contentElements[i] as HTMLElement;
      const contentType = element.dataset.content;
      
      setProgress({
        phase: 'content',
        currentItem: i + 1,
        totalItems: totalContent,
        message: `Rewriting ${contentType}... (${i + 1}/${totalContent})`,
      });
      
      // Add transforming class
      element.classList.add('transforming');
      
      try {
        const newContent = await generateContentWithAI(contentType || '', requirements, selectedTemplate);
        
        // Animate text change
        await animateTextChange(element, newContent);
        
      } catch (err) {
        console.error('Content generation failed:', err);
      }
      
      element.classList.remove('transforming');
      
      // Small delay between elements
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    setProgress({
      phase: 'content',
      currentItem: totalContent,
      totalItems: totalContent,
      message: 'All content rewritten!',
    });
    
    // Save the transformed HTML
    if (doc.documentElement) {
      setTransformedHtml(doc.documentElement.outerHTML);
    }
    
    setIsTransforming(false);
    setPhase('complete');
  };
  
  // Animate text change with typing effect
  const animateTextChange = async (element: HTMLElement, newContent: string): Promise<void> => {
    return new Promise(async (resolve) => {
      const _originalText = element.textContent || '';
      
      // Fade out old text
      element.style.transition = 'opacity 0.3s';
      element.style.opacity = '0.3';
      
      await new Promise(r => setTimeout(r, 300));
      
      // Clear and start typing new text
      element.textContent = '';
      element.classList.add('text-streaming');
      element.style.opacity = '1';
      
      // Type character by character
      for (let i = 0; i < newContent.length; i++) {
        element.textContent += newContent[i];
        await new Promise(r => setTimeout(r, 15)); // Typing speed
      }
      
      element.classList.remove('text-streaming');
      resolve();
    });
  };
  
  // Complete transformation
  const completeTransformation = () => {
    onComplete(transformedHtml);
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Control Bar */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/50">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          )}
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              <Eye className="w-3 h-3 mr-1" />
              Live Preview
            </Badge>
            
            {phase !== 'preview' && (
              <Badge variant="outline" className={
                phase === 'complete' 
                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                  : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
              }>
                {phase === 'images' && <ImageIcon className="w-3 h-3 mr-1" />}
                {phase === 'content' && <FileText className="w-3 h-3 mr-1" />}
                {phase === 'complete' && <Check className="w-3 h-3 mr-1" />}
                {phase === 'images' && 'Regenerating Images'}
                {phase === 'content' && 'Rewriting Content'}
                {phase === 'complete' && 'Transformation Complete'}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Transform Buttons */}
          <Button
            onClick={regenerateImages}
            disabled={isTransforming}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isTransforming && phase === 'images' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ImageIcon className="w-4 h-4 mr-2" />
            )}
            Regenerate Images
          </Button>
          
          <Button
            onClick={regenerateContent}
            disabled={isTransforming}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            {isTransforming && phase === 'content' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <FileText className="w-4 h-4 mr-2" />
            )}
            Regenerate Content
          </Button>
          
          {phase === 'complete' && (
            <Button
              onClick={completeTransformation}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <Check className="w-4 h-4 mr-2" />
              Approve & Continue
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      
      {/* Progress Bar */}
      {isTransforming && (
        <div className="p-4 bg-slate-800/50 border-b border-white/10">
          <div className="flex items-center gap-4 mb-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
            <span className="text-sm text-white">{progress.message}</span>
          </div>
          <Progress 
            value={(progress.currentItem / Math.max(progress.totalItems, 1)) * 100} 
            className="h-2"
          />
        </div>
      )}
      
      {/* Website Preview - Full Screen */}
      <div className={`flex-1 ${isFullscreen ? 'absolute inset-0 z-50 top-[140px]' : ''}`}>
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0 bg-white"
          title="Website Preview"
          sandbox="allow-same-origin allow-scripts"
        />
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-500/20 border-t border-red-500/30">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper: Generate image prompt based on type
function getImagePrompt(imageType: string, requirements: WebsiteRequirements): string {
  const business = requirements.businessName || 'business';
  const industry = requirements.industry || 'professional services';
  
  const prompts: Record<string, string> = {
    'hero': `Professional hero image for ${industry} company called ${business}, modern minimalist design, high quality, corporate, clean background, 4k`,
    'service-1': `Professional icon for consulting service, modern flat design, ${industry} theme, clean simple`,
    'service-2': `Professional icon for development service, modern flat design, technology theme, clean simple`,
    'service-3': `Professional icon for growth service, modern flat design, business growth theme, clean simple`,
    'team': `Professional team photo, diverse business team, modern office, ${industry}`,
    'about': `Professional office interior, modern workspace, ${industry} company`,
  };
  
  return prompts[imageType] || `Professional ${imageType} image for ${industry} business, modern design, high quality`;
}

// Helper: Generate image with Leonardo AI
async function generateImageWithLeonardo(prompt: string): Promise<string> {
  try {
    const response = await fetch('/api/leonardo/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        width: 1024,
        height: 768,
        num_images: 1,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Leonardo AI generation failed');
    }
    
    const data = await response.json();
    return data.imageUrl || data.images?.[0]?.url || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1000&q=80';
    
  } catch (error) {
    console.error('Leonardo AI error:', error);
    // Return a placeholder image
    return 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1000&q=80';
  }
}

// Helper: Generate content with AI
async function generateContentWithAI(
  contentType: string, 
  requirements: WebsiteRequirements,
  template: BrandTemplate
): Promise<string> {
  const businessName = requirements.businessName || template.brand || 'Your Business';
  const industry = requirements.industry || 'Professional Services';
  const overview = requirements.projectOverview || '';
  
  // Content mapping based on type
  const contentMap: Record<string, string> = {
    'brand': businessName,
    'eyebrow': `Welcome to ${businessName}`,
    'headline': businessName,
    'subheadline': overview || `Professional ${industry} solutions designed to transform your business and drive exceptional results.`,
    'services-title': 'Our Services',
    'services-subtitle': `Discover how ${businessName} can help you achieve your goals`,
    'service-1-title': 'Expert Consulting',
    'service-1-desc': `Our team of ${industry} experts provides strategic guidance to help you navigate complex challenges and find effective solutions.`,
    'service-2-title': 'Custom Solutions',
    'service-2-desc': `We build tailored ${industry} solutions using cutting-edge technology to meet your specific business needs.`,
    'service-3-title': 'Growth Strategy',
    'service-3-desc': `Accelerate your business growth with our proven ${industry} strategies and maximize your market potential.`,
    'features-title': `Why Choose ${businessName}`,
    'features-subtitle': 'Numbers that speak for themselves',
    'feature-1': 'Projects Delivered',
    'feature-2': 'Client Satisfaction',
    'feature-3': 'Support Available',
    'feature-4': 'Years of Excellence',
    'cta-title': `Ready to Transform Your ${industry} Business?`,
    'cta-button': requirements.businessPhone ? `Call ${requirements.businessPhone}` : 'Contact Us Today',
    'footer': `© ${new Date().getFullYear()} ${businessName}. All rights reserved.`,
  };
  
  // Try to call OpenAI for more sophisticated content
  try {
    const response = await fetch('/api/openai/rewrite-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contentType,
        originalContent: contentMap[contentType] || '',
        businessName,
        industry,
        overview,
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.content || contentMap[contentType] || contentType;
    }
  } catch (error) {
    console.warn('OpenAI content generation failed, using default:', error);
  }
  
  return contentMap[contentType] || contentType;
}

export default RealTimeWebsiteTransform;

