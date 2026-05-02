import React from 'react';

const DepartmentManagement = ({ departments, issues }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
      {departments.map(dept => {
        const deptIssues = issues.filter(i => i.department === dept.id);
        const pending = deptIssues.filter(i => i.status !== 'resolved').length;
        
        return (
          <div key={dept.id} className="list-item" style={{ borderLeft: '4px solid var(--secondary-color)' }}>
            <h3 style={{ marginBottom: '10px', color: 'var(--secondary-color)' }}>{dept.name}</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: '0.9rem', marginBottom: '15px' }}>
              <span>Total Assigned: <strong>{deptIssues.length}</strong></span>
              <span>Active: <strong style={{ color: 'var(--primary-dark)' }}>{pending}</strong></span>
            </div>
            
            <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '6px', fontSize: '0.85rem' }}>
              <div style={{ fontWeight: '600', marginBottom: '5px' }}>Recent Active Issues:</div>
              {deptIssues.filter(i => i.status !== 'resolved').slice(0, 3).map(i => (
                <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
                  <span>{i.id}</span>
                  <span style={{ color: 'var(--primary-dark)' }}>{i.priority}</span>
                </div>
              ))}
              {pending === 0 && <span style={{ color: '#888' }}>No active issues</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DepartmentManagement;
