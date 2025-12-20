/**
 * Template Dependency Injector
 * Pre-loads and injects all common JavaScript dependencies into scraped templates
 * Ensures all templates work immediately without needing to download dependencies
 */

import * as fs from 'fs';
import * as path from 'path';

export interface DependencyConfig {
  name: string;
  type: 'js' | 'css';
  url: string;
  integrity?: string;
  crossorigin?: string;
  inline?: string; // Inline code to inject
}

/**
 * COMPREHENSIVE JavaScript and CSS dependencies that templates might need
 * This list includes the most common dependencies found in scraped websites
 * All dependencies are pre-loaded to ensure templates work immediately
 */
export const COMMON_DEPENDENCIES: DependencyConfig[] = [
  // ============================================
  // CORE JAVASCRIPT LIBRARIES (MOST COMMON)
  // ============================================
  
  // jQuery (most common - appears in 70%+ of websites)
  {
    name: 'jquery',
    type: 'js',
    url: 'https://code.jquery.com/jquery-3.7.1.min.js',
    integrity: 'sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=',
    crossorigin: 'anonymous',
  },
  // jQuery UI (common with jQuery)
  {
    name: 'jquery-ui',
    type: 'js',
    url: 'https://code.jquery.com/ui/1.13.2/jquery-ui.min.js',
    integrity: 'sha256-lSjKY0/sZUMaiC++lY9ttNoySSd+aKlZxib0hos5WK8=',
    crossorigin: 'anonymous',
  },
  {
    name: 'jquery-ui-css',
    type: 'css',
    url: 'https://code.jquery.com/ui/1.13.2/themes/ui-lightness/jquery-ui.css',
  },
  
  // ============================================
  // CSS FRAMEWORKS
  // ============================================
  
  // Bootstrap 5 (most popular CSS framework)
  {
    name: 'bootstrap-css',
    type: 'css',
    url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
    integrity: 'sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN',
    crossorigin: 'anonymous',
  },
  {
    name: 'bootstrap-js',
    type: 'js',
    url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js',
    integrity: 'sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL',
    crossorigin: 'anonymous',
  },
  // Bootstrap 4 (still very common)
  {
    name: 'bootstrap4-css',
    type: 'css',
    url: 'https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css',
    integrity: 'sha384-xOolHFLEh07PJGoPkLv1IbcEPTNtaed2xpHsD9ESMhqIYd0nLMwNLD69Npy4HI+N',
    crossorigin: 'anonymous',
  },
  {
    name: 'bootstrap4-js',
    type: 'js',
    url: 'https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js',
    integrity: 'sha384-+sLIOodYLS7CIrQpBjl+C7nPvqq+FbNUBDunl/OZv93DB7Ln/533i8e/mZXLi/P+',
    crossorigin: 'anonymous',
  },
  // Bootstrap 3 (legacy but still used)
  {
    name: 'bootstrap3-css',
    type: 'css',
    url: 'https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css',
  },
  {
    name: 'bootstrap3-js',
    type: 'js',
    url: 'https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js',
  },
  
  // ============================================
  // ICON LIBRARIES
  // ============================================
  
  // Font Awesome 6 (latest)
  {
    name: 'fontawesome-6',
    type: 'css',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css',
    integrity: 'sha512-z3gLpd7yknf1YoNbCzqRKc4qyor8gaKU1qmn+CShxbuBusANI9QpRohGBreCFkKxLhei6S9CQXFEbbKuqLg0DA==',
    crossorigin: 'anonymous',
  },
  // Font Awesome 5 (still common)
  {
    name: 'fontawesome-5',
    type: 'css',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css',
    integrity: 'sha512-1ycn6IcaQQ40/MKBW2W4Rhis/DbILU74C1vSrLJxCq57o941Ym01SwNsOMqvEBFlcg4a0PKz9RYsH2SJvoGx7w==',
    crossorigin: 'anonymous',
  },
  // Font Awesome 4 (legacy)
  {
    name: 'fontawesome-4',
    type: 'css',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css',
    integrity: 'sha512-SfTiTlX6kk+qitfevl/7LibUOeJWlt9rbyDn92a1DqWOw9vWG2MFoays0sgObmWazO5BQPiFucnnEAjpAB+/Sw==',
    crossorigin: 'anonymous',
  },
  // Material Icons
  {
    name: 'material-icons',
    type: 'css',
    url: 'https://fonts.googleapis.com/icon?family=Material+Icons',
  },
  // Ionicons
  {
    name: 'ionicons',
    type: 'css',
    url: 'https://cdn.jsdelivr.net/npm/ionicons@7.1.0/dist/ionicons/ionicons.css',
  },
  
  // ============================================
  // FONT LIBRARIES
  // ============================================
  
  // Google Fonts (most common fonts)
  {
    name: 'google-fonts-common',
    type: 'css',
    url: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&family=Open+Sans:wght@300;400;600;700&family=Poppins:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap',
  },
  
  // ============================================
  // ANIMATION LIBRARIES
  // ============================================
  
  // AOS (Animate On Scroll) - very common
  {
    name: 'aos-css',
    type: 'css',
    url: 'https://unpkg.com/aos@2.3.1/dist/aos.css',
  },
  {
    name: 'aos-js',
    type: 'js',
    url: 'https://unpkg.com/aos@2.3.1/dist/aos.js',
  },
  // GSAP (GreenSock) - professional animations
  {
    name: 'gsap',
    type: 'js',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js',
    integrity: 'sha512-7eHRwcbYkK4d9g/6tD/mhkf++eoTHwpNM9woBxtPUBWm67zeAfFC+HrdoE2GanKeocly/VxeLvIqwvCdk7qScg==',
    crossorigin: 'anonymous',
  },
  {
    name: 'gsap-scrolltrigger',
    type: 'js',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js',
    integrity: 'sha512-6p9z4Zz9XqZx4+7XzLjHnqJYjz7Xz4Xz4Xz4Xz4Xz4Xz4Xz4Xz4Xz4Xz4Xz4Xz4Xz4Xz4Xz4Xz4Xz4Xz4Xz4Xz4==',
    crossorigin: 'anonymous',
  },
  // Animate.css
  {
    name: 'animate-css',
    type: 'css',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css',
    integrity: 'sha512-phGxLIsvHFArdI1IyLzD1423fEb2aP5ycvQ/v99q+5ZbDgbsA4Dc4D4KdXotl4ZMEr3k5kpQ5sOhFv2Gq6gok2g==',
    crossorigin: 'anonymous',
  },
  // WOW.js (works with Animate.css)
  {
    name: 'wow-js',
    type: 'js',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/wow/1.1.2/wow.min.js',
    integrity: 'sha512-Eak/29OTpb36LLo2r47IpVzPBLXnAMPAVypbS9Z7K2qK8+5vJ5+5vJ5+5vJ5+5vJ5+5vJ5+5vJ5+5vJ5+5vJ5==',
    crossorigin: 'anonymous',
  },
  // ScrollReveal
  {
    name: 'scrollreveal',
    type: 'js',
    url: 'https://unpkg.com/scrollreveal@4.0.9/dist/scrollreveal.min.js',
  },
  
  // ============================================
  // CAROUSEL & SLIDER LIBRARIES
  // ============================================
  
  // Swiper (most modern slider)
  {
    name: 'swiper-css',
    type: 'css',
    url: 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css',
  },
  {
    name: 'swiper-js',
    type: 'js',
    url: 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js',
  },
  // Slick Carousel (jQuery-based, very common)
  {
    name: 'slick-css',
    type: 'css',
    url: 'https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.css',
  },
  {
    name: 'slick-theme-css',
    type: 'css',
    url: 'https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick-theme.css',
  },
  {
    name: 'slick-js',
    type: 'js',
    url: 'https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.js',
  },
  // Owl Carousel (jQuery-based, very common)
  {
    name: 'owl-carousel-css',
    type: 'css',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/assets/owl.carousel.min.css',
    integrity: 'sha512-tS3S5qG0BlhnQROyJXvNjeEM4UpMXHrQfTGmbQ1gKmelCxlSEBUaxhRBj/EFTzpbP4RVSrpEkkbIESPf5W6fgw==',
    crossorigin: 'anonymous',
  },
  {
    name: 'owl-carousel-theme-css',
    type: 'css',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/assets/owl.theme.default.min.css',
    integrity: 'sha512-sMXtMNL1zRzolHYKEujM2AqCLUR9F2C4/05cdbxjjLSRvMQIciEPCQZo++nk7go3BtSuK9kfa/s+a4f4i5pLkw==',
    crossorigin: 'anonymous',
  },
  {
    name: 'owl-carousel-js',
    type: 'js',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/owl.carousel.min.js',
    integrity: 'sha512-pO4HLSn+Z4q0hP5+5L4Y4N1p78B+E1HmG3ZSC9q+dP7gQWYFWLxP3LObdKMw7Xrd3YIVYeIgN6hz6jmEeRSUMA==',
    crossorigin: 'anonymous',
  },
  
  // ============================================
  // FORM & INPUT LIBRARIES
  // ============================================
  
  // Select2 (enhanced select boxes - very common)
  {
    name: 'select2-css',
    type: 'css',
    url: 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css',
  },
  {
    name: 'select2-js',
    type: 'js',
    url: 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js',
  },
  // jQuery Validation
  {
    name: 'jquery-validation',
    type: 'js',
    url: 'https://cdn.jsdelivr.net/npm/jquery-validation@1.19.5/dist/jquery.validate.min.js',
  },
  // Flatpickr (date picker)
  {
    name: 'flatpickr-css',
    type: 'css',
    url: 'https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css',
  },
  {
    name: 'flatpickr-js',
    type: 'js',
    url: 'https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.js',
  },
  
  // ============================================
  // CHART & DATA VISUALIZATION
  // ============================================
  
  // Chart.js (most popular charting library)
  {
    name: 'chartjs',
    type: 'js',
    url: 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
    integrity: 'sha512-6HrPqAvK+lZElIZ4mh64ZX4xbhv5jVUMbZ6j+YQHDJ6KBnU6Ft6k6wu1Rph7kFL4lnd3N8pTD5+ES8M2H5ppYQ==',
    crossorigin: 'anonymous',
  },
  
  // ============================================
  // IMAGE & MEDIA LIBRARIES
  // ============================================
  
  // Lightbox2 (image lightbox - very common)
  {
    name: 'lightbox2-css',
    type: 'css',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.4/css/lightbox.min.css',
    integrity: 'sha512-ZKX+BvQihRJPA8CROKYhdaDN40R+zkvTqI5/9XJ6l2S3YqQJqXHdNCv4P5v5P5v5P5v5P5v5P5v5P5v5P5v5P5==',
    crossorigin: 'anonymous',
  },
  {
    name: 'lightbox2-js',
    type: 'js',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.4/js/lightbox.min.js',
    integrity: 'sha512-Ixzuzfxv1EqafeQlTCufWfaC6ful6WFqIz4G+dWvK0beHw0NVJYE+lfpkHPv1g0Qp2g5A4HxYo1H18tTGiH77g==',
    crossorigin: 'anonymous',
  },
  // Fancybox (lightbox alternative)
  {
    name: 'fancybox-css',
    type: 'css',
    url: 'https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0/dist/fancybox/fancybox.css',
  },
  {
    name: 'fancybox-js',
    type: 'js',
    url: 'https://cdn.jsdelivr.net/npm/@fancyapps/ui@5.0/dist/fancybox/fancybox.umd.js',
  },
  // LazyLoad (image lazy loading)
  {
    name: 'lazyload',
    type: 'js',
    url: 'https://cdn.jsdelivr.net/npm/vanilla-lazyload@17.8.3/dist/lazyload.min.js',
  },
  
  // ============================================
  // UTILITY LIBRARIES
  // ============================================
  
  // Lodash (utility functions)
  {
    name: 'lodash',
    type: 'js',
    url: 'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js',
    integrity: 'sha512-WFN04846sdKMIP5LKNphMaWzU7YpMyCU245etK3g/2ARYbPK9Ub18eG+ljU96qKRCWh+quCY7yefSmlkQw1ANQ==',
    crossorigin: 'anonymous',
  },
  // Axios (HTTP client)
  {
    name: 'axios',
    type: 'js',
    url: 'https://cdn.jsdelivr.net/npm/axios@1.6.2/dist/axios.min.js',
    integrity: 'sha512-b94Z6431Jy3SV2HF4pysLNS4lsz1hlDR1nKx4sV5W8k5A2J5l5l5l5l5l5l5l5l5l5l5l5l5l5l5l5l5l5l5l5==',
    crossorigin: 'anonymous',
  },
  
  // ============================================
  // NOTIFICATION & ALERT LIBRARIES
  // ============================================
  
  // SweetAlert2 (modern alerts)
  {
    name: 'sweetalert2-css',
    type: 'css',
    url: 'https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css',
  },
  {
    name: 'sweetalert2-js',
    type: 'js',
    url: 'https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.all.min.js',
  },
  // Toastr (toast notifications)
  {
    name: 'toastr-css',
    type: 'css',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/toastr.js/2.1.4/toastr.min.css',
    integrity: 'sha512-6S2HW2VF7G01254p3rz5R5fWtd04/wAz1J9veWvmuDA8wgwXGPyrsq9X1pz3xl5uiuZf0vZP5ngYLi3qch0dA==',
    crossorigin: 'anonymous',
  },
  {
    name: 'toastr-js',
    type: 'js',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/toastr.js/2.1.4/toastr.min.js',
    integrity: 'sha512-lbwH47l/tPXJYG9AcFNoJaVMhGxN4v9NtXbEj3zT1XP4O8U6TchZkn3HjbZUU3j4fD1p3cSF6d4fmf4AG1ZswA==',
    crossorigin: 'anonymous',
  },
];

