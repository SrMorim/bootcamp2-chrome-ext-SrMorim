# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Bootcamp Pomodoro** is a Chrome extension that implements a Pomodoro timer with customizable settings. This is part of the Bootcamp II project, built with Chrome Extension Manifest V3.

**Deliveries:**
- v1.0.0: Initial delivery - Functional Pomodoro timer with Manifest V3
- v1.1.0: Intermediate delivery - Docker + CI/CD + E2E Tests with Playwright

## Project Type

Chrome Extension (Manifest V3) - Pomodoro Timer with E2E Testing & CI/CD

## Key Features

- Timer with three modes: Focus (25min), Short Break (5min), Long Break (15min)
- Customizable durations through options page
- Sound alerts when sessions complete
- Session counter
- State persistence using chrome.storage
- Auto-transition between modes
- Badge showing remaining time

## Development Commands

### Setup

```bash
# Install dependencies
npm install

# Install Playwright browsers
npm run playwright:install
```

### Build & Test

```bash
# Build extension to dist/
npm run build

# Run E2E tests
npm run test:e2e

# Run tests with UI (interactive mode)
npm run test:e2e:ui

# Full CI flow (build + test)
npm test
```

### Docker Commands

```bash
# Build Docker image
docker compose build

# Run tests in container
docker compose run --rm e2e

# Or simply
docker compose up

# View Playwright report after tests
npx playwright show-report
```

### Manual Testing in Chrome

```bash
# 1. Build the extension
npm run build

# 2. Open chrome://extensions
# 3. Enable "Developer mode"
# 4. Click "Load unpacked"
# 5. Select the dist/ directory
```

### Helper Scripts

```bash
# Regenerate icons (if needed)
python3 create_simple_icons.py

# Regenerate sounds (if needed)
python3 create_sounds.py
```

## Architecture

### Manifest V3 Structure

- **manifest.json**: Extension configuration with permissions (storage, alarms, notifications, offscreen)
- **Popup** (`src/popup/`): Main UI - timer display and controls
- **Service Worker** (`src/background/service-worker.js`): Timer logic, alarms, notifications
- **Options Page** (`src/options/`): Settings for customizing durations
- **Offscreen Document** (`src/assets/offscreen.html`): Required for audio playback in MV3

### Communication Flow

```
Popup UI ←→ Service Worker ←→ Chrome Storage
    ↓              ↓
  Display      Alarms/Notifications
```

### State Management

The timer state is managed in the service worker and persisted to chrome.storage.local:
- `mode`: Current mode (focus/shortBreak/longBreak)
- `timeRemaining`: Seconds remaining
- `isRunning`: Boolean timer state
- `sessionsCompleted`: Number of completed pomodoros
- `settings`: User preferences

## Important Files

### Core Extension Files

- `manifest.json` - Extension configuration (Manifest V3)
- `src/popup/popup.js` - UI logic and chrome.runtime messaging
- `src/background/service-worker.js` - Timer engine using chrome.alarms API
- `src/options/options.js` - Settings management

### Supporting Files

- `icons/` - Extension icons (16, 32, 48, 128px)
- `src/assets/sounds/` - Alert sounds (WAV format)
- `docs/` - GitHub Pages landing page

## Chrome APIs Used

- **chrome.storage**: Persist timer state and settings
- **chrome.alarms**: Create recurring 1-second timer ticks
- **chrome.notifications**: Show completion notifications
- **chrome.runtime**: Message passing between popup and service worker
- **chrome.action**: Update badge text with remaining time
- **chrome.offscreen**: Create offscreen document for audio playback

## Development Notes

### Testing Checklist

When making changes, test:
1. Start/pause/reset timer functions
2. Mode switching (manual and auto-transition)
3. Settings persistence
4. Sound alerts (if enabled)
5. Badge updates
6. State persistence after closing popup
7. Notifications on completion

### Common Issues

