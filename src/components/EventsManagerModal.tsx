import React, { useState } from 'react';
import { 
  X, 
  Radio, 
  Plus, 
  Check, 
  Key, 
  MapPin, 
  Users, 
  ShieldCheck, 
  Calendar,
  Layers
} from 'lucide-react';
import { EventProfile } from '../types';

interface EventsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: EventProfile[];
  activeEventId: string;
  onSelectEvent: (eventId: string) => void;
  onCreateEvent: (newEvent: Omit<EventProfile, 'state'>) => void;
}

export const EventsManagerModal: React.FC<EventsManagerModalProps> = ({
  isOpen,
  onClose,
  events,
  activeEventId,
  onSelectEvent,
  onCreateEvent,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [code, setCode] = useState('');
  const [location, setLocation] = useState('');
  const [producer, setProducer] = useState('');
  const [sectorsInput, setSectorsInput] = useState('Todos, Pista, Camarote, VIP');

  if (!isOpen) return null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const generatedId = id.trim() || name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const generatedCode = code.trim() || `${generatedId.toUpperCase().substring(0, 8)}-001`;
    const connectionKey = `KEY-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const sectors = sectorsInput.split(',').map((s) => s.trim()).filter(Boolean);

    onCreateEvent({
      id: generatedId,
      name: name.trim(),
      code: generatedCode,
      connectionKey,
      status: 'online',
      connectedDevices: 1,
      peakDevices: 1,
      location: location.trim() || 'Arena de Eventos',
      producer: producer.trim() || 'Produção Geral',
      sectors: sectors.length > 0 ? sectors : ['Todos', 'Pista', 'VIP'],
    });

    setName('');
    setId('');
    setCode('');
    setLocation('');
    setProducer('');
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-neutral-900 border border-neutral-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Meus Eventos & Plataforma Multi-Evento
              </h2>
              <p className="text-xs text-neutral-400">
                Selecione o evento ativo para controlar os smartphones conectados àquele espetáculo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-mono">
              Eventos Disponíveis ({events.length})
            </span>
            <button
              id="btn-add-event-toggle"
              onClick={() => setIsCreating(!isCreating)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-neutral-950 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Cadastrar Novo Evento</span>
            </button>
          </div>

          {/* Form to create a new event */}
          {isCreating && (
            <form onSubmit={handleCreateSubmit} className="bg-neutral-950 p-4 rounded-xl border border-emerald-500/40 space-y-3 animate-in fade-in">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Novo Perfil de Evento
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Nome do Evento *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Rock Arena Live 2026"
                    className="w-full bg-neutral-900 text-xs text-white px-3 py-2 rounded-lg border border-neutral-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">ID Único (slug)</label>
                  <input
                    type="text"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    placeholder="rock-arena-2026"
                    className="w-full bg-neutral-900 text-xs text-white px-3 py-2 rounded-lg border border-neutral-700 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Código do Evento</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="ROCK26-001"
                    className="w-full bg-neutral-900 text-xs text-white px-3 py-2 rounded-lg border border-neutral-700 focus:outline-none focus:border-emerald-500 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Local / Estádio</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Allianz Parque / São Paulo"
                    className="w-full bg-neutral-900 text-xs text-white px-3 py-2 rounded-lg border border-neutral-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Setores (separados por vírgula)</label>
                <input
                  type="text"
                  value={sectorsInput}
                  onChange={(e) => setSectorsInput(e.target.value)}
                  placeholder="Todos, Pista Premium, Pista Comum, Camarote"
                  className="w-full bg-neutral-900 text-xs text-white px-3 py-2 rounded-lg border border-neutral-700 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-neutral-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold uppercase tracking-wider"
                >
                  Salvar e Criar
                </button>
              </div>
            </form>
          )}

          {/* Events List */}
          <div className="space-y-2.5">
            {events.map((ev) => {
              const isActive = ev.id === activeEventId;

              return (
                <div
                  key={ev.id}
                  onClick={() => {
                    onSelectEvent(ev.id);
                    onClose();
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isActive
                      ? 'bg-neutral-850 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500'
                      : 'bg-neutral-950/70 hover:bg-neutral-900 border-neutral-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full shrink-0 ${
                        ev.status === 'online' ? 'bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500' : 'bg-neutral-600'
                      }`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{ev.name}</h3>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300">
                            {ev.code}
                          </span>
                          {isActive && (
                            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              ATIVO NO CONTROLE
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-neutral-400 flex items-center gap-2 mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-neutral-400" />
                            {ev.location}
                          </span>
                          <span className="text-neutral-600">•</span>
                          <span>{ev.producer}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Connected count badge */}
                      <div className="text-right">
                        <div className="text-sm font-bold font-mono text-emerald-400">
                          {ev.connectedDevices.toLocaleString('pt-BR')}
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono">dispositivos conectados</div>
                      </div>

                      <button
                        id={`btn-select-event-${ev.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent(ev.id);
                          onClose();
                        }}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                          isActive
                            ? 'bg-emerald-500 text-neutral-950'
                            : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white'
                        }`}
                      >
                        {isActive ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>CONECTADO</span>
                          </>
                        ) : (
                          <span>SELECIONAR</span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Security Key & Sectors footer */}
                  <div className="mt-3 pt-2.5 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-neutral-400">
                    <div className="flex items-center gap-1.5">
                      <Key className="w-3 h-3 text-amber-400" />
                      <span>Chave de Conexão:</span>
                      <code className="text-neutral-300 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">
                        {ev.connectionKey}
                      </code>
                    </div>
                    <div className="flex items-center gap-1">
                      <Layers className="w-3 h-3 text-neutral-400" />
                      <span>Setores:</span>
                      <span className="text-neutral-300">{ev.sectors.join(', ')}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
