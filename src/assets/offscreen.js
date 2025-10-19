const audioPlayer = document.getElementById('audioPlayer');

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'PLAY_SOUND') {
    const soundFile = message.sound === 'complete' ? 'complete.wav' : 'ding.wav';
    audioPlayer.src = `sounds/${soundFile}`;
    audioPlayer.play().catch(err => console.log('Erro ao tocar áudio:', err));
  }
});
