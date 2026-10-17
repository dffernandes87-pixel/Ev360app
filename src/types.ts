export type ShowEffect = 'fixed' | 'pulse' | 'flash' | 'fade' | 'strobe' | 'rainbow' | 'candle';

export type ImagePosition = 'center' | 'top' | 'bottom';
export type ImageEffect = 'none' | 'pulse' | 'rotate' | 'bounce' | 'invert';

export interface ShowImageConfig {
  enabled: boolean;
  url: string;
  name: string;
  scale: number; // 20 to 200 (%)
  position: ImagePosition;
  effect: ImageEffect;
  opacity: number; // 10 to 100 (%)
}

export type AudioReactionMode = 'flash_beat' | 'pulse_beat' | 'strobe_beat' | 'color_jump';
export type AudioFftBand = 'bass' | 'mids' | 'full';

export interface ShowState {
  isActive: boolean;
  color: string;
  colorMode: 'single' | 'gradient';
  gradientEndColor?: string;
  gradientAngle?: number;
  brightness: number; // 0 to 100
  intensity: number; // 0 to 100
  effect: ShowEffect;
  effectSpeed: number; // 0.5 to 3.0
  bpm: number; // beats per minute (e.g. 120)
  image: ShowImageConfig;
  strobeActive: boolean; // instant strobe burst
  blackoutActive: boolean; // instant blackout
  message?: string; // Optional screen overlay text (e.g. "BRAÇOS NO AR!")
  targetSector?: string; // "Todos", "Pista", "Camarote", etc.
  // Music & Sound Synchronization
  audioSyncEnabled: boolean; // Utiliza o som da música para sincronizar o piscar da tela
  audioSensitivity: number; // 1 to 100 (%)
  audioReactionMode: AudioReactionMode; // Modo de piscar ao detectar batida sonora
  audioFftBand: AudioFftBand; // Faixa de frequência (Graves/Bass, Médios ou Completo)
  updatedAt: number;
}

export interface EventProfile {
  id: string;
  name: string;
  code: string;
  connectionKey: string;
  status: 'online' | 'offline' | 'standby';
  connectedDevices: number;
  peakDevices: number;
  location: string;
  producer: string;
  sectors: string[];
  state: ShowState;
}

export interface ShowPreset {
  id: string;
  name: string;
  description: string;
  color: string;
  colorMode?: 'single' | 'gradient';
  gradientEndColor?: string;
  effect: ShowEffect;
  intensity: number;
  brightness: number;
  image?: Partial<ShowImageConfig>;
  bpm?: number;
  message?: string;
  audioSyncEnabled?: boolean;
  audioSensitivity?: number;
  audioReactionMode?: AudioReactionMode;
}

export interface ShowScene {
  id: string;
  number: number;
  name: string;
  stageMoment: string;
  durationSeconds?: number;
  config: Partial<ShowState>;
}

export interface PresetLibraryImage {
  id: string;
  name: string;
  category: 'logo' | 'artist' | 'sponsor' | 'art' | 'custom';
  url: string;
}

export interface GalleryPhoto {
  id: string;
  year: '2026' | '2025';
  title: string;
  url: string;
  caption?: string;
  photographer?: string;
  sector?: string;
  timestamp: string;
}

export interface AgendaShowItem {
  id: string;
  dateKey: string; // e.g. '2026-09-18' (Sexta), '2026-09-19' (Sábado), '2026-09-20' (Domingo)
  dateLabel: string; // e.g. 'Sexta-feira, 18 de Setembro'
  time: string; // e.g. '21:30'
  endTime?: string;
  artist: string;
  title: string;
  stage: string; // e.g. 'Palco Principal', 'Tenda Sunset', 'Palco Eletrônico'
  description: string;
  status: 'completed' | 'live' | 'upcoming';
  hasShowModeSync?: boolean;
}
