# 🚀 StargatePortal - Quick Start Guide

## ⚡ Start the Server

```powershell
cd "C:\CURSOR PROJECTS\StargatePortal"
npm run dev
```

Server will start at: **http://localhost:5000**

---

## 🎨 Generate a Website (3 Ways)

### Option 1: Via Web Interface
1. Open http://localhost:5000 in browser
2. Chat with Merlin assistant
3. Describe your business
4. Get instant website!

### Option 2: Via API (JavaScript)
```javascript
const response = await fetch('http://localhost:5000/api/merlin8/generate-sync', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    industry: 'fitness',
    businessName: 'My Gym',
    description: 'A great fitness center',
    style: 'modern',
    colorScheme: 'energetic'
  })
});

const result = await response.json();
console.log('Preview:', result.previewUrl);
```

### Option 3: Via cURL
```bash
curl -X POST http://localhost:5000/api/merlin8/generate-sync \
  -H "Content-Type: application/json" \
  -d '{
    "industry": "restaurant",
    "businessName": "Bella Italia",
    "description": "Authentic Italian cuisine",
    "style": "elegant"
  }'
```

---

## 📋 Available Industries

| ID | Name | Best For |
|----|------|----------|
| `racing` | Racing & Motorsport | F1, racing teams, automotive |
| `restaurant` | Restaurant & Dining | Restaurants, cafes, bars |
| `legal` | Law Firm & Legal | Law firms, attorneys |
| `tech` | Tech Startup & SaaS | Software, tech companies |
| `realestate` | Real Estate | Realtors, property firms |
| `fitness` | Fitness & Gym | Gyms, trainers, fitness |
| `medical` | Medical & Healthcare | Doctors, clinics, health |
| `photography` | Photography | Photographers, studios |
| `salon` | Salon & Spa | Salons, spas, beauty |
| `construction` | Construction | Contractors, builders |

---

## 🎨 Style Options

- `modern` - Clean, contemporary
- `minimal` - Simple, focused
- `elegant` - Sophisticated, refined
- `professional` - Corporate, trustworthy
- `bold` - Dramatic, impactful
- `creative` - Unique, artistic

---

## 🌈 Color Schemes

- `professional` - Navy, gray, white
- `warm` - Orange, red, yellow tones
- `cool` - Blue, cyan, teal tones
- `energetic` - Bright, bold colors
- `corporate` - Traditional business colors
- `tech-blue` - Modern tech palette

---

## 📁 Output Structure

Generated websites are saved to:
```
website_projects/
  └── your-business-name/
      └── merlin8-output/
          ├── index.html (Main page)
          ├── styles.css (Styling)
          ├── metadata.json (Info)
          └── images/
              ├── hero.jpg
              ├── services.jpg
              ├── about.jpg
              ├── team.jpg
              └── background.jpg
```

---

## 🔧 Common Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build:production

# Run tests
npm test

# Check TypeScript
npm run check

# Fix linting
npm run lint:fix

# Format code
npm run format
```

---

## 🌐 Key URLs

| URL | Purpose |
|-----|---------|
| http://localhost:5000 | Main application |
| http://localhost:5000/api/health | Server health |
| http://localhost:5000/api/merlin8/industries | List industries |
| http://localhost:5000/website_projects/* | Generated sites |

---

## 🐛 Troubleshooting

### Server won't start
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill process if needed
taskkill /PID <process_id> /F

# Restart server
npm run dev
```

### Database connection errors
```bash
# Check PostgreSQL is running
# Verify .env database settings
# Restart PostgreSQL service
```

### Generation fails
- Check API keys in .env (Leonardo, OpenAI if configured)
- Check internet connection (for image generation)
- Check logs in terminal for errors

---

## 💡 Pro Tips

1. **Fast Prototyping:** Generate multiple versions with different styles
2. **A/B Testing:** Create variants and test which performs better
3. **Starting Point:** Use generated code as base, customize further
4. **Learn Design:** Study generated CSS to understand industry patterns
5. **Batch Generation:** Generate sites for all your clients quickly

---

## 📞 Support

- **Documentation:** Check `/rules` folder
- **Logs:** Terminal output shows detailed info
- **Test Report:** See `SMOKE-TEST-REPORT.md`
- **Examples:** 46 generated sites in `website_projects/`

---

## 🎯 Quick Reference

**Generate a Fitness Gym:**
```json
{
  "industry": "fitness",
  "businessName": "Peak Performance",
  "description": "Transform your body and mind",
  "style": "modern",
  "colorScheme": "energetic"
}
```

**Generate a Law Firm:**
```json
{
  "industry": "legal",
  "businessName": "Sterling Law",
  "description": "Excellence in legal services",
  "style": "professional",
  "colorScheme": "corporate"
}
```

**Generate a Restaurant:**
```json
{
  "industry": "restaurant",
  "businessName": "Bella Vista",
  "description": "Authentic Italian cuisine",
  "style": "elegant",
  "colorScheme": "warm"
}
```

---

**Ready to build something amazing? Let's go! 🚀**
