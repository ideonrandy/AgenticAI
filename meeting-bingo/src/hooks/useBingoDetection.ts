import { useMemo } from 'react';
import { type BingoCard, type WinningLine } from '../types';
import { checkForBingo, getClosestToWin } from '../lib/bingoChecker';

interface UseBingoDetectionResult {
  winningLine: WinningLine | null;
  pulseTargetId: string | null;
}

export function useBingoDetection(card: BingoCard | null): UseBingoDetectionResult {
  const winningLine = useMemo(
    () => (card ? checkForBingo(card) : null),
    [card],
  );

  const pulseTargetId = useMemo(() => {
    if (!card || winningLine) return null;
    const closest = getClosestToWin(card);
    return closest?.needed === 1 ? closest.targetSquareId : null;
  }, [card, winningLine]);

  return { winningLine, pulseTargetId };
}
