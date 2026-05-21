import { useEffect } from 'react';
import { type CategoryId } from '../types';
import { CATEGORIES } from '../data/categories';

interface Props {
  onSelect: (id: CategoryId) => void;
  onCreateCustom: () => void;
  onBack: () => void;
}

export function CategorySelect({ onSelect, onCreateCustom, onBack }: Props) {
  useEffect(() => {
    (document.querySelector('h1') as HTMLElement | null)?.focus();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center px-4 py-8">
      <h1
        tabIndex={-1}
        className="text-3xl font-bold text-gray-900 mb-2 outline-none"
      >
        Choose Your Buzzword Pack
      </h1>
      <p className="text-gray-500 mb-8 text-center">
        Select the category that matches your meeting
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg border-2 border-transparent hover:border-blue-400 transition-all duration-150 hover:scale-105 active:scale-95 text-left"
          >
            <div className="text-4xl mb-3">{cat.icon}</div>
            <div className="font-bold text-gray-900 text-lg mb-1">{cat.name}</div>
            <div className="text-gray-500 text-sm mb-3">{cat.description}</div>
            <div className="text-xs text-gray-400">
              {cat.words.slice(0, 4).join(', ')}…
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={onCreateCustom}
        className="mt-6 bg-white rounded-xl px-8 py-4 shadow-md hover:shadow-lg border-2 border-dashed border-blue-300 hover:border-blue-500 transition-all duration-150 hover:scale-105 active:scale-95 flex items-center gap-3 text-blue-600 hover:text-blue-700 font-semibold"
      >
        <span className="text-2xl">✏️</span>
        Create Custom Pack
      </button>

      <button
        onClick={onBack}
        className="mt-6 text-gray-500 hover:text-gray-700 text-sm underline"
      >
        ← Back to Home
      </button>
    </div>
  );
}
