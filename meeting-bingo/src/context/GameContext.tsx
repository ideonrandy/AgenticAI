import { createContext, useContext, useReducer, useEffect, type ReactNode, type Dispatch } from 'react';
import { type GameState, type CategoryId, type WinningLine } from '../types';
import { generateCard } from '../lib/cardGenerator';
import { countFilled } from '../lib/bingoChecker';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { PersistedGameSchema } from '../lib/gameStateSchema';

const STORAGE_KEY = 'meeting-bingo-game-v1';


export type Action =
  | { type: 'START_GAME'; category: CategoryId; customWords?: string[]; customPackName?: string }
  | { type: 'FILL_SQUARE'; id: string; isAutoFilled?: boolean }
  | { type: 'RESET_GAME' }
  | { type: 'SET_LISTENING'; value: boolean }
  | { type: 'WIN'; winningLine: WinningLine; winningWord: string };

const initialState: GameState = {
  status: 'idle',
  category: null,
  customWords: null,
  customPackName: null,
  card: null,
  isListening: false,
  startedAt: null,
  completedAt: null,
  winningLine: null,
  winningWord: null,
  filledCount: 0,
};

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'START_GAME': {
      const card = generateCard(action.category, action.customWords);
      return {
        ...state,
        status: 'playing',
        category: action.category,
        customWords: action.customWords ?? null,
        customPackName: action.customPackName ?? null,
        card,
        isListening: false,
        startedAt: Date.now(),
        completedAt: null,
        winningLine: null,
        winningWord: null,
        filledCount: 1,
      };
    }

    case 'FILL_SQUARE': {
      if (!state.card) return state;
      const newSquares = state.card.squares.map(row =>
        row.map(sq => {
          if (sq.id !== action.id) return sq;
          if (sq.isFreeSpace) return sq;
          if (sq.isAutoFilled) return sq;
          if (action.isAutoFilled) return { ...sq, isFilled: true, isAutoFilled: true };
          return { ...sq, isFilled: !sq.isFilled };
        })
      );
      const newCard = { ...state.card, squares: newSquares };
      return { ...state, card: newCard, filledCount: countFilled(newCard) };
    }

    case 'RESET_GAME': {
      if (!state.category) return initialState;
      const card = generateCard(state.category, state.customWords ?? undefined);
      return {
        ...state,
        status: 'playing',
        card,
        isListening: false,
        startedAt: Date.now(),
        completedAt: null,
        winningLine: null,
        winningWord: null,
        filledCount: 1,
      };
    }

    case 'SET_LISTENING':
      return { ...state, isListening: action.value };

    case 'WIN':
      return {
        ...state,
        status: 'won',
        completedAt: Date.now(),
        winningLine: action.winningLine,
        winningWord: action.winningWord,
      };

    default:
      return state;
  }
}

interface GameContextValue {
  state: GameState;
  dispatch: Dispatch<Action>;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const { read, write } = useLocalStorage<unknown>(STORAGE_KEY, null);

  const [state, dispatch] = useReducer(gameReducer, undefined, (): GameState => {
    const result = PersistedGameSchema.safeParse(read());
    if (result.success) {
      // Reset isListening — browser can't be listening on a fresh page load
      return { ...result.data.state, isListening: false };
    }
    return initialState;
  });

  // Persist on every state change; silently ignored in private browsing (M2/L2)
  useEffect(() => {
    write({ version: 'v1', state });
  }, [state, write]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- intentional: hook is co-located with its context
export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
