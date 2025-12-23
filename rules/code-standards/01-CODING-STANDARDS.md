# Code Standards

## TypeScript/React Standards

### File Naming
- Components: `PascalCase.tsx` (e.g., `QuickIntake.tsx`)
- Utilities: `camelCase.ts` (e.g., `htmlGenerator.ts`)
- Types: `types.ts` or inline

### Component Structure
```typescript
/**
 * ═══════════════════════════════════════════════════════════════════
 * COMPONENT NAME - Brief Description
 * ═══════════════════════════════════════════════════════════════════
 */

import React from 'react';
// imports...

interface Props {
  // typed props
}

export default function ComponentName({ prop1, prop2 }: Props) {
  // hooks first
  const [state, setState] = useState();
  
  // effects
  useEffect(() => {}, []);
  
  // handlers
  const handleClick = () => {};
  
  // render
  return (
    <div>...</div>
  );
}
```

### Error Handling
```typescript
try {
  const result = await apiCall();
  // handle success
} catch (error) {
  console.error('[Module Name] Error:', error);
  // user-friendly error handling
}
```

---

## Git Commit Standards

### Format
```
type(scope): description

- detail 1
- detail 2
```

### Types
- `feat` - New feature
- `fix` - Bug fix
- `refactor` - Code restructure
- `docs` - Documentation
- `style` - Formatting
- `test` - Testing
- `chore` - Maintenance

### Examples
```
feat(merlin8): add accounting industry DNA

- Complete color scheme and fonts
- Leonardo AI image prompts
- Professional copy tone

fix(ui): correct text overlay contrast on hero images

refactor(generator): optimize image generation pipeline
```

---

## Testing Checklist

Before marking ANY feature complete:

### Frontend
- [ ] Component renders without errors
- [ ] All user interactions work
- [ ] Mobile responsive
- [ ] Loading states shown
- [ ] Error states handled

### Backend
- [ ] API endpoint returns correct data
- [ ] Error responses are proper JSON
- [ ] No console errors
- [ ] File operations complete successfully

### Full Flow
- [ ] End-to-end test passes
- [ ] Generated output is correct
- [ ] Files saved to correct location
- [ ] Can preview generated website

---

## PowerShell Notes (Windows)

Use semicolons for command chaining:
```powershell
# Correct
cd "C:\CURSOR PROJECTS\StargatePortal"; npm run dev

# Wrong (bash syntax)
cd "C:\CURSOR PROJECTS\StargatePortal" && npm run dev
```

Paths with spaces need quotes:
```powershell
cd "C:\CURSOR PROJECTS\StargatePortal"
```
