# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Bootcamp Pomodoro** is a Chrome extension that implements a Pomodoro timer with customizable settings. This is the initial delivery project for Bootcamp II, built with Chrome Extension Manifest V3.

## Project Type

Chrome Extension (Manifest V3) - Pomodoro Timer

## Key Features

- Timer with three modes: Focus (25min), Short Break (5min), Long Break (15min)
- Customizable durations through options page
- Sound alerts when sessions complete
- Session counter
- State persistence using chrome.storage
- Auto-transition between modes
- Badge showing remaining time

## Development Commands

This project uses vanilla JavaScript without build tools. To develop:

```bash
# No build step required - load directly in Chrome

# To test in Chrome:
# 1. Open chrome://extensions
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the project root directory

# To create a release ZIP:
zip -r bootcamp-pomodoro-v1.0.0.zip manifest.json icons/ src/ -x "*.py" "*.md" ".git/*"

# To regenerate icons (if needed):
python3 create_simple_icons.py

# To regenerate sounds (if needed):
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

## Future Enhancements (Beyond Initial Delivery)

Ideas for intermediate/final deliveries:
- Statistics dashboard with charts
- Task management integration
- Multiple timer profiles
- Sync across devices using chrome.storage.sync
- Customizable color themes
- Browser notifications with custom text
- Integration with productivity tools
