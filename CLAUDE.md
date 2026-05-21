# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

This repository contains planning documents for **Meeting Bingo** — a browser-based bingo game with live audio transcription. The app has not been built yet. The planning docs are:

- `meeting-bingo-prd.md` — Product requirements and user stories
- `meeting-bingo-architecture.md` — Architecture, full type definitions, and reference code for all core modules
- `meeting-bingo-implementation-plan.md` — Phased build plan (90-minute MVP target)
- `meeting-bingo-uxr.md` — UX research

## Setup

The project will live in a `meeting-bingo/` subdirectory:

```bash
npm create vite@latest meeting-bingo -- --template react-ts
cd meeting-bingo
npm install canvas-confetti
npm install -D tailwindcss postcss autoprefixer @types/canvas-confetti
npx tailwindcss init -p
```

## Commands (once `meeting-bingo/` exists)

```bash
npm run dev          # Start dev server on port 3000
npm run build        # tsc + vite build → dist/
npm run preview      # Preview production build
npm run lint         # ESLint on .ts/.tsx files
npm run typecheck    # tsc --noEmit (strict mode required)
```

## Stack

| Concern | Choice |
|---------|--------|
| Framework | React 18 + TypeScript (strict) |
| Build | Vite |
| Styling | Tailwind CSS |
| Speech | Web Speech API (browser-native, no keys) |
| State | React useState + Context |
| Persistence | localStorage only |
| Animation | CSS + canvas-confetti |
| Deployment | Vercel free tier |

No backend. No auth. All processing is client-side.

## Architecture

The app uses a screen-based navigation pattern (no router): `App.tsx` holds a `screen` state (`'landing' | 'category' | 'game' | 'win'`) and renders one top-level component at a time.

**Data flow:**
1. `generateCard(categoryId)` in `src/lib/cardGenerator.ts` shuffles the category's word list and builds a `BingoCard` (5×5 `BingoSquare[][]`). Center square is always the free space, pre-filled.
2. `useSpeechRecognition` wraps the Web Speech API with `continuous: true, interimResults: true`. On each final result it fires a callback with the transcript chunk.
3. `detectWordsWithAliases` in `src/lib/wordDetector.ts` matches transcript text against card words using word-boundary regex for single words and substring match for phrases. A `WORD_ALIASES` map handles abbreviations (`CI/CD`, `ROI`, etc.).
4. `checkForBingo` in `src/lib/bingoChecker.ts` scans all 12 lines (5 rows + 5 cols + 2 diagonals) and returns the first `WinningLine` found, or `null`.
5. Win state routes to `WinScreen` with confetti via `canvas-confetti`.

**Key types** (all in `src/types/index.ts`):
- `BingoSquare` — `{ id, word, isFilled, isAutoFilled, isFreeSpace, filledAt, row, col }`
- `BingoCard` — `{ squares: BingoSquare[][], words: string[] }`
- `GameState` — `{ status: GameStatus, category, card, isListening, startedAt, completedAt, winningLine, winningWord, filledCount }`
- `WinningLine` — `{ type: 'row'|'column'|'diagonal', index, squares: string[] }`

**Categories** (`src/data/categories.ts`): three packs — `agile`, `corporate`, `tech` — each with 40+ words. Each category needs at least 24 words to fill a card.

## Environment

Create `.env.example` with `VITE_APP_URL=https://your-domain.vercel.app`. The actual URL goes in Vercel environment variables, not committed to the repo.

## Browser Compatibility

Target Chrome/Edge primarily. Web Speech API is unavailable in Firefox by default — the game must degrade gracefully to manual-only mode when `window.SpeechRecognition` and `window.webkitSpeechRecognition` are both absent.
