# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Layout

```
meeting-bingo/       # The app (Vite + React 19 + TypeScript strict)
docs/code_review/    # Governance review reports
meeting-bingo-*.md   # Planning docs (PRD, architecture, implementation plan, UXR)
```

All app work happens inside `meeting-bingo/`. Run all commands from that directory.

## Commands

```bash
npm run dev          # Start dev server (Vite default port)
npm run build        # tsc -b && vite build → dist/
npm run preview      # Serve dist/ locally
npm run lint         # ESLint on all .ts/.tsx files
npm run typecheck    # tsc -b (strict mode — no errors tolerated)
```

There is no test suite. TypeScript strict mode and ESLint are the primary quality gates.

## Stack

| Concern | Choice |
|---|---|
| Framework | React 19 + TypeScript strict |
| Build | Vite 8 |
| Styling | Tailwind CSS 3 |
| Speech | Web Speech API (browser-native, no keys) |
| State | `useReducer` + Context (`src/context/GameContext.tsx`) |
| Persistence | `localStorage` only (`src/hooks/useLocalStorage.ts`) |
| Animation | CSS + `canvas-confetti` |
| Deployment | Vercel (GitHub integration — every push to `main` auto-deploys) |

No backend. No auth. All processing is client-side.

## Architecture

### Navigation

`App.tsx` owns a `screen` state and renders one top-level component at a time — no router:

```
'landing' → LandingPage
'category' → CategorySelect
'custom' → CustomPackCreator
'game' → GameBoard  (+  WinScreen overlay when showWinOverlay is true)
```

### Data Flow

1. User picks a category (or creates a custom pack) → `dispatch({ type: 'START_GAME', category, customWords?, customPackName? })`
2. `generateCard(categoryId, customWords?)` in `src/lib/cardGenerator.ts` shuffles words and builds a 5×5 `BingoSquare[][]`. Center square is always the FREE space.
3. `useSpeechRecognition` (`src/hooks/`) wraps the Web Speech API with `continuous: true, interimResults: true`. Each final transcript fires a callback.
4. `detectWordsWithAliases` in `src/lib/wordDetector.ts` matches transcript text against card words using word-boundary regex (single words) or substring match (phrases). `WORD_ALIASES` maps abbreviations like `CI/CD`, `ROI`.
5. `checkForBingo` in `src/lib/bingoChecker.ts` scans all 12 lines (5 rows + 5 cols + 2 diagonals) and returns the first `WinningLine` or `null`.
6. Win triggers `WinScreen` overlay + `canvas-confetti`.

### Key Types (`src/types/index.ts`)

- `CategoryId` — `'agile' | 'corporate' | 'tech' | 'custom'`
- `BingoSquare` — `{ id, word, isFilled, isAutoFilled, isFreeSpace, row, col }`
- `BingoCard` — `{ squares: BingoSquare[][], words: string[] }`
- `GameState` — `{ status, category, customWords, customPackName, card, isListening, startedAt, completedAt, winningLine, winningWord, filledCount }`
- `WinningLine` — `{ type: 'row'|'column'|'diagonal', index, squares: string[] }`

### Custom Packs

`CategoryId` includes `'custom'`. When category is `'custom'`, `GameState.customWords` holds the word list and `generateCard` receives it as a second argument. `RESET_GAME` re-uses the stored `customWords` so Play Again works. Minimum 24 unique words required.

### State Persistence

Game state is serialised to `localStorage` under key `meeting-bingo-game-v1` on every change and rehydrated on load. `isListening` is always reset to `false` on rehydration (browser can't be listening on a fresh page load).

## Browser Compatibility

Target Chrome/Edge. Web Speech API is absent in Firefox by default — the app degrades gracefully to manual-only mode when both `window.SpeechRecognition` and `window.webkitSpeechRecognition` are absent.

## Workflow

- **Branches**: all features and fixes go on a branch; never commit directly to `main`.
- **Linear**: create or update a Linear ticket (team: `Randyk`) for every bug fix or feature. Move to *In Progress* when starting, *In Review* when the PR is open.
- **Governance**: after merging, run `/governance` to lint and type-check. Fix any issues in a follow-up PR.
- **Deployment**: Vercel is connected to GitHub. Merging to `main` auto-deploys to production (`agentic-ai-lovat.vercel.app`). Vercel project ID: `prj_WNynagecVy0IRCjbbolGSFkrCs9N`, org: `team_5mmLBdxHGpSDn85pUKIAaiat`.
