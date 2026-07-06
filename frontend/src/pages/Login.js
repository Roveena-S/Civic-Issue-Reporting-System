import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const DEMO = [
  { role: 'Citizen',   email: 'citizen@demo.com',   color: '#22d3ee' },
  { role: 'Authority', email: 'authority@demo.com',  color: '#a855f7' },
  { role: 'Admin',     email: 'admin@demo.com',      color: '#f97316' },
];

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'authority' || user.role === 'admin' ? '/dashboard' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email) => setForm({ email, password: 'password123' });

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0a0a18 0%, #0d0d22 100%)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>

        {/* Grid bg */}
        <div className="absolute inset-0 grid-bg opacity-60" />

        {/* Glow orbs */}
        <motion.div animate={{ scale: [1,1.15,1], opacity: [0.4,0.7,0.4] }} transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <motion.div animate={{ scale: [1.1,1,1.1], opacity: [0.3,0.5,0.3] }} transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)', filter: 'blur(40px)' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', boxShadow: '0 0 20px rgba(99,102,241,0.5)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span className="font-display font-bold text-white text-lg">CivicWatch</span>
          </div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-4xl font-display font-bold text-white leading-tight mb-4">
              Smart City<br />
              <span className="text-gradient">Issue Reporting</span>
            </h2>
            <p className="text-slate-400 text-base leading-relaxed">
              AI-powered platform for citizens to report, track, and resolve civic infrastructure issues in real time.
            </p>
          </motion.div>
        </div>

        {/* Feature pills */}
        <div className="relative z-10 space-y-3">
          {[
            { icon: '🤖', text: 'AI-powered issue detection' },
            { icon: '📍', text: 'GPS geolocation & live map' },
            { icon: '📊', text: 'Real-time analytics dashboard' },
          ].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <span className="text-lg">{f.icon}</span>
              <span className="text-sm text-slate-300 font-medium">{f.text}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span className="font-display font-bold text-white">CivicWatch</span>
          </div>

          <h1 className="text-2xl font-display font-bold text-white mb-1">Welcome back</h1>
          <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
            Sign in to your account to continue
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Email address', type: 'email', key: 'email', placeholder: 'you@example.com' },
              { label: 'Password',      type: 'password', key: 'password', placeholder: '••••••••' },
            ].map((field, i) => (
              <motion.div key={field.key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: 'var(--text-muted)' }}>{field.label}</label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={form[field.key]}
                  onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                  className="glow-input w-full px-4 py-3 rounded-xl text-sm"
                  required
                />
              </motion.div>
            ))}

            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="btn-primary w-full py-3 rounded-xl text-white text-sm mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 rounded-full border-white/30 border-t-white block" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </motion.button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold transition-colors" style={{ color: '#818cf8' }}
              onMouseEnter={e => e.target.style.color = '#a5b4fc'}
              onMouseLeave={e => e.target.style.color = '#818cf8'}>
              Create one
            </Link>
          </p>

          {/* Demo credentials */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="mt-6 p-4 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3 text-center"
              style={{ color: 'var(--text-muted)' }}>Quick Demo Access</p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO.map(d => (
                <motion.button key={d.role} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  onClick={() => fillDemo(d.email)}
                  className="py-2 px-1 rounded-xl text-center transition-all"
                  style={{ background: `${d.color}10`, border: `1px solid ${d.color}25` }}>
                  <p className="text-xs font-semibold" style={{ color: d.color }}>{d.role}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Click to fill</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
