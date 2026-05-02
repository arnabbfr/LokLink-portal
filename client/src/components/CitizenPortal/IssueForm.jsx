import React, { useState } from 'react';
import { Upload, Mic, MapPin, Send, Loader2 } from 'lucide-react';
import api from '../../api';
import axios from 'axios';

const IssueForm = ({ onLocationFetch, onReset }) => {
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    description: '',
    manualAddress: '',
    coordinates: null,
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const coords = { lat: latitude, lng: longitude };

        // Notify parent about the new location
        if (onLocationFetch) onLocationFetch(coords);

        try {
          // Attempt to geocode the coordinates to an address
          const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
          const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
          
          const response = await axios.get(geocodeUrl);
          
          if (response.data.status === 'OK' && response.data.results.length > 0) {
            const address = response.data.results[0].formatted_address;
            setFormData(prev => ({
              ...prev,
              manualAddress: address,
              coordinates: coords
            }));
          } else {
            // If geocoding fails, still store the coordinates
            setFormData(prev => ({ ...prev, coordinates: coords }));
            console.warn('Geocoding failed or returned no results');
          }
        } catch (error) {
          console.error('Error fetching address:', error);
          setFormData(prev => ({ ...prev, coordinates: coords }));
        } finally {
          setGpsLoading(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Failed to get your location. Please check your browser permissions.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      let uploadedMedia = [];
      if (files.length > 0) {
        const fileData = new FormData();
        files.forEach(file => fileData.append('files', file));
        const uploadRes = await api.post('/upload', fileData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploadedMedia = uploadRes.data.files.map(f => f.url);
      }

      const issuePayload = {
        ...formData,
        media: uploadedMedia,
        reportedBy: 'Citizen',
      };

      await api.post('/issues', issuePayload);
      setSuccess(true);
      setFormData({ type: '', title: '', description: '', manualAddress: '', coordinates: null });
      setFiles([]);
      if (onReset) onReset();
    } catch (error) {
      console.error('Error submitting issue:', error);
      alert('Failed to submit issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="issue-form">
      {success && (
        <div style={{ padding: '1rem', background: '#d4edda', color: '#155724', borderRadius: '8px', marginBottom: '1rem' }}>
          Issue reported successfully! Thank you.
        </div>
      )}

      <div className="form-group">
        <label>Issue Type</label>
        <select name="type" value={formData.type} onChange={handleChange} required>
          <option value="">Select a category</option>
          <option value="road-repair">Road Repair</option>
          <option value="streetlight">Street Light</option>
          <option value="water-supply">Water Supply</option>
          <option value="garbage">Garbage Collection</option>
          <option value="drainage">Drainage</option>
          <option value="traffic">Traffic Management</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="form-group">
        <label>Title (Short description)</label>
        <input 
          type="text" 
          name="title" 
          value={formData.title} 
          onChange={handleChange} 
          placeholder="e.g., Pothole on Main St" 
          required 
        />
      </div>

      <div className="form-group">
        <label>Detailed Description</label>
        <textarea 
          name="description" 
          value={formData.description} 
          onChange={handleChange} 
          placeholder="Please provide details about the issue..." 
          required 
        />
      </div>

      <div className="form-group">
        <label>Address / Location</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            name="manualAddress" 
            value={formData.manualAddress} 
            onChange={handleChange} 
            placeholder="Type location manually or use GPS..." 
            style={{ flex: 1 }}
            required
          />
          <button 
            type="button" 
            className="btn btn-secondary" 
            style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '5px' }}
            onClick={handleUseGPS}
            disabled={gpsLoading}
          >
            {gpsLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <MapPin size={18} />
            )}
            {gpsLoading ? 'Locating...' : 'Use GPS'}
          </button>
        </div>
        {formData.coordinates && (
          <p style={{ fontSize: '0.75rem', color: '#27ae60', marginTop: '5px' }}>
            ✓ GPS Coordinates captured: {formData.coordinates.lat.toFixed(4)}, {formData.coordinates.lng.toFixed(4)}
          </p>
        )}
      </div>

      <div className="form-group">
        <label>Upload Photos (Optional)</label>
        <div className="file-upload-area" onClick={() => document.getElementById('file-upload').click()}>
          <Upload size={32} color="#f2a516" />
          <p>Click to browse or drag and drop images</p>
          <input 
            id="file-upload" 
            type="file" 
            multiple 
            accept="image/*" 
            style={{ display: 'none' }} 
            onChange={handleFileChange}
          />
        </div>
        {files.length > 0 && (
          <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#666' }}>
            {files.length} file(s) selected
          </div>
        )}
      </div>

      <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
        {loading ? 'Submitting...' : <><Send size={18} /> Submit Report</>}
      </button>
    </form>
  );
};

export default IssueForm;
