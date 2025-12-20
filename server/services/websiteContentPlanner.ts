import OpenAI from 'openai';
import { getErrorMessage, logError } from '../utils/errorHandler';

// Optional OpenAI client - allows server to start without API keys
const openai = (process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY)
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY || '',
    })
  : null;

interface InvestigationResults {
  keywords: string[];
  competitorInsights: Array<{
    url: string;
    strengths: string[];
    weaknesses: string[];
    keywords: string[];
  }>;
  contentStrategy: {
    hero: string;
    sections: Array<{
      title: string;
      content: string;
      seoKeywords: string[];
    }>;
  };
  designRecommendations: {
    colorScheme: { primary: string; accent: string; reasoning: string };
    typography: { heading: string; body: string; reasoning: string };
    layout: string;
  };
  seoStrategy: {
    primaryKeywords: string[];
    secondaryKeywords: string[];
    contentGaps: string[];
    recommendations: string[];
  };
}

interface UserRequirements {
  businessType?: string;
  businessName?: string;
  targetAudience?: string;
  desiredPages?: string[];
  keyFeatures?: string[];
  colorScheme?: string;
  contentTone?: string;
  additionalNotes?: string;
  primaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
  styleKeywords?: string[];
  logo?: string;
}

interface ContentPlan {
  html: string;
  css: string;
  js: string;
  meta: {
    title: string;
    description: string;
    keywords: string[];
  };
}

