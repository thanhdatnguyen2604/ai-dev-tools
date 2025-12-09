import { Player, LeaderboardEntry, GameState } from '../types/game';

export interface User {
  id: string;
  username: string;
  email: string;
  password: string; // In a real app, this would be hashed
}

export interface AuthResponse {
  user: User;
  token: string;
}

class MockBackendService {
  private users: User[] = [
    {
      id: '1',
      username: 'player1',
      email: 'player1@example.com',
      password: 'password123',
    },
    {
      id: '2',
      username: 'snakeMaster',
      email: 'master@example.com',
      password: 'password123',
    },
  ];

  private leaderboard: LeaderboardEntry[] = [
    {
      username: 'snakeMaster',
      score: 150,
      date: '2025-11-30',
      gameMode: 'walls',
    },
    {
      username: 'player1',
      score: 120,
      date: '2025-11-29',
      gameMode: 'pass-through',
    },
    {
      username: 'proGamer',
      score: 180,
      date: '2025-11-28',
      gameMode: 'walls',
    },
  ];

  private activePlayers: Player[] = [];
  private currentUser: User | null = null;
  private authToken: string | null = null;

  // Authentication methods
  async login(username: string, password: string): Promise<AuthResponse> {
    await this.simulateDelay(500);

    const user = this.users.find(u => u.username === username && u.password === password);
    if (!user) {
      throw new Error('Invalid username or password');
    }

    this.currentUser = user;
    this.authToken = `mock_token_${Date.now()}`;

    return {
      user: { ...user, password: '' }, // Don't return password
      token: this.authToken,
    };
  }

  async signup(username: string, email: string, password: string): Promise<AuthResponse> {
    await this.simulateDelay(500);

    if (this.users.some(u => u.username === username)) {
      throw new Error('Username already exists');
    }

    if (this.users.some(u => u.email === email)) {
      throw new Error('Email already exists');
    }

    const newUser: User = {
      id: Date.now().toString(),
      username,
      email,
      password,
    };

    this.users.push(newUser);
    this.currentUser = newUser;
    this.authToken = `mock_token_${Date.now()}`;

    return {
      user: { ...newUser, password: '' },
      token: this.authToken,
    };
  }

  logout(): void {
    this.currentUser = null;
    this.authToken = null;
  }

  getCurrentUser(): User | null {
    return this.currentUser ? { ...this.currentUser, password: '' } : null;
  }

  isAuthenticated(): boolean {
    return this.authToken !== null;
  }

  // Leaderboard methods
  async getLeaderboard(gameMode?: 'walls' | 'pass-through'): Promise<LeaderboardEntry[]> {
    await this.simulateDelay(300);

    let filteredLeaderboard = this.leaderboard;
    if (gameMode) {
      filteredLeaderboard = this.leaderboard.filter(entry => entry.gameMode === gameMode);
    }

    return filteredLeaderboard.sort((a, b) => b.score - a.score);
  }

  async submitScore(score: number, gameMode: 'walls' | 'pass-through'): Promise<void> {
    await this.simulateDelay(500);

    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    const newEntry: LeaderboardEntry = {
      username: this.currentUser.username,
      score,
      date: new Date().toISOString().split('T')[0],
      gameMode,
    };

    this.leaderboard.push(newEntry);
  }

  // Multiplayer/Spectator methods
  async getActivePlayers(): Promise<Player[]> {
    await this.simulateDelay(200);

    // Generate some mock active players if none exist
    if (this.activePlayers.length === 0) {
      this.generateMockPlayers();
    }

    return this.activePlayers.map(player => ({
      ...player,
      currentGame: player.currentGame ? { ...player.currentGame } : undefined,
    }));
  }

  async joinGame(): Promise<Player> {
    await this.simulateDelay(300);

    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    const player: Player = {
      id: this.currentUser.id,
      username: this.currentUser.username,
      score: 0,
      isPlaying: true,
    };

    this.activePlayers.push(player);
    return player;
  }

  async leaveGame(): Promise<void> {
    await this.simulateDelay(200);

    if (!this.currentUser) return;

    this.activePlayers = this.activePlayers.filter(p => p.id !== this.currentUser!.id);
  }

  async updateGameScore(score: number): Promise<void> {
    await this.simulateDelay(100);

    if (!this.currentUser) return;

    const player = this.activePlayers.find(p => p.id === this.currentUser!.id);
    if (player) {
      player.score = score;
    }
  }

