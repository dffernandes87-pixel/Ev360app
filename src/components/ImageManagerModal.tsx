import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Check, 
  Sliders, 
  MoveVertical, 
  Sparkles, 
  Trash2,
  Maximize2
} from 'lucide-react';
import { ShowImageConfig, PresetLibraryImage, ImagePosition, ImageEffect } from '../types';
import { INITIAL_LIBRARY_IMAGES } from '../mockData';

interface ImageManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: ShowImageConfig;
  onUpdateImageConfig: (config: ShowImageConfig) => void;
}

export const ImageManagerModal: React.FC<ImageManagerModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onUpdateImageConfig,
}) => {
  const [library, setLibrary] = useState<PresetLibraryImage[]>(INITIAL_LIBRARY_IMAGES);
  const [selectedUrl, setSelectedUrl] = useState(currentConfig.url);
  const [selectedName, setSelectedName] = useState(currentConfig.name);
  const [scale, setScale] = useState(currentConfig.scale || 85);
  const [position, setPosition] = useState<ImagePosition>(currentConfig.position || 'center');
  const [effect, setEffect] = useState<ImageEffect>(currentConfig.effect || 'pulse');
  const [opacity, setOpacity] = useState(currentConfig.opacity || 90);
  const [uploadError, setUploadError] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Tamanho máximo permitido: 5MB');
      return;
    }

    setUploadError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const newImg: PresetLibraryImage = {
        id: `custom-${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ''),
        category: 'custom',
        url: dataUrl,
      };
      setLibrary((prev) => [newImg, ...prev]);
      setSelectedUrl(dataUrl);
      setSelectedName(newImg.name);
    };
    reader.readAsDataURL(file);
  };

  const handleApply = () => {
    onUpdateImageConfig({
      enabled: Boolean(selectedUrl),
      url: selectedUrl,
      name: selectedName,
      scale,
      position,
      effect,
      opacity,
    });
    onClose();
  };

  const handleRemoveImage = () => {
    onUpdateImageConfig({
      enabled: false,
      url: '',
      name: '',
      scale: 80,
      position: 'center',
      effect: 'none',
      opacity: 100,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-neutral-900 border border-neutral-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Gerenciador de Imagens & Logos do Modo Show
              </h2>
              <p className="text-xs text-neutral-400">
                Selecione ou envie o logo do evento, artista ou patrocinador para exibição nos smartphones
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

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          
          {/* Upload Box */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
              Fazer Upload de Nova Imagem / Logo (PNG transparente, JPG, SVG)
            </div>
            <label className="border-2 border-dashed border-neutral-700 hover:border-blue-500 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-neutral-950/60 hover:bg-neutral-950 transition-all">
              <Upload className="w-6 h-6 text-blue-400 mb-1.5" />
              <span className="text-xs font-semibold text-neutral-200">
                Clique ou arraste um arquivo de imagem
              </span>
              <span className="text-[10px] text-neutral-400 mt-0.5">
                PNG recomendado com fundo transparente (Até 5MB)
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            {uploadError && <p className="text-xs text-rose-400 mt-1">{uploadError}</p>}
          </div>

          {/* Library Grid */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
              Biblioteca do Evento & Logos Cadastrados
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {library.map((img) => {
                const isSelected = selectedUrl === img.url;
                return (
                  <div
                    key={img.id}
                    onClick={() => {
                      setSelectedUrl(img.url);
                      setSelectedName(img.name);
                    }}
                    className={`relative p-2.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-neutral-800 border-blue-500 shadow-md shadow-blue-500/20 ring-1 ring-blue-500'
                        : 'bg-neutral-950/80 hover:bg-neutral-850 border-neutral-800'
                    }`}
                  >
                    <div className="w-full h-24 rounded-lg bg-neutral-900 border border-neutral-800 overflow-hidden flex items-center justify-center p-2 mb-2">
                      <img
                        src={img.url}
                        alt={img.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-xs font-semibold text-white truncate">{img.name}</div>
                    <div className="text-[10px] font-mono text-neutral-400 uppercase">{img.category}</div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-Time Parameter Adjustments */}
          {selectedUrl && (
            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-neutral-200 border-b border-neutral-800 pb-2">
                Ajustes de Renderização no Smartphone
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Scale Slider */}
                <div>
                  <div className="flex justify-between text-xs text-neutral-300 mb-1">
                    <span>Escala / Tamanho do Logo:</span>
                    <span className="font-mono text-blue-400 font-bold">{scale}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="180"
                    value={scale}
                    onChange={(e) => setScale(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>

                {/* Opacity Slider */}
                <div>
                  <div className="flex justify-between text-xs text-neutral-300 mb-1">
                    <span>Opacidade / Transparência:</span>
                    <span className="font-mono text-blue-400 font-bold">{opacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Posicionamento */}
                <div>
                  <span className="text-xs text-neutral-300 block mb-1.5">Posicionamento na Tela:</span>
                  <div className="grid grid-cols-3 gap-2">
                    {(['top', 'center', 'bottom'] as ImagePosition[]).map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => setPosition(pos)}
                        className={`py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all ${
                          position === pos
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {pos === 'top' ? 'Topo' : pos === 'center' ? 'Centro' : 'Base'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Efeito da Imagem */}
                <div>
                  <span className="text-xs text-neutral-300 block mb-1.5">Efeito da Imagem:</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['none', 'pulse', 'rotate', 'bounce'] as ImageEffect[]).map((eff) => (
                      <button
                        key={eff}
                        type="button"
                        onClick={() => setEffect(eff)}
                        className={`py-1.5 px-1 rounded-lg text-[11px] font-semibold capitalize border transition-all truncate ${
                          effect === eff
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {eff === 'none' ? 'Estático' : eff === 'pulse' ? 'Pulso' : eff === 'rotate' ? 'Giro' : 'Flutuar'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <button
            onClick={handleRemoveImage}
            className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remover Imagem Ativa</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              id="btn-apply-image"
              onClick={handleApply}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-blue-600/30 transition-colors"
            >
              Aplicar Imagem ao Show
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
