# Meeting Bingo — Implementation Plan

**Version**: 1.0  
**Date**: May 21, 2026  
**Build Target**: 90-minute MVP  
**Status**: Ready to Build  

---

## Overview

Meeting Bingo is a browser-based bingo game that auto-detects buzzwords via live speech recognition. All processing is client-side — no backend, no accounts, no cost.

**Stack**: React 18 + TypeScript + Vite + Tailwind CSS + Web Speech API + canvas-confetti  
**Deployment**: Vercel (free tier)

---

## Project Setup

```bash
npm create vite@latest meeting-bingo -- --template react-ts
cd meeting-bingo
npm install canvas-confetti
npm install -D tailwindcss postcss autoprefixer @types/canvas-confetti
npx tailwindcss init -p
```

### Initial Configuration Steps

1. Configure Tailwind (task 1.1).
2. Ensure `tsconfig.json` has `"strict": true` — required for the `npm run typecheck` acceptance criterion to be meaningful. (L3)
3. Create `.env.example` with `VITE_APP_URL=https://your-domain.vercel.app`. Set the actual URL in Vercel environment variables before deploying. (L4 / M4)

### Directory Structure

```
meeting-bingo/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── .env.example
├── public/
│   └── favicon.svg
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── types/
    │   └── index.ts
    ├── data/
    │   └── categories.ts
    ├── lib/
    │   ├── cardGenerator.ts
    │   ├── bingoChecker.ts
    │   ├── wordDetector.ts
    │   ├── shareUtils.ts
    │   └── utils.ts
    ├── hooks/
    │   ├── useSpeechRecognition.ts
    │   ├── useGame.ts
    │   ├── useBingoDetection.ts
    │   └── useLocalStorage.ts
    ├── context/
    │   └── GameContext.tsx
    └── components/
        ├── LandingPage.tsx
        ├── CategorySelect.tsx
        ├── GameBoard.tsx
        ├── BingoCard.tsx
        ├── BingoSquare.tsx
        ├── TranscriptPanel.tsx
        ├── WinScreen.tsx
        ├── GameControls.tsx
        └── ui/
            ├── Button.tsx
            ├── Card.tsx
            └── Toast.tsx
```

**Note on GameContext.tsx** (C1): `GameContext.tsx` appears in the directory structure and is wired as part of Phase 2 task 2.10. Do not skip it — GameBoard and child components depend on it for state access.

---

## Core Types

Define these first in `src/types/index.ts` before building anything else.

```typescript
export type CategoryId = 'agile' | 'corporate' | 'tech';
export type GameStatus = 'idle' | 'setup' | 'playing' | 'won';

export interface BingoSquare {
  id: string;           // "row-col"
  word: string;
  isFilled: boolean;
  isAutoFilled: boolean;
  isFreeSpace: boolean;
  // filledAt removed — post-MVP addition if game history is added (M7)
  row: number;
  col: number;
}

export interface BingoCard {
  squares: BingoSquare[][];
  words: string[];      // flat list for fast detection; derived from squares at generation time
}

export interface WinningLine {
  type: 'row' | 'column' | 'diagonal';
  index: number;
  squares: string[];    // square IDs
}

export interface GameState {
  status: GameStatus;
  category: CategoryId | null;
  card: BingoCard | null;
  isListening: boolean;
  startedAt: number | null;
  completedAt: number | null;
  winningLine: WinningLine | null;
  winningWord: string | null;
  filledCount: number;
}

export interface SpeechRecognitionState {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning';
  duration?: number;
}
```

---

## Phase 1 — Foundation (20 minutes)

**Goal**: Runnable app skeleton with data and types in place.

### Tasks

