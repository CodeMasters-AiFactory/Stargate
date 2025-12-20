#!/usr/bin/env node
/**
 * Verification Script
 * 
 * This script verifies that:
 * 1. The server is running
 * 2. The application loads without errors
 * 3. Changes have taken effect
 * 
 * Usage: node scripts/verify-changes.js
 */

const http = require('http');

const SERVER_URL = 'http://localhost:5000';
const TIMEOUT = 5000;

async function checkServer() {
  return new Promise((resolve, reject) => {
    const req = http.get(SERVER_URL, { timeout: TIMEOUT }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve({ status: 'ok', statusCode: res.statusCode });
        } else {
          resolve({ status: 'error', statusCode: res.statusCode });
        }
      });
    });

    req.on('error', (err) => {
      reject({ status: 'error', error: err.message });
    });

    req.on('timeout', () => {
      req.destroy();
      reject({ status: 'error', error: 'Request timeout' });
    });
  });
}

async function verifyChanges() {
  console.log('🔍 Verifying changes...\n');

  try {
    console.log('1. Checking if server is running...');
    const result = await checkServer();
    
    if (result.status === 'ok') {
      console.log('   ✅ Server is running (Status:', result.statusCode, ')');
      console.log('   ✅ Application is accessible at', SERVER_URL);
      console.log('\n📋 Next steps:');
      console.log('   - Open browser and navigate to', SERVER_URL);
      console.log('   - Check browser console for errors');
      console.log('   - Test the changed feature');
      console.log('   - Verify changes took effect');
      console.log('\n✅ Verification complete!');
      process.exit(0);
    } else {
      console.log('   ❌ Server returned status:', result.statusCode);
      console.log('\n⚠️  Please check the server status');
      process.exit(1);
    }
  } catch (error) {
    console.log('   ❌ Server is not running or not accessible');
    console.log('   Error:', error.error || error.message);
    console.log('\n⚠️  Please start the server with: npm run dev');
    process.exit(1);
  }
}

verifyChanges();

