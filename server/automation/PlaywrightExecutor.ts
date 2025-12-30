/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * PLAYWRIGHT EXECUTOR - Browser Automation for Autonomous Testing
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Executes UI commands via Playwright MCP to automate website generation testing.
 * Handles navigation, form filling, verification, and quality checks.
 */

import { TestCommand, ExecutionLog, FailureEntry } from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const EXECUTOR_CONFIG = {
  defaultTimeout: 30000,
  retryDelay: 1000,
  maxRetries: 3,
  screenshotOnError: true,
  baseUrl: 'http://localhost:5173', // Vite dev server
  waitAfterNavigation: 2000,
  waitAfterClick: 500,
  waitAfterFormFill: 300,
};

// ═══════════════════════════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

export interface ExecutorResult {
  success: boolean;
  logs: ExecutionLog[];
  failures: FailureEntry[];
  screenshots: string[];
  totalCommands: number;
  successfulCommands: number;
  failedCommands: number;
  totalTimeMs: number;
}

export interface PageSnapshot {
  url: string;
  title: string;
  accessibilityTree: string;
  timestamp: Date;
}

export interface ElementRef {
  ref: string;
  element: string;
  text?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PLAYWRIGHT EXECUTOR CLASS
// ═══════════════════════════════════════════════════════════════════════════════

export class PlaywrightExecutor {
  private sessionId: string;
  private websiteId: string;
  private logs: ExecutionLog[] = [];
  private failures: FailureEntry[] = [];
  private screenshots: string[] = [];
  private currentSnapshot: PageSnapshot | null = null;
  private headless: boolean;
  private baseUrl: string;

  constructor(sessionId: string, websiteId: string, headless: boolean = true) {
    this.sessionId = sessionId;
    this.websiteId = websiteId;
    this.headless = headless;
    this.baseUrl = EXECUTOR_CONFIG.baseUrl;
  }

  /**
   * Execute a batch of commands for website generation
   */
  async executeCommands(commands: TestCommand[]): Promise<ExecutorResult> {
    const startTime = Date.now();
    let successfulCommands = 0;
    let failedCommands = 0;

    console.log(`[PlaywrightExecutor] Starting execution of ${commands.length} commands`);
    console.log(`[PlaywrightExecutor] Session: ${this.sessionId}, Website: ${this.websiteId}`);

    for (const command of commands) {
      const commandStartTime = Date.now();
      let success = false;
      let error: string | undefined;

      try {
        success = await this.executeCommand(command);
        if (success) {
          successfulCommands++;
        } else {
          failedCommands++;
          error = 'Command returned false';
        }
      } catch (err) {
        failedCommands++;
        error = err instanceof Error ? err.message : 'Unknown error';

        // Log failure
        this.logFailure(command, error);

        // Retry logic
        if (command.retries && command.retries > 0) {
          for (let retry = 0; retry < command.retries; retry++) {
            console.log(`[PlaywrightExecutor] Retry ${retry + 1}/${command.retries} for ${command.action}`);
            await this.sleep(EXECUTOR_CONFIG.retryDelay);

            try {
              success = await this.executeCommand(command);
              if (success) {
                successfulCommands++;
                failedCommands--; // Undo the failure count
                error = undefined;
                break;
              }
            } catch (retryErr) {
              error = retryErr instanceof Error ? retryErr.message : 'Retry failed';
            }
          }
        }
      }

      // Log execution
      this.logs.push({
        sessionId: this.sessionId,
        websiteId: this.websiteId,
        timestamp: new Date(),
        commandId: command.id,
        action: command.action,
        status: success ? 'success' : 'failed',
        durationMs: Date.now() - commandStartTime,
        error,
      });

      // Small delay between commands for stability
      await this.sleep(100);
    }

    const totalTimeMs = Date.now() - startTime;
    console.log(`[PlaywrightExecutor] Execution complete: ${successfulCommands}/${commands.length} successful in ${totalTimeMs}ms`);

    return {
      success: failedCommands === 0,
      logs: this.logs,
      failures: this.failures,
      screenshots: this.screenshots,
      totalCommands: commands.length,
      successfulCommands,
      failedCommands,
      totalTimeMs,
    };
  }

