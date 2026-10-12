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
const SETTINGS_FILE = path.join(__dirname, 'public', 'settings-data.json');
const DONATIONS_FILE = path.join(__dirname, 'public', 'donations-data.json');
const FUND_TRANSFERS_FILE = path.join(__dirname, 'public', 'fund-transfers-data.json');

const DEFAULT_SETTINGS = {
  fundTypes: [
    { id: 'ft_1', name: 'Self', isSystem: true, description: 'स्वयं / आंतरिक निधि' },
    { id: 'ft_2', name: 'Bank', isSystem: true, description: 'बैंक खाता कोष (SBI A/C)' },
    { id: 'ft_3', name: 'Cash in Hand', isSystem: true, description: 'कोषाध्यक्ष के पास नगद' },
    { id: 'ft_4', name: 'Loan', isSystem: false, description: 'ऋण / अग्रिम निधि' },
    { id: 'ft_5', name: 'Investment', isSystem: false, description: 'निवेश / सावधि जमा (FD)' }
  ],
  bankAccounts: [
    {
      id: 'ba_1',
      accountNumber: '38294710293',
      bankName: 'State Bank of India (SBI)',
      branchName: 'Gomoh Branch',
      ifsc: 'SBIN0001234',
      accountType: 'Joint',
      members: ['अमित कुमार गोस्वामी (अध्यक्ष)', 'रोहित गोस्वामी (कोषाध्यक्ष)'],
      remarks: 'ट्रस्ट आधिकारिक मुख्य चालू खाता'
    }
  ],
  statuses: [
    { id: 'st_1', name: 'Active', badgeColor: 'emerald', isSystem: true, description: 'सक्रिय सदस्य' },
    { id: 'st_2', name: 'Prime Member', badgeColor: 'amber', isSystem: true, description: 'विशिष्ट सदस्य (VIP)' },
    { id: 'st_3', name: 'Inactive', badgeColor: 'slate', isSystem: true, description: 'निष्क्रिय सदस्य' }
  ],
  eventCategories: [
    { id: 'ec_1', name: 'General Meeting', color: 'blue', isSystem: true, description: 'सामान्य बैठक' },
    { id: 'ec_2', name: 'Special Event', color: 'purple', isSystem: true, description: 'विशेष उत्सव/समारोह' },
    { id: 'ec_3', name: 'Emergency meeting', color: 'rose', isSystem: true, description: 'आपातकालीन बैठक' }
  ],
  eventTitles: [
    { id: 'et_1', title: 'मासिक आम सभा एवं कोष समीक्षा', category: 'General Meeting' },
    { id: 'et_2', title: 'वार्षिक महाधिवेशन एवं सम्मान समारोह', category: 'Special Event' },
    { id: 'et_3', title: 'आपातकालीन कार्यकारिणी बैठक', category: 'Emergency meeting' },
    { id: 'et_4', title: 'शिव चर्चा एवं सामाजिक विचार-विमर्श', category: 'General Meeting' }
  ],
  eventVenues: [
    { id: 'ev_1', venue: 'शिव मंदिर परिसर, गुनघसा' },
    { id: 'ev_2', venue: 'सामुदायिक भवन, गोमो' },
    { id: 'ev_3', venue: 'केंद्रीय ट्रस्ट कार्यालय, धनबाद' }
  ],
  schemes: [
    { id: 'sc_1', name: 'मासिक सहयोग कोष (Monthly Sewa)', amount: 100, frequency: 'Monthly', description: 'प्रति माह नियमित ट्रस्ट सेवा सहायता', status: 'Active' },
    { id: 'sc_2', name: 'वार्षिक सदस्यता शुल्क (Annual Dues)', amount: 1200, frequency: 'Yearly', description: 'वार्षिक सदस्यता नवीनीकरण', status: 'Active' },
    { id: 'sc_3', name: 'विशेष कन्या विवाह सहाय योजना', amount: 500, frequency: 'One-Time', description: 'ज़रूरतमंद परिवार के विवाह में ट्रस्ट अनुदान', status: 'Active' },
    { id: 'sc_4', name: 'आपातकालीन चिकित्सा सहायता कोष', amount: 0, frequency: 'Open', description: 'गंभीर बीमारी पर विशेष आर्थिक सहयोग', status: 'Active' }
  ]
};

