/**
 * UX Enhancements Service
 * Adds micro-animations, smooth transitions, and mobile optimizations
 */

/**
 * Generate micro-animations CSS
 */
export function generateMicroAnimationsCSS(): string {
  return `
/* Micro-Animations */
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

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Animation Classes */
.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}

.animate-slide-in-left {
  animation: slideInLeft 0.6s ease-out;
}

.animate-slide-in-right {
  animation: slideInRight 0.6s ease-out;
}

.animate-scale-in {
  animation: scaleIn 0.4s ease-out;
}

/* Scroll-triggered animations */
.fade-on-scroll {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.fade-on-scroll.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Button hover animations */
.btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.btn:hover::before {
  width: 300px;
  height: 300px;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.btn:active {
  transform: translateY(0);
}

/* Card hover animations */
.card-hover {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

/* Smooth page transitions */
.page-transition {
  animation: fadeIn 0.4s ease-out;
}

/* Loading skeleton animation */
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 0%,
    #f8f8f8 50%,
    #f0f0f0 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}

/* Parallax effect (lightweight) */
.parallax-container {
  position: relative;
  overflow: hidden;
}

.parallax-element {
  will-change: transform;
  transition: transform 0.1s ease-out;
}

/* Smooth scroll behavior */
html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
  `.trim();
}

/**
 * Generate scroll-triggered animation JavaScript
 */
export function generateScrollAnimationsScript(): string {
  return `
<script>
(function() {
  // Intersection Observer for scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all elements with fade-on-scroll class
  document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.fade-on-scroll');
    animatedElements.forEach(el => observer.observe(el));
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
})();
</script>
  `.trim();
}

/**
 * Generate mobile optimization CSS
 */
export function generateMobileOptimizationCSS(): string {
  return `
/* Mobile Optimization */
@media (max-width: 768px) {
  /* Touch target optimization - minimum 44px */
  a, button, input[type="button"], input[type="submit"] {
    min-height: 44px;
    min-width: 44px;
    padding: 0.75rem 1.5rem;
  }

  /* Prevent text size adjustment on iOS */
  input, textarea, select {
    font-size: 16px !important;
  }

  /* Optimize tap highlights */
  a, button {
    -webkit-tap-highlight-color: rgba(59, 130, 246, 0.2);
    tap-highlight-color: rgba(59, 130, 246, 0.2);
  }

  /* Swipe-friendly navigation */
  .mobile-nav {
    touch-action: pan-y;
    -webkit-overflow-scrolling: touch;
  }

  /* Optimize images for mobile */
  img {
    max-width: 100%;
    height: auto;
  }

  /* Reduce animations on mobile for performance */
  .card-hover:hover {
    transform: none;
  }

  /* Mobile-specific spacing */
  section {
    padding: 3rem 1rem;
  }

  .container {
    padding: 0 1rem;
  }

  /* Mobile menu optimizations */
  .mobile-menu-toggle {
    display: block;
    width: 44px;
    height: 44px;
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
  }

  /* Optimize forms for mobile */
  .form-input {
    font-size: 16px; /* Prevents zoom on iOS */
    padding: 1rem;
    min-height: 48px;
  }

  /* Stack CTAs vertically on mobile */
  .cta-group {
    flex-direction: column;
  }

  .cta-group .btn {
    width: 100%;
  }
}

/* Tablet optimizations */
@media (min-width: 769px) and (max-width: 1024px) {
  .container {
    padding: 0 2rem;
  }

  section {
    padding: 4rem 2rem;
  }
}

/* Performance optimizations for mobile */
@media (max-width: 768px) {
  /* Reduce box shadows on mobile */
  .card-hover,
  .feature-card,
  .service-card {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  /* Simplify gradients on mobile */
  .hero-gradient {
    background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
  }

  /* Disable parallax on mobile */
  .parallax-element {
    transform: none !important;
  }
}

/* Landscape mobile optimization */
@media (max-width: 768px) and (orientation: landscape) {
  .hero-modern {
    min-height: 70vh;
  }
}
  `.trim();
}

/**
 * Generate mobile menu JavaScript
 */
