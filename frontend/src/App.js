import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ReportIssue from './pages/ReportIssue';
import MapView from './pages/MapView';
import ComplaintTracking from './pages/ComplaintTracking';
import Dashboard from './pages/Dashboard';
import DisasterAlerts from './pages/DisasterAlerts';
import DisasterReport from './pages/DisasterReport';
import 'leaflet/dist/leaflet.css';
import './index.css';

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

function AppRoutes() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#111120',
            color: '#f1f5f9',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '12px',
            fontSize: '13px',
            fontFamily: 'Inter, sans-serif',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#111120' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#111120' } },
        }}
      />
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="map"    element={<MapView />} />
          <Route path="alerts" element={<DisasterAlerts />} />
          <Route path="report-disaster" element={<DisasterReport />} />
          <Route path="report" element={<ProtectedRoute><ReportIssue /></ProtectedRoute>} />
          <Route path="tracking" element={<ProtectedRoute><ComplaintTracking /></ProtectedRoute>} />
          <Route path="dashboard" element={<ProtectedRoute roles={['authority','admin']}><Dashboard /></ProtectedRoute>} />
        </Route>
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
