$env:PATH = "C:\Program Files\nodejs;" + $env:PATH

cd "C:\CURSOR PROJECTS\StargatePortal"

node -e @"
import fetch from 'node-fetch';

async function testMerlinChat() {
  try {
    console.log('STEP 1: Generating new website via Merlin API...\n');

    const generateResponse = await fetch('http://localhost:5000/api/merlin/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        industry: 'restaurant',
        businessName: 'The Golden Fork',
        description: 'Upscale fine dining restaurant specializing in contemporary fusion cuisine with seasonal ingredients',
        style: 'elegant',
        colorScheme: 'luxury',
        features: ['fine-dining', 'wine-pairing', 'private-events', 'chef-tasting-menu']
      })
    });

    const result = await generateResponse.json();

    if (result.success) {
      console.log('SUCCESS - Website Generated!');
      console.log('=========================================');
      console.log('Business:', result.businessName);
      console.log('Folder:', result.outputPath);
      console.log('Time:', result.generationTime);
      console.log('Images:', result.images?.length || 0, 'generated');
      console.log('');
      console.log('OPEN THESE URLs IN YOUR BROWSER:');
      console.log('=========================================');
      const projectPath = result.outputPath.replace(/\\\\/g, '/').split('website_projects/')[1];
      console.log('');
      console.log('MERLIN CHAT EDITOR:');
      console.log('http://localhost:5000/editor/checkmate');
      console.log('');
      console.log('GENERATED WEBSITE:');
      console.log('http://localhost:5000/' + projectPath + '/index.html');
      console.log('');
      console.log('SMOKE TEST - TRY THESE CHANGES:');
      console.log('=========================================');
      console.log('1. Change the main heading to The Golden Fork Fine Dining');
      console.log('2. Add a Reservations section with contact information');
      console.log('3. Change the primary color to gold #D4AF37');
      console.log('4. Add a Menu link to the navigation bar');
      console.log('5. Update the hero subtitle to mention Michelin-star quality');
      console.log('6. Add a Wine Cellar section');
      console.log('7. Create a chef biography section');
      console.log('=========================================');
    } else {
      console.error('ERROR: Generation failed:', result.error || 'Unknown error');
    }

  } catch (error) {
    console.error('ERROR:', error.message);
  }
}

testMerlinChat();
"@
