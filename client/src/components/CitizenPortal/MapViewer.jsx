import React, { useEffect, useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';
import api from '../../api';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 26.7282,
  lng: 94.2042
};

const MapViewer = ({ userLocation }) => {
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [map, setMap] = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await api.get('/issues');
        // Filter issues that have valid coordinates
        const issuesWithCoords = res.data.filter(issue => 
          issue.coordinates && 
          typeof issue.coordinates.lat === 'number' && 
          typeof issue.coordinates.lng === 'number'
        );
        setIssues(issuesWithCoords);
      } catch (error) {
        console.error('Failed to load issues for map');
      }
    };
    fetchIssues();
  }, []);

  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#e74c3c';
      case 'in-progress': return '#f2a516';
      case 'resolved': return '#27ae60';
      default: return '#3498db';
    }
  };

  // Custom SVG Pin
  const createPinIcon = (color, isUser = false) => ({
    path: isUser 
      ? 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'
      : 'M12 2C7.582 2 4 5.582 4 10c0 5.25 8 12 8 12s8-6.75 8-12c0-4.418-3.582-8-8-8zm0 10.5A2.5 2.5 0 1 1 12 7.5a2.5 2.5 0 0 1 0 5z',
    fillColor: color,
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 2,
    scale: isUser ? 1.5 : 1.2,
    anchor: isLoaded ? new window.google.maps.Point(12, 22) : null
  });

  useEffect(() => {
    if (map && isLoaded) {
      if (userLocation) {
        // If user location is fetched, center on it
        map.panTo(userLocation);
        map.setZoom(15);
      } else if (issues.length > 0) {
        // Otherwise fit all issues
        const bounds = new window.google.maps.LatLngBounds();
        issues.forEach(issue => {
          bounds.extend({ lat: issue.coordinates.lat, lng: issue.coordinates.lng });
        });
        map.fitBounds(bounds);
      }
    }
  }, [map, issues, isLoaded, userLocation]);

  return (
    <div className="map-viewer">
      <div className="map-container" style={{ height: '400px', backgroundColor: '#f8f9fa', borderRadius: '12px', overflow: 'hidden', border: '1px solid #eee' }}>
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={defaultCenter}
            zoom={13}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
              disableDefaultUI: false,
              mapTypeControl: false,
              streetViewControl: false,
            }}
          >
            {/* User Location Marker */}
            {userLocation && (
              <MarkerF
                position={userLocation}
                icon={createPinIcon('#3498db', true)}
                title="Your Current Location"
                zIndex={1000}
              />
            )}

            {/* Issue Markers */}
            {issues.map(issue => (
              <MarkerF
                key={issue.id}
                position={{ lat: issue.coordinates.lat, lng: issue.coordinates.lng }}
                icon={createPinIcon(getStatusColor(issue.status))}
                onClick={() => setSelectedIssue(issue)}
                title={issue.title}
              />
            ))}

            {selectedIssue && (
              <InfoWindowF
                position={{ lat: selectedIssue.coordinates.lat, lng: selectedIssue.coordinates.lng }}
                onCloseClick={() => setSelectedIssue(null)}
              >
                <div style={{ padding: '5px', maxWidth: '200px' }}>
                  <h4 style={{ margin: '0 0 5px 0', fontSize: '14px' }}>{selectedIssue.title || selectedIssue.type}</h4>
                  <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666' }}>{selectedIssue.location}</p>
                  <div style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', background: getStatusColor(selectedIssue.status), color: '#fff', textTransform: 'capitalize' }}>
                    {selectedIssue.status.replace('-', ' ')}
                  </div>
                </div>
              </InfoWindowF>
            )}
          </GoogleMap>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <p>Loading Map...</p>
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#3498db' }}></div> You
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#e74c3c' }}></div> Pending
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f2a516' }}></div> In Progress
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27ae60' }}></div> Resolved
        </div>
      </div>
    </div>
  );
};

export default MapViewer;
