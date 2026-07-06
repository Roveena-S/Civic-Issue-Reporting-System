import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  reported:    { label: 'Reported',     icon: '📢', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  verified:    { label: 'Verified',     icon: '✅', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  in_progress: { label: 'In Progress',  icon: '🔧', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
  resolved:    { label: 'Resolved',     icon: '🎉', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  rejected:    { label: 'Rejected',     icon: '❌', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
};

const ISSUE_ICONS = { pothole: '🕳️', garbage: '🗑️', water_leakage: '💧', broken_streetlight: '💡', other: '⚠️' };
const TIMELINE_STEPS = ['reported', 'verified', 'in_progress', 'resolved'];

function Timeline({ timeline, status }) {
  const currentIdx = TIMELINE_STEPS.indexOf(status);
  return (
    <div className="relative">
      {TIMELINE_STEPS.map((step, i) => {
        const done = i <= currentIdx;
        const active = i === currentIdx;
        const cfg = STATUS_CONFIG[step];
        const entry = timeline?.find(t => t.status === step);
        return (
          <div key={step} className="flex gap-4 pb-6 last:pb-0">
            {/* Line + dot */}
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.15, type: 'spring' }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 z-10"
                style={{
                  background: done ? cfg.bg : 'rgba(255,255,255,0.05)',
                  border: `2px solid ${done ? cfg.color : 'rgba(255,255,255,0.1)'}`,
                  boxShadow: active ? `0 0 12px ${cfg.color}60` : 'none'
                }}>
                {done ? cfg.icon : <span className="text-gray-600 text-xs">{i + 1}</span>}
              </motion.div>
              {i < TIMELINE_STEPS.length - 1 && (
                <motion.div
                  initial={{ scaleY: 0 }} animate={{ scaleY: done ? 1 : 0 }}
                  transition={{ delay: i * 0.15 + 0.3, duration: 0.4 }}
                  className="w-0.5 flex-1 mt-1 origin-top"
                  style={{ background: done ? cfg.color : 'rgba(255,255,255,0.1)', minHeight: 24 }} />
              )}
            </div>
            {/* Content */}
            <div className="flex-1 pt-1">
              <p className={`text-sm font-medium ${done ? 'text-white' : 'text-gray-600'}`}>{cfg.label}</p>
              {entry && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 + 0.2 }}>
                  <p className="text-xs text-gray-500 mt-0.5">{entry.note}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{new Date(entry.timestamp).toLocaleString()}</p>
                </motion.div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ComplaintCard({ complaint, onUpvote, expanded, onToggle }) {
  const cfg = STATUS_CONFIG[complaint.status] || STATUS_CONFIG.reported;
  const progress = ((TIMELINE_STEPS.indexOf(complaint.status) + 1) / TIMELINE_STEPS.length) * 100;

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl overflow-hidden card-hover">
      {/* Card Header */}
      <div className="p-5 cursor-pointer" onClick={onToggle}>
        <div className="flex items-start gap-4">
          {complaint.imageUrl ? (
            <img src={`http://localhost:5000${complaint.imageUrl}`} alt="issue"
              className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}30` }}>
              {ISSUE_ICONS[complaint.issueType] || '⚠️'}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-white font-semibold capitalize text-sm">
                {complaint.issueType?.replace('_', ' ')}
              </span>
              {complaint.isFlagged && (
                <span className="px-2 py-0.5 rounded-md text-xs bg-red-500/20 text-red-400 border border-red-500/30">
                  🚩 Flagged
                </span>
              )}
              {complaint.isDuplicate && (
                <span className="px-2 py-0.5 rounded-md text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                  🔁 Duplicate
                </span>
              )}
            </div>
            <p className="text-gray-400 text-xs truncate">{complaint.description}</p>
            <p className="text-gray-600 text-xs mt-1">
              📍 {complaint.address || `${complaint.latitude?.toFixed(4)}, ${complaint.longitude?.toFixed(4)}`}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <span className="px-2.5 py-1 rounded-lg text-xs font-medium"
              style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}40` }}>
              {cfg.icon} {cfg.label}
            </span>
            <span className="text-xs text-gray-500">{new Date(complaint.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}aa)` }} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={e => { e.stopPropagation(); onUpvote(complaint._id); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium glass border border-white/10 hover:border-blue-500/40 hover:text-blue-400 transition-all text-gray-400">
            👍 {complaint.upvotes} upvotes
          </motion.button>
          <span className="text-xs text-gray-500">
            {expanded ? '▲ Hide timeline' : '▼ Show timeline'}
          </span>
        </div>
      </div>

      {/* Timeline */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
            className="border-t border-white/5 px-5 py-4"
            style={{ background: 'rgba(0,0,0,0.2)' }}>
            <p className="text-xs text-gray-500 mb-4 font-medium uppercase tracking-wider">Complaint Timeline</p>
            <Timeline timeline={complaint.timeline} status={complaint.status} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ComplaintTracking() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api.get('/complaints/user/my').then(r => {
      setComplaints(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleUpvote = async (id) => {
    try {
      const { data } = await api.put(`/complaints/${id}/upvote`);
      setComplaints(prev => prev.map(c => c._id === id ? { ...c, upvotes: data.upvotes } : c));
      toast.success('Upvoted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not upvote');
    }
  };

  const filtered = filter === 'all' ? complaints : complaints.filter(c => c.status === filter);

  const counts = {
    all: complaints.length,
    reported: complaints.filter(c => c.status === 'reported').length,
    in_progress: complaints.filter(c => c.status === 'in_progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold text-white">My Complaints</h1>
        <p className="text-gray-400 text-sm mt-1">Track the status of your reported issues</p>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { key: 'all', label: 'Total', color: '#3b82f6' },
          { key: 'reported', label: 'Reported', color: '#f59e0b' },
          { key: 'in_progress', label: 'In Progress', color: '#8b5cf6' },
          { key: 'resolved', label: 'Resolved', color: '#10b981' },
        ].map((s, i) => (
          <motion.div key={s.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }} whileHover={{ scale: 1.03 }}
            onClick={() => setFilter(s.key)}
            className={`glass rounded-xl p-3 text-center cursor-pointer transition-all
              ${filter === s.key ? 'border border-blue-500/40' : 'border border-transparent'}`}>
            <p className="text-xl font-bold" style={{ color: s.color }}>{counts[s.key]}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <motion.button key={key} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all
              ${filter === key ? 'text-white' : 'glass border border-white/10 text-gray-400'}`}
            style={filter === key ? { background: cfg.bg, border: `1px solid ${cfg.color}40`, color: cfg.color } : {}}>
            {cfg.icon} {cfg.label}
          </motion.button>
        ))}
      </div>

      {/* Complaints list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center py-20 glass rounded-2xl">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-white font-medium">No complaints found</p>
          <p className="text-gray-500 text-sm mt-1">
            {filter === 'all' ? "You haven't reported any issues yet" : `No ${filter.replace('_', ' ')} complaints`}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filtered.map(c => (
            <ComplaintCard
              key={c._id}
              complaint={c}
              onUpvote={handleUpvote}
              expanded={expanded === c._id}
              onToggle={() => setExpanded(expanded === c._id ? null : c._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
