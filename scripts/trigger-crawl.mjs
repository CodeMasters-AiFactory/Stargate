/**
 * Trigger multi-page crawl for Template 1
 */

const response = await fetch('http://localhost:5000/api/admin/scraper/crawl-template1', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
});

const data = await response.json();
console.log(JSON.stringify(data, null, 2));

if (data.success) {
  console.log('\n✅ CRAWL STARTED!');
  console.log(`📄 Template: ${data.templateName}`);
  console.log(`🌐 Source URL: ${data.sourceUrl}`);
  console.log(`\n⏳ Crawling ENTIRE website... This will take time.`);
  console.log(`📊 Watch server logs for progress.`);
} else {
  console.error('❌ FAILED:', data.error);
  process.exit(1);
}

