import React, { useState, useEffect, useCallback } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [{x: 10, y: 10}];
const INITIAL_DIRECTION = {x: 1, y: 0};
const GAME_SPEED = 150;

export default function SnakeGame() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({x: 15, y: 15});
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wallMode, setWallMode] = useState(true); // true = walls, false = pass-through
  const [scoreHistory, setScoreHistory] = useState(() => {
    const saved = localStorage.getItem('snakeScoreHistory');
    return saved ? JSON.parse(saved) : [];
  });

  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
    return newFood;
  }, []);

  const saveScore = useCallback((finalScore) => {
    const newHistory = [
      {
        score: finalScore,
        mode: wallMode ? 'Walls' : 'Pass-through',
        date: new Date().toLocaleString(),
        timestamp: Date.now()
      },
      ...scoreHistory
    ].slice(0, 5); // Keep only last 5 scores
    
    setScoreHistory(newHistory);
    localStorage.setItem('snakeScoreHistory', JSON.stringify(newHistory));
  }, [scoreHistory, wallMode]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(generateFood());
    setDirection(INITIAL_DIRECTION);
    setIsGameOver(false);
    setScore(0);
    setIsPlaying(true);
  };

  const checkCollision = useCallback((head) => {
    // Check self-collision
    for (let segment of snake.slice(1)) {
      if (head.x === segment.x && head.y === segment.y) {
        return true;
      }
    }
    
    // Check wall collision only if wall mode is enabled
    if (wallMode) {
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        return true;
      }
    }
    
    return false;
  }, [snake, wallMode]);

  const moveSnake = useCallback(() => {
    if (isGameOver || !isPlaying) return;

    setSnake(prevSnake => {
      const head = prevSnake[0];
      let newHead = {
        x: head.x + direction.x,
        y: head.y + direction.y
      };

      // Pass-through mode: wrap around edges
      if (!wallMode) {
        if (newHead.x < 0) newHead.x = GRID_SIZE - 1;
        if (newHead.x >= GRID_SIZE) newHead.x = 0;
        if (newHead.y < 0) newHead.y = GRID_SIZE - 1;
        if (newHead.y >= GRID_SIZE) newHead.y = 0;
      }

      if (checkCollision(newHead)) {
        setIsGameOver(true);
        setIsPlaying(false);
        saveScore(score);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 10);
        setFood(generateFood());
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, isGameOver, isPlaying, checkCollision, generateFood, wallMode, score, saveScore]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isPlaying && e.key !== ' ') return;
      
      switch(e.key) {
        case 'ArrowUp':
          if (direction.y === 0) setDirection({x: 0, y: -1});
          break;
        case 'ArrowDown':
          if (direction.y === 0) setDirection({x: 0, y: 1});
          break;
        case 'ArrowLeft':
          if (direction.x === 0) setDirection({x: -1, y: 0});
          break;
        case 'ArrowRight':
          if (direction.x === 0) setDirection({x: 1, y: 0});
          break;
        case ' ':
          if (isGameOver) {
            resetGame();
          } else {
            setIsPlaying(!isPlaying);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, isPlaying, isGameOver]);

  useEffect(() => {
    const gameLoop = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(gameLoop);
  }, [moveSnake]);

  const clearHistory = () => {
    setScoreHistory([]);
    localStorage.removeItem('snakeScoreHistory');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1a1a2e',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: '#00ff88',
          marginBottom: '0.5rem',
          textShadow: '0 0 20px rgba(0, 255, 136, 0.5)'
        }}>
          🐍 Snake Game
        </h1>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#ffffff',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          padding: '0.5rem 1.5rem',
          borderRadius: '0.5rem',
          display: 'inline-block'
        }}>
          Score: {score}
        </div>
      </div>

      {/* Game Mode Toggle */}
      <div style={{
        marginBottom: '1rem',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center'
      }}>
        <span style={{ color: '#a0a0a0', fontWeight: '600' }}>Mode:</span>
        <button
          onClick={() => !isPlaying && setWallMode(true)}
          disabled={isPlaying}
          style={{
            padding: '0.5rem 1.5rem',
            backgroundColor: wallMode ? '#00ff88' : '#333',
            color: wallMode ? '#1a1a2e' : '#a0a0a0',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: isPlaying ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            opacity: isPlaying ? 0.5 : 1,
            transition: 'all 0.3s'
          }}
        >
          🧱 Walls
        </button>
        <button
          onClick={() => !isPlaying && setWallMode(false)}
          disabled={isPlaying}
          style={{
            padding: '0.5rem 1.5rem',
            backgroundColor: !wallMode ? '#00ff88' : '#333',
            color: !wallMode ? '#1a1a2e' : '#a0a0a0',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: isPlaying ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            opacity: isPlaying ? 0.5 : 1,
            transition: 'all 0.3s'
          }}
        >
          🌀 Pass-through
        </button>
      </div>

      <div style={{
        position: 'relative',
        backgroundColor: '#0f0f1e',
        border: `4px solid ${wallMode ? '#00ff88' : '#ff00ff'}`,
        width: GRID_SIZE * CELL_SIZE,
        height: GRID_SIZE * CELL_SIZE,
        boxShadow: `0 0 30px ${wallMode ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 0, 255, 0.3)'}`,
        borderRadius: '8px'
      }}>
        {snake.map((segment, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: segment.x * CELL_SIZE,
              top: segment.y * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE,
              backgroundColor: i === 0 ? '#00ff88' : '#00cc6a',
              borderRadius: '3px',
              border: '1px solid #0f0f1e',
              boxShadow: i === 0 ? '0 0 10px rgba(0, 255, 136, 0.5)' : 'none'
            }}
          />
        ))}
        
        <div style={{
          position: 'absolute',
          left: food.x * CELL_SIZE,
          top: food.y * CELL_SIZE,
          width: CELL_SIZE,
          height: CELL_SIZE,
          backgroundColor: '#ff0055',
          borderRadius: '50%',
          boxShadow: '0 0 15px rgba(255, 0, 85, 0.7)',
          border: '2px solid #ff3377'
        }} />

        {isGameOver && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: '#ff0055',
                marginBottom: '1rem',
                textShadow: '0 0 20px rgba(255, 0, 85, 0.5)'
              }}>
                Game Over!
              </div>
              <div style={{
                fontSize: '1.5rem',
                color: '#ffffff',
                marginBottom: '1.5rem'
              }}>
                Final Score: {score}
              </div>
              <button
                onClick={resetGame}
                style={{
                  padding: '0.75rem 2rem',
                  backgroundColor: '#00ff88',
                  color: '#1a1a2e',
                  fontWeight: '600',
                  fontSize: '1.1rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  boxShadow: '0 0 20px rgba(0, 255, 136, 0.4)',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#00cc6a';
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#00ff88';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                🎮 Play Again
              </button>
            </div>
          </div>
        )}

        {!isPlaying && !isGameOver && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#ffaa00',
                marginBottom: '1rem',
                textShadow: '0 0 20px rgba(255, 170, 0, 0.5)'
              }}>
                ⏸️ Paused
              </div>
              <div style={{ color: '#ffffff', fontSize: '1.1rem' }}>
                Press SPACE to continue
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        {!isPlaying && !isGameOver && (
          <button
            onClick={() => setIsPlaying(true)}
            style={{
              padding: '1rem 2.5rem',
              backgroundColor: '#00ff88',
              color: '#1a1a2e',
              fontSize: '1.3rem',
              fontWeight: '700',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              marginBottom: '1.5rem',
              boxShadow: '0 0 25px rgba(0, 255, 136, 0.4)',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#00cc6a';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#00ff88';
              e.target.style.transform = 'scale(1)';
            }}
          >
            ▶️ Start Game
          </button>
        )}
        <div style={{ color: '#a0a0a0', lineHeight: '1.8', marginBottom: '1rem' }}>
          <div>⬆️⬇️⬅️➡️ Use Arrow Keys to move</div>
          <div>⏯️ Press SPACE to pause/resume</div>
          <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: '#808080' }}>
            {wallMode ? '🧱 Hitting walls = Game Over' : '🌀 Pass through walls to other side'}
          </div>
        </div>
      </div>

      {/* Score History */}
      {scoreHistory.length > 0 && (
        <div style={{
          marginTop: '2rem',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          padding: '1.5rem',
          borderRadius: '1rem',
          border: '2px solid rgba(0, 255, 136, 0.3)',
          minWidth: '400px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h3 style={{
              color: '#00ff88',
              fontSize: '1.3rem',
              fontWeight: 'bold',
              margin: 0
            }}>
              🏆 Last 5 Scores
            </h3>
            <button
              onClick={clearHistory}
              style={{
                padding: '0.3rem 0.8rem',
                backgroundColor: '#ff0055',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.3rem',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: '600'
              }}
            >
              Clear
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {scoreHistory.map((entry, index) => (
              <div
                key={entry.timestamp}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  backgroundColor: index === 0 ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '0.5rem',
                  border: index === 0 ? '1px solid rgba(0, 255, 136, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{
                    color: index === 0 ? '#ffd700' : '#a0a0a0',
                    fontWeight: 'bold',
                    fontSize: '1.1rem'
                  }}>
                    #{index + 1}
                  </span>
                  <span style={{
                    color: '#ffffff',
                    fontWeight: 'bold',
                    fontSize: '1.2rem'
                  }}>
                    {entry.score}
                  </span>
                  <span style={{
                    color: '#808080',
                    fontSize: '0.85rem',
                    padding: '0.2rem 0.6rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '0.3rem'
                  }}>
                    {entry.mode}
                  </span>
                </div>
                <span style={{
                  color: '#606060',
                  fontSize: '0.75rem'
                }}>
                  {new Date(entry.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}