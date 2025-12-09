import { useState, useEffect, useRef, useCallback } from 'react';
import { SnakeGame, getDirectionFromKey } from '../utils/snakeGame';
import { GameState, Direction } from '../types/game';

export const useSnakeGame = (initialMode: 'walls' | 'pass-through' = 'walls') => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const gameRef = useRef<SnakeGame | null>(null);

  useEffect(() => {
    gameRef.current = new SnakeGame({ width: 20, height: 20 }, initialMode);
    setGameState(gameRef.current.getGameState());
  }, [initialMode]);

  const startGame = useCallback(() => {
    if (gameRef.current) {
      gameRef.current.startGame();
    }
  }, []);

  const pauseGame = useCallback(() => {
    if (gameRef.current) {
      gameRef.current.pauseGame();
    }
  }, []);

  const stopGame = useCallback(() => {
    if (gameRef.current) {
      gameRef.current.stopGame();
    }
  }, []);

  const resetGame = useCallback(() => {
    if (gameRef.current) {
      gameRef.current.resetGame();
      setGameState(gameRef.current.getGameState());
    }
  }, []);

  const setDirection = useCallback((direction: Direction) => {
    if (gameRef.current) {
      gameRef.current.setDirection(direction);
    }
  }, []);

  const setGameMode = useCallback((mode: 'walls' | 'pass-through') => {
    if (gameRef.current) {
      gameRef.current.setGameMode(mode);
      setGameState(gameRef.current.getGameState());
    }
  }, []);

  // Update game state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (gameRef.current) {
        const newState = gameRef.current.getGameState();
        setGameState(newState);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const direction = getDirectionFromKey(event.key);
      if (direction) {
        setDirection(direction);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [setDirection]);

  return {
    gameState,
    startGame,
    pauseGame,
    stopGame,
    resetGame,
    setDirection,
    setGameMode,
  };
};