export function generateMobileMenuScript(): string {
  return `
<script>
(function() {
  // Mobile menu toggle
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const body = document.body;

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function() {
      const isOpen = mobileMenu.classList.contains('open');
      
      if (isOpen) {
        mobileMenu.classList.remove('open');
        body.style.overflow = '';
        menuToggle.setAttribute('aria-expanded', 'false');
      } else {
        mobileMenu.classList.add('open');
        body.style.overflow = 'hidden';
        menuToggle.setAttribute('aria-expanded', 'true');
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
      if (!mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        mobileMenu.classList.remove('open');
        body.style.overflow = '';
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        mobileMenu.classList.remove('open');
        body.style.overflow = '';
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.focus();
      }
    });
  }

  // Swipe gestures for mobile navigation (optional)
  let touchStartX = 0;
  let touchEndX = 0;

  document.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
  });

  document.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swipe left - could open menu
      } else {
        // Swipe right - could close menu
        if (mobileMenu && mobileMenu.classList.contains('open')) {
          mobileMenu.classList.remove('open');
          body.style.overflow = '';
          if (menuToggle) {
            menuToggle.setAttribute('aria-expanded', 'false');
          }
        }
      }
    }
  }
})();
</script>
  `.trim();
}

/**
 * Add accessibility enhancements
 */
export function generateAccessibilityEnhancements(): string {
  return `
<script>
(function() {
  // Skip to main content link
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.className = 'skip-to-main';
  skipLink.textContent = 'Skip to main content';
  skipLink.style.cssText = 'position: absolute; top: -40px; left: 0; background: #000; color: #fff; padding: 8px; z-index: 100; text-decoration: none;';
  skipLink.addEventListener('focus', function() {
    this.style.top = '0';
  });
  skipLink.addEventListener('blur', function() {
    this.style.top = '-40px';
  });
  document.body.insertBefore(skipLink, document.body.firstChild);

  // Add main content ID if not present
  const main = document.querySelector('main');
  if (main && !main.id) {
    main.id = 'main-content';
  }

  // Keyboard navigation enhancements
  document.addEventListener('keydown', function(e) {
    // Close modals/popups on Escape
    if (e.key === 'Escape') {
      const modals = document.querySelectorAll('[role="dialog"]');
      modals.forEach(modal => {
        if (modal.classList.contains('open') || modal.style.display !== 'none') {
          modal.style.display = 'none';
          modal.classList.remove('open');
          // Return focus to trigger element if available
          const trigger = document.activeElement;
          if (trigger) trigger.focus();
        }
      });
    }
  });

  // Focus management for dynamic content
  const focusableElements = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
  
  function trapFocus(element) {
    const focusable = Array.from(element.querySelectorAll(focusableElements));
    const firstFocusable = focusable[0];
    const lastFocusable = focusable[focusable.length - 1];

    element.addEventListener('keydown', function(e) {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
          }
        }
      }
    });
  }

  // Apply focus trap to modals
  document.querySelectorAll('[role="dialog"]').forEach(modal => {
    trapFocus(modal);
  });
})();
</script>

<style>
/* Accessibility enhancements */
.skip-to-main:focus {
  top: 0 !important;
}

/* Focus indicators */
*:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Screen reader only content */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  * {
    border-color: currentColor !important;
  }
  
  .btn {
    border: 2px solid currentColor;
  }
}
</style>
  `.trim();
}

/**
 * Comprehensive UX enhancements
 */
export function applyUXEnhancements(html: string): string {
  let enhanced = html;

  // Add scroll animation classes to sections
  enhanced = enhanced.replace(
    /<section([^>]*?)>/gi,
    '<section$1 class="fade-on-scroll">'
  );

  // Add page transition class to body
  enhanced = enhanced.replace(
    '<body',
    '<body class="page-transition"'
  );

  // Add scroll animations script
  const scrollAnimations = generateScrollAnimationsScript();
  enhanced = enhanced.replace('</body>', `${scrollAnimations}\n</body>`);

  // Add mobile menu script
  const mobileMenuScript = generateMobileMenuScript();
  enhanced = enhanced.replace('</body>', `${mobileMenuScript}\n</body>`);

  // Add accessibility enhancements
  const accessibilityScript = generateAccessibilityEnhancements();
  enhanced = enhanced.replace('</body>', `${accessibilityScript}\n</body>`);

  return enhanced;
}

