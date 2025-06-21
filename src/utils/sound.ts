export const audioCache: Record<string, HTMLAudioElement> = {};

export function playSound(name: string | undefined) {
  if (!name) return;
  if (!audioCache[name]) {
    audioCache[name] = new Audio(`/sounds/${name}.mp3`);
  }
  const audio = audioCache[name];
  audio.currentTime = 0;
  audio.play().catch(() => {});
}
