import React from 'react';
import { type BingoSquare as BingoSquareType } from '../types';
import { cn } from '../lib/utils';

interface Props {
  square: BingoSquareType;
  isWinningSquare: boolean;
  isPulseTarget: boolean;
  onClick: () => void;
}

export const BingoSquare = React.memo(function BingoSquare({
  square,
  isWinningSquare,
  isPulseTarget,
  onClick,
}: Props) {
  const { word, isFilled, isAutoFilled, isFreeSpace } = square;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={isFreeSpace ? -1 : 0}
      aria-label={isFreeSpace ? 'Free space' : word}
      aria-pressed={isFilled}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'aspect-square p-1 rounded-lg transition-all duration-200 select-none',
        'flex items-center justify-center text-center',
        'text-xs font-medium leading-tight',
        !isFilled && !isFreeSpace
          ? 'bg-white border-2 border-gray-200 text-gray-800 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
          : '',
        isFilled && !isAutoFilled && !isFreeSpace && !isWinningSquare
          ? 'bg-blue-500 border-2 border-blue-600 text-white cursor-pointer'
          : '',
        isFilled && isAutoFilled && !isWinningSquare
          ? 'bg-green-500 border-2 border-green-600 text-white cursor-default'
          : '',
        isFreeSpace
          ? 'bg-gray-100 border-2 border-gray-300 text-gray-400 cursor-default'
          : '',
        isWinningSquare
          ? 'bg-yellow-400 border-2 border-yellow-500 text-gray-900 ring-2 ring-yellow-300 cursor-pointer'
          : '',
        isPulseTarget && !isFilled
          ? 'animate-pulse ring-2 ring-orange-400'
          : '',
      )}
    >
      <span className="break-words px-0.5 leading-tight">
        {isFreeSpace ? '⭐ FREE' : word}
      </span>
    </div>
  );
});
