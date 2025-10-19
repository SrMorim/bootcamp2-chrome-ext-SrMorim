// Configurações padrão
const DEFAULT_SETTINGS = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  soundEnabled: true
};

// Elementos do DOM
const form = document.getElementById('settingsForm');
const focusDuration = document.getElementById('focusDuration');
const shortBreakDuration = document.getElementById('shortBreakDuration');
const longBreakDuration = document.getElementById('longBreakDuration');
const longBreakInterval = document.getElementById('longBreakInterval');
const soundEnabled = document.getElementById('soundEnabled');
const resetBtn = document.getElementById('resetBtn');
const statusDiv = document.getElementById('status');

// Carregar configurações salvas
async function loadSettings() {
  try {
    const { settings } = await chrome.storage.local.get('settings');
    const currentSettings = settings || DEFAULT_SETTINGS;

    focusDuration.value = currentSettings.focusDuration;
    shortBreakDuration.value = currentSettings.shortBreakDuration;
    longBreakDuration.value = currentSettings.longBreakDuration;
    longBreakInterval.value = currentSettings.longBreakInterval;
    soundEnabled.checked = currentSettings.soundEnabled;
  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
    showStatus('Erro ao carregar configurações', 'error');
  }
}

// Salvar configurações
async function saveSettings(e) {
  e.preventDefault();

  const settings = {
    focusDuration: parseInt(focusDuration.value),
    shortBreakDuration: parseInt(shortBreakDuration.value),
    longBreakDuration: parseInt(longBreakDuration.value),
    longBreakInterval: parseInt(longBreakInterval.value),
    soundEnabled: soundEnabled.checked
  };

  try {
    await chrome.storage.local.set({ settings });

    // Notificar o service worker sobre as mudanças
    await chrome.runtime.sendMessage({
      type: 'UPDATE_SETTINGS',
      settings
    });

    showStatus('Configurações salvas com sucesso!', 'success');
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    showStatus('Erro ao salvar configurações', 'error');
  }
}

// Restaurar padrões
async function restoreDefaults() {
  try {
    await chrome.storage.local.set({ settings: DEFAULT_SETTINGS });

    // Atualizar campos do formulário
    focusDuration.value = DEFAULT_SETTINGS.focusDuration;
    shortBreakDuration.value = DEFAULT_SETTINGS.shortBreakDuration;
    longBreakDuration.value = DEFAULT_SETTINGS.longBreakDuration;
    longBreakInterval.value = DEFAULT_SETTINGS.longBreakInterval;
    soundEnabled.checked = DEFAULT_SETTINGS.soundEnabled;

    // Notificar o service worker
    await chrome.runtime.sendMessage({
      type: 'UPDATE_SETTINGS',
      settings: DEFAULT_SETTINGS
    });

    showStatus('Configurações padrão restauradas!', 'success');
  } catch (error) {
    console.error('Erro ao restaurar padrões:', error);
    showStatus('Erro ao restaurar padrões', 'error');
  }
}

// Mostrar mensagem de status
function showStatus(message, type) {
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;

  setTimeout(() => {
    statusDiv.classList.add('hidden');
  }, 3000);
}

// Event listeners
form.addEventListener('submit', saveSettings);
resetBtn.addEventListener('click', restoreDefaults);

// Carregar configurações ao abrir a página
loadSettings();
