/**
 * Comprehensive Test Suite
 * Tests all features end-to-end
 */

const TEST_ALL_BASE_URL = 'http://localhost:5000';

interface HttpOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

interface HttpResponse {
  ok: boolean;
  status: number | undefined;
  json: () => Promise<unknown>;
  text: () => Promise<string>;
}

async function testAllHttpRequest(url: string, options: HttpOptions = {}): Promise<HttpResponse> {
  const http = await import('http');
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const req = http.request({
      hostname: urlObj.hostname,
      port: urlObj.port || 5000,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    }, (res) => {
      let data = '';
      res.on('data', (chunk: Buffer) => data += chunk);
      res.on('end', () => {
        resolve({
          ok: res.statusCode !== undefined && res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          json: () => Promise.resolve(JSON.parse(data)),
          text: () => Promise.resolve(data),
        });
      });
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

const testAllResults: Array<{ test: string; status: 'pass' | 'fail' | 'error'; message: string }> = [];

function testAllLogTest(test: string, status: 'pass' | 'fail' | 'error', message: string = ''): void {
  const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
  console.log(`${icon} ${test}${message ? ': ' + message : ''}`);
  testAllResults.push({ test, status, message });
}

async function testAllWaitForServer(): Promise<boolean> {
  console.log('\n🔍 Waiting for server...\n');
  for (let i = 0; i < 30; i++) {
    try {
      const res = await testAllHttpRequest(`${TEST_ALL_BASE_URL}/api/health`);
      if (res.ok) {
        console.log('✅ Server is running\n');
        return true;
      }
    } catch (_error: unknown) {
      // Ignore errors and continue waiting
    }
    await new Promise((r: (value: unknown) => void) => setTimeout(r, 1000));
  }
  return false;
}

async function testAllHealth(): Promise<boolean> {
  try {
    const res = await testAllHttpRequest(`${TEST_ALL_BASE_URL}/api/health`);
    if (res.ok) {
      testAllLogTest('Health Endpoint', 'pass');
      return true;
    }
    testAllLogTest('Health Endpoint', 'fail', `Status: ${res.status}`);
    return false;
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    testAllLogTest('Health Endpoint', 'error', message);
    return false;
  }
}

async function testAllTemplates(): Promise<boolean> {
  try {
    const res = await testAllHttpRequest(`${TEST_ALL_BASE_URL}/api/templates?page=1&pageSize=5`);
    const data = await res.json() as { success?: boolean; templates?: unknown[] };
    if (data.success && Array.isArray(data.templates)) {
      testAllLogTest('Templates API', 'pass', `${data.templates.length} templates found`);
      return data.templates.length > 0;
    }
    testAllLogTest('Templates API', 'fail', 'No templates returned');
    return false;
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    testAllLogTest('Templates API', 'error', message);
    return false;
  }
}

async function testAllWizardEndpoints(): Promise<boolean> {
  const endpoints = [
    { path: '/api/wizard/detect-keywords', method: 'POST' },
    { path: '/api/wizard/seo-preview', method: 'POST' },
  ];

  let passed = 0;
  for (const ep of endpoints) {
    try {
      const res = await testAllHttpRequest(`${TEST_ALL_BASE_URL}${ep.path}`, {
        method: ep.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true }),
      });
      if (res.status === 400) {
        testAllLogTest(`Wizard: ${ep.path}`, 'pass', 'Endpoint exists');
        passed++;
      } else {
        testAllLogTest(`Wizard: ${ep.path}`, 'error', `Status: ${res.status}`);
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      testAllLogTest(`Wizard: ${ep.path}`, 'error', message);
    }
  }
  return passed === endpoints.length;
}

async function testAllRunTests(): Promise<boolean> {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('🧪 COMPREHENSIVE TEST SUITE');
  console.log('═══════════════════════════════════════════════════════════\n');

  if (!(await testAllWaitForServer())) {
    console.log('❌ Server not available - cannot run tests');
    return false;
  }

  await testAllHealth();
  await testAllTemplates();
  await testAllWizardEndpoints();

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📊 SUMMARY');
  console.log('═══════════════════════════════════════════════════════════\n');

  const passed = testAllResults.filter(r => r.status === 'pass').length;
  const failed = testAllResults.filter(r => r.status === 'fail').length;
  const errors = testAllResults.filter(r => r.status === 'error').length;

  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Errors: ${errors}`);
  console.log(`📊 Total: ${testAllResults.length}\n`);

  if (failed > 0 || errors > 0) {
    console.log('Failed/Error Tests:');
    testAllResults.filter(r => r.status !== 'pass').forEach(r => {
      console.log(`  - ${r.test}: ${r.message}`);
    });
  }

  return failed === 0 && errors === 0;
}

testAllRunTests().then((success: boolean) => {
  process.exit(success ? 0 : 1);
}).catch((err: unknown) => {
  console.error('Test error:', err);
  process.exit(1);
});

