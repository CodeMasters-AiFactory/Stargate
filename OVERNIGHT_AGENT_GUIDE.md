# 🤖 OVERNIGHT AGENT GUIDE

## Stargate Portal - Merlin 8.0 Industry DNA Expansion

---

## QUICK START

```powershell
# Windows
.\init.ps1

# Unix/Mac
./init.sh
```

---

## AGENT WORKFLOW (Every Session)

### 1️⃣ GET BEARINGS

```bash
pwd                              # Confirm directory
cat claude-progress.txt          # Read what was done
cat feature_list.json            # See pending industries
git log --oneline -10            # Check recent commits
```

### 2️⃣ PICK ONE INDUSTRY

- Open `feature_list.json`
- Find an industry with `"passes": false`
- Start with Priority 2 items first

### 3️⃣ IMPLEMENT

Add to `server/engines/merlin8/industryDNA.ts`:

```typescript
'industry-id': {
  id: 'industry-id',
  name: 'Industry Name',
  keywords: ['keyword1', 'keyword2'],

  design: {
    colorScheme: 'dark' | 'light' | 'warm' | 'cool' | 'luxury',
    primaryColor: '#HEXCODE',
    secondaryColor: '#HEXCODE',
    accentColor: '#HEXCODE',
    backgroundColor: '#HEXCODE',
    textColor: '#HEXCODE',
    fonts: { heading: '...', body: '...' },
    aesthetic: 'Description',
    heroStyle: 'full-bleed' | 'split' | 'minimal',
    borderRadius: 'none' | 'small' | 'medium' | 'large',
    shadows: 'none' | 'subtle' | 'medium' | 'dramatic',
  },

  images: {
    hero: 'Leonardo AI prompt',
    services: 'Leonardo AI prompt',
    about: 'Leonardo AI prompt',
    team: 'Leonardo AI prompt',
    style: 'Overall style guidance',
  },

  copy: {
    tone: 'Tone description',
    powerWords: ['word1', 'word2'],
    avoidWords: ['word1', 'word2'],
    ctaText: ['CTA 1', 'CTA 2'],
    taglineStyle: 'Style description',
  },

  sections: ['hero', 'services', 'about', ...],
  specialFeatures: ['feature1', 'feature2'],
},
```

### 4️⃣ TEST

```bash
# Ensure server is running
curl http://localhost:5000/api/health

# Test generation (manual or via UI)
# Navigate to /merlin8 and generate a sample site
```

### 5️⃣ UPDATE FEATURE LIST

In `feature_list.json`, find your industry and change:

```json
{
  "id": "industry-id",
  "passes": true, // Change from false
  "completedDate": "2024-12-22" // Add date
}
```

### 6️⃣ COMMIT

```bash
git add server/engines/merlin8/industryDNA.ts feature_list.json
git commit -m "feat(merlin8): add [industry-name] industry DNA"
```

### 7️⃣ UPDATE PROGRESS

Add session entry to `claude-progress.txt`:

```
--- SESSION: YYYY-MM-DD HH:MM ---
Agent: Claude
Status: ✅ COMPLETED

Actions:
1. Added [industry] industry DNA
2. Tested generation
3. Committed to git

Industries Added: [list]
```

---

## IMPORTANT RULES

| ✅ DO                          | ❌ DON'T                            |
| ------------------------------ | ----------------------------------- |
| Work on ONE industry at a time | Try to do multiple at once          |
| Commit after each success      | Leave uncommitted changes           |
| Update progress file           | Skip documentation                  |
| Test before marking done       | Assume it works                     |
| Use unique keywords            | Copy keywords from other industries |

---

## FILE LOCATIONS

| File                                    | Purpose                  |
| --------------------------------------- | ------------------------ |
| `server/engines/merlin8/industryDNA.ts` | Industry DNA definitions |
| `feature_list.json`                     | Pass/fail tracking       |
| `claude-progress.txt`                   | Session logs             |
| `init.ps1` / `init.sh`                  | Startup scripts          |

---

## DESIGN GUIDELINES

### Color Schemes

- **dark**: Black backgrounds, light text (tech, racing, photography)
- **light**: White backgrounds, dark text (medical, education)
- **warm**: Earth tones, inviting (restaurant, salon, bakery)
- **cool**: Blues and greens (tech, medical)
- **luxury**: Gold accents, premium feel (jewelry, real estate)

### Hero Styles

- **full-bleed**: Full-width background image
- **split**: Half image, half content
- **minimal**: Mostly text, subtle imagery
- **gradient**: Abstract gradient backgrounds
- **video**: Video background (premium)

---

## PRIORITY ORDER

1. **Priority 2** industries (business-critical)
2. **Priority 3** industries (expansion)
3. Polish and refinement

Current remaining Priority 2:

- accounting
- automotive
- dental
- veterinary
- insurance
- architecture
- wedding
- education
- nonprofit
- church
- hotel
- ecommerce
- consulting
- marketing
- agency

---

## EMERGENCY RECOVERY

If something breaks:

```bash
git status           # Check what changed
git diff            # See changes
git stash           # Save changes temporarily
git checkout .      # Reset to last commit
```

---

**Good luck, Agent! 🚀**
