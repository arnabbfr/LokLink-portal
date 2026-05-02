import React, { useState } from 'react';
import api from '../../api';

const DashboardStats = ({ issues, onClearResolved }) => {
  const [clearing, setClearing] = useState(false);

  const total = issues.length;
  const pending = issues.filter(i => i.status === 'pending').length;
  const inProgress = issues.filter(i => i.status === 'in-progress').length;
  const resolved = issues.filter(i => i.status === 'resolved').length;

  const handleClear = async () => {
    if (!window.confirm('Are you sure you want to archive and remove all resolved issues?')) return;
    setClearing(true);
    try {
      await api.post('/issues/clear-resolved');
      onClearResolved();
    } catch (error) {
      alert('Failed to clear resolved issues');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div>
      <div className="stats-dashboard">
        <div className="stat-card">
          <div className="stat-value">{total}</div>
          <div className="stat-label">Total Issues</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-value" style={{ color: '#e74c3c' }}>{pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card in-progress">
          <div className="stat-value" style={{ color: '#f2a516' }}>{inProgress}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card resolved">
          <div className="stat-value" style={{ color: '#27ae60' }}>{resolved}</div>
          <div className="stat-label">Resolved</div>
        </div>
      </div>
      
      {resolved > 0 && (
        <div style={{ textAlign: 'right', marginBottom: '20px' }}>
          <button className="btn btn-danger" onClick={handleClear} disabled={clearing}>
            {clearing ? 'Clearing...' : 'Archive Resolved Issues'}
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardStats;