| # | Task | File | Notes |
|---|------|------|-------|
| 1.1 | Configure Tailwind | `index.css`, `tailwind.config.js` | Add `content` glob for `src/**/*.{ts,tsx}` |
| 1.2 | Write type definitions | `src/types/index.ts` | Full definitions above — do this before any component |
| 1.3 | Add `cn` utility | `src/lib/utils.ts` | See typed signature below |
| 1.4 | Build category data | `src/data/categories.ts` | 3 categories, 40+ words each (agile, corporate, tech). **Category data is pre-written (provided in architecture doc) — copy-paste, do not write from scratch. Estimated time: 3 minutes.** (M3) |
| 1.5 | Create `.env.example` | `.env.example` | Add `VITE_APP_URL=https://your-domain.vercel.app`; set real URL in Vercel env vars (L4 / M4) |
| 1.6 | Verify dev server runs | — | `npm run dev` — blank screen is fine at this point |

### `cn` Utility — Typed Signature (C2)

```typescript
// src/lib/utils.ts
export const cn = (...classes: (string | undefined | null | false)[]): string =>
  classes.filter(Boolean).join(' ');
```

### Acceptance Criteria
- `npm run dev` starts without errors
- TypeScript compiles cleanly (`npm run typecheck`); `tsconfig.json` must have `"strict": true`
- All three category word lists have 40+ entries with no duplicates within a category

---

## Phase 2 — Core Game (30 minutes)

**Goal**: Playable bingo with manual square tapping and win detection. No speech yet.

### Tasks

| # | Task | File | Notes |
|---|------|------|-------|
| 2.1 | Card generator | `src/lib/cardGenerator.ts` | Fisher-Yates shuffle, pick 24 words, center = FREE |
| 2.2 | Bingo checker | `src/lib/bingoChecker.ts` | Check all 5 rows, 5 cols, 2 diagonals |
| 2.3 | Landing page | `src/components/LandingPage.tsx` | Hero + "New Game" CTA + privacy note |
| 2.4 | Category picker | `src/components/CategorySelect.tsx` | 3 cards with icon, name, sample words, Select button |
| 2.5 | Bingo square | `src/components/BingoSquare.tsx` | States: default / filled / auto-filled / free / winning; see accessibility and visual state specs below |
| 2.6 | Bingo card | `src/components/BingoCard.tsx` | 5×5 grid; pass `winningSquares` set for highlight |
| 2.7 | Game board shell | `src/components/GameBoard.tsx` | Header (logo, status, counter) + card + controls stub |
| 2.8 | App routing | `src/App.tsx` | `screen` state: `landing → category → game → win`; see routing note below |
| 2.9 | Win detection hook | `src/hooks/useBingoDetection.ts` | Calls `checkForBingo` on every card mutation |
| 2.10 | Build and wire GameContext | `src/context/GameContext.tsx` | Create `GameContext` with `GameState` + `dispatch`; wrap `App` in provider; remove raw `setGame` prop from `GameBoard` (C1) |
| 2.11 | Near-bingo hint | `src/hooks/useBingoDetection.ts` + `src/components/GameBoard.tsx` | Use `getClosestToWin` from `bingoChecker`; when `needed === 1`, show "One away!" banner and pulse the needed square (H1) |

### App.tsx Routing Note (M8)

Routing is intentional screen-state switching (not URL-based) to keep the MVP zero-dependency. The `screen` state variable drives which component is rendered. Deep-linking is not supported in v1 — sharing links point to the homepage only.

### Component Interfaces

```typescript
// BingoSquare
interface Props {
  square: BingoSquareType;
  isWinningSquare: boolean;
  onClick: () => void;
}

// GameBoard — expose only action handlers, not raw setGame setter (H4)
interface Props {
  game: GameState;
  onFillSquare: (id: string) => void;
  onResetGame: () => void;
  onToggleListening: () => void;
  onWin: (line: WinningLine, word: string) => void;
}
```

### BingoSquare Accessibility Spec (C4)

Every `BingoSquare` must include:
- `role="button"`
- `tabIndex={0}`
- `onKeyDown` handler: `Enter` and `Space` both trigger `onClick`
- `aria-label={isFreeSpace ? 'Free space' : word}`
- `aria-pressed={isFilled}`

### BingoSquare Visual States — Tailwind Classes (H7)

