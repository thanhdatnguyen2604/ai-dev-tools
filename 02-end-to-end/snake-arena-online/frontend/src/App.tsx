import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useMockBackend';
import { useMultiplayer } from './hooks/useMockBackend';
import Auth from './components/Auth';
import Header from './components/Header';
import SnakeGame from './components/SnakeGame';
import Leaderboard from './components/Leaderboard';
import SpectatorMode from './components/SpectatorMode';

type ViewType = 'game' | 'leaderboard' | 'spectate';

function App() {
  const { isAuthenticated, user } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('game');
  const [gameMode, setGameMode] = useState<'walls' | 'pass-through'>('walls');
  const { joinGame, leaveGame } = useMultiplayer();

  useEffect(() => {
    if (isAuthenticated && currentView === 'game') {
      joinGame();
    } else if (currentView !== 'game') {
      leaveGame();
    }

    return () => {
      leaveGame();
    };
  }, [isAuthenticated, currentView, joinGame, leaveGame]);

  const handleGameOver = async (score: number) => {
    if (user && score > 0) {
      try {
        // Submit score to leaderboard
        const { submitScore } = await import('./hooks/useMockBackend');
        const { useLeaderboard } = await import('./hooks/useMockBackend');
        // This is a bit of a hack to call submitScore without a hook
        // In a real app, we'd handle this differently
        console.log(`Game over! Score: ${score}`);
      } catch (error) {
        console.error('Failed to submit score:', error);
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <Auth onAuthSuccess={() => setCurrentView('game')} />
    );
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'game':
        return (
          <div className="min-h-screen">
            <div className="flex justify-center items-center py-4 bg-gray-800">
              <div className="flex items-center space-x-4">
                <span className="text-white font-medium">Game Mode:</span>
                <button
                  onClick={() => setGameMode('walls')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    gameMode === 'walls'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  🧱 Walls
                </button>
                <button
                  onClick={() => setGameMode('pass-through')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    gameMode === 'pass-through'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  🌀 Pass-through
                </button>
              </div>
            </div>
            <SnakeGame
              gameMode={gameMode}
              onGameOver={handleGameOver}
            />
          </div>
        );
      case 'leaderboard':
        return <Leaderboard />;
      case 'spectate':
        return <SpectatorMode />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
      />
      {renderCurrentView()}

      {/* Footer with keyboard shortcuts */}
      <footer className="bg-gray-900 border-t border-gray-700 py-4 mt-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-400 text-sm">
            <div className="mb-2">
              <span className="font-semibold">Keyboard Shortcuts:</span>
            </div>
            <div className="flex justify-center space-x-6 text-xs">
              <span>🎮 Arrow Keys / WASD: Move Snake</span>
              <span>🔄 Space: Pause/Resume</span>
              <span>🏆 Tab: Navigate Menu</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
