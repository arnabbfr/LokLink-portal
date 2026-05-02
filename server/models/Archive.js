import mongoose from 'mongoose';

const archiveSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String },
  title: { type: String },
  description: { type: String },
  location: { type: String },
  status: { type: String },
  priority: { type: String },
  reportedAt: { type: Date },
  archivedAt: { type: Date, default: Date.now },
  assignedTo: { type: String },
  department: { type: String },
  updates: [{
    date: { type: Date },
    note: { type: String },
    by: { type: String }
  }]
}, { strict: false }); // allow unstructured archived data

export default mongoose.model('Archive', archiveSchema);
