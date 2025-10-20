// Elementos do DOM
const timerDisplay = document.getElementById('timerDisplay');
const modeDisplay = document.getElementById('modeDisplay');
const sessionCount = document.getElementById('sessionCount');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const skipBtn = document.getElementById('skipBtn');
const tabBtns = document.querySelectorAll('.tab-btn');
const timerSection = document.querySelector('.timer-section');

// Nomes dos modos em português
const modeNames = {
  focus: 'Foco',
  shortBreak: 'Pausa Curta',
  longBreak: 'Pausa Longa'
};

// Atualizar UI com o estado atual
async function updateUI() {
  const state = await chrome.runtime.sendMessage({ type: 'GET_STATE' });

  if (!state) return;

  // Atualizar timer display
  const minutes = Math.floor(state.timeRemaining / 60);
  const seconds = state.timeRemaining % 60;
  timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Atualizar modo
  modeDisplay.textContent = modeNames[state.mode];

  // Atualizar contador de sessões
  sessionCount.textContent = state.sessionsCompleted;

  // Atualizar botões
  if (state.isRunning) {
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    timerSection.classList.add('running');
  } else {
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    timerSection.classList.remove('running');
  }

  // Atualizar tabs ativos
  tabBtns.forEach(btn => {
    if (btn.dataset.mode === state.mode) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// Event listeners
startBtn.addEventListener('click', async () => {
  await chrome.runtime.sendMessage({ type: 'START_TIMER' });
  updateUI();
});

pauseBtn.addEventListener('click', async () => {
  await chrome.runtime.sendMessage({ type: 'PAUSE_TIMER' });
  updateUI();
});

resetBtn.addEventListener('click', async () => {
  await chrome.runtime.sendMessage({ type: 'RESET_TIMER' });
  updateUI();
});

skipBtn.addEventListener('click', async () => {
  await chrome.runtime.sendMessage({ type: 'SKIP_TIMER' });
  updateUI();
});

// Trocar modo manualmente
tabBtns.forEach(btn => {
  btn.addEventListener('click', async () => {
    const mode = btn.dataset.mode;
    await chrome.runtime.sendMessage({ type: 'CHANGE_MODE', mode });
    updateUI();
  });
});

// Atualizar UI a cada segundo
setInterval(updateUI, 1000);

// Inicializar UI quando abrir popup
updateUI();

// Listener para mensagens do background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TIMER_TICK' || message.type === 'TIMER_COMPLETE') {
    updateUI();
  }
});
