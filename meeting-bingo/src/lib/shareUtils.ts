import { type CategoryId } from '../types';
import { CATEGORIES } from '../data/categories';

const APP_URL = import.meta.env.VITE_APP_URL ?? 'https://meeting-bingo.vercel.app';

function getCategoryName(id: CategoryId | null): string {
  if (!id) return 'Meeting Bingo';
  return CATEGORIES.find(c => c.id === id)?.name ?? id;
}

function formatElapsed(startedAt: number | null, completedAt: number | null): string {
  if (!startedAt || !completedAt) return '?';
  const ms = completedAt - startedAt;
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

export interface ShareParams {
  category: CategoryId | null;
  winningWord: string | null;
  startedAt: number | null;
  completedAt: number | null;
  filledCount: number;
}

export function buildShareText(params: ShareParams): string {
  const category = getCategoryName(params.category);
  const word = params.winningWord ?? '?';
  const elapsed = formatElapsed(params.startedAt, params.completedAt);
  const filled = Math.max(0, params.filledCount - 1);

  return [
    `🎯 BINGO! ${category}`,
    `Winning word: "${word}"`,
    `Time: ${elapsed} | ${filled}/24 squares`,
    `Play Meeting Bingo → ${APP_URL}`,
  ].join('\n');
}

export async function shareResult(
  params: ShareParams,
): Promise<'shared' | 'copied' | 'failed'> {
  const text = buildShareText(params);

  if (navigator.share) {
    try {
      await navigator.share({ text, url: APP_URL });
      return 'shared';
    } catch {
      // User cancelled or API unavailable — fall through to clipboard
    }
  }

  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    return 'failed';
  }
}
