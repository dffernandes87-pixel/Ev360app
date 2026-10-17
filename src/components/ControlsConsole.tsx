import React, { useState, useRef, useEffect } from 'react';
import { 
  Palette, 
  Sparkles, 
  Sun, 
  Gauge, 
  Image as ImageIcon, 
  Music, 
  Sliders, 
  Layers, 
  Check, 
  X, 
  Eye, 
  Zap, 
  Flame, 
  Activity, 
  CircleDot, 
  Maximize2, 
  Type,
  Plus,
  Volume2,
  Mic,
  MicOff,
  Radio,
  Power,
  Play,
  Square,
  VolumeX
} from 'lucide-react';
import { 
  ShowState, 
  ShowEffect, 
  ShowImageConfig, 
  AudioReactionMode, 
  AudioFftBand 
} from '../types';
import { audioBeatDetector, AudioMetrics, AudioSourceType } from '../utils/audioBeatDetector';

interface ControlsConsoleProps {
  state: ShowState;
  onUpdateState: (partial: Partial<ShowState>) => void;
  onOpenImageModal: () => void;
}

const PRESET_COLORS = [
  { name: 'Vermelho', hex: '#EF4444', class: 'bg-red-500' },
  { name: 'Azul', hex: '#3B82F6', class: 'bg-blue-500' },
  { name: 'Verde', hex: '#10B981', class: 'bg-emerald-500' },
  { name: 'Roxo', hex: '#8B5CF6', class: 'bg-purple-500' },
  { name: 'Branco', hex: '#FFFFFF', class: 'bg-white' },
  { name: 'Amarelo', hex: '#F59E0B', class: 'bg-amber-500' },
  { name: 'Rosa', hex: '#EC4899', class: 'bg-pink-500' },
  { name: 'Ciano', hex: '#06B6D4', class: 'bg-cyan-500' },
  { name: 'Laranja', hex: '#F97316', class: 'bg-orange-500' },
  { name: 'Dourado', hex: '#EAB308', class: 'bg-yellow-500' },
];

const EFFECTS: { id: ShowEffect; label: string; description: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'pulse', label: 'Pulso', description: 'Onda suave rítmica', icon: Activity },
  { id: 'flash', label: 'Flash', description: 'Disparo rápido e vivo', icon: Zap },
  { id: 'fade', label: 'Fade', description: 'Transição contínua suave', icon: CircleDot },
  { id: 'fixed', label: 'Fixo', description: 'Luz estática contínua', icon: Sun },
  { id: 'strobe', label: 'Strobe', description: 'Estroboscópio rápido', icon: Sparkles },
  { id: 'rainbow', label: 'Rainbow', description: 'Espectro de cores dinâmico', icon: Palette },
  { id: 'candle', label: 'Vela', description: 'Tremor orgânico acolhedor', icon: Flame },
];

