# Testing Template Downloader - Instructions

## ⚠️ **IMPORTANT: Server Restart Required**

The new template downloader routes are registered in code, but **the server needs to be restarted** to pick them up.

---

## 🔄 **Step 1: Restart Server**

1. **Stop the current server** (if running in terminal, press `Ctrl+C`)
2. **Start the server again:**
   ```bash
   npm run dev
   ```
3. **Wait for server to fully start** (you'll see "Server running on port 5000")

---

## 🧪 **Step 2: Test the Downloader**

### **Option A: Using Browser/Postman**

1. **Check if route works:**
   ```
   GET http://localhost:5000/api/admin/templates/download/list
   ```
   Should return: `{ templates: [...], count: 602 }`

2. **Start download (5 templates for testing):**
   ```
   POST http://localhost:5000/api/admin/templates/download/templatemo?limit=5
   ```
   Should return: `{ message: "Download started", limit: 5 }`

3. **Monitor progress:**
   ```
   GET http://localhost:5000/api/admin/templates/download/progress
   ```
   Should return progress status

### **Option B: Using Test Script**

After server restart, run:
```bash
node test-template-downloader.js
```

---

## ✅ **What to Expect**

### **During Download:**
- Console logs showing: `📥 Downloading: [Template Name]...`
- Progress updates: `✅ Downloaded and processed: [Template Name]`
- Files saved to: `downloaded_templates/` and `downloaded_templates/extracted/`

### **After Download:**
- Templates saved to database (`brandTemplates` table)
- Status: `isPremium: false`, `isApproved: false`, `isActive: false`
- You can view them in Template Manager (`/admin`)

---

## 🔍 **Verification Steps**

1. **Check Database:**
   ```sql
   SELECT name, brand, category, "isPremium", "isApproved", "isActive" 
   FROM brand_templates 
   WHERE brand = 'templatemo' 
   ORDER BY "createdAt" DESC 
   LIMIT 10;
   ```

2. **Check Files:**
   - `downloaded_templates/` - ZIP files
   - `downloaded_templates/extracted/` - Extracted template files

3. **Check Template Manager:**
   - Go to `/admin`
   - Click "Templates" tab
   - You should see downloaded templates (pending approval)

---

## 🐛 **Troubleshooting**

### **Route Not Found (404)**
- ✅ **Solution:** Restart the server

### **Authentication Error (401)**
- ✅ **Solution:** The system has auto-login, but if it fails, refresh the browser

### **Download Fails**
- Check console logs for specific errors
- Verify internet connection
- Check if TemplateMo is accessible

### **Templates Not in Database**
- Check server console for errors
- Verify database connection
- Check `downloaded_templates/` folder for downloaded files

---

## 📊 **Expected Timeline**

- **5 templates:** ~2-3 minutes
- **10 templates:** ~5-6 minutes  
- **602 templates:** ~2-3 hours (with rate limiting)

---

## ✅ **Ready to Test!**

1. **Restart server**
2. **Run test** (5 templates first)
3. **Check results** in Template Manager
4. **Approve good ones**
5. **Download more if quality is good**

**Let me know when you've restarted the server and I can help test it!**

