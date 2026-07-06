import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const ISSUE_META = {
  pothole:           { icon: '🕳️', label: 'Pothole',          color: '#f59e0b' },
  garbage:           { icon: '🗑️', label: 'Garbage Dump',     color: '#10b981' },
  water_leakage:     { icon: '💧', label: 'Water Leakage',    color: '#22d3ee' },
  broken_streetlight:{ icon: '💡', label: 'Broken Streetlight',color: '#f97316' },
  other:             { icon: '⚠️', label: 'Other',            color: '#a855f7' },
};

const STATUS_META = {
  reported:    { label: 'Reported',    color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  verified:    { label: 'Verified',    color: '#22d3ee', bg: 'rgba(34,211,238,0.12)' },
  in_progress: { label: 'In Progress', color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
  resolved:    { label: 'Resolved',    color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  rejected:    { label: 'Rejected',    color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
};

function StatCard({ icon, label, value, color, sub, delay }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
      className="card-stat p-5 rounded-2xl">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
          style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
          {icon}
        </div>
        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2.5, repeat: Infinity }}
          className="w-2 h-2 rounded-full mt-1" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
      </div>
      <p className="text-2xl font-display font-bold text-white tabular-nums">{value ?? '—'}</p>
      <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{label}</p>
      {sub && <p className="text-xs mt-1 font-medium" style={{ color }}>{sub}</p>}
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="card-stat p-5 rounded-2xl">
      <div className="skeleton w-10 h-10 rounded-xl mb-4" />
      <div className="skeleton w-16 h-7 rounded-lg mb-2" />
      <div className="skeleton w-24 h-4 rounded" />
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (user) {
      Promise.all([
        api.get('/analytics/summary'),
        api.get('/complaints?limit=6'),
      ]).then(([s, c]) => {
        setStats(s.data);
        setRecent(c.data.complaints || []);
      }).catch(() => {}).finally(() => setLoadingStats(false));
    } else {
      setLoadingStats(false);
    }
  }, [user]);

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 space-y-10">

      {/* ── Hero ── */}
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="relative rounded-[2rem] overflow-hidden"
        style={{ background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-primary) 100%)', border: '1px solid var(--border)', minHeight: 380, boxShadow: '0 12px 32px rgba(0,0,0,0.3)' }}>

        {/* Grid */}
        <div className="absolute inset-0 grid-bg opacity-30" />

        {/* Subtle Glow */}
        <motion.div animate={{ opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <motion.div animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-24 right-1/4 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)', filter: 'blur(50px)' }} />
        <motion.div animate={{ opacity: [0.2, 0.3, 0.2] }} transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-10 right-10 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', filter: 'blur(60px)' }} />

        <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="max-w-xl">
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5"
              style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.35)', color: '#818cf8' }}>
              <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-indigo-400 block" />
              AI-Powered Smart City Platform
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl font-display font-bold text-white leading-[1.15] mb-4">
              Report. Track.<br />
              <span className="text-gradient">Resolve Together.</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
              className="text-base leading-relaxed mb-7" style={{ color: 'var(--text-secondary)' }}>
              Crowdsourced civic issue reporting with AI detection, GPS mapping, and real-time authority dashboards. Make your city better — one report at a time.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
              className="flex flex-wrap gap-3">
              <Link to={user ? '/report' : '/register'}>
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="btn-primary px-6 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center gap-2">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  Report an Issue
                </motion.button>
              </Link>
              <Link to="/report-disaster">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                  className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 shadow-[0_0_24px_rgba(239,68,68,0.5)] border border-red-400/30 px-6 py-2.5 rounded-xl text-white text-sm font-bold flex items-center gap-2 transition-all">
                  🚨 Report Disaster
                </motion.button>
              </Link>
              <Link to="/map">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="btn-ghost px-6 py-2.5 rounded-xl text-sm text-slate-300 flex items-center gap-2">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
                  </svg>
                  Live Map
                </motion.button>
              </Link>
            </motion.div>
          </div>

          {/* Floating issue type badges */}
          <div className="hidden md:grid grid-cols-2 gap-3 flex-shrink-0">
            {Object.entries(ISSUE_META).slice(0, 4).map(([key, meta], i) => (
              <motion.div key={key}
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
                transition={{ delay: 0.5 + i * 0.1, type: 'spring', stiffness: 200, y: { duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut' } }}
                className="px-4 py-3 rounded-2xl text-center"
                style={{ background: `${meta.color}10`, border: `1px solid ${meta.color}25`, minWidth: 110 }}>
                <span className="text-2xl block mb-1">{meta.icon}</span>
                <span className="text-xs font-medium text-white">{meta.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── Stats ── */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-display font-bold text-white">City Overview</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Real-time statistics</p>
          </div>
          {user && (
            <Link to="/dashboard" className="text-xs font-semibold flex items-center gap-1 transition-colors"
              style={{ color: '#818cf8' }}
              onMouseEnter={e => e.currentTarget.style.color = '#a5b4fc'}
              onMouseLeave={e => e.currentTarget.style.color = '#818cf8'}>
              Full Dashboard →
            </Link>
          )}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loadingStats ? (
            Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
          ) : stats ? (
            <>
              <StatCard icon="📊" label="Total Reports"  value={stats.total}       color="#6366f1" delay={0.05} />
              <StatCard icon="✅" label="Resolved"       value={stats.resolved}    color="#10b981"
                sub={`${stats.total ? Math.round(stats.resolved/stats.total*100) : 0}% rate`} delay={0.1} />
              <StatCard icon="⏳" label="Pending"        value={stats.pending}     color="#f59e0b" delay={0.15} />
              <StatCard icon="🚨" label="High Priority"  value={stats.highPriority}color="#ef4444" delay={0.2} />
            </>
          ) : (
            <>
              <StatCard icon="📊" label="Total Reports"  value="—" color="#6366f1" delay={0.05} />
              <StatCard icon="✅" label="Resolved"       value="—" color="#10b981" delay={0.1} />
              <StatCard icon="⏳" label="Pending"        value="—" color="#f59e0b" delay={0.15} />
              <StatCard icon="🚨" label="High Priority"  value="—" color="#ef4444" delay={0.2} />
            </>
          )}
        </div>
      </section>

      {/* ── Issue categories ── */}
      <section>
        <h2 className="text-lg font-display font-bold text-white mb-5">Issue Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.entries(ISSUE_META).map(([key, meta], i) => (
            <motion.div key={key}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="card p-4 text-center cursor-pointer group">
              <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center text-2xl transition-all duration-300 group-hover:scale-110"
                style={{ background: `${meta.color}12`, border: `1px solid ${meta.color}25` }}>
                {meta.icon}
              </div>
              <p className="text-sm font-semibold text-white">{meta.label}</p>
              <div className="w-full h-0.5 rounded-full mt-3 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${30 + i * 12}%` }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${meta.color}, ${meta.color}80)` }} />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Recent reports ── */}
      {user && recent.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-display font-bold text-white">Recent Reports</h2>
            <Link to="/tracking" className="text-xs font-semibold flex items-center gap-1"
              style={{ color: '#818cf8' }}>View all →</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recent.map((c, i) => {
              const meta = ISSUE_META[c.issueType] || ISSUE_META.other;
              const status = STATUS_META[c.status] || STATUS_META.reported;
              return (
                <motion.div key={c._id}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  whileHover={{ y: -3 }}
                  className="card p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: `${meta.color}12`, border: `1px solid ${meta.color}25` }}>
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-white truncate">{meta.label}</p>
                      <span className="badge flex-shrink-0 text-[10px]"
                        style={{ background: status.bg, color: status.color, border: `1px solid ${status.color}30` }}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{c.description}</p>
                    <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
                      {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {c.address && ` · ${c.address}`}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── CTA (logged out) ── */}
      {!user && (
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="rounded-[2rem] p-8 md:p-12 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(14,165,233,0.05) 100%)', border: '1px solid var(--border)' }}>
          <div className="absolute inset-0 grid-bg opacity-50" />
          <div className="relative z-10">
            <h2 className="text-3xl font-display font-bold text-white mb-3">Ready to make a difference?</h2>
            <p className="mb-8 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Join thousands of citizens who are actively improving their city's infrastructure.
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              <Link to="/register">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="btn-primary px-8 py-3 rounded-xl text-white font-semibold">
                  Get Started Free
                </motion.button>
              </Link>
              <Link to="/map">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="btn-ghost px-8 py-3 rounded-xl text-slate-300 font-semibold">
                  Explore Map
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.section>
      )}
    </div>
  );
}
