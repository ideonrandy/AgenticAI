import { useEffect } from 'react';

interface Props {
  onStart: () => void;
}

export function LandingPage({ onStart }: Props) {
  useEffect(() => {
    (document.querySelector('h1') as HTMLElement | null)?.focus();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="text-6xl mb-4">🎯</div>
        <h1
          tabIndex={-1}
          className="text-5xl font-bold text-gray-900 mb-3 outline-none"
        >
          Meeting Bingo
        </h1>
        <p className="text-xl text-gray-600 mb-2">Turn any meeting into a game.</p>
        <p className="text-base text-gray-500 mb-8">
          Auto-detects buzzwords using speech recognition!
        </p>

        <button
          onClick={onStart}
          className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-lg font-semibold px-8 py-4 rounded-xl shadow-lg transition-all duration-150 hover:scale-105 active:scale-95"
        >
          🎮 New Game
        </button>

        <p className="mt-6 text-sm text-gray-500">
          🔒 Audio is processed locally on your device. It is never recorded or sent to any server.
        </p>

        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm text-gray-600">
          {[
            { icon: '1️⃣', text: 'Pick a buzzword category' },
            { icon: '2️⃣', text: 'Enable microphone for auto-detection' },
            { icon: '3️⃣', text: 'Join your meeting and listen' },
            { icon: '4️⃣', text: 'Watch squares fill automatically!' },
          ].map(step => (
            <div key={step.icon} className="bg-white/70 rounded-lg p-3">
              <div className="text-2xl mb-1">{step.icon}</div>
              <div>{step.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
