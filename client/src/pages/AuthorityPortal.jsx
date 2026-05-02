import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardStats from '../components/AuthorityPortal/DashboardStats';
import IssueManagement from '../components/AuthorityPortal/IssueManagement';
import DepartmentManagement from '../components/AuthorityPortal/DepartmentManagement';
import api from '../api';

const AuthorityPortal = () => {
  const [issues, setIssues] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [issuesRes, deptRes] = await Promise.all([
        api.get('/issues'),
        api.get('/departments')
      ]);
      setIssues(issuesRes.data);
      setDepartments(deptRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleIssueUpdate = () => {
    fetchData(); // Refresh data when an issue is updated
  };

  if (loading) {
    return <div style={{textAlign: 'center', padding: '50px'}}>Loading Authority Portal...</div>;
  }

  return (
    <>
      <header className="header" style={{background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)'}}>
        <div className="nav-links">
          <Link to="/" className="nav-link">Citizen Portal</Link>
        </div>
        <h1>Authority Dashboard</h1>
        <p>Manage and resolve reported civic issues efficiently.</p>
      </header>

      <main className="portal-container">
        <DashboardStats issues={issues} onClearResolved={fetchData} />
        
        <div className="grid-layout" style={{marginTop: '2rem'}}>
          <div className="card" style={{gridColumn: '1 / -1'}}>
             <h2 className="card-title">Issues Management</h2>
             <IssueManagement issues={issues} departments={departments} onUpdate={handleIssueUpdate} />
          </div>

          <div className="card" style={{gridColumn: '1 / -1'}}>
             <h2 className="card-title">Department Assignments</h2>
             <DepartmentManagement departments={departments} issues={issues} onUpdate={handleIssueUpdate} />
          </div>
        </div>
      </main>
    </>
  );
};

export default AuthorityPortal;
