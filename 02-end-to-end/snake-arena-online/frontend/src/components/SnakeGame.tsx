import React from 'react';
import { useSnakeGame } from '../hooks/useSnakeGame';
import { GameState } from '../types/game';

interface SnakeGameProps {
  gameMode?: 'walls' | 'pass-through';
  onGameOver?: (score: number) => void;
}

const SnakeGame: React.FC<SnakeGameProps> = ({ gameMode = 'walls', onGameOver }) => {
  const { gameState, startGame, pauseGame, resetGame, setGameMode } = useSnakeGame(gameMode);

  React.useEffect(() => {
    if (gameState?.isGameOver && onGameOver) {
      onGameOver(gameState.score);
    }
  }, [gameState?.isGameOver, gameState?.score, onGameOver]);

  React.useEffect(() => {
    setGameMode(gameMode);
  }, [gameMode, setGameMode]);

  if (!gameState) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-white">Loading game...</div>
      </div>
    );
  }

  const renderCell = (x: number, y: number) => {
    const isSnakeHead = gameState.snake[0].x === x && gameState.snake[0].y === y;
    const isSnakeBody = gameState.snake.slice(1).some(segment => segment.x === x && segment.y === y);
    const isFood = gameState.food.x === x && gameState.food.y === y;

    let cellClass = 'w-8 h-8 border border-gray-800 ';
    if (isSnakeHead) {
      cellClass += 'bg-green-600';
    } else if (isSnakeBody) {
      cellClass += 'bg-green-400';
    } else if (isFood) {
      cellClass += 'bg-red-500';
    } else {
      cellClass += 'bg-gray-900';
    }

    return <div key={`${x}-${y}`} className={cellClass} />;
  };

  const renderBoard = () => {
    const cells = [];
    for (let y = 0; y < gameState.boardSize.height; y++) {
      for (let x = 0; x < gameState.boardSize.width; x++) {
        cells.push(renderCell(x, y));
      }
    }
    return cells;
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-8 bg-gray-950 min-h-screen">
      <div className="text-white text-center space-y-2">
        <h1 className="text-3xl font-bold">Snake Arena</h1>
        <div className="flex items-center space-x-6 text-lg">
          <span>Mode: <span className="font-semibold text-blue-400">{gameMode}</span></span>
          <span>Score: <span className="font-semibold text-yellow-400">{gameState.score}</span></span>
        </div>
      </div>

      <div className="relative">
        {gameState.isGameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10 rounded">
            <div className="text-white text-center">
              <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
              <p className="text-xl mb-4">Final Score: {gameState.score}</p>
              <button
                onClick={resetGame}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded font-semibold transition-colors"
              >
                Play Again
              </button>
            </div>
          </div>
        )}

        <div
          className="grid gap-0 border-2 border-gray-600 rounded bg-gray-900"
          style={{
            gridTemplateColumns: `repeat(${gameState.boardSize.width}, 1fr)`,
            width: '640px',
            height: '640px'
          }}
        >
          {renderBoard()}
        </div>
      </div>

      <div className="flex flex-col items-center space-y-2">
        <div className="flex space-x-4">
          {!gameState.isGameOver && !gameState.isPaused && (
            <button
              onClick={pauseGame}
              className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded font-semibold transition-colors"
            >
              Pause
            </button>
          )}
          {!gameState.isGameOver && gameState.isPaused && (
            <button
              onClick={pauseGame}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold transition-colors"
            >
              Resume
            </button>
          )}
          <button
            onClick={resetGame}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-semibold transition-colors"
          >
            Reset
          </button>
          {!gameState.isGameOver && (
            <button
              onClick={startGame}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition-colors"
            >
              Start Game
            </button>
          )}
        </div>

        <div className="text-gray-400 text-sm text-center">
          <p>Use Arrow Keys or WASD to move</p>
          <p>Walls Mode: Don't hit walls!</p>
          <p>Pass-through Mode: Walls wrap around!</p>
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;