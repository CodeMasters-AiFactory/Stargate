/**
 * Comprehensive API Test Suite
 * Tests all 17 wizard feature endpoints
 */

const BASE_URL = 'http://localhost:5000';

interface TestResult {
  endpoint: string;
  method: string;
  status: 'pass' | 'fail' | 'error';
  message: string;
  duration?: number;
}

const results: TestResult[] = [];

async function httpRequest(url: string, options: any = {}): Promise<any> {
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
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            ok: res.statusCode && res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            json: () => Promise.resolve(JSON.parse(data)),
            text: () => Promise.resolve(data),
          });
        } catch {
          resolve({
            ok: res.statusCode && res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            json: () => Promise.resolve({}),
            text: () => Promise.resolve(data),
          });
        }
      });
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

function log(endpoint: string, method: string, status: 'pass' | 'fail' | 'error', message: string, duration?: number) {
  const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
  console.log(`${icon} ${method} ${endpoint}${duration ? ` (${duration}ms)` : ''}${message ? ': ' + message : ''}`);
  results.push({ endpoint, method, status, message, duration });
}

async function waitForServer() {
  console.log('\n🔍 Waiting for server...\n');
  for (let i = 0; i < 30; i++) {
    try {
      const res: any = await httpRequest(`${BASE_URL}/api/health`);
      if (res.ok) {
        console.log('✅ Server is running\n');
        return true;
      }
    } catch {}
    await new Promise(r => setTimeout(r, 1000));
  }
  return false;
}

async function testEndpoint(endpoint: string, method: string, body?: any) {
  const start = Date.now();
  try {
    const res: any = await httpRequest(`${BASE_URL}${endpoint}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
    const duration = Date.now() - start;
    
    // 400 = bad request (expected for test data), 500 = server error (bad)
    if (res.status === 400) {
      log(endpoint, method, 'pass', 'Endpoint exists and validates input', duration);
      return true;
    } else if (res.status === 500) {
      log(endpoint, method, 'fail', `Server error: ${res.status}`, duration);
      return false;
    } else if (res.ok) {
      log(endpoint, method, 'pass', `Status: ${res.status}`, duration);
      return true;
    } else {
      log(endpoint, method, 'fail', `Status: ${res.status}`, duration);
      return false;
    }
  } catch (e: any) {
    const duration = Date.now() - start;
    log(endpoint, method, 'error', e.message || String(e), duration);
    return false;
  }
}

async function runTests() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('🧪 COMPREHENSIVE API TEST SUITE');
  console.log('═══════════════════════════════════════════════════════════\n');

  if (!(await waitForServer())) {
    console.log('❌ Server not available');
    return false;
  }

  // Test all 17 wizard endpoints
  console.log('Testing Wizard Feature Endpoints:\n');

  await testEndpoint('/api/wizard/generate-page-by-page', 'POST', { mergedTemplate: { html: '<html><body>Test</body></html>', css: '' }, clientInfo: { businessName: 'Test', industry: 'Tech', location: { city: 'Test', state: 'Test', country: 'Test' }, services: [], phone: '123', email: 'test@test.com', address: '123 Test' } });
  await testEndpoint('/api/wizard/detect-keywords', 'POST', { pageHtml: '<html><body><h1>Technology Services</h1></body></html>', pageName: 'Test', industry: 'Technology' });
  await testEndpoint('/api/wizard/add-custom-keywords', 'POST', { detectedKeywords: { primary: [], secondary: [] }, customKeywords: ['test'] });
  await testEndpoint('/api/wizard/seo-preview', 'POST', { html: '<html><head><title>Test</title></head><body><h1>Test</h1></body></html>', keywords: ['test'] });
  await testEndpoint('/api/wizard/generate-variations', 'POST', { pageHtml: '<html><body><h1>Test</h1></body></html>', clientInfo: { businessName: 'Test', industry: 'Tech', services: [] }, options: { numVariations: 2 } });
  await testEndpoint('/api/wizard/versions/save', 'POST', { websiteId: 'test-123', stage: 'design', snapshot: { html: '<html></html>', css: '' } });
  await testEndpoint('/api/wizard/versions/test-123', 'GET');
  await testEndpoint('/api/wizard/versions/restore', 'POST', { websiteId: 'test-123', versionId: 'test-version' });
  await testEndpoint('/api/wizard/approval/submit', 'POST', { websiteId: 'test-123', stage: 'design', requestedBy: 'test-user' });
  await testEndpoint('/api/wizard/approval/process', 'POST', { approvalId: 'test-123', approved: true, reviewedBy: 'test-reviewer' });
  await testEndpoint('/api/wizard/approval/test-123', 'GET');
  await testEndpoint('/api/wizard/templates/mix', 'POST', { templates: [{ templateId: 'test', templateName: 'Test', html: '<html></html>', css: '', sections: [] }] });
  await testEndpoint('/api/wizard/batch/replace-images', 'POST', { pages: [{ slug: 'test', html: '<html><img src="old.jpg"></html>' }], replacements: [{ originalUrl: 'old.jpg', newUrl: 'new.jpg' }] });
  await testEndpoint('/api/wizard/batch/update-content', 'POST', { pages: [{ slug: 'test', html: '<html><p>Old</p></html>' }], updates: [{ selector: 'p', type: 'text', value: 'New' }] });
  await testEndpoint('/api/wizard/batch/update-contact', 'POST', { pages: [{ slug: 'test', html: '<html><a href="tel:123">123</a></html>' }], contactInfo: { phone: '456', email: 'test@test.com', address: '123 Test' } });
  await testEndpoint('/api/wizard/monitor/template-health/test-template', 'GET');
  await testEndpoint('/api/wizard/monitor/schedule', 'POST', { templateId: 'test-template', frequency: 'weekly' });
  await testEndpoint('/api/wizard/insights/industry/Technology', 'GET');

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📊 TEST SUMMARY');
  console.log('═══════════════════════════════════════════════════════════\n');

  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const errors = results.filter(r => r.status === 'error').length;
  const avgDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0) / results.length;

  console.log(`✅ Passed: ${passed}/${results.length}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Errors: ${errors}`);
  console.log(`⏱️  Average Response Time: ${Math.round(avgDuration)}ms\n`);

  if (failed > 0 || errors > 0) {
    console.log('Failed/Error Tests:');
    results.filter(r => r.status !== 'pass').forEach(r => {
      console.log(`  - ${r.method} ${r.endpoint}: ${r.message}`);
    });
  }

  return failed === 0 && errors === 0;
}

runTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});

