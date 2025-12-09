import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Auth from '../components/Auth'
import SnakeGame from '../components/SnakeGame'
import Header from '../components/Header'
import Leaderboard from '../components/Leaderboard'
import SpectatorMode from '../components/SpectatorMode'
import { useAuth, useMultiplayer, useLeaderboard } from '../hooks/useMockBackend'

// Mock hooks
vi.mock('../hooks/useMockBackend')

const mockUseAuth = vi.fn()
const mockUseMultiplayer = vi.fn()
const mockUseLeaderboard = vi.fn()

vi.mock('../hooks/useMockBackend', () => ({
  useAuth: mockUseAuth,
  useMultiplayer: mockUseMultiplayer,
  useLeaderboard: mockUseLeaderboard,
}))

describe('Auth Component', () => {
  const mockOnAuthSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
    })
  })

  it('should render login form by default', () => {
    render(<Auth onAuthSuccess={mockOnAuthSuccess} />)

    expect(screen.getAllByText('Welcome Back!')).toHaveLength(1)
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('should render signup form when toggle is clicked', async () => {
    const user = userEvent.setup()
    render(<Auth onAuthSuccess={mockOnAuthSuccess} />)

    await user.click(screen.getByRole('button', { name: /sign up/i }))

    expect(screen.getAllByText('Create Account')).toHaveLength(1)
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('should call login with correct credentials', async () => {
    const mockLogin = vi.fn().mockResolvedValue({ user: { username: 'test' }, token: 'abc123' })
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,
      login: mockLogin,
      signup: vi.fn(),
      logout: vi.fn(),
    })

    const user = userEvent.setup()
    render(<Auth onAuthSuccess={mockOnAuthSuccess} />)

    await user.type(screen.getByLabelText(/username/i), 'testuser')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123')
  })

  it('should display demo credentials', () => {
    render(<Auth onAuthSuccess={mockOnAuthSuccess} />)

    expect(screen.getByText('Demo Credentials:')).toBeInTheDocument()
    expect(screen.getByText(/player1.*password123/)).toBeInTheDocument()
    expect(screen.getByText(/snakeMaster.*password123/)).toBeInTheDocument()
  })
})

describe('Header Component', () => {
  const mockOnViewChange = vi.fn()

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', username: 'testuser', email: 'test@example.com' },
      isLoading: false,
      error: null,
      isAuthenticated: true,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
    })
  })

  it('should render navigation items', () => {
    render(<Header currentView="game" onViewChange={mockOnViewChange} />)

    expect(screen.getByText('🎮 Play Game')).toBeInTheDocument()
    expect(screen.getByText('🏆 Leaderboard')).toBeInTheDocument()
    expect(screen.getByText('👁️ Spectate')).toBeInTheDocument()
  })

  it('should show user info when authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', username: 'testuser', email: 'test@example.com' },
      isLoading: false,
      error: null,
      isAuthenticated: true,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
    })

    render(<Header currentView="game" onViewChange={mockOnViewChange} />)

    expect(screen.getAllByText('Welcome back, testuser')).toHaveLength(1)
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
  })

  it('should call onViewChange when navigation item is clicked', async () => {
    const user = userEvent.setup()
    render(<Header currentView="game" onViewChange={mockOnViewChange} />)

    await user.click(screen.getByText('🏆 Leaderboard'))
    expect(mockOnViewChange).toHaveBeenCalledWith('leaderboard')
  })
})

