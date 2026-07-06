import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'citizen' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (form.password.length < 6) e.password = 'Minimum 6 characters';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      toast.success('Account created! Welcome to CivicWatch.');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const ROLES = [
    { value: 'citizen',   label: 'Citizen',   desc: 'Report & track issues',  color: '#22d3ee', icon: '🏘️' },
    { value: 'authority', label: 'Authority',  desc: 'Manage & resolve issues', color: '#a855f7', icon: '🏛️' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-primary)' }}>
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div animate={{ x: [0, 30, 0], y: [0, -20, 0] }} transition={{ duration: 12, repeat: Infinity }}
          className="absolute top-0 right-1/4 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <motion.div animate={{ x: [0, -20, 0], y: [0, 30, 0] }} transition={{ duration: 15, repeat: Infinity }}
          className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10">

        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span className="font-display font-bold text-white text-lg">CivicWatch</span>
          </Link>
          <h1 className="text-2xl font-display font-bold text-white">Create your account</h1>
          <p className="text-sm mt-1.5" style={{ color: 'var(--text-secondary)' }}>Join thousands of citizens improving their city</p>
        </div>

        <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2.5" style={{ color: 'var(--text-muted)' }}>
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map(r => (
                  <motion.button key={r.value} type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setForm({ ...form, role: r.value })}
                    className="p-3 rounded-xl text-left transition-all"
                    style={{
                      background: form.role === r.value ? `${r.color}12` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${form.role === r.value ? r.color + '40' : 'rgba(255,255,255,0.07)'}`,
                    }}>
                    <span className="text-xl block mb-1">{r.icon}</span>
                    <p className="text-sm font-semibold text-white">{r.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{r.desc}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Fields */}
            {[
              { label: 'Full Name',      type: 'text',     key: 'name',     placeholder: 'John Doe' },
              { label: 'Email Address',  type: 'email',    key: 'email',    placeholder: 'john@example.com' },
              { label: 'Password',       type: 'password', key: 'password', placeholder: '••••••••' },
            ].map((field, i) => (
              <motion.div key={field.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                  style={{ color: 'var(--text-muted)' }}>{field.label}</label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={form[field.key]}
                  onChange={e => { setForm({ ...form, [field.key]: e.target.value }); setErrors({ ...errors, [field.key]: '' }); }}
                  className={`glow-input w-full px-4 py-3 rounded-xl text-sm ${errors[field.key] ? 'border-red-500/50' : ''}`}
                />
                <AnimatePresence>
                  {errors[field.key] && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="text-xs mt-1.5 flex items-center gap-1" style={{ color: '#f87171' }}>
                      <span>⚠</span> {errors[field.key]}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}

            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              className="btn-primary w-full py-3 rounded-xl text-white text-sm font-semibold mt-2 disabled:opacity-60">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 rounded-full border-white/30 border-t-white block" />
                  Creating account...
                </span>
              ) : 'Create Account →'}
            </motion.button>
          </form>
        </div>

        <p className="text-center text-sm mt-5" style={{ color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold" style={{ color: '#818cf8' }}>Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
