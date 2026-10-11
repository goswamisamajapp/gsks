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
const EVENTS_FILE = path.join(__dirname, 'public', 'events-data.json');

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

// API 2: Update or Add member
app.post('/api/members/update', (req, res) => {
  try {
    const incomingMember = req.body;
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    let members = JSON.parse(raw);
    
    const index = members.findIndex(m => m.id === incomingMember.id);
    if (index !== -1) {
      members[index] = { ...members[index], ...incomingMember };
    } else {
      members.push(incomingMember);
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(members, null, 2), 'utf8');
    return res.json({ success: true, member: incomingMember, total: members.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save member' });
  }
});

app.post('/api/members/clear', (req, res) => {
  try {
    fs.writeFileSync(DATA_FILE, '[]', 'utf8');
    return res.json({ success: true, message: 'All members cleared' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear members' });
  }
});

// EVENTS APIS
app.get('/api/events', (req, res) => {
  try {
    if (!fs.existsSync(EVENTS_FILE)) fs.writeFileSync(EVENTS_FILE, '[]', 'utf8');
    const raw = fs.readFileSync(EVENTS_FILE, 'utf8');
    const events = JSON.parse(raw);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read events' });
  }
});

app.post('/api/events/save', (req, res) => {
  try {
    const eventItem = req.body;
    if (!fs.existsSync(EVENTS_FILE)) fs.writeFileSync(EVENTS_FILE, '[]', 'utf8');
    const raw = fs.readFileSync(EVENTS_FILE, 'utf8');
    let events = JSON.parse(raw);

    const index = events.findIndex(e => e.id === eventItem.id);
    if (index !== -1) {
      events[index] = { ...events[index], ...eventItem };
    } else {
      events.unshift(eventItem);
    }
    fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2), 'utf8');
    return res.json({ success: true, event: eventItem });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save event' });
  }
});

app.post('/api/events/delete', (req, res) => {
  try {
    const { id } = req.body;
    if (!fs.existsSync(EVENTS_FILE)) fs.writeFileSync(EVENTS_FILE, '[]', 'utf8');
    const raw = fs.readFileSync(EVENTS_FILE, 'utf8');
    let events = JSON.parse(raw);
    events = events.filter(e => e.id !== id);
    fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2), 'utf8');
    return res.json({ success: true, message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    project: 'GSKS - Akhil Bhartiya Shaiv Samaj Sewa Trust',
    firebaseProject: 'goswamisamajapp',
    timestamp: new Date().toISOString()
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`GSKS Server running on port ${PORT}`);
});
