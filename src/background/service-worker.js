// Configurações padrão do Pomodoro
const DEFAULT_SETTINGS = {
  focusDuration: 25,      // minutos
  shortBreakDuration: 5,  // minutos
  longBreakDuration: 15,  // minutos
  longBreakInterval: 4,   // após quantos pomodoros
  soundEnabled: true
};

// Estado do timer
let timerState = {
  mode: 'focus',
  timeRemaining: 25 * 60, // em segundos
  isRunning: false,
  sessionsCompleted: 0,
  settings: DEFAULT_SETTINGS
};

// Inicialização
chrome.runtime.onInstalled.addListener(async () => {
  console.log('Bootcamp Pomodoro instalado!');

  // Carregar configurações salvas ou usar padrões
  const stored = await chrome.storage.local.get(['settings', 'sessionsCompleted']);

  if (stored.settings) {
    timerState.settings = stored.settings;
  } else {
    await chrome.storage.local.set({ settings: DEFAULT_SETTINGS });
  }

  if (stored.sessionsCompleted) {
    timerState.sessionsCompleted = stored.sessionsCompleted;
  }

  // Inicializar tempo baseado no modo
  timerState.timeRemaining = timerState.settings.focusDuration * 60;

  // Salvar estado inicial
  await saveState();
});

// Salvar estado no storage
async function saveState() {
  await chrome.storage.local.set({
    timerState: {
      mode: timerState.mode,
      timeRemaining: timerState.timeRemaining,
      isRunning: timerState.isRunning,
      sessionsCompleted: timerState.sessionsCompleted
    }
  });
}

// Carregar estado do storage
async function loadState() {
  const stored = await chrome.storage.local.get(['timerState', 'settings']);

  if (stored.timerState) {
    timerState = { ...timerState, ...stored.timerState };
  }

  if (stored.settings) {
    timerState.settings = stored.settings;
  }
}

// Iniciar timer
async function startTimer() {
  timerState.isRunning = true;

  // Criar alarme que dispara a cada segundo
  chrome.alarms.create('pomodoroTick', {
    periodInMinutes: 1/60 // ~1 segundo
  });

  await saveState();
  updateBadge();
}

// Pausar timer
async function pauseTimer() {
  timerState.isRunning = false;
  chrome.alarms.clear('pomodoroTick');
  await saveState();
  updateBadge();
}

// Resetar timer
async function resetTimer() {
  timerState.isRunning = false;
  chrome.alarms.clear('pomodoroTick');

  // Resetar para o tempo do modo atual
  const duration = getDurationForMode(timerState.mode);
  timerState.timeRemaining = duration * 60;

  await saveState();
  updateBadge();
}

// Pular para próxima sessão
async function skipTimer() {
  timerState.isRunning = false;
  chrome.alarms.clear('pomodoroTick');

  // Ir para o próximo modo
  switchToNextMode();

  await saveState();
  updateBadge();
}

// Trocar modo
async function changeMode(newMode) {
  timerState.isRunning = false;
  chrome.alarms.clear('pomodoroTick');

  timerState.mode = newMode;
  const duration = getDurationForMode(newMode);
  timerState.timeRemaining = duration * 60;

  await saveState();
  updateBadge();
}

// Obter duração para um modo específico
function getDurationForMode(mode) {
  const settings = timerState.settings;

  switch (mode) {
    case 'focus':
      return settings.focusDuration;
    case 'shortBreak':
      return settings.shortBreakDuration;
    case 'longBreak':
      return settings.longBreakDuration;
    default:
      return settings.focusDuration;
  }
}

// Trocar para o próximo modo
function switchToNextMode() {
  if (timerState.mode === 'focus') {
    timerState.sessionsCompleted++;

    // A cada 4 pomodoros, pausa longa
    if (timerState.sessionsCompleted % timerState.settings.longBreakInterval === 0) {
      timerState.mode = 'longBreak';
    } else {
      timerState.mode = 'shortBreak';
    }
  } else {
    // Depois de qualquer pausa, volta para foco
    timerState.mode = 'focus';
  }

  const duration = getDurationForMode(timerState.mode);
  timerState.timeRemaining = duration * 60;
}

// Atualizar badge do ícone
function updateBadge() {
  const minutes = Math.floor(timerState.timeRemaining / 60);
  const text = timerState.isRunning ? String(minutes) : '';

  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color: '#27ae60' });
}

// Tocar som de alerta
async function playSound(soundType = 'complete') {
  if (!timerState.settings.soundEnabled) return;

  try {
    // Criar offscreen document para tocar áudio (MV3 requirement)
    const existingContexts = await chrome.runtime.getContexts({});
    const offscreenDocument = existingContexts.find(
      context => context.contextType === 'OFFSCREEN_DOCUMENT'
    );

    if (!offscreenDocument) {
      await chrome.offscreen.createDocument({
        url: 'src/assets/offscreen.html',
        reasons: ['AUDIO_PLAYBACK'],
        justification: 'Tocar som de notificação do Pomodoro'
      });
    }

    // Enviar mensagem para tocar som
    await chrome.runtime.sendMessage({
      type: 'PLAY_SOUND',
      sound: soundType
    });
  } catch (error) {
    console.log('Erro ao tocar som:', error);
  }
}

// Listener de alarmes
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'pomodoroTick' && timerState.isRunning) {
    timerState.timeRemaining--;

    if (timerState.timeRemaining <= 0) {
      // Timer completado
      await playSound('complete');

      // Notificação
      const modeName = timerState.mode === 'focus' ? 'Foco' :
                       timerState.mode === 'shortBreak' ? 'Pausa Curta' : 'Pausa Longa';

      chrome.notifications.create({
        type: 'basic',
        iconUrl: '../../icons/icon128.png',
        title: 'Pomodoro Completo!',
        message: `Sessão de ${modeName} finalizada. Parabéns!`,
        priority: 2
      });

      // Auto-transição para próximo modo
      switchToNextMode();
      timerState.isRunning = false;
      chrome.alarms.clear('pomodoroTick');

      await chrome.storage.local.set({ sessionsCompleted: timerState.sessionsCompleted });
    }

    await saveState();
    updateBadge();

    // Enviar mensagem para o popup se estiver aberto
    try {
      chrome.runtime.sendMessage({ type: 'TIMER_TICK' });
    } catch (e) {
      // Popup não está aberto, ignorar erro
    }
  }
});

// Listener de mensagens do popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    await loadState(); // Garantir estado atualizado

    switch (message.type) {
      case 'GET_STATE':
        sendResponse(timerState);
        break;

      case 'START_TIMER':
        await startTimer();
        sendResponse({ success: true });
        break;

      case 'PAUSE_TIMER':
        await pauseTimer();
        sendResponse({ success: true });
        break;

      case 'RESET_TIMER':
        await resetTimer();
        sendResponse({ success: true });
        break;

      case 'SKIP_TIMER':
        await skipTimer();
        sendResponse({ success: true });
        break;

      case 'CHANGE_MODE':
        await changeMode(message.mode);
        sendResponse({ success: true });
        break;

      case 'UPDATE_SETTINGS':
        timerState.settings = message.settings;
        await chrome.storage.local.set({ settings: message.settings });
        sendResponse({ success: true });
        break;

      default:
        sendResponse({ error: 'Unknown message type' });
    }
  })();

  return true; // Indica que vamos responder de forma assíncrona
});

// Carregar estado inicial
loadState();
