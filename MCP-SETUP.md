# MCP Servers Setup Guide

## Currently Installed (23 servers)

### ✅ Working Without API Keys (13 servers)
| Server | Package | Status |
|--------|---------|--------|
| **Sequential Thinking** | `@modelcontextprotocol/server-sequential-thinking` | ✅ Connected |
| **GitHub** | `@modelcontextprotocol/server-github` | ✅ Connected |
| **Memory** | `@modelcontextprotocol/server-memory` | ✅ Connected |
| **Filesystem** | `@modelcontextprotocol/server-filesystem` | ✅ Connected |
| **Puppeteer** | `puppeteer-mcp-server` | ✅ Connected |
| **Playwright** | `@playwright/mcp` | ✅ Connected |
| **Figma** | `figma-mcp` | ✅ Connected |
| **Notion** | `@notionhq/notion-mcp-server` | ✅ Connected |
| **Postgres** | `mcp-postgres` | ✅ Connected |
| **SQLite** | `mcp-sqlite` | ✅ Connected |
| **Exa** | `exa-mcp-server` | ✅ Connected |
| **Google Workspace** | `mcp-server-google-workspace` | ✅ Connected |
| **Knowledge Graph** | `mcp-knowledge-graph` | ✅ Connected |

### ⚠️ Needs API Keys or Configuration (10 servers)
| Server | Required Environment Variable | Get Key From |
|--------|-------------------------------|--------------|
| **Linear** | `LINEAR_ACCESS_TOKEN` | [Linear Settings > API](https://linear.app/settings/api) |
| **Slack** | `SLACK_BOT_TOKEN` | [Slack Apps](https://api.slack.com/apps) |
| **Sentry** | `SENTRY_AUTH_TOKEN` | [Sentry API Tokens](https://sentry.io/settings/account/api/auth-tokens/) |
| **Supabase** | `SUPABASE_URL`, `SUPABASE_KEY` | Supabase Project Settings |
| **Stripe** | `STRIPE_SECRET_KEY` | [Stripe API Keys](https://dashboard.stripe.com/apikeys) |
| **Cloudflare** | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Dashboard |
| **Docker** | None (needs Docker Desktop running) | Start Docker Desktop |
| **Time** | None (may need reinstall) | - |
| **DuckDuckGo** | None (may need reinstall) | - |
| **Screenshot** | None (may need reinstall) | - |

---

## Configuration Commands

### Configure Linear MCP ⭐ (Required by User)
1. Go to [Linear Settings > API](https://linear.app/settings/api)
2. Click "Create new API key" or use an existing one
3. Copy the token and run:
```bash
npx @anthropic-ai/claude-code mcp remove linear
npx @anthropic-ai/claude-code mcp add linear --env LINEAR_ACCESS_TOKEN=lin_api_YOUR_TOKEN_HERE -- npx -y linear-mcp
```

### Configure Slack MCP
```bash
npx @anthropic-ai/claude-code mcp remove slack
npx @anthropic-ai/claude-code mcp add slack --env SLACK_BOT_TOKEN=xoxb-YOUR-TOKEN -- npx -y slack-mcp-server
```

### Configure Sentry MCP
```bash
npx @anthropic-ai/claude-code mcp remove sentry
npx @anthropic-ai/claude-code mcp add sentry --env SENTRY_AUTH_TOKEN=YOUR_TOKEN -- npx -y @sentry/mcp-server
```

### Configure Supabase MCP
```bash
npx @anthropic-ai/claude-code mcp remove supabase
npx @anthropic-ai/claude-code mcp add supabase \
  --env SUPABASE_URL=https://your-project.supabase.co \
  --env SUPABASE_KEY=your_anon_key \
  -- npx -y supabase-mcp
```

### Configure Stripe MCP
```bash
npx @anthropic-ai/claude-code mcp remove stripe
npx @anthropic-ai/claude-code mcp add stripe --env STRIPE_SECRET_KEY=sk_test_YOUR_KEY -- npx -y @stripe/mcp
```

### Configure Cloudflare MCP
```bash
npx @anthropic-ai/claude-code mcp remove cloudflare
npx @anthropic-ai/claude-code mcp add cloudflare \
  --env CLOUDFLARE_API_TOKEN=YOUR_TOKEN \
  --env CLOUDFLARE_ACCOUNT_ID=YOUR_ACCOUNT_ID \
  -- npx -y @cloudflare/mcp-server-cloudflare
```

---

## Server Capabilities

### 🧠 AI & Reasoning
- **Sequential Thinking**: Step-by-step problem solving
- **Memory**: Persistent context storage

### 💻 Development
- **GitHub**: Git operations, PRs, issues
- **Filesystem**: File system access
- **Puppeteer**: Browser automation
- **Playwright**: Cross-browser testing
- **Docker**: Container management

### 📊 Databases
- **Postgres**: PostgreSQL operations
- **SQLite**: SQLite operations
- **Supabase**: Supabase backend

### 🔌 Integrations
- **Linear**: Issue tracking
- **Notion**: Documentation
- **Figma**: Design files
- **Slack**: Team communication
- **Sentry**: Error tracking
- **Stripe**: Payments
- **Cloudflare**: CDN & DNS
- **Google Workspace**: Gmail, Calendar, Drive
- **Exa**: AI-powered search

---

## Quick Test

Check all server status:
```bash
npx @anthropic-ai/claude-code mcp list
```

---

**Last Updated**: December 26, 2025
