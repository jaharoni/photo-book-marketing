# Contributing to Photo Book Marketing App

Thank you for your interest in contributing! This document provides guidelines for contributing to this project.

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/photo-book-marketing.git`
3. Install dependencies: `npm run install:all`
4. Create a branch: `git checkout -b feature/your-feature-name`
5. Make your changes
6. Test locally: `npm run dev`
7. Commit your changes: `git commit -m 'Add some feature'`
8. Push to your fork: `git push origin feature/your-feature-name`
9. Open a Pull Request

## Code Style

- We use TypeScript for both frontend and backend
- Follow existing code formatting (ESLint configuration provided)
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

## Project Structure

- `client/` - React frontend with Vite
- `server/` - Express backend with TypeScript
- `content/` - JSON content files
- `data/` - User-generated data (leads)

## Testing

Before submitting a PR:

1. Test the marketing page on desktop and mobile
2. Test the virtual book animation and interaction
3. Test the lead capture form
4. Test the admin panel (login, editing, saving)
5. Ensure no console errors

## Pull Request Guidelines

- Keep PRs focused on a single feature or fix
- Update documentation if needed
- Add screenshots for UI changes
- Describe what your changes do and why

## Questions?

Feel free to open an issue for discussion before starting work on major changes.