| State | Tailwind classes |
|-------|-----------------|
| Default | `bg-white border-2 border-gray-200 text-gray-800 hover:border-blue-400 hover:bg-blue-50` |
| Hover | Applied via `hover:` variants on the default classes above |
| Filled (manual) | `bg-blue-500 border-2 border-blue-600 text-white` |
| Auto-filled | `bg-green-500 border-2 border-green-600 text-white` |
| Free space | `bg-gray-100 border-2 border-gray-300 text-gray-400 cursor-default` |
| Winning | `bg-yellow-400 border-2 border-yellow-500 text-gray-900 ring-2 ring-yellow-300` |

Wrap `BingoSquare` and `BingoCard` in `React.memo` to prevent 25-component re-renders on every speech transcript update. (M6)

### Category Icons (L6)

Category icons use emoji (e.g., 🏃 for Agile, 🧑‍💼 for Corporate, 💻 for Tech) — no icon library needed. Verify emoji render correctly on target platforms (Android Chrome, iOS Safari, macOS Chrome) before finalizing.

### Key Logic Notes

- Free space: `row === 2 && col === 2`, starts with `isFilled: true`
- Card `filledCount` starts at `1` (the free space)
- Manual tap toggles `isFilled` (can unfill); auto-fills (`isAutoFilled: true`) must NOT be untoggable — enforce this in the tap handler now and keep it consistent
- `words` is derived from `squares` at generation time; on regeneration, always call `generateCard()` fresh — never mutate `squares` and `words` independently (H6)
- Run `checkForBingo` after every state update; fire `onWin` once per game only

### Near-Bingo Hint Spec (H1)

- `bingoChecker.ts` must export `getClosestToWin(card: BingoCard): { needed: number; targetSquareId: string | null } | null`
- When `needed === 1`, `GameBoard` renders a "One away!" banner
- The target square identified by `targetSquareId` receives a CSS pulse animation (e.g., `animate-pulse ring-2 ring-orange-400`)

### Focus Management on Screen Transitions (M9)

On every screen change, call `document.querySelector('h1')?.focus()` immediately after the new screen mounts. This orients screen reader users to the new context.

### Acceptance Criteria (from PRD US-1.x, US-3.x)
- [ ] 5×5 card generates with 24 unique words + center free space
- [ ] Regenerating card before game produces a different word layout
- [ ] Tapping a square toggles filled state with visual feedback
- [ ] BINGO detected for all 12 possible lines (5 rows + 5 cols + 2 diagonals)
- [ ] Win screen shows on BINGO; cannot be triggered twice for same game
- [ ] Auto-filled squares (`isAutoFilled: true`) cannot be manually unfilled by tapping (M1)
- [ ] When 4 squares in a line are filled, a hint identifies the needed word and pulses the target square (H1)

---

## Phase 3 — Speech Recognition (25 minutes)

**Goal**: Squares auto-fill when buzzwords are spoken.

### Tasks

| # | Task | File | Notes |
|---|------|------|-------|
| 3.1 | Speech hook | `src/hooks/useSpeechRecognition.ts` | Wrap Web Speech API; continuous + interim results; see stale-closure and cleanup notes below |
| 3.2 | Word detector | `src/lib/wordDetector.ts` | Regex word-boundary match + alias map |
| 3.3 | Wire auto-fill | `src/hooks/useGame.ts` | On `onResult` callback: detect → fill matching squares → check bingo; final segments only (M5) |
| 3.4 | Transcript panel | `src/components/TranscriptPanel.tsx` | Active indicator, last 100 chars of transcript, detected word chips; see accessibility and mobile layout notes |
| 3.5 | Mic permission UX | `src/components/GameBoard.tsx` | Show privacy message before requesting; graceful fallback if denied |
| 3.6 | Game controls | `src/components/GameControls.tsx` | Toggle listening button, New Card button |

### Speech Hook Behavior

