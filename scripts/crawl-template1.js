/**
 * Script to trigger multi-page crawl for Template 1
 */

import fetch from 'node-fetch';

async function crawlTemplate1() {
  try {
    console.log('🚀 Starting multi-page crawl for Template 1...');
    
    const response = await fetch('http://localhost:5000/api/admin/scraper/crawl-template1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Crawl started successfully!');
      console.log(`📄 Template: ${data.templateName}`);
      console.log(`🌐 Source URL: ${data.sourceUrl}`);
      console.log(`\n⏳ Crawling in progress... This will take several minutes.`);
      console.log(`📊 Check server logs for progress updates.`);
    } else {
      console.error('❌ Failed to start crawl:', data.error);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

crawlTemplate1();

