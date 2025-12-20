# Merlin 7.0 Navigation Baseline

**Version**: 7.0  
**Date**: January 2025  
**Status**: ✅ **IMPLEMENTED**

---

## Overview

This document describes how multi-page generation and navigation integrity work in Merlin 7.0. All generated websites use **relative file paths** for navigation links, ensuring they work correctly as static sites.

---

## Multi-Page Generation

### How It Works

1. **Page Planning** (`pagePlannerEngine.ts`)
   - Generates a `PagePlan` with multiple `PlannedPage` objects
   - Each page has:
     - `id`: Unique identifier (e.g., "home", "about", "services")
     - `slug`: URL-friendly identifier (e.g., "home", "about", "services")
     - `title`: Display name (e.g., "Home", "About Us", "Our Services")
     - `type`: Page type (`home`, `about`, `services`, `contact`, etc.)
     - `sections`: Array of sections for this page
     - `required`: Whether this page appears in navigation

2. **Section Generation** (`pagePlannerEngine.ts`)
   - Each page type gets appropriate sections:
     - **Home**: `hero`, `services`, `features`
     - **About**: `hero`, `about`, `values`
     - **Services**: `hero`, `services`
     - **Contact**: `hero`, `contact`
     - **Other**: `hero` (default)

3. **HTML Generation** (`htmlGenerator.ts`)
   - Generates a separate HTML file for each `PlannedPage`
   - Filename convention:
     - `home` → `index.html`
     - All others → `{slug}.html` (e.g., `about.html`, `services.html`)

---

## Navigation Convention

### Page Slug → Filename Mapping

| Page Slug  | Filename        | Example URL     |
| ---------- | --------------- | --------------- |
| `home`     | `index.html`    | `index.html`    |
| `about`    | `about.html`    | `about.html`    |
| `services` | `services.html` | `services.html` |
| `contact`  | `contact.html`  | `contact.html`  |
| `faq`      | `faq.html`      | `faq.html`      |
| `pricing`  | `pricing.html`  | `pricing.html`  |

### Navigation Links

All navigation links use **relative file paths**, not absolute routes:

```html
<!-- ✅ CORRECT (Relative paths) -->
<nav>
  <a href="index.html">Home</a>
  <a href="about.html">About</a>
  <a href="services.html">Services</a>
  <a href="contact.html">Contact</a>
</nav>

<!-- ❌ WRONG (Absolute paths) -->
<nav>
  <a href="/">Home</a>
  <a href="/about">About</a>
  <a href="/services">Services</a>
  <a href="/contact">Contact</a>
</nav>
```

### Implementation

The `generateNavigation()` function in `htmlGenerator.ts`:

1. Gets all required pages from the page plan
2. Converts each page slug to a filename using `slugToFilename()`
3. Generates relative links: `href="${filename}"`

---

## Navigation Integrity Rules

### QA Engine Checks

The QA Engine (`qaEngine.ts`) performs navigation integrity checks:

1. **File Existence Check**
   - For each generated HTML file, extracts all `<a>` tags in navigation
   - Checks that each internal link points to an existing file
   - Skips external links (`http://`, `https://`, `mailto:`, `tel:`, `#`)

2. **Scoring**
   - **10/10**: All navigation links resolve to existing files
   - **8-9/10**: Most links work (warning status)
   - **<8/10**: Critical failure (fail status)

3. **Thresholds**
   - **PASS**: `navigationIntegrityScore >= 8` AND `status === 'pass'`
   - **FAIL**: `navigationIntegrityScore < 8` OR `status === 'fail'`
   - **WARNING**: `navigationIntegrityScore >= 8` BUT `status === 'warning'`

### QA Report Structure

```typescript
interface NavigationMetrics {
  score: number; // 0-10
  integrityScore: number; // 0-10 (same as score)
  status: 'pass' | 'fail' | 'warning';
  totalLinks: number;
  workingLinks: number;
  brokenLinks: number;
  issues: NavigationIssue[];
}
```

### Critical Failures

If navigation integrity fails:

- QA report includes `[CRITICAL]` error message
- Overall QA verdict may be downgraded
- Orchestrator logs the error
- Generation may be marked as failed

---

## Static File Serving

### Express Configuration

Static files are served from `website_projects/` directory:

```typescript
// server/index.ts
const websiteProjectsPath = path.join(process.cwd(), 'website_projects');
app.use('/website_projects', express.static(websiteProjectsPath));
```

### URL Structure

Generated websites are accessible at:

```
http://localhost:5000/website_projects/{projectSlug}/generated-v5/index.html
http://localhost:5000/website_projects/{projectSlug}/generated-v5/about.html
http://localhost:5000/website_projects/{projectSlug}/generated-v5/services.html
```

### No Route Conflicts

- Main app routes: `/`, `/about`, `/services`, etc. (Stargate Portal app)
- Generated websites: `/website_projects/.../index.html` (static files)
- No conflicts because generated sites use relative links within their folder

---

## Example: Blue Horizon Consulting

### Generated Files

```
website_projects/blue-horizon-consulting/generated-v5/
├── index.html          (Home page)
├── about.html          (About page)
├── services.html       (Services page)
├── contact.html        (Contact page)
├── faq.html            (FAQ page)
├── assets/
│   ├── styles/
│   │   └── main.css
│   ├── scripts/
│   │   └── main.js
│   └── images/
├── sitemap.xml
└── robots.txt
```

### Navigation HTML (from index.html)

```html
<nav class="navigation">
  <div class="nav-container">
    <a href="index.html" class="nav-logo">Blue Horizon Consulting</a>
    <ul class="nav-menu">
      <li><a href="index.html" class="active">Home</a></li>
      <li><a href="about.html">About Us</a></li>
      <li><a href="services.html">Our Services</a></li>
      <li><a href="contact.html">Contact</a></li>
    </ul>
  </div>
</nav>
```

### QA Scores

After regeneration:

- **NavigationIntegrityScore**: 10/10 ✅
- **VisualStyleScore**: 8.5/10 ✅
- **Overall QA**: PASS ✅

---

## Best Practices

1. **Always use relative paths** for internal links
2. **Test navigation** after generation
3. **Check QA report** for navigation integrity
4. **Ensure all required pages** are generated
5. **Verify file existence** before linking

---

## Troubleshooting

### Issue: 404 on navigation links

**Cause**: Links using absolute paths (`/about`) instead of relative (`about.html`)

**Fix**: Regenerate website - navigation now uses relative paths automatically

### Issue: QA fails navigation check

**Cause**: Missing HTML files or broken links

**Fix**:

1. Check that all required pages are generated
2. Verify file names match navigation links
3. Check QA report for specific broken links

### Issue: Navigation shows wrong pages

**Cause**: Page plan not generating required pages

**Fix**: Check `pagePlannerEngine.ts` - ensure `required: true` for navigation pages

---

## Summary

✅ **Multi-page generation**: Each page type gets appropriate sections  
✅ **Relative navigation**: All links use relative file paths  
✅ **QA integrity checks**: Navigation is validated automatically  
✅ **Static file serving**: Works correctly with Express  
✅ **No route conflicts**: Generated sites stay in their folder

**Status**: Production ready! 🚀
