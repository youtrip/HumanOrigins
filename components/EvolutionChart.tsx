import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot
} from 'recharts';
import { TimelinePoint } from '../types';

interface EvolutionChartProps {
  data: TimelinePoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-space-800 border border-space-700 p-4 rounded shadow-xl max-w-xs">
        <p className="text-accent-400 font-bold text-sm">{data.yearLabel}</p>
        <p className="text-white font-semibold mb-1">{data.event}</p>
        <p className="text-gray-400 text-xs">{data.description}</p>
        <p className="text-accent-500 text-xs mt-2 font-mono">Dominance Index: {data.impactLevel}</p>
      </div>
    );
  }
  return null;
};

export const EvolutionChart: React.FC<EvolutionChartProps> = ({ data }) => {
  return (
    <div className="w-full h-[400px] animate-fade-in">
      <h3 className="text-xl font-light text-gray-300 mb-4 flex items-center gap-2">
        <span className="w-2 h-6 bg-accent-500 block rounded-sm"></span>
        统治力指数演变 (Dominance Curve)
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 0,
            bottom: 10,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis 
            dataKey="yearLabel" 
            stroke="#94a3b8" 
            tick={{fill: '#94a3b8', fontSize: 12}}
            interval="preserveStartEnd"
          />
          <YAxis 
            stroke="#94a3b8" 
            tick={{fill: '#94a3b8', fontSize: 12}}
            label={{ value: 'Dominance Impact', angle: -90, position: 'insideLeft', fill: '#64748b' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="impactLevel"
            stroke="#fbbf24"
            strokeWidth={3}
            dot={{ r: 4, fill: '#fbbf24', strokeWidth: 0 }}
            activeDot={{ r: 8, fill: '#f59e0b' }}
            animationDuration={2000}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
