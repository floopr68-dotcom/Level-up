/**
 * Shinobi Audio Synthesizer
 * Uses Web Audio API to create authentic anime sound effects (Chakra, Jutsu, Level Up, Timer)
 */

class ShinobiSoundEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Soft ninja click / tab select
  playClick() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // AudioContext policy safe
    }
  }

  // Chakra Pulse / Stamina Recovery surge
  playChakraCharge() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Low resonance oscillator + high shimmer
      const oscLow = this.ctx.createOscillator();
      const oscHigh = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      oscLow.type = 'triangle';
      oscLow.frequency.setValueAtTime(120, now);
      oscLow.frequency.exponentialRampToValueAtTime(340, now + 0.6);

      oscHigh.type = 'sine';
      oscHigh.frequency.setValueAtTime(520, now);
      oscHigh.frequency.exponentialRampToValueAtTime(1180, now + 0.6);

      gain.gain.setValueAtTime(0.02, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.35);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      oscLow.connect(gain);
      oscHigh.connect(gain);
      gain.connect(this.ctx.destination);

      oscLow.start(now);
      oscHigh.start(now);
      oscLow.stop(now + 0.7);
      oscHigh.stop(now + 0.7);
    } catch {
      // AudioContext policy safe
    }
  }

  // Shuriken Whoosh / Swift action
  playWhoosh() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // AudioContext policy safe
    }
  }

  // Level Up / Rank Elevation Fanfare
  playLevelUp() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Chord notes (Naruto energetic triumphant arpeggio: D4, F#4, A4, D5)
      const notes = [293.66, 369.99, 440.0, 587.33, 880.0];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + idx * 0.09;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.15, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + 0.5);
      });
    } catch {
      // AudioContext policy safe
    }
  }

  // Rest Timer beep (1 second countdown)
  playTimerTick(isFinal: boolean = false) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(isFinal ? 880 : 440, now);

      gain.gain.setValueAtTime(isFinal ? 0.2 : 0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (isFinal ? 0.35 : 0.1));

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + (isFinal ? 0.35 : 0.1));
    } catch {
      // AudioContext policy safe
    }
  }
}

export const soundEngine = new ShinobiSoundEngine();