export async function generatePersonalizedWebsite(
  requirements: UserRequirements,
  investigation: InvestigationResults | null,
  onProgress?: (update: { block: string; status: string; progress: number }) => void
): Promise<ContentPlan> {
  const useMockMode = !openai || !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy-key';

  // Fall back to mock if no OpenAI key (but allow null investigation for Quick Build)
  if (useMockMode) {
    return generateMockWebsite(requirements, investigation, onProgress);
  }

  try {
    // Build comprehensive context for GPT-5
    const designContext = `
Business: ${requirements.businessName || 'Business'} (${requirements.businessType || 'General'})
Target Audience: ${requirements.targetAudience || 'General public'}
Tone: ${requirements.contentTone || 'Professional'}

DESIGN SPECIFICATIONS:
- Primary Color: ${requirements.primaryColor || investigation?.designRecommendations?.colorScheme?.primary || '#3B82F6'}
- Accent Color: ${requirements.accentColor || investigation?.designRecommendations?.colorScheme?.accent || '#10B981'}
- Font: ${requirements.fontFamily || investigation?.designRecommendations?.typography?.heading || 'Inter, sans-serif'}
- Style: ${requirements.styleKeywords?.join(', ') || 'Modern, Clean'}
- Layout Strategy: ${investigation?.designRecommendations?.layout || 'Modern, responsive'}

SEO STRATEGY:
- Primary Keywords: ${investigation?.seoStrategy?.primaryKeywords?.slice(0, 5).join(', ') || 'professional, quality, services'}
- Secondary Keywords: ${investigation?.seoStrategy?.secondaryKeywords?.slice(0, 5).join(', ') || 'reliable, expert, trusted'}
- Content Gaps to Fill: ${investigation?.seoStrategy?.contentGaps?.join(', ') || 'none identified'}

CONTENT STRATEGY:
- Hero Message: ${investigation?.contentStrategy?.hero || 'Welcome to our business'}
- Key Sections: ${investigation?.contentStrategy?.sections?.map(s => s.title).join(', ') || 'Features, Benefits, Contact'}

COMPETITOR WEAKNESSES TO EXPLOIT:
${investigation?.competitorInsights?.[0]?.weaknesses?.slice(0, 3).join('\n') || 'None identified'}
`;

    onProgress?.({ block: 'Planning', status: 'building', progress: 10 });

    // Generate HTML structure with GPT-4o
    const htmlPrompt = `You are an elite web design agency. Create a STUNNING, MULTI-PAGE, PREMIUM website with SOPHISTICATED architecture that rivals Apple, Stripe, and top design agencies.

${designContext}

CRITICAL: This is NOT a simple landing page. Build a COMPLETE, PROFESSIONAL, MULTI-PAGE website.

DESIGN INSPIRATION: Apple.com, Stripe.com, Linear.app, Vercel.com, Shopify.com
Style: Ultra-Premium, Sophisticated, Elegant, Cutting-Edge

ARCHITECTURE REQUIREMENTS:
✓ MULTI-PAGE structure with proper navigation system
✓ Each page should have 6-10 sophisticated sections
✓ Smooth page transitions and scroll effects
✓ Dynamic navigation that highlights current page
✓ Mobile-responsive hamburger menu
✓ Breadcrumb navigation where appropriate

PAGES TO BUILD (each fully developed):
${requirements.desiredPages?.map(page => `- ${page} page: Complete with hero, features, content sections, CTAs`).join('\n') || '- Home: Hero, features, testimonials, pricing preview, CTA\n- About: Story, team, values, timeline\n- Services: Service cards, process, benefits\n- Contact: Form, map, info'}

EACH PAGE MUST INCLUDE:
✓ Unique hero section with stunning visuals
✓ 4-6 content sections with depth
✓ Social proof (testimonials, stats, logos)
✓ Strong CTAs throughout
✓ Professional footer with sitemap

DESIGN REQUIREMENTS (make it BREATHTAKING):
✓ Full-screen hero sections with video backgrounds or gradient overlays
✓ Large, bold typography (60-80px headlines)
✓ Advanced card layouts with depth and shadows
✓ Glassmorphism, neumorphism effects
✓ Sticky navigation with blur effect
✓ Micro-interactions and hover animations
✓ Feature grids with icons/illustrations
✓ Pricing tables or service showcases
✓ Team member profiles with hover effects
✓ Image galleries or portfolios
✓ Stats counters or achievement displays
✓ Multi-column layouts with perfect spacing
✓ Gradient text effects and backgrounds
✓ Professional forms with validation UI
✓ SEO-optimized (keywords: ${investigation?.seoStrategy?.primaryKeywords?.slice(0, 5).join(', ') || 'industry keywords'})

TECHNICAL EXCELLENCE:
- Semantic HTML5 with proper structure
- Complete meta tags (title, description, keywords, Open Graph, Twitter Cards)
- Responsive/mobile-first (320px to 4K)
- Performance optimized (lazy loading, etc.)
- Accessible (ARIA labels, keyboard navigation)
- Cross-browser compatible

OUTPUT: Complete multi-page HTML with inline navigation. Start with <!DOCTYPE html>.`;

    const htmlResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an elite web development agency creating sophisticated, multi-page, production-ready websites. Output complete, professional HTML code with proper structure. No explanations.',
        },
        { role: 'user', content: htmlPrompt },
      ],
      max_tokens: 8000,
    });

    const htmlContent = htmlResponse.choices[0]?.message?.content || '';
    onProgress?.({ block: 'HTML Structure', status: 'complete', progress: 40 });

    // Generate CSS with GPT-4o
    const cssPrompt = `Create ULTRA-PREMIUM, SOPHISTICATED CSS for a MULTI-PAGE professional website. This should look like a $50,000 agency build.

DESIGN INSPIRATION: Apple.com, Stripe.com, Linear.app, Shopify.com - Absolute top-tier aesthetics

COLOR PALETTE (use strategically):
- Primary: ${requirements.primaryColor || investigation?.designRecommendations?.colorScheme?.primary || '#3B82F6'}
- Accent: ${requirements.accentColor || investigation?.designRecommendations?.colorScheme?.accent || '#10B981'}
- Gradients: Multi-stop gradients, radial gradients, mesh gradients
- Shadows: Layered shadows for depth

TYPOGRAPHY (world-class):
- Font: ${requirements.fontFamily || investigation?.designRecommendations?.typography?.heading || 'Inter, SF Pro Display, -apple-system, sans-serif'}
- Display headings: 60-80px, bold, tracking-tight
- Section headings: 36-48px, semi-bold
- Body: 16-18px, optimal line-height 1.6-1.8
- Font smoothing: -webkit-font-smoothing: antialiased

ADVANCED VISUAL EFFECTS (implement ALL):
✓ Multi-layer gradient backgrounds with mesh effects
✓ Advanced glassmorphism (backdrop-filter: blur(20px), rgba with opacity)
✓ Neumorphism for cards and buttons
✓ Complex box-shadows (layered, colored shadows)
✓ Sophisticated hover animations (3D transforms, scale, perspective)
✓ Page transition effects (fade-in, slide-up on load)
✓ Scroll-triggered animations (@keyframes)
✓ Parallax effects for backgrounds
✓ Sticky navigation with blur backdrop
✓ Gradient text effects (background-clip: text)
✓ Custom cursor effects on hover
✓ Floating animations for elements
✓ Image zoom on hover (transform: scale(1.05))
✓ Button ripple effects
✓ Progress indicators and loading states

LAYOUT & SPACING (perfection):
✓ CSS Grid for complex layouts (12-column system)
✓ Flexbox for components
✓ Generous whitespace (60-120px section padding)
✓ Consistent spacing scale (8px, 16px, 24px, 32px, 48px, 64px, 96px)
✓ Max-width containers (1280px-1440px)
✓ Perfect responsive breakpoints:
  - Mobile: 320px-767px
  - Tablet: 768px-1023px
  - Desktop: 1024px-1439px
  - Large: 1440px+

PROFESSIONAL COMPONENTS:
✓ Animated navigation with indicator
✓ Hero sections with video/gradient backgrounds
✓ Feature cards with 3D transforms
✓ Testimonial sliders/grids
✓ Pricing tables with hover effects
✓ Contact forms with floating labels
✓ Footer with multiple columns
✓ Gallery/portfolio grids
✓ Stats counters
✓ Team member cards

PERFORMANCE & QUALITY:
- Hardware acceleration (will-change, transform3d)
- Smooth 60fps animations
- Reduced motion media query support
- Print stylesheet included
- Dark mode compatible
- Cross-browser prefixes

OUTPUT: Complete production-ready CSS. No explanations.`;

    const cssResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an elite CSS architect creating world-class, production-ready stylesheets for premium websites. Output complete, sophisticated CSS. No explanations.',
        },
        { role: 'user', content: cssPrompt },
      ],
      max_tokens: 6000,
    });

    const cssContent = cssResponse.choices[0]?.message?.content || '';
    onProgress?.({ block: 'Styling', status: 'complete', progress: 70 });

    // Generate JavaScript for interactivity
    const jsPrompt = `Create JavaScript for smooth interactions on this website:

FEATURES NEEDED:
- Smooth scroll navigation
- Mobile menu toggle
- Form validation with helpful error messages
- Scroll animations (fade-in on scroll)
- Active nav highlighting
- Contact form submission handling
- Any interactive features mentioned: ${requirements.keyFeatures?.join(', ') || 'Contact form'}

Keep it vanilla JavaScript, modern ES6+, well-commented.
OUTPUT ONLY THE JAVASCRIPT CODE - no explanations.`;

    const jsResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert JavaScript developer. Output only clean, modern JavaScript code with no explanations.',
        },
        { role: 'user', content: jsPrompt },
      ],
      max_tokens: 2000,
    });

    const jsContent = jsResponse.choices[0]?.message?.content || '';
    onProgress?.({ block: 'Interactivity', status: 'complete', progress: 90 });

    // Extract title and description for SEO
    const titleMatch = htmlContent.match(/<title>(.*?)<\/title>/i);
    const descMatch = htmlContent.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);

    onProgress?.({ block: 'Finalization', status: 'complete', progress: 100 });

    return {
      html: cleanCodeBlock(htmlContent),
      css: cleanCodeBlock(cssContent),
      js: cleanCodeBlock(jsContent),
      meta: {
        title: titleMatch?.[1] || `${requirements.businessName || 'Business'} - ${requirements.businessType || 'Website'}`,
        description: descMatch?.[1] || investigation?.contentStrategy?.hero || 'Welcome to our business',
        keywords: investigation?.seoStrategy?.primaryKeywords?.slice(0, 10) || ['business', 'professional', 'services'],
      },
    };
  } catch (error: unknown) {
    logError(error, 'Content Planner');
    
    // Fallback to mock on error
    return generateMockWebsite(requirements, investigation, onProgress);
  }
}

