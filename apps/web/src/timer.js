// Timer class - adapted from Chrome extension
export class Timer {
  constructor() {
    this.state = this.loadState();
    this.settings = this.loadSettings();
    this.tickInterval = null;
    this.tickCallback = null;
    this.completeCallback = null;
  }

  // Get default settings
  static getDefaultSettings() {
    return {
      focusDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      longBreakInterval: 4,
      soundEnabled: true,
      notificationsEnabled: true
    };
  }

  // Load state from localStorage
  loadState() {
    const saved = localStorage.getItem('pomodoroState');
    if (saved) {
      return JSON.parse(saved);
    }

    return {
      mode: 'focus',
      timeRemaining: 25 * 60,
      isRunning: false,
      sessionsCompleted: 0
    };
  }

  // Save state to localStorage
  saveState() {
    localStorage.setItem('pomodoroState', JSON.stringify(this.state));
  }

  // Load settings from localStorage
  loadSettings() {
    const saved = localStorage.getItem('pomodoroSettings');
    if (saved) {
      return JSON.parse(saved);
    }
    return Timer.getDefaultSettings();
  }

  // Save settings to localStorage
  saveSettings() {
    localStorage.setItem('pomodoroSettings', JSON.stringify(this.settings));
  }

  // Get current state
  getState() {
    return { ...this.state };
  }

  // Get settings
  getSettings() {
    return { ...this.settings };
  }

  // Update settings
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();

    // Update time remaining if not running
    if (!this.state.isRunning) {
      this.state.timeRemaining = this.getDurationForMode(this.state.mode) * 60;
      this.saveState();
    }
  }

  // Restore default settings
  restoreDefaults() {
    this.settings = Timer.getDefaultSettings();
    this.saveSettings();

    // Reset timer
    if (!this.state.isRunning) {
      this.state.timeRemaining = this.getDurationForMode(this.state.mode) * 60;
      this.saveState();
    }
  }

  // Get duration for a specific mode
  getDurationForMode(mode) {
    switch (mode) {
      case 'focus':
        return this.settings.focusDuration;
      case 'shortBreak':
        return this.settings.shortBreakDuration;
      case 'longBreak':
        return this.settings.longBreakDuration;
      default:
        return this.settings.focusDuration;
    }
  }

  // Start timer
  start() {
    if (this.state.isRunning) return;

    this.state.isRunning = true;
    this.saveState();

    // Create interval (1 second)
    this.tickInterval = setInterval(() => {
      this.tick();
    }, 1000);
  }

  // Pause timer
  pause() {
    if (!this.state.isRunning) return;

    this.state.isRunning = false;
    this.saveState();

    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  // Reset timer
  reset() {
    this.pause();
    this.state.timeRemaining = this.getDurationForMode(this.state.mode) * 60;
    this.saveState();
  }

  // Skip to next mode
  skip() {
    this.pause();
    this.switchToNextMode();
    this.saveState();
  }

  // Change mode
  changeMode(newMode) {
    this.pause();
    this.state.mode = newMode;
    this.state.timeRemaining = this.getDurationForMode(newMode) * 60;
    this.saveState();
  }

  // Timer tick (every second)
  tick() {
    this.state.timeRemaining--;

    if (this.state.timeRemaining <= 0) {
      // Timer completed
      const completedMode = this.state.mode;

      // Increment sessions if focus completed
      if (completedMode === 'focus') {
        this.state.sessionsCompleted++;
      }

      // Switch to next mode
      this.switchToNextMode();

      // Pause timer
      this.pause();

      // Save state
      this.saveState();

      // Call complete callback
      if (this.completeCallback) {
        this.completeCallback(completedMode);
      }
    } else {
      // Save state
      this.saveState();

      // Call tick callback
      if (this.tickCallback) {
        this.tickCallback();
      }
    }
  }

  // Switch to next mode
  switchToNextMode() {
    if (this.state.mode === 'focus') {
      // Check if it's time for long break
      if (this.state.sessionsCompleted % this.settings.longBreakInterval === 0) {
        this.state.mode = 'longBreak';
      } else {
        this.state.mode = 'shortBreak';
      }
    } else {
      // After any break, return to focus
      this.state.mode = 'focus';
    }

    this.state.timeRemaining = this.getDurationForMode(this.state.mode) * 60;
  }

  // Register tick callback
  onTick(callback) {
    this.tickCallback = callback;
  }

  // Register complete callback
  onComplete(callback) {
    this.completeCallback = callback;
  }
}