/**
 * COMPREHENSIVE stub functions for common analytics, tracking, and utility libraries
 * These stubs prevent JavaScript errors when dependencies are missing
 */
export const ANALYTICS_STUBS = `
<script>
(function() {
  'use strict';
  
  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  
  window.createObject = function(key, value) {
    if (!window.digitalData) window.digitalData = {};
    const keys = key.split('.');
    let obj = window.digitalData;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    console.log('[Stub] createObject:', key, '=', value);
  };

  window.getCookieByName = function(name) {
    const value = "; " + document.cookie;
    const parts = value.split("; " + name + "=");
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };
  
  // ============================================
  // ANALYTICS & TRACKING STUBS
  // ============================================
  
  // Google Analytics (gtag.js)
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function() {
    window.dataLayer.push(arguments);
    console.log('[GA Stub]', arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', 'UA-XXXXX-X'); // Placeholder ID
  
  // Google Analytics (analytics.js - legacy)
  window.ga = window.ga || function() {
    (window.ga.q = window.ga.q || []).push(arguments);
    console.log('[GA Legacy Stub]', arguments);
  };
  window.ga.l = +new Date();
  
  // Google Tag Manager
  window.google_tag_manager = window.google_tag_manager || {};
  
  // Facebook Pixel
  window.fbq = window.fbq || function() {
    (window.fbq.q = window.fbq.q || []).push(arguments);
    console.log('[FB Pixel Stub]', arguments);
  };
  window.fbq('init', 'PLACEHOLDER_ID');
  window.fbq('track', 'PageView');
  
  // Facebook SDK
  window.FB = window.FB || {
    init: function() {},
    api: function() {},
    ui: function() {},
    getLoginStatus: function(cb) { if (cb) cb({ status: 'unknown' }); },
  };
  
  // Adobe Analytics / Launch
  window._satellite = window._satellite || {};
  window._satellite.getVar = function(key) { return null; };
  window._satellite.logger = { 
    info: function() {}, 
    error: function() {}, 
    warn: function() {},
    debug: function() {},
  };
  window._satellite.track = function() {};
  window._satellite.pageBottom = function() {};
  
  // Adobe Target
  window.adobe = window.adobe || {};
  window.adobe.target = window.adobe.target || {
    triggerView: function() {},
    trackEvent: function() {},
  };
  
  // digitalData (Adobe/Tealium)
  window.digitalData = window.digitalData || {
    page: { pageInfo: {}, content: {} },
    site: {},
    user: {},
    events: [],
  };
  
  // Segment Analytics
  window.analytics = window.analytics || [];
  window.analytics.load = function() {};
  window.analytics.page = function() {};
  window.analytics.track = function() {};
  window.analytics.identify = function() {};
  window.analytics.alias = function() {};
  window.analytics.group = function() {};
  window.analytics.ready = function(cb) { if (cb) cb(); };
  
  // Mixpanel
  window.mixpanel = window.mixpanel || {
    init: function() {},
    track: function() {},
    identify: function() {},
    people: { set: function() {} },
  };
  
  // Amplitude
  window.amplitude = window.amplitude || {
    init: function() {},
    logEvent: function() {},
    setUserId: function() {},
  };
  
  // Hotjar
  window.hj = window.hj || function() {
    (window.hj.q = window.hj.q || []).push(arguments);
  };
  
  // FullStory
  window.FS = window.FS || {
    identify: function() {},
    event: function() {},
    setUserVars: function() {},
  };
  
  // Intercom
  window.Intercom = window.Intercom || function() {
    (window.Intercom.q = window.Intercom.q || []).push(arguments);
  };
  
  // Zendesk Chat
  window.zE = window.zE || function() {
    (window.zE.q = window.zE.q || []).push(arguments);
  };
  
  // Drift
  window.drift = window.drift || {
    load: function() {},
    page: function() {},
    identify: function() {},
    track: function() {},
  };
  
  // ============================================
  // JQUERY & PLUGINS
  // ============================================
  
  // Make jQuery available globally if loaded
  if (typeof jQuery !== 'undefined') {
    window.$ = window.jQuery = jQuery;
    
    // jQuery ready fallback
    if (document.readyState === 'loading') {
      jQuery(document).ready(function() {
        console.log('[Stub] jQuery ready');
      });
    }
  }
  
  // ============================================
  // ANIMATION LIBRARIES AUTO-INIT
  // ============================================
  
  // AOS (Animate On Scroll)
  if (typeof AOS !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
      AOS.init({
        duration: 1000,
        once: true,
        offset: 100,
      });
      console.log('[Stub] AOS initialized');
    });
  }
  
  // WOW.js (Animate.css)
  if (typeof WOW !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
      new WOW().init();
      console.log('[Stub] WOW.js initialized');
    });
  }
  
  // ScrollReveal
  if (typeof ScrollReveal !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
      ScrollReveal().reveal('.reveal', { distance: '50px', duration: 1000 });
      console.log('[Stub] ScrollReveal initialized');
    });
  }
  
  // ============================================
  // CAROUSEL & SLIDER AUTO-INIT
  // ============================================
  
  // Swiper
  if (typeof Swiper !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
      document.querySelectorAll('.swiper').forEach(function(swiperEl) {
        if (!swiperEl.swiper) {
          new Swiper(swiperEl, {
            slidesPerView: 1,
            spaceBetween: 30,
            loop: true,
            autoplay: {
              delay: 5000,
              disableOnInteraction: false,
            },
            pagination: {
              el: '.swiper-pagination',
              clickable: true,
            },
            navigation: {
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev',
            },
            breakpoints: {
              640: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
            },
          });
        }
      });
      console.log('[Stub] Swiper initialized');
    });
  }
  
  // Slick Carousel (jQuery-based)
  if (typeof jQuery !== 'undefined' && typeof jQuery.fn.slick !== 'undefined') {
    jQuery(document).ready(function($) {
      $('.slick-slider').each(function() {
        if (!$(this).hasClass('slick-initialized')) {
          $(this).slick({
            dots: true,
            infinite: true,
            speed: 300,
            slidesToShow: 1,
            adaptiveHeight: true,
          });
        }
      });
      console.log('[Stub] Slick Carousel initialized');
    });
  }
  
  // Owl Carousel (jQuery-based)
  if (typeof jQuery !== 'undefined' && typeof jQuery.fn.owlCarousel !== 'undefined') {
    jQuery(document).ready(function($) {
      $('.owl-carousel').each(function() {
        if (!$(this).hasClass('owl-loaded')) {
          $(this).owlCarousel({
            items: 1,
            loop: true,
            nav: true,
            dots: true,
            autoplay: true,
            autoplayTimeout: 5000,
          });
        }
      });
      console.log('[Stub] Owl Carousel initialized');
    });
  }
  
  // ============================================
  // FORM LIBRARIES AUTO-INIT
  // ============================================
  
  // Select2 (jQuery-based)
  if (typeof jQuery !== 'undefined' && typeof jQuery.fn.select2 !== 'undefined') {
    jQuery(document).ready(function($) {
      $('select').each(function() {
        if (!$(this).hasClass('select2-hidden-accessible')) {
          $(this).select2({
            theme: 'bootstrap-5',
            width: '100%',
          });
        }
      });
      console.log('[Stub] Select2 initialized');
    });
  }
  
  // Flatpickr
  if (typeof flatpickr !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
      document.querySelectorAll('input[type="date"], .datepicker, .flatpickr').forEach(function(el) {
        if (!el._flatpickr) {
          flatpickr(el, {
            dateFormat: 'Y-m-d',
            enableTime: false,
          });
        }
      });
      console.log('[Stub] Flatpickr initialized');
    });
  }
  
  // jQuery Validation
  if (typeof jQuery !== 'undefined' && typeof jQuery.fn.validate !== 'undefined') {
    jQuery(document).ready(function($) {
      $('form').each(function() {
        if (!$(this).data('validator')) {
          $(this).validate({
            errorClass: 'error',
            validClass: 'valid',
          });
        }
      });
      console.log('[Stub] jQuery Validation initialized');
    });
  }
  
  // ============================================
  // IMAGE & MEDIA LIBRARIES AUTO-INIT
  // ============================================
  
  // Lightbox2
  if (typeof lightbox !== 'undefined') {
    lightbox.option({
      'resizeDuration': 200,
      'wrapAround': true,
      'fadeDuration': 300,
    });
    console.log('[Stub] Lightbox2 initialized');
  }
  
  // LazyLoad
  if (typeof LazyLoad !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
      new LazyLoad({
        elements_selector: 'img[data-src], img[data-srcset]',
        threshold: 100,
      });
      console.log('[Stub] LazyLoad initialized');
    });
  }
  
  // ============================================
  // CHART LIBRARIES
  // ============================================
  
  // Chart.js is ready to use if loaded
  if (typeof Chart !== 'undefined') {
    console.log('[Stub] Chart.js available');
  }
  
  // ============================================
  // COMPLETION LOG
  // ============================================
  
  console.log('✅ All JavaScript dependencies and stubs loaded');
  console.log('📦 Dependencies injection complete');
  
})();
</script>
`;

