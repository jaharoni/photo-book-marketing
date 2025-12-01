# Photo Book Marketing App

A fullstack interactive marketing page for a premium printed photo book featuring a self-animating virtual book viewer.

## Features

- 🎨 **Interactive Virtual Book**: Self-animating 3D book with smooth page turns
- 📱 **Fully Responsive**: Works seamlessly on desktop, Android, and iOS browsers
- 🎯 **Lead Capture**: Built-in form to collect buyer information
- ⚙️ **Content Management**: Simple admin UI for managing book pages and settings
- 🚀 **Production Ready**: Optimized for deployment with modern tech stack

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: CSS Modules
- **Backend**: Node.js + Express + TypeScript
- **Storage**: JSON files (easily swappable for database)
- **API**: RESTful endpoints

## Quick Start

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install all dependencies (root, client, and server)
npm run install:all
```

### Development

```bash
# Run both frontend and backend concurrently
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Admin Panel: http://localhost:5173/admin

### Build for Production

```bash
npm run build
```

### Production Deployment

```bash
npm start
```

The server will serve the built frontend and API on port 3000.

## Project Structure

```
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── types/       # TypeScript types
│   │   └── utils/       # Utility functions
│   └── public/          # Static assets
├── server/              # Express backend
│   ├── src/
│   │   ├── routes/      # API routes
│   │   └── index.ts     # Server entry point
│   └── dist/            # Built server code
├── content/             # Book content (JSON)
│   ├── book.json        # Book spreads data
│   └── settings.json    # App settings and copy
└── data/                # User data
    └── leads.json       # Lead capture submissions
```

## Content Management

### Direct JSON Editing

Non-technical users can edit content directly in JSON files:

#### `content/book.json` - Book Pages

Edit this file to add, remove, or modify book spreads:

```json
[
  {
    "id": "spread-1",
    "imageUrl": "https://example.com/image1.jpg",
    "title": "Chapter Title",
    "caption": "Beautiful description of this spread",
    "ctaLabel": "Learn More",
    "ctaLink": "#details"
  }
]
```

- **imageUrl**: Full URL to the page image
- **title**: Heading that appears on the page
- **caption**: Description text (shows on hover/tap)
- **ctaLabel** (optional): Button text
- **ctaLink** (optional): Button destination

#### `content/settings.json` - Site Settings

Edit marketing copy, CTAs, and animation timing:

```json
{
  "bookTitle": "Your Book Title",
  "subtitle": "Short marketing tagline",
  "autoplayIntervalMs": 3000,
  "inactivityTimeoutMs": 5000
}
```

- **autoplayIntervalMs**: Time between automatic page turns (milliseconds)
- **inactivityTimeoutMs**: How long to wait before resuming autoplay after user interaction
- Change these values to speed up or slow down the book animation

### Admin Panel

Access the visual admin interface at `/admin`:

1. Navigate to http://localhost:5173/admin
2. Enter admin password (default: set in `.env` file)
3. Edit spreads, settings, and content visually
4. Changes save to JSON files automatically

**Admin Password Configuration**:

Create `.env` file in the `server` directory:

```
ADMIN_PASSWORD=your-secure-password
PORT=3000
```

## Animation & Behavior

### Virtual Book Component

The `VirtualPhotoBook` component features:

- **Auto-play**: Pages turn automatically on load
- **Smart Pausing**: Animation pauses when user interacts
- **Auto-resume**: After 5 seconds of inactivity, auto-play resumes
- **3D Effects**: Subtle transforms and shadows for depth
- **Touch Support**: Swipe gestures on mobile devices
- **Keyboard Navigation**: Arrow keys on desktop

### Customizing Animation

Edit timing in `content/settings.json`:

```json
{
  "autoplayIntervalMs": 4000,     // Slower page turns (4 seconds)
  "inactivityTimeoutMs": 7000     // Wait longer before resuming (7 seconds)
}
```

Or adjust in the Admin Panel under "Settings".

## API Endpoints

### Public Endpoints

- `GET /api/book` - Fetch all book spreads
- `GET /api/settings` - Fetch app settings and copy
- `POST /api/leads` - Submit lead capture form

### Admin Endpoints (require authentication)

- `PUT /api/book` - Update book spreads
- `PUT /api/settings` - Update app settings

## Environment Variables

### Server `.env`

```
ADMIN_PASSWORD=your-admin-password
PORT=3000
NODE_ENV=development
```

### Client `.env`

```
VITE_API_BASE_URL=http://localhost:3000
```

For production, set `VITE_API_BASE_URL` to your production API URL.

## Deployment

### Vercel / Netlify (Frontend + API)

1. Build frontend: `npm run build:client`
2. Deploy `client/dist` as static site
3. Deploy `server` as serverless functions or separate backend

### Single Server Deployment

The server can serve both frontend and API:

```bash
npm run build
npm start
```

Access everything on the server's port (default 3000).

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (iOS 12+, macOS)
- ✅ Mobile browsers (Android Chrome, iOS Safari)

## License

MIT

## Support

For questions or issues, please open a GitHub issue.
