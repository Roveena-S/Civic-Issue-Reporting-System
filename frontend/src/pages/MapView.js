import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';
import api from '../utils/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const COLORS = { pothole: '#f59e0b', garbage: '#10b981', water_leakage: '#3b82f6', broken_streetlight: '#f97316', other: '#8b5cf6' };
const ICONS = { pothole: '🕳️', garbage: '🗑️', water_leakage: '💧', broken_streetlight: '💡', other: '⚠️' };
const STATUS_COLORS = { reported: '#f59e0b', verified: '#3b82f6', in_progress: '#8b5cf6', resolved: '#10b981', rejected: '#ef4444' };

const createCustomIcon = (type, status) => L.divIcon({
  html: `<div style="
    width:36px;height:36px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);
    background:${COLORS[type] || '#8b5cf6'};
    border:2px solid white;
    box-shadow:0 2px 8px rgba(0,0,0,0.4);
    display:flex;align-items:center;justify-content:center;
  "><span style="transform:rotate(45deg);font-size:16px">${ICONS[type] || '⚠️'}</span></div>`,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36]
});

function HeatmapLayer({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    // Simple circle overlay as heatmap simulation
    const circles = points.map(p => L.circle([p.latitude, p.longitude], {
      radius: 200,
      fillColor: p.upvotes > 5 ? '#ef4444' : p.upvotes > 2 ? '#f97316' : '#3b82f6',
      fillOpacity: 0.15,
      stroke: false
    }).addTo(map));
    return () => circles.forEach(c => map.removeLayer(c));
  }, [map, points]);
  return null;
}

export default function MapView() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showHeatmap, setShowHeatmap] = useState(false);

  useEffect(() => {
    api.get('/complaints/map').then(r => {
      setComplaints(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? complaints : complaints.filter(c => c.issueType === filter);

  const stats = {
    total: complaints.length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    critical: complaints.filter(c => c.priority === 'critical').length,
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 glass border-b border-white/5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-white">Live Issue Map</h1>
          <p className="text-xs text-gray-500">{filtered.length} issues displayed</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Stats */}
          {[
            { label: 'Total', value: stats.total, color: '#3b82f6' },
            { label: 'Resolved', value: stats.resolved, color: '#10b981' },
            { label: 'Critical', value: stats.critical, color: '#ef4444' },
          ].map(s => (
            <div key={s.label} className="text-center px-3 py-1 rounded-lg glass">
              <p className="text-sm font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}

          {/* Heatmap toggle */}
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
              ${showHeatmap ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'glass border border-white/10 text-gray-400'}`}>
            🔥 Heatmap
          </motion.button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="px-4 py-2 glass border-b border-white/5 flex gap-2 overflow-x-auto">
        {['all', 'pothole', 'garbage', 'water_leakage', 'broken_streetlight', 'other'].map(f => (
          <motion.button key={f} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0
              ${filter === f ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40' : 'glass border border-white/10 text-gray-400'}`}>
            {f === 'all' ? '🌐 All' : `${ICONS[f]} ${f.replace('_', ' ')}`}
          </motion.button>
        ))}
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full" />
          </div>
        ) : (
          <MapContainer center={[11.0168, 76.9558]} zoom={13} style={{ height: '100%', width: '100%' }}>
            <LayersControl position="topright">
              <LayersControl.BaseLayer checked name="Google Roadmap">
                <TileLayer
                  url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                  attribution='&copy; Google'
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Dark Strategy">
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Satellite">
                <TileLayer
                  url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                  attribution='&copy; Google'
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Hybrid">
                <TileLayer
                  url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                  attribution='&copy; Google'
                />
              </LayersControl.BaseLayer>
            </LayersControl>
            {showHeatmap && <HeatmapLayer points={filtered} />}
            {filtered.map(c => (
              <Marker key={c._id} position={[c.latitude, c.longitude]} icon={createCustomIcon(c.issueType, c.status)}>
                <Popup>
                  <div style={{ background: '#1a1a35', color: '#e2e8f0', borderRadius: 12, padding: 12, minWidth: 200, border: '1px solid rgba(59,130,246,0.3)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span style={{ fontSize: 20 }}>{ICONS[c.issueType]}</span>
                      <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{c.issueType?.replace('_', ' ')}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, background: `${STATUS_COLORS[c.status]}20`, color: STATUS_COLORS[c.status], border: `1px solid ${STATUS_COLORS[c.status]}40` }}>
                        {c.status?.replace('_', ' ')}
                      </span>
                      <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, background: 'rgba(255,255,255,0.05)', color: '#9ca3af' }}>
                        👍 {c.upvotes}
                      </span>
                    </div>
                    <p style={{ fontSize: 11, color: '#6b7280' }}>{new Date(c.createdAt).toLocaleDateString()}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      {/* Legend */}
      <div className="p-3 glass border-t border-white/5 flex gap-4 overflow-x-auto">
        {Object.entries(ICONS).map(([type, icon]) => (
          <div key={type} className="flex items-center gap-1.5 flex-shrink-0">
            <div className="w-3 h-3 rounded-full" style={{ background: COLORS[type] }} />
            <span className="text-xs text-gray-400 capitalize">{type.replace('_', ' ')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
