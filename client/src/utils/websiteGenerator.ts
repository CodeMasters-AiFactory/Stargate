// Template-specific website generation
// Takes user description and generates real, usable HTML/CSS/JS

import type { WebsiteRequirements, BuildBlock } from '@/types/websiteBuilder';

interface GeneratedWebsite {
  html: string;
  css: string;
  js: string;
}

export function generateSkeletonHTML(requirements?: WebsiteRequirements): string {
  const primaryColor = requirements?.primaryColor || '#3b82f6';

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Building Your Website...</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: system-ui, -apple-system, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .loading-container {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            color: white;
            text-align: center;
            padding: 20px;
        }
        .loading-content h1 {
            font-size: 2rem;
            margin-bottom: 1rem;
            animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        .skeleton {
            background: linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 8px;
        }
        @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
    </style>
    <!-- CSS_INSERT -->
</head>
<body>
    <!-- HEADER_INSERT -->
    <!-- HERO_INSERT -->
    <!-- FEATURES_INSERT -->
    <!-- ABOUT_INSERT -->
    <!-- GALLERY_INSERT -->
    <!-- CONTACT_INSERT -->
    <!-- FOOTER_INSERT -->
    
    <div class="loading-container" id="initial-loader">
        <div class="loading-content">
            <h1>Building your website block by block...</h1>
            <p>Watch as each section comes to life</p>
        </div>
    </div>
</body>
</html>`;
}

export function generateBuildBlocks(
  templateId: string | null,
  description: string,
  requirements?: WebsiteRequirements
): BuildBlock[] {
  const template = templateId || 'custom';

  switch (template) {
    case 'restaurant':
      return generateRestaurantBlocks(description, requirements);
    case 'ecommerce':
      return generateEcommerceBlocks(description, requirements);
    case 'portfolio':
      return generatePortfolioBlocks(description, requirements);
    case 'blog':
      return generateBlogBlocks(description, requirements);
    case 'landing':
    case 'saas':
    case 'custom':
    default:
      return generateCustomBlocks(description, requirements);
  }
}

export function generateWebsite(
  templateId: string | null,
  description: string,
  requirements?: WebsiteRequirements
): GeneratedWebsite {
  const template = templateId || 'custom';

  switch (template) {
    case 'restaurant':
      return generateRestaurantSite(description, requirements);
    case 'ecommerce':
      return generateEcommerceSite(description, requirements);
    case 'portfolio':
      return generatePortfolioSite(description, requirements);
    case 'blog':
      return generateBlogSite(description, requirements);
    case 'landing':
      return generateLandingPage(description, requirements);
    case 'saas':
      return generateSaaSSite(description, requirements);
    case 'custom':
    default:
      return generateCustomSite(description, requirements);
  }
}

function extractKeywords(description: string): {
  businessName: string;
  tagline: string;
  keywords: string[];
} {
  const words = description.toLowerCase().split(/\s+/);
  const businessName =
    description.split(/\.|,/)[0].split(' ').slice(0, 3).join(' ') || 'Your Business';

  const keywords: string[] = [];
  if (words.includes('modern') || words.includes('contemporary')) keywords.push('modern');
  if (words.includes('elegant') || words.includes('upscale') || words.includes('premium'))
    keywords.push('elegant');
  if (words.includes('dark')) keywords.push('dark');
  if (words.includes('light') || words.includes('bright')) keywords.push('light');

  const tagline =
    description.length > 100
      ? description.substring(0, 100) + '...'
      : description || 'Welcome to our website';

  return { businessName, tagline, keywords };
}

function generateCustomBlocks(
  description: string,
  requirements?: WebsiteRequirements
): BuildBlock[] {
  const { businessName, keywords } = extractKeywords(description);
  const isDark = keywords.includes('dark');

  const primaryColor = requirements?.primaryColor || '#3b82f6';
  const accentColor = requirements?.accentColor || '#8b5cf6';
  const bgColor = isDark ? '#1a1a1a' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#1a1a1a';
  const fontFamily = requirements?.fontStyle?.includes('Sans-serif')
    ? 'system-ui, -apple-system, sans-serif'
    : "'Inter', sans-serif";

  const blocks: BuildBlock[] = [];

  blocks.push({
    id: 'css-styles',
    type: 'css',
    name: 'Base Styles',
    target: '<!-- CSS_INSERT -->',
    estimatedTime: 800,
    content: `
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: ${fontFamily}; line-height: 1.6; color: ${textColor}; background: ${bgColor}; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .navbar { background: ${isDark ? '#0a0a0a' : 'white'}; padding: 1rem 0; border-bottom: 1px solid ${isDark ? '#333' : '#eee'}; }
        .nav-content { display: flex; justify-content: space-between; align-items: center; }
        .hero { background: linear-gradient(135deg, ${primaryColor}, ${accentColor}); color: white; padding: 100px 0; text-align: center; }
        .hero h1 { font-size: 3rem; margin-bottom: 1rem; }
        .hero p { font-size: 1.2rem; opacity: 0.9; }
        .features { padding: 4rem 0; }
        .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; margin-top: 2rem; }
        .feature-card { background: ${isDark ? '#2a2a2a' : '#f9fafb'}; padding: 2rem; border-radius: 10px; transition: transform 0.3s; }
        .feature-card:hover { transform: translateY(-5px); }
        .feature-title { font-size: 1.3rem; margin-bottom: 0.5rem; color: ${textColor}; }
        footer { background: ${isDark ? '#0a0a0a' : '#1a1a1a'}; color: white; text-align: center; padding: 2rem 0; margin-top: 4rem; }
    </style>`,
  });

  blocks.push({
    id: 'navbar',
    type: 'header',
    name: 'Navigation',
    target: '<!-- HEADER_INSERT -->',
    estimatedTime: 600,
    content: `
    <nav class="navbar">
        <div class="container nav-content">
            <div style="font-weight: bold; font-size: 1.5rem; color: ${textColor};">${businessName}</div>
        </div>
    </nav>`,
  });

  blocks.push({
    id: 'hero',
    type: 'hero',
    name: 'Hero Section',
    target: '<!-- HERO_INSERT -->',
    estimatedTime: 900,
    content: `
    <section class="hero">
        <div class="container">
            <h1>${businessName}</h1>
            <p>Welcome to our website</p>
        </div>
    </section>`,
  });

  blocks.push({
    id: 'features',
    type: 'features',
    name: 'Features',
    target: '<!-- FEATURES_INSERT -->',
    estimatedTime: 1000,
    content: `
    <section class="features">
        <div class="container">
            <h2 style="text-align: center; font-size: 2.5rem; margin-bottom: 2rem; color: ${textColor};">What We Offer</h2>
            <div class="feature-grid">
                <div class="feature-card">
                    <h3 class="feature-title">Feature One</h3>
                    <p style="color: ${isDark ? '#aaa' : '#666'};">Description of your first key feature or service</p>
                </div>
                <div class="feature-card">
                    <h3 class="feature-title">Feature Two</h3>
                    <p style="color: ${isDark ? '#aaa' : '#666'};">Description of your second key feature or service</p>
                </div>
                <div class="feature-card">
                    <h3 class="feature-title">Feature Three</h3>
                    <p style="color: ${isDark ? '#aaa' : '#666'};">Description of your third key feature or service</p>
                </div>
            </div>
        </div>
    </section>`,
  });

  blocks.push({
    id: 'footer',
    type: 'footer',
    name: 'Footer',
    target: '<!-- FOOTER_INSERT -->',
    estimatedTime: 500,
    content: `
    <footer>
        <div class="container">
            <p>&copy; 2024 ${businessName}. All rights reserved.</p>
            <p>Built with Stargate Merlin Website Wizard</p>
        </div>
    </footer>`,
  });

  return blocks;
}

function generateRestaurantBlocks(
  description: string,
  requirements?: WebsiteRequirements
): BuildBlock[] {
  const { businessName, tagline, keywords } = extractKeywords(description);
  const isDark = keywords.includes('dark');

  const primaryColor =
    requirements?.primaryColor || (keywords.includes('elegant') ? '#d4af37' : '#e8540e');
  const accentColor = requirements?.accentColor || '#a855f7';
  const bgColor = isDark ? '#1a1a1a' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#1a1a1a';

  const getFontFamily = () => {
    if (!requirements?.fontStyle) return "'Georgia', serif";
    if (requirements.fontStyle.includes('Sans-serif'))
      return 'system-ui, -apple-system, sans-serif';
    if (requirements.fontStyle.includes('Serif')) return "'Georgia', serif";
    if (requirements.fontStyle.includes('Monospace')) return "'Courier New', monospace";
    if (requirements.fontStyle.includes('Display')) return "'Impact', fantasy";
    return "'Georgia', serif";
  };
  const fontFamily = getFontFamily();

  const blocks: BuildBlock[] = [];

  blocks.push({
    id: 'css-styles',
    type: 'css',
    name: 'Base Styles',
    target: '<!-- CSS_INSERT -->',
    estimatedTime: 800,
    content: `
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: ${fontFamily};
            background-color: ${bgColor};
            color: ${textColor};
            line-height: 1.6;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        .navbar {
            background: rgba(0, 0, 0, 0.9);
            padding: 1rem 0;
            position: sticky;
            top: 0;
            z-index: 100;
        }
        .navbar .container {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .logo {
            font-size: 1.5rem;
            font-weight: bold;
            color: ${primaryColor};
        }
        .nav-links {
            display: flex;
            gap: 2rem;
            list-style: none;
        }
        .nav-links a {
            color: white;
            text-decoration: none;
            transition: color 0.3s;
        }
        .nav-links a:hover {
            color: ${primaryColor};
        }
        .hero {
            background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), 
                        url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200');
            background-size: cover;
            background-position: center;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            color: white;
        }
        .hero h1 {
            font-size: 4rem;
            margin-bottom: 1rem;
            color: ${primaryColor};
        }
        .tagline {
            font-size: 1.5rem;
            margin-bottom: 2rem;
        }
        .cta-button {
            background-color: ${primaryColor};
            color: white;
            border: none;
            padding: 1rem 2rem;
            font-size: 1.2rem;
            cursor: pointer;
            border-radius: 5px;
            transition: transform 0.3s;
        }
        .cta-button:hover {
            transform: scale(1.05);
        }
        .menu-section, .reservations {
            padding: 4rem 0;
            background-color: ${isDark ? '#2a2a2a' : '#f5f5f5'};
        }
        .menu-section h2, .reservations h2 {
            text-align: center;
            font-size: 2.5rem;
            margin-bottom: 2rem;
            color: ${primaryColor};
        }
        .menu-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
        }
        .menu-item {
            background: ${isDark ? '#1a1a1a' : 'white'};
            padding: 2rem;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .menu-item h3 {
            color: ${primaryColor};
            margin-bottom: 1rem;
        }
        footer {
            background: #000;
            color: white;
            padding: 2rem 0;
            text-align: center;
        }
    </style>`,
  });

  blocks.push({
    id: 'header-nav',
    type: 'header',
    name: 'Navigation Bar',
    target: '<!-- HEADER_INSERT -->',
    estimatedTime: 600,
    content: `
    <nav class="navbar">
        <div class="container">
            <div class="logo">${businessName}</div>
            <ul class="nav-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#menu">Menu</a></li>
                <li><a href="#reservations">Reservations</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </div>
    </nav>`,
  });

  blocks.push({
    id: 'hero-section',
    type: 'hero',
    name: 'Hero Section',
    target: '<!-- HERO_INSERT -->',
    estimatedTime: 1000,
    content: `
    <section id="home" class="hero">
        <div class="hero-content">
            <h1>${businessName}</h1>
            <p class="tagline">${tagline}</p>
            <button class="cta-button">Make a Reservation</button>
        </div>
    </section>`,
  });

  blocks.push({
    id: 'menu-section',
    type: 'features',
    name: 'Menu Section',
    target: '<!-- FEATURES_INSERT -->',
    estimatedTime: 900,
    content: `
    <section id="menu" class="menu-section">
        <div class="container">
            <h2>Our Menu</h2>
            <div class="menu-grid">
                <div class="menu-item">
                    <h3>Appetizers</h3>
                    <p>Delicious starters to begin your culinary journey</p>
                </div>
                <div class="menu-item">
                    <h3>Main Course</h3>
                    <p>Expertly crafted dishes using the finest ingredients</p>
                </div>
                <div class="menu-item">
                    <h3>Desserts</h3>
                    <p>Sweet endings to perfect your dining experience</p>
                </div>
            </div>
        </div>
    </section>`,
  });

  blocks.push({
    id: 'reservations-section',
    type: 'contact',
    name: 'Reservations',
    target: '<!-- CONTACT_INSERT -->',
    estimatedTime: 700,
    content: `
    <section id="reservations" class="reservations">
        <div class="container">
            <h2>Make a Reservation</h2>
            <p style="text-align: center; max-width: 600px; margin: 0 auto;">
                Experience fine dining at its best. Book your table today and join us for an unforgettable culinary experience.
            </p>
        </div>
    </section>`,
  });

  blocks.push({
    id: 'footer-section',
    type: 'footer',
    name: 'Footer',
    target: '<!-- FOOTER_INSERT -->',
    estimatedTime: 500,
    content: `
    <footer>
        <div class="container">
            <p>&copy; 2024 ${businessName}. All rights reserved.</p>
            <p>Built with Stargate Merlin Website Wizard</p>
        </div>
    </footer>`,
  });

  return blocks;
}

function generateEcommerceBlocks(
  description: string,
  requirements?: WebsiteRequirements
): BuildBlock[] {
  const { businessName, keywords } = extractKeywords(description);
  const isDark = keywords.includes('dark');

  const primaryColor = requirements?.primaryColor || '#3b82f6';
  const accentColor = requirements?.accentColor || '#f97316';
  const bgColor = isDark ? '#1a1a1a' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#1a1a1a';
  const fontFamily = requirements?.fontStyle?.includes('Sans-serif')
    ? 'system-ui, -apple-system, sans-serif'
    : "'Inter', sans-serif";

  const blocks: BuildBlock[] = [];

  blocks.push({
    id: 'css-styles',
    type: 'css',
    name: 'Base Styles',
    target: '<!-- CSS_INSERT -->',
    estimatedTime: 800,
    content: `
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: ${fontFamily}; line-height: 1.6; color: ${textColor}; background: ${bgColor}; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .navbar { background: ${primaryColor}; color: white; padding: 1rem 0; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .nav-content { display: flex; justify-content: space-between; align-items: center; }
        .logo { font-size: 1.5rem; font-weight: bold; }
        .cart-btn { background: white; color: ${primaryColor}; border: none; padding: 0.5rem 1rem; border-radius: 5px; cursor: pointer; }
        .hero { background: linear-gradient(135deg, ${primaryColor}, ${accentColor}); color: white; padding: 80px 0; text-align: center; }
        .hero h1 { font-size: 3rem; margin-bottom: 1rem; }
        .product-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; padding: 4rem 0; }
        .product-card { background: ${isDark ? '#2a2a2a' : '#f9fafb'}; border-radius: 10px; overflow: hidden; transition: transform 0.3s; }
        .product-card:hover { transform: translateY(-5px); }
        .product-img { width: 100%; height: 200px; background: linear-gradient(135deg, ${primaryColor}20, ${accentColor}20); }
        .product-info { padding: 1.5rem; }
        .product-title { font-size: 1.2rem; margin-bottom: 0.5rem; color: ${textColor}; }
        .product-price { font-size: 1.5rem; color: ${primaryColor}; font-weight: bold; margin: 1rem 0; }
        .add-cart-btn { background: ${primaryColor}; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 5px; cursor: pointer; width: 100%; }
        footer { background: ${isDark ? '#0a0a0a' : '#1a1a1a'}; color: white; text-align: center; padding: 2rem 0; margin-top: 4rem; }
    </style>`,
  });

  blocks.push({
    id: 'navbar',
    type: 'header',
    name: 'Navigation Bar',
    target: '<!-- HEADER_INSERT -->',
    estimatedTime: 600,
    content: `
    <nav class="navbar">
        <div class="container nav-content">
            <div class="logo">${businessName}</div>
            <button class="cart-btn">Cart (0)</button>
        </div>
    </nav>`,
  });

  blocks.push({
    id: 'hero',
    type: 'hero',
    name: 'Hero Section',
    target: '<!-- HERO_INSERT -->',
    estimatedTime: 900,
    content: `
    <section class="hero">
        <div class="container">
            <h1>Shop ${businessName}</h1>
            <p>Discover our curated collection of premium products</p>
        </div>
    </section>`,
  });

  blocks.push({
    id: 'products',
    type: 'features',
    name: 'Product Grid',
    target: '<!-- FEATURES_INSERT -->',
    estimatedTime: 1200,
    content: `
    <section class="container">
        <div class="product-grid">
            <div class="product-card">
                <div class="product-img"></div>
                <div class="product-info">
                    <h3 class="product-title">Premium Product</h3>
                    <div class="product-price">$99.99</div>
                    <button class="add-cart-btn">Add to Cart</button>
                </div>
            </div>
            <div class="product-card">
                <div class="product-img"></div>
                <div class="product-info">
                    <h3 class="product-title">Featured Item</h3>
                    <div class="product-price">$149.99</div>
                    <button class="add-cart-btn">Add to Cart</button>
                </div>
            </div>
            <div class="product-card">
                <div class="product-img"></div>
                <div class="product-info">
                    <h3 class="product-title">Bestseller</h3>
                    <div class="product-price">$79.99</div>
                    <button class="add-cart-btn">Add to Cart</button>
                </div>
            </div>
        </div>
    </section>`,
  });

  blocks.push({
    id: 'footer',
    type: 'footer',
    name: 'Footer',
    target: '<!-- FOOTER_INSERT -->',
    estimatedTime: 500,
    content: `
    <footer>
        <div class="container">
            <p>&copy; 2024 ${businessName}. All rights reserved.</p>
            <p>Built with Stargate Merlin Website Wizard</p>
        </div>
    </footer>`,
  });

  return blocks;
}

function generatePortfolioBlocks(
  description: string,
  requirements?: WebsiteRequirements
): BuildBlock[] {
  const { businessName, keywords } = extractKeywords(description);
  const isDark = keywords.includes('dark');

  const primaryColor = requirements?.primaryColor || '#6366f1';
  const accentColor = requirements?.accentColor || '#ec4899';
  const bgColor = isDark ? '#1a1a1a' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#1a1a1a';
  const fontFamily = requirements?.fontStyle?.includes('Sans-serif')
    ? 'system-ui, -apple-system, sans-serif'
    : "'Inter', sans-serif";

  const blocks: BuildBlock[] = [];

  blocks.push({
    id: 'css-styles',
    type: 'css',
    name: 'Base Styles',
    target: '<!-- CSS_INSERT -->',
    estimatedTime: 800,
    content: `
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: ${fontFamily}; line-height: 1.6; color: ${textColor}; background: ${bgColor}; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .navbar { background: ${isDark ? '#0a0a0a' : 'white'}; padding: 1rem 0; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .nav-content { display: flex; justify-content: space-between; align-items: center; }
        .nav-links { display: flex; gap: 2rem; }
        .nav-links a { color: ${textColor}; text-decoration: none; }
        .hero { padding: 100px 0; text-align: center; }
        .hero h1 { font-size: 4rem; margin-bottom: 1rem; background: linear-gradient(135deg, ${primaryColor}, ${accentColor}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero p { font-size: 1.5rem; color: ${isDark ? '#aaa' : '#666'}; }
        .projects { padding: 4rem 0; }
        .projects h2 { font-size: 2.5rem; margin-bottom: 2rem; text-align: center; }
        .project-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
        .project-card { background: ${isDark ? '#2a2a2a' : '#f9fafb'}; border-radius: 10px; overflow: hidden; transition: transform 0.3s; }
        .project-card:hover { transform: translateY(-5px); }
        .project-img { width: 100%; height: 200px; background: linear-gradient(135deg, ${primaryColor}40, ${accentColor}40); }
        .project-info { padding: 1.5rem; }
        .project-title { font-size: 1.3rem; margin-bottom: 0.5rem; color: ${textColor}; }
        .project-desc { color: ${isDark ? '#aaa' : '#666'}; }
        footer { background: ${isDark ? '#0a0a0a' : '#1a1a1a'}; color: white; text-align: center; padding: 2rem 0; margin-top: 4rem; }
    </style>`,
  });

  blocks.push({
    id: 'navbar',
    type: 'header',
    name: 'Navigation',
    target: '<!-- HEADER_INSERT -->',
    estimatedTime: 600,
    content: `
    <nav class="navbar">
        <div class="container nav-content">
            <div class="logo" style="font-weight: bold; font-size: 1.5rem; color: ${textColor};">${businessName}</div>
            <div class="nav-links">
                <a href="#work">Work</a>
                <a href="#about">About</a>
                <a href="#contact">Contact</a>
            </div>
        </div>
    </nav>`,
  });

  blocks.push({
    id: 'hero',
    type: 'hero',
    name: 'Hero Section',
    target: '<!-- HERO_INSERT -->',
    estimatedTime: 900,
    content: `
    <section class="hero">
        <div class="container">
            <h1>${businessName}</h1>
            <p>Creative Professional & Designer</p>
        </div>
    </section>`,
  });

  blocks.push({
    id: 'projects',
    type: 'gallery',
    name: 'Project Gallery',
    target: '<!-- GALLERY_INSERT -->',
    estimatedTime: 1100,
    content: `
    <section id="work" class="projects">
        <div class="container">
            <h2>Featured Work</h2>
            <div class="project-grid">
                <div class="project-card">
                    <div class="project-img"></div>
                    <div class="project-info">
                        <h3 class="project-title">Project Alpha</h3>
                        <p class="project-desc">Brand identity and web design for a tech startup</p>
                    </div>
                </div>
                <div class="project-card">
                    <div class="project-img"></div>
                    <div class="project-info">
                        <h3 class="project-title">Project Beta</h3>
                        <p class="project-desc">Mobile app design and user experience</p>
                    </div>
                </div>
                <div class="project-card">
                    <div class="project-img"></div>
                    <div class="project-info">
                        <h3 class="project-title">Project Gamma</h3>
                        <p class="project-desc">E-commerce platform redesign</p>
                    </div>
                </div>
            </div>
        </div>
    </section>`,
  });

  blocks.push({
    id: 'footer',
    type: 'footer',
    name: 'Footer',
    target: '<!-- FOOTER_INSERT -->',
    estimatedTime: 500,
    content: `
    <footer>
        <div class="container">
            <p>&copy; 2024 ${businessName}. All rights reserved.</p>
            <p>Built with Stargate Merlin Website Wizard</p>
        </div>
    </footer>`,
  });

  return blocks;
}

function generateBlogBlocks(description: string, requirements?: WebsiteRequirements): BuildBlock[] {
  const { businessName, keywords } = extractKeywords(description);
  const isDark = keywords.includes('dark');

  const primaryColor = requirements?.primaryColor || '#10b981';
  const accentColor = requirements?.accentColor || '#8b5cf6';
  const bgColor = isDark ? '#1a1a1a' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#1a1a1a';
  const fontFamily = requirements?.fontStyle?.includes('Serif')
    ? "'Georgia', serif"
    : 'system-ui, -apple-system, sans-serif';

  const blocks: BuildBlock[] = [];

  blocks.push({
    id: 'css-styles',
    type: 'css',
    name: 'Base Styles',
    target: '<!-- CSS_INSERT -->',
    estimatedTime: 800,
    content: `
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: ${fontFamily}; line-height: 1.8; color: ${textColor}; background: ${bgColor}; }
        .container { max-width: 1000px; margin: 0 auto; padding: 0 20px; }
        .navbar { background: ${isDark ? '#0a0a0a' : 'white'}; padding: 1rem 0; border-bottom: 1px solid ${isDark ? '#333' : '#eee'}; }
        .nav-content { display: flex; justify-content: space-between; align-items: center; }
        .nav-links { display: flex; gap: 2rem; }
        .nav-links a { color: ${textColor}; text-decoration: none; }
        .hero { background: linear-gradient(135deg, ${primaryColor}, ${accentColor}); color: white; padding: 60px 0; text-align: center; }
        .hero h1 { font-size: 2.5rem; margin-bottom: 1rem; }
        .posts { padding: 4rem 0; }
        .post-card { background: ${isDark ? '#2a2a2a' : '#f9fafb'}; border-radius: 10px; padding: 2rem; margin-bottom: 2rem; transition: transform 0.3s; }
        .post-card:hover { transform: translateY(-3px); }
        .post-title { font-size: 1.8rem; margin-bottom: 0.5rem; color: ${textColor}; }
        .post-meta { color: ${isDark ? '#888' : '#666'}; font-size: 0.9rem; margin-bottom: 1rem; }
        .post-excerpt { color: ${isDark ? '#aaa' : '#444'}; line-height: 1.8; }
        .read-more { color: ${primaryColor}; text-decoration: none; font-weight: 600; }
        footer { background: ${isDark ? '#0a0a0a' : '#1a1a1a'}; color: white; text-align: center; padding: 2rem 0; margin-top: 4rem; }
    </style>`,
  });

  blocks.push({
    id: 'navbar',
    type: 'header',
    name: 'Navigation Bar',
    target: '<!-- HEADER_INSERT -->',
    estimatedTime: 600,
    content: `
    <nav class="navbar">
        <div class="container nav-content">
            <div style="font-weight: bold; font-size: 1.5rem; color: ${textColor};">${businessName}</div>
            <div class="nav-links">
                <a href="#home">Home</a>
                <a href="#about">About</a>
                <a href="#contact">Contact</a>
            </div>
        </div>
    </nav>`,
  });

  blocks.push({
    id: 'hero',
    type: 'hero',
    name: 'Hero Section',
    target: '<!-- HERO_INSERT -->',
    estimatedTime: 800,
    content: `
    <section class="hero">
        <div class="container">
            <h1>${businessName}</h1>
            <p>Thoughts, stories, and ideas</p>
        </div>
    </section>`,
  });

  blocks.push({
    id: 'posts',
    type: 'features',
    name: 'Blog Posts',
    target: '<!-- FEATURES_INSERT -->',
    estimatedTime: 1000,
    content: `
    <section class="posts">
        <div class="container">
            <article class="post-card">
                <h2 class="post-title">Getting Started with Web Design</h2>
                <div class="post-meta">Published on January 15, 2024 • 5 min read</div>
                <p class="post-excerpt">
                    Learn the fundamentals of modern web design and how to create beautiful, responsive websites that users love...
                </p>
                <a href="#" class="read-more">Read more →</a>
            </article>
            <article class="post-card">
                <h2 class="post-title">The Future of Digital Marketing</h2>
                <div class="post-meta">Published on January 10, 2024 • 8 min read</div>
                <p class="post-excerpt">
                    Explore upcoming trends in digital marketing and how businesses can stay ahead of the curve in an ever-evolving landscape...
                </p>
                <a href="#" class="read-more">Read more →</a>
            </article>
        </div>
    </section>`,
  });

  blocks.push({
    id: 'footer',
    type: 'footer',
    name: 'Footer',
    target: '<!-- FOOTER_INSERT -->',
    estimatedTime: 500,
    content: `
    <footer>
        <div class="container">
            <p>&copy; 2024 ${businessName}. All rights reserved.</p>
            <p>Built with Stargate Merlin Website Wizard</p>
        </div>
    </footer>`,
  });

  return blocks;
}

function generateRestaurantSite(
  description: string,
  requirements?: WebsiteRequirements
): GeneratedWebsite {
  const { businessName, tagline, keywords } = extractKeywords(description);
  const isDark = keywords.includes('dark');

  const primaryColor =
    requirements?.primaryColor || (keywords.includes('elegant') ? '#d4af37' : '#e8540e');
  const accentColor = requirements?.accentColor || '#a855f7';
  const bgColor = isDark ? '#1a1a1a' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#1a1a1a';

  const getFontFamily = () => {
    if (!requirements?.fontStyle) return "'Georgia', serif";
    if (requirements.fontStyle.includes('Sans-serif'))
      return 'system-ui, -apple-system, sans-serif';
    if (requirements.fontStyle.includes('Serif')) return "'Georgia', serif";
    if (requirements.fontStyle.includes('Monospace')) return "'Courier New', monospace";
    if (requirements.fontStyle.includes('Display')) return "'Impact', fantasy";
    return "'Georgia', serif";
  };
  const fontFamily = getFontFamily();

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${businessName} - Fine Dining Experience</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <nav class="navbar">
        <div class="container">
            <div class="logo">${businessName}</div>
            <ul class="nav-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#menu">Menu</a></li>
                <li><a href="#reservations">Reservations</a></li>
                <li><a href="#gallery">Gallery</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </div>
    </nav>

    <section id="home" class="hero">
        <div class="hero-content">
            <h1>${businessName}</h1>
            <p class="tagline">${tagline}</p>
            <button class="cta-button">Make a Reservation</button>
        </div>
    </section>

    <section id="menu" class="menu-section">
        <div class="container">
            <h2>Our Menu</h2>
            <div class="menu-grid">
                <div class="menu-item">
                    <h3>Appetizers</h3>
                    <p>Delicious starters to begin your culinary journey</p>
                </div>
                <div class="menu-item">
                    <h3>Main Course</h3>
                    <p>Expertly crafted dishes using the finest ingredients</p>
                </div>
                <div class="menu-item">
                    <h3>Desserts</h3>
                    <p>Sweet endings to perfect your dining experience</p>
                </div>
            </div>
        </div>
    </section>

    <section id="reservations" class="reservations">
        <div class="container">
            <h2>Make a Reservation</h2>
            <form id="reservation-form">
                <input type="text" placeholder="Your Name" required>
                <input type="email" placeholder="Your Email" required>
                <input type="tel" placeholder="Phone Number" required>
                <input type="date" required>
                <input type="time" required>
                <select required>
                    <option value="">Number of Guests</option>
                    <option value="1">1 Guest</option>
                    <option value="2">2 Guests</option>
                    <option value="3-4">3-4 Guests</option>
                    <option value="5+">5+ Guests</option>
                </select>
                <button type="submit">Book Now</button>
            </form>
        </div>
    </section>

    <footer>
        <div class="container">
            <p>&copy; 2024 ${businessName}. All rights reserved.</p>
            <p>123 Restaurant Street, City, State 12345 | (555) 123-4567</p>
        </div>
    </footer>

    <script src="script.js"></script>
</body>
</html>`;

  const css = `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: ${fontFamily};
    line-height: 1.6;
    color: ${textColor};
    background-color: ${bgColor};
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.navbar {
    background-color: ${isDark ? '#000' : '#fff'};
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

.logo {
    font-size: 1.8rem;
    font-weight: bold;
    color: ${primaryColor};
}

.nav-links {
    display: flex;
    list-style: none;
    gap: 2rem;
}

.nav-links a {
    text-decoration: none;
    color: ${textColor};
    transition: color 0.3s;
}

.nav-links a:hover {
    color: ${primaryColor};
}

.hero {
    height: 80vh;
    background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><rect fill="${isDark ? '#222' : '#ddd'}" width="1200" height="800"/></svg>');
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
}

.hero-content h1 {
    font-size: 4rem;
    margin-bottom: 1rem;
    color: #fff;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
}

.tagline {
    font-size: 1.5rem;
    margin-bottom: 2rem;
    color: #fff;
}

.cta-button {
    background-color: ${primaryColor};
    color: #fff;
    padding: 1rem 2rem;
    border: none;
    font-size: 1.1rem;
    cursor: pointer;
    transition: transform 0.3s, background-color 0.3s;
}

.cta-button:hover {
    transform: scale(1.05);
    background-color: ${accentColor};
}

.menu-section, .reservations {
    padding: 4rem 0;
}

h2 {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 3rem;
    color: ${primaryColor};
}

.menu-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.menu-item {
    padding: 2rem;
    border: 2px solid ${primaryColor};
    text-align: center;
    transition: border-color 0.3s;
}

.menu-item:hover {
    border-color: ${accentColor};
}

.menu-item h3 {
    color: ${primaryColor};
    margin-bottom: 1rem;
}

#reservation-form {
    max-width: 600px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

#reservation-form input,
#reservation-form select {
    padding: 0.8rem;
    border: 1px solid ${isDark ? '#444' : '#ccc'};
    background-color: ${isDark ? '#222' : '#fff'};
    color: ${textColor};
    font-size: 1rem;
}

#reservation-form button {
    background-color: ${primaryColor};
    color: #fff;
    padding: 1rem;
    border: none;
    font-size: 1.1rem;
    cursor: pointer;
    transition: background-color 0.3s;
}

#reservation-form button:hover {
    background-color: ${accentColor};
}

footer {
    background-color: ${isDark ? '#000' : '#333'};
    color: #fff;
    text-align: center;
    padding: 2rem 0;
    margin-top: 4rem;
}`;

  const js = `document.getElementById('reservation-form').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Thank you for your reservation! We will confirm shortly.');
    this.reset();
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});`;

  return { html, css, js };
}

function generateEcommerceSite(
  description: string,
  requirements?: WebsiteRequirements
): GeneratedWebsite {
  const { businessName, tagline, keywords } = extractKeywords(description);
  const isDark = keywords.includes('dark');

  const primaryColor =
    requirements?.primaryColor || (keywords.includes('elegant') ? '#8b5cf6' : '#3b82f6');
  const accentColor = requirements?.accentColor || '#06b6d4';
  const bgColor = isDark ? '#1a1a1a' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#1a1a1a';

  const getFontFamily = () => {
    if (!requirements?.fontStyle) return 'system-ui, -apple-system, sans-serif';
    if (requirements.fontStyle.includes('Sans-serif'))
      return 'system-ui, -apple-system, sans-serif';
    if (requirements.fontStyle.includes('Serif')) return "'Georgia', serif";
    if (requirements.fontStyle.includes('Monospace')) return "'Courier New', monospace";
    if (requirements.fontStyle.includes('Display')) return "'Impact', fantasy";
    return 'system-ui, -apple-system, sans-serif';
  };
  const fontFamily = getFontFamily();

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${businessName} - Online Store</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <nav class="navbar">
        <div class="container">
            <div class="logo">${businessName}</div>
            <div class="nav-actions">
                <a href="#products">Products</a>
                <a href="#cart" class="cart-btn">Cart (0)</a>
            </div>
        </div>
    </nav>

    <section class="hero">
        <div class="hero-content">
            <h1>Welcome to ${businessName}</h1>
            <p>${tagline}</p>
            <button class="cta-button">Shop Now</button>
        </div>
    </section>

    <section id="products" class="products-section">
        <div class="container">
            <h2>Featured Products</h2>
            <div class="product-grid">
                <div class="product-card">
                    <div class="product-image"></div>
                    <h3>Product 1</h3>
                    <p class="price">$99.99</p>
                    <button class="add-to-cart">Add to Cart</button>
                </div>
                <div class="product-card">
                    <div class="product-image"></div>
                    <h3>Product 2</h3>
                    <p class="price">$149.99</p>
                    <button class="add-to-cart">Add to Cart</button>
                </div>
                <div class="product-card">
                    <div class="product-image"></div>
                    <h3>Product 3</h3>
                    <p class="price">$79.99</p>
                    <button class="add-to-cart">Add to Cart</button>
                </div>
                <div class="product-card">
                    <div class="product-image"></div>
                    <h3>Product 4</h3>
                    <p class="price">$199.99</p>
                    <button class="add-to-cart">Add to Cart</button>
                </div>
            </div>
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

  const css = `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: ${fontFamily};
    line-height: 1.6;
    color: ${textColor};
    background-color: ${bgColor};
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.navbar {
    background-color: ${isDark ? '#000' : '#fff'};
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

.logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: ${primaryColor};
}

.nav-actions {
    display: flex;
    gap: 2rem;
}

.nav-actions a {
    text-decoration: none;
    color: ${textColor};
    transition: color 0.3s;
}

.nav-actions a:hover {
    color: ${accentColor};
}

.cart-btn {
    background-color: ${accentColor};
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 4px;
}

.hero {
    padding: 6rem 0;
    background: linear-gradient(135deg, ${accentColor}20, ${accentColor}10);
    text-align: center;
}

.hero-content h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.hero-content p {
    font-size: 1.2rem;
    margin-bottom: 2rem;
    opacity: 0.8;
}

.cta-button {
    background-color: ${accentColor};
    color: white;
    padding: 1rem 2rem;
    border: none;
    font-size: 1.1rem;
    cursor: pointer;
    border-radius: 4px;
}

.products-section {
    padding: 4rem 0;
}

h2 {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 3rem;
}

.product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
}

.product-card {
    border: 1px solid ${isDark ? '#333' : '#ddd'};
    padding: 1.5rem;
    border-radius: 8px;
    text-align: center;
}

.product-image {
    width: 100%;
    height: 200px;
    background: ${isDark ? '#333' : '#f0f0f0'};
    border-radius: 4px;
    margin-bottom: 1rem;
}

.product-card h3 {
    margin-bottom: 0.5rem;
}

.price {
    font-size: 1.5rem;
    color: ${accentColor};
    font-weight: bold;
    margin: 1rem 0;
}

.add-to-cart {
    background-color: ${accentColor};
    color: white;
    padding: 0.8rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    width: 100%;
}

footer {
    background-color: ${isDark ? '#000' : '#333'};
    color: #fff;
    text-align: center;
    padding: 2rem 0;
    margin-top: 4rem;
}`;

  const js = `let cart = [];

document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', function() {
        cart.push({ name: 'Product', price: 99.99 });
        updateCartCount();
        alert('Product added to cart!');
    });
});

function updateCartCount() {
    const cartBtn = document.querySelector('.cart-btn');
    if (cartBtn) {
        cartBtn.textContent = 'Cart (' + cart.length + ')';
    }
}

document.querySelector('.cta-button')?.addEventListener('click', function() {
    document.querySelector('#products')?.scrollIntoView({ behavior: 'smooth' });
});`;

  return { html, css, js };
}

function generatePortfolioSite(
  description: string,
  requirements?: WebsiteRequirements
): GeneratedWebsite {
  const { businessName, tagline, keywords } = extractKeywords(description);
  const isDark = keywords.includes('dark');

  const primaryColor =
    requirements?.primaryColor || (keywords.includes('elegant') ? '#a855f7' : '#06b6d4');
  const accentColor = requirements?.accentColor || '#f97316';
  const bgColor = isDark ? '#0a0a0a' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#1a1a1a';

  const getFontFamily = () => {
    if (!requirements?.fontStyle) return "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    if (requirements.fontStyle.includes('Sans-serif'))
      return "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    if (requirements.fontStyle.includes('Serif')) return "'Georgia', serif";
    if (requirements.fontStyle.includes('Monospace')) return "'Courier New', monospace";
    if (requirements.fontStyle.includes('Display')) return "'Impact', fantasy";
    return "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
  };
  const fontFamily = getFontFamily();

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${businessName} - Portfolio</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <nav class="navbar">
        <div class="container">
            <div class="logo">${businessName}</div>
            <ul class="nav-links">
                <li><a href="#about">About</a></li>
                <li><a href="#work">Work</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </div>
    </nav>

    <section id="hero" class="hero">
        <div class="hero-content">
            <h1>${businessName}</h1>
            <p class="subtitle">${tagline}</p>
            <div class="cta-buttons">
                <button class="cta-button primary">View Work</button>
                <button class="cta-button secondary">Get in Touch</button>
            </div>
        </div>
    </section>

    <section id="about" class="about-section">
        <div class="container">
            <h2>About Me</h2>
            <p>Passionate professional with expertise in creating exceptional digital experiences. 
            Specialized in delivering high-quality work that exceeds expectations.</p>
        </div>
    </section>

    <section id="work" class="work-section">
        <div class="container">
            <h2>My Work</h2>
            <div class="work-grid">
                <div class="work-item">
                    <div class="work-image"></div>
                    <h3>Project Alpha</h3>
                    <p>A comprehensive solution for modern challenges</p>
                </div>
                <div class="work-item">
                    <div class="work-image"></div>
                    <h3>Project Beta</h3>
                    <p>Innovative approach to complex problems</p>
                </div>
                <div class="work-item">
                    <div class="work-image"></div>
                    <h3>Project Gamma</h3>
                    <p>Creative design meets functionality</p>
                </div>
            </div>
        </div>
    </section>

    <section id="contact" class="contact-section">
        <div class="container">
            <h2>Let's Work Together</h2>
            <form id="contact-form">
                <input type="text" placeholder="Your Name" required>
                <input type="email" placeholder="Your Email" required>
                <textarea placeholder="Your Message" rows="5" required></textarea>
                <button type="submit">Send Message</button>
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

  const css = `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: ${fontFamily};
    line-height: 1.6;
    color: ${textColor};
    background-color: ${bgColor};
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.navbar {
    background-color: ${isDark ? '#000' : '#fff'};
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

.logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: ${primaryColor};
}

.nav-links {
    display: flex;
    list-style: none;
    gap: 2rem;
}

.nav-links a {
    text-decoration: none;
    color: ${textColor};
    transition: color 0.3s;
}

.nav-links a:hover {
    color: ${accentColor};
}

.hero {
    min-height: 80vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    background: linear-gradient(135deg, ${accentColor}20, transparent);
}

.hero-content h1 {
    font-size: 4rem;
    margin-bottom: 1rem;
}

.subtitle {
    font-size: 1.5rem;
    opacity: 0.8;
    margin-bottom: 2rem;
}

.cta-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
}

.cta-button {
    padding: 1rem 2rem;
    border: none;
    font-size: 1.1rem;
    cursor: pointer;
    border-radius: 4px;
}

.cta-button.primary {
    background-color: ${accentColor};
    color: white;
}

.cta-button.secondary {
    background-color: transparent;
    border: 2px solid ${accentColor};
    color: ${accentColor};
}

.about-section, .work-section, .contact-section {
    padding: 4rem 0;
}

h2 {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 3rem;
}

.work-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.work-item {
    text-align: center;
}

.work-image {
    width: 100%;
    height: 250px;
    background: ${isDark ? '#1a1a1a' : '#f0f0f0'};
    border-radius: 8px;
    margin-bottom: 1rem;
}

#contact-form {
    max-width: 600px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

#contact-form input,
#contact-form textarea {
    padding: 1rem;
    border: 1px solid ${isDark ? '#333' : '#ccc'};
    background-color: ${isDark ? '#1a1a1a' : '#fff'};
    color: ${textColor};
    border-radius: 4px;
}

#contact-form button {
    background-color: ${accentColor};
    color: white;
    padding: 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

footer {
    background-color: ${isDark ? '#000' : '#333'};
    color: #fff;
    text-align: center;
    padding: 2rem 0;
    margin-top: 4rem;
}`;

  const js = `document.getElementById('contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Thank you for your message! I will get back to you soon.');
    this.reset();
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

document.querySelector('.cta-button.primary')?.addEventListener('click', function() {
    document.querySelector('#work')?.scrollIntoView({ behavior: 'smooth' });
});`;

  return { html, css, js };
}

function generateBlogSite(
  description: string,
  requirements?: WebsiteRequirements
): GeneratedWebsite {
  const { businessName, tagline, keywords } = extractKeywords(description);
  const isDark = keywords.includes('dark');

  const primaryColor =
    requirements?.primaryColor || (keywords.includes('elegant') ? '#10b981' : '#14b8a6');
  const accentColor = requirements?.accentColor || '#8b5cf6';
  const bgColor = isDark ? '#121212' : '#ffffff';
  const textColor = isDark ? '#e0e0e0' : '#1a1a1a';

  const getFontFamily = () => {
    if (!requirements?.fontStyle) return "'Georgia', 'Times New Roman', serif";
    if (requirements.fontStyle.includes('Sans-serif'))
      return 'system-ui, -apple-system, sans-serif';
    if (requirements.fontStyle.includes('Serif')) return "'Georgia', 'Times New Roman', serif";
    if (requirements.fontStyle.includes('Monospace')) return "'Courier New', monospace";
    if (requirements.fontStyle.includes('Display')) return "'Impact', fantasy";
    return "'Georgia', 'Times New Roman', serif";
  };
  const fontFamily = getFontFamily();

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${businessName} - Blog</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header class="header">
        <div class="container">
            <div class="logo">${businessName}</div>
            <nav>
                <a href="#home">Home</a>
                <a href="#blog">Articles</a>
                <a href="#about">About</a>
            </nav>
        </div>
    </header>

    <section class="hero">
        <div class="container">
            <h1>${businessName}</h1>
            <p>${tagline}</p>
        </div>
    </section>

    <section id="blog" class="blog-section">
        <div class="container">
            <div class="articles-grid">
                <article class="article-card">
                    <div class="article-image"></div>
                    <div class="article-content">
                        <span class="article-date">November 8, 2024</span>
                        <h2>Getting Started with Web Development</h2>
                        <p>Learn the fundamentals of modern web development and how to build your first website...</p>
                        <a href="#" class="read-more">Read More →</a>
                    </div>
                </article>
                <article class="article-card">
                    <div class="article-image"></div>
                    <div class="article-content">
                        <span class="article-date">November 5, 2024</span>
                        <h2>Design Principles for Modern Websites</h2>
                        <p>Explore essential design principles that make websites both beautiful and functional...</p>
                        <a href="#" class="read-more">Read More →</a>
                    </div>
                </article>
                <article class="article-card">
                    <div class="article-image"></div>
                    <div class="article-content">
                        <span class="article-date">November 1, 2024</span>
                        <h2>The Future of Technology</h2>
                        <p>Discover emerging trends and technologies that will shape the future of digital experiences...</p>
                        <a href="#" class="read-more">Read More →</a>
                    </div>
                </article>
            </div>
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

  const css = `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: ${fontFamily};
    line-height: 1.8;
    color: ${textColor};
    background-color: ${bgColor};
}

.container {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 20px;
}

.header {
    background-color: ${isDark ? '#1a1a1a' : '#fff'};
    padding: 1.5rem 0;
    border-bottom: 1px solid ${isDark ? '#333' : '#e0e0e0'};
}

.header .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: ${primaryColor};
}

.header nav {
    display: flex;
    gap: 2rem;
}

.header nav a {
    text-decoration: none;
    color: ${textColor};
    transition: color 0.3s;
}

.header nav a:hover {
    color: ${primaryColor};
}

.hero {
    padding: 4rem 0 3rem;
    border-bottom: 1px solid ${isDark ? '#333' : '#e0e0e0'};
}

.hero h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.hero p {
    font-size: 1.2rem;
    opacity: 0.7;
}

.blog-section {
    padding: 4rem 0;
}

.articles-grid {
    display: flex;
    flex-direction: column;
    gap: 3rem;
}

.article-card {
    border-bottom: 1px solid ${isDark ? '#333' : '#e0e0e0'};
    padding-bottom: 2rem;
}

.article-image {
    width: 100%;
    height: 300px;
    background: ${isDark ? '#1a1a1a' : '#f5f5f5'};
    border-radius: 4px;
    margin-bottom: 1.5rem;
}

.article-content {
    padding: 0;
}

.article-date {
    font-size: 0.9rem;
    color: ${accentColor};
    margin-bottom: 0.5rem;
    display: block;
}

.article-content h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
}

.article-content p {
    margin-bottom: 1rem;
    opacity: 0.8;
}

.read-more {
    color: ${accentColor};
    text-decoration: none;
    font-weight: 600;
}

footer {
    background-color: ${isDark ? '#1a1a1a' : '#f5f5f5'};
    padding: 2rem 0;
    margin-top: 4rem;
    text-align: center;
    border-top: 1px solid ${isDark ? '#333' : '#e0e0e0'};
}`;

  const js = `document.querySelectorAll('.read-more').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        alert('This would open the full article. Add your routing logic here!');
    });
});`;

  return { html, css, js };
}

function generateLandingPage(
  description: string,
  requirements?: WebsiteRequirements
): GeneratedWebsite {
  const { businessName, tagline, keywords } = extractKeywords(description);
  const isDark = keywords.includes('dark');

  const primaryColor =
    requirements?.primaryColor || (keywords.includes('elegant') ? '#f59e0b' : '#f97316');
  const accentColor = requirements?.accentColor || '#06b6d4';
  const bgColor = isDark ? '#0f172a' : '#ffffff';
  const textColor = isDark ? '#f1f5f9' : '#1e293b';

  const getFontFamily = () => {
    if (!requirements?.fontStyle) return 'system-ui, -apple-system, sans-serif';
    if (requirements.fontStyle.includes('Sans-serif'))
      return 'system-ui, -apple-system, sans-serif';
    if (requirements.fontStyle.includes('Serif')) return "'Georgia', serif";
    if (requirements.fontStyle.includes('Monospace')) return "'Courier New', monospace";
    if (requirements.fontStyle.includes('Display')) return "'Impact', fantasy";
    return 'system-ui, -apple-system, sans-serif';
  };
  const fontFamily = getFontFamily();

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${businessName} - Transform Your Business</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <section class="hero">
        <div class="container">
            <h1>${businessName}</h1>
            <p class="tagline">${tagline}</p>
            <button class="cta-button">Get Started Now</button>
        </div>
    </section>

    <section class="features">
        <div class="container">
            <h2>Why Choose Us?</h2>
            <div class="features-grid">
                <div class="feature">
                    <h3>Fast & Reliable</h3>
                    <p>Lightning-fast performance that scales with your business needs</p>
                </div>
                <div class="feature">
                    <h3>Secure</h3>
                    <p>Enterprise-grade security to protect your valuable data</p>
                </div>
                <div class="feature">
                    <h3>Analytics</h3>
                    <p>Powerful insights to make data-driven decisions</p>
                </div>
            </div>
        </div>
    </section>

    <section class="cta-section">
        <div class="container">
            <h2>Ready to Get Started?</h2>
            <p>Join thousands of satisfied customers today</p>
            <form id="signup-form">
                <input type="email" placeholder="Enter your email" required>
                <button type="submit">Sign Up Free</button>
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

  const css = `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: ${fontFamily};
    line-height: 1.6;
    color: ${textColor};
    background-color: ${bgColor};
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.hero {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    background: linear-gradient(135deg, ${primaryColor}20, transparent);
}

.hero h1 {
    font-size: 4.5rem;
    margin-bottom: 1rem;
    font-weight: 900;
}

.tagline {
    font-size: 1.5rem;
    margin-bottom: 2rem;
    opacity: 0.8;
}

.cta-button {
    background-color: ${accentColor};
    color: white;
    padding: 1.2rem 3rem;
    border: none;
    font-size: 1.2rem;
    font-weight: bold;
    cursor: pointer;
    border-radius: 50px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    transition: transform 0.2s;
}

.cta-button:hover {
    transform: translateY(-2px);
}

.features {
    padding: 6rem 0;
}

.features h2 {
    text-align: center;
    font-size: 3rem;
    margin-bottom: 4rem;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 3rem;
}

.feature {
    text-align: center;
    padding: 2rem;
}

.feature h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: ${accentColor};
}

.cta-section {
    padding: 6rem 0;
    background: ${isDark ? '#1e293b' : '#f8fafc'};
    text-align: center;
}

.cta-section h2 {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.cta-section p {
    font-size: 1.2rem;
    margin-bottom: 2rem;
    opacity: 0.8;
}

#signup-form {
    display: flex;
    gap: 1rem;
    max-width: 500px;
    margin: 0 auto;
    justify-content: center;
}

#signup-form input {
    flex: 1;
    padding: 1rem 1.5rem;
    border: 2px solid ${isDark ? '#334155' : '#e2e8f0'};
    background-color: ${isDark ? '#0f172a' : '#fff'};
    color: ${textColor};
    border-radius: 50px;
    font-size: 1rem;
}

#signup-form button {
    background-color: ${accentColor};
    color: white;
    padding: 1rem 2rem;
    border: none;
    border-radius: 50px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
}

footer {
    background-color: ${isDark ? '#000' : '#1e293b'};
    color: #fff;
    text-align: center;
    padding: 2rem 0;
}`;

  const js = `document.getElementById('signup-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = this.querySelector('input[type="email"]').value;
    alert('Thanks for signing up with ' + email + '! Check your inbox for next steps.');
    this.reset();
});

document.querySelector('.cta-button').addEventListener('click', function() {
    document.querySelector('.cta-section').scrollIntoView({ behavior: 'smooth' });
});`;

  return { html, css, js };
}

function generateSaaSSite(
  description: string,
  requirements?: WebsiteRequirements
): GeneratedWebsite {
  const { businessName, tagline, keywords } = extractKeywords(description);
  const isDark = keywords.includes('dark');

  const primaryColor =
    requirements?.primaryColor || (keywords.includes('elegant') ? '#6366f1' : '#8b5cf6');
  const accentColor = requirements?.accentColor || '#f97316';
  const bgColor = isDark ? '#0a0a0a' : '#ffffff';
  const textColor = isDark ? '#f5f5f5' : '#171717';

  const getFontFamily = () => {
    if (!requirements?.fontStyle)
      return "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    if (requirements.fontStyle.includes('Sans-serif'))
      return "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    if (requirements.fontStyle.includes('Serif')) return "'Georgia', serif";
    if (requirements.fontStyle.includes('Monospace')) return "'Courier New', monospace";
    if (requirements.fontStyle.includes('Display')) return "'Impact', fantasy";
    return "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  };
  const fontFamily = getFontFamily();

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${businessName} - SaaS Platform</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <nav class="navbar">
        <div class="container">
            <div class="logo">${businessName}</div>
            <div class="nav-links">
                <a href="#features">Features</a>
                <a href="#pricing">Pricing</a>
                <button class="nav-cta">Start Free Trial</button>
            </div>
        </div>
    </nav>

    <section class="hero">
        <div class="container">
            <h1>${businessName}</h1>
            <p class="tagline">${tagline}</p>
            <button class="cta-button">Try It Free for 14 Days</button>
            <p class="cta-note">No credit card required</p>
        </div>
    </section>

    <section id="features" class="features">
        <div class="container">
            <h2>Powerful Features</h2>
            <div class="features-grid">
                <div class="feature-card">
                    <h3>Collaboration Tools</h3>
                    <p>Work seamlessly with your team in real-time</p>
                </div>
                <div class="feature-card">
                    <h3>Advanced Analytics</h3>
                    <p>Get insights that drive your business forward</p>
                </div>
                <div class="feature-card">
                    <h3>API Access</h3>
                    <p>Integrate with your existing workflow</p>
                </div>
                <div class="feature-card">
                    <h3>24/7 Support</h3>
                    <p>Expert help whenever you need it</p>
                </div>
            </div>
        </div>
    </section>

    <section id="pricing" class="pricing">
        <div class="container">
            <h2>Simple, Transparent Pricing</h2>
            <div class="pricing-grid">
                <div class="pricing-card">
                    <h3>Starter</h3>
                    <div class="price">$29<span>/mo</span></div>
                    <ul>
                        <li>Up to 5 users</li>
                        <li>10GB storage</li>
                        <li>Email support</li>
                    </ul>
                    <button class="pricing-button">Get Started</button>
                </div>
                <div class="pricing-card featured">
                    <div class="badge">Popular</div>
                    <h3>Professional</h3>
                    <div class="price">$99<span>/mo</span></div>
                    <ul>
                        <li>Up to 20 users</li>
                        <li>100GB storage</li>
                        <li>Priority support</li>
                        <li>Advanced analytics</li>
                    </ul>
                    <button class="pricing-button">Get Started</button>
                </div>
                <div class="pricing-card">
                    <h3>Enterprise</h3>
                    <div class="price">Custom</div>
                    <ul>
                        <li>Unlimited users</li>
                        <li>Unlimited storage</li>
                        <li>24/7 phone support</li>
                        <li>Custom integrations</li>
                    </ul>
                    <button class="pricing-button">Contact Sales</button>
                </div>
            </div>
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

  const css = `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: ${fontFamily};
    line-height: 1.6;
    color: ${textColor};
    background-color: ${bgColor};
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.navbar {
    background-color: ${isDark ? '#000' : '#fff'};
    padding: 1rem 0;
    position: sticky;
    top: 0;
    z-index: 100;
    border-bottom: 1px solid ${isDark ? '#222' : '#e5e7eb'};
}

.navbar .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: ${primaryColor};
}

.nav-links {
    display: flex;
    gap: 2rem;
    align-items: center;
}

.nav-links a {
    text-decoration: none;
    color: ${textColor};
}

.nav-cta {
    background-color: ${accentColor};
    color: white;
    padding: 0.6rem 1.5rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
}

.hero {
    padding: 6rem 0;
    text-align: center;
}

.hero h1 {
    font-size: 4rem;
    margin-bottom: 1rem;
}

.tagline {
    font-size: 1.3rem;
    opacity: 0.7;
    margin-bottom: 2rem;
}

.cta-button {
    background-color: ${accentColor};
    color: white;
    padding: 1rem 2.5rem;
    border: none;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    border-radius: 8px;
}

.cta-note {
    margin-top: 1rem;
    font-size: 0.9rem;
    opacity: 0.6;
}

.features, .pricing {
    padding: 5rem 0;
}

h2 {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 3rem;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
}

.feature-card {
    padding: 2rem;
    border: 1px solid ${isDark ? '#222' : '#e5e7eb'};
    border-radius: 8px;
}

.feature-card h3 {
    color: ${accentColor};
    margin-bottom: 1rem;
}

.pricing-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    max-width: 1000px;
    margin: 0 auto;
}

.pricing-card {
    padding: 2rem;
    border: 2px solid ${isDark ? '#222' : '#e5e7eb'};
    border-radius: 12px;
    text-align: center;
    position: relative;
}

.pricing-card.featured {
    border-color: ${accentColor};
    transform: scale(1.05);
}

.badge {
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    background-color: ${accentColor};
    color: white;
    padding: 0.3rem 1rem;
    border-radius: 20px;
    font-size: 0.85rem;
}

.price {
    font-size: 3rem;
    font-weight: bold;
    margin: 1rem 0;
}

.price span {
    font-size: 1.2rem;
    opacity: 0.6;
}

.pricing-card ul {
    list-style: none;
    margin: 2rem 0;
}

.pricing-card li {
    padding: 0.5rem 0;
}

.pricing-button {
    background-color: ${accentColor};
    color: white;
    padding: 0.8rem 2rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    width: 100%;
}

footer {
    background-color: ${isDark ? '#000' : '#111'};
    color: #fff;
    text-align: center;
    padding: 2rem 0;
    margin-top: 4rem;
}`;

  const js = `document.querySelectorAll('.pricing-button').forEach(button => {
    button.addEventListener('click', function() {
        const plan = this.closest('.pricing-card').querySelector('h3').textContent;
        alert('Starting signup for ' + plan + ' plan!');
    });
});

document.querySelector('.nav-cta')?.addEventListener('click', function() {
    document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' });
});

document.querySelector('.cta-button')?.addEventListener('click', function() {
    document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' });
});`;

  return { html, css, js };
}

function generateCustomSite(
  description: string,
  requirements?: WebsiteRequirements
): GeneratedWebsite {
  const { businessName, tagline } = extractKeywords(description);

  const primaryColor = requirements?.primaryColor || '#667eea';
  const accentColor = requirements?.accentColor || '#764ba2';

  const getFontFamily = () => {
    if (!requirements?.fontStyle) return 'system-ui, sans-serif';
    if (requirements.fontStyle.includes('Sans-serif')) return 'system-ui, sans-serif';
    if (requirements.fontStyle.includes('Serif')) return "'Georgia', serif";
    if (requirements.fontStyle.includes('Monospace')) return "'Courier New', monospace";
    if (requirements.fontStyle.includes('Display')) return "'Impact', fantasy";
    return 'system-ui, sans-serif';
  };
  const fontFamily = getFontFamily();

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${businessName}</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <h1>${businessName}</h1>
        <p>${tagline}</p>
    </header>

    <main>
        <section class="content">
            <h2>Welcome</h2>
            <p>This is a custom website tailored to your needs. Modify it to fit your vision!</p>
        </section>
    </main>

    <footer>
        <p>&copy; 2024 ${businessName}</p>
    </footer>

    <script src="script.js"></script>
</body>
</html>`;

  const css = `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: ${fontFamily};
    line-height: 1.6;
    color: #333;
    background-color: #fff;
}

header {
    background: linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%);
    color: white;
    text-align: center;
    padding: 4rem 2rem;
}

header h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
}

main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 3rem 2rem;
}

.content {
    text-align: center;
}

.content h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
}

footer {
    background-color: #333;
    color: white;
    text-align: center;
    padding: 2rem;
    margin-top: 3rem;
}`;

  const js = `console.log('Custom website loaded successfully!');`;

  return { html, css, js };
}
