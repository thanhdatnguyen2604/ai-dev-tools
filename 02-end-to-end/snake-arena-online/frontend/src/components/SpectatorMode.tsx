import React from 'react';
import { useMultiplayer } from '../hooks/useMockBackend';
import { Player, GameState } from '../types/game';

const SpectatorMode: React.FC = () => {
  const [selectedPlayer, setSelectedPlayer] = React.useState<Player | null>(null);
  const { activePlayers, isLoading, error, refreshActivePlayers } = useMultiplayer();

  const renderMiniGame = (gameState: GameState) => {
    const renderMiniCell = (x: number, y: number) => {
      const isSnakeHead = gameState.snake[0].x === x && gameState.snake[0].y === y;
      const isSnakeBody = gameState.snake.slice(1).some(segment => segment.x === x && segment.y === y);
      const isFood = gameState.food.x === x && gameState.food.y === y;

      let cellClass = 'w-6 h-6 border-t border-l border-gray-700 flex-shrink-0 ';
      if (isSnakeHead) {
        cellClass += 'bg-green-500';
      } else if (isSnakeBody) {
        cellClass += 'bg-green-400';
      } else if (isFood) {
        cellClass += 'bg-red-400';
      } else {
        cellClass += 'bg-gray-800';
      }

      return <div key={`${x}-${y}`} className={cellClass} />;
    };

    const renderMiniBoard = () => {
      const cells = [];
      for (let y = 0; y < gameState.boardSize.height; y++) {
        for (let x = 0; x < gameState.boardSize.width; x++) {
          cells.push(renderMiniCell(x, y));
        }
      }
      return cells;
    };

    return (
      <div
        className="grid gap-0 border-2 border-gray-600 rounded bg-gray-900 p-2"
        style={{
          gridTemplateColumns: `repeat(${gameState.boardSize.width}, minmax(0, 1fr))`,
          width: '480px',
          height: '480px'
        }}
      >
        {renderMiniBoard()}
      </div>
    );
  };

  const getStatusColor = (player: Player) => {
    if (!player.isPlaying) return 'text-gray-400';
    if (player.score > 50) return 'text-green-400';
    if (player.score > 20) return 'text-yellow-400';
    return 'text-blue-400';
  };

  const getStatusIcon = (player: Player) => {
    if (!player.isPlaying) return '💤';
    if (player.score > 50) return '🔥';
    if (player.score > 20) return '⚡';
    return '🎮';
  };

  const getModeBadge = (mode: string) => {
    const colors = {
      walls: 'bg-blue-900 text-blue-300',
      'pass-through': 'bg-purple-900 text-purple-300',
    };
    return colors[mode as keyof typeof colors] || 'bg-gray-800 text-gray-400';
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">⚠️ Error loading players</div>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={refreshActivePlayers}
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
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">👁️ Spectator Mode</h2>
          <p className="text-gray-400">Watch other players compete in real-time</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Players list */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-lg shadow-2xl border border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 text-white">
                <h3 className="text-xl font-bold">Active Players</h3>
                <p className="text-purple-100 text-sm">
                  {activePlayers.filter(p => p.isPlaying).length} playing now
                </p>
              </div>

              <div className="p-4">
                <div className="flex justify-end mb-4">
                  <button
                    onClick={refreshActivePlayers}
                    disabled={isLoading}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded text-sm flex items-center space-x-1"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        <span>Refresh</span>
                      </>
                    ) : (
                      <>
                        <span>🔄</span>
                        <span>Refresh</span>
                      </>
                    )}
                  </button>
                </div>

                {isLoading && activePlayers.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-3"></div>
                    <p className="text-gray-400">Loading players...</p>
                  </div>
                ) : activePlayers.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">😴</div>
                    <p className="text-gray-400">No active players</p>
                    <p className="text-gray-500 text-sm">Check back later!</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {activePlayers.map((player) => (
                      <button
                        key={player.id}
                        onClick={() => setSelectedPlayer(player)}
                        className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                          selectedPlayer?.id === player.id
                            ? 'bg-purple-800 border border-purple-500'
                            : 'hover:bg-gray-800 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getStatusIcon(player)}</span>
                            <div>
                              <div className="font-semibold text-white">
                                {player.username}
                              </div>
                              <div className="text-sm text-gray-400">
                                {player.isPlaying ? 'Playing' : 'Idle'}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-yellow-400">
                              {player.score}
                            </div>
                            {player.currentGame && (
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getModeBadge(
                                  player.currentGame.gameMode
                                )}`}
                              >
                                {player.currentGame.gameMode}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Game view */}
          <div className="lg:col-span-2">
            {selectedPlayer && selectedPlayer.isPlaying ? (
              <div className="bg-gray-900 rounded-lg shadow-2xl border border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold">
                        {selectedPlayer.username}'s Game
                      </h3>
                      <p className="text-green-100 text-sm">
                        Mode: {selectedPlayer.currentGame?.gameMode} • Score: {selectedPlayer.score}
                      </p>
                    </div>
                    <div className="text-2xl">
                      {getStatusIcon(selectedPlayer)}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-center mb-6">
                    {selectedPlayer.currentGame ? (
                      <div>
                        {renderMiniGame(selectedPlayer.currentGame)}
                      </div>
                    ) : (
                      <div className="text-gray-400">Game data not available</div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-800 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-400">
                        {selectedPlayer.score}
                      </div>
                      <div className="text-sm text-gray-400">Current Score</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-400">
                        {selectedPlayer.currentGame?.snake.length || 0}
                      </div>
                      <div className="text-sm text-gray-400">Snake Length</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 text-center">
                      <div className="text-lg font-bold text-green-400">
                        {selectedPlayer.currentGame?.gameMode}
                      </div>
                      <div className="text-sm text-gray-400">Game Mode</div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">How Spectator Mode Works</h4>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• Watch real-time gameplay from other players</li>
                      <li>• Learn strategies from top performers</li>
                      <li>• See different game modes in action</li>
                      <li>• Click on any player to watch their game</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-900 rounded-lg shadow-2xl border border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-600 to-gray-700 p-4 text-white">
                  <h3 className="text-xl font-bold">Select a Player</h3>
                  <p className="text-gray-200 text-sm">Choose an active player to watch</p>
                </div>

                <div className="p-8 text-center">
                  <div className="text-6xl mb-4">🎮</div>
                  <p className="text-gray-400 text-lg">
                    {selectedPlayer ? 'Player is not currently playing' : 'Select a player from the list to start watching'}
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Look for players with the 🎮, ⚡, or 🔥 icons
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpectatorMode;