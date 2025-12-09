import { GameState, Position, Direction } from '../types/game';

export class SnakeGame {
  private gameState: GameState;
  private gameLoop: NodeJS.Timeout | null = null;

  constructor(boardSize = { width: 20, height: 20 }, gameMode: 'walls' | 'pass-through' = 'walls') {
    this.gameState = {
      snake: [{ x: 10, y: 10 }],
      food: this.generateFood({ width: 20, height: 20 }, [{ x: 10, y: 10 }]),
      direction: 'RIGHT',
      gameMode,
      score: 0,
      isGameOver: false,
      isPaused: false,
      boardSize,
    };
  }

  public getGameState(): GameState {
    return { ...this.gameState };
  }

  public setDirection(newDirection: Direction): void {
    if (this.gameState.isGameOver || this.gameState.isPaused) return;

    const opposites: Record<Direction, Direction> = {
      UP: 'DOWN',
      DOWN: 'UP',
      LEFT: 'RIGHT',
      RIGHT: 'LEFT',
    };

    if (opposites[this.gameState.direction] !== newDirection) {
      this.gameState.direction = newDirection;
    }
  }

  public startGame(): void {
    if (this.gameLoop) return;

    this.gameState.isGameOver = false;
    this.gameState.isPaused = false;

    this.gameLoop = setInterval(() => {
      this.move();
    }, 100);
  }

  public pauseGame(): void {
    this.gameState.isPaused = !this.gameState.isPaused;
  }

  public stopGame(): void {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }
  }

  public resetGame(): void {
    this.stopGame();
    this.gameState = {
      snake: [{ x: 10, y: 10 }],
      food: this.generateFood(this.gameState.boardSize, [{ x: 10, y: 10 }]),
      direction: 'RIGHT',
      gameMode: this.gameState.gameMode,
      score: 0,
      isGameOver: false,
      isPaused: false,
      boardSize: this.gameState.boardSize,
    };
  }

  private move(): void {
    if (this.gameState.isGameOver || this.gameState.isPaused) return;

    const { snake, direction, boardSize, gameMode } = this.gameState;
    const head = { ...snake[0] };

    switch (direction) {
      case 'UP':
        head.y -= 1;
        break;
      case 'DOWN':
        head.y += 1;
        break;
      case 'LEFT':
        head.x -= 1;
        break;
      case 'RIGHT':
        head.x += 1;
        break;
    }

    // Check wall collision
    if (gameMode === 'walls') {
      if (
        head.x < 0 ||
        head.x >= boardSize.width ||
        head.y < 0 ||
        head.y >= boardSize.height
      ) {
        this.gameOver();
        return;
      }
    } else {
      // Pass-through mode: wrap around walls
      if (head.x < 0) head.x = boardSize.width - 1;
      if (head.x >= boardSize.width) head.x = 0;
      if (head.y < 0) head.y = boardSize.height - 1;
      if (head.y >= boardSize.height) head.y = 0;
    }

    // Check self collision
    for (let i = 0; i < snake.length; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) {
        this.gameOver();
        return;
      }
    }

    const newSnake = [head, ...snake];

    // Check food collision
    if (head.x === this.gameState.food.x && head.y === this.gameState.food.y) {
      this.gameState.score += 10;
      this.gameState.food = this.generateFood(boardSize, newSnake);
    } else {
      newSnake.pop();
    }

    this.gameState.snake = newSnake;
  }

  private generateFood(boardSize: { width: number; height: number }, snake: Position[]): Position {
    let food: Position;
    do {
      food = {
        x: Math.floor(Math.random() * boardSize.width),
        y: Math.floor(Math.random() * boardSize.height),
      };
    } while (snake.some(segment => segment.x === food.x && segment.y === food.y));

    return food;
  }

  private gameOver(): void {
    this.gameState.isGameOver = true;
    this.stopGame();
  }

  public setGameMode(mode: 'walls' | 'pass-through'): void {
    if (!this.gameLoop) {
      this.gameState.gameMode = mode;
      this.resetGame();
    }
  }
}

// Utility functions for keyboard input
export function getDirectionFromKey(key: string): Direction | null {
  switch (key.toLowerCase()) {
    case 'arrowup':
    case 'w':
      return 'UP';
    case 'arrowdown':
    case 's':
      return 'DOWN';
    case 'arrowleft':
    case 'a':
      return 'LEFT';
    case 'arrowright':
    case 'd':
      return 'RIGHT';
    default:
      return null;
  }
}