function cleanCodeBlock(code: string): string {
  // Remove markdown code blocks if present
  let cleaned = code.replace(/^```[\w]*\n/, '').replace(/\n```$/, '');
  cleaned = cleaned.trim();
  return cleaned;
}

function generateMockWebsite(
  requirements: UserRequirements,
  investigation: InvestigationResults | null,
  onProgress?: (update: { block: string; status: string; progress: number }) => void
): ContentPlan {
  const businessName = requirements.businessName || 'Your Business';
  const primaryColor = requirements.primaryColor || investigation?.designRecommendations?.colorScheme?.primary || '#3B82F6';
  const accentColor = requirements.accentColor || investigation?.designRecommendations?.colorScheme?.accent || '#10B981';
  const fontFamily = requirements.fontFamily || investigation?.designRecommendations?.typography?.heading || 'Inter';

  onProgress?.({ block: 'HTML Structure', status: 'building', progress: 20 });

  const metaDescription = investigation?.contentStrategy?.hero || `Welcome to ${businessName}. We provide excellent ${requirements.businessType || 'services'} for ${requirements.targetAudience || 'our customers'}.`;
  const metaKeywords = investigation?.seoStrategy?.primaryKeywords?.slice(0, 10).join(', ') || [businessName, requirements.businessType, requirements.targetAudience].filter(Boolean).join(', ');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${businessName} - ${requirements.businessType || 'Professional Services'}</title>
  <meta name="description" content="${metaDescription}">
  <meta name="keywords" content="${metaKeywords}">
  
  <!-- Open Graph -->
  <meta property="og:title" content="${businessName}">
  <meta property="og:description" content="${metaDescription}">
  <meta property="og:type" content="website">
  
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <nav class="navbar">
    <div class="container">
      <div class="nav-brand">${businessName}</div>
      <ul class="nav-menu">
        <li><a href="#home">Home</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#services">Services</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </div>
  </nav>

  <section id="home" class="hero">
    <div class="container">
      <h1>${investigation?.contentStrategy?.hero || `Welcome to ${businessName}`}</h1>
      <p>Serving ${requirements.targetAudience || 'our valued customers'} with excellence</p>
      <a href="#contact" class="btn btn-primary">Get Started</a>
    </div>
  </section>

  ${investigation?.contentStrategy?.sections?.map((section, idx) => `
  <section id="section-${idx}" class="content-section">
    <div class="container">
      <h2>${section.title}</h2>
      <p>${section.content}</p>
    </div>
  </section>
  `).join('\n') || `
  <section class="content-section">
    <div class="container">
      <h2>About Us</h2>
      <p>We are ${businessName}, providing top-quality ${requirements.businessType || 'services'} to ${requirements.targetAudience || 'our clients'}.</p>
    </div>
  </section>
  <section class="content-section">
    <div class="container">
      <h2>Our Services</h2>
      <p>We offer comprehensive solutions tailored to your needs.</p>
    </div>
  </section>
  `}

  <section id="contact" class="contact">
    <div class="container">
      <h2>Contact Us</h2>
      <form class="contact-form">
        <input type="text" placeholder="Your Name" required>
        <input type="email" placeholder="Your Email" required>
        <textarea placeholder="Your Message" rows="5" required></textarea>
        <button type="submit" class="btn btn-primary">Send Message</button>
      </form>
    </div>
  </section>

  <footer>
    <div class="container">
      <p>&copy; 2024 ${businessName}. All rights reserved.</p>
    </div>
  </footer>

  <script src="script.js"></script>
</body>
</html>`;

  onProgress?.({ block: 'Styling', status: 'building', progress: 50 });

  const css = `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: ${fontFamily}, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  line-height: 1.6;
  color: #333;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.navbar {
  background: ${primaryColor};
  color: white;
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.navbar .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand {
  font-size: 1.5rem;
  font-weight: bold;
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: 2rem;
}

.nav-menu a {
  color: white;
  text-decoration: none;
  transition: opacity 0.3s;
}

.nav-menu a:hover {
  opacity: 0.8;
}

.hero {
  background: linear-gradient(135deg, ${primaryColor}, ${accentColor});
  color: white;
  padding: 8rem 0;
  text-align: center;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  animation: fadeInUp 1s;
}

.hero p {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  animation: fadeInUp 1s 0.2s both;
}

.btn {
  display: inline-block;
  padding: 12px 30px;
  border-radius: 5px;
  text-decoration: none;
  transition: transform 0.3s, box-shadow 0.3s;
  font-weight: 600;
}

.btn-primary {
  background: white;
  color: ${primaryColor};
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.3);
}

