import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DATA_FILE = path.join(__dirname, 'public', 'members-data.json');

// API 1: Get latest members data (Always shared across ALL devices: mobile, PC, tablet)
app.get('/api/members', (req, res) => {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const members = JSON.parse(raw);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read members' });
  }
});

// API 2: Update member (edit / archive / restore)
app.post('/api/members/update', (req, res) => {
  try {
    const updatedMember = req.body;
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    let members = JSON.parse(raw);
    
    const index = members.findIndex(m => m.id === updatedMember.id);
    if (index !== -1) {
      members[index] = { ...members[index], ...updatedMember };
      fs.writeFileSync(DATA_FILE, JSON.stringify(members, null, 2), 'utf8');
      return res.json({ success: true, member: members[index] });
    }
    res.status(404).json({ error: 'Member not found' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update member' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    project: 'GSKS - Akhil Bhartiya Shaiv Samaj Sewa Trust',
    firebaseProject: 'goswami-samaj-kalyan-samiti',
    timestamp: new Date().toISOString()
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`GSKS Server running on port ${PORT}`);
});