- `continuous: true` — never stops on silence
- `interimResults: true` — fire on partial speech for responsiveness
- Auto-restart in `onend` when `isListening` is still true
- On `not-allowed` error: set `isSupported = false`, show manual-only mode
- Only pass **final** results to word detector (not interim) to avoid false fills (M5)

**Stale-closure fix for `onend` restart (H3):** Use `const isListeningRef = useRef(false)` kept in sync with the `isListening` state value (update the ref in the same effect or setter that updates state). Read `isListeningRef.current` inside the `onend` handler — never read the state variable directly — to avoid the stale closure bug that causes the auto-restart to malfunction.

**Cleanup in React 18 Strict Mode (H5):** The `useEffect` cleanup function must call `recognition.abort()` (not just `recognition.stop()`). React 18 double-invokes effects in dev mode; `abort()` ensures the previous recognition instance is fully torn down before the new one initializes.

### Word Detection Logic

- Normalize both transcript and card word to lowercase, trim smart quotes
- Single words: regex `\b<word>\b` (case-insensitive)
- Multi-word phrases: direct substring match on normalized text
- Alias map covers: `ci/cd`, `mvp`, `roi`, `api`, `devops` (and their common spoken variants)
- Skip words already in `alreadyFilled` set to prevent duplicate fills

### TranscriptPanel Spec

- Show active listening indicator (pulsing dot), last 100 chars of transcript, and detected word chips
- Add `aria-live="polite"` and `aria-atomic="false"` on the detected-words container so screen reader users hear word detection announcements (L5)
- **Mobile layout (M9):** On mobile (< `md` breakpoint), the transcript panel collapses to a single line showing only the listening indicator and the last detected word. The full panel is shown only on `md`+ screens.

### UX Requirements (from UXR key moments)

- Auto-fill animation must fire within **500ms** of word spoken
- Show toast notification naming the detected word (auto-dismiss after **1500ms**; see Toast system below)
- Visual indicator (pulsing dot) clearly shows listening state
- "One away from BINGO!" hint when 4-in-a-line detected — implemented in task 2.11

### Privacy Copy — Canonical String (M11)

The following exact string must appear on the landing page and in the mic permission prompt:

> 🔒 Audio is processed locally on your device. It is never recorded or sent to any server.

### Acceptance Criteria (from PRD US-2.x)

- [ ] Microphone permission prompt includes privacy message: "Audio is processed locally on your device. It is never recorded or sent to any server."
- [ ] Listening indicator visible when speech API is active
- [ ] Spoken buzzword fills matching square within 500ms
- [ ] Same word spoken twice only fills the square once
- [ ] App functions as manual-only game if microphone denied
- [ ] Transcription auto-restarts after silence (continuous mode)
- [ ] Interim/partial speech does not trigger square fills (M5)

---

## Phase 4 — Polish & Deploy (15 minutes)

**Goal**: Satisfying win celebration, share feature, persistence, and live URL.

**Priority ordering:** Complete tasks 4.1–4.3 and 4.7–4.8 first. Tasks 4.4–4.6 are lower priority — **mark as "drop if over time"** if the 15-minute window is at risk. (H2)

### Tasks

| # | Task | File | Notes | Priority |
|---|------|------|-------|----------|
| 4.1 | Confetti | `src/components/WinScreen.tsx` | `canvas-confetti` on mount; check `prefers-reduced-motion` first (M10) | Must-have |
| 4.2 | Win screen | `src/components/WinScreen.tsx` | Dismissible overlay/modal on top of the game board (C3); BINGO! banner, winning card, stats | Must-have |
| 4.3 | Share utility | `src/lib/shareUtils.ts` | Web Share API on mobile; clipboard fallback on desktop; use `VITE_APP_URL` env var (M4) | Must-have |
| 4.4 | Share content | — | Text format: "🎯 BINGO in [N]min! Winning word: [word] \| Play at [url]" | Drop if over time |
| 4.5 | localStorage persistence | `src/hooks/useLocalStorage.ts` | Key: `meeting-bingo-game-v1`; validate version field on load; wrap in try/catch (M2 / L2) | Drop if over time |
| 4.6 | Toast system | `src/components/ui/Toast.tsx` | Stack of max 3 toasts; word-detection toasts auto-dismiss after **1500ms**; error toasts auto-dismiss after 3s (H8) | Drop if over time |
| 4.7 | Deploy to Vercel | — | `vercel --prod` from project root; verify at Vercel subdomain | Must-have |
| 4.8 | E2E smoke test | — | Run manual checklist below before marking done | Must-have |

