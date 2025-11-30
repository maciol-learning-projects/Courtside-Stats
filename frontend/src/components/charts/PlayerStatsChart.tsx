import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface GameData {
  date: string;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fieldGoalPercentage: number;
  threePointPercentage: number;
  efficiency: number;
  opponent: string;
}

interface PlayerStatsChartProps {
  data: GameData[];
  playerName: string;
}

export const PlayerStatsChart: React.FC<PlayerStatsChartProps> = ({ data, playerName }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-96">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        {playerName} - Game Log
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem'
            }}
            formatter={(value) => [value, '']}
            labelFormatter={(label, payload) => {
              if (payload && payload[0]) {
                return `Game vs ${payload[0].payload.opponent}`;
              }
              return `Game on ${label}`;
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="points" 
            stroke="#3b82f6" 
            strokeWidth={2}
            name="Points"
            dot={{ r: 3 }}
          />
          <Line 
            type="monotone" 
            dataKey="rebounds" 
            stroke="#10b981" 
            strokeWidth={2}
            name="Rebounds"
            dot={{ r: 3 }}
          />
          <Line 
            type="monotone" 
            dataKey="assists" 
            stroke="#f59e0b" 
            strokeWidth={2}
            name="Assists"
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};