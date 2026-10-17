import React, { useState, useEffect, useCallback } from 'react';
import { 
  EventProfile, 
  ShowState, 
  ShowPreset, 
  ShowScene, 
  ShowImageConfig 
} from './types';
import { showApi } from './services/api';
import { Header } from './components/Header';
import { ControlsConsole } from './components/ControlsConsole';
import { PresetsDeck } from './components/PresetsDeck';
import { ScenesDeck } from './components/ScenesDeck';
import { ImageManagerModal } from './components/ImageManagerModal';
import { EventsManagerModal } from './components/EventsManagerModal';
import { ApiIntegrationModal } from './components/ApiIntegrationModal';
import { GalleryManagerModal } from './components/GalleryManagerModal';
import { PhoneSimulator } from './components/PhoneSimulator';
import { 
  Sparkles, 
  Radio, 
  Layers, 
  Cpu, 
  Smartphone, 
  ShieldCheck, 
  Terminal,
  ExternalLink,
  Flame,
  Activity
} from 'lucide-react';

export default function App() {
  const [events, setEvents] = useState<EventProfile[]>([]);
  const [currentEventId, setCurrentEventId] = useState<string>(showApi.getSavedActiveEventId());
  const [currentEvent, setCurrentEvent] = useState<EventProfile | null>(null);
  const [showState, setShowState] = useState<ShowState | null>(null);
  const [deviceCount, setDeviceCount] = useState<number>(1248);
  const [presets, setPresets] = useState<ShowPreset[]>(showApi.getPresets());
  const [scenes, setScenes] = useState<ShowScene[]>(showApi.getScenes());

  // Modals & Panels
  const [isEventsModalOpen, setIsEventsModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(true); // Open by default for instant feedback!

  // Initial load
  useEffect(() => {
    async function load() {
      const loadedEvents = await showApi.getEvents();
      setEvents(loadedEvents);
      
      const found = loadedEvents.find((e) => e.id === currentEventId) || loadedEvents[0];
      if (found) {
        setCurrentEvent(found);
        setShowState(found.state);
        setDeviceCount(found.connectedDevices);
      }
    }
    load();
  }, [currentEventId]);

  // SSE Real-time Subscription to current event
  useEffect(() => {
    if (!currentEventId) return;

    const unsubscribe = showApi.subscribeToEventStream(
      currentEventId,
      (updatedState) => {
        setShowState(updatedState);
      },
      (count) => {
        setDeviceCount(count);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentEventId]);

  // Update show state handler
  const handleUpdateState = useCallback(
    async (partial: Partial<ShowState>) => {
      if (!currentEvent) return;
      const updated = await showApi.updateShowState(currentEvent.id, partial);
      setShowState(updated);
    },
    [currentEvent]
  );

  // Toggle master active
  const handleToggleActive = () => {
    if (!showState) return;
    handleUpdateState({ isActive: !showState.isActive, blackoutActive: false });
  };

  // Blackout toggle
  const handleToggleBlackout = () => {
    if (!showState) return;
    handleUpdateState({ blackoutActive: !showState.blackoutActive });
  };

  // Strobe burst (runs temporary burst then turns off)
  const handleTriggerStrobe = () => {
    handleUpdateState({ strobeActive: true });
    setTimeout(() => {
      handleUpdateState({ strobeActive: false });
    }, 1200);
  };

  // Apply preset
  const handleApplyPreset = (preset: ShowPreset) => {
    const partial: Partial<ShowState> = {
      color: preset.color,
      colorMode: preset.colorMode || 'single',
      gradientEndColor: preset.gradientEndColor,
      effect: preset.effect,
      intensity: preset.intensity,
      brightness: preset.brightness,
      isActive: true,
      blackoutActive: false,
    };
    if (preset.image) {
      partial.image = {
        ...showState?.image,
        ...preset.image,
        enabled: Boolean(preset.image.enabled),
      } as ShowImageConfig;
    }
    if (preset.bpm) {
      partial.bpm = preset.bpm;
    }
    if (preset.message !== undefined) {
      partial.message = preset.message;
    }
    handleUpdateState(partial);
  };

  // Apply scene
  const handleApplyScene = (scene: ShowScene) => {
    handleUpdateState({
      ...scene.config,
      isActive: true,
      blackoutActive: false,
    });
  };

  // Save current state as preset
  const handleSaveCurrentAsPreset = (name: string, description: string) => {
    if (!showState) return;
    const newPreset: ShowPreset = {
      id: `preset-${Date.now()}`,
      name,
      description,
      color: showState.color,
      colorMode: showState.colorMode,
      gradientEndColor: showState.gradientEndColor,
      effect: showState.effect,
      intensity: showState.intensity,
      brightness: showState.brightness,
      bpm: showState.bpm,
      message: showState.message,
      image: { ...showState.image },
    };
    const updated = showApi.savePreset(newPreset);
    setPresets(updated);
  };

  const handleDeletePreset = (id: string) => {
    const updated = showApi.deletePreset(id);
    setPresets(updated);
  };

  // Switch active event
  const handleSelectEvent = (eventId: string) => {
    setCurrentEventId(eventId);
    showApi.setSavedActiveEventId(eventId);
    const ev = events.find((e) => e.id === eventId);
    if (ev) {
      setCurrentEvent(ev);
      setShowState(ev.state);
      setDeviceCount(ev.connectedDevices);
    }
  };

  // Create new event
  const handleCreateEvent = async (newEventData: Omit<EventProfile, 'state'>) => {
    const created = await showApi.createEvent(newEventData);
    setEvents((prev) => [created, ...prev]);
    handleSelectEvent(created.id);
  };

  // Update image config
  const handleUpdateImageConfig = (config: ShowImageConfig) => {
    handleUpdateState({ image: config });
  };

  // Sector selection
  const handleSelectSector = (targetSector: string) => {
    handleUpdateState({ targetSector });
  };

  // Simulated ping
  const handleSimulateDevicePing = () => {
    if (!currentEvent) return;
    showApi.sendDeviceHeartbeat(currentEvent.id, `sim-device-${Date.now()}`, showState?.targetSector || 'Pista');
    setDeviceCount((prev) => prev + 1);
  };

  if (!currentEvent || !showState) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-rose-500 animate-spin" />
          <span className="text-sm font-mono tracking-wider">INICIALIZANDO CONSOLE DO MODO SHOW...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-rose-500 selection:text-white pb-16">
      
      {/* 1. TOP STATUS & MASTER CONTROLS HEADER */}
      <Header
        currentEvent={currentEvent}
        state={showState}
        deviceCount={deviceCount}
        onToggleActive={handleToggleActive}
        onToggleBlackout={handleToggleBlackout}
        onTriggerStrobe={handleTriggerStrobe}
        onOpenEventsModal={() => setIsEventsModalOpen(true)}
        onOpenApiModal={() => setIsApiModalOpen(true)}
        onOpenGalleryModal={() => setIsGalleryModalOpen(true)}
        onToggleSimulator={() => setIsSimulatorOpen(!isSimulatorOpen)}
        simulatorOpen={isSimulatorOpen}
        onSelectSector={handleSelectSector}
      />

      {/* 2. MAIN CONSOLE DESK */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto px-4 lg:px-8 pt-5 space-y-6">
        
        {/* Architectural Concept Banner (Shows strict separation of duties) */}
        <div className="rounded-xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-925 border border-neutral-800 p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white">Mesa de Luz Digital: </span>
              <span className="text-neutral-400">
                Você está controlando remotamente o Modo Show dos smartphones no evento <strong className="text-neutral-200">{currentEvent.name}</strong>.
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-[11px] font-mono text-neutral-400 shrink-0">
            <span className="flex items-center gap-1">
              <Radio className="w-3 h-3 text-emerald-400" />
              <span>Conexão: <strong>WebSocket/SSE Ativo</strong></span>
            </span>
            <span className="text-neutral-700">•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-purple-400" />
              <span>Chave: <strong>{currentEvent.connectionKey}</strong></span>
            </span>
          </div>
        </div>

        {/* Console Controles em Tempo Real (Cores, HEX, Efeitos, Dimmer, Imagem, BPM) */}
        <ControlsConsole
          state={showState}
          onUpdateState={handleUpdateState}
          onOpenImageModal={() => setIsImageModalOpen(true)}
        />

        {/* Deck de Presets (1-Click) */}
        <PresetsDeck
          presets={presets}
          activeState={showState}
          onApplyPreset={handleApplyPreset}
          onSaveCurrentAsPreset={handleSaveCurrentAsPreset}
          onDeletePreset={handleDeletePreset}
        />

        {/* Deck de Cenas (Roteiro e Cronograma do Show) */}
        <ScenesDeck
          scenes={scenes}
          activeState={showState}
          onApplyScene={handleApplyScene}
        />

      </main>

      {/* 3. PARTICIPANT PHONE SIMULATOR (Real-time live rendering on simulated smartphone) */}
      <PhoneSimulator
        state={showState}
        currentEvent={currentEvent}
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onSendPing={handleSimulateDevicePing}
        onUpdateState={handleUpdateState}
      />

      {/* 4. MODALS */}
      <EventsManagerModal
        isOpen={isEventsModalOpen}
        onClose={() => setIsEventsModalOpen(false)}
        events={events}
        activeEventId={currentEvent.id}
        onSelectEvent={handleSelectEvent}
        onCreateEvent={handleCreateEvent}
      />

      <ImageManagerModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        currentConfig={showState.image}
        onUpdateImageConfig={handleUpdateImageConfig}
      />

      <ApiIntegrationModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        currentEvent={currentEvent}
        activeState={showState}
      />

      <GalleryManagerModal
        isOpen={isGalleryModalOpen}
        onClose={() => setIsGalleryModalOpen(false)}
        eventId={currentEvent?.id || 'phn-2026'}
        eventName={currentEvent?.name || 'PHN 2026'}
      />

    </div>
  );
}
