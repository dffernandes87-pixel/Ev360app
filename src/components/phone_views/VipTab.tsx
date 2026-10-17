import React, { useState } from 'react';
import { 
  Crown, 
  Sparkles, 
  QrCode, 
  ShieldCheck, 
  Wine, 
  Video, 
  Award, 
  CheckCircle2, 
  Star,
  Zap,
  Lock
} from 'lucide-react';

export const VipTab: React.FC = () => {
  const [pulseVerified, setPulseVerified] = useState(false);
  const [showLiveBackstage, setShowLiveBackstage] = useState(false);

  const handleVerifyPulse = () => {
    setPulseVerified(true);
    setTimeout(() => {
      // stays verified
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto text-left space-y-3 p-3 text-white">
      {/* VIP Prominent Header Window */}
      <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 via-neutral-900 to-amber-950/30 border border-amber-500/40 shadow-xl space-y-2 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] uppercase font-mono tracking-widest text-amber-400 font-bold block">
                ACESSO RESTRITO
              </span>
              {/* User Prompt: "VIP aparecerá escrito conteúdo exclusivo numa outra janela" */}
              <h2 className="text-sm font-extrabold text-white tracking-wide flex items-center gap-1.5">
                <span>CONTEÚDO EXCLUSIVO</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              </h2>
            </div>
          </div>

          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-mono font-bold">
            PASSE VIP
          </span>
        </div>

        <p className="text-[10px] text-amber-200/80 leading-relaxed">
          Bem-vindo ao espaço reservado para convidados e portadores de ingressos VIP.
        </p>
      </div>

      {/* Holographic VIP Digital Pass */}
      <div className="p-3.5 rounded-2xl bg-neutral-900/90 border border-amber-500/30 relative overflow-hidden shadow-md space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[9px] font-mono text-neutral-400">CREDENCIAL DIGITAL</div>
            <div className="text-xs font-bold text-white">VIP ALL-ACCESS • 2026</div>
          </div>
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
            <Star className="w-3.5 h-3.5 fill-current" />
          </div>
        </div>

        <div className="flex items-center gap-3 py-1">
          <div className="p-2 rounded-xl bg-white text-black flex items-center justify-center">
            <QrCode className="w-10 h-10" />
          </div>
          <div className="text-[10px] space-y-0.5">
            <div className="text-neutral-400 font-mono">ID: #VIP-9942-BR</div>
            <div className="text-white font-bold">Titular: Convidado Oficial</div>
            <div className="flex items-center gap-1 text-emerald-400 font-mono text-[9px]">
              <ShieldCheck className="w-3 h-3" />
              <span>Autenticação NFC Verificada</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleVerifyPulse}
          className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            pulseVerified
              ? 'bg-emerald-500 text-neutral-950 shadow-md'
              : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md'
          }`}
        >
          {pulseVerified ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Pulseira VIP Validada na Catraca!</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5" />
              <span>Aproximar Pulseira NFC VIP</span>
            </>
          )}
        </button>
      </div>

      {/* Backstage Live Stream Box */}
      <div className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
            <Video className="w-3.5 h-3.5 text-rose-400" />
            <span>Câmera Exclusiva do Backstage</span>
          </div>
          <span className="flex items-center gap-1 text-[9px] font-mono text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
            <span>AO VIVO</span>
          </span>
        </div>

        <div className="relative aspect-16/9 rounded-xl bg-black overflow-hidden border border-neutral-800 flex items-center justify-center group">
          <img
            src="https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=600&q=80"
            alt="Backstage feed"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-2">
            <div className="flex justify-between items-center text-[8px] font-mono text-neutral-300">
              <span>CAM 04 • PALCO PRINCIPAL</span>
              <span>1080p 60fps</span>
            </div>
            <div className="text-center">
              <span className="text-[10px] font-bold text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 inline-block">
                Artistas no camarim preparando entrada
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Exclusive VIP Perks */}
      <div className="space-y-1.5">
        <div className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 pl-1">
          Benefícios Inclusos no VIP
        </div>

        <div className="grid grid-cols-1 gap-1.5">
          <div className="p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 mt-0.5">
              <Wine className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Open Bar & Gastronomia Premium</div>
              <div className="text-[9.5px] text-neutral-400 mt-0.5">
                Bebidas importadas e estações dos chefs no Camarote Principal.
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 mt-0.5">
              <Award className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Meet & Greet com Artistas</div>
              <div className="text-[9.5px] text-neutral-400 mt-0.5">
                Acesso prioritário à sessão de fotos e autógrafos às 22:30.
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Entrada Express Sem Filas</div>
              <div className="text-[9.5px] text-neutral-400 mt-0.5">
                Portão VIP exclusivo com credenciamento imediato e ar-condicionado.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
