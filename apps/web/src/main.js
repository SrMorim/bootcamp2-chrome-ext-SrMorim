import './styles.css';
import { Timer } from './timer.js';
import { ApiClient } from './api-client.js';

// Initialize
const timer = new Timer();
const apiClient = new ApiClient();

// DOM Elements
const timerDisplay = document.getElementById('timerDisplay');
const modeDisplay = document.getElementById('modeDisplay');
const sessionCount = document.getElementById('sessionCount');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const skipBtn = document.getElementById('skipBtn');
const tabBtns = document.querySelectorAll('.tab-btn');
const timerSection = document.querySelector('.timer-section');
const quoteSection = document.getElementById('quoteSection');
const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const onlineStatus = document.getElementById('onlineStatus');

// Navigation
const navBtns = document.querySelectorAll('.nav-btn');
const historyTab = document.getElementById('historyTab');
const settingsTab = document.getElementById('settingsTab');
const mainContent = document.querySelector('main');

// History elements
const sessionsList = document.getElementById('sessionsList');
const totalSessions = document.getElementById('totalSessions');
const totalTime = document.getElementById('totalTime');
const todaySessions = document.getElementById('todaySessions');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

// Settings form
const focusDurationInput = document.getElementById('focusDuration');
const shortBreakDurationInput = document.getElementById('shortBreakDuration');
const longBreakDurationInput = document.getElementById('longBreakDuration');
const longBreakIntervalInput = document.getElementById('longBreakInterval');
const soundEnabledInput = document.getElementById('soundEnabled');
const notificationsEnabledInput = document.getElementById('notificationsEnabled');
const restoreDefaultsBtn = document.getElementById('restoreDefaultsBtn');

// Mode names
const modeNames = {
  focus: 'Foco',
  shortBreak: 'Pausa Curta',
  longBreak: 'Pausa Longa'
};

// Update UI with timer state
function updateUI() {
  const state = timer.getState();

  // Update timer display
  const minutes = Math.floor(state.timeRemaining / 60);
  const seconds = state.timeRemaining % 60;
  timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Update mode
  modeDisplay.textContent = modeNames[state.mode];

  // Update session count
  sessionCount.textContent = state.sessionsCompleted;

  // Update buttons
  if (state.isRunning) {
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    timerSection.classList.add('running');
  } else {
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    timerSection.classList.remove('running');
  }

  // Update active tab
  tabBtns.forEach(btn => {
    if (btn.dataset.mode === state.mode) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Show quote during breaks
  if (state.mode === 'shortBreak' || state.mode === 'longBreak') {
    if (quoteSection.style.display === 'none') {
      loadQuote();
    }
    quoteSection.style.display = 'block';
  } else {
    quoteSection.style.display = 'none';
  }
}

// Load motivational quote
async function loadQuote() {
  try {
    quoteText.innerHTML = '<span class="loading"></span> Carregando frase...';
    quoteAuthor.textContent = '';

    const quote = await apiClient.getQuote();
    quoteText.textContent = `"${quote.content}"`;
    quoteAuthor.textContent = `— ${quote.author}`;
  } catch (error) {
    console.error('Failed to load quote:', error);
    quoteText.textContent = 'Aproveite sua pausa! ☕';
    quoteAuthor.textContent = '';
  }
}

// Event Listeners
startBtn.addEventListener('click', () => {
  timer.start();
  updateUI();
});

pauseBtn.addEventListener('click', () => {
  timer.pause();
  updateUI();
});

resetBtn.addEventListener('click', () => {
  if (confirm('Resetar o timer atual?')) {
    timer.reset();
    updateUI();
  }
});

skipBtn.addEventListener('click', () => {
  if (confirm('Pular para a próxima sessão?')) {
    timer.skip();
    updateUI();
  }
});

// Mode tabs
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const mode = btn.dataset.mode;
    timer.changeMode(mode);
    updateUI();
  });
});

// Timer tick callback
timer.onTick(() => {
  updateUI();
});