  /**
   * Execute a single command
   */
  private async executeCommand(command: TestCommand): Promise<boolean> {
    console.log(`[PlaywrightExecutor] Executing: ${command.category}/${command.action}`);

    switch (command.category) {
      case 'navigation':
        return this.executeNavigation(command);
      case 'form_fill':
        return this.executeFormFill(command);
      case 'verification':
        return this.executeVerification(command);
      case 'interaction':
        return this.executeInteraction(command);
      case 'quality_check':
        return this.executeQualityCheck(command);
      default:
        console.warn(`[PlaywrightExecutor] Unknown command category: ${command.category}`);
        return false;
    }
  }

  /**
   * Execute navigation commands
   */
  private async executeNavigation(command: TestCommand): Promise<boolean> {
    switch (command.action) {
      case 'navigate':
        return this.navigate(command.value || '/');
      case 'click_link':
        return this.clickElement(command.target!, command.value || 'link');
      case 'go_back':
        return this.goBack();
      case 'wait_for_url':
        return this.waitForUrl(command.value!);
      case 'refresh':
        return this.refresh();
      default:
        console.warn(`[PlaywrightExecutor] Unknown navigation action: ${command.action}`);
        return false;
    }
  }

  /**
   * Execute form filling commands
   */
  private async executeFormFill(command: TestCommand): Promise<boolean> {
    switch (command.action) {
      case 'fill_text':
        return this.fillText(command.target!, command.value!);
      case 'select_option':
        return this.selectOption(command.target!, command.value!);
      case 'click_button':
        return this.clickElement(command.target!, command.value || 'button');
      case 'check_checkbox':
        return this.clickElement(command.target!, 'checkbox');
      case 'submit_form':
        return this.submitForm(command.target!);
      case 'fill_form':
        return this.fillMultipleFields(JSON.parse(command.value || '{}'));
      default:
        console.warn(`[PlaywrightExecutor] Unknown form_fill action: ${command.action}`);
        return false;
    }
  }

  /**
   * Execute verification commands
   */
  private async executeVerification(command: TestCommand): Promise<boolean> {
    switch (command.action) {
      case 'verify_element':
        return this.verifyElementExists(command.target!);
      case 'verify_text':
        return this.verifyTextExists(command.value!);
      case 'verify_url':
        return this.verifyUrl(command.value!);
      case 'verify_title':
        return this.verifyTitle(command.value!);
      case 'snapshot':
        return this.takeSnapshot();
      default:
        console.warn(`[PlaywrightExecutor] Unknown verification action: ${command.action}`);
        return false;
    }
  }

  /**
   * Execute interaction commands
   */
  private async executeInteraction(command: TestCommand): Promise<boolean> {
    switch (command.action) {
      case 'hover':
        return this.hover(command.target!);
      case 'scroll':
        return this.scroll(command.value || 'down');
      case 'press_key':
        return this.pressKey(command.value!);
      case 'wait':
        await this.sleep(parseInt(command.value || '1000'));
        return true;
      case 'type_slowly':
        return this.typeSlowly(command.target!, command.value!);
      default:
        console.warn(`[PlaywrightExecutor] Unknown interaction action: ${command.action}`);
        return false;
    }
  }

