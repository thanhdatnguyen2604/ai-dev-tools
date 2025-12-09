# 🐍 Snake Arena Online

A multiplayer Snake game built with React, Vite, and Tailwind CSS featuring two game modes, authentication, leaderboard, and spectator mode.

## 🎮 Features

### Game Modes
- **Walls Mode**: Classic snake gameplay - hitting walls ends the game
- **Pass-through Mode**: Walls wrap around, allowing continuous movement

### Core Features
- ✅ **Authentication**: Login/signup with mock backend
- ✅ **Leaderboard**: Track high scores across different game modes
- ✅ **Spectator Mode**: Watch other players compete in real-time
- ✅ **Interactive UI**: Smooth transitions, keyboard controls, responsive design
- ✅ **Comprehensive Testing**: Unit tests for game logic and components

### Game Controls
- **Arrow Keys** or **WASD**: Move the snake
- **Space**: Pause/Resume game
- **Mouse**: Navigate UI and menus

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd snake-arena-online
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production
```bash
npm run build
npm run preview
```

## 🎯 Demo

### Login Credentials
Use these demo accounts to explore the features:

- **Username**: `player1` | **Password**: `password123`
- **Username**: `snakeMaster` | **Password**: `password123`

Or create a new account with any username and email.

### Features to Try

1. **Play the Game**
   - Choose between Walls and Pass-through modes
   - Use arrow keys or WASD to control the snake
   - Eat food to grow and increase your score

2. **Leaderboard**
   - View top scores from all players
   - Filter by game mode (Walls or Pass-through)
   - See statistics and average scores

3. **Spectator Mode**
   - Watch other players in real-time
   - See their current game state and scores
   - Learn strategies from top players

## 🏗️ Architecture

### Project Structure
```
src/
├── components/          # React components
│   ├── Auth.tsx       # Authentication component
│   ├── Header.tsx      # Navigation header
│   ├── SnakeGame.tsx   # Main game component
│   ├── Leaderboard.tsx # Leaderboard display
│   └── SpectatorMode.tsx # Spectator mode
├── hooks/              # Custom React hooks
│   ├── useSnakeGame.ts # Game state management
│   └── useMockBackend.ts # Mock API hooks
├── services/           # Mock backend service
│   └── mockBackend.ts # Centralized API mock
├── types/              # TypeScript type definitions
│   └── game.ts        # Game-related types
├── utils/              # Utility functions
│   └── snakeGame.ts   # Core game logic
└── test/              # Test files
    ├── snakeGame.test.ts
    ├── mockBackend.test.ts
    └── components.test.tsx
```

### Key Technologies
- **React 19** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Vitest** for testing
- **React Testing Library** for component tests

### Mock Backend
The game uses a centralized mock backend service (`src/services/mockBackend.ts`) that simulates:
- User authentication and registration
- Score submission and leaderboard management
- Multiplayer features with simulated active players
- Real-time updates for spectator mode

## 🧪 Testing

### Run Tests
```bash
# Run all tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Test Coverage
- **Game Logic**: Complete test coverage for snake movement, collision detection, scoring
- **Mock Backend**: All API endpoints and data operations
- **Components**: UI rendering and user interactions

## 🎮 Game Logic

### Snake Movement
- Smooth movement with collision detection
- Direction changes with 180° turn prevention
- Food consumption and snake growth mechanics

### Collision Detection
- Wall collisions (different behavior per game mode)
- Self-collision detection
- Food collision and scoring

### Scoring System
- 10 points per food item consumed
- Score tracking across all players
- Leaderboard integration

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Generate coverage report

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting (if configured)
- Tailwind CSS for consistent styling

## 🌟 Future Enhancements

### Backend Integration
- Replace mock backend with real WebSocket/REST API
- Add real-time multiplayer gameplay
- Implement actual user sessions and persistence

### Game Features
- Power-ups and special items
- Multiple difficulty levels
- Custom snake colors and themes
- Achievements and badges
- Tournament mode

### Social Features
- Friend system and private games
- Chat functionality
- Player profiles and statistics
- Game replays

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under MIT License.

## 🙏 Acknowledgments

- Classic Snake game inspiration
- React community for excellent tools and libraries
- Tailwind CSS for utility-first CSS framework