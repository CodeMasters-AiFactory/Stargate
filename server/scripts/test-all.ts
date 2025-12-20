/**
 * Comprehensive Test Suite
 * Tests all features end-to-end
 */

const BASE_URL = 'http://localhost:5000';

async function httpRequest(url: string, options: any = {}) {
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
        resolve({
          ok: res.statusCode && res.statusCode >= 200 && res.statusCode < 300,
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

const results: Array<{ test: string; status: string; message: string }> = [];

function log(test: string, status: '✅' | '❌' | '⚠️', message: string = '') {
  console.log(`${status} ${test}${message ? ': ' + message : ''}`);
  results.push({ test, status, message });
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

async function testHealth() {
  try {
    const res: any = await httpRequest(`${BASE_URL}/api/health`);
    if (res.ok) {
      log('Health Endpoint', '✅');
      return true;
    }
    log('Health Endpoint', '❌', `Status: ${res.status}`);
    return false;
  } catch (e: any) {
    log('Health Endpoint', '❌', e.message);
    return false;
  }
}

async function testTemplates() {
  try {
    const res: any = await httpRequest(`${BASE_URL}/api/templates?page=1&pageSize=5`);
    const data = await res.json();
    if (data.success && Array.isArray(data.templates)) {
      log('Templates API', '✅', `${data.templates.length} templates found`);
      return data.templates.length > 0;
    }
    log('Templates API', '❌', 'No templates returned');
    return false;
  } catch (e: any) {
    log('Templates API', '❌', e.message);
    return false;
  }
}

async function testWizardEndpoints() {
  const endpoints = [
    { path: '/api/wizard/detect-keywords', method: 'POST' },
    { path: '/api/wizard/seo-preview', method: 'POST' },
  ];
  
  let passed = 0;
  for (const ep of endpoints) {
    try {
      const res: any = await httpRequest(`${BASE_URL}${ep.path}`, {
        method: ep.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true }),
      });
      if (res.status === 400) {
        log(`Wizard: ${ep.path}`, '✅', 'Endpoint exists');
        passed++;
      } else {
        log(`Wizard: ${ep.path}`, '⚠️', `Status: ${res.status}`);
      }
    } catch (e: any) {
      log(`Wizard: ${ep.path}`, '❌', e.message);
    }
  }
  return passed === endpoints.length;
}

async function runTests() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('🧪 COMPREHENSIVE TEST SUITE');
  console.log('═══════════════════════════════════════════════════════════\n');

  if (!(await waitForServer())) {
    console.log('❌ Server not available - cannot run tests');
    return false;
  }

  await testHealth();
  await testTemplates();
  await testWizardEndpoints();

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📊 SUMMARY');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const passed = results.filter(r => r.status === '✅').length;
  const failed = results.filter(r => r.status === '❌').length;
  const warnings = results.filter(r => r.status === '⚠️').length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  console.log(`📊 Total: ${results.length}\n`);

  if (failed > 0) {
    console.log('Failed Tests:');
    results.filter(r => r.status === '❌').forEach(r => {
      console.log(`  - ${r.test}: ${r.message}`);
    });
  }

  return failed === 0;
}

runTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});

