import { useState, useEffect, useCallback } from 'react';
import { mockBackend, AuthResponse, User } from '../services/mockBackend';
import { Player, LeaderboardEntry } from '../types/game';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const currentUser = mockBackend.getCurrentUser();
    setUser(currentUser);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await mockBackend.login(username, password);
      setUser(response.user);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (username: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await mockBackend.signup(username, email, password);
      setUser(response.user);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    mockBackend.logout();
    setUser(null);
    setError(null);
  }, []);

  return {
    user,
    isLoading,
    error,
    isAuthenticated: mockBackend.isAuthenticated(),
    login,
    signup,
    logout,
  };
};

export const useLeaderboard = (gameMode?: 'walls' | 'pass-through') => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await mockBackend.getLeaderboard(gameMode);
      setLeaderboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard');
    } finally {
      setIsLoading(false);
    }
  }, [gameMode]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const submitScore = useCallback(async (score: number, mode: 'walls' | 'pass-through') => {
    setIsLoading(true);
    setError(null);

    try {
      await mockBackend.submitScore(score, mode);
      await fetchLeaderboard(); // Refresh leaderboard after submitting score
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit score');
    } finally {
      setIsLoading(false);
    }
  }, [fetchLeaderboard]);

  return {
    leaderboard,
    isLoading,
    error,
    refreshLeaderboard: fetchLeaderboard,
    submitScore,
  };
};

export const useMultiplayer = () => {
  const [activePlayers, setActivePlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivePlayers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const players = await mockBackend.getActivePlayers();
      setActivePlayers(players);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch active players');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivePlayers();

    // Set up polling for real-time updates
    const interval = setInterval(fetchActivePlayers, 5000);
    return () => clearInterval(interval);
  }, [fetchActivePlayers]);

  const joinGame = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const player = await mockBackend.joinGame();
      await fetchActivePlayers(); // Refresh the active players list
      return player;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join game');
    } finally {
      setIsLoading(false);
    }
  }, [fetchActivePlayers]);

  const leaveGame = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await mockBackend.leaveGame();
      await fetchActivePlayers(); // Refresh the active players list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to leave game');
    } finally {
      setIsLoading(false);
    }
  }, [fetchActivePlayers]);

  const updateGameScore = useCallback(async (score: number) => {
    setIsLoading(true);
    setError(null);

    try {
      await mockBackend.updateGameScore(score);
      await fetchActivePlayers(); // Refresh the active players list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update score');
    } finally {
      setIsLoading(false);
    }
  }, [fetchActivePlayers]);

  useEffect(() => {
    // Start the simulation for mock players
    mockBackend.startSimulation();
  }, []);

  return {
    activePlayers,
    isLoading,
    error,
    refreshActivePlayers: fetchActivePlayers,
    joinGame,
    leaveGame,
    updateGameScore,
  };
};