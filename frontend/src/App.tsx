/**
 * Main App Component
 * Root component of the Courtside Stats application
 * @module App
 */

import React from 'react';
import PlayerList from './components/PlayerList';
import ConnectionDebug from './components/ConnectionDebug';

/**
 * @component App
 * @desc    Root component that renders the main application layout
 */
const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold">🏀 Courtside Stats</h1>
          <p className="text-blue-100 mt-2">
            Real-time NBA analytics and live game dashboard
          </p>
        </div>
      </header>

      <main>
        <ConnectionDebug />
        <PlayerList />
      </main>

      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>Courtside Stats &copy; 2024 - NBA Analytics Dashboard</p>
        </div>
      </footer>
    </div>
  );
};

export default App;