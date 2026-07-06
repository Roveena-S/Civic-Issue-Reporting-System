import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

const DISASTER_TYPES = [
  { value: 'flood', label: 'Flood', icon: '🌊', color: '#3b82f6' },
  { value: 'fire', label: 'Fire Incident', icon: '🔥', color: '#ef4444' },
  { value: 'accident', label: 'Major Accident', icon: '💥', color: '#f97316' },
  { value: 'earthquake', label: 'Earthquake', icon: '🌍', color: '#8b5cf6' },
  { value: 'landslide', label: 'Landslide', icon: '⛰️', color: '#f59e0b' },
  { value: 'building_collapse', label: 'Building Collapse', icon: '🏗️', color: '#eab308' },
  { value: 'power_outage', label: 'Power Outage', icon: '⚡', color: '#a855f7' },
  { value: 'fallen_tree', label: 'Fallen Tree', icon: '🌳', color: '#10b981' },
  { value: 'road_blockage', label: 'Road Blockage', icon: '🚧', color: '#64748b' },
  { value: 'other', label: 'Other', icon: '⚠️', color: '#94a3b8' }
];

export default function DisasterReport() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', type: '', description: '', location: '' });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback(async files => {
    const file = files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, maxFiles: 1
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.type || !form.description || !form.location || !form.title) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('type', form.type);
      fd.append('description', form.description);
      fd.append('location', form.location);
      if (image) fd.append('image', image);

      await api.post('/disaster/report', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Disaster alert reported successfully!');
      navigate('/alerts');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                🚨
            </div>
            <div>
                <h1 className="text-3xl font-bold text-red-500">Report Emergency / Disaster</h1>
                <p className="text-red-400/80 text-sm mt-1">This form is for urgent and critical issues only</p>
            </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
            <div className="glass p-6 rounded-2xl border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.05)]">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm text-gray-300 font-medium mb-1.5">Alert Title *</label>
                        <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                            placeholder="e.g. Major Flooding on Main St"
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all text-sm" />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-300 font-medium mb-3">Disaster Type *</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {DISASTER_TYPES.map(type => (
                            <motion.button type="button" key={type.value} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                onClick={() => setForm({ ...form, type: type.value })}
                                className={`p-2 rounded-xl border text-left transition-all
                                ${form.type === type.value
                                    ? 'border-red-500 bg-red-500/15'
                                    : 'border-white/10 hover:border-white/20 bg-white/5'}`}>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl block">{type.icon}</span>
                                    <span className="text-xs text-white font-medium">{type.label}</span>
                                </div>
                            </motion.button>
                        ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-300 font-medium mb-1.5">Precise Location *</label>
                        <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                            placeholder="Address, Sector, or Landmark"
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all text-sm" />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-300 font-medium mb-1.5">Details & Description *</label>
                        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                            placeholder="Provide details for emergency responders..." rows={4}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all text-sm resize-none" />
                    </div>

                    <button type="submit" disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 px-4 rounded-xl transition-colors shadow-[0_0_20px_rgba(239,68,68,0.3)] disabled:opacity-50">
                        {loading ? 'Submitting Alert...' : '🚨 Broadcast Emergency Alert'}
                    </button>
                </form>
            </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <label className="block text-sm text-gray-300 font-medium mb-2">Upload Photo Evidence</label>
            <div {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 h-[300px] flex flex-col justify-center
                ${isDragActive ? 'border-red-500 bg-red-500/10' : 'border-white/10 hover:border-red-500/50 hover:bg-white/2'}`}>
                <input {...getInputProps()} />
                {preview ? (
                <div className="space-y-4">
                    <motion.img initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    src={preview} alt="Preview" className="max-h-52 mx-auto rounded-xl object-cover shadow-lg" />
                    <p className="text-gray-500 text-xs">Click or drag to replace image</p>
                </div>
                ) : (
                <div>
                    <div className="text-5xl mb-4 opacity-50">📸</div>
                    <p className="text-white font-medium mb-2">Drop photo of the emergency here</p>
                    <p className="text-gray-500 text-sm">Clear visuals help authorities respond faster</p>
                </div>
                )}
            </div>

            <div className="mt-6 p-5 rounded-2xl bg-orange-500/10 border border-orange-500/20">
                <h3 className="font-semibold text-orange-400 mb-2 flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    Safety Warning
                </h3>
                <p className="text-sm text-orange-400/80 leading-relaxed">
                    Prioritize your safety above all else. Do not put yourself in danger to capture a photo or submit this report. Only report if you are in a safe location.
                </p>
            </div>
        </motion.div>
      </div>
    </div>
  );
}
