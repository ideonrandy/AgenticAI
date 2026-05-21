function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    .trim();
}

export const WORD_ALIASES: Record<string, string[]> = {
  'ci/cd': ['ci cd', 'cicd', 'continuous integration'],
  'mvp': ['minimum viable product', 'm.v.p.'],
  'roi': ['return on investment', 'r.o.i.'],
  'api': ['a.p.i.', 'a p i'],
  'devops': ['dev ops', 'dev-ops'],
};

export function detectWordsWithAliases(
  transcript: string,
  cardWords: string[],
  alreadyFilled: Set<string>,
): string[] {
  const normalizedTranscript = normalizeText(transcript);
  const detected: string[] = [];

  for (const word of cardWords) {
    const lower = word.toLowerCase();
    if (alreadyFilled.has(lower)) continue;

    const normalizedWord = normalizeText(word);
    let found = false;

    if (normalizedWord.includes(' ')) {
      found = normalizedTranscript.includes(normalizedWord);
    } else {
      const regex = new RegExp(`\\b${escapeRegex(normalizedWord)}\\b`, 'i');
      found = regex.test(normalizedTranscript);
    }

    if (!found) {
      const aliases = WORD_ALIASES[lower];
      if (aliases) {
        found = aliases.some(alias => normalizedTranscript.includes(alias));
      }
    }

    if (found) detected.push(word);
  }

  return detected;
}
