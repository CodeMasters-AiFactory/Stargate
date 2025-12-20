# 🔍 Google Custom Search API Setup Guide

## Step 1: Get Google Custom Search API Key

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a New Project** (or select existing)
   - Click the project dropdown at the top
   - Click "New Project"
   - Name it: "Stargate Scraper" (or any name)
   - Click "Create"

3. **Enable Custom Search API**
   - Go to: https://console.cloud.google.com/apis/library/customsearch.googleapis.com
   - Click "Enable"

4. **Create API Key**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Click "Create Credentials" → "API Key"
   - Copy the API key (you'll need it in Step 3)

5. **Create Custom Search Engine**
   - Go to: https://programmablesearchengine.google.com/controlpanel/create
   - Click "Add" to create a new search engine
   - **Sites to search:** Enter `*` (asterisk) to search the entire web
   - Click "Create"
   - Click "Control Panel" for your new engine
   - Copy the **Search Engine ID** (you'll need it in Step 3)

## Step 2: Add Keys to Your Project

**Location:** Add these lines to your `.env` file in the project root:

```env
GOOGLE_SEARCH_API_KEY=your_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
```

### Where is the .env file?

The `.env` file is in the **root directory** of your project:
```
C:\CURSOR PROJECTS\StargatePortal\.env
```

### How to edit it:

1. **Open the file** in any text editor (Notepad, VS Code, etc.)
2. **Add the two lines** above with your actual keys
3. **Save the file**
4. **Restart the dev server** for changes to take effect

### Example .env file:

```env
# Session Secret
SESSION_SECRET=your-secret-here

# Google Custom Search API (for website scraper)
GOOGLE_SEARCH_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_SEARCH_ENGINE_ID=012345678901234567890:abcdefghijk

# Other API keys (if you have them)
ANTHROPIC_API_KEY=your-key-here
OPENAI_API_KEY=your-key-here
```

## Step 3: Restart Server

After adding the keys, restart your dev server:

```powershell
# Stop the current server (Ctrl+C in the terminal)
# Then restart:
npm run dev
```

## Step 4: Test It

1. Go to: `http://localhost:5000/stargate-websites`
2. Click "Admin Panel" button
3. Go to "Website Scraper" tab
4. Select:
   - Industry: "Accounting"
   - Country: "United States"
   - State: "Alabama" (or leave blank)
5. Click "Search Top 50"

You should now see search results! 🎉

## Troubleshooting

**If you get 0 results:**
- Check that both keys are in `.env` file
- Make sure there are no extra spaces in the keys
- Restart the server after adding keys
- Check server console for error messages

**If you get API errors:**
- Verify the API key is correct
- Make sure Custom Search API is enabled in Google Cloud Console
- Check that your Search Engine ID is correct
- Make sure billing is enabled (Google gives free credits)

## Free Tier Limits

Google Custom Search API:
- **100 free searches per day**
- After that, it's $5 per 1,000 searches

This is plenty for testing and small-scale scraping!

