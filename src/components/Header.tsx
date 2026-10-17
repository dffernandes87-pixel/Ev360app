import React from 'react';
import { 
  Radio, 
  Power, 
  Zap, 
  Smartphone, 
  Flame, 
  ChevronDown, 
  Key, 
  Code2, 
  Layers,
  Sparkles,
  Wifi,
  EyeOff,
  Camera
} from 'lucide-react';
import { EventProfile, ShowState } from '../types';

interface HeaderProps {
  currentEvent: EventProfile;
  state: ShowState;
  deviceCount: number;
  onToggleActive: () => void;
  onToggleBlackout: () => void;
  onTriggerStrobe: () => void;
  onOpenEventsModal: () => void;
  onOpenApiModal: () => void;
  onToggleSimulator: () => void;
  simulatorOpen: boolean;
  onSelectSector: (sector: string) => void;
  onOpenGalleryModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentEvent,
  state,
  deviceCount,
  onToggleActive,
  onToggleBlackout,
  onTriggerStrobe,
  onOpenEventsModal,
  onOpenApiModal,
  onToggleSimulator,
  simulatorOpen,
  onSelectSector,
  onOpenGalleryModal,
}) => {
  return (
    <header className="border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3.5">
      <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Left: Brand + Active Event Selector */}
        <div className="flex items-center gap-3.5 flex-wrap">
          <div className="flex items-center gap-2.5 pr-3 border-r border-neutral-800">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 via-purple-600 to-indigo-600 p-0.5 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-rose-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-semibold tracking-wide uppercase text-white">MODO SHOW</h1>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  CENTRAL
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-mono">Console DMX Digital v2.4</p>
            </div>
          </div>

          {/* Active Event Dropdown Trigger */}
          <button
            id="btn-select-event"
            onClick={onOpenEventsModal}
            className="group flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-850 border border-neutral-800 hover:border-neutral-700 transition-all text-left"
            title="Trocar ou gerenciar eventos"
          >
            <div className="relative">
              <span className={`w-2.5 h-2.5 rounded-full block ${
                currentEvent.status === 'online' ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse' : 'bg-amber-500'
              }`} />
            </div>
            <div>
              <div className="text-xs font-semibold text-neutral-200 group-hover:text-white flex items-center gap-1.5">
                <span>{currentEvent.name}</span>
                <span className="text-[10px] font-mono text-neutral-400">({currentEvent.code})</span>
              </div>
              <div className="text-[10.5px] text-neutral-400 flex items-center gap-1">
                <span>ID: {currentEvent.id}</span>
                <span className="text-neutral-600">•</span>
                <span className="text-emerald-400 font-medium">Online</span>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-neutral-400 group-hover:text-neutral-200 ml-1 transition-transform group-hover:translate-y-0.5" />
          </button>

          {/* Connected Devices Badge */}
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-neutral-900/80 border border-neutral-800">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">Dispositivos Conectados</div>
              <div className="text-sm font-bold font-mono text-emerald-400 flex items-center gap-1.5">
                <span>{deviceCount.toLocaleString('pt-BR')}</span>
                <span className="text-[10.5px] font-normal text-neutral-400">smartphones</span>
              </div>
            </div>
          </div>

          {/* Sector Filter */}
          <div className="hidden xl:flex items-center gap-1 px-2 py-1 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
            <Layers className="w-3.5 h-3.5 text-neutral-400 ml-1.5 mr-1" />
            <span className="text-[11px] text-neutral-400 mr-1">Setor:</span>
            <select
              value={state.targetSector || 'Todos'}
              onChange={(e) => onSelectSector(e.target.value)}
              className="bg-transparent text-xs text-neutral-200 font-medium border-none focus:ring-0 cursor-pointer pr-4 py-0.5"
            >
              {currentEvent.sectors.map((sec) => (
                <option key={sec} value={sec} className="bg-neutral-900 text-neutral-100">
                  {sec}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Master Show Switches & Utilities */}
        <div className="flex items-center gap-2.5 flex-wrap">
          
          {/* Emergency / Flash Tools */}
          <div className="flex items-center gap-1.5 bg-neutral-900/90 p-1 rounded-xl border border-neutral-800">
            {/* Strobe Burst */}
            <button
              id="btn-strobe-burst"
              onClick={onTriggerStrobe}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 ${
                state.strobeActive 
                  ? 'bg-amber-400 text-neutral-950 shadow-lg shadow-amber-400/40 ring-2 ring-amber-300' 
                  : 'bg-neutral-800 hover:bg-neutral-700 text-amber-300'
              }`}
              title="Flash estroboscópico de impacto"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>STROBE</span>
            </button>

            {/* Blackout */}
            <button
              id="btn-blackout"
              onClick={onToggleBlackout}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 ${
                state.blackoutActive
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40 ring-2 ring-rose-400 animate-pulse'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white'
              }`}
              title="Apagar todas as telas instantaneamente"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>BLACKOUT</span>
            </button>
          </div>

          {/* MASTER ACTIVATION SWITCH (Massive High-Contrast Button) */}
          <button
            id="btn-master-active-toggle"
            onClick={onToggleActive}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md active:scale-95 ${
              state.isActive
                ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-emerald-500/25 ring-2 ring-emerald-400/40'
                : 'bg-rose-600/90 hover:bg-rose-500 text-white shadow-rose-600/20 border border-rose-500'
            }`}
          >
            <Power className="w-4 h-4 stroke-[2.5]" />
            <span>{state.isActive ? 'MODO SHOW ATIVO' : 'MODO SHOW DESATIVADO'}</span>
          </button>

          {/* Master Show Switches & Utilities */}
          {onOpenGalleryModal && (
            <button
              id="btn-open-gallery-modal"
              onClick={onOpenGalleryModal}
              className="px-3 py-2 rounded-xl text-xs font-medium border bg-neutral-900/90 hover:bg-neutral-800 text-purple-300 hover:text-purple-200 border-purple-500/30 flex items-center gap-2 transition-all cursor-pointer"
              title="Gerenciar fotos da Galeria 2026 e 2025 exibidas no aplicativo dos participantes"
            >
              <Camera className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Galeria (2026/2025)</span>
            </button>
          )}

          {/* Mobile Simulator Toggle */}
          <button
            id="btn-toggle-phone-simulator"
            onClick={onToggleSimulator}
            className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center gap-2 transition-all ${
              simulatorOpen 
                ? 'bg-neutral-800 text-rose-400 border-rose-500/50 shadow-sm'
                : 'bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 border-neutral-800'
            }`}
            title="Visualizar tela do smartphone do participante"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Simulador de Smartphone</span>
          </button>

          {/* API Connection & Docs */}
          <button
            id="btn-open-api-modal"
            onClick={onOpenApiModal}
            className="p-2 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors"
            title="Chaves de API, Endpoint e Integração com App Móvel"
          >
            <Code2 className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
