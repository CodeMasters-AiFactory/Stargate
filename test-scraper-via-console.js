// Run this in browser console on http://localhost:5000/admin
// This will trigger the scraper and verify results

(async function testScraper() {
  console.log('🚀 Starting scraper test...');
  
  // Step 1: Click Website Scraper tab
  const tabs = Array.from(document.querySelectorAll('button, [role="tab"]'));
  const scraperTab = tabs.find(t => 
    t.textContent?.includes('Website Scraper') || 
    t.textContent?.includes('Web ite Scraper') ||
    t.getAttribute('value') === 'scraper'
  );
  
  if (scraperTab) {
    console.log('✅ Found Website Scraper tab, clicking...');
    scraperTab.click();
    await new Promise(r => setTimeout(r, 2000));
  }
  
  // Step 2: Click Design Scraper tab
  const designTab = tabs.find(t => 
    t.textContent?.includes('Design Scraper') || 
    t.textContent?.includes('De ign Scraper')
  );
  
  if (designTab) {
    console.log('✅ Found Design Scraper tab, clicking...');
    designTab.click();
    await new Promise(r => setTimeout(r, 2000));
  }
  
  // Step 3: Find and click Quick Test button
  const quickTestBtn = document.querySelector('[data-testid="quick-test-technology-button"]') ||
                       Array.from(document.querySelectorAll('button')).find(b => 
                         b.textContent?.includes('Quick Test') || 
                         b.textContent?.includes('Technology') ||
                         b.textContent?.includes('⚡')
                       );
  
  if (quickTestBtn && !quickTestBtn.disabled) {
    console.log('✅ Found Quick Test button, clicking...');
    quickTestBtn.click();
    
    // Step 4: Monitor progress
    console.log('⏳ Monitoring scraper progress...');
    let checkCount = 0;
    const maxChecks = 60;
    
    const progressInterval = setInterval(async () => {
      checkCount++;
      
      // Check for progress bar
      const progressBar = document.querySelector('[role="progressbar"]');
      const progressText = document.querySelector('.text-muted-foreground');
      
      if (progressBar) {
        const value = progressBar.getAttribute('aria-valuenow') || 
                     progressBar.style.width || 
                     progressBar.getAttribute('aria-valuetext');
        console.log(`📊 Progress: ${value}`);
      }
      
      // Check if button is disabled (scraping in progress)
      if (quickTestBtn.disabled) {
        console.log('🔄 Scraper is running...');
      } else if (checkCount > 5 && !quickTestBtn.disabled) {
        // Scraper might be done
        console.log('✅ Scraper finished, checking templates...');
        clearInterval(progressInterval);
        await checkTemplates();
      }
      
      if (checkCount >= maxChecks) {
        clearInterval(progressInterval);
        console.log('⏱️ Timeout reached, checking templates...');
        await checkTemplates();
      }
    }, 1000);
    
    // Also check after 30 seconds
    setTimeout(async () => {
      clearInterval(progressInterval);
      await checkTemplates();
    }, 30000);
    
  } else {
    console.error('❌ Quick Test button not found or disabled');
    console.log('Available buttons:', Array.from(document.querySelectorAll('button')).map(b => b.textContent?.trim()).filter(Boolean));
  }
  
  async function checkTemplates() {
    console.log('📦 Checking templates in database...');
    try {
      const response = await fetch('/api/admin/templates');
      const templates = await response.json();
      const designTemplates = templates.filter(t => t.isDesignQuality === true);
      const techTemplates = designTemplates.filter(t => t.designCategory === 'Technology');
      
      console.log(`\n📊 RESULTS:`);
      console.log(`   Total templates: ${templates.length}`);
      console.log(`   Design quality templates: ${designTemplates.length}`);
      console.log(`   Technology templates: ${techTemplates.length}`);
      
      if (techTemplates.length > 0) {
        console.log('\n🎉🎉🎉 SUCCESS! TEMPLATES CREATED! 🎉🎉🎉\n');
        console.log('Created Technology templates:');
        techTemplates.slice(0, 5).forEach((t, i) => {
          console.log(`   ${i + 1}. ${t.name} (${t.brand})`);
          console.log(`      URL: ${t.contentData?.url || 'N/A'}`);
          console.log(`      Created: ${t.createdAt || 'N/A'}`);
        });
        return true;
      } else {
        console.log('⚠️ No Technology templates found');
        console.log('   This could mean:');
        console.log('   - Scraper is still running');
        console.log('   - Scraper failed');
        console.log('   - Templates not saved to database');
        return false;
      }
    } catch (error) {
      console.error('❌ Error checking templates:', error);
      return false;
    }
  }
})();

