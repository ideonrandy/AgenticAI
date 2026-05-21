import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { type GameState } from '../types';
import { shareResult, type ShareParams } from '../lib/shareUtils';

interface Props {
  game: GameState;
  onDismiss: () => void;
  onPlayAgain: () => void;
}

function formatElapsed(startedAt: number | null, completedAt: number | null): string {
  if (!startedAt || !completedAt) return '—';
  const ms = completedAt - startedAt;
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

type ShareStatus = 'idle' | 'shared' | 'copied' | 'failed';

const SHARE_LABEL: Record<ShareStatus, string> = {
  idle: '📤 Share Result',
  shared: '✓ Shared!',
  copied: '✓ Copied!',
  failed: 'Could not share',
};

export function WinScreen({ game, onDismiss, onPlayAgain }: Props) {
  const [shareStatus, setShareStatus] = useState<ShareStatus>('idle');
  const filledNonFree = Math.max(0, game.filledCount - 1);

  // Fire confetti on mount, respecting prefers-reduced-motion (M10)
  useEffect(() => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      void confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
    (document.querySelector('[data-win-heading]') as HTMLElement | null)?.focus();
  }, []);

  const handleShare = async () => {
    const params: ShareParams = {
      category: game.category,
      winningWord: game.winningWord,
      startedAt: game.startedAt,
      completedAt: game.completedAt,
      filledCount: game.filledCount,
    };
    const result = await shareResult(params);
    setShareStatus(result);
    if (result !== 'failed') {
      setTimeout(() => setShareStatus('idle'), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onDismiss(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center relative">
        <button
          onClick={onDismiss}
          aria-label="Dismiss win screen"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-lg"
        >
          ✕
        </button>

        <div className="text-5xl mb-3">🎉</div>
        <h1
          data-win-heading
          tabIndex={-1}
          className="text-4xl font-black text-gray-900 mb-1 outline-none"
        >
          BINGO!
        </h1>
        <p className="text-gray-500 mb-6 text-sm capitalize">
          {game.category ?? ''}
        </p>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-blue-50 rounded-xl p-3">
            <div className="text-xl font-bold text-blue-700 tabular-nums">
              {formatElapsed(game.startedAt, game.completedAt)}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">Time</div>
          </div>
          <div className="bg-green-50 rounded-xl p-3">
            <div className="text-xl font-bold text-green-700">
              {filledNonFree}/24
            </div>
            <div className="text-xs text-gray-500 mt-0.5">Squares</div>
          </div>
          <div className="bg-yellow-50 rounded-xl p-3">
            <div
              className="text-sm font-bold text-yellow-700 truncate"
              title={game.winningWord ?? ''}
            >
              {game.winningWord ?? '—'}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">Winning word</div>
          </div>
        </div>

        <button
          onClick={handleShare}
          disabled={shareStatus !== 'idle'}
          className={`w-full py-2.5 rounded-xl font-semibold text-sm mb-3 transition-colors ${
            shareStatus === 'idle'
              ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
              : shareStatus === 'failed'
              ? 'bg-red-100 text-red-700'
              : 'bg-green-100 text-green-700'
          }`}
        >
          {SHARE_LABEL[shareStatus]}
        </button>

        <div className="flex gap-3">
          <button
            onClick={onDismiss}
            className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-sm"
          >
            Keep Playing
          </button>
          <button
            onClick={onPlayAgain}
            className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors text-sm"
          >
            🔄 Play Again
          </button>
        </div>
      </div>
    </div>
  );
}
