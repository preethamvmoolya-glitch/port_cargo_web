import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SystemAdmin from './pages/SystemAdmin';
import PortAuthority from './pages/PortAuthority';
import Navbar from './components/Navbar';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const userRole = localStorage.getItem('userRole');
  if (!userRole) return <Navigate to="/" />;
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    if (userRole === 'system_admin') return <Navigate to="/admin" />;
    if (userRole === 'port_authority') return <Navigate to="/port-authority" />;
    return <Navigate to="/dashboard" />;
  }
  return (
    <>
      <Navbar />
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {children}
      </div>
    </>
  );
};

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['inspector']}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/port-authority" 
            element={
              <ProtectedRoute allowedRoles={['port_authority']}>
                <PortAuthority />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['system_admin']}>
                <SystemAdmin />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
