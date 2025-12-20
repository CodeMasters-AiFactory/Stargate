# 🚀 HOW TO GENERATE A WEBSITE - STEP BY STEP

## 📋 **USER STEPS (What You Do)**

### **Step 1: Open Website Builder**

1. Navigate to **"Stargate Websites"** in the sidebar
2. Click **"Create New Website"** or **"Merlin Website Wizard"**

### **Step 2: Fill Out the Wizard**

The wizard has multiple pages. Fill them out:

#### **Page 1: Basic Information**

- ✅ Business Name (e.g., "The Roasted Bean")
- ✅ Business Type/Industry (e.g., "Coffee Shop", "Restaurant", "Legal")
- ✅ Location (City, Region, Country)
- ✅ Click **"Next"**

#### **Page 2: Services & Offerings**

- ✅ List your services/products
- ✅ Add descriptions (optional)
- ✅ Click **"Next"**

#### **Page 3: Target Audience**

- ✅ Who are your customers?
- ✅ What are their goals?
- ✅ Click **"Next"**

#### **Page 4: Style Preferences** (Optional)

- ✅ Choose color scheme
- ✅ Select tone of voice (Professional, Friendly, etc.)
- ✅ Pick style keywords
- ✅ Click **"Next"**

#### **Page 5: Additional Pages** (Optional)

- ✅ Select which pages to generate:
  - Home
  - About
  - Services
  - Contact
  - FAQ
  - etc.
- ✅ Click **"Next"**

#### **Page 6: Review & Generate**

- ✅ Review all your information
- ✅ Click **"Generate Website"** button

---

## ⚙️ **WHAT HAPPENS AUTOMATICALLY (110 Internal Steps)**

Once you click **"Generate Website"**, the system automatically runs through **110 steps**:

### **PHASE 1: Setup** (Steps 1-3)

1. ✅ Load your project configuration
2. ✅ Create output directory
3. ✅ Initialize quality iteration system

### **PHASE 2: Design Strategy** (Steps 4-7)

4. ✅ Generate AI design strategy
5. ✅ Create design context
6. ✅ Generate design outputs
7. ✅ Plan section structure

### **PHASE 3: Layout & Style** (Steps 8-25)

8. ✅ Generate section plan (hero, services, about, etc.)
9. ✅ Create layout structure
10. ✅ Generate style system (colors, fonts, spacing)
11. ✅ Apply responsive rules

### **PHASE 4: Content Generation** (Steps 26-50)

26. ✅ Generate intelligent copy for each section
27. ✅ Create industry-specific headlines
28. ✅ Write compelling paragraphs
29. ✅ Generate CTAs (Call-to-Actions)
30. ✅ Plan images for each section
31. ✅ Generate image prompts

### **PHASE 5: SEO & Optimization** (Steps 51-60)

51. ✅ Generate SEO metadata
52. ✅ Create page titles
53. ✅ Write meta descriptions
54. ✅ Generate keywords
55. ✅ Create Open Graph tags
56. ✅ Generate Schema.org structured data

### **PHASE 6: Code Generation** (Steps 61-80)

61. ✅ Generate HTML for each page
62. ✅ Create CSS stylesheet
63. ✅ Generate JavaScript
64. ✅ Build navigation menu
65. ✅ Create header & footer
66. ✅ Inject SEO metadata
67. ✅ Apply responsive design
68. ✅ Save all files

### **PHASE 7: Quality Assessment** (Steps 81-95)

81. ✅ Capture screenshots (desktop, tablet, mobile)
82. ✅ Analyze visual design (Score: 9.0/10)
83. ✅ Analyze UX & structure (Score: 9.0/10)
84. ✅ Analyze content quality (Score: 7.5+/10 with new system)
85. ✅ Analyze conversion elements
86. ✅ Analyze SEO foundations (Score: 9.0/10)
87. ✅ Calculate overall score
88. ✅ Generate quality report

