import { z } from 'zod';

const BingoSquareSchema = z.object({
  id: z.string(),
  word: z.string().max(120),
  isFilled: z.boolean(),
  isAutoFilled: z.boolean(),
  isFreeSpace: z.boolean(),
  row: z.number().int().min(0).max(4),
  col: z.number().int().min(0).max(4),
});

const BingoCardSchema = z.object({
  squares: z.array(z.array(BingoSquareSchema)).length(5),
  words: z.array(z.string().max(120)),
});

const WinningLineSchema = z.object({
  type: z.enum(['row', 'column', 'diagonal']),
  index: z.number().int(),
  squares: z.array(z.string()),
});

const GameStateSchema = z.object({
  status: z.enum(['idle', 'setup', 'playing', 'won']),
  category: z.enum(['agile', 'corporate', 'tech', 'custom']).nullable(),
  customWords: z.array(z.string().max(120)).nullable(),
  customPackName: z.string().max(100).nullable(),
  card: BingoCardSchema.nullable(),
  isListening: z.boolean(),
  startedAt: z.number().nullable(),
  completedAt: z.number().nullable(),
  winningLine: WinningLineSchema.nullable(),
  winningWord: z.string().nullable(),
  filledCount: z.number().int().min(0),
});

export const PersistedGameSchema = z.object({
  version: z.literal('v1'),
  state: GameStateSchema,
});
