// SMOKE TEST: Scrape Apple.com and verify template
// Run this in browser console

(async function smokeTestApple() {
  console.log('🧪 SMOKE TEST: Scraping Apple.com');
  console.log('=====================================');
  
  // Step 1: Click Website Scraper tab
  console.log('Step 1: Clicking Website Scraper tab...');
  const scraperTab = Array.from(document.querySelectorAll('button, [role="tab"]')).find(t => 
    t.textContent?.includes('Website Scraper') || 
    t.textContent?.includes('Web ite Scraper') ||
    t.getAttribute('value') === 'scraper'
  );
  
  if (scraperTab) {
    scraperTab.click();
    await new Promise(r => setTimeout(r, 2000));
    console.log('✅ Clicked Website Scraper tab');
  } else {
    console.error('❌ Website Scraper tab not found');
    return;
  }
  
  // Step 2: Click "Top Search Engine Results" tab
  console.log('Step 2: Clicking Top Search Engine Results tab...');
  const searchTab = Array.from(document.querySelectorAll('button, [role="tab"]')).find(t => 
    t.textContent?.includes('Top Search Engine Results') || 
    t.textContent?.includes('Search Engine')
  );
  
  if (searchTab) {
    searchTab.click();
    await new Promise(r => setTimeout(r, 2000));
    console.log('✅ Clicked Top Search Engine Results tab');
  } else {
    console.error('❌ Top Search Engine Results tab not found');
    return;
  }
  
  // Step 3: Find domain input and add apple.com
  console.log('Step 3: Adding apple.com to domain list...');
  const domainInput = document.querySelector('input[type="text"][placeholder*="domain"], input[type="text"][placeholder*="URL"], input[type="text"][placeholder*="website"]');
  
  if (domainInput) {
    domainInput.value = 'https://www.apple.com';
    domainInput.dispatchEvent(new Event('input', { bubbles: true }));
    domainInput.dispatchEvent(new Event('change', { bubbles: true }));
    console.log('✅ Entered apple.com in input');
    
    // Find and click "Add" button
    const addButton = Array.from(document.querySelectorAll('button')).find(b => 
      b.textContent?.includes('Add') || 
      b.textContent?.includes('+') ||
      b.querySelector('svg')?.parentElement === b
    );
    
    if (addButton) {
      addButton.click();
      await new Promise(r => setTimeout(r, 1000));
      console.log('✅ Clicked Add button');
    }
  } else {
    console.error('❌ Domain input not found');
    return;
  }
  
  // Step 4: Find and click "Scrape Selected" or scrape button
  console.log('Step 4: Starting scrape...');
  const scrapeButton = Array.from(document.querySelectorAll('button')).find(b => 
    b.textContent?.includes('Scrape') && 
    !b.disabled &&
    (b.textContent?.includes('Selected') || b.textContent?.includes('Scrape'))
  );
  
  if (scrapeButton) {
    console.log('✅ Found scrape button, clicking...');
    scrapeButton.click();
    
    // Step 5: Monitor progress
    console.log('Step 5: Monitoring progress...');
    let checkCount = 0;
    const maxChecks = 120; // 2 minutes max
    
    const progressInterval = setInterval(() => {
      checkCount++;
      
      // Check for progress bar
      const progressBars = document.querySelectorAll('[role="progressbar"], .progress, [class*="Progress"]');
      if (progressBars.length > 0) {
        progressBars.forEach((bar, i) => {
          const value = bar.getAttribute('aria-valuenow') || 
                       bar.style.width || 
                       bar.getAttribute('aria-valuetext') ||
                       '0';
          console.log(`📊 Progress Bar ${i + 1}: ${value}`);
        });
      }
      
      // Check for progress text
      const progressText = Array.from(document.querySelectorAll('*')).find(el => 
        el.textContent?.includes('Scraping') || 
        el.textContent?.includes('Progress') ||
        el.textContent?.includes('%')
      );
      if (progressText) {
        console.log(`📊 Progress Text: ${progressText.textContent}`);
      }
      
      // Check if button is still disabled (scraping in progress)
      if (scrapeButton.disabled) {
        console.log(`🔄 Scraping in progress... (${checkCount}s)`);
      } else if (checkCount > 10 && !scrapeButton.disabled) {
        // Scraper finished
        console.log('✅ Scraper finished!');
        clearInterval(progressInterval);
        checkTemplates();
      }
      
      if (checkCount >= maxChecks) {
        clearInterval(progressInterval);
        console.log('⏱️ Timeout reached, checking templates...');
        checkTemplates();
      }
    }, 1000);
    
  } else {
    console.error('❌ Scrape button not found');
  }
  
  async function checkTemplates() {
    console.log('\n📦 Step 6: Checking templates...');
    try {
      // Navigate to Templates tab
      const templatesTab = Array.from(document.querySelectorAll('button, [role="tab"]')).find(t => 
        t.textContent?.includes('Template') && 
        !t.textContent?.includes('Scraper')
      );
      
      if (templatesTab) {
        templatesTab.click();
        await new Promise(r => setTimeout(r, 2000));
        console.log('✅ Clicked Templates tab');
      }
      
      // Check API
      const response = await fetch('/api/admin/templates');
      const data = await response.json();
      
      if (data.success) {
        const templates = data.templates || [];
        const appleTemplates = templates.filter(t => 
          t.brand?.toLowerCase().includes('apple') || 
          t.name?.toLowerCase().includes('apple') ||
          (t.contentData?.url && t.contentData.url.includes('apple.com'))
        );
        
        console.log(`\n📊 RESULTS:`);
        console.log(`   Total templates: ${templates.length}`);
        console.log(`   Apple templates: ${appleTemplates.length}`);
        
        if (appleTemplates.length > 0) {
          console.log('\n🎉🎉🎉 SUCCESS! APPLE TEMPLATE FOUND! 🎉🎉🎉\n');
          appleTemplates.forEach((t, i) => {
            console.log(`   ${i + 1}. ${t.name} (${t.brand})`);
            console.log(`      URL: ${t.contentData?.url || 'N/A'}`);
            console.log(`      Source: ${t.source || 'N/A'}`);
            console.log(`      Created: ${t.createdAt || 'N/A'}`);
          });
        } else {
          console.log('⚠️ No Apple templates found');
          console.log('   Checking all templates...');
          templates.slice(0, 5).forEach((t, i) => {
            console.log(`   ${i + 1}. ${t.name} (${t.brand}) - ${t.source}`);
          });
        }
      } else {
        console.error('❌ API error:', data.error);
      }
    } catch (error) {
      console.error('❌ Error checking templates:', error);
    }
  }
})();

