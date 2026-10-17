import React, { useState } from 'react';
import { Bookmark, Play, Plus, Trash2, Check, Sparkles, Sliders } from 'lucide-react';
import { ShowPreset, ShowState } from '../types';

interface PresetsDeckProps {
  presets: ShowPreset[];
  activeState: ShowState;
  onApplyPreset: (preset: ShowPreset) => void;
  onSaveCurrentAsPreset: (name: string, description: string) => void;
  onDeletePreset: (id: string) => void;
}

export const PresetsDeck: React.FC<PresetsDeckProps> = ({
  presets,
  activeState,
  onApplyPreset,
  onSaveCurrentAsPreset,
  onDeletePreset,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDesc, setNewPresetDesc] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;
    onSaveCurrentAsPreset(newPresetName.trim(), newPresetDesc.trim() || 'Preset customizado do operador');
    setNewPresetName('');
    setNewPresetDesc('');
    setIsCreating(false);
  };

  return (
    <div className="bg-neutral-900/80 border border-neutral-800/90 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Bookmark className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">Presets Rápidos (1-Click)</h2>
            <p className="text-xs text-neutral-400">Disparo instantâneo de configurações prontas durante o show</p>
          </div>
        </div>

        <button
          id="btn-new-preset-toggle"
          onClick={() => setIsCreating(!isCreating)}
          className="px-3 py-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-neutral-200 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-amber-400" />
          <span>Salvar Estado Atual</span>
        </button>
      </div>

      {/* Modal / Inline form to save current state as a preset */}
      {isCreating && (
        <form onSubmit={handleCreate} className="bg-neutral-950 p-4 rounded-xl border border-amber-500/30 mb-4 animate-in fade-in">
          <div className="text-xs font-bold uppercase tracking-wide text-amber-300 mb-2">
            Salvar Mesa Atual Como Preset
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              required
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              placeholder="Ex: PRESET 07 — SOLO GUITARRA"
              className="bg-neutral-900 text-xs text-white px-3 py-2 rounded-lg border border-neutral-700 focus:outline-none focus:border-amber-500"
            />
            <input
              type="text"
              value={newPresetDesc}
              onChange={(e) => setNewPresetDesc(e.target.value)}
              placeholder="Descrição ou momento do show..."
              className="bg-neutral-900 text-xs text-white px-3 py-2 rounded-lg border border-neutral-700 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3 py-1.5 rounded-lg text-xs text-neutral-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold uppercase tracking-wider"
            >
              Salvar Preset
            </button>
          </div>
        </form>
      )}

      {/* Presets Grid with Large Operator-Friendly Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {presets.map((preset) => {
          const isCurrentActive = 
            activeState.color.toUpperCase() === preset.color.toUpperCase() &&
            activeState.effect === preset.effect &&
            activeState.intensity === preset.intensity;

          return (
            <div
              key={preset.id}
              className={`group relative rounded-xl border p-4 transition-all ${
                isCurrentActive
                  ? 'bg-neutral-850 border-amber-500/80 shadow-md shadow-amber-500/10'
                  : 'bg-neutral-950/80 hover:bg-neutral-850/80 border-neutral-800/90'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border border-white/20 shadow-xs shrink-0"
                    style={{
                      background: preset.colorMode === 'gradient' && preset.gradientEndColor
                        ? `linear-gradient(135deg, ${preset.color}, ${preset.gradientEndColor})`
                        : preset.color,
                    }}
                  />
                  <h3 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors uppercase tracking-wider">
                    {preset.name}
                  </h3>
                </div>
                {presets.length > 3 && (
                  <button
                    onClick={() => onDeletePreset(preset.id)}
                    className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-rose-400 p-1 transition-opacity"
                    title="Excluir preset"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>

              <p className="text-[11px] text-neutral-400 line-clamp-2 mb-3 h-8">
                {preset.description}
              </p>

              {/* Preset Parameters Tags */}
              <div className="flex items-center flex-wrap gap-1.5 text-[10px] font-mono text-neutral-400 mb-3">
                <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 uppercase">
                  {preset.effect}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
                  Int: {preset.intensity}%
                </span>
                <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
                  Brilho: {preset.brightness}%
                </span>
                {preset.image?.enabled && (
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Com Logo
                  </span>
                )}
              </div>

              {/* Big Trigger Button */}
              <button
                id={`btn-apply-preset-${preset.id}`}
                onClick={() => onApplyPreset(preset)}
                className={`w-full py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-98 ${
                  isCurrentActive
                    ? 'bg-amber-500 text-neutral-950 shadow-sm shadow-amber-500/30'
                    : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-750'
                }`}
              >
                {isCurrentActive ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>EM EXECUÇÃO</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>DISPARAR PRESET</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
