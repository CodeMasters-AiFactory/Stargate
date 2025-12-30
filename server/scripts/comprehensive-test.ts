/**
 * Comprehensive End-to-End Test
 * Tests all wizard features from beginning to end
 */

// Use native fetch if available (Node 18+), otherwise use node-fetch
export {}; // Make this a module to avoid global scope conflicts

interface FetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

interface FetchResponse {
  ok: boolean;
  status: number;
  json: () => Promise<Record<string, unknown>>;
}

// Initialize fetch function with proper async handling
const initializeFetch = async (): Promise<(url: string, options?: FetchOptions) => Promise<FetchResponse>> => {
  try {
    if (typeof globalThis.fetch === 'function') {
      return globalThis.fetch as (url: string, options?: FetchOptions) => Promise<FetchResponse>;
    } else {
      return (await import('node-fetch')).default as (url: string, options?: FetchOptions) => Promise<FetchResponse>;
    }
  } catch {
    // Fallback to http module if fetch not available
    const http = await import('http');
    return (url: string, options?: FetchOptions) => {
      return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const req = http.request({
          hostname: urlObj.hostname,
          port: urlObj.port || 80,
          path: urlObj.pathname + urlObj.search,
          method: options?.method || 'GET',
          headers: options?.headers || {},
        }, (res) => {
          let data = '';
          res.on('data', (chunk: unknown) => data += String(chunk));
          res.on('end', () => {
            resolve({
              ok: res.statusCode !== undefined && res.statusCode >= 200 && res.statusCode < 300,
              status: res.statusCode || 0,
              json: () => Promise.resolve(JSON.parse(data)),
            });
          });
        });
        req.on('error', reject);
        if (options?.body) req.write(options.body);
        req.end();
      });
    };
  }
};

let fetch: (url: string, options?: FetchOptions) => Promise<FetchResponse>;

const BASE_URL = 'http://localhost:5000';
const testResults: Array<{ test: string; status: 'pass' | 'fail' | 'error'; message: string }> = [];

function logTest(test: string, status: 'pass' | 'fail' | 'error', message = ''): void {
  const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
  console.log(`${icon} ${test}${message ? ': ' + message : ''}`);
  testResults.push({ test, status, message });
}

async function waitForServer(maxAttempts = 30): Promise<boolean> {
  console.log('\n🔍 Waiting for server to start...\n');
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`${BASE_URL}/api/health`);
      if (response.ok) {
        console.log('✅ Server is running\n');
        return true;
      }
    } catch (_error: unknown) {
      // Server not ready yet
    }
    await new Promise<void>((resolve) => setTimeout(resolve, 1000));
  }
  console.log('❌ Server did not start in time');
  return false;
}

async function testHealthEndpoint(): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    if (response.ok) {
      logTest('Health Endpoint', 'pass');
      return true;
    } else {
      logTest('Health Endpoint', 'fail', `Status: ${response.status}`);
      return false;
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logTest('Health Endpoint', 'error', message);
    return false;
  }
}

async function testTemplatesEndpoint(): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/api/templates?page=1&pageSize=20`);
    const data = await response.json() as { success?: boolean; templates?: unknown[] };

    if (data.success && Array.isArray(data.templates)) {
      logTest('Templates Endpoint', 'pass', `Found ${data.templates.length} templates`);
      return data.templates.length > 0;
    } else {
      logTest('Templates Endpoint', 'fail', 'No templates returned');
      return false;
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logTest('Templates Endpoint', 'error', message);
    return false;
  }
}

async function testDatabaseConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/api/admin/templates`);
    if (response.ok) {
      const _data = await response.json();
      logTest('Database Connection', 'pass', 'Database accessible');
      return true;
    } else {
      logTest('Database Connection', 'fail', `Status: ${response.status}`);
      return false;
    }
  } catch (_error: unknown) {
    logTest('Database Connection', 'error', 'Database may not be connected (using file-based templates)');
    return false;
  }
}

async function testWizardFeaturesEndpoints(): Promise<boolean> {
  const endpoints = [
    '/api/wizard/detect-keywords',
    '/api/wizard/seo-preview',
    '/api/wizard/versions/save',
  ];

  let allPassed = true;
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true }),
      });

      // 400 is OK (missing required params), 500 is bad
      if (response.status === 400) {
        logTest(`Wizard Feature: ${endpoint}`, 'pass', 'Endpoint exists');
      } else if (response.status === 500) {
        logTest(`Wizard Feature: ${endpoint}`, 'fail', 'Server error');
        allPassed = false;
      } else {
        logTest(`Wizard Feature: ${endpoint}`, 'pass', `Status: ${response.status}`);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      logTest(`Wizard Feature: ${endpoint}`, 'error', message);
      allPassed = false;
    }
  }

  return allPassed;
}

async function testTemplateLoading(): Promise<boolean> {
  try {
    // Test loading a template
    const response = await fetch(`${BASE_URL}/api/templates?page=1&pageSize=1`);
    const data = await response.json() as { success?: boolean; templates?: Array<{ id: string }> };

    if (data.success && data.templates && data.templates.length > 0) {
      const template = data.templates[0];
      const templateId = template.id;

      // Try to load template HTML
      const htmlResponse = await fetch(`${BASE_URL}/api/templates/${templateId}/html`);
      if (htmlResponse.ok) {
        logTest('Template Loading', 'pass', `Template ${templateId} loads successfully`);
        return true;
      } else {
        logTest('Template Loading', 'fail', `Cannot load HTML for template ${templateId}`);
        return false;
      }
    } else {
      logTest('Template Loading', 'fail', 'No templates available to test');
      return false;
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logTest('Template Loading', 'error', message);
    return false;
  }
}

async function runAllTests(): Promise<boolean> {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('🧪 COMPREHENSIVE END-TO-END TEST');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Wait for server
  const serverReady = await waitForServer();
  if (!serverReady) {
    console.log('\n❌ Cannot proceed - server not available');
    return false;
  }

  // Run tests
  await testHealthEndpoint();
  await testDatabaseConnection();
  await testTemplatesEndpoint();
  await testTemplateLoading();
  await testWizardFeaturesEndpoints();

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📊 TEST SUMMARY');
  console.log('═══════════════════════════════════════════════════════════\n');

  const passed = testResults.filter((r) => r.status === 'pass').length;
  const failed = testResults.filter((r) => r.status === 'fail').length;
  const errors = testResults.filter((r) => r.status === 'error').length;

  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Errors: ${errors}`);
  console.log(`📊 Total: ${testResults.length}\n`);

  if (failed > 0 || errors > 0) {
    console.log('Failed/Error Tests:');
    testResults.filter((r) => r.status !== 'pass').forEach((r) => {
      console.log(`  - ${r.test}: ${r.message}`);
    });
  }

  return failed === 0 && errors === 0;
}

// Initialize and run tests
(async (): Promise<void> => {
  try {
    fetch = await initializeFetch();
    const success = await runAllTests();
    process.exit(success ? 0 : 1);
  } catch (error: unknown) {
    console.error('Test runner error:', error);
    process.exit(1);
  }
})();

