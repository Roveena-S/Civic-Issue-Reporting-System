import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';

const NAV_ITEMS = [
  { path: '/',          label: 'Home',           icon: <HomeIcon />,      end: true },
  { path: '/report',    label: 'Report Issue',   icon: <ReportIcon />,    auth: true },
  { path: '/map',       label: 'Map View',       icon: <MapIcon /> },
  { path: '/tracking',  label: 'My Complaints',  icon: <TrackIcon />,     auth: true },
  { path: '/alerts',    label: 'Disaster Alerts',icon: <AlertIcon /> },
  { path: '/dashboard', label: 'Dashboard',      icon: <DashIcon />,      roles: ['authority','admin'] },
];

function HomeIcon()   { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>; }
function ReportIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>; }
function MapIcon()    { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>; }
function TrackIcon()  { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>; }
function AlertIcon()  { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>; }
function DashIcon()   { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>; }

const ROLE_COLORS = { citizen: '#22d3ee', authority: '#a855f7', admin: '#f97316' };

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); setProfileOpen(false); }, [location]);

  const visibleNav = NAV_ITEMS.filter(item => {
    if (item.roles) return user && item.roles.includes(user.role);
    return true;
  });

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* ── Navbar ── */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 navbar-glass"
        animate={{ boxShadow: scrolled ? '0 4px 32px rgba(0,0,0,0.5)' : 'none' }}
        transition={{ duration: 0.3 }}
        style={{ height: 64 }}
      >
        <div className="max-w-screen-xl mx-auto px-4 h-full flex items-center justify-between gap-6">

          {/* ── Logo ── */}
          <NavLink to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <motion.div
              whileHover={{ rotate: [0, -8, 8, 0], scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)', boxShadow: '0 0 16px rgba(59,130,246,0.3)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </motion.div>
            <div className="leading-none">
              <span className="font-display font-bold text-white text-sm tracking-tight">CivicWatch</span>
              <span className="block text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Smart City Platform</span>
            </div>
          </NavLink>

          {/* ── Desktop Nav ── */}
          <nav className="nav-desktop items-center gap-1 flex-1 justify-center">
            {visibleNav.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `nav-link flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 text-sm font-medium
                  ${isActive
                    ? 'active text-white bg-white/5'
                    : 'text-slate-400 hover:text-white hover:bg-white/4'}`
                }
              >
                {({ isActive }) => (
                  <>
                    <span style={{ color: isActive ? '#6366f1' : 'inherit', transition: 'color 0.2s' }}>
                      {item.icon}
                    </span>
                    {item.label}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* ── Right side ── */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Theme Toggle */}
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={toggleTheme} className="w-8 h-8 rounded-lg flex items-center justify-center btn-ghost mr-1 hover:bg-white/10" aria-label="Toggle Theme">
              {theme === 'dark' ? '☀️' : '🌙'}
            </motion.button>
            
            {/* Live indicator */}
            <div className="nav-desktop items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
              <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-emerald-400 block" />
              <span className="text-emerald-400 text-xs font-medium">Live</span>
            </div>

            {user ? (
              <>
                <NotificationBell />

                {/* Profile dropdown */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all duration-200"
                    style={{ background: profileOpen ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${ROLE_COLORS[user?.role] || '#6366f1'}, #6366f1)` }}>
                      {user?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="nav-desktop flex-col items-start leading-none">
                      <span className="text-xs font-semibold text-white">{user?.name?.split(' ')[0] || 'User'}</span>
                      <span className="text-[10px] capitalize" style={{ color: ROLE_COLORS[user?.role] }}>{user?.role || ''}</span>
                    </div>
                    <motion.svg animate={{ rotate: profileOpen ? 180 : 0 }} transition={{ duration: 0.2 }}
                      width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                      className="text-slate-500 nav-desktop">
                      <polyline points="6 9 12 15 18 9"/>
                    </motion.svg>
                  </motion.button>

                  <AnimatePresence>
                    {profileOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.96 }}
                          transition={{ duration: 0.18, ease: 'easeOut' }}
                          className="absolute right-0 top-12 w-52 rounded-2xl z-50 overflow-hidden"
                          style={{ background: 'var(--bg-elevated)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 16px 48px rgba(0,0,0,0.6)' }}
                        >
                          <div className="p-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                            <p className="text-sm font-semibold text-white">{user.name}</p>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                            <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide"
                              style={{ background: `${ROLE_COLORS[user.role]}18`, color: ROLE_COLORS[user.role], border: `1px solid ${ROLE_COLORS[user.role]}35` }}>
                              {user.role}
                            </span>
                          </div>
                          <div className="p-1.5">
                            <button onClick={handleLogout}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 text-red-400 hover:bg-red-500/10 hover:text-red-300">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                              </svg>
                              Sign Out
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <NavLink to="/login">
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="btn-ghost px-4 py-1.5 rounded-lg text-sm text-slate-300">
                    Sign In
                  </motion.button>
                </NavLink>
                <NavLink to="/register">
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="btn-primary px-4 py-1.5 rounded-lg text-sm text-white">
                    Get Started
                  </motion.button>
                </NavLink>
              </div>
            )}

            {/* Mobile hamburger */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileOpen(!mobileOpen)}
              className="nav-mobile-btn w-9 h-9 rounded-lg items-center justify-center btn-ghost"
            >
              <div className="space-y-1.5">
                <motion.span animate={{ rotate: mobileOpen ? 45 : 0, y: mobileOpen ? 8 : 0 }}
                  className="block w-5 h-0.5 bg-slate-300 rounded-full origin-center" />
                <motion.span animate={{ opacity: mobileOpen ? 0 : 1, scaleX: mobileOpen ? 0 : 1 }}
                  className="block w-5 h-0.5 bg-slate-300 rounded-full" />
                <motion.span animate={{ rotate: mobileOpen ? -45 : 0, y: mobileOpen ? -8 : 0 }}
                  className="block w-5 h-0.5 bg-slate-300 rounded-full origin-center" />
              </div>
            </motion.button>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden border-t"
              style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(5,5,8,0.97)' }}
            >
              <div className="px-4 py-3 space-y-1">
                {visibleNav.map((item, i) => (
                  <motion.div key={item.path}
                    initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}>
                    <NavLink to={item.path} end={item.end}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                        ${isActive ? 'text-white bg-indigo-500/15 border border-indigo-500/25' : 'text-slate-400 hover:text-white hover:bg-white/5'}`
                      }>
                      {item.icon}{item.label}
                    </NavLink>
                  </motion.div>
                ))}
                {user && (
                  <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all mt-2">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Sign Out
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* ── Page content ── */}
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="page-wrapper"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