.content-section {
  padding: 5rem 0;
}

.content-section:nth-child(even) {
  background: #f8f9fa;
}

.content-section h2 {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  color: ${primaryColor};
}

.contact {
  padding: 5rem 0;
  background: #f8f9fa;
}

.contact h2 {
  text-align: center;
  margin-bottom: 3rem;
  font-size: 2.5rem;
  color: ${primaryColor};
}

.contact-form {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.contact-form input,
.contact-form textarea {
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-family: inherit;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.contact-form input:focus,
.contact-form textarea:focus {
  outline: none;
  border-color: ${primaryColor};
}

.contact-form button {
  background: ${primaryColor};
  color: white;
  border: none;
  cursor: pointer;
}

footer {
  background: #333;
  color: white;
  text-align: center;
  padding: 2rem 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .nav-menu {
    display: none;
  }
  
  .hero h1 {
    font-size: 2rem;
  }
  
  .content-section h2 {
    font-size: 1.8rem;
  }
}`;

  onProgress?.({ block: 'Interactivity', status: 'building', progress: 80 });

  const js = `document.addEventListener('DOMContentLoaded', function() {
  // Smooth scrolling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Form submission
  const form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      alert('Thank you for your message! We will get back to you soon.');
      form.reset();
    });
  }

  // Scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeInUp 1s both';
      }
    });
  }, observerOptions);

  document.querySelectorAll('.content-section').forEach(section => {
    observer.observe(section);
  });
});`;

  onProgress?.({ block: 'Finalization', status: 'complete', progress: 100 });

  return {
    html,
    css,
    js,
    meta: {
      title: `${businessName} - ${requirements.businessType || 'Professional Services'}`,
      description: metaDescription,
      keywords: (investigation?.seoStrategy?.primaryKeywords?.slice(0, 10) || [businessName, requirements.businessType, requirements.targetAudience].filter((x): x is string => Boolean(x))),
    },
  };
}
