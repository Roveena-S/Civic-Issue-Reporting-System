import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  const fetch = () => api.get('/notifications').then(r => setNotifications(r.data)).catch(() => {});

  useEffect(() => {
    fetch();
    const t = setInterval(fetch, 30000);
    return () => clearInterval(t);
  }, []);

  const unread = notifications.filter(n => !n.isRead).length;

  const markAll = async () => {
    await api.put('/notifications/read-all').catch(() => {});
    setNotifications(p => p.map(n => ({ ...n, isRead: true })));
  };

  const TYPE_ICON = { status_update: '📋', upvote: '👍', duplicate: '🔁', flagged: '🚩' };

  return (
    <div className="relative">
      <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all"
        style={{
          background: open ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${open ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.07)'}`,
          color: 'var(--text-secondary)',
        }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
        <AnimatePresence>
          {unread > 0 && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white font-bold"
              style={{ background: '#ef4444', fontSize: 9, boxShadow: '0 0 8px rgba(239,68,68,0.6)' }}>
              {unread > 9 ? '9+' : unread}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="absolute right-0 top-12 w-80 rounded-2xl z-50 overflow-hidden"
              style={{ background: 'var(--bg-elevated)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 60px rgba(0,0,0,0.7)' }}>

              <div className="px-4 py-3 flex items-center justify-between"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-white">Notifications</p>
                  {unread > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-xs font-bold"
                      style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8' }}>{unread}</span>
                  )}
                </div>
                {unread > 0 && (
                  <button onClick={markAll} className="text-xs font-medium transition-colors"
                    style={{ color: '#818cf8' }}
                    onMouseEnter={e => e.target.style.color = '#a5b4fc'}
                    onMouseLeave={e => e.target.style.color = '#818cf8'}>
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-2xl mb-2">🔔</p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No notifications yet</p>
                  </div>
                ) : notifications.map((n, i) => (
                  <motion.div key={n._id}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="px-4 py-3 flex items-start gap-3 transition-colors hover:bg-white/2"
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      background: !n.isRead ? 'rgba(99,102,241,0.04)' : 'transparent',
                    }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                      style={{ background: 'rgba(255,255,255,0.05)' }}>
                      {TYPE_ICON[n.type] || '📋'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white leading-relaxed">{n.message}</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        {new Date(n.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {!n.isRead && (
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                        style={{ background: '#6366f1', boxShadow: '0 0 6px rgba(99,102,241,0.8)' }} />
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
