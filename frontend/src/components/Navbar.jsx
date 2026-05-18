import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Anchor, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('userRole');

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    navigate('/');
  };

  return (
    <nav style={{
      background: 'var(--bg-panel)',
      borderBottom: '1px solid var(--border-color)',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          background: 'rgba(14, 165, 233, 0.1)',
          padding: '0.5rem',
          borderRadius: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Anchor color="var(--primary)" size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>NMPA Port Authority</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Smart Cargo Inspection</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={18} color="var(--text-muted)" />
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
            {role} Access
          </span>
        </div>
        <button 
          onClick={handleLogout}
          className="btn btn-secondary"
          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
