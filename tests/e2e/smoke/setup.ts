/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SMOKE TEST SETUP - Shared Utilities, Fixtures, and Helpers
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * This file provides common utilities used across all 18 smoke test files.
 * Import from this file to get consistent test helpers and page objects.
 */

import { test as base, expect, Page, Locator } from '@playwright/test';

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

export const BASE_URL = 'http://localhost:5000';

export const ROUTES = {
  // Public pages
  home: '/',
  onboarding: '/onboarding',
  contact: '/contact',
  pricing: '/pricing',

  // Merlin 8.0 flow
  merlinPackages: '/merlin8/packages',
  merlinBuildChoice: '/merlin8',
  merlinTemplates: '/merlin8/templates',
  merlinTemplatesFree: '/merlin8/templates?type=free',
  merlinTemplatesPremium: '/merlin8/templates?type=premium',
  merlinIntake: '/merlin8/create',
  merlinGenerating: '/merlin8/generating',
  merlinProfessional: '/merlin8/professional',

  // IDE/Dashboard
  stargateWebsites: '/stargate-websites',
  projects: '/projects',
  templates: '/templates',
  settings: '/settings',
  ide: '/ide',
  services: '/services',
  apps: '/apps',
  deployments: '/deployments',
  admin: '/admin',

  // 404
  notFound: '/this-page-does-not-exist-404',
} as const;

export const VIEWPORTS = {
  mobile: { width: 375, height: 812 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 800 },
  desktopLarge: { width: 1920, height: 1080 },
} as const;