  // Private helper methods
  private simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateMockPlayers(): void {
    const mockPlayers: Player[] = [
      {
        id: 'mock1',
        username: 'SpeedySnake',
        score: 45,
        isPlaying: true,
        currentGame: this.generateMockGameState('walls', 45),
      },
      {
        id: 'mock2',
        username: 'WallCrawler',
        score: 78,
        isPlaying: true,
        currentGame: this.generateMockGameState('pass-through', 78),
      },
      {
        id: 'mock3',
        username: 'NoobMaster',
        score: 12,
        isPlaying: true,
        currentGame: this.generateMockGameState('walls', 12),
      },
    ];

    this.activePlayers = mockPlayers;
  }

  private generateMockGameState(mode: 'walls' | 'pass-through', score: number): GameState {
    const boardSize = { width: 20, height: 20 };
    const snakeLength = 3 + Math.floor(score / 10);

    const snake = [];
    for (let i = 0; i < snakeLength; i++) {
      snake.push({
        x: 10 - i,
        y: 10,
      });
    }

    return {
      snake,
      food: { x: 5, y: 5 },
      direction: 'RIGHT',
      gameMode: mode,
      score,
      isGameOver: false,
      isPaused: false,
      boardSize,
    };
  }

  // Method to simulate real-time snake movement for spectator mode
  startSimulation(): void {
    setInterval(() => {
      this.activePlayers.forEach(player => {
        if (player.isPlaying && player.currentGame) {
          const game = player.currentGame;

          // Move snake based on current direction
          if (game.snake.length > 0) {
            const head = { ...game.snake[0] };

            // Move head based on direction
            switch (game.direction) {
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

            // Handle wall collisions based on game mode
            if (game.gameMode === 'pass-through') {
              // Wrap around walls
              if (head.x < 0) head.x = game.boardSize.width - 1;
              if (head.x >= game.boardSize.width) head.x = 0;
              if (head.y < 0) head.y = game.boardSize.height - 1;
              if (head.y >= game.boardSize.height) head.y = 0;
            } else {
              // Bounce off walls (walls mode)
              let bounced = false;
              if (head.x < 0 || head.x >= game.boardSize.width ||
                  head.y < 0 || head.y >= game.boardSize.height) {

                // Simple bounce: reverse direction
                const directions: ('UP' | 'DOWN' | 'LEFT' | 'RIGHT')[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
                const validDirections = directions.filter(d => {
                  // Don't immediately reverse
                  if ((d === 'UP' && game.direction === 'DOWN') ||
                      (d === 'DOWN' && game.direction === 'UP') ||
                      (d === 'LEFT' && game.direction === 'RIGHT') ||
                      (d === 'RIGHT' && game.direction === 'LEFT')) {
                    return false;
                  }
                  return true;
                });

                game.direction = validDirections[Math.floor(Math.random() * validDirections.length)];
                bounced = true;
              }

              // Skip movement if bounced
              if (bounced) {
                return;
              }
            }

            // Check if snake ate food
            let ateFood = false;
            if (head.x === game.food.x && head.y === game.food.y) {
              ateFood = true;
              player.score += 10;
              game.score = player.score;

              // Generate new food position (avoid snake body)
              let newFood: { x: number; y: number };
              do {
                newFood = {
                  x: Math.floor(Math.random() * game.boardSize.width),
                  y: Math.floor(Math.random() * game.boardSize.height)
                };
              } while (game.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));

              game.food = newFood;
            }

            // Update snake position
            game.snake.unshift(head);

            // Remove tail if didn't eat food (and snake is longer than minimum length)
            if (!ateFood && game.snake.length > 3) {
              game.snake.pop();
            }

            // Randomly change direction occasionally for more natural movement
            if (Math.random() > 0.85) {
              const directions: ('UP' | 'DOWN' | 'LEFT' | 'RIGHT')[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
              const validDirections = directions.filter(d => {
                // Don't immediately reverse
                if ((d === 'UP' && game.direction === 'DOWN') ||
                    (d === 'DOWN' && game.direction === 'UP') ||
                    (d === 'LEFT' && game.direction === 'RIGHT') ||
                    (d === 'RIGHT' && game.direction === 'LEFT')) {
                  return false;
                }
                return true;
              });

              game.direction = validDirections[Math.floor(Math.random() * validDirections.length)];
            }
          }
        }
      });
    }, 300); // Update every 300ms for smooth movement
  }
}

// Export a singleton instance
export const mockBackend = new MockBackendService();