### **PHASE 8: Finalization** (Steps 96-110)

96. ✅ Check quality thresholds
97. ✅ Revise if needed (up to 3 iterations)
98. ✅ Save metadata
99. ✅ Package website files
100.  ✅ Return generated website

---

## 🎯 **API ENDPOINT**

The frontend calls:

```
POST /api/website-builder/generate
```

**Request Body:**

```json
{
  "requirements": {
    "businessName": "The Roasted Bean",
    "businessType": "Coffee Shop",
    "location": {
      "city": "Pretoria",
      "region": "Gauteng",
      "country": "ZA"
    },
    "services": [
      {
        "name": "Espresso",
        "shortDescription": "Premium espresso drinks"
      }
    ],
    "targetAudiences": ["Coffee Enthusiasts", "Remote Workers"],
    "toneOfVoice": "Friendly, Professional",
    "styleKeywords": ["Modern", "Cozy", "Artisan"],
    "primaryColor": "#8B4513",
    "pagesToGenerate": ["Home", "About", "Services", "Contact"]
  },
  "enableLivePreview": true
}
```

**Response:** Server-Sent Events (SSE) stream with progress updates:

```
data: {"stage": "planning", "progress": 10, "message": "Generating design strategy..."}
data: {"stage": "layout", "progress": 30, "message": "Creating layout structure..."}
data: {"stage": "content", "progress": 50, "message": "Generating intelligent copy..."}
data: {"stage": "code", "progress": 70, "message": "Generating HTML, CSS, JavaScript..."}
data: {"stage": "quality", "progress": 90, "message": "Assessing quality..."}
data: {"stage": "complete", "progress": 100, "data": {...}}
```

---

## 📊 **GENERATION TIME**

- **Typical**: 30-60 seconds
- **With images**: 60-120 seconds
- **With quality iteration**: 90-180 seconds

---

## ✅ **WHAT YOU GET**

After generation completes, you receive:

1. **Multi-page website** with:
   - Home page
   - About page
   - Services page
   - Contact page
   - Additional pages you selected

2. **Complete files**:
   - HTML files for each page
   - CSS stylesheet
   - JavaScript file
   - Images (if generated)

3. **SEO optimized**:
   - Meta tags
   - Open Graph tags
   - Schema.org structured data

4. **Quality report**:
   - Visual design score
   - UX score
   - Content quality score
   - SEO score
   - Overall score

---

## 🎨 **PREVIEW & DOWNLOAD**

After generation:

1. **Preview** - View the website in the preview panel
2. **Download** - Click "Download Website" to get a ZIP file
3. **Edit** - Make changes and regenerate

---

## 🔄 **AUTO MODE vs MANUAL MODE**

### **Auto Mode** (Recommended)

- ✅ Fills all fields automatically
- ✅ Uses intelligent defaults
- ✅ Faster generation
- ✅ Best for quick prototypes

### **Manual Mode**

- ✅ You fill each field
- ✅ More control
- ✅ Customized results
- ✅ Best for specific requirements

---

## 📝 **EXAMPLE: Generating "The Roasted Bean"**

1. **Open Website Builder**
2. **Fill Basic Info**:
   - Name: "The Roasted Bean"
   - Type: "Coffee Shop"
   - Location: "Pretoria, Gauteng"
3. **Add Services**:
   - "Espresso"
   - "Pour Over"
   - "Pastries"
4. **Select Style**:
   - Colors: Brown, Cream
   - Tone: "Friendly, Artisan"
5. **Click "Generate Website"**
6. **Wait 30-60 seconds**
7. **Preview your website!**

---

## 🎯 **QUICK START**

**Fastest way to generate a website:**

1. Open **Merlin Website Wizard**
2. Click **"Auto Mode"**
3. Enter **Business Name** and **Industry**
4. Click **"Generate Website"**
5. Done! 🎉

---

**For detailed internal steps, see:** `WEBSITE_GENERATION_PIPELINE_STEPS.md`
