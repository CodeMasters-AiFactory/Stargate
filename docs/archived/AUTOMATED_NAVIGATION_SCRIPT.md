# 🚀 Automated Navigation Script

**Strategy:** Use JavaScript injection to click button by data-testid attribute

**Button Location:** `data-testid="button-select-stargate-websites"`

**Action:** Sets `currentView: 'merlin-packages'`

---

## JavaScript Injection Code

```javascript
// Find button by data-testid and click it
const button = document.querySelector('[data-testid="button-select-stargate-websites"]');
if (button) {
  button.click();
  console.log('✅ Clicked Select Merlin Website button');
} else {
  console.error('❌ Button not found');
}
```

---

**Status:** Ready to execute

