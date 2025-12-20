/**
 * GSAP Animation Service - 120% Feature
 * Generates professional animations for generated websites
 * Supports scroll-triggered animations, entrance effects, and micro-interactions
 */

export interface AnimationConfig {
  type: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale' | 'rotate' | 'bounce';
  duration?: number;
  delay?: number;
  easing?: string;
  trigger?: 'scroll' | 'hover' | 'click' | 'load';
  target?: string; // CSS selector
}

export interface ScrollAnimationConfig extends AnimationConfig {
  trigger: 'scroll';
  scrollOffset?: number; // Percentage of viewport
  once?: boolean; // Animate only once
}

/**
 * Generate GSAP animation JavaScript code
 */
export function generateGSAPAnimation(config: AnimationConfig): string {
  const {
    type,
    duration = 1,
    delay = 0,
    easing = 'power2.out',
    trigger = 'load',
    target = '.animate-on-scroll',
  } = config;

  // Animation properties based on type
  const animations: Record<string, { from: string; to: string }> = {
    fadeIn: {
      from: '{ opacity: 0 }',
      to: '{ opacity: 1 }',
    },
    slideUp: {
      from: '{ opacity: 0, y: 50 }',
      to: '{ opacity: 1, y: 0 }',
    },
    slideDown: {
      from: '{ opacity: 0, y: -50 }',
      to: '{ opacity: 1, y: 0 }',
    },
    slideLeft: {
      from: '{ opacity: 0, x: 50 }',
      to: '{ opacity: 1, x: 0 }',
    },
    slideRight: {
      from: '{ opacity: 0, x: -50 }',
      to: '{ opacity: 1, x: 0 }',
    },
    scale: {
      from: '{ opacity: 0, scale: 0.8 }',
      to: '{ opacity: 1, scale: 1 }',
    },
    rotate: {
      from: '{ opacity: 0, rotation: -180 }',
      to: '{ opacity: 1, rotation: 0 }',
    },
    bounce: {
      from: '{ opacity: 0, y: 50 }',
      to: '{ opacity: 1, y: 0, ease: "bounce.out" }',
    },
  };

  const animation = animations[type] || animations.fadeIn;

  if (trigger === 'scroll') {
    const scrollConfig = config as ScrollAnimationConfig;
    const scrollOffset = scrollConfig.scrollOffset || 80;
    const once = scrollConfig.once !== false;

    return `
      // GSAP Scroll Animation: ${type}
      gsap.registerPlugin(ScrollTrigger);
      
      gsap.fromTo("${target}", 
        ${animation.from},
        {
          ${animation.to},
          duration: ${duration},
          delay: ${delay},
          ease: "${easing}",
          scrollTrigger: {
            trigger: "${target}",
            start: "top ${scrollOffset}%",
            toggleActions: "play none none none",
            ${once ? 'once: true,' : ''}
          }
        }
      );
    `;
  }

  if (trigger === 'hover') {
    return `
      // GSAP Hover Animation: ${type}
      const element = document.querySelector("${target}");
      if (element) {
        const tl = gsap.timeline({ paused: true });
        tl.to(element, {
          ${animation.to},
          duration: ${duration},
          ease: "${easing}"
        });
        
        element.addEventListener('mouseenter', () => tl.play());
        element.addEventListener('mouseleave', () => tl.reverse());
      }
    `;
  }

  if (trigger === 'click') {
    return `
      // GSAP Click Animation: ${type}
      const element = document.querySelector("${target}");
      if (element) {
        element.addEventListener('click', () => {
          gsap.fromTo(element,
            ${animation.from},
            {
              ${animation.to},
              duration: ${duration},
              delay: ${delay},
              ease: "${easing}"
            }
          );
        });
      }
    `;
  }

  // Default: load animation
  return `
    // GSAP Load Animation: ${type}
    gsap.fromTo("${target}",
      ${animation.from},
      {
        ${animation.to},
        duration: ${duration},
        delay: ${delay},
        ease: "${easing}"
      }
    );
  `;
}

/**
 * Generate complete GSAP setup with ScrollTrigger
 */
export function generateGSAPSetup(): string {
  return `
    // GSAP Core + ScrollTrigger
    // Include in HTML: <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
    // Include in HTML: <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
    
    // Register ScrollTrigger plugin
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }
  `;
}

/**
 * Generate animation for hero section
 */
export function generateHeroAnimation(): string {
  return generateGSAPAnimation({
    type: 'fadeIn',
    duration: 1.2,
    delay: 0.2,
    easing: 'power3.out',
    trigger: 'load',
    target: '.hero-section',
  });
}

/**
 * Generate scroll animations for sections
 */
export function generateSectionAnimations(): string {
  return `
    // Animate sections on scroll
    ${generateGSAPAnimation({
      type: 'slideUp',
      duration: 0.8,
      delay: 0,
      easing: 'power2.out',
      trigger: 'scroll',
      target: '.section',
    })}
    
    // Animate cards on scroll
    ${generateGSAPAnimation({
      type: 'fadeIn',
      duration: 0.6,
      delay: 0.1,
      easing: 'power2.out',
      trigger: 'scroll',
      target: '.card, .feature-card',
    })}
  `;
}

/**
 * Generate complete GSAP animation bundle for a website
 */
export function generateGSAPAnimationBundle(): string {
  return `
    ${generateGSAPSetup()}
    
    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', () => {
      ${generateHeroAnimation()}
      ${generateSectionAnimations()}
      
      // Smooth scroll for anchor links
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
          e.preventDefault();
          const target = document.querySelector(this.getAttribute('href'));
          if (target) {
            gsap.to(window, {
              duration: 1,
              scrollTo: { y: target, offsetY: 80 },
              ease: "power2.inOut"
            });
          }
        });
      });
    });
  `;
}

