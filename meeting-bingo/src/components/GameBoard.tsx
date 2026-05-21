import { useCallback, useEffect, useRef } from 'react';
import { type WinningLine } from '../types';
import { useGame } from '../context/GameContext';
import { useBingoDetection } from '../hooks/useBingoDetection';
import { useSpeechFill } from '../hooks/useGame';
import { useToast } from '../hooks/useToast';
import { BingoCard } from './BingoCard';
import { GameControls } from './GameControls';
import { TranscriptPanel } from './TranscriptPanel';
import { ToastContainer } from './ui/Toast';

interface Props {
  onWin: (line: WinningLine, word: string) => void;
  onNavigateToCategory: () => void;
}

export function GameBoard({ onWin, onNavigateToCategory }: Props) {
  const { state, dispatch } = useGame();
  const { card, filledCount, status, startedAt } = state;
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    (document.querySelector('h1') as HTMLElement | null)?.focus();
  }, []);

  const handleWordsDetected = useCallback(
    (words: string[]) => {
      words.forEach(word => addToast(`✨ "${word}"`, 'success', 1500));
    },
    [addToast],
  );

  const speech = useSpeechFill({ card, dispatch, onWordsDetected: handleWordsDetected });
  const { winningLine, pulseTargetId } = useBingoDetection(card);

  // Show a warning toast when mic is denied
  const prevErrorRef = useRef<string | null>(null);
  useEffect(() => {
    if (speech.error && speech.error !== prevErrorRef.current) {
      prevErrorRef.current = speech.error;
      if (speech.error === 'not-allowed' || speech.error === 'service-not-allowed') {
        addToast('Microphone denied — tap squares manually.', 'warning', 3000);
      }
    }
  }, [speech.error, addToast]);

  // Fire onWin exactly once per game
  const hasWon = status === 'won';
  const firedRef = useRef(false);

  useEffect(() => {
    firedRef.current = false;
  }, [startedAt]);

  const onWinRef = useRef(onWin);
  useEffect(() => {
    onWinRef.current = onWin;
  });

  useEffect(() => {
    if (!winningLine || hasWon || firedRef.current || !card) return;
    firedRef.current = true;
    const winningWord =
      winningLine.squares
        .map(id => {
          const [r, c] = id.split('-').map(Number);
          return card.squares[r][c];
        })
        .find(sq => !sq.isFreeSpace)?.word ?? '';
    onWinRef.current(winningLine, winningWord);
  }, [winningLine, hasWon, card]);

  // Reset speech state when a new card is generated
  useEffect(() => {
    speech.resetState();
  // Only run when startedAt changes (new game); not on every speech update
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startedAt]);

  if (!card) return null;

  const winningSquares = new Set(winningLine?.squares ?? []);
  const filledDisplay = Math.max(0, filledCount - 1);

  const handleSquareClick = (id: string) => {
    if (hasWon) return;
    dispatch({ type: 'FILL_SQUARE', id });
  };

  const handleNewCard = () => dispatch({ type: 'RESET_GAME' });

  const handleToggleListening = () => {
    if (speech.isListening) {
      speech.stopListening();
    } else {
      speech.startListening();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <button
          onClick={onNavigateToCategory}
          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
        >
          ← Category
        </button>
        <h1 tabIndex={-1} className="text-lg font-bold text-gray-900 outline-none">
          🎯 Meeting Bingo
        </h1>
        <div className="text-sm font-semibold text-gray-600 tabular-nums">
          {filledDisplay}/24
        </div>
      </header>

      {/* Near-bingo banner */}
      {pulseTargetId && (
        <div className="bg-orange-100 border-b border-orange-200 px-4 py-2 text-center text-sm font-semibold text-orange-700">
          🔥 One away from BINGO!
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
        <BingoCard
          card={card}
          winningSquares={winningSquares}
          pulseTargetId={pulseTargetId}
          onSquareClick={handleSquareClick}
        />

        <GameControls
          isListening={speech.isListening}
          isSpeechSupported={speech.isSupported}
          onToggleListening={handleToggleListening}
          onNewCard={handleNewCard}
        />

        {/* Privacy note — shown before first listening session */}
        {speech.isSupported && !speech.isListening && !speech.transcript && (
          <p className="text-xs text-gray-400 text-center max-w-xs">
            🔒 Audio is processed locally on your device. It is never recorded or sent to any server.
          </p>
        )}

        {/* Manual-only fallback */}
        {!speech.isSupported && (
          <p className="text-xs text-gray-500 text-center max-w-xs bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
            Speech recognition unavailable in this browser. Tap squares manually to play.
          </p>
        )}

        {/* Transcript panel */}
        {(speech.isListening || speech.transcript) && (
          <TranscriptPanel
            transcript={speech.transcript}
            interimTranscript={speech.interimTranscript}
            detectedWords={speech.detectedWords}
            isListening={speech.isListening}
          />
        )}
      </main>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
