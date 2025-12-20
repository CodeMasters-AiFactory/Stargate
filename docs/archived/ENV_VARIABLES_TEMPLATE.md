# Environment Variables Template

Copy this to `.env` file in project root:

```env
# ============================================
# CORE CONFIGURATION
# ============================================
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5000
VITE_API_URL=http://localhost:5000

# ============================================
# DATABASE
# ============================================
DATABASE_URL=postgresql://postgres:password@localhost:5432/stargate

# ============================================
# SESSION & SECURITY
# ============================================
SESSION_SECRET=your-secure-random-string-minimum-32-characters

# ============================================
# AZURE SERVICES (Production)
# ============================================
AZURE_STORAGE_CONNECTION_STRING=
AZURE_STORAGE_ACCOUNT_NAME=
AZURE_STORAGE_ACCOUNT_KEY=

# ============================================
# AI API KEYS
# ============================================
OPENAI_API_KEY=
AI_INTEGRATIONS_OPENAI_API_KEY=
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1
ANTHROPIC_API_KEY=
GOOGLE_GENAI_API_KEY=

# ============================================
# IMAGE GENERATION
# ============================================
LEONARDO_AI_API_KEY=

# ============================================
# SEARCH & SCRAPING
# ============================================
GOOGLE_SEARCH_API_KEY=
GOOGLE_SEARCH_ENGINE_ID=

# ============================================
# EMAIL & MARKETING
# ============================================
MAILCHIMP_LIST_ID=

# ============================================
# PAYMENT PROCESSING
# ============================================
STRIPE_SECRET_KEY=
VITE_STRIPE_PUBLISHABLE_KEY=

# ============================================
# CDN & ASSETS
# ============================================
CDN_BASE_URL=
```

**Required for Production:**
- DATABASE_URL
- SESSION_SECRET
- FRONTEND_URL
- NODE_ENV=production

