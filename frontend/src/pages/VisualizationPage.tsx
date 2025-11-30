import React, { useState, useEffect } from 'react';
import { PlayerStatsChart } from '../components/charts/PlayerStatsChart';
import { ComparisonChart } from '../components/charts/ComparisonChart';
import { BarChart3, Target, Users, TrendingUp, Search } from 'lucide-react';
import { nbaAPI } from '../utils/api';

interface PlayerData {
  success: boolean;
  data: any[];
  player: { name: string };
  summary: {
    totalGames: number;
    avgPoints: number;
    avgRebounds: number;
    avgAssists: number;
  };
}

interface ComparisonData {
  success: boolean;
  data: any[];
  comparedPlayers: number;
}

const VisualizationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'player' | 'comparison' | 'teams'>('player');
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [teamsData, setTeamsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [playerId, setPlayerId] = useState('20000571'); // LeBron James
  const [comparisonIds, setComparisonIds] = useState('20000571,20000507'); // LeBron & Curry
  const [selectedMetric, setSelectedMetric] = useState('avgPoints');

  // Fetch player data
  const fetchPlayerData = async (id: string) => {
    setLoading(true);
    try {
      const data = await nbaAPI.getPlayerVisualization(id);
      setPlayerData(data);
    } catch (error) {
      console.error('Error fetching player data:', error);
      alert('Failed to fetch player data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch comparison data
  const fetchComparisonData = async (ids: string) => {
    setLoading(true);
    try {
      const data = await nbaAPI.comparePlayers(ids.split(','));
      setComparisonData(data);
    } catch (error) {
      console.error('Error fetching comparison data:', error);
      alert('Failed to fetch comparison data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch teams data
  const fetchTeamsData = async () => {
    setLoading(true);
    try {
      const data = await nbaAPI.getTeams();
      setTeamsData(data.data);
    } catch (error) {
      console.error('Error fetching teams data:', error);
      alert('Failed to fetch teams data');
    } finally {
      setLoading(false);
    }
  };

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === 'player') {
      fetchPlayerData(playerId);
    } else if (activeTab === 'comparison') {
      fetchComparisonData(comparisonIds);
    } else if (activeTab === 'teams') {
      fetchTeamsData();
    }
  }, [activeTab]);

  const statsCards = playerData ? [
    { icon: TrendingUp, label: 'Avg Points', value: playerData.summary.avgPoints.toFixed(1) },
    { icon: Target, label: 'Avg Rebounds', value: playerData.summary.avgRebounds.toFixed(1) },
    { icon: Users, label: 'Avg Assists', value: playerData.summary.avgAssists.toFixed(1) },
    { icon: BarChart3, label: 'Total Games', value: playerData.summary.totalGames.toString() },
  ] : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading visualization data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Courtside Stats Analytics
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Interactive NBA data visualizations and player performance analytics
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'player', label: 'Player Performance', icon: Users },
              { id: 'comparison', label: 'Player Comparison', icon: TrendingUp },
              { id: 'teams', label: 'Team Analytics', icon: BarChart3 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'player' && (
            <div className="space-y-6">
              {/* Player Search */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-4">
                  <Search className="h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={playerId}
                    onChange={(e) => setPlayerId(e.target.value)}
                    placeholder="Enter Player ID (e.g., 20000571 for LeBron)"
                    className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => fetchPlayerData(playerId)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Load Player
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Try: 20000571 (LeBron), 20000507 (Curry), 20000485 (Durant)
                </p>
              </div>

              {/* Stats Overview */}
              {playerData && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statsCards.map((card, index) => (
                      <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center">
                        <card.icon className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-gray-800">{card.label}</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Player Chart */}
                  <PlayerStatsChart 
                    data={playerData.data} 
                    playerName={playerData.player.name} 
                  />
                </>
              )}
            </div>
          )}

          {activeTab === 'comparison' && (
            <div className="space-y-6">
              {/* Comparison Controls */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <input
                    type="text"
                    value={comparisonIds}
                    onChange={(e) => setComparisonIds(e.target.value)}
                    placeholder="Player IDs (comma-separated)"
                    className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => fetchComparisonData(comparisonIds)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Compare Players
                  </button>
                </div>
                
                {/* Metric Selector */}
                <div className="flex space-x-4">
                  {['avgPoints', 'avgRebounds', 'avgAssists', 'avgSteals', 'efficiency'].map((metric) => (
                    <button
                      key={metric}
                      onClick={() => setSelectedMetric(metric)}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        selectedMetric === metric
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {metric.replace('avg', '').replace(/([A-Z])/g, ' $1').trim()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comparison Chart */}
              {comparisonData && comparisonData.data.length > 0 && (
                <ComparisonChart 
                  data={comparisonData.data} 
                  metric={selectedMetric as any} 
                />
              )}
            </div>
          )}

          {activeTab === 'teams' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">NBA Teams</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamsData.map((team) => (
                  <div key={team.id} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800">{team.name}</h4>
                    <p className="text-sm text-gray-600">{team.city}</p>
                    <p className="text-sm text-gray-500">
                      {team.conference} Conference • {team.division}
                    </p>
                    <div className="mt-2 text-xs text-gray-500">
                      Record: {team.wins}-{team.losses} ({team.winPercentage.toFixed(3)})
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisualizationPage;