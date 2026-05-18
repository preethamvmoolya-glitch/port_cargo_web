import React, { useState, useEffect } from 'react';
import { ShieldCheck, XCircle, AlertTriangle, Activity, Package, CheckCircle, Database, ShieldAlert } from 'lucide-react';

const PortAuthority = () => {
  const [inspections, setInspections] = useState([]);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchInspections();
  }, []);

  const fetchInspections = async () => {
    const res = await fetch('http://localhost:5000/api/inspections');
    if (res.ok) setInspections(await res.json());
  };

  const handleReview = async (status) => {
    if (!selectedInspection) return;
    
    await fetch('http://localhost:5000/api/inspections/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selectedInspection.id, status, notes })
    });
    
    setSelectedInspection(null);
    setNotes('');
    fetchInspections();
  };

  const pending = inspections.filter(i => i.status === 'Pending');
  const highRiskCount = inspections.filter(i => i.risk_level === 'High').length;
  const approvedCount = inspections.filter(i => i.status === 'Approved').length;
  const rejectedCount = inspections.filter(i => i.status === 'Rejected').length;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Port Authority Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Validate cargo documents and approve/reject inspector submissions.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <CheckCircle size={24} color="var(--success)" />
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{approvedCount}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Approved</div>
            </div>
          </div>
          <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <XCircle size={24} color="var(--danger)" />
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{rejectedCount}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rejected</div>
            </div>
          </div>
          <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <ShieldAlert size={24} color="var(--warning)" />
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{highRiskCount}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>High Risk Alert</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* Pending Approvals List */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} color="var(--primary)" />
            Pending Validations ({pending.length})
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pending.map(item => (
              <div 
                key={item.id} 
                onClick={() => setSelectedInspection(item)}
                style={{ 
                  padding: '1rem', background: selectedInspection?.id === item.id ? 'rgba(14, 165, 233, 0.1)' : 'var(--bg-dark)', 
                  borderRadius: '0.5rem', cursor: 'pointer', border: `1px solid ${selectedInspection?.id === item.id ? 'var(--primary)' : 'transparent'}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <strong>{item.bill_of_lading}</strong>
                  <span className={`badge badge-${item.risk_level.toLowerCase()}`}>{item.risk_level} Risk</span>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Inspector: {item.inspector_email} <br/>
                  Cargo: {item.cargo_type} | Weight: {item.weight}T | From: {item.origin_port}
                </div>
              </div>
            ))}
            {pending.length === 0 && <p style={{color:'var(--text-muted)'}}>No pending inspections.</p>}
          </div>
        </div>

        {/* Review Panel */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={20} color="var(--primary)" />
            Review & Decision
          </h3>
          
          {selectedInspection ? (
            <div className="animate-fade-in">
              <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-dark)', borderRadius: '0.5rem' }}>
                <h4 style={{ marginBottom: '1rem' }}>Inspection Details #{selectedInspection.id}</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
                  <div><span style={{color:'var(--text-muted)'}}>Bill of Lading:</span> <br/>{selectedInspection.bill_of_lading}</div>
                  <div><span style={{color:'var(--text-muted)'}}>Origin Port:</span> <br/>{selectedInspection.origin_port}</div>
                  <div><span style={{color:'var(--text-muted)'}}>Cargo Type:</span> <br/>{selectedInspection.cargo_type}</div>
                  <div><span style={{color:'var(--text-muted)'}}>Total Weight:</span> <br/>{selectedInspection.weight} Tons</div>
                  <div><span style={{color:'var(--text-muted)'}}>AI Risk Level:</span> <br/>
                    <span className={`badge badge-${selectedInspection.risk_level.toLowerCase()}`}>{selectedInspection.risk_level}</span>
                  </div>
                </div>
                
                {selectedInspection.image_url && (
                  <div style={{ marginTop: '1rem' }}>
                    <span style={{color:'var(--text-muted)', fontSize: '0.875rem'}}>Site Image provided by Inspector:</span>
                    <img src={selectedInspection.image_url} alt="Cargo" style={{ width: '100%', borderRadius: '0.5rem', marginTop: '0.5rem' }} />
                  </div>
                )}
              </div>

              <div className="input-group">
                <label>Feedback Notes for Inspector (Will be emailed)</label>
                <textarea 
                  className="input-field" 
                  rows="4" 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="E.g., Discrepancy in weight, please re-weigh and attach new photo..."
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => handleReview('Approved')} className="btn btn-primary" style={{ flex: 1, backgroundColor: 'var(--success)' }}>
                  Approve Cargo
                </button>
                <button onClick={() => handleReview('Rejected')} className="btn btn-primary" style={{ flex: 1, backgroundColor: 'var(--danger)' }}>
                  Reject Cargo
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
              <Package size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
              <p>Select a pending inspection from the list to review documents and provide a decision.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default PortAuthority;