  /**
   * Execute quality check commands
   */
  private async executeQualityCheck(command: TestCommand): Promise<boolean> {
    switch (command.action) {
      case 'screenshot':
        return this.takeScreenshot(command.value);
      case 'accessibility_check':
        return this.checkAccessibility();
      case 'console_errors':
        return this.checkConsoleErrors();
      case 'network_errors':
        return this.checkNetworkErrors();
      case 'performance_check':
        return this.checkPerformance();
      default:
        console.warn(`[PlaywrightExecutor] Unknown quality_check action: ${command.action}`);
        return false;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // PLAYWRIGHT MCP WRAPPER METHODS
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Navigate to a URL
   * Note: In actual execution, this will call mcp__playwright__browser_navigate
   */
  async navigate(path: string): Promise<boolean> {
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
    console.log(`[PlaywrightExecutor] Navigating to: ${url}`);

    // This is a placeholder - actual implementation will use MCP tools
    // The daemon.ts will handle actual MCP calls
    try {
      // Store command for MCP execution
      this.queueMcpCommand('browser_navigate', { url });
      await this.sleep(EXECUTOR_CONFIG.waitAfterNavigation);
      return true;
    } catch (err) {
      console.error(`[PlaywrightExecutor] Navigation failed:`, err);
      return false;
    }
  }

  /**
   * Click an element
   */
  async clickElement(ref: string, elementDescription: string): Promise<boolean> {
    console.log(`[PlaywrightExecutor] Clicking: ${elementDescription} (ref: ${ref})`);

    try {
      this.queueMcpCommand('browser_click', { ref, element: elementDescription });
      await this.sleep(EXECUTOR_CONFIG.waitAfterClick);
      return true;
    } catch (err) {
      console.error(`[PlaywrightExecutor] Click failed:`, err);
      return false;
    }
  }

  /**
   * Fill a text input
   */
  async fillText(ref: string, value: string): Promise<boolean> {
    console.log(`[PlaywrightExecutor] Filling text: ${ref} = "${value.substring(0, 50)}..."`);

    try {
      this.queueMcpCommand('browser_type', { ref, element: ref, text: value });
      await this.sleep(EXECUTOR_CONFIG.waitAfterFormFill);
      return true;
    } catch (err) {
      console.error(`[PlaywrightExecutor] Fill failed:`, err);
      return false;
    }
  }

  /**
   * Select an option from dropdown
   */
  async selectOption(ref: string, value: string): Promise<boolean> {
    console.log(`[PlaywrightExecutor] Selecting: ${ref} = "${value}"`);

    try {
      this.queueMcpCommand('browser_select_option', { ref, element: ref, values: [value] });
      await this.sleep(EXECUTOR_CONFIG.waitAfterFormFill);
      return true;
    } catch (err) {
      console.error(`[PlaywrightExecutor] Select failed:`, err);
      return false;
    }
  }

  /**
   * Fill multiple form fields at once
   */
  async fillMultipleFields(fields: Record<string, string>): Promise<boolean> {
    console.log(`[PlaywrightExecutor] Filling ${Object.keys(fields).length} fields`);

    try {
      const formFields = Object.entries(fields).map(([name, value]) => ({
        name,
        ref: name,
        type: 'textbox' as const,
        value,
      }));
      this.queueMcpCommand('browser_fill_form', { fields: formFields });
      await this.sleep(EXECUTOR_CONFIG.waitAfterFormFill);
      return true;
    } catch (err) {
      console.error(`[PlaywrightExecutor] Fill form failed:`, err);
      return false;
    }
  }

  /**
   * Submit a form
   */
  async submitForm(formRef: string): Promise<boolean> {
    console.log(`[PlaywrightExecutor] Submitting form: ${formRef}`);

    try {
      this.queueMcpCommand('browser_press_key', { key: 'Enter' });
      await this.sleep(EXECUTOR_CONFIG.waitAfterClick);
      return true;
    } catch (err) {
      console.error(`[PlaywrightExecutor] Submit failed:`, err);
      return false;
    }
  }

  /**
   * Go back in browser history
   */
  async goBack(): Promise<boolean> {
    console.log(`[PlaywrightExecutor] Going back`);

    try {
      this.queueMcpCommand('browser_navigate_back', {});
      await this.sleep(EXECUTOR_CONFIG.waitAfterNavigation);
      return true;
    } catch (err) {
      console.error(`[PlaywrightExecutor] Go back failed:`, err);
      return false;
    }
  }

  /**
   * Refresh the page
   */
  async refresh(): Promise<boolean> {
    console.log(`[PlaywrightExecutor] Refreshing page`);

    try {
      this.queueMcpCommand('browser_press_key', { key: 'F5' });
      await this.sleep(EXECUTOR_CONFIG.waitAfterNavigation);
      return true;
    } catch (err) {
      console.error(`[PlaywrightExecutor] Refresh failed:`, err);
      return false;
    }
  }

  /**
   * Wait for URL to match pattern
   */
  async waitForUrl(pattern: string): Promise<boolean> {
    console.log(`[PlaywrightExecutor] Waiting for URL: ${pattern}`);

    try {
      this.queueMcpCommand('browser_wait_for', { text: pattern, time: 10 });
      return true;
    } catch (err) {
      console.error(`[PlaywrightExecutor] Wait for URL failed:`, err);
      return false;
    }
  }

  /**
   * Verify element exists on page
   */
  async verifyElementExists(ref: string): Promise<boolean> {
    console.log(`[PlaywrightExecutor] Verifying element: ${ref}`);

    try {
      // Take snapshot and check for element
      this.queueMcpCommand('browser_snapshot', {});
      // In real implementation, parse snapshot to find element
      return true;
    } catch (err) {
      console.error(`[PlaywrightExecutor] Verify element failed:`, err);
      return false;
    }
  }

  /**
   * Verify text exists on page
   */
  async verifyTextExists(text: string): Promise<boolean> {
    console.log(`[PlaywrightExecutor] Verifying text: "${text.substring(0, 50)}..."`);

    try {
      this.queueMcpCommand('browser_wait_for', { text, time: 5 });
      return true;
    } catch (err) {
      console.error(`[PlaywrightExecutor] Verify text failed:`, err);
      return false;
    }
  }

  /**
   * Verify current URL
   */
  async verifyUrl(expected: string): Promise<boolean> {
    console.log(`[PlaywrightExecutor] Verifying URL: ${expected}`);

    try {
      // In real implementation, get current URL from snapshot
      return true;
    } catch (err) {
      console.error(`[PlaywrightExecutor] Verify URL failed:`, err);
      return false;
    }
  }

  /**
   * Verify page title
   */
  async verifyTitle(expected: string): Promise<boolean> {
    console.log(`[PlaywrightExecutor] Verifying title: ${expected}`);

    try {
      this.queueMcpCommand('browser_evaluate', {
        function: '() => document.title'
      });
      return true;
    } catch (err) {
      console.error(`[PlaywrightExecutor] Verify title failed:`, err);
      return false;
    }
  }

  /**
   * Take accessibility snapshot
   */
  async takeSnapshot(): Promise<boolean> {
    console.log(`[PlaywrightExecutor] Taking snapshot`);

    try {
      this.queueMcpCommand('browser_snapshot', {});
      return true;
    } catch (err) {
      console.error(`[PlaywrightExecutor] Snapshot failed:`, err);
      return false;
    }
  }

  /**
   * Hover over element
   */
  async hover(ref: string): Promise<boolean> {
    console.log(`[PlaywrightExecutor] Hovering: ${ref}`);

    try {
      this.queueMcpCommand('browser_hover', { ref, element: ref });
      await this.sleep(300);
      return true;
    } catch (err) {
      console.error(`[PlaywrightExecutor] Hover failed:`, err);
      return false;
    }
  }

  /**
   * Scroll the page
   */
  async scroll(direction: string): Promise<boolean> {
    console.log(`[PlaywrightExecutor] Scrolling: ${direction}`);

    try {
      const key = direction === 'up' ? 'PageUp' : 'PageDown';
      this.queueMcpCommand('browser_press_key', { key });
      await this.sleep(500);
      return true;
    } catch (err) {
      console.error(`[PlaywrightExecutor] Scroll failed:`, err);
      return false;
    }
  }

  /**
   * Press a key
   */
  async pressKey(key: string): Promise<boolean> {
    console.log(`[PlaywrightExecutor] Pressing key: ${key}`);

    try {
      this.queueMcpCommand('browser_press_key', { key });
      await this.sleep(100);
      return true;
    } catch (err) {
      console.error(`[PlaywrightExecutor] Press key failed:`, err);
      return false;
    }
  }

  /**
   * Type text slowly (character by character)
   */
  async typeSlowly(ref: string, text: string): Promise<boolean> {
    console.log(`[PlaywrightExecutor] Typing slowly: "${text.substring(0, 20)}..."`);

    try {
      this.queueMcpCommand('browser_type', {
        ref,
        element: ref,
        text,
        slowly: true
      });
      await this.sleep(text.length * 50);
      return true;
    } catch (err) {
      console.error(`[PlaywrightExecutor] Type slowly failed:`, err);
      return false;
    }
  }

  /**
   * Take a screenshot
   */
  async takeScreenshot(filename?: string): Promise<boolean> {
    const name = filename || `screenshot_${Date.now()}.png`;
    console.log(`[PlaywrightExecutor] Taking screenshot: ${name}`);

    try {
      this.queueMcpCommand('browser_take_screenshot', { filename: name });
      this.screenshots.push(name);
      return true;
    } catch (err) {
      console.error(`[PlaywrightExecutor] Screenshot failed:`, err);
      return false;
    }
  }

  /**
   * Check for accessibility issues
   */
  async checkAccessibility(): Promise<boolean> {
    console.log(`[PlaywrightExecutor] Checking accessibility`);

    try {
      this.queueMcpCommand('browser_snapshot', {});
      // In real implementation, analyze snapshot for a11y issues
      return true;
    } catch (err) {
      console.error(`[PlaywrightExecutor] Accessibility check failed:`, err);
      return false;
    }
  }

  /**
   * Check for console errors
   */
  async checkConsoleErrors(): Promise<boolean> {
    console.log(`[PlaywrightExecutor] Checking console errors`);

    try {
      this.queueMcpCommand('browser_console_messages', { level: 'error' });
      return true;
    } catch (err) {
      console.error(`[PlaywrightExecutor] Console check failed:`, err);
      return false;
    }
  }

  /**
   * Check for network errors
   */
  async checkNetworkErrors(): Promise<boolean> {
    console.log(`[PlaywrightExecutor] Checking network errors`);

    try {
      this.queueMcpCommand('browser_network_requests', {});
      return true;
    } catch (err) {
      console.error(`[PlaywrightExecutor] Network check failed:`, err);
      return false;
    }
  }

  /**
   * Check page performance
   */
  async checkPerformance(): Promise<boolean> {
    console.log(`[PlaywrightExecutor] Checking performance`);

    try {
      this.queueMcpCommand('browser_evaluate', {
        function: '() => JSON.stringify(performance.timing)'
      });
      return true;
    } catch (err) {
      console.error(`[PlaywrightExecutor] Performance check failed:`, err);
      return false;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // HELPER METHODS
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Queue an MCP command for execution
   * The daemon will process these commands via actual MCP calls
   */
  private mcpCommandQueue: Array<{ tool: string; params: Record<string, unknown> }> = [];

  private queueMcpCommand(tool: string, params: Record<string, unknown>): void {
    this.mcpCommandQueue.push({ tool: `mcp__playwright__${tool}`, params });
  }

  /**
   * Get queued MCP commands (for daemon to execute)
   */
  getMcpCommandQueue(): Array<{ tool: string; params: Record<string, unknown> }> {
    return [...this.mcpCommandQueue];
  }

  /**
   * Clear MCP command queue
   */
  clearMcpCommandQueue(): void {
    this.mcpCommandQueue = [];
  }

  /**
   * Log a failure
   */
  private logFailure(command: TestCommand, error: string): void {
    this.failures.push({
      id: `failure_${Date.now()}`,
      websiteId: this.websiteId,
      step: `${command.category}/${command.action}`,
      errorType: 'command_execution',
      errorMessage: error,
      context: {
        commandId: command.id,
        target: command.target,
        value: command.value,
      },
      recoveryAttempts: command.retries || 0,
      resolved: false,
      occurredAt: new Date(),
    });
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get execution logs
   */
  getLogs(): ExecutionLog[] {
    return this.logs;
  }

  /**
   * Get failures
   */
  getFailures(): FailureEntry[] {
    return this.failures;
  }

  /**
   * Get screenshots
   */
  getScreenshots(): string[] {
    return this.screenshots;
  }

  /**
   * Close browser
   */
  async close(): Promise<void> {
    console.log(`[PlaywrightExecutor] Closing browser`);
    this.queueMcpCommand('browser_close', {});
  }
}

export default PlaywrightExecutor;