### Win Screen — Overlay Behavior (C3)

`WinScreen` renders as a **dismissible overlay/modal on top of the game board**, not as a full-screen route replacement. The underlying board remains mounted and visible behind the overlay. The player can dismiss the overlay to return to the board without losing game state. The `App.tsx` routing does not change the `screen` state to `'win'` as a separate route — instead, it sets a `showWinOverlay` flag while `screen` remains `'game'`.

### Confetti and Reduced Motion (M10)

Before firing confetti, check:
```typescript
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  confetti({ ... });
}
```
If `prefers-reduced-motion` is set, skip the animation entirely and display the win overlay immediately.

### Share Utility — Environment Variable (M4)

```typescript
// src/lib/shareUtils.ts
const APP_URL = import.meta.env.VITE_APP_URL ?? 'https://meeting-bingo.vercel.app';
```

`.env.example`:
```
VITE_APP_URL=https://your-domain.vercel.app
```

Set `VITE_APP_URL` to the actual Vercel URL in the Vercel project's environment variables dashboard before deploying.

### localStorage Persistence (M2 / L2)

- Storage key: `meeting-bingo-game-v1`
- On load: validate the stored object has a `version` field matching `'v1'` before restoring; discard stale or malformed data silently
- Wrap all localStorage reads/writes in `try/catch`; on failure (private browsing mode, quota exceeded), silently fall back to in-memory state only

### Win Screen Content (from PRD US-4.2)

- Time elapsed to BINGO (format: "X min Y sec")
- Winning word that completed the line
- Total squares filled (e.g., "12/24")
- Category played
- Highlighted winning line on the card

### Share Text Format

```
🎯 BINGO! Sprint Planning
Winning word: "Scope Creep"
Time: 22 minutes | 12/24 squares
Play Meeting Bingo → https://meeting-bingo.vercel.app
```

### Toast Duration (H8)

- Word-detection toasts: **1500ms** auto-dismiss
- Error toasts (e.g., mic denied): **3000ms** auto-dismiss

### Acceptance Criteria (from PRD US-4.x)

- [ ] Confetti plays on win; does not freeze or lag
- [ ] Confetti is skipped when `prefers-reduced-motion` is set (M10)
- [ ] No sound by default (user is in a meeting)
- [ ] Win screen renders as a dismissible overlay; underlying game board remains visible (C3)
- [ ] Share button copies result text to clipboard (or triggers native share on mobile)
- [ ] Game state survives browser tab refresh (requires localStorage task to be complete)
- [ ] App loads and is interactive in < 2 seconds on a standard connection

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Web Speech API unavailable (Firefox, older Safari) | Medium | High | Feature-detect on load; render manual-only mode automatically |
| Transcription misses words | Medium | Medium | Word aliases + manual tap always available; set expectation in UI |
| Workshop time overrun | Medium | Medium | Phase 4 features 4.4–4.6 (share content, persistence, toast) are drop-if-over-time; core game in Phases 1–2 |
| Mic permission denied | Medium | Medium | Graceful fallback; no error state that breaks the game |
| canvas-confetti bundle size | Low | Low | It's 7KB gzipped; non-issue |

---

## Browser Compatibility

| Browser | Speech API | Notes |
|---------|-----------|-------|
| Chrome 33+ | ✅ Full | Primary target |
| Edge 79+ | ✅ Full | Chromium-based |
| Safari 14.1+ | ✅ Full | Needs `webkitSpeechRecognition` |
| Firefox | ❌ | Falls back to manual mode |
| Mobile Chrome (Android) | ✅ Full | |
| Mobile Safari (iOS 14.5+) | ✅ Full | |

