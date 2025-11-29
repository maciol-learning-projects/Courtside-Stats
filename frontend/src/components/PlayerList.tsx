/**
 * Player List Component
 * Displays a list of NBA players with their basic information
 * @module components/PlayerList
 */

import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';

/**
 * @component PlayerList
 * @desc    Displays a list of players with filtering options
 */
const PlayerList: React.FC = () => {
  const { players, loading, error, fetchPlayers } = useStore();

  useEffect(() => {
    // Fetch players when component mounts
    fetchPlayers();
  }, [fetchPlayers]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">Loading players...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">NBA Players</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {players.map((player) => (
          <div
            key={player._id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">
              {player.firstName} {player.lastName}
            </h2>
            
            <div className="text-gray-600 mb-2">
              <span className="font-medium">Position:</span> {player.position}
            </div>
            
            <div className="text-gray-600 mb-4">
              <span className="font-medium">Team:</span> {player.team}
            </div>

            <div className="border-t pt-3">
              <h3 className="font-medium mb-2">Season Stats:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Points: {player.stats.points}</div>
                <div>Rebounds: {player.stats.rebounds}</div>
                <div>Assists: {player.stats.assists}</div>
                <div>Steals: {player.stats.steals}</div>
                <div>Blocks: {player.stats.blocks}</div>
                <div>Games: {player.stats.gamesPlayed}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {players.length === 0 && !loading && (
        <div className="text-center text-gray-500 mt-8">
          No players found. Make sure your backend is running and has data.
        </div>
      )}
    </div>
  );
};

export default PlayerList;