describe('SpectatorMode Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseMultiplayer.mockReturnValue({
      activePlayers: [],
      isLoading: false,
      error: null,
      refreshActivePlayers: vi.fn(),
      joinGame: vi.fn(),
      leaveGame: vi.fn(),
      updateGameScore: vi.fn(),
    })
  })

  it('should render spectator mode title', () => {
    render(<SpectatorMode />)

    expect(screen.getByText('👁️ Spectator Mode')).toBeInTheDocument()
    expect(screen.getByText('Watch other players compete in real-time')).toBeInTheDocument()
  })

  it('should show no players message when list is empty', () => {
    mockUseMultiplayer.mockReturnValue({
      activePlayers: [],
      isLoading: false,
      error: null,
      refreshActivePlayers: vi.fn(),
      joinGame: vi.fn(),
      leaveGame: vi.fn(),
      updateGameScore: vi.fn(),
    })

    render(<SpectatorMode />)

    expect(screen.getByText('No active players')).toBeInTheDocument()
    expect(screen.getByText('Check back later!')).toBeInTheDocument()
  })

  it('should display active players list', () => {
    const mockPlayers = [
      {
        id: '1',
        username: 'player1',
        score: 50,
        isPlaying: true,
        currentGame: {
          snake: [{ x: 10, y: 10 }],
          food: { x: 15, y: 15 },
          direction: 'RIGHT',
          gameMode: 'walls',
          score: 50,
          isGameOver: false,
          isPaused: false,
          boardSize: { width: 20, height: 20 },
        },
      },
    ]

    mockUseMultiplayer.mockReturnValue({
      activePlayers: mockPlayers,
      isLoading: false,
      error: null,
      refreshActivePlayers: vi.fn(),
      joinGame: vi.fn(),
      leaveGame: vi.fn(),
      updateGameScore: vi.fn(),
    })

    render(<SpectatorMode />)

    expect(screen.getByText('Active Players')).toBeInTheDocument()
    expect(screen.getByText('player1')).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument()
  })
})

describe('SnakeGame Component', () => {
  it('should render game board', () => {
    // Mock the useSnakeGame hook
    vi.doMock('../hooks/useSnakeGame', () => ({
      useSnakeGame: () => ({
        gameState: {
          snake: [{ x: 10, y: 10 }],
          food: { x: 15, y: 15 },
          direction: 'RIGHT',
          gameMode: 'walls',
          score: 0,
          isGameOver: false,
          isPaused: false,
          boardSize: { width: 20, height: 20 },
        },
        startGame: vi.fn(),
        pauseGame: vi.fn(),
        resetGame: vi.fn(),
        setDirection: vi.fn(),
        setGameMode: vi.fn(),
      }),
    }))

    render(<SnakeGame gameMode="walls" />)

    expect(screen.getByText('Snake Arena')).toBeInTheDocument()
    expect(screen.getByText('Mode:')).toBeInTheDocument()
    expect(screen.getByText('walls')).toBeInTheDocument()
    expect(screen.getByText('Score:')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
  })
})

describe('Leaderboard Component', () => {
  const mockUseLeaderboard = vi.mocked(useLeaderboard)

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseLeaderboard.mockReturnValue({
      leaderboard: [],
      isLoading: false,
      error: null,
      refreshLeaderboard: vi.fn(),
      submitScore: vi.fn(),
    })
  })

  it('should render leaderboard title', () => {
    render(<Leaderboard />)

    expect(screen.getByText('🏆 Leaderboard')).toBeInTheDocument()
    expect(screen.getByText('Top Snake Arena Players')).toBeInTheDocument()
  })

  it('should display leaderboard entries', () => {
    const mockLeaderboard = [
      {
        username: 'player1',
        score: 100,
        date: '2025-11-30',
        gameMode: 'walls',
      },
      {
        username: 'player2',
        score: 80,
        date: '2025-11-29',
        gameMode: 'pass-through',
      },
    ]

    mockUseLeaderboard.mockReturnValue({
      leaderboard: mockLeaderboard,
      isLoading: false,
      error: null,
      refreshLeaderboard: vi.fn(),
      submitScore: vi.fn(),
    })

    render(<Leaderboard />)

    expect(screen.getByText('player1')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('player2')).toBeInTheDocument()
    expect(screen.getByText('80')).toBeInTheDocument()
  })
})