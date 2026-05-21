import type { BingoCard, BingoSquare, CategoryId } from '../types';
import { CATEGORIES } from '../data/categories';

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function generateCard(categoryId: CategoryId, customWords?: string[]): BingoCard {
  let words: string[];
  if (categoryId === 'custom') {
    if (!customWords || customWords.length < 24) throw new Error('Custom pack needs at least 24 words');
    words = customWords;
  } else {
    const category = CATEGORIES.find(c => c.id === categoryId);
    if (!category) throw new Error(`Unknown category: ${categoryId}`);
    words = category.words;
  }

  const selectedWords = shuffle(words).slice(0, 24);
  const squares: BingoSquare[][] = [];
  let wordIndex = 0;

  for (let row = 0; row < 5; row++) {
    const rowSquares: BingoSquare[] = [];
    for (let col = 0; col < 5; col++) {
      const isFreeSpace = row === 2 && col === 2;
      rowSquares.push({
        id: `${row}-${col}`,
        word: isFreeSpace ? 'FREE' : selectedWords[wordIndex++],
        isFilled: isFreeSpace,
        isAutoFilled: false,
        isFreeSpace,
        row,
        col,
      });
    }
    squares.push(rowSquares);
  }

  return { squares, words: selectedWords };
}
