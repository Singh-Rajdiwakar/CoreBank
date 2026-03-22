import React from 'react'
import {
  BarChart as RechartsBarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const COLORS = ['#0ea5e9', '#06b6d4', '#f59e0b', '#10b981', '#ef4444']

export const BarChart = ({ data, xKey, yKeys = [], title }) => {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey={xKey} stroke="rgba(255,255,255,0.5)" />
          <YAxis stroke="rgba(255,255,255,0.5)" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(10, 15, 30, 0.9)',
              border: '1px solid rgba(14, 165, 233, 0.5)',
            }}
            labelStyle={{ color: '#fff' }}
          />
          <Legend />
          {yKeys.map((key, idx) => (
            <Bar key={key} dataKey={key} fill={COLORS[idx % COLORS.length]} />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}

export const LineChartComponent = ({ data, xKey, yKeys = [] }) => {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey={xKey} stroke="rgba(255,255,255,0.5)" />
          <YAxis stroke="rgba(255,255,255,0.5)" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(10, 15, 30, 0.9)',
              border: '1px solid rgba(14, 165, 233, 0.5)',
            }}
            labelStyle={{ color: '#fff' }}
          />
          <Legend />
          {yKeys.map((key, idx) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={COLORS[idx % COLORS.length]}
              dot={false}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export const PieChartComponent = ({ data, dataKey, nameKey }) => {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={80}
            fill="#0ea5e9"
            dataKey={dataKey}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(10, 15, 30, 0.9)',
              border: '1px solid rgba(14, 165, 233, 0.5)',
            }}
            labelStyle={{ color: '#fff' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