export const ControlsConsole: React.FC<ControlsConsoleProps> = ({
  state,
  onUpdateState,
  onOpenImageModal,
}) => {
  const [customHex, setCustomHex] = useState(state.color);
  const [gradientEndHex, setGradientEndHex] = useState(state.gradientEndColor || '#8B5CF6');
  const [customMessageInput, setCustomMessageInput] = useState(state.message || '');
  const [tapTimestamps, setTapTimestamps] = useState<number[]>([]);

  // Audio reactivity local state
  const [audioSource, setAudioSource] = useState<AudioSourceType>(audioBeatDetector.getMode());
  const [audioMetrics, setAudioMetrics] = useState<AudioMetrics | null>(null);
  const [isBeatFlashing, setIsBeatFlashing] = useState(false);
  const [synthAudible, setSynthAudible] = useState(false);
  const [micPermissionError, setMicPermissionError] = useState<string | null>(null);

  // Synchronize internal HEX inputs when state changes from preset or external cue
  useEffect(() => {
    setCustomHex(state.color);
    if (state.gradientEndColor) setGradientEndHex(state.gradientEndColor);
  }, [state.color, state.gradientEndColor]);

  // Sync detector parameters
  useEffect(() => {
    audioBeatDetector.setSensitivity(state.audioSensitivity || 75);
    audioBeatDetector.setFftBand(state.audioFftBand || 'bass');
    audioBeatDetector.setBpm(state.bpm || 124);
    audioBeatDetector.setSynthSound(synthAudible);
  }, [state.audioSensitivity, state.audioFftBand, state.bpm, synthAudible]);

  useEffect(() => {
    audioBeatDetector.onMetrics((metrics) => {
      setAudioMetrics(metrics);
    });

    audioBeatDetector.onBeat(() => {
      setIsBeatFlashing(true);
      setTimeout(() => setIsBeatFlashing(false), 130);
    });
  }, []);

  const handleStartMic = async () => {
    setMicPermissionError(null);
    const success = await audioBeatDetector.startMicrophone();
    if (success) {
      setAudioSource('mic');
    } else {
      setMicPermissionError('Acesso ao microfone não concedido. Iniciando simulação sonora da batida.');
      setAudioSource('synth');
    }
  };

  const handleStartSynth = () => {
    setMicPermissionError(null);
    audioBeatDetector.startSynth();
    setAudioSource('synth');
  };

  const handleStopAudio = () => {
    audioBeatDetector.stop();
    setAudioSource('off');
    setAudioMetrics(null);
  };

  // Tap Tempo calculation
  const handleTapTempo = () => {
    const now = Date.now();
    const newTaps = [...tapTimestamps.filter((t) => now - t < 3000), now];
    setTapTimestamps(newTaps);

    if (newTaps.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < newTaps.length; i++) {
        intervals.push(newTaps[i] - newTaps[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgInterval);
      if (calculatedBpm >= 40 && calculatedBpm <= 240) {
        onUpdateState({ bpm: calculatedBpm });
      }
    }
  };

  const handleApplyCustomHex = (color: string) => {
    setCustomHex(color);
    if (/^#[0-9A-F]{6}$/i.test(color)) {
      onUpdateState({ color });
    }
  };

  const handleApplyGradientEnd = (color: string) => {
    setGradientEndHex(color);
    if (/^#[0-9A-F]{6}$/i.test(color)) {
      onUpdateState({ gradientEndColor: color, colorMode: 'gradient' });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      
      {/* AVISO CRÍTICO / STATUS: MODO SHOW ATIVADO vs DESATIVADO */}
      {!state.isActive ? (
        <div className="lg:col-span-12 rounded-2xl bg-gradient-to-r from-rose-950/80 via-neutral-900 to-rose-950/80 border-2 border-rose-500/70 p-4 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
              <Power className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white uppercase tracking-wider">Modo Show Desativado</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono font-bold border border-rose-500/30">
                  STANDBY
                </span>
              </div>
              <p className="text-xs text-neutral-300 mt-0.5">
                Conforme a regra operacional: <strong>o Modo Show só funciona quando ativado pela produção</strong>. Os celulares da plateia estão em repouso e <strong>não irão piscar ou reagir à música</strong> até que você ative o console.
              </p>
            </div>
          </div>
          <button
            id="btn-banner-activate-show"
            onClick={() => onUpdateState({ isActive: true, blackoutActive: false })}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold font-mono uppercase tracking-wider shadow-lg shadow-emerald-500/30 flex items-center gap-2 shrink-0 transition-transform active:scale-95 cursor-pointer"
          >
            <Power className="w-4 h-4 stroke-[2.5]" />
            <span>ATIVAR MODO SHOW</span>
          </button>
        </div>
      ) : (
        <div className="lg:col-span-12 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-emerald-950/40 border border-emerald-500/40 p-3 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold text-white uppercase tracking-wider">Modo Show em Execução:</span>
            <span className="text-neutral-300">
              {state.audioSyncEnabled ? 'Sincronização musical por áudio ativada — Telas prontas para piscar no compasso do som.' : 'Modo luminoso contínuo ativo transmitindo para a plateia.'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-500/30 font-bold">
              ● TRANSMITINDO AO VIVO
            </span>
          </div>
        </div>
      )}

      {/* 1. SEÇÃO DE CORES & GRADIENTE (Lg col 7) */}
      <div className="lg:col-span-7 flex flex-col gap-5">
        
        {/* Color Controller Box */}
        <div className="bg-neutral-900/80 border border-neutral-800/90 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          
          {/* Section Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">Cor do Modo Show</h2>
                <p className="text-xs text-neutral-400">Transmitida instantaneamente para todos os celulares</p>
              </div>
            </div>

            {/* Mode Switch: Sólido / Gradiente */}
            <div className="flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800">
              <button
                id="btn-color-mode-single"
                onClick={() => onUpdateState({ colorMode: 'single' })}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  state.colorMode === 'single'
                    ? 'bg-neutral-800 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Cor Sólida
              </button>
              <button
                id="btn-color-mode-gradient"
                onClick={() => onUpdateState({ colorMode: 'gradient' })}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  state.colorMode === 'gradient'
                    ? 'bg-gradient-to-r from-rose-500 to-indigo-600 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Gradiente
              </button>
            </div>
          </div>

          {/* PALETA DE CORES RÁPIDAS (BOM BOTÕES GRANDES PARA OPERADOR) */}
          <div className="mb-5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-2">
              Cores Rápidas de Palco
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2.5">
              {PRESET_COLORS.map((c) => {
                const isSelected = state.color.toUpperCase() === c.hex.toUpperCase() && state.colorMode === 'single';
                return (
                  <button
                    key={c.hex}
                    id={`btn-color-${c.name.toLowerCase()}`}
                    onClick={() => onUpdateState({ color: c.hex, colorMode: 'single' })}
                    className={`group relative h-14 rounded-xl flex flex-col items-center justify-center p-1 transition-all active:scale-90 ${
                      isSelected
                        ? 'ring-3 ring-white ring-offset-2 ring-offset-neutral-950 scale-105 shadow-lg'
                        : 'hover:scale-102 hover:brightness-110 opacity-90 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={`${c.name} (${c.hex})`}
                  >
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center text-white shadow-xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                    <span
                      className={`text-[9px] font-bold uppercase tracking-tight mt-auto px-1 py-0.2 rounded ${
                        c.hex === '#FFFFFF' || c.hex === '#F59E0B' || c.hex === '#EAB308'
                          ? 'text-neutral-900 bg-white/70'
                          : 'text-white bg-black/40'
                      }`}
                    >
                      {c.name.substring(0, 4)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CUSTOM COLOR & HEX SELECTOR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-neutral-800/80">
            
            {/* Primary Color Picker */}
            <div className="flex items-center gap-3 bg-neutral-950/90 p-2.5 rounded-xl border border-neutral-800">
              <input
                id="color-picker-primary"
                type="color"
                value={state.color}
                onChange={(e) => {
                  setCustomHex(e.target.value);
                  onUpdateState({ color: e.target.value });
                }}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0 p-0"
              />
              <div className="flex-1">
                <div className="text-[10px] uppercase font-mono text-neutral-400">
                  {state.colorMode === 'gradient' ? 'Cor Primária / HEX' : 'Cor Personalizada / HEX'}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <input
                    type="text"
                    value={customHex}
                    onChange={(e) => handleApplyCustomHex(e.target.value)}
                    placeholder="#3B82F6"
                    className="w-24 bg-neutral-900 text-xs font-mono text-white px-2 py-1 rounded border border-neutral-700 focus:outline-none focus:border-rose-500 uppercase"
                  />
                  <span className="text-[10px] text-neutral-400 font-mono">RGB</span>
                </div>
              </div>
            </div>

            {/* Gradient Secondary Color Picker (Conditional or always configurable) */}
            <div className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
              state.colorMode === 'gradient' 
                ? 'bg-neutral-950/90 border-purple-500/40 shadow-sm shadow-purple-500/10' 
                : 'bg-neutral-950/40 border-neutral-850 opacity-60'
            }`}>
              <input
                id="color-picker-gradient"
                type="color"
                disabled={state.colorMode !== 'gradient'}
                value={state.gradientEndColor || '#8B5CF6'}
                onChange={(e) => {
                  setGradientEndHex(e.target.value);
                  onUpdateState({ gradientEndColor: e.target.value, colorMode: 'gradient' });
                }}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0 p-0 disabled:opacity-40"
              />
              <div className="flex-1">
                <div className="text-[10px] uppercase font-mono text-neutral-400 flex items-center justify-between">
                  <span>Cor Final do Gradiente</span>
                  {state.colorMode !== 'gradient' && <span className="text-[9px] text-neutral-400">(Ativar Gradiente)</span>}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <input
                    type="text"
                    disabled={state.colorMode !== 'gradient'}
                    value={gradientEndHex}
                    onChange={(e) => handleApplyGradientEnd(e.target.value)}
                    placeholder="#8B5CF6"
                    className="w-24 bg-neutral-900 text-xs font-mono text-white px-2 py-1 rounded border border-neutral-700 focus:outline-none focus:border-purple-500 uppercase disabled:opacity-40"
                  />
                  {state.colorMode === 'gradient' && (
                    <select
                      value={state.gradientAngle || 135}
                      onChange={(e) => onUpdateState({ gradientAngle: Number(e.target.value) })}
                      className="bg-neutral-900 text-[10px] text-neutral-300 font-mono px-1.5 py-1 rounded border border-neutral-700"
                      title="Ângulo do Gradiente"
                    >
                      <option value={0}>0°</option>
                      <option value={45}>45°</option>
                      <option value={90}>90°</option>
                      <option value={135}>135°</option>
                      <option value={180}>180°</option>
                    </select>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* ACTIVE COLOR REAL-TIME PREVIEW BAR */}
          <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10.5px] font-mono text-neutral-400">Em exibição:</span>
              <div 
                className="w-28 h-6 rounded-md shadow-inner border border-white/20"
                style={{
                  background: state.colorMode === 'gradient'
                    ? `linear-gradient(${state.gradientAngle || 135}deg, ${state.color}, ${state.gradientEndColor || '#8B5CF6'})`
                    : state.color,
                }}
              />
              <span className="text-xs font-mono font-bold text-neutral-200">
                {state.colorMode === 'gradient' ? `${state.color} → ${state.gradientEndColor}` : state.color}
              </span>
            </div>
            <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>TRANSMITINDO AO VIVO</span>
            </div>
          </div>

        </div>

        {/* 2. CONTROLES DE EFEITOS DINÂMICOS */}
        <div className="bg-neutral-900/80 border border-neutral-800/90 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">Efeito Visual</h2>
                <p className="text-xs text-neutral-400">Comportamento da iluminação na multidão</p>
              </div>
            </div>

            {/* Tap Tempo / BPM Sync */}
            <div className="flex items-center gap-2">
              <button
                id="btn-tap-tempo"
                onClick={handleTapTempo}
                className="px-3 py-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-purple-500/40 text-purple-300 hover:text-white text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
                title="Toque repetidamente no ritmo da música para ajustar o BPM"
              >
                <Music className="w-3.5 h-3.5" />
                <span>TAP TEMPO</span>
              </button>
              <div className="px-2.5 py-1 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono font-bold text-neutral-200">
                {state.bpm} <span className="text-[10px] text-neutral-400">BPM</span>
              </div>
            </div>
          </div>

          {/* Grid de Efeitos com Botões Grandes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
            {EFFECTS.map((eff) => {
              const IconComp = eff.icon;
              const isSelected = state.effect === eff.id;
              return (
                <button
                  key={eff.id}
                  id={`btn-effect-${eff.id}`}
                  onClick={() => onUpdateState({ effect: eff.id })}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-neutral-800 border-purple-500 text-white shadow-md shadow-purple-500/20 ring-1 ring-purple-500'
                      : 'bg-neutral-950/70 hover:bg-neutral-850 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <IconComp className={`w-4 h-4 ${isSelected ? 'text-purple-400' : 'text-neutral-400'}`} />
                    {isSelected && <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wide text-white">{eff.label}</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">{eff.description}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Velocidade do Efeito */}
          <div className="flex items-center gap-4 bg-neutral-950/70 p-3 rounded-xl border border-neutral-800/80">
            <span className="text-xs font-mono text-neutral-400 w-24">Velocidade:</span>
            <input
              type="range"
              min="0.4"
              max="2.5"
              step="0.1"
              value={state.effectSpeed}
              onChange={(e) => onUpdateState({ effectSpeed: parseFloat(e.target.value) })}
              className="flex-1 accent-purple-500 cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-purple-300 w-12 text-right">
              {state.effectSpeed.toFixed(1)}x
            </span>
          </div>

        </div>

        {/* 3. MÓDULO DE SINCRONIZAÇÃO MUSICAL (REAÇÃO POR SOM DA MÚSICA) */}
        <div className="bg-neutral-900/80 border border-neutral-800/90 rounded-2xl p-5 shadow-xl">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Music className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-white">Sincronização Musical</h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    SOUND-SYNC
                  </span>
                </div>
                <p className="text-xs text-neutral-400">Utiliza o som da música para sincronizar o piscar da tela dos celulares</p>
              </div>
            </div>

            {/* Toggle Audio Sync */}
            <div className="flex items-center gap-2">
              <button
                id="btn-toggle-audio-sync"
                onClick={() => onUpdateState({ audioSyncEnabled: !state.audioSyncEnabled })}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase font-mono tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                  state.audioSyncEnabled
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white ring-2 ring-indigo-400/40 shadow-indigo-600/30'
                    : 'bg-neutral-950 hover:bg-neutral-800 text-neutral-400 border border-neutral-800'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{state.audioSyncEnabled ? 'SOM ATIVADO' : 'SOM DESATIVADO'}</span>
              </button>
            </div>
          </div>

          {/* If Audio Sync is Enabled */}
          {state.audioSyncEnabled ? (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Sensitivity & FFT Band */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Sensitivity Slider */}
                <div className="bg-neutral-950/80 p-3.5 rounded-xl border border-neutral-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">Sensibilidade ao Som</span>
                    <span className="text-xs font-mono font-bold text-indigo-400">{state.audioSensitivity}%</span>
                  </div>
                  <input
                    id="slider-audio-sensitivity"
                    type="range"
                    min="1"
                    max="100"
                    value={state.audioSensitivity}
                    onChange={(e) => onUpdateState({ audioSensitivity: Number(e.target.value) })}
                    className="w-full accent-indigo-500 cursor-pointer h-2 bg-neutral-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[9.5px] font-mono text-neutral-400 mt-1">
                    <span>Baixa (PA Muito Alto)</span>
                    <span>Alta (Palmas / Acústico)</span>
                  </div>
                </div>

                {/* Frequência Sonora */}
                <div className="bg-neutral-950/80 p-3.5 rounded-xl border border-neutral-800 flex flex-col justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                    Faixa Sonora de Gatilho
                  </div>
                  <div className="grid grid-cols-3 gap-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800 text-[11px] font-semibold text-center">
                    {[
                      { id: 'bass', label: 'Graves (Kick)' },
                      { id: 'mids', label: 'Médios (Voz)' },
                      { id: 'full', label: 'Total (Master)' },
                    ].map((band) => (
                      <button
                        key={band.id}
                        onClick={() => onUpdateState({ audioFftBand: band.id as AudioFftBand })}
                        className={`py-1 rounded transition-colors cursor-pointer ${
                          state.audioFftBand === band.id
                            ? 'bg-neutral-800 text-white font-bold shadow-xs'
                            : 'text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        {band.label}
                      </button>
                    ))}
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-1 font-mono">
                    {state.audioFftBand === 'bass' && 'Detecta bumbos e graves (40-160Hz)'}
                    {state.audioFftBand === 'mids' && 'Detecta vocais, caixas e palmas'}
                    {state.audioFftBand === 'full' && 'Reage a todo pico dinâmico sonoro'}
                  </div>
                </div>
              </div>

              {/* Modo de Piscar na Batida (Audio Reaction Modes) */}
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-2">
                  Comportamento do Piscar ao Ouvir a Música
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'flash_beat', label: 'Flash de Batida', desc: 'Clarão vivo no grave', icon: Zap },
                    { id: 'pulse_beat', label: 'Pulso no Compasso', desc: 'Expansão rítmica suave', icon: Activity },
                    { id: 'strobe_beat', label: 'Strobe no Clímax', desc: 'Rajada estroboscópica', icon: Sparkles },
                    { id: 'color_jump', label: 'Salto Cromático', desc: 'Alterna matiz na batida', icon: Palette },
                  ].map((mode) => {
                    const IconC = mode.icon;
                    const isSel = state.audioReactionMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        id={`btn-audio-mode-${mode.id}`}
                        onClick={() => onUpdateState({ audioReactionMode: mode.id as AudioReactionMode })}
                        className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          isSel
                            ? 'bg-neutral-800 border-indigo-500 text-white ring-1 ring-indigo-500 shadow-md shadow-indigo-500/20'
                            : 'bg-neutral-950/70 hover:bg-neutral-850 border-neutral-800 text-neutral-400'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <IconC className={`w-3.5 h-3.5 ${isSel ? 'text-indigo-400' : 'text-neutral-400'}`} />
                          {isSel && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{mode.label}</div>
                          <div className="text-[10px] text-neutral-400">{mode.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Console de Teste e Monitor de Áudio em Tempo Real (Live VU Meter) */}
              <div className="bg-neutral-950/90 p-3.5 rounded-xl border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Radio className={`w-4 h-4 ${audioSource !== 'off' ? 'text-emerald-400 animate-pulse' : 'text-neutral-400'}`} />
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-200">
                      Monitor de Áudio da Mesa (Teste ao Vivo)
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {audioSource === 'off' ? (
                      <>
                        <button
                          id="btn-start-mic-test"
                          onClick={handleStartMic}
                          className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-700 text-[11px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Captura o som do microfone do seu computador/celular para testar a reação à música do ambiente"
                        >
                          <Mic className="w-3 h-3 text-rose-400" />
                          <span>Ouvir Microfone</span>
                        </button>
                        <button
                          id="btn-start-synth-test"
                          onClick={handleStartSynth}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Gera batidas sintetizadas de bumbo no BPM configurado"
                        >
                          <Play className="w-3 h-3" />
                          <span>Simular Música ({state.bpm} BPM)</span>
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          <span>{audioSource === 'mic' ? 'MICROFONE AO VIVO' : 'MÚSICA SIMULADA'}</span>
                        </span>
                        {audioSource === 'synth' && (
                          <button
                            onClick={() => setSynthAudible(!synthAudible)}
                            className="p-1 rounded bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-700 cursor-pointer"
                            title={synthAudible ? 'Silenciar som do bumbo' : 'Ouvir som do bumbo sintetizado'}
                          >
                            {synthAudible ? <Volume2 className="w-3 h-3 text-indigo-400" /> : <VolumeX className="w-3 h-3" />}
                          </button>
                        )}
                        <button
                          onClick={handleStopAudio}
                          className="px-2 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 text-[11px] font-mono flex items-center gap-1 cursor-pointer"
                        >
                          <Square className="w-3 h-3 text-rose-400" />
                          <span>Parar</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Live Audio Visualizer / VU Spectrum */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-neutral-900 h-6 rounded-lg p-1 flex items-end gap-1 overflow-hidden border border-neutral-800">
                    {(audioMetrics?.frequencyData || [12, 22, 18, 35, 28, 20, 14, 10]).map((val, idx) => (
                      <div
                        key={idx}
                        className="flex-1 bg-gradient-to-t from-indigo-600 via-purple-500 to-rose-400 rounded-xs transition-all duration-75"
                        style={{
                          height: audioSource !== 'off' ? `${Math.max(10, val)}%` : '15%',
                          opacity: audioSource !== 'off' ? 1 : 0.25,
                        }}
                      />
                    ))}
                  </div>

                  {/* Beat Peak Indicator Lamp */}
                  <div
                    className={`px-3 py-1 rounded-lg border text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all duration-100 ${
                      isBeatFlashing || (audioMetrics?.isBeat && state.isActive)
                        ? 'bg-amber-400 text-neutral-950 border-amber-300 shadow-lg shadow-amber-400/50 scale-105'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                    }`}
                  >
                    <Zap className={`w-3.5 h-3.5 ${isBeatFlashing ? 'fill-current animate-bounce' : ''}`} />
                    <span>{isBeatFlashing ? 'BATIDA! ⚡' : 'BEAT PULSE'}</span>
                  </div>
                </div>

                {micPermissionError && (
                  <div className="text-[11px] text-amber-400 font-mono">
                    ⚠️ {micPermissionError}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="p-4 bg-neutral-950/50 rounded-xl border border-dashed border-neutral-800 text-center">
              <div className="text-xs text-neutral-400">
                A sincronização por som está desligada. A tela seguirá apenas o tempo fixo do efeito visual.
              </div>
              <button
                onClick={() => onUpdateState({ audioSyncEnabled: true })}
                className="mt-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 font-mono cursor-pointer"
              >
                Ativar Sincronização Musical por Áudio →
              </button>
            </div>
          )}

        </div>

      </div>

      {/* 2. SEÇÃO DE SLIDERS & IMAGEM (Lg col 5) */}
      <div className="lg:col-span-5 flex flex-col gap-5">
        
        {/* SLIDERS DE INTENSIDADE E BRILHO */}
        <div className="bg-neutral-900/80 border border-neutral-800/90 rounded-2xl p-5 shadow-xl flex flex-col gap-5">
          
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">Níveis de Iluminação</h2>
            </div>
            <span className="text-xs font-mono text-neutral-400">Dimmer Digital</span>
          </div>

          {/* Slider 1: INTENSIDADE */}
          <div className="bg-neutral-950/90 p-4 rounded-xl border border-neutral-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-200">INTENSIDADE</span>
              </div>
              <span className="text-base font-bold font-mono text-emerald-400">{state.intensity}%</span>
            </div>
            <input
              id="slider-intensity"
              type="range"
              min="0"
              max="100"
              value={state.intensity}
              onChange={(e) => onUpdateState({ intensity: Number(e.target.value) })}
              className="w-full accent-emerald-400 cursor-pointer h-2 bg-neutral-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] font-mono text-neutral-400 mt-1.5">
              <span>0% (Mínimo)</span>
              <span>50%</span>
              <span>100% (Potência Máxima)</span>
            </div>
          </div>

          {/* Slider 2: BRILHO DA TELA */}
          <div className="bg-neutral-950/90 p-4 rounded-xl border border-neutral-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-200">BRILHO DO SMARTPHONE</span>
              </div>
              <span className="text-base font-bold font-mono text-amber-400">{state.brightness}%</span>
            </div>
            <input
              id="slider-brightness"
              type="range"
              min="10"
              max="100"
              value={state.brightness}
              onChange={(e) => onUpdateState({ brightness: Number(e.target.value) })}
              className="w-full accent-amber-400 cursor-pointer h-2 bg-neutral-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] font-mono text-neutral-400 mt-1.5">
              <span>10% (Baixo)</span>
              <span>50%</span>
              <span>100% (Brilho Máximo do Display)</span>
            </div>
          </div>

        </div>

        {/* CONTROLE DE IMAGEM / LOGO NA TELA */}
        <div className="bg-neutral-900/80 border border-neutral-800/90 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">Imagem / Logo do Show</h2>
                <p className="text-xs text-neutral-400">Exibida no centro dos celulares</p>
              </div>
            </div>

            {/* Toggle Image Visibility */}
            <button
              id="btn-toggle-image-enabled"
              onClick={() =>
                onUpdateState({
                  image: { ...state.image, enabled: !state.image.enabled },
                })
              }
              className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                state.image.enabled
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {state.image.enabled ? 'EXIBINDO' : 'OCULTA'}
            </button>
          </div>

          {/* Current Image Card & Controls */}
          {state.image.enabled && state.image.url ? (
            <div className="bg-neutral-950/90 p-3.5 rounded-xl border border-neutral-800 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-lg bg-neutral-900 border border-neutral-700 overflow-hidden flex items-center justify-center relative group">
                  <img
                    src={state.image.url}
                    alt={state.image.name}
                    className="w-full h-full object-contain p-1"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white truncate">{state.image.name || 'Imagem Ativa'}</div>
                  <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                    Escala: {state.image.scale}% • Pos: {state.image.position} • Efeito: {state.image.effect}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={onOpenImageModal}
                      className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 underline"
                    >
                      Trocar Imagem
                    </button>
                    <span className="text-neutral-600">•</span>
                    <button
                      onClick={() =>
                        onUpdateState({
                          image: { ...state.image, enabled: false, url: '' },
                        })
                      }
                      className="text-[11px] font-semibold text-rose-400 hover:text-rose-300"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Image Scale Slider */}
              <div className="mt-3 pt-3 border-t border-neutral-800/80 flex items-center gap-3">
                <span className="text-[10.5px] font-mono text-neutral-400">Escala:</span>
                <input
                  type="range"
                  min="30"
                  max="160"
                  value={state.image.scale}
                  onChange={(e) =>
                    onUpdateState({
                      image: { ...state.image, scale: Number(e.target.value) },
                    })
                  }
                  className="flex-1 accent-blue-500 h-1.5"
                />
                <span className="text-[11px] font-mono text-neutral-200">{state.image.scale}%</span>
              </div>
            </div>
          ) : (
            <div 
              onClick={onOpenImageModal}
              className="bg-neutral-950/60 hover:bg-neutral-950 border border-dashed border-neutral-800 hover:border-neutral-700 rounded-xl p-4 text-center cursor-pointer transition-all mb-4"
            >
              <ImageIcon className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
              <div className="text-xs font-bold text-neutral-300">Nenhuma Imagem Selecionada</div>
              <div className="text-[10.5px] text-neutral-400 mt-0.5">
                Clique para escolher da galeria ou fazer upload do logo do evento / artista
              </div>
            </div>
          )}

          <button
            id="btn-open-image-manager"
            onClick={onOpenImageModal}
            className="w-full py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-xs font-bold text-neutral-200 hover:text-white uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
          >
            <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
            <span>Gerenciar Biblioteca de Imagens</span>
          </button>

        </div>

        {/* OVERLAY DE MENSAGEM EM TEMPO REAL PARA TELAS (TEXTO RÁPIDO) */}
        <div className="bg-neutral-900/80 border border-neutral-800/90 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">Mensagem Coletiva na Tela</span>
            </div>
            {state.message && (
              <button
                onClick={() => {
                  setCustomMessageInput('');
                  onUpdateState({ message: '' });
                }}
                className="text-[10px] text-rose-400 hover:text-rose-300 font-mono"
              >
                Limpar Texto
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customMessageInput}
              onChange={(e) => setCustomMessageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onUpdateState({ message: customMessageInput.trim() });
                }
              }}
              placeholder="Ex: TODOS OS BRAÇOS PARA O ALTO!"
              className="flex-1 bg-neutral-950 text-xs text-white px-3 py-2 rounded-xl border border-neutral-800 focus:outline-none focus:border-emerald-500 font-mono uppercase"
            />
            <button
              id="btn-broadcast-message"
              onClick={() => onUpdateState({ message: customMessageInput.trim() })}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-neutral-950 text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Exibir
            </button>
          </div>
          <div className="flex items-center gap-1.5 mt-2 overflow-x-auto text-[10px] text-neutral-400">
            <span className="text-neutral-400 font-mono">Sugestões:</span>
            {['BRAÇOS NO AR! 🙌', 'FAÇAM BARULHO! ⚡', 'CANTA JUNTO! 🎤', 'LIGUEM AS LUZES! 💡'].map((sug) => (
              <button
                key={sug}
                onClick={() => {
                  setCustomMessageInput(sug);
                  onUpdateState({ message: sug });
                }}
                className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white whitespace-nowrap"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
