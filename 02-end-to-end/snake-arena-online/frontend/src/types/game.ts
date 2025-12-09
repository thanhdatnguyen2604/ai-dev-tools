export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  snake: Position[];
  food: Position;
  direction: Direction;
  gameMode: 'walls' | 'pass-through';
  score: number;
  isGameOver: boolean;
  isPaused: boolean;
  boardSize: {
    width: number;
    height: number;
  };
}

export interface Player {
  id: string;
  username: string;
  score: number;
  isPlaying: boolean;
  currentGame?: GameState;
}

export interface LeaderboardEntry {
  username: string;
  score: number;
  date: string;
  gameMode: 'walls' | 'pass-through';
}