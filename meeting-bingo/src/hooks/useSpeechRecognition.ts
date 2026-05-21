import { useState, useEffect, useCallback, useRef } from 'react';
import { type SpeechRecognitionState } from '../types';

const SpeechRecognitionAPI =
  (window as unknown as { SpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition ??
  (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognition }).webkitSpeechRecognition;

// Minimal typings for the Web Speech API (not yet in lib.dom.d.ts for all envs)
interface SpeechRecognitionResultItem {
  transcript: string;
}
interface SpeechRecognitionResult {
  isFinal: boolean;
  0: SpeechRecognitionResultItem;
}
interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface UseSpeechRecognitionReturn extends SpeechRecognitionState {
  startListening: (onFinalResult: (transcript: string) => void) => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [state, setState] = useState<SpeechRecognitionState>({
    isSupported: !!SpeechRecognitionAPI,
    isListening: false,
    transcript: '',
    interimTranscript: '',
    error: null,
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  // Keep ref in sync with isListening state — read this in onend to avoid stale closure (H3)
  const isListeningRef = useRef(false);
  const onFinalResultRef = useRef<((t: string) => void) | null>(null);

  useEffect(() => {
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      setState(prev => ({
        ...prev,
        transcript: prev.transcript + final,
        interimTranscript: interim,
      }));
      // Only pass final results to word detector — never interim (M5)
      if (final && onFinalResultRef.current) {
        onFinalResultRef.current(final);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const denied =
        event.error === 'not-allowed' || event.error === 'service-not-allowed';
      isListeningRef.current = false;
      setState(prev => ({
        ...prev,
        isListening: false,
        isSupported: denied ? false : prev.isSupported,
        error: event.error,
      }));
    };

    // Auto-restart on silence; use ref to avoid stale closure (H3)
    recognition.onend = () => {
      if (isListeningRef.current) {
        try {
          recognition.start();
        } catch {
          // Already starting
        }
      } else {
        setState(prev => ({ ...prev, isListening: false }));
      }
    };

    recognitionRef.current = recognition;

    // abort() tears down fully — needed for React 18 Strict Mode double-invoke (H5)
    return () => {
      recognition.abort();
    };
  }, []);

  const startListening = useCallback((onFinalResult: (t: string) => void) => {
    if (!recognitionRef.current) return;
    onFinalResultRef.current = onFinalResult;
    isListeningRef.current = true;
    setState(prev => ({
      ...prev,
      isListening: true,
      transcript: '',
      interimTranscript: '',
      error: null,
    }));
    try {
      recognitionRef.current.start();
    } catch {
      // Already running
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    isListeningRef.current = false;
    onFinalResultRef.current = null;
    setState(prev => ({ ...prev, isListening: false }));
    recognitionRef.current.stop();
  }, []);

  const resetTranscript = useCallback(() => {
    setState(prev => ({ ...prev, transcript: '', interimTranscript: '' }));
  }, []);

  return { ...state, startListening, stopListening, resetTranscript };
}
