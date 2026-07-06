import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import api from '../utils/api';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const CHART_DEFAULTS = {
  plugins: { legend: { labels: { color: '#9ca3af', font: { size: 11 } } } },
  scales: {
    x: { ticks: { color: '#6b7280' }, grid: { color: 'rgba(255,255,255,0.05)' } },
    y: { ticks: { color: '#6b7280' }, grid: { color: 'rgba(255,255,255,0.05)' } }
  }
};

const STATUS_CONFIG = {
  reported:    { label: 'Reported',    color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  verified:    { label: 'Verified',    color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  in_progress: { label: 'In Progress', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
  resolved:    { label: 'Resolved',    color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  rejected:    { label: 'Rejected',    color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
};

const ISSUE_COLORS = {
  pothole: '#f59e0b', garbage: '#10b981', water_leakage: '#3b82f6',
  broken_streetlight: '#f97316', other: '#8b5cf6'
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function StatCard({ icon, label, value, color, sub, delay }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay }} whileHover={{ y: -4 }}
      className="glass rounded-2xl p-5 card-hover">
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
          {icon}
        </div>
        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}
          className="text-xs px-2 py-0.5 rounded-full"
          style={{ background: `${color}20`, color }}>
          Live
        </motion.div>
      </div>
      <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
      <p className="text-gray-400 text-sm mt-0.5">{label}</p>
      {sub && <p className="text-xs mt-1" style={{ color }}>{sub}</p>}
    </motion.div>
  );
}

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [updating, setUpdating] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async () => {
    try {
      const [analyticsRes, complaintsRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get(`/complaints?page=${page}&limit=10${statusFilter !== 'all' ? `&status=${statusFilter}` : ''}${typeFilter !== 'all' ? `&issueType=${typeFilter}` : ''}`)
      ]);
      setAnalytics(analyticsRes.data);
      setComplaints(complaintsRes.data.complaints);
      setTotalPages(complaintsRes.data.pages);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, statusFilter, typeFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusUpdate = async (id, status) => {
    setUpdating(id);
    try {
      await api.put(`/complaints/${id}/status`, { status, note: `Status updated to ${status} by authority` });
      toast.success('Status updated!');
      fetchData();
    } catch {
      toast.error('Update failed');
    } finally {
      setUpdating(null);
    }
  };

  // Chart data
  const byTypeChart = analytics ? {
    labels: analytics.byType.map(t => t._id?.replace('_', ' ')),
    datasets: [{
      label: 'Complaints',
      data: analytics.byType.map(t => t.count),
      backgroundColor: analytics.byType.map(t => `${ISSUE_COLORS[t._id] || '#8b5cf6'}80`),
      borderColor: analytics.byType.map(t => ISSUE_COLORS[t._id] || '#8b5cf6'),
      borderWidth: 2, borderRadius: 8,
    }]
  } : null;

  const byStatusChart = analytics ? {
    labels: analytics.byStatus.map(s => STATUS_CONFIG[s._id]?.label || s._id),
    datasets: [{
      data: analytics.byStatus.map(s => s.count),
      backgroundColor: analytics.byStatus.map(s => `${STATUS_CONFIG[s._id]?.color || '#8b5cf6'}80`),
      borderColor: analytics.byStatus.map(s => STATUS_CONFIG[s._id]?.color || '#8b5cf6'),
      borderWidth: 2,
    }]
  } : null;

  const PRIORITY_COLORS = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' };
  
  const byPriorityChart = analytics && analytics.byPriority ? {
    labels: analytics.byPriority.map(p => p._id.toUpperCase()),
    datasets: [{
      label: 'Priority',
      data: analytics.byPriority.map(p => p.count),
      backgroundColor: analytics.byPriority.map(p => `${PRIORITY_COLORS[p._id] || '#8b5cf6'}80`),
      borderColor: analytics.byPriority.map(p => PRIORITY_COLORS[p._id] || '#8b5cf6'),
      borderWidth: 2,
    }]
  } : null;

  const monthlyChart = analytics ? {
    labels: analytics.monthly.map(m => MONTHS[(m._id.month - 1)]),
    datasets: [{
      label: 'Reports',
      data: analytics.monthly.map(m => m.count),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.1)',
      fill: true, tension: 0.4, pointBackgroundColor: '#3b82f6', pointRadius: 4,
    }]
  } : null;

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full" />
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Authority Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Manage and resolve civic complaints</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/10 text-gray-400 hover:text-white text-sm transition-all">
          🔄 Refresh
        </motion.button>
      </motion.div>

      {/* Stat Cards */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="📊" label="Total Complaints" value={analytics.total} color="#3b82f6" delay={0.1} />
          <StatCard icon="✅" label="Resolved" value={analytics.resolved} color="#10b981"
            sub={`${analytics.total ? Math.round((analytics.resolved / analytics.total) * 100) : 0}% resolution rate`} delay={0.2} />
          <StatCard icon="⏳" label="Pending" value={analytics.pending} color="#f59e0b" delay={0.3} />
          <StatCard icon="🚨" label="High Priority" value={analytics.highPriority} color="#ef4444" delay={0.4} />
        </div>
      )}

      {/* Disasters Section */}
      {analytics && analytics.disasters && (
        <>
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="pt-4 border-t border-white/5">
                <h2 className="text-xl font-bold text-white mb-4">Emergency & Disaster Overview</h2>
            </motion.div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard icon="⚠️" label="Total Alerts" value={analytics.disasters.total} color="#8b5cf6" delay={0.1} />
                <StatCard icon="🚨" label="Critical" value={analytics.disasters.byPriority?.find(p => p._id === 'critical')?.count || 0} color="#ef4444" delay={0.2} />
                <StatCard icon="🔥" label="High" value={analytics.disasters.byPriority?.find(p => p._id === 'high')?.count || 0} color="#f97316" delay={0.3} />
                <StatCard icon="⚡" label="Medium" value={analytics.disasters.byPriority?.find(p => p._id === 'medium')?.count || 0} color="#eab308" delay={0.4} />
                <StatCard icon="🚧" label="Low" value={analytics.disasters.byPriority?.find(p => p._id === 'low')?.count || 0} color="#10b981" delay={0.5} />
            </div>
        </>
      )}

      {/* Charts */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Bar chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-5 lg:col-span-2">
            <h3 className="text-white font-semibold mb-4">Complaints by Category</h3>
            {byTypeChart && (
              <Bar data={byTypeChart} options={{
                ...CHART_DEFAULTS, responsive: true, maintainAspectRatio: true,
                plugins: { ...CHART_DEFAULTS.plugins, legend: { display: false } }
              }} height={100} />
            )}
          </motion.div>

          {/* Doughnut */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-5 lg:col-span-1">
            <h3 className="text-white font-semibold mb-4">Status</h3>
            {byStatusChart && (
              <Doughnut data={byStatusChart} options={{
                responsive: true, maintainAspectRatio: true,
                plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af', font: { size: 10 }, padding: 8 } } },
                cutout: '65%'
              }} />
            )}
          </motion.div>

          {/* Priority Distribution Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            className="glass rounded-2xl p-5 lg:col-span-1">
            <h3 className="text-white font-semibold mb-4">Priority</h3>
            {byPriorityChart && (
              <Doughnut data={byPriorityChart} options={{
                responsive: true, maintainAspectRatio: true,
                plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af', font: { size: 10 }, padding: 8 } } },
                cutout: '65%'
              }} />
            )}
          </motion.div>

          {/* Line chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="glass rounded-2xl p-5 lg:col-span-4">
            <h3 className="text-white font-semibold mb-4">Monthly Complaint Trends</h3>
            {monthlyChart && (
              <Line data={monthlyChart} options={{
                ...CHART_DEFAULTS, responsive: true, maintainAspectRatio: true,
                plugins: { ...CHART_DEFAULTS.plugins, legend: { display: false } }
              }} height={60} />
            )}
          </motion.div>
        </div>
      )}

      {/* Complaints Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="glass rounded-2xl overflow-hidden">
        {/* Table header + filters */}
        <div className="p-5 border-b border-white/5 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-white font-semibold">All Complaints</h3>
          <div className="flex gap-2 flex-wrap">
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="glow-input px-3 py-1.5 rounded-lg text-sm text-white">
              <option value="all" style={{ background: '#1a1a35' }}>All Status</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <option key={k} value={k} style={{ background: '#1a1a35' }}>{v.label}</option>
              ))}
            </select>
            <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
              className="glow-input px-3 py-1.5 rounded-lg text-sm text-white">
              <option value="all" style={{ background: '#1a1a35' }}>All Types</option>
              {Object.keys(ISSUE_COLORS).map(k => (
                <option key={k} value={k} style={{ background: '#1a1a35' }}>{k.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['Issue', 'Reporter', 'Location', 'Status', 'Priority', 'Upvotes', 'Date', 'Action'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {complaints.map((c, i) => {
                const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.reported;
                return (
                  <motion.tr key={c._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{({ pothole: '🕳️', garbage: '🗑️', water_leakage: '💧', broken_streetlight: '💡', other: '⚠️' })[c.issueType]}</span>
                        <div>
                          <p className="text-white capitalize font-medium">{c.issueType?.replace('_', ' ')}</p>
                          <p className="text-gray-500 text-xs truncate max-w-32">{c.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{c.user?.name || 'Unknown'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {c.address || `${c.latitude?.toFixed(3)}, ${c.longitude?.toFixed(3)}`}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-lg text-xs font-medium"
                        style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}40` }}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium
                        ${c.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                          c.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                          c.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'}`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">👍 {c.upvotes}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <select
                        value={c.status}
                        onChange={e => handleStatusUpdate(c._id, e.target.value)}
                        disabled={updating === c._id}
                        className="glow-input px-2 py-1 rounded-lg text-xs text-white disabled:opacity-50">
                        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                          <option key={k} value={k} style={{ background: '#1a1a35' }}>{v.label}</option>
                        ))}
                      </select>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-white/5 flex items-center justify-between">
            <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 rounded-lg glass border border-white/10 text-gray-400 text-xs disabled:opacity-40 hover:text-white transition-colors">
                ← Prev
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg glass border border-white/10 text-gray-400 text-xs disabled:opacity-40 hover:text-white transition-colors">
                Next →
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
