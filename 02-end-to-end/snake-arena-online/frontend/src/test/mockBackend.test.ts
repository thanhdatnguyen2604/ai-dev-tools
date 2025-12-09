import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mockBackend } from '../services/mockBackend'
import { LeaderboardEntry } from '../types/game'

describe('MockBackendService', () => {
  beforeEach(() => {
    // Reset the backend state before each test
    mockBackend.logout()
  })

  describe('Authentication', () => {
    it('should login with valid credentials', async () => {
      const response = await mockBackend.login('player1', 'password123')

      expect(response.user.username).toBe('player1')
      expect(response.user.email).toBe('player1@example.com')
      expect(response.user.password).toBe('') // Password should not be returned
      expect(response.token).toBeDefined()
      expect(mockBackend.isAuthenticated()).toBe(true)
      expect(mockBackend.getCurrentUser()?.username).toBe('player1')
    })

    it('should reject login with invalid credentials', async () => {
      await expect(mockBackend.login('player1', 'wrongpassword')).rejects.toThrow('Invalid username or password')
      expect(mockBackend.isAuthenticated()).toBe(false)
    })

    it('should reject login with non-existent user', async () => {
      await expect(mockBackend.login('nonexistent', 'password123')).rejects.toThrow('Invalid username or password')
      expect(mockBackend.isAuthenticated()).toBe(false)
    })

    it('should signup new user with valid data', async () => {
      const response = await mockBackend.signup('newuser', 'newuser@example.com', 'password123')

      expect(response.user.username).toBe('newuser')
      expect(response.user.email).toBe('newuser@example.com')
      expect(response.user.password).toBe('') // Password should not be returned
      expect(response.token).toBeDefined()
      expect(mockBackend.isAuthenticated()).toBe(true)
      expect(mockBackend.getCurrentUser()?.username).toBe('newuser')
    })

    it('should reject signup with existing username', async () => {
      await expect(mockBackend.signup('player1', 'different@example.com', 'password123'))
        .rejects.toThrow('Username already exists')
    })

    it('should reject signup with existing email', async () => {
      await expect(mockBackend.signup('different', 'player1@example.com', 'password123'))
        .rejects.toThrow('Email already exists')
    })

    it('should reject signup with invalid email', async () => {
      await expect(mockBackend.signup('newuser', 'invalid-email', 'password123'))
        .rejects.toThrow('Please enter a valid email')
    })

    it('should logout correctly', async () => {
      await mockBackend.login('player1', 'password123')
      expect(mockBackend.isAuthenticated()).toBe(true)

      mockBackend.logout()
      expect(mockBackend.isAuthenticated()).toBe(false)
      expect(mockBackend.getCurrentUser()).toBe(null)
    })
  })

  describe('Leaderboard', () => {
    beforeEach(async () => {
      // Login to access leaderboard features
      await mockBackend.login('player1', 'password123')
    })

    it('should get initial leaderboard data', async () => {
      const leaderboard = await mockBackend.getLeaderboard()

      expect(leaderboard).toBeInstanceOf(Array)
      expect(leaderboard.length).toBeGreaterThan(0)
      expect(leaderboard[0]).toHaveProperty('username')
      expect(leaderboard[0]).toHaveProperty('score')
      expect(leaderboard[0]).toHaveProperty('date')
      expect(leaderboard[0]).toHaveProperty('gameMode')
    })

    it('should get leaderboard filtered by walls mode', async () => {
      const wallsLeaderboard = await mockBackend.getLeaderboard('walls')

      expect(wallsLeaderboard.every(entry => entry.gameMode === 'walls')).toBe(true)
    })

    it('should get leaderboard filtered by pass-through mode', async () => {
      const passThroughLeaderboard = await mockBackend.getLeaderboard('pass-through')

      expect(passThroughLeaderboard.every(entry => entry.gameMode === 'pass-through')).toBe(true)
    })

    it('should submit new score to leaderboard', async () => {
      const initialLeaderboard = await mockBackend.getLeaderboard()
      const initialLength = initialLeaderboard.length

      await mockBackend.submitScore(200, 'walls')

      const updatedLeaderboard = await mockBackend.getLeaderboard()
      expect(updatedLeaderboard.length).toBe(initialLength + 1)

      const newEntry = updatedLeaderboard.find(entry => entry.score === 200)
      expect(newEntry).toBeDefined()
      expect(newEntry!.username).toBe('player1')
      expect(newEntry!.gameMode).toBe('walls')
    })

    it('should reject score submission when not authenticated', async () => {
      mockBackend.logout()

      await expect(mockBackend.submitScore(200, 'walls'))
        .rejects.toThrow('User not authenticated')
    })
  })

  describe('Multiplayer/Spectator', () => {
    beforeEach(async () => {
      await mockBackend.login('player1', 'password123')
    })

    it('should get active players list', async () => {
      const players = await mockBackend.getActivePlayers()

      expect(players).toBeInstanceOf(Array)
      expect(players.length).toBeGreaterThanOrEqual(0)

      // Check structure of player objects
      players.forEach(player => {
        expect(player).toHaveProperty('id')
        expect(player).toHaveProperty('username')
        expect(player).toHaveProperty('score')
        expect(player).toHaveProperty('isPlaying')
      })
    })

    it('should join game as authenticated user', async () => {
      const player = await mockBackend.joinGame()

      expect(player.username).toBe('player1')
      expect(player.isPlaying).toBe(true)
      expect(player.score).toBe(0)
    })

    it('should reject game join when not authenticated', async () => {
      mockBackend.logout()

      await expect(mockBackend.joinGame())
        .rejects.toThrow('User not authenticated')
    })

    it('should leave game', async () => {
      await mockBackend.joinGame()

      await mockBackend.leaveGame()

      const players = await mockBackend.getActivePlayers()
      const currentPlayer = players.find(p => p.username === 'player1')
      expect(currentPlayer).toBeUndefined()
    })

    it('should update game score', async () => {
      await mockBackend.joinGame()
      await mockBackend.updateGameScore(50)

      const players = await mockBackend.getActivePlayers()
      const currentPlayer = players.find(p => p.username === 'player1')
      expect(currentPlayer?.score).toBe(50)
    })

    it('should generate mock players when list is empty', async () => {
      // Get initial players to trigger mock generation
      const players = await mockBackend.getActivePlayers()

      expect(players.length).toBeGreaterThan(0)

      // Check that we have the expected mock players
      const mockPlayerNames = ['SpeedySnake', 'WallCrawler', 'NoobMaster']
      mockPlayerNames.forEach(name => {
        expect(players.some(p => p.username === name)).toBe(true)
      })
    })

    it('should have mock players with game states', async () => {
      const players = await mockBackend.getActivePlayers()

      // Find players with current games
      const playersWithGames = players.filter(p => p.currentGame)
      expect(playersWithGames.length).toBeGreaterThan(0)

      playersWithGames.forEach(player => {
        expect(player.currentGame).toHaveProperty('snake')
        expect(player.currentGame).toHaveProperty('food')
        expect(player.currentGame).toHaveProperty('direction')
        expect(player.currentGame).toHaveProperty('gameMode')
        expect(player.currentGame).toHaveProperty('score')
        expect(player.currentGame).toHaveProperty('isGameOver')
        expect(player.currentGame).toHaveProperty('isPaused')
        expect(player.currentGame).toHaveProperty('boardSize')
      })
    })
  })

  describe('Simulated Gameplay', () => {
    beforeEach(async () => {
      await mockBackend.login('player1', 'password123')
      mockBackend.startSimulation()
    })

    afterEach(() => {
      // Clear any running intervals
      // Note: In a real test environment, you'd want to properly mock and clear timers
    })

    it('should have mock players with scores', async () => {
      const players = await mockBackend.getActivePlayers()

      // Mock players should have scores
      const mockPlayers = players.filter(p => ['SpeedySnake', 'WallCrawler', 'NoobMaster'].includes(p.username))
      expect(mockPlayers.length).toBeGreaterThan(0)

      mockPlayers.forEach(player => {
        expect(player.score).toBeGreaterThanOrEqual(0)
      })
    })
  })

  describe('Data Consistency', () => {
    it('should maintain user session across operations', async () => {
      await mockBackend.login('player1', 'password123')

      const initialUser = mockBackend.getCurrentUser()
      expect(initialUser?.username).toBe('player1')

      await mockBackend.submitScore(100, 'walls')

      const afterScoreUser = mockBackend.getCurrentUser()
      expect(afterScoreUser?.username).toBe('player1')

      await mockBackend.joinGame()

      const afterJoinUser = mockBackend.getCurrentUser()
      expect(afterJoinUser?.username).toBe('player1')
    })

    it('should handle concurrent operations', async () => {
      await mockBackend.login('player1', 'password123')

      // Run multiple operations concurrently
      const operations = [
        mockBackend.getLeaderboard(),
        mockBackend.getActivePlayers(),
        mockBackend.submitScore(150, 'pass-through'),
        mockBackend.joinGame()
      ]

      const results = await Promise.allSettled(operations)

      // All operations should succeed
      results.forEach(result => {
        expect(result.status).toBe('fulfilled')
      })
    })
  })
})