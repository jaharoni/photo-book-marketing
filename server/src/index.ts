import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Middleware
app.use(cors());
app.use(express.json());

// Paths
const CONTENT_DIR = path.join(__dirname, '../../content');
const DATA_DIR = path.join(__dirname, '../../data');
const BOOK_FILE = path.join(CONTENT_DIR, 'book.json');
const SETTINGS_FILE = path.join(CONTENT_DIR, 'settings.json');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');

// Ensure directories exist
if (!fs.existsSync(CONTENT_DIR)) {
  fs.mkdirSync(CONTENT_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper: Read JSON file
const readJsonFile = (filePath: string): any => {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return null;
  }
};

// Helper: Write JSON file
const writeJsonFile = (filePath: string, data: any): boolean => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    return false;
  }
};

// Helper: Validate admin password
const validateAdmin = (req: Request): boolean => {
  const password = req.headers['x-admin-password'] as string;
  return password === ADMIN_PASSWORD;
};

// Helper: Email validation
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ===== PUBLIC ENDPOINTS =====

// GET /api/book - Get all book spreads
app.get('/api/book', (req: Request, res: Response) => {
  const book = readJsonFile(BOOK_FILE);
  if (book === null) {
    return res.status(404).json({ success: false, message: 'Book data not found' });
  }
  res.json(book);
});

// GET /api/settings - Get app settings
app.get('/api/settings', (req: Request, res: Response) => {
  const settings = readJsonFile(SETTINGS_FILE);
  if (settings === null) {
    return res.status(404).json({ success: false, message: 'Settings not found' });
  }
  res.json(settings);
});

// POST /api/leads - Submit lead capture form
app.post('/api/leads', (req: Request, res: Response) => {
  const { name, email, interest } = req.body;

  // Validation
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Name is required' });
  }

  if (!email || !email.trim()) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email format' });
  }

  const validInterests = ['Buying now', 'Gifting', 'Future editions'];
  if (!interest || !validInterests.includes(interest)) {
    return res.status(400).json({ success: false, message: 'Invalid interest value' });
  }

  // Create lead entry
  const lead = {
    id: Date.now().toString(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    interest,
    submittedAt: new Date().toISOString(),
  };

  // Read existing leads or create new array
  let leads = readJsonFile(LEADS_FILE) || [];
  if (!Array.isArray(leads)) {
    leads = [];
  }

  // Add new lead
  leads.push(lead);

  // Save to file
  const success = writeJsonFile(LEADS_FILE, leads);
  if (!success) {
    return res.status(500).json({ success: false, message: 'Failed to save lead' });
  }

  res.status(201).json({ success: true, message: 'Lead captured successfully' });
});

// ===== ADMIN ENDPOINTS =====

// PUT /api/book - Update book spreads (Admin only)
app.put('/api/book', (req: Request, res: Response) => {
  if (!validateAdmin(req)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const spreads = req.body;

  // Validate spreads array
  if (!Array.isArray(spreads)) {
    return res.status(400).json({ success: false, message: 'Invalid data format' });
  }

  // Validate each spread has required fields
  for (const spread of spreads) {
    if (!spread.id || !spread.imageUrl || !spread.title || !spread.caption) {
      return res.status(400).json({
        success: false,
        message: 'Each spread must have id, imageUrl, title, and caption',
      });
    }
  }

  // Save to file
  const success = writeJsonFile(BOOK_FILE, spreads);
  if (!success) {
    return res.status(500).json({ success: false, message: 'Failed to save book data' });
  }

  res.json({ success: true, message: 'Book spreads updated successfully' });
});

// PUT /api/settings - Update app settings (Admin only)
app.put('/api/settings', (req: Request, res: Response) => {
  if (!validateAdmin(req)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const settings = req.body;

  // Validate required fields
  if (!settings.bookTitle || !settings.subtitle) {
    return res.status(400).json({
      success: false,
      message: 'bookTitle and subtitle are required',
    });
  }

  if (
    typeof settings.autoplayIntervalMs !== 'number' ||
    typeof settings.inactivityTimeoutMs !== 'number'
  ) {
    return res.status(400).json({
      success: false,
      message: 'autoplayIntervalMs and inactivityTimeoutMs must be numbers',
    });
  }

  // Save to file
  const success = writeJsonFile(SETTINGS_FILE, settings);
  if (!success) {
    return res.status(500).json({ success: false, message: 'Failed to save settings' });
  }

  res.json({ success: true, message: 'Settings updated successfully' });
});

// GET /api/leads - Get all leads (Admin only)
app.get('/api/leads', (req: Request, res: Response) => {
  if (!validateAdmin(req)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const leads = readJsonFile(LEADS_FILE) || [];
  res.json(leads);
});

// Serve static frontend in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientBuildPath));
  
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\nAPI Endpoints:`);
  console.log(`  GET  /api/book`);
  console.log(`  GET  /api/settings`);
  console.log(`  POST /api/leads`);
  console.log(`  PUT  /api/book (admin)`);
  console.log(`  PUT  /api/settings (admin)`);
  console.log(`  GET  /api/leads (admin)`);
});

export default app;
