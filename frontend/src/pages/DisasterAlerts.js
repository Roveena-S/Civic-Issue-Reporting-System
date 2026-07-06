import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import api from '../utils/api';
import toast from 'react-hot-toast';

const DISASTER_ICONS = {
  flood: '🌊', fire: '🔥', earthquake: '🌍', power_outage: '⚡', road_blockage: '🚧',
  accident: '💥', landslide: '⛰️', building_collapse: '🏗️', fallen_tree: '🌳', other: '⚠️'
};

const DISASTER_COLORS = {
  flood: '#3b82f6', fire: '#ef4444', earthquake: '##8b5cf6', power_outage: '#a855f7', 
  road_blockage: '#64748b', accident: '#f97316', landslide: '#f59e0b', building_collapse: '#eab308', 
  fallen_tree: '#10b981', other: '#94a3b8'
};

const SEV = {
  critical: { label: 'Critical', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' },
  high:     { label: 'High',     color: '#f97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)' },
  medium:   { label: 'Medium',   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
  low:      { label: 'Low',      color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)' },
};

export default function DisasterAlerts() {
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upvoting, setUpvoting] = useState(null);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/disaster');
      setAlerts(res.data);
    } catch (err) {
      toast.error('Failed to load disaster alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (id, e) => {
    e.stopPropagation();
    setUpvoting(id);
    try {
      const res = await api.put(`/disaster/upvote/${id}`);
      setAlerts(alerts.map(a => 
        a._id === id ? { ...a, upvotes: res.data.upvotes, priority: res.data.priority } : a
      ));
      toast.success('Alert verified/upvoted');
    } catch {
      toast.error('Error verifying alert');
    } finally {
      setUpvoting(null);
    }
  };

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.priority === filter);
  
  const counts = { 
    critical: alerts.filter(a => a.priority === 'critical').length, 
    high: alerts.filter(a => a.priority === 'high').length, 
    medium: alerts.filter(a => a.priority === 'medium').length, 
    low: alerts.filter(a => a.priority === 'low').length 
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
            ⚠️
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-white">Disaster Alerts</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Real-time emergency notifications for your city</p>
          </div>
          <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
            className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 block" />
            Live Feed
          </motion.div>
        </div>
      </motion.div>

      {/* Severity summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {Object.entries(SEV).map(([key, s], i) => (
          <motion.div key={key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }} whileHover={{ y: -3 }}
            onClick={() => setFilter(filter === key ? 'all' : key)}
            className="card-stat p-4 rounded-2xl cursor-pointer transition-all"
            style={{ border: filter === key ? `1px solid ${s.color}50` : undefined }}>
            <p className="text-xl font-display font-bold" style={{ color: s.color }}>{counts[key]}</p>
            <p className="text-xs font-semibold mt-1" style={{ color: s.color }}>{s.label}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Active alerts</p>
          </motion.div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {['all', 'critical', 'high', 'medium', 'low'].map(f => {
          const s = SEV[f];
          return (
            <motion.button key={f} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => setFilter(f)}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all capitalize"
              style={filter === f
                ? { background: s ? s.bg : 'rgba(99,102,241,0.15)', color: s ? s.color : '#818cf8', border: `1px solid ${s ? s.border : 'rgba(99,102,241,0.4)'}` }
                : { background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {f === 'all' ? 'All Alerts' : f}
            </motion.button>
          );
        })}
      </div>

      {/* Alert cards */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center p-12">
             <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-10 h-10 border-2 border-red-500/30 border-t-red-500 rounded-full" />
          </div>
        ) : alerts.length === 0 ? (
           <div className="text-center p-12 glass rounded-2xl">
              <p className="text-gray-400">No active disaster alerts reported.</p>
           </div>
        ) : (
          <AnimatePresence>
            {filtered.map((alert, i) => {
              const sev = SEV[alert.priority] || SEV.low;
              const isOpen = expanded === alert._id;
              const icon = DISASTER_ICONS[alert.type] || DISASTER_ICONS.other;
              const color = DISASTER_COLORS[alert.type] || DISASTER_COLORS.other;
              
              // time ago
              const date = new Date(alert.createdAt);
              const diffMin = Math.round((new Date() - date) / 60000);
              const timeStr = diffMin < 60 ? `${diffMin} min ago` : `${Math.round(diffMin/60)} hr ago`;

              return (
                <motion.div key={alert._id}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }} transition={{ delay: i * 0.06 }}
                  className="card cursor-pointer relative"
                  style={{ border: isOpen ? `1px solid ${sev.color}80` : undefined, boxShadow: isOpen ? `0 0 20px ${sev.color}20` : undefined }}
                  onClick={() => setExpanded(isOpen ? null : alert._id)}>

                  <div className="p-4 flex items-start gap-4">
                    {/* Severity bar */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r-md flex-shrink-0"
                      style={{ background: sev.color, boxShadow: `0 0 8px ${sev.color}80` }} />

                    <div className="w-12 h-12 ml-2 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 mt-1"
                      style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                      {icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="pr-12">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <p className="text-base font-semibold text-white leading-tight">{alert.title}</p>
                            {alert.priority === 'critical' ? (
                              <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1, repeat: Infinity }}
                                className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                                style={{ background: sev.bg, color: sev.color, border: `1px solid ${sev.border}` }}>
                                {sev.label}
                              </motion.span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                                style={{ background: sev.bg, color: sev.color, border: `1px solid ${sev.border}` }}>
                                {sev.label}
                              </span>
                            )}
                          </div>
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            📍 {alert.location}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                            <span className="flex items-center gap-1">⌚ {timeStr}</span>
                            <span className="w-1 h-1 rounded-full bg-white/20" />
                            <span className="capitalize px-2 py-0.5 rounded bg-white/5 border border-white/10">{alert.type.replace('_', ' ')}</span>
                          </div>
                        </div>

                        {/* Top Right Controls */}
                        <div className="flex items-center gap-3 absolute top-4 right-4">
                          <button onClick={(e) => handleUpvote(alert._id, e)} disabled={upvoting === alert._id}
                            className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-xl border transition-all ${upvoting === alert._id ? 'opacity-50' : 'hover:scale-105'}`}
                            style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-400 mb-0.5"><polyline points="18 15 12 9 6 15"/></svg>
                            <span className="text-[10px] font-bold text-white">{alert.upvotes}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                        className="overflow-hidden">
                        
                        <div className="px-4 pb-5 pl-[calc(0.5rem+3rem+1rem)]">
                          <div className="w-full h-px bg-white/5 mb-4" />
                          <p className="text-sm leading-relaxed text-gray-300">
                            {alert.description}
                          </p>
                          
                          {alert.image && (
                            <div className="mt-4 rounded-xl overflow-hidden border border-white/10 inline-block">
                              <img src={`http://localhost:5000${alert.image}`} alt="Emergency" className="max-w-xs max-h-48 object-cover" />
                            </div>
                          )}

                          <div className="flex items-center justify-between gap-2 mt-5">
                            <div className="flex gap-2">
                                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                                className="px-4 py-2 rounded-lg text-xs font-semibold"
                                style={{ background: sev.bg, color: sev.color, border: `1px solid ${sev.border}` }}>
                                View on Map
                                </motion.button>
                                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10 border border-white/5">
                                Share Alert
                                </motion.button>
                            </div>
                            
                            <span className="px-3 py-1 rounded-full text-[10px] font-bold capitalize" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'gray' }}>
                                Status: {alert.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
