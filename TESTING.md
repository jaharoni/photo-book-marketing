# Testing Guide

Comprehensive testing guide for the Photo Book Marketing app.

## Table of Contents

1. [Manual Testing](#manual-testing)
2. [Automated Testing Setup](#automated-testing-setup)
3. [Performance Testing](#performance-testing)
4. [Accessibility Testing](#accessibility-testing)
5. [Cross-Browser Testing](#cross-browser-testing)

---

## Manual Testing

### Frontend Tests

#### Virtual Photo Book Component

- [ ] **Initial Load**
  - Book displays with first spread visible
  - Auto-play starts after component mounts
  - Pages turn automatically every ~3 seconds

- [ ] **User Interaction**
  - Click left arrow → previous page shows
  - Click right arrow → next page shows
  - Keyboard left arrow → previous page
  - Keyboard right arrow → next page
  - Mobile swipe left → next page
  - Mobile swipe right → previous page

- [ ] **Auto-Play Behavior**
  - Auto-play pauses on any interaction
  - After 5 seconds of inactivity, auto-play resumes
  - Switching browser tabs pauses auto-play
  - Returning to tab resumes auto-play (if inactive long enough)

- [ ] **Visual Effects**
  - Hover on spread → caption fades in
  - Hover on spread → image zooms slightly
  - Page transitions are smooth
  - No visual glitches during animations

- [ ] **Responsive Design**
  - Desktop: Shows open book layout
  - Tablet: Adjusts appropriately
  - Mobile: Shows single page view
  - Page indicator shows correct count

#### Lead Capture Form

- [ ] **Validation**
  - Submit empty form → shows "Name is required"
  - Submit with invalid email → shows "Invalid email format"
  - Submit with valid data → success message

- [ ] **Functionality**
  - Form data POSTs to /api/leads
  - Success message displays after submission
  - Form fields clear after successful submit
  - Error message shows on network failure

- [ ] **UI States**
  - "Submitting..." button text during submission
  - Button disabled during submission
  - Inline error messages appear below fields

#### Marketing Page

- [ ] **Hero Section**
  - Title and subtitle display from settings
  - Primary CTA button appears and links correctly
  - Secondary CTA button appears and links correctly
  - Virtual book renders properly

- [ ] **Details Section**
  - Details text displays
  - Bullet points render as list
  - Thumbnail strip shows images
  - Thumbnails zoom on hover

- [ ] **Footer**
  - Footer links present
  - Copyright year is current
  - Links styled correctly

### Admin Panel Tests

#### Authentication

- [ ] **Login**
  - /admin redirects to login if not authenticated
  - Enter password → grants access
  - Invalid password → shows error
  - Refresh page → stays authenticated (localStorage)

- [ ] **Logout**
  - Click logout → returns to login page
  - Clear localStorage → requires re-login

#### Spreads Management

- [ ] **List View**
  - All spreads display in order
  - Each spread shows image preview
  - All fields editable (imageUrl, title, caption, CTA)

- [ ] **Add Spread**
  - Click "Add New Spread" → new blank spread appears
  - New spread has unique ID
  - Can fill in all fields

- [ ] **Reorder Spreads**
  - Up arrow moves spread up in order
  - Down arrow moves spread down
  - First spread's up arrow is disabled
  - Last spread's down arrow is disabled

- [ ] **Delete Spread**
  - Click delete → confirmation dialog
  - Confirm → spread removed from list
  - Cancel → spread remains

- [ ] **Save Spreads**
  - Click "Save All Spreads" → PUTs to /api/book
  - Success toast appears
  - Changes persist after page refresh

#### Settings Management

- [ ] **Hero Section Settings**
  - Book title editable
  - Subtitle editable (textarea)
  - Primary CTA label and link editable
  - Secondary CTA label and link editable

- [ ] **Details Settings**
  - Details text editable
  - Bullet points list editable
  - Can add new bullet point
  - Can delete bullet point

- [ ] **Animation Settings**
  - Autoplay interval (ms) adjustable
  - Inactivity timeout (ms) adjustable
  - Changes affect book behavior immediately after save

- [ ] **Save Settings**
  - Click "Save Settings" → PUTs to /api/settings
  - Success toast appears
  - Changes reflected on marketing page

### Backend API Tests

#### Public Endpoints

```bash
# Test GET /api/book
curl http://localhost:3000/api/book
# Should return array of spreads

# Test GET /api/settings
curl http://localhost:3000/api/settings
# Should return settings object

# Test POST /api/leads
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","interest":"Buying now"}'
# Should return {"success":true}

# Test POST /api/leads with invalid email
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"invalid-email","interest":"Buying now"}'
# Should return 400 error
```

#### Admin Endpoints

```bash
# Test PUT /api/book (without auth)
curl -X PUT http://localhost:3000/api/book \
  -H "Content-Type: application/json" \
  -d '[{"id":"test","imageUrl":"url","title":"Test","caption":"Test"}]'
# Should return 401 Unauthorized

# Test PUT /api/book (with auth)
curl -X PUT http://localhost:3000/api/book \
  -H "Content-Type: application/json" \
  -H "X-Admin-Password: your-password" \
  -d '[{"id":"test","imageUrl":"url","title":"Test","caption":"Test"}]'
# Should return {"success":true}
```

---

## Automated Testing Setup

### Install Testing Libraries

```bash
# Frontend testing
cd client
npm install --save-dev @testing-library/react @testing-library/jest-dom \
  @testing-library/user-event vitest @vitest/ui jsdom

# Backend testing
cd ../server
npm install --save-dev jest @types/jest supertest @types/supertest ts-jest
```

### Frontend Test Example

```typescript
// client/src/components/VirtualPhotoBook/__tests__/VirtualPhotoBook.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import VirtualPhotoBook from '../VirtualPhotoBook';

const mockSpreads = [
  { id: '1', imageUrl: 'test1.jpg', title: 'Test 1', caption: 'Caption 1' },
  { id: '2', imageUrl: 'test2.jpg', title: 'Test 2', caption: 'Caption 2' },
];

const mockSettings = {
  bookTitle: 'Test Book',
  subtitle: 'Test Subtitle',
  autoplayIntervalMs: 3000,
  inactivityTimeoutMs: 5000,
};

describe('VirtualPhotoBook', () => {
  it('renders first spread on load', () => {
    render(<VirtualPhotoBook spreads={mockSpreads} settings={mockSettings} />);
    expect(screen.getByAltText('Test 1')).toBeInTheDocument();
  });

  it('navigates to next page on arrow click', () => {
    render(<VirtualPhotoBook spreads={mockSpreads} settings={mockSettings} />);
    const nextButton = screen.getByLabelText('Next page');
    fireEvent.click(nextButton);
    expect(screen.getByAltText('Test 2')).toBeInTheDocument();
  });
});
```

### Backend Test Example

```typescript
// server/src/__tests__/api.test.ts
import request from 'supertest';
import app from '../index';

describe('API Endpoints', () => {
  describe('GET /api/book', () => {
    it('returns book data', async () => {
      const response = await request(app).get('/api/book');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/leads', () => {
    it('accepts valid lead submission', async () => {
      const lead = {
        name: 'Test User',
        email: 'test@example.com',
        interest: 'Buying now',
      };
      const response = await request(app)
        .post('/api/leads')
        .send(lead);
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('rejects invalid email', async () => {
      const lead = {
        name: 'Test User',
        email: 'invalid-email',
        interest: 'Buying now',
      };
      const response = await request(app)
        .post('/api/leads')
        .send(lead);
      expect(response.status).toBe(400);
    });
  });
});
```

---

## Performance Testing

### Lighthouse Audit

```bash
# Install Lighthouse
npm install -g lighthouse

# Run audit
lighthouse http://localhost:5173 --view
```

**Target Scores:**
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100

### Load Testing

```bash
# Install Artillery
npm install -g artillery

# Create load-test.yml
cat > load-test.yml <<EOF
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - flow:
    - get:
        url: "/api/book"
    - post:
        url: "/api/leads"
        json:
          name: "Load Test User"
          email: "test@example.com"
          interest: "Buying now"
EOF

# Run load test
artillery run load-test.yml
```

---

## Accessibility Testing

### Automated Checks

```bash
# Install axe-core
cd client
npm install --save-dev @axe-core/react
```

### Manual Checks

- [ ] **Keyboard Navigation**
  - Tab through all interactive elements
  - Arrow keys work in book viewer
  - Enter/Space activates buttons
  - Escape closes modals (if any)

- [ ] **Screen Reader**
  - Test with NVDA (Windows) or VoiceOver (Mac)
  - All images have alt text
  - Form labels properly associated
  - Aria labels on icon buttons

- [ ] **Color Contrast**
  - Text meets WCAG AA standard (4.5:1)
  - Interactive elements visible
  - Focus indicators clear

---

## Cross-Browser Testing

### Desktop Browsers

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers

- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Samsung Internet

### Test Checklist Per Browser

- [ ] Page loads correctly
- [ ] Book animation works
- [ ] Touch gestures work (mobile)
- [ ] Forms submit successfully
- [ ] Admin panel functions
- [ ] No console errors
- [ ] Styles render correctly

---

## Continuous Integration

Add to `.github/workflows/test.yml`:

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm run install:all
      - run: cd client && npm test
      - run: cd server && npm test
```

---

## Test Coverage Goals

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: All API endpoints
- **E2E Tests**: Critical user flows
- **Accessibility**: WCAG AA compliance
- **Performance**: Lighthouse score 90+

---

## Reporting Issues

When reporting bugs, include:
1. Browser/device information
2. Steps to reproduce
3. Expected vs actual behavior
4. Screenshots/videos if applicable
5. Console errors (if any)
