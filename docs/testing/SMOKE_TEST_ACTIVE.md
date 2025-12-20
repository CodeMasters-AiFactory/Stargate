# 🚨 ACTIVE SMOKE TEST POLICY - ALWAYS FOLLOW THIS

**🚨 THIS IS THE ACTIVE POLICY - AUTOMATICALLY ENFORCED 🚨**

**When user says "smoke test" or "test [X]" → AUTOMATICALLY follow this policy**

## Auto-Enforcement Rules

When I hear: **"Run a smoke test on [X]"** or **"test [X]"** or **"smoke test [X]"**

I will AUTOMATICALLY:
1. ✅ Reference `UNIFIED_SMOKE_TEST_POLICY.md` (full policy)
2. ✅ Use `SMOKE_TEST_CHECKLIST.md` (quick reference)
3. ✅ Execute ALL checks from the policy
4. ✅ Fix issues autonomously (don't just report)
5. ✅ Collect evidence in `smoke-test-evidence/` directory
6. ✅ Don't stop until 100% pass OR hard external limit
7. ✅ Report in the format specified in the policy

## Quick Reference

**Primary Documents:**
- `UNIFIED_SMOKE_TEST_POLICY.md` - Complete policy (591 lines)
- `SMOKE_TEST_CHECKLIST.md` - One-page quick checklist
- `SMOKE_TEST_ACTIVE.md` - This file (active enforcement)

**Evidence Collection:**
- `smoke-test-evidence/` - All screenshots, logs, network captures, reports

## Key Rules (Abbreviated)

- **Test like a real user** - Actually click, type, navigate
- **Fix > Report** - Fix issues, don't just list them
- **Iterate until clean** - Re-test after every fix
- **Be specific** - Document exact location, steps, root cause
- **Use all tools** - Browser, logs, code, network, terminal

## Checklist Categories (Must Cover All)

1. ✅ Functional & Workflow
2. ✅ Visual/UI
3. ✅ UX & Content
4. ✅ Data & State
5. ✅ Technical/Code Sanity
6. ✅ Performance Sanity
7. ✅ Accessibility Minimums

## Exit Conditions

- ✅ **PASS**: All checks pass → Report success with evidence
- ❌ **FAIL**: Hard external limit → Document all issues + next actions

---

**Full Policy:** See `UNIFIED_SMOKE_TEST_POLICY.md` for complete details.

