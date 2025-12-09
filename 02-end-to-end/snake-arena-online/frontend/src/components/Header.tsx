import React from 'react';
import { useAuth } from '../hooks/useMockBackend';

interface HeaderProps {
  currentView: 'game' | 'leaderboard' | 'spectate';
  onViewChange: (view: 'game' | 'leaderboard' | 'spectate') => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'game', label: 'Play Game', icon: '🎮' },
    { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
    { id: 'spectate', label: 'Spectate', icon: '👁️' },
  ] as const;

  return (
    <header className="bg-gray-900 border-b border-gray-700 text-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="text-2xl font-bold text-green-400">
              🐍 Snake Arena
            </h1>

            <nav className="flex space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`px-4 py-2 rounded-md transition-colors duration-200 flex items-center space-x-2 ${
                    currentView === item.id
                      ? 'bg-gray-800 text-green-400 border-b-2 border-green-400'
                      : 'hover:bg-gray-800 text-gray-300 hover:text-white'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm text-gray-400">Welcome back,</p>
                  <p className="font-semibold text-green-400">{user.username}</p>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="text-gray-400">
                <p className="text-sm">Not logged in</p>
                <p className="text-xs text-gray-500">Some features may be limited</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;