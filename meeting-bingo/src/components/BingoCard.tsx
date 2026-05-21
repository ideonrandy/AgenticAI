import React from 'react';
import { type BingoCard as BingoCardType } from '../types';
import { BingoSquare } from './BingoSquare';

interface Props {
  card: BingoCardType;
  winningSquares: Set<string>;
  pulseTargetId: string | null;
  onSquareClick: (id: string) => void;
}

export const BingoCard = React.memo(function BingoCard({
  card,
  winningSquares,
  pulseTargetId,
  onSquareClick,
}: Props) {
  return (
    <div className="grid grid-cols-5 gap-1 w-full max-w-sm mx-auto">
      {card.squares.flat().map(square => (
        <BingoSquare
          key={square.id}
          square={square}
          isWinningSquare={winningSquares.has(square.id)}
          isPulseTarget={pulseTargetId === square.id}
          onClick={() => onSquareClick(square.id)}
        />
      ))}
    </div>
  );
});
