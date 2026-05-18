import React, { useState, useEffect } from 'react';
import { Package, FileText, CheckCircle, AlertTriangle, AlertOctagon, Upload, Activity, XCircle } from 'lucide-react';

const Dashboard = () => {
  const [formData, setFormData] = useState({
    billOfLading: '',
    originPort: '',
    cargoType: 'general',
    weight: '',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8ed7c80a30?w=400' // Mock Image
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [history, setHistory] = useState([]);

  const userEmail = localStorage.getItem('userEmail');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/inspections?inspectorEmail=${userEmail}`);
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (error) {
      console.error('Failed to fetch history', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, inspectorEmail: userEmail })
      });
      
      if(response.ok) {
        setFormData({ billOfLading: '', originPort: '', cargoType: 'general', weight: '', imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8ed7c80a30?w=400' });
        fetchHistory(); // Refresh history
      }
    } catch (error) {
      console.error('Error evaluating cargo', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusUI = (status) => {
    switch(status) {
      case 'Approved': return { icon: <CheckCircle size={20} color="var(--success)" />, color: 'var(--success)' };
      case 'Rejected': return { icon: <XCircle size={20} color="var(--danger)" />, color: 'var(--danger)' };
      default: return { icon: <Activity size={20} color="var(--warning)" />, color: 'var(--warning)' };
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Inspector Terminal</h1>
          <p style={{ color: 'var(--text-muted)' }}>Submit cargo for AI evaluation and Port Authority approval.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* Form Section */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} color="var(--primary)" />
            New Cargo Submission
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Bill of Lading (BoL) Number</label>
              <input type="text" name="billOfLading" className="input-field" value={formData.billOfLading} onChange={handleChange} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label>Origin Port</label>
                <input type="text" name="originPort" className="input-field" value={formData.originPort} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Cargo Type</label>
                <select name="cargoType" className="input-field" value={formData.cargoType} onChange={handleChange} style={{ appearance: 'none' }}>
                  <option value="general">General Cargo</option>
                  <option value="container">Containerized</option>
                  <option value="hazardous">Hazardous Materials</option>
                  <option value="perishable">Perishable Goods</option>
                </select>
              </div>
            </div>
            <div className="input-group">
              <label>Total Weight (Tons)</label>
              <input type="number" name="weight" className="input-field" value={formData.weight} onChange={handleChange} required />
            </div>
            
            <div className="input-group" style={{ marginBottom: '2rem' }}>
              <label>Attach Site Cargo Image</label>
              <div style={{ 
                border: '2px dashed var(--border-color)', borderRadius: '0.5rem', padding: '1.5rem', textAlign: 'center',
                background: 'rgba(51, 65, 85, 0.5)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center'
              }}>
                <Upload size={24} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Image auto-attached for demo purposes</p>
                <img src={formData.imageUrl} alt="preview" style={{width: '100px', borderRadius: '4px', marginTop: '1rem'}} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={isSubmitting}>
              {isSubmitting ? 'Evaluating...' : 'Submit to Port Authority'}
            </button>
          </form>
        </div>

        {/* My Submissions Status */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={20} color="var(--primary)" />
            My Submissions Status
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, overflowY: 'auto' }}>
            {history.map(item => (
              <div key={item.id} style={{ 
                padding: '1rem', background: 'var(--bg-dark)', borderRadius: '0.5rem',
                borderLeft: `3px solid ${getStatusUI(item.status).color}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.bill_of_lading}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.cargo_type} • {item.weight}T</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {getStatusUI(item.status).icon}
                    <span style={{ color: getStatusUI(item.status).color, fontWeight: 500 }}>{item.status}</span>
                  </div>
                </div>
                
                {item.status === 'Rejected' && (
                  <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.25rem', fontSize: '0.875rem' }}>
                    <strong style={{color: 'var(--danger)'}}>Port Authority Notes:</strong> {item.notes}
                  </div>
                )}
                {item.status === 'Approved' && item.notes && (
                  <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.25rem', fontSize: '0.875rem' }}>
                    <strong style={{color: 'var(--success)'}}>Notes:</strong> {item.notes}
                  </div>
                )}
                
                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>AI Risk Assessment: <span className={`badge badge-${item.risk_level.toLowerCase()}`}>{item.risk_level}</span></span>
                  <span>{new Date(item.date).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
            {history.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem' }}>
                You have not submitted any cargo yet.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
