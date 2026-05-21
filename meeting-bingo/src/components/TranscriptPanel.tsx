interface Props {
  transcript: string;
  interimTranscript: string;
  detectedWords: string[];
  isListening: boolean;
}

export function TranscriptPanel({
  transcript,
  interimTranscript,
  detectedWords,
  isListening,
}: Props) {
  const displayTranscript = transcript.slice(-100);
  const lastDetected = detectedWords[detectedWords.length - 1];

  return (
    <div className="bg-gray-100 rounded-lg p-3 w-full max-w-sm mx-auto">
      {/* Status indicator row */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
            isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-400'
          }`}
        />
        <span className="text-xs font-medium text-gray-600">
          {isListening ? '🎤 Listening…' : '🎤 Paused'}
        </span>
      </div>

      {/* Full transcript — visible on md+ only */}
      <div className="hidden md:block text-xs text-gray-600 min-h-[28px] mb-2">
        <span className="text-gray-800">
          {displayTranscript || 'Waiting for speech…'}
        </span>
        <span className="text-gray-400 italic">{interimTranscript}</span>
      </div>

      {/* Mobile: collapsed single-line view */}
      <div className="md:hidden text-xs text-gray-600 mb-2">
        {lastDetected ? `Last: "${lastDetected}"` : 'Waiting for speech…'}
      </div>

      {/* Detected word chips — aria-live so screen readers announce new detections (L5) */}
      {detectedWords.length > 0 && (
        <div
          className="flex flex-wrap gap-1 pt-2 border-t border-gray-200"
          aria-live="polite"
          aria-atomic="false"
        >
          <span className="text-xs text-gray-500 self-center">Detected:</span>
          {detectedWords.slice(-5).map((word, i) => (
            <span
              key={`${word}-${i}`}
              className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full"
            >
              ✨ {word}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
