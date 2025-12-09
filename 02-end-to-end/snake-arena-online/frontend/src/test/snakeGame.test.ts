import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SnakeGame } from '../utils/snakeGame'
import { Direction } from '../types/game'

describe('SnakeGame', () => {
  let game: SnakeGame

  beforeEach(() => {
    game = new SnakeGame({ width: 10, height: 10 }, 'walls')
  })

  describe('initialization', () => {
    it('should initialize with correct starting state', () => {
      const state = game.getGameState()

      expect(state.snake).toHaveLength(1)
      expect(state.snake[0]).toEqual({ x: 5, y: 5 }) // Center of 10x10 board
      expect(state.direction).toBe('RIGHT')
      expect(state.score).toBe(0)
      expect(state.isGameOver).toBe(false)
      expect(state.isPaused).toBe(false)
      expect(state.gameMode).toBe('walls')
      expect(state.boardSize).toEqual({ width: 10, height: 10 })
      expect(state.food).toBeDefined()
    })

    it('should initialize with pass-through mode when specified', () => {
      const passThroughGame = new SnakeGame({ width: 10, height: 10 }, 'pass-through')
      const state = passThroughGame.getGameState()

      expect(state.gameMode).toBe('pass-through')
    })
  })

  describe('direction handling', () => {
    it('should allow changing direction', () => {
      game.setDirection('UP')
      const state = game.getGameState()
      expect(state.direction).toBe('UP')
    })

    it('should not allow 180-degree turns', () => {
      game.setDirection('UP')
      game.setDirection('DOWN') // Should be ignored
      const state = game.getGameState()
      expect(state.direction).toBe('UP')
    })

    it('should allow perpendicular turns', () => {
      game.setDirection('RIGHT') // Starting direction
      game.setDirection('UP')
      expect(game.getGameState().direction).toBe('UP')

      game.setDirection('LEFT')
      expect(game.getGameState().direction).toBe('LEFT')

      game.setDirection('DOWN')
      expect(game.getGameState().direction).toBe('DOWN')
    })

    it('should not change direction when game is over', () => {
      // First, end the game
      game.resetGame()
      game.startGame()

      // Simulate game over by hitting wall
      for (let i = 0; i < 6; i++) {
        game.move()
      }

      expect(game.getGameState().isGameOver).toBe(true)

      const originalDirection = game.getGameState().direction
      game.setDirection('UP')
      expect(game.getGameState().direction).toBe(originalDirection)
    })
  })

  describe('game mechanics - walls mode', () => {
    beforeEach(() => {
      game.startGame()
    })

    it('should move snake right on each step', () => {
      const initialHead = { ...game.getGameState().snake[0] }
      game.move()

      const newHead = game.getGameState().snake[0]
      expect(newHead.x).toBe(initialHead.x + 1)
      expect(newHead.y).toBe(initialHead.y)
    })

    it('should move snake up', () => {
      game.setDirection('UP')
      const initialHead = { ...game.getGameState().snake[0] }
      game.move()

      const newHead = game.getGameState().snake[0]
      expect(newHead.x).toBe(initialHead.x)
      expect(newHead.y).toBe(initialHead.y - 1)
    })

    it('should move snake down', () => {
      game.setDirection('DOWN')
      const initialHead = { ...game.getGameState().snake[0] }
      game.move()

      const newHead = game.getGameState().snake[0]
      expect(newHead.x).toBe(initialHead.x)
      expect(newHead.y).toBe(initialHead.y + 1)
    })

    it('should move snake left', () => {
      game.setDirection('LEFT')
      const initialHead = { ...game.getGameState().snake[0] }
      game.move()

      const newHead = game.getGameState().snake[0]
      expect(newHead.x).toBe(initialHead.x - 1)
      expect(newHead.y).toBe(initialHead.y)
    })

    it('should end game when hitting wall in walls mode', () => {
      // Move to the right edge
      for (let i = 0; i < 5; i++) {
        game.move()
      }

      expect(game.getGameState().isGameOver).toBe(true)
      expect(game.getGameState().snake[0].x).toBe(9) // Hit right wall
    })

    it('should grow snake when eating food', () => {
      const initialLength = game.getGameState().snake.length

      // Position food in front of snake
      const foodPosition = { x: 6, y: 5 }
      game['gameState'].food = foodPosition

      game.move()

      expect(game.getGameState().snake.length).toBe(initialLength + 1)
      expect(game.getGameState().score).toBe(10)
    })

    it('should generate new food after eating', () => {
      const initialFood = { ...game.getGameState().food }

      // Position food in front of snake
      const foodPosition = { x: 6, y: 5 }
      game['gameState'].food = foodPosition

      game.move()

      expect(game.getGameState().food).not.toEqual(initialFood)
      expect(game.getGameState().food).not.toEqual(foodPosition)
    })

    it('should end game when snake collides with itself', () => {
      // Make snake grow and create a loop
      const snake = game['gameState'].snake

      // Grow snake to length 4
      for (let i = 0; i < 3; i++) {
        game['gameState'].food = { x: 6 + i, y: 5 }
        game.move()
      }

      // Create a self-collision scenario
      game['gameState'].snake = [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 4, y: 4 },
        { x: 5, y: 4 }
      ]

      game.setDirection('UP')
      game.move()

      expect(game.getGameState().isGameOver).toBe(true)
    })
  })

  describe('game mechanics - pass-through mode', () => {
    beforeEach(() => {
      game = new SnakeGame({ width: 10, height: 10 }, 'pass-through')
      game.startGame()
    })

    it('should wrap around when hitting right wall', () => {
      // Move to the right edge
      for (let i = 0; i < 5; i++) {
        game.move()
      }

      expect(game.getGameState().snake[0].x).toBe(9)

      // One more move should wrap to left side
      game.move()

      expect(game.getGameState().snake[0].x).toBe(0)
      expect(game.getGameState().isGameOver).toBe(false)
    })

    it('should wrap around when hitting left wall', () => {
      game.setDirection('LEFT')

      // Move to the left edge
      for (let i = 0; i < 5; i++) {
        game.move()
      }

      expect(game.getGameState().snake[0].x).toBe(0)

      // One more move should wrap to right side
      game.move()

      expect(game.getGameState().snake[0].x).toBe(9)
      expect(game.getGameState().isGameOver).toBe(false)
    })

    it('should wrap around when hitting top wall', () => {
      game.setDirection('UP')

      // Move to the top edge
      for (let i = 0; i < 5; i++) {
        game.move()
      }

      expect(game.getGameState().snake[0].y).toBe(0)

      // One more move should wrap to bottom
      game.move()

      expect(game.getGameState().snake[0].y).toBe(9)
      expect(game.getGameState().isGameOver).toBe(false)
    })

    it('should wrap around when hitting bottom wall', () => {
      game.setDirection('DOWN')

      // Move to the bottom edge
      for (let i = 0; i < 5; i++) {
        game.move()
      }

      expect(game.getGameState().snake[0].y).toBe(9)

      // One more move should wrap to top
      game.move()

      expect(game.getGameState().snake[0].y).toBe(0)
      expect(game.getGameState().isGameOver).toBe(false)
    })

    it('should still end game on self-collision in pass-through mode', () => {
      // Create a self-collision scenario
      game['gameState'].snake = [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 4, y: 4 },
        { x: 5, y: 4 }
      ]

      game.setDirection('UP')
      game.move()

      expect(game.getGameState().isGameOver).toBe(true)
    })
  })

  describe('game controls', () => {
    it('should start and stop game', () => {
      expect(game.getGameState().isGameOver).toBe(false)

      game.startGame()
      expect(game.getGameState().isPaused).toBe(false)

      game.stopGame()
      expect(game.getGameState().isPaused).toBe(true)
    })

    it('should pause and resume game', () => {
      game.startGame()
      game.pauseGame()

      expect(game.getGameState().isPaused).toBe(true)

      game.pauseGame() // Resume
      expect(game.getGameState().isPaused).toBe(false)
    })

    it('should reset game to initial state', () => {
      game.startGame()
      game.move()
      game.move()

      // Change some state
      game.setDirection('UP')
      game['gameState'].score = 50

      game.resetGame()
      const state = game.getGameState()

      expect(state.snake).toHaveLength(1)
      expect(state.snake[0]).toEqual({ x: 5, y: 5 })
      expect(state.direction).toBe('RIGHT')
      expect(state.score).toBe(0)
      expect(state.isGameOver).toBe(false)
      expect(state.isPaused).toBe(false)
    })

    it('should change game mode when not playing', () => {
      game.resetGame()
      game.setGameMode('pass-through')

      expect(game.getGameState().gameMode).toBe('pass-through')
    })
  })

  describe('food generation', () => {
    it('should generate food not on snake', () => {
      const state = game.getGameState()
      const snake = state.snake
      const food = state.food

      // Food should not be on any snake segment
      snake.forEach(segment => {
        expect(food.x).not.toBe(segment.x)
        expect(food.y).not.toBe(segment.y)
      })
    })

    it('should generate food within board boundaries', () => {
      const state = game.getGameState()
      const food = state.food
      const boardSize = state.boardSize

      expect(food.x).toBeGreaterThanOrEqual(0)
      expect(food.x).toBeLessThan(boardSize.width)
      expect(food.y).toBeGreaterThanOrEqual(0)
      expect(food.y).toBeLessThan(boardSize.height)
    })
  })
})