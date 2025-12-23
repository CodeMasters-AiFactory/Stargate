/**
 * Generate F1 Racing Website using Merlin 7.0 API
 */

const intakeData = {
  // Fast Mode fields
  businessName: "Phoenix F1 Racing",
  businessType: "Sports & Entertainment",
  location: {
    city: "Monaco",
    region: "Monte Carlo",
    country: "Monaco"
  },
  services: [
    { name: "Formula 1 Racing", description: "Competing at the pinnacle of motorsport" },
    { name: "Driver Development", description: "Nurturing the next generation of racing champions" },
    { name: "Engineering Excellence", description: "Cutting-edge aerodynamics and technology" },
    { name: "Sponsorship", description: "Partnership opportunities with a championship team" }
  ],
  targetAudience: "F1 fans, motorsport enthusiasts, sponsors, media",
  primaryGoal: "Showcase our racing team and attract sponsors",
  tone: "professional",
  
  // Enterprise Mode fields
  competitorUrl: "https://www.formula1.com",
  brandColors: {
    primary: "#E10600",
    secondary: "#1E1E1E",
    accent: "#FFFFFF"
  },
  stylePreferences: {
    modern: true,
    bold: true
  },
  colorPreferences: ["red", "black", "white"],
  contentTone: "professional",
  seoFocus: ["F1 racing", "motorsport", "Formula 1 team"],
  targetKeywords: ["F1", "Formula 1", "racing team", "motorsport", "championship"]
};

async function generateF1Website() {
  console.log("🏎️  Starting F1 Racing Website Generation...\n");
  
  try {
    const response = await fetch("http://localhost:5000/api/merlin7/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        intakeData,
        enableLivePreview: false
      })
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      console.error("No response stream");
      return;
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            
            if (data.type === 'progress') {
              const bar = '█'.repeat(Math.floor(data.progress / 5)) + '░'.repeat(20 - Math.floor(data.progress / 5));
              console.log(`[${bar}] ${data.progress}% - Phase ${data.phase}: ${data.phaseName}`);
              if (data.message) console.log(`   ${data.message}`);
            } else if (data.type === 'complete') {
              console.log("\n✅ GENERATION COMPLETE!");
              console.log(`   Project: ${data.projectSlug}`);
              console.log(`   Duration: ${(data.duration / 1000).toFixed(1)}s`);
              console.log(`   Success: ${data.success}`);
            } else if (data.type === 'error') {
              console.error("\n❌ ERROR:", data.error);
            }
          } catch (e) {
            // Skip non-JSON lines
          }
        }
      }
    }
  } catch (error) {
    console.error("Request failed:", error);
  }
}

generateF1Website();