Detection code:
```typescript
const SpeechRecognition =
  (window as any).SpeechRecognition ||
  (window as any).webkitSpeechRecognition;
const isSupported = !!SpeechRecognition;
```

---

## Testing Checklist

### Pre-deploy Manual Tests

**Core Game**
- [ ] App loads and landing page renders in < 2s
- [ ] All three category cards shown on selection screen
- [ ] Card generates with exactly 24 unique words + center FREE space
- [ ] Regenerating card produces a different layout
- [ ] Tapping a square fills it; tapping again unfills it
- [ ] Auto-filled squares (`isAutoFilled: true`) cannot be manually unfilled by tapping (M1)
- [ ] BINGO detected for a row, column, and diagonal line
- [ ] Win screen shows correct time, winning word, and fill count
- [ ] Win screen renders as a dismissible overlay on top of the game board (C3)
- [ ] When 4 squares in a line are filled, the near-bingo hint shows and the target square pulses (H1)

**Speech**
- [ ] Microphone permission prompt shows canonical privacy message (M11)
- [ ] Listening indicator active after permission granted
- [ ] Spoken buzzword auto-fills the correct square
- [ ] Same word spoken twice does not fill twice
- [ ] Saying a non-bingo word does nothing
- [ ] Denying mic permission falls back to manual-only mode gracefully
- [ ] Interim/partial speech does not trigger square fills (M5)

**Accessibility**
- [ ] Every BingoSquare has `role="button"`, `tabIndex={0}`, and responds to Enter/Space (C4)
- [ ] `aria-pressed` reflects filled state on each square (C4)
- [ ] Screen reader announces detected words via `aria-live` on TranscriptPanel (L5)
- [ ] Focus moves to `h1` on each screen transition (M9)
- [ ] Confetti is skipped when `prefers-reduced-motion` is set (M10)

**Edge Cases**
- [ ] Two words detected in same phrase both fill
- [ ] Transcript keeps working after a period of silence
- [ ] Refreshing page during active game restores state from localStorage
- [ ] localStorage failure (private browsing) falls back gracefully to in-memory state (L2)
- [ ] Mobile layout renders usably in portrait on a phone
- [ ] Transcript panel on mobile shows collapsed single-line view (M9)

**Win & Share**
- [ ] Confetti plays on win; no audio by default
- [ ] Winning line highlighted on card
- [ ] Share button copies correct text to clipboard
- [ ] Share URL uses `VITE_APP_URL` environment variable (M4)
- [ ] Play Again returns to category selection with fresh state

---

## UX Principles (from UXR)

Keep these in mind during implementation — they resolve ambiguous design choices:

1. **Ambient engagement**: UI should live in the corner of a screen. Keep it compact, never full-attention-demanding. Win screen is an overlay, not a full-screen takeover (C3).
2. **Earned delight**: Each auto-fill is a small win. Animate it noticeably but briefly (< 300ms animation).
3. **Silent celebration**: BINGO is exciting but the user is on mute. Confetti YES, sound NO by default.
4. **Trust through transparency**: Show "🔒 Audio is processed locally on your device. It is never recorded or sent to any server." on the mic permission prompt and the landing page (M11).
5. **Minimal friction**: Auto-fill everything possible. Every required tap is friction.

---

## Post-MVP Backlog

| Feature | Priority | Effort |
|---------|----------|--------|
| Custom buzzword lists | High (post-MVP) | Low |
| Multiplayer real-time sync (WebRTC or Firebase) | High (post-MVP) | High |
| PWA / offline support | Medium | Medium |
| Dark mode | Low | Low |
| Achievement system (streaks, rare word hits) | Low | Medium |
| Sound effects toggle | Low | Low |
| Game history beyond current session | Low | Medium |

**Note on Multiplayer:** Not in scope for v1; listed for roadmap visibility only. (L1)
