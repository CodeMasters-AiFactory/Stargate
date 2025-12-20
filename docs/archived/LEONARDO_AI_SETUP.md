# Leonardo AI Integration Setup

## Overview

Leonardo AI has been integrated as a **backup/free-tier image provider** for Merlin Website Builder.

**Free Tier:** 150 images per day
**Usage Tracking:** Automatic
**Notifications:** Automatic warnings when approaching limit

---

## Setup Instructions

### 1. Get Leonardo AI API Key

1. Go to [Leonardo.ai](https://leonardo.ai)
2. Sign up / Log in
3. Go to **API Settings** or **Developer Dashboard**
4. Generate an API key
5. Copy the API key

### 2. Add to Environment Variables

Add to your `.env` file:

```env
LEONARDO_AI_API_KEY=your_api_key_here
```

Or set as system environment variable:

**Windows (PowerShell):**
```powershell
$env:LEONARDO_AI_API_KEY="your_api_key_here"
```

**Linux/Mac:**
```bash
export LEONARDO_AI_API_KEY="your_api_key_here"
```

### 3. Restart Dev Server

After adding the API key, restart the server:

```bash
npm run dev
```

---

## Usage Tracking

### Automatic Monitoring

The system automatically:
- ✅ Tracks daily usage (resets at midnight UTC)
- ✅ Warns when approaching limit (90%+ usage)
- ✅ Blocks generation when limit reached
- ✅ Logs usage statistics
- ✅ Stores usage history (last 30 days)

### Usage File Location

Usage data is stored in:
```
data/leonardo-usage.json
```

Format:
```json
[
  {
    "date": "2025-12-03",
    "count": 147
  }
]
```

---

## Usage Limits & Notifications

### Free Tier Limits

| Tier | Daily Limit | Monthly Limit |
|------|-------------|---------------|
| **Free** | 150 images | ~4,500 images |

### Notification Thresholds

| Usage | Action | Message |
|-------|--------|---------|
| **75%+** | Info log | `ℹ️ Usage: 113/150 images (75%)` |
| **90%+** | Warning | `⚠️ Nearing limit! Only 15 images remaining` |
| **100%** | Error + Block | `❌ Limit reached! Upgrade or wait until tomorrow` |

---

## How It Works in Merlin

### Provider Priority (Auto Mode)

When generating images, Merlin tries providers in this order:

1. **DALL-E 3** (OpenAI) - Best quality, creative
2. **Flux Pro** (Replicate) - Photorealistic, fast
3. **Leonardo AI** - Free backup when others fail

### When Leonardo is Used

- ✅ Primary providers (DALL-E/Replicate) are unavailable
- ✅ Primary providers fail or error out
- ✅ User explicitly requests Leonardo
- ✅ Free tier quota is available (150/day)

### Automatic Fallback

```
DALL-E 3 → Fail → Replicate → Fail → Leonardo AI → Fail → Error
```

---

## Checking Usage Status

### Via Code

```typescript
import { getUsageStats, getRemainingToday } from './server/services/leonardoImageService';

// Get today's stats
const stats = getUsageStats();
console.log(`Used: ${stats.today.used}/${stats.today.limit}`);
console.log(`Remaining: ${stats.today.remaining}`);

// Quick check
const remaining = getRemainingToday();
console.log(`Can generate ${remaining} more images today`);
```

### Via Console

When generating images, the system automatically logs:
```
ℹ️ [Leonardo] Usage: 113/150 images (75%)
ℹ️ [Leonardo] Remaining: 37 images today
```

---

## Scaling Up Subscription

When you see this message:
```
❌ LEONARDO FREE TIER LIMIT REACHED!
❌ Action Required: Upgrade subscription or wait until tomorrow
```

### Upgrade Steps:

1. Go to [Leonardo.ai Pricing](https://leonardo.ai/pricing)
2. Choose a plan:
   - **Starter**: $10/month - 8,500 images/month
   - **Professional**: $24/month - 25,000 images/month
   - **Business**: $48/month - 60,000 images/month
3. Upgrade your account
4. **No code changes needed** - API key stays the same
5. System will automatically use higher limits

### Update Limit in Code (Optional)

If you upgrade, you can update the limit in:
```
server/services/leonardoImageService.ts
```

Change:
```typescript
const FREE_TIER_LIMIT = 150; // Update to your plan's limit
```

**Note:** Leonardo API may auto-detect your plan. If so, you can remove the limit check entirely.

---

## Testing

### Test Leonardo Integration

```typescript
import { generateWithLeonardo } from './server/services/leonardoImageService';

const result = await generateWithLeonardo({
  prompt: "Professional HVAC technician in Atlanta, modern commercial photography",
  width: 1024,
  height: 1024,
});

console.log('Image URL:', result.url);
console.log('Daily usage:', result.dailyUsage);
console.log('Remaining:', result.remainingToday);
```

### Test Usage Tracking

```typescript
import { getUsageStats, logUsageStatus } from './server/services/leonardoImageService';

// Log current status
logUsageStatus();

// Get detailed stats
const stats = getUsageStats();
console.log(JSON.stringify(stats, null, 2));
```

---

## Troubleshooting

### "API key not configured"

**Solution:** Add `LEONARDO_AI_API_KEY` to your `.env` file and restart server.

### "Limit reached"

**Solutions:**
1. Wait until tomorrow (limit resets at midnight UTC)
2. Upgrade your Leonardo subscription
3. Use DALL-E 3 or Replicate instead (if available)

### "Generation timed out"

**Solution:** Leonardo API can be slow. The timeout is 60 seconds. If it fails:
- Try again
- Use a different provider
- Check Leonardo API status

### Usage file not created

**Solution:** The system will create `data/leonardo-usage.json` automatically. If it fails:
- Check file permissions
- Create `data/` directory manually
- Check disk space

---

## API Reference

### Generate Image

```typescript
generateWithLeonardo(options: LeonardoImageOptions): Promise<LeonardoImageResult>
```

**Options:**
- `prompt`: Image description
- `modelId`: Leonardo model ID (optional, defaults to Diffusion XL)
- `width`: Image width (default: 1024)
- `height`: Image height (default: 1024)
- `numImages`: Number of images (default: 1)

### Get Usage Stats

```typescript
getUsageStats(): UsageStats
```

Returns:
- `today.used`: Images used today
- `today.remaining`: Images remaining today
- `today.limit`: Daily limit
- `today.percentage`: Usage percentage
- `recent`: Last 7 days of usage

### Check Remaining

```typescript
getRemainingToday(): number
```

Returns: Number of images remaining today (0-150)

---

## Notes

- ✅ Usage resets daily at midnight UTC
- ✅ Usage history kept for 30 days
- ✅ Automatic fallback when limit reached
- ✅ No subscription required to use free tier
- ✅ Upgrade anytime without code changes

---

**Ready to use!** Just add your API key and restart the server. 🚀

