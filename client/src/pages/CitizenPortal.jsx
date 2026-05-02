import React, { useState } from 'react';
import IssueForm from '../components/CitizenPortal/IssueForm';
import MapViewer from '../components/CitizenPortal/MapViewer';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

const CitizenPortal = () => {
  const [userLocation, setUserLocation] = useState(null);

  const handleLocationFetch = (coords) => {
    setUserLocation(coords);
  };

  const handleFormReset = () => {
    setUserLocation(null);
  };

  return (
    <>
      <header className="header">
        <div className="nav-links">
          <Link to="/authority" className="nav-link">Authority Login</Link>
        </div>
        <h1>LokLink Portal</h1>
        <p>Report civic issues directly to the authorities and track community progress in real-time.</p>
      </header>
      
      <main className="portal-container">
        <div className="grid-layout">
          <div className="card">
            <h2 className="card-title">
              <AlertCircle className="icon" />
              Report an Issue
            </h2>
            <IssueForm onLocationFetch={handleLocationFetch} onReset={handleFormReset} />
          </div>
          
          <div className="card">
            <h2 className="card-title">City Issues Map</h2>
            <MapViewer userLocation={userLocation} />
          </div>
        </div>
      </main>
    </>
  );
};

export default CitizenPortal;
