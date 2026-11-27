// Gobble Getaway — all sound, made with the Web Audio API.
// No audio files: every effect is a small synthesised gesture, and the
// background tune is a cheerful bass-and-pluck loop that quickens as
// the farmer closes in.

export class SoundBank {
  constructor() {
    this.context = null;
    this.muted = false;
    this.musicTimer = null;
    this.musicStep = 0;
    this.musicTempo = 150; // beats per minute, raised when the farmer nears
  }

  // Browsers only allow audio after a user gesture; the first key or
  // click creates the context, so calling this from any input is safe.
  ensureContext() {
    if (!this.context) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      this.context = new AudioContext();
    }
    if (this.context.state === 'suspended') {
      this.context.resume().catch(() => {});
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.context) {
      this.context.suspend().catch(() => {});
      if (!this.muted) this.context.resume().catch(() => {});
    }
    return this.muted;
  }

  tone({ frequency, endFrequency = null, duration = 0.15, type = 'sine', volume = 0.2, when = 0 }) {
    if (!this.context || this.muted) return;
    const start = this.context.currentTime + when;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    if (endFrequency !== null) {
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, endFrequency), start + duration);
    }
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    oscillator.connect(gain).connect(this.context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }

  noise({ duration = 0.2, volume = 0.15, when = 0, lowpass = 1200 }) {
    if (!this.context || this.muted) return;
    const start = this.context.currentTime + when;
    const length = Math.max(1, Math.floor(this.context.sampleRate * duration));
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    const filter = this.context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = lowpass;
    const gain = this.context.createGain();
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    source.connect(filter).connect(gain).connect(this.context.destination);
    source.start(start);
  }

  // The turkey's signature sound: three quick descending gobbles.
  gobble() {
    this.tone({ frequency: 320, endFrequency: 140, duration: 0.09, type: 'square', volume: 0.12 });
    this.tone({ frequency: 300, endFrequency: 130, duration: 0.09, type: 'square', volume: 0.12, when: 0.1 });
    this.tone({ frequency: 280, endFrequency: 120, duration: 0.12, type: 'square', volume: 0.12, when: 0.2 });
  }

  flap() {
    this.noise({ duration: 0.16, volume: 0.14, lowpass: 900 });
  }

  cornPickup() {
    this.tone({ frequency: 660, duration: 0.08, volume: 0.16 });
    this.tone({ frequency: 990, duration: 0.12, volume: 0.16, when: 0.07 });
  }

  stumble() {
    this.tone({ frequency: 220, endFrequency: 70, duration: 0.25, type: 'sawtooth', volume: 0.18 });
    this.noise({ duration: 0.2, volume: 0.2, lowpass: 500 });
  }

  spottedAlarm() {
    this.tone({ frequency: 880, duration: 0.1, type: 'square', volume: 0.1 });
    this.tone({ frequency: 880, duration: 0.1, type: 'square', volume: 0.1, when: 0.14 });
  }

  caughtSting() {
    [392, 311, 233, 175].forEach((frequency, i) => {
      this.tone({ frequency, duration: 0.22, type: 'triangle', volume: 0.2, when: i * 0.16 });
    });
  }

  escapeFanfare() {
    [523, 659, 784, 1047, 1319].forEach((frequency, i) => {
      this.tone({ frequency, duration: 0.28, type: 'triangle', volume: 0.2, when: i * 0.12 });
    });
    this.gobble();
  }

  stageClear() {
    this.tone({ frequency: 523, duration: 0.1, volume: 0.15 });
    this.tone({ frequency: 784, duration: 0.18, volume: 0.15, when: 0.1 });
  }

  startMusic() {
    this.ensureContext();
    if (!this.context || this.musicTimer) return;
    // A bouncy 8-step bassline in A minor with a plucked answer.
    const bass = [110, 0, 130.8, 0, 98, 0, 130.8, 146.8];
    const pluck = [440, 523, 659, 523, 392, 440, 523, 659];
    const stepMs = () => (60 / this.musicTempo / 2) * 1000;
    const tick = () => {
      if (this.muted || !this.context) return;
      const i = this.musicStep % 8;
      if (bass[i]) this.tone({ frequency: bass[i], duration: 0.22, type: 'triangle', volume: 0.1 });
      if (this.musicStep % 2 === 0) {
        this.tone({ frequency: pluck[i], duration: 0.12, type: 'sine', volume: 0.05 });
      }
      this.musicStep += 1;
      this.musicTimer = setTimeout(tick, stepMs());
    };
    this.musicTimer = setTimeout(tick, 0);
  }

  stopMusic() {
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  setUrgency(farmerClose) {
    this.musicTempo = farmerClose ? 190 : 150;
  }
}
