export type CategoryId = 'agile' | 'corporate' | 'tech' | 'custom';
export type GameStatus = 'idle' | 'setup' | 'playing' | 'won';

export interface BingoSquare {
  id: string;
  word: string;
  isFilled: boolean;
  isAutoFilled: boolean;
  isFreeSpace: boolean;
  row: number;
  col: number;
}

export interface BingoCard {
  squares: BingoSquare[][];
  words: string[];
}

export interface WinningLine {
  type: 'row' | 'column' | 'diagonal';
  index: number;
  squares: string[];
}

export interface GameState {
  status: GameStatus;
  category: CategoryId | null;
  customWords: string[] | null;
  customPackName: string | null;
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

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
  icon: string;
  words: string[];
}
