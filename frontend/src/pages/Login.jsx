import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Anchor, Key, Users, Activity } from 'lucide-react';
import API_BASE from '../api';

const Login = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('inspector');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);

  const handleInitialLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (username && password) {
      try {
        const response = await fetch(`${API_BASE}/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password, role })
        });
        const data = await response.json();
        if (response.ok) {
          setUserData(data.user);
          if (data.user.two_fa_enabled) {
            setStep(2);
          } else {
            finalizeLogin(data.user);
          }
        } else {
          setError(data.message || 'Login failed.');
        }
      } catch (err) {
        setError('Server error. Backend might be down.');
      }
    } else {
      setError('Please enter both username and password.');
    }
  };

  const handle2FA = (e) => {
    e.preventDefault();
    if (token.length === 6) {
      finalizeLogin(userData);
    } else {
      setError('Invalid 2FA token. Must be 6 digits.');
    }
  };

  const finalizeLogin = (user) => {
    localStorage.setItem('userRole', user.role);
    localStorage.setItem('userEmail', user.email);
    localStorage.setItem('userName', user.username);
    if (user.role === 'system_admin') navigate('/admin');
    else if (user.role === 'port_authority') navigate('/port-authority');
    else navigate('/dashboard');
  };

  const roleBtn = (value, label, Icon) => (
    <button
      type="button"
      onClick={() => setRole(value)}
      style={{
        flex: 1,
        padding: '0.75rem 0.5rem',
        background: role === value ? 'rgba(14, 165, 233, 0.1)' : 'var(--bg-input)',
        border: `1px solid ${role === value ? 'var(--primary)' : 'transparent'}`,
        borderRadius: '0.5rem',
        color: role === value ? 'var(--primary)' : 'var(--text-muted)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
        cursor: 'pointer', transition: 'all 0.2s'
      }}
    >
      <Icon size={20} />
      <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>{label}</span>
    </button>
  );

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(circle at top, #1e293b 0%, #0f172a 100%)'
    }}>
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px', position: 'relative', overflow: 'hidden' }}>
        {/* Glow decorations */}
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'var(--primary)', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.25, zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '150px', height: '150px', background: 'var(--info)', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.15, zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '64px', height: '64px', background: 'var(--bg-dark)', borderRadius: '1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem auto', border: '1px solid var(--border-color)',
            boxShadow: '0 0 20px rgba(14,165,233,0.2)'
          }}>
            <Anchor color="var(--primary)" size={32} />
          </div>
          <h2>NMPA Secure Access</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Smart Cargo Inspection System
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem', textAlign: 'center', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleInitialLogin} style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {roleBtn('inspector', 'Inspector', ShieldCheck)}
              {roleBtn('port_authority', 'Port Authority', Activity)}
              {roleBtn('system_admin', 'Sys Admin', Users)}
            </div>

            <div className="input-group">
              <label>Username</label>
              <input type="text" className="input-field" placeholder="e.g. sysadmin / auth1 / inspector1"
                value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="input-group" style={{ marginBottom: '2rem' }}>
              <label>Password</label>
              <input type="password" className="input-field" placeholder="Default: pass"
                value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary btn-full">Login →</button>
          </form>
        ) : (
          <form onSubmit={handle2FA} className="animate-fade-in" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(16,185,129,0.1)', borderRadius: '50%', marginBottom: '1rem' }}>
                <Key color="var(--success)" size={32} />
              </div>
              <h3 style={{ marginBottom: '0.5rem' }}>Two-Factor Authentication</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Enter the 6-digit code from your Google Authenticator app.</p>
            </div>
            <div className="input-group" style={{ marginBottom: '2rem' }}>
              <input type="text" className="input-field" placeholder="000000"
                style={{ textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.5rem', fontWeight: 'bold' }}
                maxLength={6} value={token} onChange={(e) => setToken(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary btn-full" style={{ marginBottom: '1rem' }}>Verify & Login</button>
            <button type="button" className="btn btn-secondary btn-full" onClick={() => { setStep(1); setError(''); }}>← Back</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
