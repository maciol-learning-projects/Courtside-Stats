import React from 'react';
import { Link } from 'react-router-dom';
import PlayerList from '../components/PlayerList';
import ConnectionDebug from '../components/ConnectionDebug';
import { BarChart3, TrendingUp } from 'lucide-react';

/**
 * @component Home
 * @desc    Root component that renders the main application layout
 */
const Home: React.FC = () => {
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

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section with Navigation */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Welcome to Courtside Stats
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Explore advanced NBA analytics, player performance data, and interactive visualizations
          </p>
          
          {/* Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
            <Link 
              to="/visualizations" 
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 border-2 border-transparent hover:border-blue-500"
            >
              <div className="flex items-center justify-center mb-4">
                <BarChart3 className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Data Visualizations
              </h3>
              <p className="text-gray-600">
                Interactive charts and analytics for player performance, team stats, and comparisons
              </p>
              <div className="mt-4 text-blue-600 font-medium">
                Explore Visualizations →
              </div>
            </Link>

            <div className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200">
              <div className="flex items-center justify-center mb-4">
                <TrendingUp className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Live Game Dashboard
              </h3>
              <p className="text-gray-600">
                Real-time game updates and live scoring (Coming Soon)
              </p>
              <div className="mt-4 text-gray-400 font-medium">
                Coming Soon
              </div>
            </div>
          </div>
        </div>

        {/* Existing Components */}
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

export default Home;