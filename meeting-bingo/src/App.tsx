import { useState, useCallback } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { LandingPage } from './components/LandingPage';
import { CategorySelect } from './components/CategorySelect';
import { CustomPackCreator } from './components/CustomPackCreator';
import { GameBoard } from './components/GameBoard';
import { WinScreen } from './components/WinScreen';
import { type CategoryId, type WinningLine } from './types';

type Screen = 'landing' | 'category' | 'custom' | 'game';

function AppInner() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [showWinOverlay, setShowWinOverlay] = useState(false);
  const { state, dispatch } = useGame();

  const handleCategorySelect = (category: CategoryId) => {
    dispatch({ type: 'START_GAME', category });
    setScreen('game');
    setShowWinOverlay(false);
  };

  const handleCustomStart = (words: string[], packName: string) => {
    dispatch({ type: 'START_GAME', category: 'custom', customWords: words, customPackName: packName });
    setScreen('game');
    setShowWinOverlay(false);
  };

  const handleWin = useCallback(
    (line: WinningLine, word: string) => {
      dispatch({ type: 'WIN', winningLine: line, winningWord: word });
      setShowWinOverlay(true);
    },
    [dispatch],
  );

  const handlePlayAgain = () => {
    setShowWinOverlay(false);
    setScreen('category');
  };

  return (
    <>
      {screen === 'landing' && (
        <LandingPage onStart={() => setScreen('category')} />
      )}
      {screen === 'category' && (
        <CategorySelect
          onSelect={handleCategorySelect}
          onCreateCustom={() => setScreen('custom')}
          onBack={() => setScreen('landing')}
        />
      )}
      {screen === 'custom' && (
        <CustomPackCreator
          onStart={handleCustomStart}
          onBack={() => setScreen('category')}
        />
      )}
      {screen === 'game' && (
        <GameBoard
          onWin={handleWin}
          onNavigateToCategory={() => {
            setShowWinOverlay(false);
            setScreen('category');
          }}
        />
      )}
      {showWinOverlay && (
        <WinScreen
          game={state}
          onDismiss={() => setShowWinOverlay(false)}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <GameProvider>
      <AppInner />
    </GameProvider>
  );
}
