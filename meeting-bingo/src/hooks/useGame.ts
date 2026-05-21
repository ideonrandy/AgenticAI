import { useState, useCallback, useRef, type Dispatch } from 'react';
import { type BingoCard } from '../types';
import { type Action } from '../context/GameContext';
import { useSpeechRecognition } from './useSpeechRecognition';
import { detectWordsWithAliases } from '../lib/wordDetector';

interface UseSpeechFillOptions {
  card: BingoCard | null;
  dispatch: Dispatch<Action>;
  onWordsDetected?: (words: string[]) => void;
}

export function useSpeechFill({ card, dispatch, onWordsDetected }: UseSpeechFillOptions) {
  const speech = useSpeechRecognition();
  const [detectedWords, setDetectedWords] = useState<string[]>([]);

  // Keep refs to latest values — stable callback reads from refs at call time
  const cardRef = useRef(card);
  cardRef.current = card;
  const onWordsDetectedRef = useRef(onWordsDetected);
  onWordsDetectedRef.current = onWordsDetected;

  // Stable callback — reads from cardRef at call time, never goes stale
  const handleFinalResult = useCallback((transcript: string) => {
    const currentCard = cardRef.current;
    if (!currentCard) return;

    const alreadyFilled = new Set(
      currentCard.squares
        .flat()
        .filter(sq => sq.isFilled && !sq.isFreeSpace)
        .map(sq => sq.word.toLowerCase()),
    );

    const found = detectWordsWithAliases(transcript, currentCard.words, alreadyFilled);

    for (const word of found) {
      const sq = currentCard.squares
        .flat()
        .find(s => s.word.toLowerCase() === word.toLowerCase());
      if (sq && !sq.isFilled) {
        dispatch({ type: 'FILL_SQUARE', id: sq.id, isAutoFilled: true });
      }
    }

    if (found.length > 0) {
      setDetectedWords(prev => [...prev, ...found].slice(-20));
      onWordsDetectedRef.current?.(found);
    }
  // dispatch is stable from useReducer; cardRef is a ref (no closure issue)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const startListening = useCallback(() => {
    speech.startListening(handleFinalResult);
  }, [speech, handleFinalResult]);

  const stopListening = useCallback(() => {
    speech.stopListening();
  }, [speech]);

  const resetState = useCallback(() => {
    setDetectedWords([]);
    speech.resetTranscript();
  }, [speech]);

  return {
    isSupported: speech.isSupported,
    isListening: speech.isListening,
    transcript: speech.transcript,
    interimTranscript: speech.interimTranscript,
    error: speech.error,
    detectedWords,
    startListening,
    stopListening,
    resetState,
  };
}