export const TIMEOUTS = {
  fast: 2000,
  normal: 5000,
  slow: 10000,
  navigation: 15000,
  generation: 120000,
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// TEST DATA
// ═══════════════════════════════════════════════════════════════════════════════

export const testData = {
  business: {
    name: 'Smoke Test Company',
    nameWithTimestamp: () => `Smoke Test ${Date.now().toString().slice(-6)}`,
    description: 'A test company for automated smoke testing of the Merlin website generator.',
    phone: '0825550123',
    email: 'smoke@test.com',
    address: '123 Test Street, Smoke City',
    hours: 'Mon-Fri 9am-5pm',
  },

  contact: {
    name: 'John Smoke',
    email: 'john@smoketest.com',
    phone: '0825551234',
    company: 'Smoke Testing Inc',
    website: 'https://smoketest.com',
    description: 'This is a test submission from the automated smoke tests.',
  },

  user: {
    email: 'testuser@smoketest.com',
    password: 'Test1234!',
    username: 'smoketester',
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// CUSTOM TEST FIXTURE
// ═══════════════════════════════════════════════════════════════════════════════

type SmokeTestFixtures = {
  smokeHelpers: SmokeHelpers;
};

class SmokeHelpers {
  constructor(private page: Page) {}

  /**
   * Navigate to a route and wait for it to load
   */
  async goto(route: keyof typeof ROUTES | string) {
    const url = route.startsWith('/') ? route : ROUTES[route as keyof typeof ROUTES];
    await this.page.goto(`${BASE_URL}${url}`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Wait for page to be fully loaded (no pending requests)
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if element is visible with timeout
   */
  async isVisible(selector: string, timeout = TIMEOUTS.normal): Promise<boolean> {
    try {
      await this.page.locator(selector).waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for element and click it
   */
  async clickWhenReady(selector: string, timeout = TIMEOUTS.normal) {
    const element = this.page.locator(selector);
    await element.waitFor({ state: 'visible', timeout });
    await element.click();
  }

  /**
   * Fill an input field
   */
  async fillInput(selector: string, value: string) {
    const input = this.page.locator(selector);
    await input.waitFor({ state: 'visible' });
    await input.fill(value);
  }

  /**
   * Select option from dropdown
   */
  async selectOption(selector: string, value: string) {
    await this.page.locator(selector).click();
    await this.page.getByRole('option', { name: value }).click();
  }

  /**
   * Check if URL matches expected route
   */
  async expectRoute(route: keyof typeof ROUTES | string) {
    const expectedPath = route.startsWith('/') ? route : ROUTES[route as keyof typeof ROUTES];
    await expect(this.page).toHaveURL(new RegExp(expectedPath.replace(/[?&]/g, '\\$&')));
  }

  /**
   * Take a screenshot for visual regression
   */
  async screenshot(name: string, options?: { fullPage?: boolean }) {
    await expect(this.page).toHaveScreenshot(`${name}.png`, {
      fullPage: options?.fullPage ?? false,
      maxDiffPixelRatio: 0.05,
    });
  }

  /**
   * Scroll to element
   */
  async scrollTo(selector: string) {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
  }

  /**
   * Check for console errors
   */
  async expectNoConsoleErrors() {
    const errors: string[] = [];
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Wait a bit for any async errors
    await this.page.waitForTimeout(500);

    expect(errors.filter(e => !e.includes('favicon'))).toEqual([]);
  }

  /**
   * Check accessibility basics
   */
  async checkBasicAccessibility() {
    // Check for alt text on images
    const images = await this.page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt, 'Image should have alt text').not.toBeNull();
    }

    // Check for form labels
    const inputs = await this.page.locator('input:not([type="hidden"])').all();
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      if (id) {
        const label = this.page.locator(`label[for="${id}"]`);
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');

        const hasLabel = await label.count() > 0 || ariaLabel || ariaLabelledBy;
        expect(hasLabel, `Input ${id} should have a label`).toBeTruthy();
      }
    }
  }

  /**
   * Set viewport size
   */
  async setViewport(viewport: keyof typeof VIEWPORTS) {
    await this.page.setViewportSize(VIEWPORTS[viewport]);
  }

  /**
   * Wait for animation to complete
   */
  async waitForAnimation(selector: string, timeout = 500) {
    await this.page.locator(selector).waitFor({ state: 'visible' });
    await this.page.waitForTimeout(timeout);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXTENDED TEST WITH FIXTURES
// ═══════════════════════════════════════════════════════════════════════════════

export const test = base.extend<SmokeTestFixtures>({
  smokeHelpers: async ({ page }, use) => {
    await use(new SmokeHelpers(page));
  },
});

export { expect };

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE OBJECT HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Common selectors used across tests
 */
export const selectors = {
  // Navigation
  navbar: '[data-testid="navbar"], nav, header',
  sidebar: '[data-testid="sidebar"], aside',
  logo: '[data-testid="logo"], .logo, [class*="logo"]',

  // Buttons
  button: 'button',
  primaryButton: 'button[class*="primary"], button[class*="bg-blue"]',
  bypassButton: 'button:has-text("Bypass"), [title*="Bypass"]',
  backButton: 'button:has-text("Back"), [data-testid="back-button"]',

  // Forms
  input: 'input',
  textInput: 'input[type="text"], input:not([type])',
  emailInput: 'input[type="email"]',
  passwordInput: 'input[type="password"]',
  textarea: 'textarea',
  select: 'select, [role="combobox"]',
  checkbox: 'input[type="checkbox"], [role="checkbox"]',
  radio: 'input[type="radio"], [role="radio"]',

  // UI Components
  dialog: '[role="dialog"]',
  modal: '[role="dialog"], .modal, [class*="dialog"]',
  toast: '[role="alert"], .toast, [class*="toast"]',
  tooltip: '[role="tooltip"]',
  dropdown: '[role="listbox"], [role="menu"]',
  tab: '[role="tab"]',
  tabPanel: '[role="tabpanel"]',

  // Loading states
  spinner: '.spinner, [class*="spinner"], [class*="loading"], .animate-spin',
  skeleton: '.skeleton, [class*="skeleton"]',
  progressBar: '[role="progressbar"], progress',

  // Cards
  card: '.card, [class*="card"]',

  // Messages
  error: '.error, [class*="error"], [class*="destructive"]',
  success: '.success, [class*="success"]',
  warning: '.warning, [class*="warning"]',

  // Merlin specific
  stepIndicator: '[class*="step"], .step-indicator',
  templateCard: '[class*="template"], .template-card',
  previewIframe: 'iframe[src*="website_projects"]',
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// ASSERTION HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Assert element is visible and has expected text
 */
export async function expectText(page: Page, selector: string, text: string | RegExp) {
  const element = page.locator(selector);
  await expect(element).toBeVisible();
  await expect(element).toHaveText(text);
}

/**
 * Assert element exists and is enabled
 */
export async function expectEnabled(page: Page, selector: string) {
  const element = page.locator(selector);
  await expect(element).toBeVisible();
  await expect(element).toBeEnabled();
}

/**
 * Assert element is disabled
 */
export async function expectDisabled(page: Page, selector: string) {
  const element = page.locator(selector);
  await expect(element).toBeVisible();
  await expect(element).toBeDisabled();
}

/**
 * Assert page has no console errors (excluding common false positives)
 */
export async function expectNoErrors(page: Page) {
  const errors: string[] = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Ignore common false positives
      if (!text.includes('favicon') &&
          !text.includes('net::ERR') &&
          !text.includes('DevTools')) {
        errors.push(text);
      }
    }
  });

  expect(errors).toEqual([]);
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTERACTION HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Click and wait for navigation
 */
export async function clickAndWaitForNavigation(page: Page, selector: string) {
  await Promise.all([
    page.waitForNavigation(),
    page.locator(selector).click(),
  ]);
}

/**
 * Fill form and submit
 */
export async function fillAndSubmit(
  page: Page,
  fields: Record<string, string>,
  submitSelector = 'button[type="submit"]'
) {
  for (const [selector, value] of Object.entries(fields)) {
    await page.locator(selector).fill(value);
  }
  await page.locator(submitSelector).click();
}

/**
 * Wait for element to disappear
 */
export async function waitForHidden(page: Page, selector: string, timeout = TIMEOUTS.normal) {
  await page.locator(selector).waitFor({ state: 'hidden', timeout });
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL REGRESSION HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Take screenshot with consistent settings
 */
export async function takeScreenshot(page: Page, name: string, options?: {
  fullPage?: boolean;
  mask?: Locator[];
}) {
  await expect(page).toHaveScreenshot(`${name}.png`, {
    fullPage: options?.fullPage ?? false,
    mask: options?.mask ?? [],
    maxDiffPixelRatio: 0.05,
    threshold: 0.2,
  });
}

/**
 * Mask dynamic content for screenshots
 */
export async function maskDynamicContent(page: Page) {
  // Mask timestamps, dates, and other dynamic content
  const dynamicSelectors = [
    '[data-testid="time"]',
    '[class*="timestamp"]',
    '[class*="date"]',
  ];

  return dynamicSelectors
    .map(sel => page.locator(sel))
    .filter(async loc => await loc.count() > 0);
}
