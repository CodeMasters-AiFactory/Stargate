# Conflicting Code Patterns Found

## Patterns from Multiple AI Contributions

### 1. Duplicate/Commented Code in websiteInvestigation.ts

**Location**: `server/services/websiteInvestigation.ts` lines 719-1444
**Issue**: Large block of commented-out code (old implementation)
**Impact**: Code bloat, confusion
**Recommendation**: Remove commented code or move to separate file for reference

### 2. Multiple Website Generator Implementations

**Found**:

- `server/services/unifiedWebsiteGenerator.ts` - DEPRECATED (marked as such)
- `server/services/merlinDesignLLM.ts` - ACTIVE
- `server/services/sterlingWebsiteGenerator.ts` - Reference implementation
- `server/services/multipageGenerator.ts` - Active

**Issue**: Multiple implementations, unclear which to use
**Recommendation**:

- Keep active implementations (merlinDesignLLM, multipageGenerator)
- Remove or clearly mark deprecated ones
- Document which to use when

### 3. Different OpenAI Client Creation Patterns

**Found in**:

- `server/services/unifiedWebsiteGenerator.ts` - `createOpenAIClient()` function
- `server/services/sterlingWebsiteGenerator.ts` - Similar function
- `server/services/websiteInvestigation.ts` - Direct `openai` variable

**Issue**: Inconsistent patterns for creating OpenAI clients
**Recommendation**: Standardize on one pattern, create utility function

### 4. Component Size Issues

**WebsiteBuilderWizard.tsx**: 6941 lines
**Issue**: Too large, should be split
**Recommendation**: Split into:

- RequirementsForm (lines ~2000-4000)
- InvestigationProgress (lines ~4000-5000)
- WebsitePreview (lines ~5000-6000)
- ReviewStage (lines ~6000-6941)

## Standardization Recommendations

1. **Remove commented code** - Clean up websiteInvestigation.ts
2. **Document active vs deprecated** - Clear markers for which generators to use
3. **Create shared utilities** - OpenAI client creation, common patterns
4. **Split large components** - WebsiteBuilderWizard needs refactoring
