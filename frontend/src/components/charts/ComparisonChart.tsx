import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PlayerComparison {
  playerId: number;
  playerName: string;
  team: string;
  position: string;
  avgPoints: number;
  avgRebounds: number;
  avgAssists: number;
  avgSteals: number;
  avgBlocks: number;
  avgTurnovers: number;
  avgFieldGoalPercentage: number;
  avgThreePointPercentage: number;
  totalGames: number;
  efficiency: number;
}

interface ComparisonChartProps {
  data: PlayerComparison[];
  metric: keyof PlayerComparison;
}

export const ComparisonChart: React.FC<ComparisonChartProps> = ({ data, metric }) => {
  const chartData = data.map(player => ({
    name: player.playerName,
    value: player[metric] as number,
    team: player.team
  }));

  const metricLabels: { [key: string]: string } = {
    avgPoints: 'Points per Game',
    avgRebounds: 'Rebounds per Game',
    avgAssists: 'Assists per Game',
    avgSteals: 'Steals per Game',
    avgBlocks: 'Blocks per Game',
    efficiency: 'Efficiency'
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-80">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        {metricLabels[metric] || metric}
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            formatter={(value) => [Number(value).toFixed(1), metricLabels[metric] || metric]}
            labelFormatter={(label) => label}
          />
          <Legend />
          <Bar 
            dataKey="value" 
            fill="#8884d8" 
            name={metricLabels[metric] || metric}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};