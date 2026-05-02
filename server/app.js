import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { nanoid } from 'nanoid';
import multer from 'multer';
import dotenv from 'dotenv';
import connectDB from './db.js';

// Import Models
import Issue from './models/Issue.js';
import Department from './models/Department.js';
import Archive from './models/Archive.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: process.env.ALLOWED_ORIGIN 
        ? process.env.ALLOWED_ORIGIN.split(',') 
        : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static hosting for legacy client and server pages
app.use('/client-legacy', express.static(path.join(__dirname, '..', 'client-legacy')));
app.use('/portal', express.static(path.join(__dirname)));

// Static hosting for uploaded media
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// File upload (multer)
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${nanoid(6)}`;
    const safe = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_');
    cb(null, `${unique}-${safe}`);
  }
});
const upload = multer({ storage });

app.post('/api/upload', upload.array('files', 10), (req, res) => {
  const files = (req.files || []).map(f => ({
    filename: f.filename,
    url: `/uploads/${f.filename}`,
    mimetype: f.mimetype,
    size: f.size
  }));
  res.json({ files });
});

// Seed default departments if none exist
async function seedDepartments() {
  try {
    const count = await Department.countDocuments();
    if (count === 0) {
      const defaultDepts = [
        { id: 'electrical', name: 'Electrical Department' },
        { id: 'sanitation', name: 'Sanitation Department' },
        { id: 'public-works', name: 'Public Works Department' },
        { id: 'water-supply', name: 'Water Supply Department' },
        { id: 'traffic', name: 'Traffic Management' }
      ];
      await Department.insertMany(defaultDepts);
      console.log('Seeded default departments');
    }
  } catch (error) {
    console.error('Error seeding departments:', error);
  }
}
seedDepartments();

// API routes
app.get('/api/issues', async (req, res) => {
  try {
    const issues = await Issue.find().sort({ reportedAt: -1 });
    res.json(issues);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching issues' });
  }
});

app.post('/api/issues', async (req, res) => {
  try {
    const id = 'ISS-' + nanoid(6).toUpperCase();
    const issueData = {
      id,
      type: req.body.type,
      title: req.body.title,
      description: req.body.description,
      location: req.body.location || req.body.manualAddress || '',
      coordinates: req.body.coordinates || null,
      status: 'pending',
      priority: req.body.priority || 'medium',
      reportedBy: req.body.reportedBy || 'Citizen User',
      media: req.body.media || [],
      voiceNote: req.body.voiceNote || null,
      updates: []
    };
    const issue = new Issue(issueData);
    await issue.save();
    res.status(201).json(issue);
  } catch (error) {
    res.status(500).json({ error: 'Error creating issue', details: error.message });
  }
});

app.patch('/api/issues/:id/status', async (req, res) => {
  try {
    const issue = await Issue.findOneAndUpdate(
      { id: req.params.id },
      { $set: { status: req.body.status } },
      { new: true }
    );
    if (!issue) return res.status(404).json({ error: 'Not found' });
    res.json(issue);
  } catch (error) {
    res.status(500).json({ error: 'Error updating status' });
  }
});

app.post('/api/issues/:id/assign', async (req, res) => {
  try {
    const issue = await Issue.findOne({ id: req.params.id });
    if (!issue) return res.status(404).json({ error: 'Not found' });

    issue.department = req.body.department || issue.department;
    issue.assignedTo = req.body.assignedTo || issue.assignedTo;
    issue.priority = req.body.priority || issue.priority;
    issue.assignedAt = new Date();
    
    if (issue.status === 'pending') issue.status = 'in-progress';
    
    if (req.body.instructions) {
      issue.updates.push({ 
        date: new Date(), 
        note: `Assignment note: ${req.body.instructions}`, 
        by: 'Authority' 
      });
    }
    
    await issue.save();
    res.json(issue);
  } catch (error) {
    res.status(500).json({ error: 'Error assigning issue' });
  }
});

// Archive or delete resolved issues
app.post('/api/issues/clear-resolved', async (req, res) => {
  try {
    const resolvedIssues = await Issue.find({ status: 'resolved' });
    
    if (resolvedIssues.length > 0) {
      // Move to archive
      const archiveData = resolvedIssues.map(issue => ({
        ...issue.toObject(),
        archivedAt: new Date()
      }));
      await Archive.insertMany(archiveData);
      
      // Delete from active issues
      await Issue.deleteMany({ status: 'resolved' });
    }
    
    const remaining = await Issue.countDocuments();
    res.json({ removed: resolvedIssues.length, remaining });
  } catch (error) {
    res.status(500).json({ error: 'Error clearing resolved issues' });
  }
});

app.delete('/api/issues/:id', async (req, res) => {
  try {
    const issue = await Issue.findOne({ id: req.params.id });
    if (!issue) return res.status(404).json({ error: 'Not found' });
    
    const archiveData = { ...issue.toObject(), archivedAt: new Date() };
    await Archive.create(archiveData);
    await Issue.deleteOne({ id: req.params.id });
    
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting issue' });
  }
});

app.get('/api/departments', async (req, res) => {
  try {
    const depts = await Department.find();
    res.json(depts);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching departments' });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
