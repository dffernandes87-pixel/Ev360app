// Audio Beat Detector & Real-time Sound Synchronizer for Modo Show
// Supports both real microphone ambient capture and built-in concert beat synthesizer

export type AudioSourceType = 'mic' | 'synth' | 'off';

export interface AudioMetrics {
  volume: number; // 0 to 100
  bassEnergy: number; // 0 to 100
  isBeat: boolean;
  frequencyData: number[]; // 8 bands for visualizer
}

export class AudioBeatDetector {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private micStream: MediaStream | null = null;
  private synthInterval: number | null = null;
  private animationFrameId: number | null = null;

  private sensitivity: number = 75; // 1 to 100
  private fftBand: 'bass' | 'mids' | 'full' = 'bass';
  private onBeatCallback: ((intensity: number) => void) | null = null;
  private onMetricsCallback: ((metrics: AudioMetrics) => void) | null = null;

  private lastBeatTime: number = 0;
  private energyHistory: number[] = [];
  private currentMode: AudioSourceType = 'off';
  private synthBpm: number = 124;
  private synthSoundEnabled: boolean = false;

  constructor() {
    // Lazy initialized on user action
  }

  public setSensitivity(val: number) {
    this.sensitivity = Math.max(1, Math.min(100, val));
  }

  public setFftBand(band: 'bass' | 'mids' | 'full') {
    this.fftBand = band;
  }

  public setBpm(bpm: number) {
    this.synthBpm = bpm;
    if (this.currentMode === 'synth') {
      this.restartSynth();
    }
  }

  public setSynthSound(enabled: boolean) {
    this.synthSoundEnabled = enabled;
  }

  public onBeat(cb: (intensity: number) => void) {
    this.onBeatCallback = cb;
  }

  public onMetrics(cb: (metrics: AudioMetrics) => void) {
    this.onMetricsCallback = cb;
  }

  private initAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // 1. START REAL MICROPHONE CAPTURE
  public async startMicrophone(): Promise<boolean> {
    this.stop();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        }
      });
      this.micStream = stream;
      const ctx = this.initAudioContext();
      
      this.analyser = ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.4;

      this.sourceNode = ctx.createMediaStreamSource(stream);
      this.sourceNode.connect(this.analyser);

      this.currentMode = 'mic';
      this.startAnalysisLoop();
      return true;
    } catch (err) {
      console.warn('Microphone access not granted or unavailable:', err);
      // Fallback to synth if mic fails
      this.startSynth();
      return false;
    }
  }

  // 2. START CONCERT BEAT SYNTHESIZER (Simulates live music kick drum rhythm)
  public startSynth() {
    this.stop();
    const ctx = this.initAudioContext();

    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.3;

    this.currentMode = 'synth';
    this.restartSynth();
    this.startAnalysisLoop();
  }

  private restartSynth() {
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }

    const intervalMs = Math.round((60000 / this.synthBpm));
    this.synthInterval = window.setInterval(() => {
      this.triggerSynthBeat();
    }, intervalMs);
  }

  private triggerSynthBeat() {
    if (!this.audioCtx) return;

    // Synthesize low-frequency kick drum punch (40Hz to 120Hz pitch drop)
    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(38, now + 0.12);

      // Audible if user enabled sound, or silent to analyser
      gain.gain.setValueAtTime(this.synthSoundEnabled ? 0.4 : 0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

      osc.connect(gain);
      if (this.analyser) {
        // Also connect to analyser with high gain so analyser sees the beat peak
        const boostGain = this.audioCtx.createGain();
        boostGain.gain.setValueAtTime(1.0, now);
        osc.connect(boostGain);
        boostGain.connect(this.analyser);
      }

      if (this.synthSoundEnabled) {
        gain.connect(this.audioCtx.destination);
      }

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // AudioContext state error handler
    }

    // Direct beat trigger fallback for synthesizer
    if (this.onBeatCallback) {
      this.onBeatCallback(0.9);
    }
  }

  // 3. ANALYSIS LOOP
  private startAnalysisLoop() {
    const bufferLength = this.analyser ? this.analyser.frequencyBinCount : 128;
    const dataArray = new Uint8Array(bufferLength);

    const loop = () => {
      if (!this.analyser) return;

      this.analyser.getByteFrequencyData(dataArray);

      // Analyze Bass Band (Bins 1 to 6 correspond to ~30Hz to ~160Hz with 256 FFT at 44.1kHz)
      let bassSum = 0;
      const bassBins = Math.min(7, bufferLength);
      for (let i = 1; i < bassBins; i++) {
        bassSum += dataArray[i];
      }
      const bassAvg = bassSum / (bassBins - 1);
      const bassEnergy = Math.min(100, Math.round((bassAvg / 255) * 100));

      // Total volume
      let totalSum = 0;
      for (let i = 0; i < bufferLength; i++) {
        totalSum += dataArray[i];
      }
      const volume = Math.min(100, Math.round((totalSum / bufferLength / 255) * 100));

      // 8-Band Frequency preview for VU visualizer
      const bands: number[] = [];
      const step = Math.floor(bufferLength / 8);
      for (let b = 0; b < 8; b++) {
        let bSum = 0;
        for (let j = 0; j < step; j++) {
          bSum += dataArray[b * step + j] || 0;
        }
        bands.push(Math.min(100, Math.round((bSum / step / 255) * 100)));
      }

      // Dynamic Beat Detection based on sensitivity threshold
      // Sensitivity 100 => threshold 1.15; Sensitivity 50 => threshold 1.45; Sensitivity 1 => threshold 2.0
      const thresholdFactor = 2.0 - (this.sensitivity / 100) * 0.9;
      
      this.energyHistory.push(bassEnergy);
      if (this.energyHistory.length > 20) {
        this.energyHistory.shift();
      }

      const avgEnergy = this.energyHistory.reduce((a, b) => a + b, 0) / this.energyHistory.length;
      const now = performance.now();
      const minBeatInterval = 220; // max ~270 BPM

      let isBeat = false;
      if (
        bassEnergy > 15 &&
        bassEnergy > avgEnergy * thresholdFactor &&
        now - this.lastBeatTime > minBeatInterval
      ) {
        this.lastBeatTime = now;
        isBeat = true;
        if (this.onBeatCallback) {
          const intensity = Math.min(1.0, bassEnergy / 80);
          this.onBeatCallback(intensity);
        }
      }

      if (this.onMetricsCallback) {
        this.onMetricsCallback({
          volume,
          bassEnergy,
          isBeat,
          frequencyData: bands,
        });
      }

      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  public stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
    this.currentMode = 'off';
  }

  public getMode(): AudioSourceType {
    return this.currentMode;
  }
}

// Global singleton instance for app-wide sharing
export const audioBeatDetector = new AudioBeatDetector();
