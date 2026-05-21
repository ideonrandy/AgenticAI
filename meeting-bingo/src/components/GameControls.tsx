interface Props {
  isListening: boolean;
  isSpeechSupported: boolean;
  onToggleListening: () => void;
  onNewCard: () => void;
}

export function GameControls({
  isListening,
  isSpeechSupported,
  onToggleListening,
  onNewCard,
}: Props) {
  return (
    <div className="flex justify-center gap-3 mt-4">
      {isSpeechSupported && (
        <button
          onClick={onToggleListening}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-150 border-2 ${
            isListening
              ? 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200'
              : 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200'
          }`}
        >
          {isListening ? '⏹ Stop Listening' : '🎤 Start Listening'}
        </button>
      )}
      <button
        onClick={onNewCard}
        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200 transition-all duration-150"
      >
        🔄 New Card
      </button>
    </div>
  );
}
