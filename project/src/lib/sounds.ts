/**
 * UI Sound effects for the HappyCleaning app.
 * Uses the HTML5 Audio API to play short, pleasant feedback sounds.
 */

const SOUND_URLS = {
  // Smooth, high-pitched "ding" for task completion (Dopamine hit)
  complete: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  // Soft, clean "tick" for general button clicks
  click: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  // Subtle "whoosh" for screen transitions or opens
  open: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3',
};

class SoundManager {
  private audios: Record<string, HTMLAudioElement> = {};

  constructor() {
    // Preload sounds
    if (typeof window !== 'undefined') {
      Object.entries(SOUND_URLS).forEach(([key, url]) => {
        const audio = new Audio(url);
        audio.preload = 'auto';
        this.audios[key] = audio;
      });
    }
  }

  play(sound: keyof typeof SOUND_URLS) {
    const audio = this.audios[sound];
    if (audio) {
      // Reset to start if already playing
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Ignore autoplay blocks (user hasn't interacted yet)
      });
    }
  }
}

export const sounds = new SoundManager();
