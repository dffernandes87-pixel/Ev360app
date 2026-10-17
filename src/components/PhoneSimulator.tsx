import React, { useState, useEffect, useRef } from 'react';
import { 
  Smartphone, 
  Users, 
  Wifi, 
  Battery, 
  Sparkles, 
  Calendar, 
  Image as GalleryIcon, 
  Star, 
  Map, 
  Maximize2, 
  X,
  Volume2,
  RefreshCw,
  Eye,
  Info,
  Mic,
  Music,
  Zap,
  Power,
  Radio,
  Crown,
  ChevronLeft
} from 'lucide-react';
import { ShowState, EventProfile } from '../types';
import { audioBeatDetector, AudioMetrics } from '../utils/audioBeatDetector';
import { AgendaTab } from './phone_views/AgendaTab';
import { GalleryTab } from './phone_views/GalleryTab';
import { VipTab } from './phone_views/VipTab';
import { MapTab } from './phone_views/MapTab';

interface PhoneSimulatorProps {
  state: ShowState;
  currentEvent: EventProfile;
  isOpen: boolean;
  onClose: () => void;
  onSendPing?: () => void;
  onUpdateState?: (partial: Partial<ShowState>) => void;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  state,
  currentEvent,
  isOpen,
  onClose,
  onSendPing,
  onUpdateState,
}) => {
  const [viewMode, setViewMode] = useState<'fullscreen_show' | 'event_app' | 'crowd_grid'>('fullscreen_show');
  const [activeAppTab, setActiveAppTab] = useState<'agenda' | 'galeria' | 'show' | 'vip' | 'mapa'>('show');
  const [currentTime, setCurrentTime] = useState('21:42');
  const [isBeatActive, setIsBeatActive] = useState(false);
  const [beatIntensity, setBeatIntensity] = useState(0);
  const [audioMetrics, setAudioMetrics] = useState<AudioMetrics | null>(null);
  const [strobeCycle, setStrobeCycle] = useState(false);

  // Time ticker
  useEffect(() => {
    const update = () => {
      const d = new Date();
      setCurrentTime(
        `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
      );
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  // Audio Reactivity Hook: ONLY FLICKERS WHEN MODO SHOW IS ACTIVE
  useEffect(() => {
    const handleBeat = (intensity: number) => {
      // RULE: O modo show só deve funcionar quando ativado
      if (!state.isActive || state.blackoutActive) {
        setIsBeatActive(false);
        return;
      }

      if (!state.audioSyncEnabled) return;

      setBeatIntensity(intensity);
      setIsBeatActive(true);

      if (state.audioReactionMode === 'strobe_beat') {
        // Multi-flash burst
        setStrobeCycle(true);
        setTimeout(() => setStrobeCycle(false), 40);
        setTimeout(() => setStrobeCycle(true), 80);
        setTimeout(() => setStrobeCycle(false), 120);
        setTimeout(() => setIsBeatActive(false), 160);
      } else {
        const timeout = state.audioReactionMode === 'pulse_beat' ? 220 : 130;
        setTimeout(() => {
          setIsBeatActive(false);
        }, timeout);
      }
    };

    const handleMetrics = (m: AudioMetrics) => {
      setAudioMetrics(m);
    };

    audioBeatDetector.onBeat(handleBeat);
    audioBeatDetector.onMetrics(handleMetrics);
  }, [state.isActive, state.blackoutActive, state.audioSyncEnabled, state.audioReactionMode]);

  if (!isOpen) return null;

  // Compute phone background style
  const getPhoneBackground = () => {
    // 1. RULE: Modo show DESATIVADO ou BLACKOUT => Tela 100% repouso preto
    if (!state.isActive || state.blackoutActive) {
      return { backgroundColor: '#050505' };
    }

    // 2. Strobe manual disparado
    if (state.strobeActive) {
      return { backgroundColor: '#FFFFFF' };
    }

    // 3. Reação Sonora: Piscar da tela sincronizado ao som da música
    if (state.audioSyncEnabled && isBeatActive) {
      if (state.audioReactionMode === 'flash_beat') {
        // Clarão vivo na batida
        return {
          backgroundColor: '#FFFFFF',
          boxShadow: 'inset 0 0 100px rgba(255,255,255,0.9)',
        };
      }
      if (state.audioReactionMode === 'strobe_beat' && strobeCycle) {
        return { backgroundColor: '#FFFFFF' };
      }
      if (state.audioReactionMode === 'color_jump') {
        // Salto cromático de destaque
        const jumpColor = state.gradientEndColor || '#F59E0B';
        return { backgroundColor: jumpColor };
      }
    }

    // 4. Efeito Arco-íris
    if (state.effect === 'rainbow') {
      return {
        background: 'linear-gradient(45deg, #ff0000, #ff7700, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff)',
        backgroundSize: '400% 400%',
      };
    }

    // 5. Gradiente
    if (state.colorMode === 'gradient' && state.gradientEndColor) {
      return {
        background: `linear-gradient(${state.gradientAngle || 135}deg, ${state.color}, ${state.gradientEndColor})`,
      };
    }

    // 6. Cor sólida padrão
    return { backgroundColor: state.color };
  };

  // Compute CSS animation class according to active effect & sound sync
  const getEffectAnimationClass = () => {
    if (!state.isActive || state.blackoutActive) return '';
    if (state.strobeActive) return 'animate-ping duration-75';

    // When audio sync is enabled, audio beat controls the pulse
    if (state.audioSyncEnabled) {
      if (isBeatActive) {
        if (state.audioReactionMode === 'pulse_beat') {
          return 'scale-[1.03] transition-transform duration-100 ease-out';
        }
        if (state.audioReactionMode === 'flash_beat') {
          return 'transition-none';
        }
      }
      return 'transition-all duration-150';
    }

    switch (state.effect) {
      case 'pulse':
        return 'animate-pulse';
      case 'flash':
        return 'animate-bounce';
      case 'fade':
        return 'transition-all duration-1000';
      case 'strobe':
        return 'animate-pulse duration-100';
      case 'candle':
        return 'animate-pulse duration-700';
      default:
        return '';
    }
  };

  // Dynamic filter brightness and opacity
  const getScreenFilter = () => {
    if (!state.isActive || state.blackoutActive) {
      return 'brightness(0.3) opacity(0.5)';
    }

    let b = (state.brightness / 100) * 1.1;
    let o = Math.max(0.2, state.intensity / 100);

    // Boost on beat if sound sync is active
    if (state.audioSyncEnabled && isBeatActive) {
      b = Math.min(2.0, b * 1.5);
      o = 1.0;
    }

    return `brightness(${b}) opacity(${o})`;
  };

  // Image animation
  const getImageEffectClass = () => {
    if (state.audioSyncEnabled && isBeatActive) {
      return 'scale-110 transition-transform duration-75';
    }
    switch (state.image.effect) {
      case 'pulse':
        return 'animate-pulse';
      case 'rotate':
        return 'animate-spin duration-3000';
      case 'bounce':
        return 'animate-bounce';
      default:
        return 'transition-transform duration-200';
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-neutral-950/95 border-l border-neutral-800 backdrop-blur-xl shadow-2xl flex flex-col p-4 sm:p-5 overflow-y-auto animate-in slide-in-from-right duration-200">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-rose-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-white">
            Simulador do Smartphone
          </h2>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            LIVE SYNC
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Simulator Mode Tabs & Audio Quick Test */}
      <div className="my-2.5 space-y-2">
        <div className="grid grid-cols-3 gap-1.5 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
          <button
            id="btn-sim-mode-fullscreen"
            onClick={() => setViewMode('fullscreen_show')}
            className={`py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
              viewMode === 'fullscreen_show'
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Modo Show
          </button>
          <button
            id="btn-sim-mode-app"
            onClick={() => setViewMode('event_app')}
            className={`py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
              viewMode === 'event_app'
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            App do Evento
          </button>
          <button
            id="btn-sim-mode-crowd"
            onClick={() => setViewMode('crowd_grid')}
            className={`py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
              viewMode === 'crowd_grid'
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Visão Plateia (12x)
          </button>
        </div>

        {/* Quick App Sub-tabs (when in event_app mode) */}
        {viewMode === 'event_app' && (
          <div className="grid grid-cols-5 gap-1 bg-neutral-900/80 p-1 rounded-xl border border-neutral-800 text-[10px]">
            <button
              onClick={() => setActiveAppTab('agenda')}
              className={`py-1 px-1 rounded-lg font-medium transition-all cursor-pointer truncate ${
                activeAppTab === 'agenda' ? 'bg-rose-600 text-white font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              📅 Agenda
            </button>
            <button
              onClick={() => setActiveAppTab('galeria')}
              className={`py-1 px-1 rounded-lg font-medium transition-all cursor-pointer truncate ${
                activeAppTab === 'galeria' ? 'bg-purple-600 text-white font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              🖼️ Galeria
            </button>
            <button
              onClick={() => setActiveAppTab('show')}
              className={`py-1 px-1 rounded-lg font-medium transition-all cursor-pointer truncate ${
                activeAppTab === 'show' ? 'bg-neutral-800 text-white font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              ✨ Show
            </button>
            <button
              onClick={() => setActiveAppTab('vip')}
              className={`py-1 px-1 rounded-lg font-medium transition-all cursor-pointer truncate ${
                activeAppTab === 'vip' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              👑 VIP
            </button>
            <button
              onClick={() => setActiveAppTab('mapa')}
              className={`py-1 px-1 rounded-lg font-medium transition-all cursor-pointer truncate ${
                activeAppTab === 'mapa' ? 'bg-cyan-600 text-white font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              🗺️ Mapa
            </button>
          </div>
        )}

        {/* Audio Reactivity Status in Simulator */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${state.isActive && state.audioSyncEnabled ? 'bg-indigo-500/20 text-indigo-400' : 'bg-neutral-800 text-neutral-400'}`}>
              <Music className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-white uppercase tracking-wider">Reação por Som</span>
                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                  !state.isActive 
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : state.audioSyncEnabled
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-neutral-800 text-neutral-400'
                }`}>
                  {!state.isActive ? 'MODO INATIVO' : state.audioSyncEnabled ? 'SOM ATIVO' : 'DESLIGADO'}
                </span>
              </div>
              <p className="text-[10px] text-neutral-400">
                {!state.isActive 
                  ? 'Ative o Modo Show para liberar o piscar' 
                  : state.audioSyncEnabled 
                    ? `Piscar: ${state.audioReactionMode === 'flash_beat' ? 'Flash' : state.audioReactionMode === 'pulse_beat' ? 'Pulso' : state.audioReactionMode === 'strobe_beat' ? 'Strobe' : 'Cor'}`
                    : 'Sincronização musical desligada'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {audioBeatDetector.getMode() === 'off' ? (
              <button
                onClick={() => audioBeatDetector.startSynth()}
                className="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-mono flex items-center gap-1 cursor-pointer"
                title="Tocar batida musical simulada para ver o celular piscar"
              >
                <Radio className="w-3 h-3" />
                <span>Simular Som</span>
              </button>
            ) : (
              <button
                onClick={() => audioBeatDetector.stop()}
                className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-mono cursor-pointer"
              >
                Parar Som
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 1. VIEW MODE: SMARTPHONE FRAME */}
      {viewMode !== 'crowd_grid' ? (
        <div className="flex flex-col items-center justify-center my-auto py-2">
          
          {/* Outer Phone Shell */}
          <div className="w-[280px] h-[580px] bg-neutral-900 rounded-[44px] p-3 shadow-2xl border-4 border-neutral-750 relative ring-1 ring-white/10 flex flex-col">
            
            {/* Speaker / Dynamic Island Pill */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-30 flex items-center justify-end px-2 gap-1.5">
              <span className="w-2 h-2 rounded-full bg-neutral-900" />
              <span className={`w-1.5 h-1.5 rounded-full ${state.isActive ? 'bg-emerald-500/90 animate-pulse' : 'bg-neutral-600'}`} />
            </div>

            {/* Screen Canvas */}
            <div 
              className={`w-full h-full rounded-[34px] overflow-hidden relative flex flex-col justify-between transition-colors duration-200 ${getEffectAnimationClass()}`}
              style={{
                ...getPhoneBackground(),
                filter: getScreenFilter(),
              }}
            >
              
              {/* Flash Flare Overlay when Audio Beat triggers */}
              {state.isActive && !state.blackoutActive && state.audioSyncEnabled && isBeatActive && (
                <div className="absolute inset-0 z-15 bg-white/50 pointer-events-none transition-opacity duration-100 mix-blend-overlay" />
              )}

              {/* Status Bar */}
              <div className="pt-2 px-5 flex items-center justify-between text-[11px] font-medium z-20 mix-blend-difference text-white">
                <span className="font-mono">{currentTime}</span>
                <div className="flex items-center gap-1.5">
                  <Wifi className="w-3 h-3" />
                  <span className="text-[10px] font-mono">5G</span>
                  <Battery className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* View 1: Fullscreen Show Screen */}
              {viewMode === 'fullscreen_show' && (
                <div className="flex-1 flex flex-col items-center justify-between p-4 z-10 text-center">
                  
                  {/* Top: Show Badge / Audio reactivity status */}
                  <div className="pt-3 flex flex-col items-center gap-1.5">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold tracking-wide">
                      <Sparkles className="w-3 h-3 text-rose-400" />
                      <span>{currentEvent.name}</span>
                    </div>

                    {state.isActive && state.audioSyncEnabled && (
                      <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-mono backdrop-blur-md border transition-all ${
                        isBeatActive 
                          ? 'bg-amber-400 text-neutral-950 border-amber-300 font-bold scale-105' 
                          : 'bg-black/50 text-indigo-200 border-indigo-400/30'
                      }`}>
                        <Music className="w-2.5 h-2.5" />
                        <span>{isBeatActive ? 'BEAT TRIGGER ⚡' : 'Sincronizado ao Som 🎵'}</span>
                      </div>
                    )}
                  </div>

                  {/* Center: Active Show Image / Standby Display */}
                  <div className="my-auto flex flex-col items-center justify-center w-full px-3">
                    {!state.isActive || state.blackoutActive ? (
                      /* TELA DE REPOUSO / STANDBY (O Modo Show só funciona quando ativado) */
                      <div className="text-center p-4 rounded-2xl bg-black/70 border border-neutral-800 backdrop-blur-md space-y-2.5">
                        <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-750 mx-auto flex items-center justify-center text-neutral-400">
                          <Power className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-200">
                            Modo Show Desativado
                          </div>
                          <p className="text-[10px] text-neutral-400 mt-1 leading-relaxed">
                            O Modo Show só funciona quando ativado pela produção. Aguardando comando no palco...
                          </p>
                        </div>
                        {onUpdateState && (
                          <button
                            onClick={() => onUpdateState({ isActive: true, blackoutActive: false })}
                            className="mt-1 w-full py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-[10px] font-bold uppercase tracking-wider font-mono shadow transition-transform active:scale-95 cursor-pointer"
                          >
                            Ativar no Console
                          </button>
                        )}
                      </div>
                    ) : state.image.enabled && state.image.url ? (
                      <div
                        className={`transition-all duration-200 ${getImageEffectClass()}`}
                        style={{
                          width: `${(state.image.scale / 100) * 140}px`,
                          height: `${(state.image.scale / 100) * 140}px`,
                          opacity: (state.image.opacity || 100) / 100,
                        }}
                      >
                        <img
                          src={state.image.url}
                          alt={state.image.name}
                          className="w-full h-full object-contain drop-shadow-2xl"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white/80 shadow-lg">
                        <Sparkles className="w-8 h-8 animate-pulse" />
                      </div>
                    )}

                    {/* Collective Text Overlay Message */}
                    {state.isActive && !state.blackoutActive && state.message && (
                      <div className="mt-4 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/30 text-white text-xs font-bold uppercase tracking-wider font-mono shadow-2xl animate-bounce">
                        {state.message}
                      </div>
                    )}
                  </div>

                  {/* Bottom: Participant instruction & Quick App Switcher */}
                  <div className="pb-1 space-y-1.5 flex flex-col items-center">
                    <div className="text-[10px] uppercase font-mono text-white/90 bg-black/40 backdrop-blur-xs px-3 py-1 rounded-full border border-white/15">
                      {state.isActive && !state.blackoutActive
                        ? state.audioSyncEnabled
                          ? 'Sincronizado à música do show 🎵'
                          : 'Aponte a tela para o palco ✨'
                        : 'Standby / Aguardando início'}
                    </div>

                    <button
                      onClick={() => setViewMode('event_app')}
                      className="px-3 py-1 rounded-full bg-black/60 hover:bg-neutral-800 text-neutral-300 hover:text-white text-[9px] font-mono border border-white/20 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <ChevronLeft className="w-3 h-3" />
                      <span>Voltar para o App do Evento</span>
                    </button>
                  </div>

                </div>
              )}

              {/* View 2: Event App Wrapper with fully functional subviews */}
              {viewMode === 'event_app' && (
                <div className="flex-1 flex flex-col bg-neutral-950/95 text-white z-10 overflow-hidden">
                  
                  {/* Event App Header */}
                  <div className="p-3 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/60">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{currentEvent.name}</span>
                      </div>
                      <div className="text-[9.5px] text-neutral-400">
                        {activeAppTab === 'agenda' && 'Programação & Horários'}
                        {activeAppTab === 'galeria' && 'Galeria 2026 & 2025'}
                        {activeAppTab === 'show' && 'Controle Remoto de Iluminação'}
                        {activeAppTab === 'vip' && 'Acesso VIP & Benefícios'}
                        {activeAppTab === 'mapa' && 'Mapa do Evento & Setores'}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                        Conectado
                      </span>
                    </div>
                  </div>

                  {/* App Content: Dynamically swapped according to activeAppTab */}
                  <div className="flex-1 overflow-y-auto flex flex-col">
                    {/* 1. TAB: AGENDA */}
                    {activeAppTab === 'agenda' && (
                      <AgendaTab onGoToShowMode={() => setActiveAppTab('show')} />
                    )}

                    {/* 2. TAB: GALERIA (Galeria 2026 & Galeria 2025) */}
                    {activeAppTab === 'galeria' && (
                      <GalleryTab />
                    )}

                    {/* 3. TAB: MODO SHOW */}
                    {activeAppTab === 'show' && (
                      <div className="flex-1 p-3 space-y-2.5 overflow-y-auto text-left">
                        {/* Interactive Show Card */}
                        <div 
                          className="rounded-2xl p-3.5 border border-white/20 shadow-xl flex flex-col justify-between transition-all"
                          style={{
                            background: state.isActive && !state.blackoutActive
                              ? `linear-gradient(135deg, ${state.color}, #1e1b4b)`
                              : '#171717',
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-amber-300" />
                              <span className="text-xs font-bold text-white uppercase tracking-wider">
                                MÓDULO MODO SHOW
                              </span>
                            </div>
                            <span className={`w-2.5 h-2.5 rounded-full ${state.isActive && !state.blackoutActive ? 'bg-emerald-400 animate-ping' : 'bg-neutral-600'}`} />
                          </div>

                          <p className="text-[10px] text-white/90 leading-relaxed mb-3">
                            {state.isActive && !state.blackoutActive
                              ? state.audioSyncEnabled
                                ? 'Seu celular está conectado e sincronizado ao som da música do palco!'
                                : 'Iluminação de palco transmitida pela produção.'
                              : 'O Modo Show só funciona quando ativado pela produção técnica.'}
                          </p>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setViewMode('fullscreen_show')}
                              className="flex-1 py-2 px-3 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer border border-white/30"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                              <span>Tela Cheia do Show</span>
                            </button>
                          </div>
                        </div>

                        {/* Audio Sync Status */}
                        <div className="bg-neutral-900/80 p-2.5 rounded-xl border border-neutral-800 space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="text-[11px] font-bold text-neutral-200 flex items-center gap-1.5">
                              <Music className="w-3.5 h-3.5 text-indigo-400" />
                              <span>Sincronia Acústica / Som</span>
                            </div>
                            <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                              state.audioSyncEnabled ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-neutral-800 text-neutral-400'
                            }`}>
                              {state.audioSyncEnabled ? 'Ligado' : 'Desligado'}
                            </span>
                          </div>
                          <div className="text-[10px] text-neutral-400">
                            {state.isActive
                              ? state.audioSyncEnabled
                                ? 'Ouvindo batida sonora da música em tempo real'
                                : 'Aguardando liberação de som pelo operador DMX'
                              : 'Disponível quando o Modo Show estiver ativo'}
                          </div>
                        </div>

                        {/* Quick Navigation Cards */}
                        <div className="space-y-1.5">
                          <div className="text-[10px] uppercase font-mono text-neutral-400 pl-1">
                            Acessos Rápidos do Festival
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => setActiveAppTab('agenda')}
                              className="p-2.5 rounded-xl bg-neutral-900/70 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-left transition-all cursor-pointer"
                            >
                              <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold mb-1">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>Agenda</span>
                              </div>
                              <div className="text-[9.5px] text-neutral-400">
                                Programação de shows e simulação de horários.
                              </div>
                            </button>

                            <button
                              onClick={() => setActiveAppTab('galeria')}
                              className="p-2.5 rounded-xl bg-neutral-900/70 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-left transition-all cursor-pointer"
                            >
                              <div className="flex items-center gap-1.5 text-purple-400 text-xs font-bold mb-1">
                                <GalleryIcon className="w-3.5 h-3.5" />
                                <span>Galeria</span>
                              </div>
                              <div className="text-[9.5px] text-neutral-400">
                                Fotos 2026 ao vivo e retrospectiva 2025.
                              </div>
                            </button>

                            <button
                              onClick={() => setActiveAppTab('vip')}
                              className="p-2.5 rounded-xl bg-neutral-900/70 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-left transition-all cursor-pointer"
                            >
                              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold mb-1">
                                <Crown className="w-3.5 h-3.5" />
                                <span>Área VIP</span>
                              </div>
                              <div className="text-[9.5px] text-neutral-400">
                                Conteúdo exclusivo e lounge backstage.
                              </div>
                            </button>

                            <button
                              onClick={() => setActiveAppTab('mapa')}
                              className="p-2.5 rounded-xl bg-neutral-900/70 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-left transition-all cursor-pointer"
                            >
                              <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-bold mb-1">
                                <Map className="w-3.5 h-3.5" />
                                <span>Mapa</span>
                              </div>
                              <div className="text-[9.5px] text-neutral-400">
                                Caixa do mapa do evento e setores.
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 4. TAB: VIP (Conteúdo Exclusivo) */}
                    {activeAppTab === 'vip' && (
                      <VipTab />
                    )}

                    {/* 5. TAB: MAPA (Caixa onde em breve adicionaremos o mapa) */}
                    {activeAppTab === 'mapa' && (
                      <MapTab />
                    )}
                  </div>

                  {/* App Bottom Navigation with All 5 Functional Buttons */}
                  <div className="border-t border-neutral-800 bg-neutral-950 p-1.5 grid grid-cols-5 gap-1 text-[9px] text-center text-neutral-400">
                    {/* 1. Agenda */}
                    <button
                      id="btn-phone-nav-agenda"
                      onClick={() => setActiveAppTab('agenda')}
                      className={`flex flex-col items-center py-1 rounded-lg transition-all cursor-pointer ${
                        activeAppTab === 'agenda'
                          ? 'text-rose-400 font-bold bg-neutral-900/90 shadow-xs'
                          : 'hover:text-white'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5 mb-0.5" />
                      <span>Agenda</span>
                    </button>

                    {/* 2. Galeria */}
                    <button
                      id="btn-phone-nav-galeria"
                      onClick={() => setActiveAppTab('galeria')}
                      className={`flex flex-col items-center py-1 rounded-lg transition-all cursor-pointer ${
                        activeAppTab === 'galeria'
                          ? 'text-purple-400 font-bold bg-neutral-900/90 shadow-xs'
                          : 'hover:text-white'
                      }`}
                    >
                      <GalleryIcon className="w-3.5 h-3.5 mb-0.5" />
                      <span>Galeria</span>
                    </button>

                    {/* 3. Show */}
                    <button
                      id="btn-phone-nav-show"
                      onClick={() => setActiveAppTab('show')}
                      className={`flex flex-col items-center py-1 rounded-lg transition-all cursor-pointer ${
                        activeAppTab === 'show'
                          ? 'text-rose-400 font-bold bg-neutral-900/90 shadow-xs'
                          : 'hover:text-white'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 mb-0.5" />
                      <span>Show</span>
                    </button>

                    {/* 4. VIP */}
                    <button
                      id="btn-phone-nav-vip"
                      onClick={() => setActiveAppTab('vip')}
                      className={`flex flex-col items-center py-1 rounded-lg transition-all cursor-pointer ${
                        activeAppTab === 'vip'
                          ? 'text-amber-400 font-bold bg-neutral-900/90 shadow-xs'
                          : 'hover:text-white'
                      }`}
                    >
                      <Crown className="w-3.5 h-3.5 mb-0.5" />
                      <span>VIP</span>
                    </button>

                    {/* 5. Mapa */}
                    <button
                      id="btn-phone-nav-mapa"
                      onClick={() => setActiveAppTab('mapa')}
                      className={`flex flex-col items-center py-1 rounded-lg transition-all cursor-pointer ${
                        activeAppTab === 'mapa'
                          ? 'text-cyan-400 font-bold bg-neutral-900/90 shadow-xs'
                          : 'hover:text-white'
                      }`}
                    >
                      <Map className="w-3.5 h-3.5 mb-0.5" />
                      <span>Mapa</span>
                    </button>
                  </div>

                </div>
              )}

              {/* Bottom Home Indicator Bar */}
              <div className="w-24 h-1 bg-white/40 rounded-full mx-auto my-1.5 z-30" />

            </div>

          </div>

        </div>
      ) : (
        /* 2. VIEW MODE: CROWD GRID (Simulates 12 smartphones in the audience glowing together) */
        <div className="my-auto py-2">
          <div className="text-center mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-200">
              Efeito Visual na Arena (Plateia Conectada)
            </span>
            <p className="text-[11px] text-neutral-400">
              {!state.isActive
                ? 'Todos os 12 aparelhos estão em repouso. O Modo Show só funciona quando ativado.'
                : state.audioSyncEnabled
                  ? 'Os 12 smartphones piscam juntos ao compasso do som da música!'
                  : 'Transmitindo iluminação contínua sincronizada via SSE.'}
            </p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-neutral-900/90 border border-neutral-800">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className={`h-24 rounded-xl border border-neutral-700/60 p-1.5 flex flex-col justify-between transition-all duration-200 shadow-sm overflow-hidden ${getEffectAnimationClass()}`}
                style={{
                  ...getPhoneBackground(),
                  filter: getScreenFilter(),
                }}
              >
                <div className="flex justify-between items-center text-[7px] font-mono text-white mix-blend-difference">
                  <span>P{i + 1}</span>
                  <Wifi className="w-2 h-2" />
                </div>

                {!state.isActive ? (
                  <div className="text-[7.5px] font-mono text-center text-neutral-400">
                    Standby
                  </div>
                ) : state.image.enabled && state.image.url ? (
                  <div className="w-6 h-6 mx-auto">
                    <img
                      src={state.image.url}
                      alt="Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-4 h-4 mx-auto rounded-full bg-white/20 flex items-center justify-center">
                    <Sparkles className="w-2.5 h-2.5 text-white" />
                  </div>
                )}

                <div className="text-[6.5px] font-mono text-center text-white/80 mix-blend-difference truncate">
                  {!state.isActive ? 'Desativado' : `Setor ${i < 4 ? 'Pista' : i < 8 ? 'VIP' : 'Arquibancada'}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Simulator Actions Footer */}
      <div className="mt-auto pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
        <span className="font-mono text-[11px]">
          Target: {state.targetSector || 'Todos os setores'}
        </span>
        {onSendPing && (
          <button
            onClick={onSendPing}
            className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 flex items-center gap-1 text-[11px] font-mono transition-colors"
            title="Simular conexão de novo aparelho"
          >
            <RefreshCw className="w-3 h-3 text-emerald-400" />
            <span>Simular Heartbeat</span>
          </button>
        )}
      </div>

    </div>
  );
};
