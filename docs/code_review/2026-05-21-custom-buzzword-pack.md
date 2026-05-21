# Code Review: Custom Buzzword Pack Feature

**Date:** 2026-05-21
**PR:** #1 — Custom buzzword pack creator
**Reviewer:** Governance (automated)
**Status:** PASS (all issues fixed in-place)

---

## Files Reviewed

| File | Lines | Status |
|------|-------|--------|
| `src/App.tsx` | 86 | PASS |
| `src/components/CategorySelect.tsx` | 61 | PASS |
| `src/components/CustomPackCreator.tsx` | 81 | PASS |
| `src/context/GameContext.tsx` | 139 | PASS (1 fix) |
| `src/lib/cardGenerator.ts` | 46 | PASS |
| `src/types/index.ts` | 60 | PASS |

---

## Issues Found and Fixed

### 1. `react-hooks/refs` — Ref mutation during render in `useGame.ts`
**File:** `src/hooks/useGame.ts` (lines 19, 21)
**Severity:** Error
**Description:** `cardRef.current = card` and `onWordsDetectedRef.current = onWordsDetected` were assigned directly in the render body, which React's strict mode and the refs lint rule flag as incorrect.
**Fix:** Moved both mutations into dependency-free `useEffect` calls so they run after render, not during it.

### 2. `react-hooks/use-memo` — Non-inline function in `useCallback` in `GameBoard.tsx`
**File:** `src/components/GameBoard.tsx` (line 55)
**Severity:** Error
**Description:** `useCallback(onWin, [onWin])` passed a variable reference instead of an inline function, violating the `react-hooks/use-memo` rule. The pattern is also redundant (wrapping a prop in useCallback doesn't stabilise it).
**Fix:** Replaced with a ref-based pattern: `onWinRef` stores the latest `onWin` prop, updated via `useEffect`, and the win effect calls `onWinRef.current(...)` directly.

### 3. `react-refresh/only-export-components` — Hook co-located with component exports in `GameContext.tsx`
**File:** `src/context/GameContext.tsx` (line 134)
**Severity:** Error
**Description:** `useGame` is exported from the same file as the `GameProvider` component, breaking fast-refresh's assumption that component files export only components.
**Fix:** Added an inline `eslint-disable-next-line` comment with justification. Moving the hook to a separate file would require re-exporting `GameContext` (currently unexported by design); the disable is the appropriate fix.

### 4. `no-useless-assignment` — Dead initial value in `wordDetector.ts`
**File:** `src/lib/wordDetector.ts` (line 34)
**Severity:** Error
**Description:** `let found = false` was immediately overwritten in the subsequent `if/else` block, making the `false` initialiser unreachable.
**Fix:** Changed to `let found: boolean` (type annotation only, no value), which is both correct and satisfies the lint rule.

### 5. Unused `eslint-disable` directive in `useGame.ts`
**File:** `src/hooks/useGame.ts` (line 57)
**Severity:** Warning
**Description:** After fixing the ref-mutation issue, the `// eslint-disable-next-line react-hooks/exhaustive-deps` comment became unnecessary.
**Fix:** Removed the disable directive; updated the comment above to reflect the actual reasoning.

---

## Standards Verification

| Standard | Result |
|----------|--------|
| TypeScript strict — no `any` | PASS |
| Max 500 lines per file | PASS (largest: 139 lines) |
| No `console.log` | PASS |
| No hardcoded secrets | PASS |
| Naming: PascalCase components, camelCase utilities | PASS |

---

## Feature Assessment

The custom buzzword pack creator is well-structured:
- `CustomPackCreator` is a clean, self-contained component with local state only.
- `CategoryId` type correctly extended to include `'custom'`.
- `GameState` correctly adds `customWords` and `customPackName` (nullable).
- `generateCard` handles the `'custom'` branch safely with a minimum-word guard.
- `App.tsx` wires the new `'custom'` screen without breaking existing navigation.
- `GameContext` reducer passes `customWords` through to `generateCard` and persists them to localStorage automatically via the existing `useEffect`.
