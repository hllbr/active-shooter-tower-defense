export const audioCache: Record<string, HTMLAudioElement> = {};
let backgroundMusic: HTMLAudioElement | null = null;

export function playSound(name: string | undefined) {
  if (!name) return;
  if (!audioCache[name]) {
    // Önce .wav dene, sonra .mp3 dene
    audioCache[name] = new Audio(`/sounds/${name}.wav`);
    audioCache[name].onerror = () => {
      audioCache[name] = new Audio(`/sounds/${name}.mp3`);
    };
  }
  const audio = audioCache[name];
  audio.currentTime = 0;
  audio.play().catch(() => {
    console.log(`🔇 Ses oynatılamadı: ${name}`);
  });
}

// 🎵 Background müzik fonksiyonları
export function startBackgroundMusic() {
  if (!backgroundMusic) {
    backgroundMusic = new Audio('/sounds/gamesound.wav');
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.3; // %30 ses seviyesi
  }
  
  backgroundMusic.play().catch(() => {
    console.log('🔇 Background müzik oynatılamadı');
  });
}

export function stopBackgroundMusic() {
  if (backgroundMusic) {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
  }
}

export function setMusicVolume(volume: number) {
  if (backgroundMusic) {
    backgroundMusic.volume = Math.max(0, Math.min(1, volume));
  }
}
