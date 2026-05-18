import React, { useState, useEffect } from 'react';
import API_BASE from '../api';
import { Database, Users, ShieldAlert, CheckCircle, XCircle, Mail, Key } from 'lucide-react';

const SystemAdmin = () => {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [inspections, setInspections] = useState([]);

  useEffect(() => {
    fetchLogs();
    fetchUsers();
    fetchInspections();
  }, []);

  const fetchLogs = async () => {
    const res = await fetch(`${API_BASE}/api/logs`);
    if(res.ok) setLogs(await res.json());
  };

  const fetchUsers = async () => {
    const res = await fetch(`${API_BASE}/api/users`);
    if(res.ok) setUsers(await res.json());
  };

  const fetchInspections = async () => {
    const res = await fetch(`${API_BASE}/api/inspections`);
    if(res.ok) setInspections(await res.json());
  };

  const handleApproveUser = async (id) => {
    await fetch(`${API_BASE}/api/users`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'approve' })
    });
    fetchUsers();
    fetchLogs();
  };

  const handleToggle2FA = async (id) => {
    await fetch(`${API_BASE}/api/users`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'toggle_2fa' })
    });
    fetchUsers();
    fetchLogs();
  };

  const handleDeleteUser = async (id) => {
    await fetch(`${API_BASE}/api/users?id=${id}`, { method: 'DELETE' });
    fetchUsers();
    fetchLogs();
  };

  const highRiskCount = inspections.filter(i => i.risk_level === 'High').length;
  const approvedCount = inspections.filter(i => i.status === 'Approved').length;
  const rejectedCount = inspections.filter(i => i.status === 'Rejected').length;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>System Administration</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage users, view audit logs, and oversee system health.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <CheckCircle size={24} color="var(--success)" />
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{approvedCount}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Approved</div>
            </div>
          </div>
          <div className="card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <XCircle size={24} color="var(--danger)" />
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{rejectedCount}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rejected</div>
            </div>
          </div>
          <div className="card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <ShieldAlert size={24} color="var(--danger)" />
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{highRiskCount}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>High Risk</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        {/* User Management */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} color="var(--primary)" />
            User Management & Authorization
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '1rem 0' }}>Username</th>
                <th style={{ padding: '1rem 0' }}>Role</th>
                <th style={{ padding: '1rem 0' }}>Status</th>
                <th style={{ padding: '1rem 0' }}>2FA</th>
                <th style={{ padding: '1rem 0', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem 0' }}>
                    {u.username} <br/><span style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>{u.email}</span>
                  </td>
                  <td style={{ padding: '1rem 0', textTransform: 'capitalize' }}>{u.role.replace('_', ' ')}</td>
                  <td style={{ padding: '1rem 0' }}>
                    {u.is_approved ? <span className="badge badge-low">Approved</span> : <span className="badge badge-high">Pending</span>}
                  </td>
                  <td style={{ padding: '1rem 0' }}>
                    {u.two_fa_enabled ? <span style={{color:'var(--success)'}}>Enabled</span> : <span style={{color:'var(--danger)'}}>Disabled</span>}
                  </td>
                  <td style={{ padding: '1rem 0', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      {!u.is_approved && (
                        <button onClick={() => handleApproveUser(u.id)} className="btn btn-primary" style={{padding:'0.25rem 0.5rem', fontSize:'0.75rem'}}>Approve</button>
                      )}
                      <button onClick={() => handleToggle2FA(u.id)} className="btn btn-secondary" style={{padding:'0.25rem 0.5rem', fontSize:'0.75rem'}}>Toggle 2FA</button>
                      {u.role !== 'system_admin' && (
                        <button onClick={() => handleDeleteUser(u.id)} className="btn btn-secondary" style={{padding:'0.25rem 0.5rem', fontSize:'0.75rem', color:'var(--danger)', borderColor:'var(--danger)'}}>Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Audit Logs */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={20} color="var(--primary)" />
            System Audit Logs
          </h3>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '1rem 0' }}>Time</th>
                  <th style={{ padding: '1rem 0' }}>Action</th>
                  <th style={{ padding: '1rem 0' }}>Role</th>
                  <th style={{ padding: '1rem 0' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem 0', fontSize: '0.875rem' }}>{log.date}</td>
                    <td style={{ padding: '0.75rem 0', fontWeight: 500 }}>{log.action}</td>
                    <td style={{ padding: '0.75rem 0', textTransform: 'capitalize' }}>{log.role.replace('_', ' ')}</td>
                    <td style={{ padding: '0.75rem 0', color: 'var(--text-muted)' }}>{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemAdmin;