// Timer complete callback
timer.onComplete(async (completedMode) => {
  updateUI();

  // Save session to backend
  try {
    await apiClient.saveSession({
      mode: completedMode,
      duration: timer.getDurationForMode(completedMode),
      completedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to save session:', error);
  }

  // Show notification
  if (Notification.permission === 'granted') {
    const modeName = modeNames[completedMode];
    new Notification('Pomodoro Completo!', {
      body: `Sessão de ${modeName} finalizada. Parabéns!`,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png'
    });
  }

  // Play sound
  const settings = timer.getSettings();
  if (settings.soundEnabled) {
    playSound();
  }
});

// Play completion sound
function playSound() {
  const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSd+zPLTgjMGHm/A7+OZSA0PXLLT7K1aFQlGpOLyvWseBSJ4yfXYkTsIGnXG6t+XTAoRYLXr7K5aEwhBmuHyvm0fBiF2x/TalD0IGW7B7d+XTQsQX7Xr7K1ZFAlBmuHyvm0fBiF2x/TalD0IGW7B7d+XTQsQX7Xr7K1ZFAlBmuHyvm0fBiF2x/TalD0IGW7B7d+XTQsQX7Xr7K1ZFAlBmuHyvm0fBiF2x/TalD0IGW7B7d+XTQsQX7Xr7K1ZFAlBmuHyvm0fBiF2x/TalD0IGW7B7d+XTQsQX7Xr7K1ZFAlBmuHyvm0fBiF2x/TalD0IGW7B7d+XTQsQX7Xr7K1ZFAlBmuHyvm0fBiF2x/TalD0IGW7B7d+XTQsQX7Xr7K1ZFAlBmuHyvm0fBiF2x/TalD0IGW7B7d+XTQsQX7Xr7K1ZFAlBmuHyvm0fBiF2x/TalD0IGW7B7d+XTQsQX7Xr7K1ZFAlBmuHyvm0fBiF2x/TalD0IGW7B7d+XTQsQX7Xr7K1ZFAlBmuHyvm0fBiF2x/TalD0IGW7B7d+XTQsQX7Xr7K1ZFAlBmuHyvm0fBiF2x/TalD0IGW7B7d+XTQsQX7Xr7K1ZFAlBmuHyvm0fBiF2x/TalD0IGW7B7d+XTQsQX7Xr7K1ZFAlBmuHyvm0fBiF2x/TalD0IGW7B7d+XTQsQX7Xr7K1ZFAlBmuHyvm0fBiF2x/TalD0IGW7B7d+XTQsQX7Xr7K1ZFAlBmuHyvm0fBiF2x/TalD0IGW7B7d+XTQsQX7Xr7K1ZFAlBmuHyvm0fBiF2x/TalD0IGW7B7d+XTQsQX7Xr7K1ZFAlBmuHyvm0fBiF2x/TalD0IGW7B7d+XTQsQX7Xr7K1ZFAlBmuHyvm0fBiF2x/TalD0IGW7B7d+XT');
  audio.play().catch(e => console.log('Could not play sound:', e));
}

// Navigation between tabs
navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;

    // Update active nav button
    navBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Show correct content
    if (tab === 'timer') {
      mainContent.style.display = 'block';
      historyTab.style.display = 'none';
      settingsTab.style.display = 'none';
    } else if (tab === 'history') {
      mainContent.style.display = 'none';
      historyTab.style.display = 'block';
      settingsTab.style.display = 'none';
      loadHistory();
    } else if (tab === 'settings') {
      mainContent.style.display = 'none';
      historyTab.style.display = 'none';
      settingsTab.style.display = 'block';
      loadSettings();
    }
  });
});

// Load and display history
async function loadHistory() {
  try {
    const sessions = await apiClient.getSessions();

    if (sessions.length === 0) {
      sessionsList.innerHTML = '<p class="empty-state">Nenhuma sessão registrada ainda.</p>';
      totalSessions.textContent = '0';
      totalTime.textContent = '0h';
      todaySessions.textContent = '0';
      return;
    }

    // Calculate stats
    const total = sessions.length;
    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
    const totalHours = Math.floor(totalMinutes / 60);
    const today = sessions.filter(s => {
      const date = new Date(s.completedAt);
      const now = new Date();
      return date.toDateString() === now.toDateString();
    }).length;

    totalSessions.textContent = total;
    totalTime.textContent = totalHours > 0 ? `${totalHours}h` : `${totalMinutes}min`;
    todaySessions.textContent = today;

    // Render session items
    sessionsList.innerHTML = sessions.slice(0, 20).map(session => {
      const date = new Date(session.completedAt);
      const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const dateStr = date.toLocaleDateString('pt-BR');

      return `
        <div class="session-item">
          <div class="session-info">
            <div class="session-mode">${modeNames[session.mode]}</div>
            <div class="session-time">${dateStr} às ${timeStr}</div>
          </div>
          <div class="session-duration">${session.duration}min</div>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Failed to load history:', error);
    sessionsList.innerHTML = '<p class="empty-state">Erro ao carregar histórico.</p>';
  }
}

// Clear history
clearHistoryBtn.addEventListener('click', async () => {
  if (confirm('Tem certeza que deseja limpar todo o histórico?')) {
    try {
      await apiClient.clearSessions();
      loadHistory();
    } catch (error) {
      console.error('Failed to clear history:', error);
      alert('Erro ao limpar histórico.');
    }
  }
});

// Load settings
function loadSettings() {
  const settings = timer.getSettings();
  focusDurationInput.value = settings.focusDuration;
  shortBreakDurationInput.value = settings.shortBreakDuration;
  longBreakDurationInput.value = settings.longBreakDuration;
  longBreakIntervalInput.value = settings.longBreakInterval;
  soundEnabledInput.checked = settings.soundEnabled;
  notificationsEnabledInput.checked = settings.notificationsEnabled;
}

// Save settings
document.querySelector('.settings-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const newSettings = {
    focusDuration: parseInt(focusDurationInput.value),
    shortBreakDuration: parseInt(shortBreakDurationInput.value),
    longBreakDuration: parseInt(longBreakDurationInput.value),
    longBreakInterval: parseInt(longBreakIntervalInput.value),
    soundEnabled: soundEnabledInput.checked,
    notificationsEnabled: notificationsEnabledInput.checked
  };

  timer.updateSettings(newSettings);
  alert('Configurações salvas!');
});

// Restore defaults
restoreDefaultsBtn.addEventListener('click', () => {
  if (confirm('Restaurar configurações padrão?')) {
    timer.restoreDefaults();
    loadSettings();
  }
});

// Request notification permission
if (Notification.permission === 'default') {
  Notification.requestPermission();
}

// Online/offline status
function updateOnlineStatus() {
  if (navigator.onLine) {
    onlineStatus.textContent = '● Online';
    onlineStatus.className = 'status-badge online';
  } else {
    onlineStatus.textContent = '● Offline';
    onlineStatus.className = 'status-badge offline';
  }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();

// Initial UI update
updateUI();

// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(() => {
    console.log('Service Worker registered');
  }).catch(err => {
    console.error('Service Worker registration failed:', err);
  });
}

console.log('🍅 Bootcamp Pomodoro PWA v2.0.0 loaded');
