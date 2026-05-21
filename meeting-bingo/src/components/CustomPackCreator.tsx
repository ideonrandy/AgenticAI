import { useState } from 'react';

const MIN_WORDS = 24;
const MAX_WORD_LEN = 80;

interface Props {
  onStart: (words: string[], packName: string) => void;
  onBack: () => void;
}

export function CustomPackCreator({ onStart, onBack }: Props) {
  const [packName, setPackName] = useState('');
  const [rawInput, setRawInput] = useState('');

  const allWords = rawInput
    .split('\n')
    .map(w => w.trim())
    .filter(w => w.length > 0);

  const tooLong = allWords.some(w => w.length > MAX_WORD_LEN);
  const words = allWords.filter(w => w.length <= MAX_WORD_LEN);
  const uniqueWords = [...new Set(words)];
  const count = uniqueWords.length;
  const ready = count >= MIN_WORDS;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Custom Pack</h1>
      <p className="text-gray-500 mb-8 text-center">
        Enter your buzzwords — one per line. You need at least {MIN_WORDS}.
      </p>

      <div className="w-full max-w-lg bg-white rounded-xl shadow-md p-6 flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pack name <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={packName}
            onChange={e => setPackName(e.target.value)}
            placeholder="e.g. All-Hands Meeting"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buzzwords
          </label>
          <textarea
            value={rawInput}
            onChange={e => setRawInput(e.target.value)}
            placeholder={'synergy\ncircle back\nmove the needle\n...'}
            rows={10}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y"
          />
          <p className={`text-xs mt-1 ${ready ? 'text-green-600' : 'text-gray-400'}`}>
            {count} word{count !== 1 ? 's' : ''} added
            {!ready && ` — need ${MIN_WORDS - count} more`}
            {ready && ' ✓ ready to play'}
          </p>
          {tooLong && (
            <p className="text-xs mt-1 text-amber-600">
              Words over {MAX_WORD_LEN} characters are excluded.
            </p>
          )}
        </div>

        <button
          onClick={() => onStart(uniqueWords, packName.trim() || 'Custom Pack')}
          disabled={!ready}
          className="w-full py-3 rounded-xl font-bold text-white transition-all duration-150
            bg-blue-600 hover:bg-blue-700 active:scale-95
            disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          Start Game
        </button>
      </div>

      <button
        onClick={onBack}
        className="mt-6 text-gray-500 hover:text-gray-700 text-sm underline"
      >
        ← Back
      </button>
    </div>
  );
}