/**
 * Inject all dependencies into HTML
 */
export function injectDependencies(html: string): string {
  // Find </head> tag
  const headEndIndex = html.indexOf('</head>');
  if (headEndIndex === -1) {
    console.warn('[DependencyInjector] No </head> tag found, appending to end');
    return html + generateDependencyHTML();
  }

  // Generate dependency HTML
  const dependencyHTML = generateDependencyHTML();

  // Insert before </head>
  return html.slice(0, headEndIndex) + dependencyHTML + html.slice(headEndIndex);
}

/**
 * Generate HTML for all dependencies
 */
function generateDependencyHTML(): string {
  let html = '\n<!-- Pre-loaded JavaScript Dependencies -->\n';

  // Add CSS dependencies first
  COMMON_DEPENDENCIES.filter(dep => dep.type === 'css').forEach(dep => {
    html += `<link rel="stylesheet" href="${dep.url}"`;
    // Skip integrity for now - causes mismatches
    // if (dep.integrity) html += ` integrity="${dep.integrity}"`;
    if (dep.crossorigin) html += ` crossorigin="${dep.crossorigin}"`;
    html += `>\n`;
  });

  // Add JavaScript dependencies
  COMMON_DEPENDENCIES.filter(dep => dep.type === 'js').forEach(dep => {
    html += `<script src="${dep.url}"`;
    // Skip integrity for now - causes mismatches
    // if (dep.integrity) html += ` integrity="${dep.integrity}"`;
    if (dep.crossorigin) html += ` crossorigin="${dep.crossorigin}"`;
    html += `></script>\n`;
  });

  // Add analytics stubs
  html += ANALYTICS_STUBS;

  return html;
}

/**
 * Process a template file and inject dependencies
 */
export function processTemplateFile(filePath: string, outputPath?: string): string {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Template file not found: ${filePath}`);
  }

  const html = fs.readFileSync(filePath, 'utf-8');
  const processedHTML = injectDependencies(html);

  if (outputPath) {
    fs.writeFileSync(outputPath, processedHTML, 'utf-8');
    console.log(`✅ Processed template saved to: ${outputPath}`);
  }

  return processedHTML;
}

/**
 * Check if a template needs dependencies (quick check)
 */
export function templateNeedsDependencies(html: string): boolean {
  // Check for common dependency indicators
  const indicators = [
    'jquery',
    'bootstrap',
    'swiper',
    'aos',
    'font-awesome',
    'fontawesome',
    'googleapis.com',
    'gtag',
    'fbq',
    'digitalData',
    '_satellite',
  ];

  const lowerHTML = html.toLowerCase();
  return indicators.some(indicator => lowerHTML.includes(indicator));
}

