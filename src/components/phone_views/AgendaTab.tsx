import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Sparkles, 
  MapPin, 
  Sliders, 
  ChevronRight, 
  Bell, 
  Check, 
  Radio, 
  Flame,
  Volume2
} from 'lucide-react';
import { AgendaShowItem } from '../../types';
import { showApi } from '../../services/api';

interface AgendaTabProps {
  onGoToShowMode: () => void;
}

export const AgendaTab: React.FC<AgendaTabProps> = ({ onGoToShowMode }) => {
  const [items] = useState<AgendaShowItem[]>(() => {
    const a = showApi.getAgenda();
    return Array.isArray(a) ? a : [];
  });
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-18');
  const [simulatedTime, setSimulatedTime] = useState<string>('21:15');
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['agenda-fri-03']));
  const [selectedStage, setSelectedStage] = useState<string>('Todos');

  // Convert "HH:MM" to minutes from midnight
  const toMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const currentSimMinutes = toMinutes(simulatedTime);

  // Compute live/upcoming/completed based on simulatedTime
  const getSimulatedStatus = (item: AgendaShowItem): 'completed' | 'live' | 'upcoming' => {
    const startMin = toMinutes(item.time);
    const endMin = item.endTime ? toMinutes(item.endTime) : startMin + 90;

    if (currentSimMinutes < startMin) {
      return 'upcoming';
    } else if (currentSimMinutes >= startMin && currentSimMinutes < endMin) {
      return 'live';
    } else {
      return 'completed';
    }
  };

  const safeItems = Array.isArray(items) ? items : [];
  const filteredItems = safeItems
    .filter((item) => item && item.dateKey === selectedDate)
    .filter((item) => selectedStage === 'Todos' || item.stage === selectedStage);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const timePresets = ['18:00', '19:30', '21:15', '23:30'];

  return (
    <div className="flex-1 flex flex-col overflow-y-auto text-left space-y-3 p-3 text-white">
      {/* Title */}
      <div className="flex items-center justify-between pb-1 border-b border-neutral-800">
        <div>
          <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-rose-400" />
            <span>Programação Oficial</span>
          </h3>
          <p className="text-[10px] text-neutral-400">Todos os horários e palcos do festival</p>
        </div>
        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300">
          3 DIAS DE SHOWS
        </span>
      </div>

      {/* Date Switcher */}
      <div className="grid grid-cols-3 gap-1 bg-neutral-900/90 p-1 rounded-xl border border-neutral-800 text-[10px]">
        <button
          onClick={() => setSelectedDate('2026-09-18')}
          className={`py-1.5 px-1 rounded-lg font-bold transition-all text-center cursor-pointer ${
            selectedDate === '2026-09-18'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <div>Sexta 18/09</div>
          <div className="text-[8px] font-normal opacity-80">Abertura</div>
        </button>

        <button
          onClick={() => setSelectedDate('2026-09-19')}
          className={`py-1.5 px-1 rounded-lg font-bold transition-all text-center cursor-pointer ${
            selectedDate === '2026-09-19'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <div>Sábado 19/09</div>
          <div className="text-[8px] font-normal opacity-80">Grande Show</div>
        </button>

        <button
          onClick={() => setSelectedDate('2026-09-20')}
          className={`py-1.5 px-1 rounded-lg font-bold transition-all text-center cursor-pointer ${
            selectedDate === '2026-09-20'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <div>Dom 20/09</div>
          <div className="text-[8px] font-normal opacity-80">Encerramento</div>
        </button>
      </div>

      {/* Interactive Time Simulation Control (User Prompt: "Podemos simular algumas datas e alguns horários dentro de um dia de shows numa simulação") */}
      <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-amber-300">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>Simulador de Horário do Dia</span>
          </div>
          <div className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-black/60 text-amber-300 border border-amber-500/30">
            {simulatedTime}
          </div>
        </div>

        {/* Quick Time Presets */}
        <div className="grid grid-cols-4 gap-1">
          {timePresets.map((t) => (
            <button
              key={t}
              onClick={() => setSimulatedTime(t)}
              className={`py-1 rounded text-[9.5px] font-mono transition-all cursor-pointer ${
                simulatedTime === t
                  ? 'bg-amber-400 text-neutral-950 font-bold shadow'
                  : 'bg-neutral-800 hover:bg-neutral-750 text-neutral-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Time Slider */}
        <div className="pt-1">
          <input
            type="range"
            min={16 * 60}
            max={24 * 60 + 60}
            step={15}
            value={currentSimMinutes}
            onChange={(e) => {
              const val = Number(e.target.value);
              const h = Math.floor(val / 60) % 24;
              const m = val % 60;
              setSimulatedTime(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
            }}
            className="w-full h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
          <div className="flex justify-between text-[8px] font-mono text-neutral-400 mt-1">
            <span>16:00 (Início)</span>
            <span className="text-amber-300 font-bold">Arraste para simular o dia</span>
            <span>01:00 (Madrugada)</span>
          </div>
        </div>
      </div>

      {/* Shows List */}
      <div className="space-y-2">
        {filteredItems.map((item) => {
          const status = getSimulatedStatus(item);
          const isLive = status === 'live';
          const isCompleted = status === 'completed';
          const isFav = favorites.has(item.id);

          return (
            <div
              key={item.id}
              className={`p-2.5 rounded-xl border transition-all text-left relative overflow-hidden ${
                isLive
                  ? 'bg-gradient-to-br from-neutral-900 to-rose-950/40 border-rose-500/60 shadow-lg shadow-rose-950/30 ring-1 ring-rose-500/40'
                  : isCompleted
                  ? 'bg-neutral-900/40 border-neutral-850 opacity-60'
                  : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              {/* Header row */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono font-bold text-white bg-black/40 px-1.5 py-0.5 rounded border border-white/10">
                    {item.time} {item.endTime ? `— ${item.endTime}` : ''}
                  </span>

                  {isLive && (
                    <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-rose-300 bg-rose-500/20 border border-rose-500/40 px-2 py-0.5 rounded-full animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                      <span>Ao Vivo Agora</span>
                    </span>
                  )}

                  {isCompleted && (
                    <span className="text-[9px] font-mono text-neutral-400 flex items-center gap-0.5">
                      <Check className="w-3 h-3 text-neutral-400" />
                      <span>Concluído</span>
                    </span>
                  )}

                  {status === 'upcoming' && (
                    <span className="text-[9px] font-mono text-neutral-400">
                      Em breve
                    </span>
                  )}
                </div>

                <button
                  onClick={(e) => toggleFavorite(item.id, e)}
                  className={`p-1 rounded-md transition-colors cursor-pointer ${
                    isFav ? 'text-amber-400 bg-amber-400/10' : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                  title="Favoritar / Lembrete"
                >
                  <Bell className="w-3 h-3" />
                </button>
              </div>

              {/* Show info */}
              <div>
                <h4 className={`text-xs font-bold ${isLive ? 'text-rose-200' : 'text-white'}`}>
                  {item.artist}
                </h4>
                <div className="text-[10px] text-neutral-300 font-medium">{item.title}</div>
                <div className="flex items-center gap-1 text-[9px] text-neutral-400 mt-1">
                  <MapPin className="w-2.5 h-2.5 text-neutral-400" />
                  <span>{item.stage}</span>
                </div>
                <p className="text-[9.5px] text-neutral-400 mt-1 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>

              {/* Modo Show Sync Badge or Action */}
              {item.hasShowModeSync && (
                <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[9px] text-purple-300 font-mono">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span>Modo Show Sincronizado</span>
                  </div>

                  {isLive && (
                    <button
                      onClick={onGoToShowMode}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[9.5px] font-bold flex items-center gap-1 shadow-sm transition-transform active:scale-95 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Abrir Show</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
