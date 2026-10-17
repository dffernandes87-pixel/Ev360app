import React, { useState } from 'react';
import { 
  Map, 
  MapPin, 
  Navigation, 
  Compass, 
  ShieldAlert, 
  Coffee, 
  Sparkles, 
  Layers, 
  Maximize2,
  AlertCircle
} from 'lucide-react';

export const MapTab: React.FC = () => {
  const [selectedPoint, setSelectedPoint] = useState<string>('palco-principal');

  const points = [
    {
      id: 'palco-principal',
      name: 'Palco Principal',
      type: 'Palco',
      badge: 'Modo Show Ativo',
      color: 'border-rose-500 text-rose-300 bg-rose-500/10',
      description: 'Estrutura principal com iluminação sincronizada pelo console DMX.',
    },
    {
      id: 'camarote-vip',
      name: 'Camarote VIP & Lounge',
      type: 'VIP',
      badge: 'Acesso Restrito',
      color: 'border-amber-500 text-amber-300 bg-amber-500/10',
      description: 'Área com open bar, visão panorâmica e ar-condicionado.',
    },
    {
      id: 'praca-alimentacao',
      name: 'Praça de Alimentação',
      type: 'Serviço',
      badge: 'Aberto',
      color: 'border-blue-500 text-blue-300 bg-blue-500/10',
      description: 'Mais de 20 opções gastronômicas, food trucks e pontos de hidratação.',
    },
    {
      id: 'posto-medico',
      name: 'Posto Médico & Brigada',
      type: 'Emergência',
      badge: '24 Horas',
      color: 'border-emerald-500 text-emerald-300 bg-emerald-500/10',
      description: 'Equipe de socorristas e ambulâncias UTI posicionadas junto ao Portão 2.',
    },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-y-auto text-left space-y-3 p-3 text-white">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-neutral-800">
        <div>
          <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
            <Map className="w-3.5 h-3.5 text-cyan-400" />
            <span>Mapa da Arena</span>
          </h3>
          <p className="text-[10px] text-neutral-400">Localização e pontos de interesse</p>
        </div>

        <div className="flex items-center gap-1 text-[9px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
          <Navigation className="w-2.5 h-2.5 animate-spin" />
          <span>GPS Ativo</span>
        </div>
      </div>

      {/* User prompt requirement: "No mapa, haverá uma caixa onde em breve adicionaremos o mapa do evento." */}
      <div className="p-4 rounded-2xl bg-neutral-900/90 border-2 border-dashed border-cyan-500/40 relative overflow-hidden shadow-xl flex flex-col items-center justify-center text-center space-y-3 min-h-[190px]">
        {/* Decorative Grid Blueprint Background */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#06b6d4 1px, transparent 1px), radial-gradient(#06b6d4 1px, #000 1px)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 10px 10px',
          }}
        />

        <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/20 relative z-10 animate-pulse">
          <Compass className="w-6 h-6" />
        </div>

        {/* Primary requested text */}
        <div className="relative z-10 space-y-1">
          <div className="text-[9px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
            [ CAIXA DO MAPA DO EVENTO ]
          </div>
          <h4 className="text-xs font-bold text-white max-w-[220px]">
            Em breve adicionaremos o mapa do evento
          </h4>
          <p className="text-[9.5px] text-neutral-400 max-w-[230px] leading-relaxed">
            A planta técnica interativa com geolocalização e rotas em tempo real está sendo carregada pela organização.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-1.5 px-2 py-0.8 rounded-full bg-black/60 border border-cyan-500/30 text-[9px] font-mono text-cyan-300">
          <AlertCircle className="w-3 h-3" />
          <span>Versão 1.0 • Integração em andamento</span>
        </div>
      </div>

      {/* Sector Guides below the box */}
      <div className="space-y-1.5">
        <div className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 pl-1 flex items-center justify-between">
          <span>Setores e Pontos de Apoio</span>
          <span className="text-[9px] text-cyan-400 font-mono">4 Principais</span>
        </div>

        <div className="grid grid-cols-1 gap-1.5">
          {points.map((pt) => {
            const isSelected = selectedPoint === pt.id;
            return (
              <div
                key={pt.id}
                onClick={() => setSelectedPoint(pt.id)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer text-left ${
                  isSelected
                    ? 'bg-neutral-900 border-cyan-500/60 ring-1 ring-cyan-500/40 shadow-sm'
                    : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className={`w-3 h-3 ${isSelected ? 'text-cyan-400' : 'text-neutral-400'}`} />
                    <span className="text-xs font-bold text-white">{pt.name}</span>
                  </div>
                  <span className={`text-[8.5px] font-mono px-1.5 py-0.2 rounded border ${pt.color}`}>
                    {pt.badge}
                  </span>
                </div>
                <p className="text-[9.5px] text-neutral-400 leading-relaxed">
                  {pt.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* GPS Status Card */}
      <div className="p-2 rounded-xl bg-neutral-900/40 border border-neutral-850 flex items-center justify-between text-[9px] font-mono text-neutral-400">
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Sua posição estimada: Pista Central</span>
        </div>
        <span className="text-neutral-500">Precisão: ±3m</span>
      </div>
    </div>
  );
};