- **Sounds not playing**: Offscreen document permission required in Manifest V3
- **Timer not updating**: Check chrome.alarms is firing (periodInMinutes: 1/60)
- **State lost**: Ensure chrome.storage.local.set() is called after state changes
- **Badge not showing**: Chrome limits badge text to 4 characters

### File Modification Guidelines

- **manifest.json**: Only modify if adding new permissions or resources
- **service-worker.js**: Timer logic lives here - be careful with alarm management
- **popup.js**: Updates UI every second - keep updateUI() function performant
- **options.js**: Settings changes must notify service worker via chrome.runtime.sendMessage

## Deployment

### GitHub Pages

The `docs/` folder contains a landing page deployed to GitHub Pages:
- Enable Pages in repo settings: Settings → Pages → Source: main branch, /docs folder
- Site will be available at: https://srmorim.github.io/bootcamp2-chrome-ext-SrMorim/

### Release Process

1. Update version in manifest.json
2. Create ZIP: `zip -r bootcamp-pomodoro-vX.Y.Z.zip manifest.json icons/ src/`
3. Create GitHub release with tag vX.Y.Z
4. Attach ZIP file to release
5. Update landing page download link

## Project Structure

```
├── manifest.json          # Extension manifest (MV3)
├── icons/                 # Extension icons
├── src/
│   ├── popup/            # Main UI
│   ├── background/       # Service worker (timer logic)
│   ├── options/          # Settings page
│   └── assets/           # Sounds and offscreen document
├── docs/                 # GitHub Pages site
├── README.md             # User documentation
└── LICENSE               # MIT License
```

## E2E Testing (Intermediate Delivery)

### Test Structure

Tests are located in `tests/` and use Playwright to test the extension in Chromium:

- **extension.spec.ts**: Extension loading, manifest validation, permissions
- **timer.spec.ts**: Timer functionality (start, pause, reset, skip, countdown)
- **persistence.spec.ts**: State persistence across popup reopens
- **options.spec.ts**: Settings page functionality

### Test Configuration

- **playwright.config.ts**: Configures Chromium with extension loaded
- Headless mode for CI
- Loads extension from `dist/` directory
- Generates HTML reports and screenshots on failure

### Writing New Tests

```typescript
// Open popup
const popup = await openPopup();

// Interact with elements
await popup.click('#startBtn');
await popup.waitForTimeout(2000);

// Assert state
const timerDisplay = await popup.locator('#timerDisplay').textContent();
expect(timerDisplay).not.toBe('25:00');

// Check service worker state
const state = await popup.evaluate(async () => {
  return await chrome.runtime.sendMessage({ type: 'GET_STATE' });
});
expect(state.isRunning).toBe(true);
```

## CI/CD Pipeline

### GitHub Actions Workflow

Located at `.github/workflows/ci.yml`. Runs on push and PR to `main`.

**Jobs:**
1. **test-build**: Install deps → Build extension → Run tests → Upload artifacts
2. **release**: Create GitHub Release automatically (only on push to main)

**Artifacts Generated:**
- `playwright-report/`: HTML test report
- `extension-zip`: Packaged extension
- `test-results/`: JSON results

**Auto-Release:**
- Triggers on successful tests on main branch
- Reads version from manifest.json
- Creates GitHub Release with tag vX.Y.Z
- Attaches extension.zip to release

### Docker Containerization

**Dockerfile:**
- Base: `mcr.microsoft.com/playwright:v1.46.0-jammy`
- Installs Node.js deps and Playwright/Chromium
- Builds extension during image build
- Default CMD: run tests

**docker-compose.yml:**
- Service `e2e` for running tests
- Mounts source code as volumes for development
- Sets `shm_size: 2gb` to prevent Chromium crashes
- Preserves test reports and results in host

## Future Enhancements (Beyond Intermediate Delivery)

Ideas for final delivery:
- Statistics dashboard with charts
- Task management integration
- Multiple timer profiles
- Sync across devices using chrome.storage.sync
- Customizable color themes
- Integration with productivity tools
- Performance testing
- Visual regression testing