function getSettingsData() {
  try {
    if (!fs.existsSync(SETTINGS_FILE)) {
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2), 'utf8');
      return DEFAULT_SETTINGS;
    }
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}


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

// DONATIONS APIS
app.get('/api/donations', (req, res) => {
  try {
    if (!fs.existsSync(DONATIONS_FILE)) fs.writeFileSync(DONATIONS_FILE, '[]', 'utf8');
    const raw = fs.readFileSync(DONATIONS_FILE, 'utf8');
    const donations = JSON.parse(raw);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.json(donations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read donations' });
  }
});

app.post('/api/donations/save', (req, res) => {
  try {
    const donationItem = req.body;
    if (!fs.existsSync(DONATIONS_FILE)) fs.writeFileSync(DONATIONS_FILE, '[]', 'utf8');
    const raw = fs.readFileSync(DONATIONS_FILE, 'utf8');
    let donations = JSON.parse(raw);

    const index = donations.findIndex(d => d.id === donationItem.id);
    if (index !== -1) {
      donations[index] = { ...donations[index], ...donationItem };
    } else {
      donations.unshift(donationItem);
    }
    fs.writeFileSync(DONATIONS_FILE, JSON.stringify(donations, null, 2), 'utf8');
    return res.json({ success: true, donation: donationItem });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save donation' });
  }
});

app.post('/api/donations/delete', (req, res) => {
  try {
    const { id } = req.body;
    if (!fs.existsSync(DONATIONS_FILE)) fs.writeFileSync(DONATIONS_FILE, '[]', 'utf8');
    const raw = fs.readFileSync(DONATIONS_FILE, 'utf8');
    let donations = JSON.parse(raw);
    donations = donations.filter(d => d.id !== id);
    fs.writeFileSync(DONATIONS_FILE, JSON.stringify(donations, null, 2), 'utf8');
    return res.json({ success: true, message: 'Donation deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete donation' });
  }
});

// FUND TRANSFERS APIS
app.get('/api/fund-transfers', (req, res) => {
  try {
    if (!fs.existsSync(FUND_TRANSFERS_FILE)) fs.writeFileSync(FUND_TRANSFERS_FILE, '[]', 'utf8');
    const raw = fs.readFileSync(FUND_TRANSFERS_FILE, 'utf8');
    const transfers = JSON.parse(raw);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.json(transfers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read fund transfers' });
  }
});

app.post('/api/fund-transfers/save', (req, res) => {
  try {
    const item = req.body;
    if (!fs.existsSync(FUND_TRANSFERS_FILE)) fs.writeFileSync(FUND_TRANSFERS_FILE, '[]', 'utf8');
    const raw = fs.readFileSync(FUND_TRANSFERS_FILE, 'utf8');
    let transfers = JSON.parse(raw);

    const index = transfers.findIndex(t => t.id === item.id);
    if (index !== -1) {
      transfers[index] = { ...transfers[index], ...item };
    } else {
      transfers.unshift(item);
    }
    fs.writeFileSync(FUND_TRANSFERS_FILE, JSON.stringify(transfers, null, 2), 'utf8');
    return res.json({ success: true, transfer: item });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save fund transfer' });
  }
});

app.post('/api/fund-transfers/delete', (req, res) => {
  try {
    const { id } = req.body;
    if (!fs.existsSync(FUND_TRANSFERS_FILE)) fs.writeFileSync(FUND_TRANSFERS_FILE, '[]', 'utf8');
    const raw = fs.readFileSync(FUND_TRANSFERS_FILE, 'utf8');
    let transfers = JSON.parse(raw);
    transfers = transfers.filter(t => t.id !== id);
    fs.writeFileSync(FUND_TRANSFERS_FILE, JSON.stringify(transfers, null, 2), 'utf8');
    return res.json({ success: true, message: 'Transfer deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete transfer' });
  }
});

// MASTER SETTINGS APIS
app.get('/api/settings', (req, res) => {
  try {
    const settings = getSettingsData();
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load settings' });
  }
});

app.post('/api/settings/save', (req, res) => {
  try {
    const updatedSettings = req.body;
    if (!updatedSettings || typeof updatedSettings !== 'object') {
      return res.status(400).json({ error: 'Invalid settings payload' });
    }
    const current = getSettingsData();
    const merged = { ...current, ...updatedSettings };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(merged, null, 2), 'utf8');
    return res.json({ success: true, settings: merged });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save settings' });
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
