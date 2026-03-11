import { useState, useEffect } from 'react';
import axios from 'axios';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/api/attempts/analytics');
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Total Attempts', value: analytics?.totalAttempts || 0, color: 'brand' },
    { label: 'Average Score', value: `${analytics?.averageScore || 0}%`, color: 'accent' },
    { label: 'Weak Areas', value: analytics?.weakAreas?.length || 0, color: 'rose' },
  ];

  const improvementData = analytics?.improvementTrend?.length > 0 ? {
    labels: analytics.improvementTrend.map(t => t.date),
    datasets: [{
      label: 'Average Score',
      data: analytics.improvementTrend.map(t => t.averageScore),
      borderColor: '#0ea5e9',
      backgroundColor: 'rgba(14, 165, 233, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#0ea5e9',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
    }],
  } : null;

  const categoryData = analytics?.categoryScores?.length > 0 ? {
    labels: analytics.categoryScores.map(c => c.category),
    datasets: [{
      label: 'Average Score',
      data: analytics.categoryScores.map(c => c.averageScore),
      backgroundColor: ['#0ea5e9', '#10b981', '#8b5cf6'],
      borderRadius: 8,
    }],
  } : null;

  const difficultyData = analytics?.difficultyScores?.length > 0 ? {
    labels: analytics.difficultyScores.map(d => d.difficulty),
    datasets: [{
      data: analytics.difficultyScores.map(d => d.count),
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
      borderWidth: 0,
    }],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: { 
      y: { beginAtZero: true, max: 100, grid: { color: 'rgba(0, 0, 0, 0.05)' } },
      x: { grid: { display: false } },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true } },
    },
    cutout: '65%',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-dark-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-dark-900">Performance Analytics</h1>
        <p className="text-dark-500 mt-1">Track your progress and identify areas for improvement</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className={`card p-6 border-l-4 ${
            stat.color === 'brand' ? 'border-l-brand-500' :
            stat.color === 'accent' ? 'border-l-accent-500' :
            'border-l-rose-500'
          }`}>
            <p className="text-sm font-medium text-dark-500">{stat.label}</p>
            <p className={`text-3xl font-bold mt-1 ${
              stat.color === 'brand' ? 'text-brand-600' :
              stat.color === 'accent' ? 'text-accent-600' :
              'text-rose-600'
            }`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trend */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-dark-800 mb-6">Performance Trend</h2>
          {improvementData ? (
            <div className="h-72">
              <Line data={improvementData} options={chartOptions} />
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-dark-400">
              <p>No data available yet</p>
            </div>
          )}
        </div>

        {/* Category Performance */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-dark-800 mb-6">Performance by Category</h2>
          {categoryData ? (
            <div className="h-72">
              <Bar data={categoryData} options={chartOptions} />
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-dark-400">
              <p>No data available yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attempts by Difficulty */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-dark-800 mb-6">Attempts by Difficulty</h2>
          {difficultyData ? (
            <div className="h-64">
              <Doughnut data={difficultyData} options={doughnutOptions} />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-dark-400">
              <p>No data available</p>
            </div>
          )}
        </div>

        {/* Weak Areas */}
        <div className="card p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold text-dark-800 mb-6">Areas Needing Improvement</h2>
          {analytics?.weakAreas?.length > 0 ? (
            <div className="space-y-4">
              {analytics.weakAreas.map((area, idx) => (
                <div key={idx} className="p-4 bg-rose-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-rose-800">{area.category}</span>
                    <span className="text-rose-600 font-bold">{area.score}%</span>
                  </div>
                  <div className="h-2 bg-rose-200 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${area.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-dark-400">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>Great job! No weak areas identified yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Category Breakdown Table */}
      {analytics?.categoryScores?.length > 0 && (
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-dark-100">
            <h2 className="text-xl font-semibold text-dark-800">Category Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-50">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-medium text-dark-600">Category</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-dark-600">Average Score</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-dark-600">Attempts</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-dark-600">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100">
                {analytics.categoryScores.map((cat, idx) => (
                  <tr key={idx} className="hover:bg-dark-50 transition-colors">
                    <td className="py-4 px-6 font-medium text-dark-800">{cat.category}</td>
                    <td className="py-4 px-6">
                      <span className={`font-bold ${
                        cat.averageScore >= 80 ? 'text-emerald-600' :
                        cat.averageScore >= 60 ? 'text-amber-600' :
                        'text-rose-600'
                      }`}>{cat.averageScore}%</span>
                    </td>
                    <td className="py-4 px-6 text-dark-600">{cat.count}</td>
                    <td className="py-4 px-6">
                      <div className="w-32 h-2 bg-dark-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            cat.averageScore >= 80 ? 'bg-emerald-500' :
                            cat.averageScore >= 60 ? 'bg-amber-500' :
                            'bg-rose-500'
                          }`}
                          style={{ width: `${cat.averageScore}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-dark-100">
          <h2 className="text-xl font-semibold text-dark-800">Recent Activity</h2>
        </div>
        {analytics?.recentAttempts?.length > 0 ? (
          <div className="divide-y divide-dark-100">
            {analytics.recentAttempts.map((attempt) => (
              <div key={attempt._id} className="p-4 hover:bg-dark-50 transition-colors flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-dark-800 truncate">{attempt.question?.title}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs px-2 py-0.5 bg-brand-100 text-brand-700 rounded-full">
                      {attempt.category}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-dark-100 text-dark-600 rounded-full">
                      {attempt.difficulty}
                    </span>
                    <span className="text-xs text-dark-400">
                      {new Date(attempt.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className={`ml-4 px-4 py-2 rounded-xl font-bold ${
                  attempt.score >= 80 ? 'bg-emerald-100 text-emerald-700' :
                  attempt.score >= 60 ? 'bg-amber-100 text-amber-700' :
                  'bg-rose-100 text-rose-700'
                }`}>
                  {attempt.score}%
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-dark-400">
            <p>No recent activity to show</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
