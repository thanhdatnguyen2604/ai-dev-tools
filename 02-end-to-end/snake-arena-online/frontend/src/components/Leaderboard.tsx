import React, { useState } from 'react';
import { useLeaderboard } from '../hooks/useMockBackend';
import { LeaderboardEntry } from '../types/game';

const Leaderboard: React.FC = () => {
  const [selectedMode, setSelectedMode] = useState<'all' | 'walls' | 'pass-through'>('all');
  const { leaderboard, isLoading, error, refreshLeaderboard } = useLeaderboard(
    selectedMode === 'all' ? undefined : selectedMode
  );

  const modeButtons = [
    { value: 'all', label: 'All Modes', icon: '🎯' },
    { value: 'walls', label: 'Walls', icon: '🧱' },
    { value: 'pass-through', label: 'Pass-through', icon: '🌀' },
  ] as const;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'walls':
        return 'text-blue-400 bg-blue-900';
      case 'pass-through':
        return 'text-purple-400 bg-purple-900';
      default:
        return 'text-gray-400 bg-gray-800';
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">⚠️ Error loading leaderboard</div>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={refreshLeaderboard}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-gray-900 rounded-lg shadow-2xl border border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
            <h2 className="text-3xl font-bold mb-2">🏆 Leaderboard</h2>
            <p className="text-green-100">Top Snake Arena Players</p>
          </div>

          <div className="p-6">
            {/* Mode selection */}
            <div className="flex justify-center mb-6 space-x-2">
              {modeButtons.map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => setSelectedMode(mode.value)}
                  className={`px-4 py-2 rounded-md font-medium transition-all duration-200 flex items-center space-x-2 ${
                    selectedMode === mode.value
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <span>{mode.icon}</span>
                  <span>{mode.label}</span>
                </button>
              ))}
            </div>

            {/* Refresh button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={refreshLeaderboard}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-md flex items-center space-x-2 transition-colors"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Refreshing...</span>
                  </>
                ) : (
                  <>
                    <span>🔄</span>
                    <span>Refresh</span>
                  </>
                )}
              </button>
            </div>

            {/* Leaderboard content */}
            {isLoading && leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading leaderboard...</p>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎮</div>
                <p className="text-gray-400 text-lg">No scores yet!</p>
                <p className="text-gray-500">Be the first to play and set a high score.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-800 text-gray-300 font-semibold text-sm rounded-t-lg">
                  <div className="col-span-1 text-center">Rank</div>
                  <div className="col-span-4">Player</div>
                  <div className="col-span-2 text-center">Score</div>
                  <div className="col-span-2 text-center">Mode</div>
                  <div className="col-span-3 text-center">Date</div>
                </div>

                <div className="divide-y divide-gray-800">
                  {leaderboard.map((entry: LeaderboardEntry, index: number) => (
                    <div
                      key={`${entry.username}-${entry.date}-${index}`}
                      className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-800 transition-colors items-center"
                    >
                      <div className="col-span-1 text-center font-bold text-lg">
                        {getRankIcon(index + 1)}
                      </div>
                      <div className="col-span-4">
                        <div className="font-semibold text-white">
                          {entry.username}
                        </div>
                      </div>
                      <div className="col-span-2 text-center">
                        <div className="text-xl font-bold text-yellow-400">
                          {entry.score}
                        </div>
                      </div>
                      <div className="col-span-2 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getModeColor(
                            entry.gameMode
                          )}`}
                        >
                          {entry.gameMode}
                        </span>
                      </div>
                      <div className="col-span-3 text-center text-gray-400 text-sm">
                        {formatDate(entry.date)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats section */}
            {leaderboard.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-4">📊 Statistics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-800 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {leaderboard.length}
                    </div>
                    <div className="text-sm text-gray-400">Total Players</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400">
                      {leaderboard[0]?.score || 0}
                    </div>
                    <div className="text-sm text-gray-400">High Score</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {Math.round(
                        leaderboard.reduce((acc, entry) => acc + entry.score, 0) /
                        leaderboard.length
                      )}
                    </div>
                    <div className="text-sm text-gray-400">Average Score</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;