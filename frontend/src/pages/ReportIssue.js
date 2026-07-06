import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import AIResultCard from '../components/AIResultCard';

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ISSUE_TYPES = [
  { value: 'pothole', label: 'Pothole', icon: '🕳️', color: '#f59e0b' },
  { value: 'garbage', label: 'Garbage Dump', icon: '🗑️', color: '#10b981' },
  { value: 'water_leakage', label: 'Water Leakage', icon: '💧', color: '#3b82f6' },
  { value: 'broken_streetlight', label: 'Broken Streetlight', icon: '💡', color: '#f97316' },
  { value: 'other', label: 'Other', icon: '⚠️', color: '#8b5cf6' },
];

function LocationPicker({ position, setPosition }) {
  useMapEvents({
    click(e) { setPosition([e.latlng.lat, e.latlng.lng]); }
  });
  return position ? <Marker position={position} /> : null;
}

const AI_LABELS = ['Analyzing image...', 'Detecting issue type...', 'Checking authenticity...', 'Scanning for duplicates...'];

export default function ReportIssue() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ issueType: '', description: '', address: '' });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiStep, setAiStep] = useState(0);
  const [aiResult, setAiResult] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);

  const onDrop = useCallback(async files => {
    const file = files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));

    setAiStep(0);
    setAiResult(null);

    // Simulate loading steps for visual feedback
    const numSteps = AI_LABELS.length;
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < numSteps) {
        setAiStep(currentStep);
      }
    }, 500);

    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await api.post('/ai/predict', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      clearInterval(interval);
      setAiStep(numSteps - 1);
      setAiResult(res.data);
      if (res.data.detectedClass) {
        let detected = res.data.detectedClass;
        // Normalize Roboflow plural classes to match UI
        if (detected === 'potholes') detected = 'pothole';
        
        setForm(f => ({ ...f, issueType: detected }));
        
        // Auto-advance to Issue Details step after brief delay to show success
        setTimeout(() => {
          setStep(2);
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      toast.error('AI matching failed. Please select issue type manually.');
      clearInterval(interval);
      setAiStep(-1);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, maxFiles: 1
  });

  const detectLocation = () => {
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setGeoLoading(false);
        toast.success('Location detected!');
      },
      () => { setGeoLoading(false); toast.error('Could not detect location'); }
    );
  };

  const handleSubmit = async () => {
    if (!form.issueType || !form.description || !position) {
      toast.error('Please fill all required fields and select location');
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('issueType', form.issueType);
      fd.append('description', form.description);
      fd.append('latitude', position[0]);
      fd.append('longitude', position[1]);
      fd.append('address', form.address);
      if (image) fd.append('image', image);

      await api.post('/complaints', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Issue reported successfully!');
      navigate('/tracking');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  const defaultCenter = position || [11.0168, 76.9558];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-white">Report an Issue</h1>
        <p className="text-gray-400 text-sm mt-1">AI-powered issue detection and geolocation</p>
      </motion.div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-8">
        {['Upload Photo', 'Issue Details', 'Location', 'Review'].map((s, i) => (
          <React.Fragment key={s}>
            <motion.div whileHover={{ scale: 1.05 }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all
                ${step === i + 1 ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40' :
                  step > i + 1 ? 'bg-green-600/20 text-green-400' : 'text-gray-500'}`}
              onClick={() => step > i + 1 && setStep(i + 1)}>
              <span>{step > i + 1 ? '✓' : i + 1}</span>
              <span className="hidden sm:inline">{s}</span>
            </motion.div>
            {i < 3 && <div className={`flex-1 h-px ${step > i + 1 ? 'bg-green-500/40' : 'bg-white/10'}`} />}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Image Upload */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300
                ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 hover:border-blue-500/50 hover:bg-white/2'}`}>
              <input {...getInputProps()} />
              {preview ? (
                <div className="space-y-4">
                  <motion.img initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    src={preview} alt="Preview" className="max-h-64 mx-auto rounded-xl object-cover shadow-lg" />
                  {aiResult ? (
                    <AIResultCard aiResult={aiResult} />
                  ) : aiStep >= 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2 text-blue-400 text-sm">
                        <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="inline-block w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full" />
                        {AI_LABELS[aiStep]}
                      </div>
                      <div className="w-48 h-1 bg-white/10 rounded-full mx-auto overflow-hidden">
                        <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ duration: 1, repeat: Infinity }}
                          className="h-full w-1/2 bg-blue-500 rounded-full" />
                      </div>
                    </div>
                  ) : null}
                  <p className="text-gray-500 text-xs">Click or drag to replace image</p>
                </div>
              ) : (
                <div>
                  <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }}
                    className="text-6xl mb-4">📸</motion.div>
                  <p className="text-white font-medium mb-2">Drop your photo here</p>
                  <p className="text-gray-500 text-sm">or click to browse • JPG, PNG, WebP • Max 10MB</p>
                  <p className="text-blue-400 text-xs mt-3">🤖 AI will automatically detect the issue type</p>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-4">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setStep(2)}
                className="btn-primary px-6 py-2.5 rounded-xl text-white font-medium text-sm">
                Next: Issue Details →
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Issue Details */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm text-gray-400">Issue Type</label>
                {aiResult && aiResult.detectedClass && form.issueType === aiResult.detectedClass && (
                    <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} 
                      className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded border border-green-500/40 flex items-center gap-1">
                      ✨ AI Auto-selected
                    </motion.span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ISSUE_TYPES.map(type => (
                  <motion.button key={type.value} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setForm({ ...form, issueType: type.value })}
                    className={`p-3 rounded-xl border text-left transition-all
                      ${form.issueType === type.value
                        ? 'border-blue-500/60 bg-blue-500/15'
                        : 'border-white/10 hover:border-white/20 glass'}`}>
                    <span className="text-2xl block mb-1">{type.icon}</span>
                    <span className="text-sm text-white font-medium">{type.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Description *</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the issue in detail..."
                rows={4}
                className="glow-input w-full px-4 py-3 rounded-xl text-white placeholder-gray-600 text-sm resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="px-6 py-2.5 rounded-xl text-gray-400 glass border border-white/10 text-sm">← Back</button>
              <motion.button whileHover={{ scale: 1.02 }} onClick={() => setStep(3)}
                className="btn-primary px-6 py-2.5 rounded-xl text-white font-medium text-sm flex-1">
                Next: Set Location →
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Location */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Click on the map to set location or use GPS</p>
                {position && <p className="text-xs text-green-400 mt-1">📍 {position[0].toFixed(4)}, {position[1].toFixed(4)}</p>}
              </div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={detectLocation} disabled={geoLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium glass border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-all">
                {geoLoading ? '⏳' : '📍'} {geoLoading ? 'Detecting...' : 'Use GPS'}
              </motion.button>
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ height: 350, border: '1px solid rgba(59,130,246,0.2)' }}>
              <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" attribution="&copy; Google" />
                <LocationPicker position={position} setPosition={setPosition} />
              </MapContainer>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Address (optional)</label>
              <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                placeholder="Street address or landmark"
                className="glow-input w-full px-4 py-3 rounded-xl text-white placeholder-gray-600 text-sm" />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="px-6 py-2.5 rounded-xl text-gray-400 glass border border-white/10 text-sm">← Back</button>
              <motion.button whileHover={{ scale: 1.02 }} onClick={() => setStep(4)}
                className="btn-primary px-6 py-2.5 rounded-xl text-white font-medium text-sm flex-1">
                Next: Review →
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-4">
            <div className="glass rounded-2xl p-6 space-y-4">
              <h3 className="text-white font-semibold">Review Your Report</h3>
              {preview && <img src={preview} alt="Issue" className="w-full max-h-48 object-cover rounded-xl" />}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Issue Type</p>
                  <p className="text-white capitalize mt-1">{form.issueType?.replace('_', ' ') || 'Not selected'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Location</p>
                  <p className="text-white mt-1">{position ? `${position[0].toFixed(4)}, ${position[1].toFixed(4)}` : 'Not set'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Description</p>
                  <p className="text-white mt-1">{form.description || 'No description'}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className="px-6 py-2.5 rounded-xl text-gray-400 glass border border-white/10 text-sm">← Back</button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleSubmit} disabled={loading}
                className="btn-primary px-6 py-2.5 rounded-xl text-white font-semibold text-sm flex-1 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                    Submitting...
                  </>
                ) : '🚀 Submit Report'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
