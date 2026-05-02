import React, { useState } from 'react';
import api from '../../api';

const IssueManagement = ({ issues, departments, onUpdate }) => {
  const [filter, setFilter] = useState('all');
  
  const filteredIssues = filter === 'all' ? issues : issues.filter(i => i.status === filter);

  const handleAssign = async (issueId, deptId) => {
    if (!deptId) return;
    try {
      const dept = departments.find(d => d.id === deptId);
      await api.post(`/issues/${issueId}/assign`, { 
        department: dept.id, 
        assignedTo: dept.name 
      });
      onUpdate();
    } catch (error) {
      alert('Assignment failed');
    }
  };

  const handleStatusUpdate = async (issueId, status) => {
    try {
      await api.patch(`/issues/${issueId}/status`, { status });
      onUpdate();
    } catch (error) {
      alert('Status update failed');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '15px' }}>
        <select 
          style={{ width: '200px' }} 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Issues</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <div style={{ display: 'grid', gap: '15px' }}>
        {filteredIssues.map(issue => (
          <div key={issue.id} className="list-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div style={{ flex: '1 1 300px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold' }}>{issue.id}</span>
                <span className={`status-badge status-${issue.status}`}>{issue.status.replace('-', ' ')}</span>
                <span style={{ fontSize: '0.85rem', color: '#666', textTransform: 'uppercase' }}>{issue.priority} Priority</span>
              </div>
              <h4 style={{ margin: '0 0 5px 0' }}>{issue.title || issue.type}</h4>
              <p style={{ fontSize: '0.9rem', color: '#555', margin: '0' }}>{issue.location}</p>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {issue.status === 'pending' && (
                <select 
                  onChange={(e) => handleAssign(issue.id, e.target.value)}
                  defaultValue=""
                  style={{ width: 'auto', padding: '0.5rem' }}
                >
                  <option value="" disabled>Assign Dept...</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              )}
              
              {issue.status === 'in-progress' && (
                <button className="btn btn-success" onClick={() => handleStatusUpdate(issue.id, 'resolved')}>
                  Mark Resolved
                </button>
              )}
            </div>
          </div>
        ))}
        {filteredIssues.length === 0 && (
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No issues found.</div>
        )}
      </div>
    </div>
  );
};

export default IssueManagement;
