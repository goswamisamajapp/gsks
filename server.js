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
const EXPENSES_FILE = path.join(__dirname, 'public', 'expenses-data.json');
const ORDERS_FILE = path.join(__dirname, 'public', 'orders-data.json');
const PAYMENT_REQUESTS_FILE = path.join(__dirname, 'public', 'payment-requests-data.json');

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
    { id: 'sc_1', name: 'पारिवारिक आर्थिक सहायता योजना', amount: 150, frequency: 'Monthly', description: 'पारिवारिक आर्थिक सहायता योजना हेतु सहयोग राशि', status: 'Open', amountType: 'fixed' },
    { id: 'sc_2', name: 'वार्षिक सदस्यता शुल्क  (Prime Membership)', amount: 200, frequency: 'Yearly', description: 'वार्षिक सदस्यता शुल्क  (Prime Membership)', status: 'Open', amountType: 'fixed' },
    { id: 'sc_3', name: 'वार्षिक सदस्यता शुल्क  (General Membership)', amount: 100, frequency: 'Yearly', description: 'वार्षिक सदस्यता शुल्क  (General Membership)', status: 'Open', amountType: 'fixed' },
    { id: 'sc_4', name: 'आपातकालीन सहायता कोष', amount: 0, frequency: 'Open', description: 'आपातकालीन सहायता कोष', status: 'Open', amountType: 'custom' },
    { id: 'sc_1792563874533', name: 'सहयोग राशि  (General Donation)', amount: 0, frequency: 'Open', description: 'सहयोग राशि  (General Donation)', status: 'Open', amountType: 'custom' },
    { id: 'sc_1792563925027', name: 'छठ पूजा हेतु सहयोग राशि (2026)', amount: 0, frequency: 'One-Time', description: 'छठ पूजा हेतु सहयोग राशि (2026)', status: 'Open', amountType: 'custom' },
    { id: 'sc_1792563958247', name: 'छात्रवृति हेतु सहयोग राशि', amount: 0, frequency: 'One-Time', description: 'छात्रवृति हेतु सहयोग राशि', status: 'Open', amountType: 'custom' },
    { id: 'sc_1792563982419', name: 'कन्यादान हेतु सहयोग राशि', amount: 0, frequency: 'One-Time', description: 'कन्यादान हेतु सहयोग राशि', status: 'Open', amountType: 'custom' },
    { id: 'sc_1792567916290', name: 'छठ पूजा हेतु सहयोग राशि (2025)', amount: 0, frequency: 'One-Time', description: 'छठ पूजा हेतु सहयोग राशि (2025)', status: 'Closed', amountType: 'custom' }
  ],
  openingBalances: {
    cash: 0,
    bank: 0,
    remarks: ''
  },
  vendors: [
    { id: 'ven_1', name: 'टेंट हाउस एवं डेकोरेशन', phone: '', category: 'Tent & Sound', address: 'गोमो' },
    { id: 'ven_2', name: 'साउंड एवं लाउडस्पीकर सिस्टम', phone: '', category: 'Sound', address: 'गोमो' },
    { id: 'ven_3', name: 'पूजा सामग्री व फूल भंडार', phone: '', category: 'Pooja Items', address: 'गुनघसा' },
    { id: 'ven_4', name: 'प्रिंटिंग प्रेस (रसीद बही/बैनर)', phone: '', category: 'Printing', address: 'धनबाद' }
  ],
  expenseSchemes: [
    { id: 'exs_1', name: 'उत्सव एवं समारोह व्यय (Event/Festival)', description: 'वार्षिक महोत्सव, शिव चर्चा, पूजा आदि व्यय' },
    { id: 'exs_2', name: 'बैठक एवं कार्यालय व्यय (Meeting/Office)', description: 'चाय-नाश्ता, रजिस्टर, स्टेशनरी व व्यवस्था व्यय' },
    { id: 'exs_3', name: 'आपातकालीन चिकित्सा व सहायता अनुदान', description: 'ज़रूरतमंद परिवार को आर्थिक/चिकित्सा सहायता' },
    { id: 'exs_4', name: 'सामाजिक विकास एवं विविध व्यय', description: 'सामुदायिक कार्य एवं अन्य आकस्मिक व्यय' }
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
    return parsed && typeof parsed === 'object' ? parsed : DEFAULT_SETTINGS;
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

// API 2.5: Permanent delete member
app.post('/api/members/delete', (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Member ID required' });
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    let members = JSON.parse(raw);
    members = members.filter(m => m.id !== id);
    fs.writeFileSync(DATA_FILE, JSON.stringify(members, null, 2), 'utf8');
    return res.json({ success: true, message: 'Member permanently deleted', id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete member' });
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

app.post('/api/donations/save-bulk', (req, res) => {
  try {
    const items = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Payload must be an array of donations' });
    }
    if (!fs.existsSync(DONATIONS_FILE)) fs.writeFileSync(DONATIONS_FILE, '[]', 'utf8');
    const raw = fs.readFileSync(DONATIONS_FILE, 'utf8');
    let donations = JSON.parse(raw);

    items.forEach(donationItem => {
      if (!donationItem || !donationItem.id) return;
      const index = donations.findIndex(d => d.id === donationItem.id);
      if (index !== -1) {
        donations[index] = { ...donations[index], ...donationItem };
      } else {
        donations.unshift(donationItem);
      }
    });

    fs.writeFileSync(DONATIONS_FILE, JSON.stringify(donations, null, 2), 'utf8');
    return res.json({ success: true, count: items.length });
  } catch (err) {
    console.error('Bulk donation save error:', err);
    res.status(500).json({ error: 'Failed to save bulk donations' });
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

// EXPENSES APIS
app.get('/api/expenses', (req, res) => {
  try {
    if (!fs.existsSync(EXPENSES_FILE)) fs.writeFileSync(EXPENSES_FILE, '[]', 'utf8');
    const raw = fs.readFileSync(EXPENSES_FILE, 'utf8');
    const expenses = JSON.parse(raw);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read expenses' });
  }
});

app.post('/api/expenses/save', (req, res) => {
  try {
    const item = req.body;
    if (!fs.existsSync(EXPENSES_FILE)) fs.writeFileSync(EXPENSES_FILE, '[]', 'utf8');
    const raw = fs.readFileSync(EXPENSES_FILE, 'utf8');
    let expenses = JSON.parse(raw);

    const index = expenses.findIndex(e => e.id === item.id);
    if (index !== -1) {
      expenses[index] = { ...expenses[index], ...item };
    } else {
      expenses.unshift(item);
    }
    fs.writeFileSync(EXPENSES_FILE, JSON.stringify(expenses, null, 2), 'utf8');
    return res.json({ success: true, expense: item });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save expense' });
  }
});

app.post('/api/expenses/delete', (req, res) => {
  try {
    const { id } = req.body;
    if (!fs.existsSync(EXPENSES_FILE)) fs.writeFileSync(EXPENSES_FILE, '[]', 'utf8');
    const raw = fs.readFileSync(EXPENSES_FILE, 'utf8');
    let expenses = JSON.parse(raw);
    expenses = expenses.filter(e => e.id !== id);
    fs.writeFileSync(EXPENSES_FILE, JSON.stringify(expenses, null, 2), 'utf8');
    return res.json({ success: true, message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

// STORE ORDERS APIS (Realtime Member Shopping & Orders)
app.get('/api/orders', (req, res) => {
  try {
    if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, '[]', 'utf8');
    const raw = fs.readFileSync(ORDERS_FILE, 'utf8');
    const orders = JSON.parse(raw);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read orders' });
  }
});

app.post('/api/orders/save', (req, res) => {
  try {
    const item = req.body;
    if (!item || !item.id) return res.status(400).json({ error: 'Invalid order data' });
    if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, '[]', 'utf8');
    const raw = fs.readFileSync(ORDERS_FILE, 'utf8');
    let orders = JSON.parse(raw);

    const index = orders.findIndex(o => o.id === item.id);
    if (index !== -1) {
      orders[index] = { ...orders[index], ...item };
    } else {
      orders.unshift(item);
    }
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8');
    return res.json({ success: true, order: item });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save order' });
  }
});

app.post('/api/orders/update-status', (req, res) => {
  try {
    const { id, status, updatedBy, adminRemarks } = req.body;
    if (!id || !status) return res.status(400).json({ error: 'Order ID and status required' });
    if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, '[]', 'utf8');
    const raw = fs.readFileSync(ORDERS_FILE, 'utf8');
    let orders = JSON.parse(raw);

    const index = orders.findIndex(o => o.id === id);
    if (index !== -1) {
      orders[index].status = status;
      orders[index].updatedAt = new Date().toISOString();
      if (updatedBy) orders[index].updatedBy = updatedBy;
      if (adminRemarks) orders[index].adminRemarks = adminRemarks;
      fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8');
      return res.json({ success: true, order: orders[index] });
    }
    return res.status(404).json({ error: 'Order not found' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

app.post('/api/orders/delete', (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Order ID is required' });
    if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, '[]', 'utf8');
    const raw = fs.readFileSync(ORDERS_FILE, 'utf8');
    let orders = JSON.parse(raw);

    const initialLen = orders.length;
    orders = orders.filter(o => o.id !== id);
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8');
    return res.json({ success: true, deleted: orders.length < initialLen });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// PAYMENT REQUESTS APIS (Pending / Approved / Rejected UPI Payments)
app.get('/api/payment-requests', (req, res) => {
  try {
    if (!fs.existsSync(PAYMENT_REQUESTS_FILE)) fs.writeFileSync(PAYMENT_REQUESTS_FILE, '[]', 'utf8');
    const raw = fs.readFileSync(PAYMENT_REQUESTS_FILE, 'utf8');
    const requests = JSON.parse(raw);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read payment requests' });
  }
});

app.post('/api/payment-requests/save', (req, res) => {
  try {
    const item = req.body;
    if (!item || !item.id) return res.status(400).json({ error: 'Invalid payment request data' });
    if (!fs.existsSync(PAYMENT_REQUESTS_FILE)) fs.writeFileSync(PAYMENT_REQUESTS_FILE, '[]', 'utf8');
    const raw = fs.readFileSync(PAYMENT_REQUESTS_FILE, 'utf8');
    let requests = JSON.parse(raw);

    const index = requests.findIndex(r => r.id === item.id);
    if (index !== -1) {
      requests[index] = { ...requests[index], ...item };
    } else {
      requests.unshift(item);
    }
    fs.writeFileSync(PAYMENT_REQUESTS_FILE, JSON.stringify(requests, null, 2), 'utf8');
    return res.json({ success: true, paymentRequest: item });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save payment request' });
  }
});

app.post('/api/payment-requests/update-status', (req, res) => {
  try {
    const { id, status, updatedBy, adminRemarks, receiptId } = req.body;
    if (!id || !status) return res.status(400).json({ error: 'Request ID and status required' });
    if (!fs.existsSync(PAYMENT_REQUESTS_FILE)) fs.writeFileSync(PAYMENT_REQUESTS_FILE, '[]', 'utf8');
    const raw = fs.readFileSync(PAYMENT_REQUESTS_FILE, 'utf8');
    let requests = JSON.parse(raw);

    const index = requests.findIndex(r => r.id === id);
    if (index !== -1) {
      requests[index].status = status;
      requests[index].updatedAt = new Date().toISOString();
      if (updatedBy) requests[index].updatedBy = updatedBy;
      if (adminRemarks) requests[index].adminRemarks = adminRemarks;
      if (receiptId) requests[index].receiptId = receiptId;
      fs.writeFileSync(PAYMENT_REQUESTS_FILE, JSON.stringify(requests, null, 2), 'utf8');
      return res.json({ success: true, paymentRequest: requests[index] });
    }
    return res.status(404).json({ error: 'Payment request not found' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update payment request status' });
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
    // Complete replacement of keys provided so deleted items are actually removed
    const merged = { ...current, ...updatedSettings };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(merged, null, 2), 'utf8');
    return res.json({ success: true, settings: merged });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// Lightweight Keep-Alive / Health endpoints for UptimeRobot / Ping monitors
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
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
