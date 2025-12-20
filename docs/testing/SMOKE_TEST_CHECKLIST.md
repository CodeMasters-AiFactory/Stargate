# 🚨 SMOKE TEST QUICK CHECKLIST
## One-Page Reference - Follow This Every Time

**When user says "smoke test on [X]" → Execute ALL checks below**

---

## ✅ PREP (30 seconds)
- [ ] Identify scope: What feature/page/flow?
- [ ] Check environment: dev/staging/prod?
- [ ] Ensure app is running
- [ ] Clear browser cache if needed

---

## ✅ FUNCTIONAL & WORKFLOW (Must Pass)
- [ ] Primary user journey completes end-to-end
- [ ] All buttons/links do what they promise
- [ ] Edge cases work (empty inputs, invalid data, back button, refresh)
- [ ] No uncaught console errors
- [ ] No broken API calls (4xx/5xx without graceful handling)
- [ ] Loading states shown appropriately
- [ ] Error states are recoverable

---

## ✅ VISUAL/UI (Must Pass)
- [ ] No overlapping/cut-off content
- [ ] Works on desktop + tablet (~768px) + mobile (~375px)
- [ ] Colors/fonts/spacing consistent with design system
- [ ] Hover/focus/active states visible
- [ ] No broken/missing images or icons
- [ ] Responsive breakpoints work

---

## ✅ UX & CONTENT (Must Pass)
- [ ] Labels/headings/buttons are clear
- [ ] User knows "Where am I?" and "What's next?"
- [ ] Error messages are helpful and non-technical
- [ ] Success messages confirm what happened
- [ ] No placeholder text ("Lorem ipsum", "TODO")
- [ ] No spelling/grammar errors

---

## ✅ DATA & STATE (Must Pass)
- [ ] Form validation works (client + server)
- [ ] Saved data appears correctly after actions
- [ ] No duplicate records created
- [ ] Data persists across refresh where expected
- [ ] No stale views after navigation

---

## ✅ TECHNICAL/CODE (Must Pass)
- [ ] Run linter/type checks
- [ ] No swallowed exceptions for critical paths
- [ ] Logs are meaningful (no secrets leaked)
- [ ] Input validation on all user inputs
- [ ] No obvious injection points (SQL, JS, HTML)
- [ ] Authorization checks on protected actions

---

## ✅ PERFORMANCE (Sanity Check)
- [ ] Page loads to usable state < 3 seconds
- [ ] No infinite loops or runaway re-renders
- [ ] Large assets optimized (not multi-MB images)
- [ ] Animations smooth (60fps)

---

## ✅ ACCESSIBILITY (Minimums)
- [ ] Keyboard navigation works (Tab through flow)
- [ ] Focus indicators visible
- [ ] Buttons/links have clear purpose (text or aria-label)
- [ ] Form inputs have labels
- [ ] Color contrast readable (WCAG AA minimum)

---

## 🔧 ISSUE HANDLING (For Each Issue Found)

1. **DIAGNOSE**
   - [ ] Reproduce consistently
   - [ ] Check logs/console/network/code
   - [ ] Identify root cause

2. **FIX**
   - [ ] Propose solution
   - [ ] Apply fix (where permitted)
   - [ ] Keep changes minimal and clean

3. **VERIFY**
   - [ ] Re-run scenario that exposed issue
   - [ ] Check for regressions
   - [ ] Confirm issue is gone

4. **DOCUMENT**
   - [ ] Mark as Fixed or Blocked
   - [ ] Add to defects table in report

---

## 📊 REPORTING (Must Include)

- [ ] Summary: PASS / PASS WITH ISSUES / FAIL
- [ ] Checklist status for all 7 categories
- [ ] Defects table (ID, severity, area, steps, expected/actual, root cause, fix status)
- [ ] Fix summary (what was fixed)
- [ ] Evidence (screenshots, logs, network requests)
- [ ] Next actions (if not 100% clean)

---

## 🎯 EXIT CONDITIONS

**✅ PASS:** All checks pass → Report success with evidence

**❌ FAIL:** Hard external limit → Document all issues + prioritized next actions

**🔄 ITERATE:** After each fix → Re-test until 100% pass

---

## 🚫 DO NOT STOP UNTIL

- ✅ All checks pass at 100%, OR
- ✅ Hard external limit reached + fully documented

---

**Full Policy:** See `UNIFIED_SMOKE_TEST_POLICY.md`  
**Active Reference:** See `SMOKE_TEST_ACTIVE.md`

