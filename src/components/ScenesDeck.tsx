import React, { useState } from 'react';
import { Clapperboard, SkipForward, SkipBack, Play, Check, Clock, ChevronRight } from 'lucide-react';
import { ShowScene, ShowState } from '../types';

interface ScenesDeckProps {
  scenes: ShowScene[];
  activeState: ShowState;
  onApplyScene: (scene: ShowScene) => void;
}

export const ScenesDeck: React.FC<ScenesDeckProps> = ({
  scenes,
  activeState,
  onApplyScene,
}) => {
  const [activeSceneId, setActiveSceneId] = useState<string>(scenes[0]?.id || '');

  const activeIndex = scenes.findIndex((s) => s.id === activeSceneId);

  const handleGoNext = () => {
    if (activeIndex < scenes.length - 1) {
      const nextScene = scenes[activeIndex + 1];
      setActiveSceneId(nextScene.id);
      onApplyScene(nextScene);
    }
  };

  const handleGoPrev = () => {
    if (activeIndex > 0) {
      const prevScene = scenes[activeIndex - 1];
      setActiveSceneId(prevScene.id);
      onApplyScene(prevScene);
    }
  };

  const handleTriggerScene = (scene: ShowScene) => {
    setActiveSceneId(scene.id);
    onApplyScene(scene);
  };

  return (
    <div className="bg-neutral-900/80 border border-neutral-800/90 rounded-2xl p-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Clapperboard className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">Roteiro de Cenas do Show</h2>
            <p className="text-xs text-neutral-400">Sequência programada de momentos visuais do espetáculo</p>
          </div>
        </div>

        {/* CUE CONTROL: PREV / NEXT (MESA DE LUZ) */}
        <div className="flex items-center gap-2">
          <button
            id="btn-scene-prev"
            disabled={activeIndex <= 0}
            onClick={handleGoPrev}
            className="px-3 py-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 disabled:opacity-30 border border-neutral-800 text-xs font-bold font-mono text-neutral-300 flex items-center gap-1.5 transition-all"
            title="Voltar cena anterior"
          >
            <SkipBack className="w-3.5 h-3.5" />
            <span>PREV</span>
          </button>

          <button
            id="btn-scene-next"
            disabled={activeIndex >= scenes.length - 1}
            onClick={handleGoNext}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all active:scale-95"
            title="Avançar para a próxima cena (CUE NEXT)"
          >
            <span>GO NEXT CENA</span>
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sequential Scenes Cue List */}
      <div className="space-y-2">
        {scenes.map((scene, index) => {
          const isActive = scene.id === activeSceneId;
          const config = scene.config;

          return (
            <div
              key={scene.id}
              onClick={() => handleTriggerScene(scene)}
              className={`p-3.5 rounded-xl border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 cursor-pointer transition-all ${
                isActive
                  ? 'bg-neutral-850 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/50'
                  : 'bg-neutral-950/70 hover:bg-neutral-900 border-neutral-800/80'
              }`}
            >
              {/* Scene Number & Name */}
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                  isActive ? 'bg-indigo-600 text-white shadow-xs' : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                }`}>
                  0{scene.number}
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>{scene.name}</span>
                    {isActive && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        AO VIVO NO PALCO
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-2">
                    <span>{scene.stageMoment}</span>
                    {scene.durationSeconds && (
                      <>
                        <span className="text-neutral-600">•</span>
                        <span className="flex items-center gap-1 font-mono text-[10px]">
                          <Clock className="w-3 h-3 text-neutral-400" />
                          ~{Math.round(scene.durationSeconds / 60)} min
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Scene Configuration Snapshot Badges */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 font-mono text-[10px]">
                  {config.color && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: config.color }} />
                      <span className="text-neutral-300">{config.color}</span>
                    </div>
                  )}
                  {config.effect && (
                    <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 uppercase">
                      {config.effect}
                    </span>
                  )}
                  {config.image?.enabled && (
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                      {config.image.name || 'Logo'}
                    </span>
                  )}
                </div>

                <button
                  id={`btn-trigger-scene-${scene.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTriggerScene(scene);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase font-mono tracking-wider flex items-center gap-1.5 transition-all shrink-0 ${
                    isActive
                      ? 'bg-indigo-500 text-white'
                      : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800'
                  }`}
                >
                  {isActive ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>CENA ATIVA</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>DISPARAR</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
