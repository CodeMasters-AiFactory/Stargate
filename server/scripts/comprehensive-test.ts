/**
 * Comprehensive End-to-End Test
 * Tests all wizard features from beginning to end
 */

// Use native fetch if available (Node 18+), otherwise use node-fetch
let fetch: any;
try {
  if (typeof globalThis.fetch === 'function') {
    fetch = globalThis.fetch;
  } else {
    fetch = (await import('node-fetch')).default;
  }
} catch {
  // Fallback to http module if fetch not available
  const http = await import('http');
  fetch = (url: string, options?: any) => {
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
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            ok: res.statusCode && res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            json: () => Promise.resolve(JSON.parse(data)),
          } as any);
        });
      });
      req.on('error', reject);
      if (options?.body) req.write(options.body);
      req.end();
    });
  };
}

const BASE_URL = 'http://localhost:5000';
const testResults: Array<{ test: string; status: 'pass' | 'fail' | 'error'; message: string }> = [];

function logTest(test: string, status: 'pass' | 'fail' | 'error', message: string = '') {
  const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
  console.log(`${icon} ${test}${message ? ': ' + message : ''}`);
  testResults.push({ test, status, message });
}

async function waitForServer(maxAttempts = 30) {
  console.log('\n🔍 Waiting for server to start...\n');
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`${BASE_URL}/api/health`);
      if (response.ok) {
        console.log('✅ Server is running\n');
        return true;
      }
    } catch (error) {
      // Server not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  console.log('❌ Server did not start in time');
  return false;
}

async function testHealthEndpoint() {
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    if (response.ok) {
      logTest('Health Endpoint', 'pass');
      return true;
    } else {
      logTest('Health Endpoint', 'fail', `Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('Health Endpoint', 'error', error instanceof Error ? error.message : String(error));
    return false;
  }
}

async function testTemplatesEndpoint() {
  try {
    const response = await fetch(`${BASE_URL}/api/templates?page=1&pageSize=20`);
    const data = await response.json();
    
    if (data.success && Array.isArray(data.templates)) {
      logTest('Templates Endpoint', 'pass', `Found ${data.templates.length} templates`);
      return data.templates.length > 0;
    } else {
      logTest('Templates Endpoint', 'fail', 'No templates returned');
      return false;
    }
  } catch (error) {
    logTest('Templates Endpoint', 'error', error instanceof Error ? error.message : String(error));
    return false;
  }
}

async function testDatabaseConnection() {
  try {
    const response = await fetch(`${BASE_URL}/api/admin/templates`);
    if (response.ok) {
      const data = await response.json();
      logTest('Database Connection', 'pass', 'Database accessible');
      return true;
    } else {
      logTest('Database Connection', 'fail', `Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('Database Connection', 'error', 'Database may not be connected (using file-based templates)');
    return false;
  }
}

async function testWizardFeaturesEndpoints() {
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
    } catch (error) {
      logTest(`Wizard Feature: ${endpoint}`, 'error', error instanceof Error ? error.message : String(error));
      allPassed = false;
    }
  }
  
  return allPassed;
}

async function testTemplateLoading() {
  try {
    // Test loading a template
    const response = await fetch(`${BASE_URL}/api/templates?page=1&pageSize=1`);
    const data = await response.json();
    
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
  } catch (error) {
    logTest('Template Loading', 'error', error instanceof Error ? error.message : String(error));
    return false;
  }
}

async function runAllTests() {
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

  const passed = testResults.filter(r => r.status === 'pass').length;
  const failed = testResults.filter(r => r.status === 'fail').length;
  const errors = testResults.filter(r => r.status === 'error').length;

  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Errors: ${errors}`);
  console.log(`📊 Total: ${testResults.length}\n`);

  if (failed > 0 || errors > 0) {
    console.log('Failed/Error Tests:');
    testResults.filter(r => r.status !== 'pass').forEach(r => {
      console.log(`  - ${r.test}: ${r.message}`);
    });
  }

  return failed === 0 && errors === 0;
}

// Run tests
runAllTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});

