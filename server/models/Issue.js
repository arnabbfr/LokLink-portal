import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  title: { type: String },
  description: { type: String, required: true },
  location: { type: String },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  status: { type: String, enum: ['pending', 'in-progress', 'resolved'], default: 'pending' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  reportedBy: { type: String, default: 'Citizen User' },
  reportedAt: { type: Date, default: Date.now },
  assignedTo: { type: String, default: null },
  assignedAt: { type: Date, default: null },
  department: { type: String, default: null },
  media: [{ type: String }],
  voiceNote: { type: String, default: null },
  updates: [{
    date: { type: Date, default: Date.now },
    note: { type: String },
    by: { type: String }
  }]
});

export default mongoose.model('Issue', issueSchema);
