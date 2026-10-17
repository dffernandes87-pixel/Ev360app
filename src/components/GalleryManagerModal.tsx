import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Check, 
  Trash2, 
  Plus, 
  Sparkles, 
  Camera, 
  Tag, 
  Calendar,
  ExternalLink,
  Radio
} from 'lucide-react';
import { GalleryPhoto } from '../types';
import { showApi } from '../services/api';

export interface GalleryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos?: GalleryPhoto[];
  onAddPhoto?: (photo: Omit<GalleryPhoto, 'id' | 'timestamp'>) => void;
  onDeletePhoto?: (id: string) => void;
  eventName?: string;
  eventId?: string;
}

export const GalleryManagerModal: React.FC<GalleryManagerModalProps> = ({
  isOpen,
  onClose,
  photos: propPhotos,
  onAddPhoto,
  onDeletePhoto,
  eventName = 'PHN 2026',
  eventId = 'phn-2026',
}) => {
  const [localPhotos, setLocalPhotos] = useState<GalleryPhoto[]>(() => {
    if (Array.isArray(propPhotos)) return propPhotos;
    const g = showApi.getGallery();
    return Array.isArray(g) ? g : [];
  });
  const [activeTab, setActiveTab] = useState<'2026' | '2025'>('2026');
  const [showAddForm, setShowAddForm] = useState(false);

  // Sync prop changes if provided
  useEffect(() => {
    if (Array.isArray(propPhotos)) {
      setLocalPhotos(propPhotos);
    }
  }, [propPhotos]);

  // Subscribe to live gallery updates from showApi
  useEffect(() => {
    if (!isOpen) return;
    const unsub = showApi.subscribeToGallery((updated) => {
      if (Array.isArray(updated)) {
        setLocalPhotos(updated);
      }
    });
    return () => unsub();
  }, [isOpen]);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newYear, setNewYear] = useState<'2026' | '2025'>('2026');
  const [newCaption, setNewCaption] = useState('');
  const [newPhotographer, setNewPhotographer] = useState('');
  const [newSector, setNewSector] = useState('Pista Central');
  const [uploadError, setUploadError] = useState('');

  if (!isOpen) return null;

  const safePhotos = Array.isArray(propPhotos) ? propPhotos : (Array.isArray(localPhotos) ? localPhotos : []);
  const filteredPhotos = safePhotos.filter((p) => p && p.year === activeTab);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Tamanho máximo da foto: 5MB');
      return;
    }

    setUploadError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setNewUrl(dataUrl);
      if (!newTitle) {
        setNewTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitNewPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim() || !newTitle.trim()) {
      setUploadError('Informe o título e a imagem');
      return;
    }

    const payload = {
      year: newYear,
      title: newTitle.trim(),
      url: newUrl.trim(),
      caption: newCaption.trim() || undefined,
      photographer: newPhotographer.trim() || 'Equipe de Mídia Oficial',
      sector: newSector,
    };

    if (onAddPhoto) {
      onAddPhoto(payload);
    } else {
      showApi.addGalleryPhoto(eventId, payload);
    }

    // Reset form
    setNewTitle('');
    setNewUrl('');
    setNewCaption('');
    setNewPhotographer('');
    setUploadError('');
    setShowAddForm(false);
    setActiveTab(newYear);
  };

  const handleDeletePhoto = (photoId: string) => {
    if (onDeletePhoto) {
      onDeletePhoto(photoId);
    } else {
      showApi.deleteGalleryPhoto(eventId, photoId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-925">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Gerenciador de Galeria Oficial</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-purple-300 border border-purple-500/30">
                  {eventName}
                </span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Atualização em tempo real das fotos exibidas no aplicativo oficial dos participantes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Year Tabs & Quick Action Bar */}
        <div className="p-4 border-b border-neutral-800 bg-neutral-900/90 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
            <button
              onClick={() => setActiveTab('2026')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === '2026'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Galeria 2026 (Atual)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono">
                {safePhotos.filter((p) => p && p.year === '2026').length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('2025')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === '2025'
                  ? 'bg-neutral-800 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              <span>Galeria 2025 (Histórica)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono">
                {safePhotos.filter((p) => p && p.year === '2025').length}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>Sincronização Ao Vivo Ativa</span>
            </div>

            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setNewYear(activeTab);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Foto para {activeTab}</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Collapsible Add Photo Form */}
          {showAddForm && (
            <form 
              onSubmit={handleSubmitNewPhoto} 
              className="p-4 rounded-xl bg-neutral-950/80 border border-purple-500/30 space-y-4 animate-fadeIn"
            >
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-purple-400" />
                  <span>Publicar Foto na Galeria {newYear}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-neutral-400 hover:text-white"
                >
                  Cancelar
                </button>
              </div>

              {uploadError && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {uploadError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column: Image Upload & Preview */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                      Destino da Foto (Ano)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setNewYear('2026')}
                        className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                          newYear === '2026'
                            ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                        }`}
                      >
                        Galeria 2026 (Atual)
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewYear('2025')}
                        className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                          newYear === '2025'
                            ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                        }`}
                      >
                        Galeria 2025 (Histórico)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                      Arquivo de Imagem ou URL
                    </label>
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-700 hover:border-purple-500 rounded-xl p-3 cursor-pointer bg-neutral-900/50 hover:bg-neutral-900 transition-colors text-center">
                      <Upload className="w-5 h-5 text-neutral-400 mb-1" />
                      <span className="text-xs text-neutral-200 font-medium">Clique para escolher foto local</span>
                      <span className="text-[10px] text-neutral-400">JPG, PNG ou WebP até 5MB</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileUpload} 
                        className="hidden" 
                      />
                    </label>
                  </div>

                  <div>
                    <span className="text-[10px] text-neutral-400 block mb-1">Ou cole uma URL direta da foto:</span>
                    <input
                      type="url"
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      placeholder="https://exemplo.com/foto.jpg"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Right Column: Photo Details */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                      Título da Foto *
                    </label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Ex: Pirotecnia no Palco Principal"
                      required
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                        Fotógrafo / Crédito
                      </label>
                      <input
                        type="text"
                        value={newPhotographer}
                        onChange={(e) => setNewPhotographer(e.target.value)}
                        placeholder="Ex: Mídia Oficial"
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                        Setor do Evento
                      </label>
                      <select
                        value={newSector}
                        onChange={(e) => setNewSector(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="Pista Central">Pista Central</option>
                        <option value="Camarote VIP">Camarote VIP</option>
                        <option value="Arquibancada">Arquibancada</option>
                        <option value="Palco Principal">Palco Principal</option>
                        <option value="Área Sunset">Área Sunset</option>
                        <option value="Geral">Geral</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-neutral-400 uppercase mb-1">
                      Legenda / Descrição Curta
                    </label>
                    <textarea
                      value={newCaption}
                      onChange={(e) => setNewCaption(e.target.value)}
                      placeholder="Ex: Momento emocionante gravado durante o refrão com ativação do Modo Show."
                      rows={2}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  {newUrl && (
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                      <img src={newUrl} alt="Preview" className="w-12 h-12 object-cover rounded-md" />
                      <div className="text-[11px] text-neutral-300">
                        <span className="font-bold text-white block">Pré-visualização Pronta</span>
                        <span className="text-neutral-400">Aparecerá imediatamente para o público</span>
                      </div>
                    </div>
                  )}

                  <div className="pt-1 flex justify-end gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Publicar Foto na Galeria {newYear}</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* Photos Grid */}
          {filteredPhotos.length === 0 ? (
            <div className="text-center py-12 bg-neutral-950/40 rounded-xl border border-neutral-800 text-neutral-400 space-y-2">
              <ImageIcon className="w-8 h-8 mx-auto text-neutral-600" />
              <div className="text-sm font-medium text-neutral-300">Nenhuma foto na Galeria {activeTab} ainda</div>
              <p className="text-xs text-neutral-500">Clique em "Adicionar Foto" para publicar a primeira imagem desta edição.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPhotos.map((photo) => (
                <div 
                  key={photo.id}
                  className="group rounded-xl bg-neutral-950 border border-neutral-800 overflow-hidden hover:border-neutral-700 transition-all flex flex-col justify-between"
                >
                  <div className="relative h-44 bg-neutral-900 overflow-hidden">
                    <img 
                      src={photo.url} 
                      alt={photo.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-mono text-white font-bold border border-white/20">
                        {photo.year}
                      </span>
                      {photo.sector && (
                        <span className="px-2 py-0.5 rounded-md bg-purple-600/80 backdrop-blur-md text-[10px] font-medium text-white">
                          {photo.sector}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-rose-600 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      title="Excluir foto da galeria"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                        {photo.title}
                      </h4>
                      {photo.caption && (
                        <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                          {photo.caption}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-neutral-900 flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                      <span>{photo.photographer || 'Mídia'}</span>
                      <span>{photo.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-neutral-800 bg-neutral-925 flex items-center justify-between text-xs text-neutral-400">
          <div>
            Total: <strong className="text-white">{safePhotos.length}</strong> fotos armazenadas no evento
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs cursor-pointer transition-colors"
          >
            Fechar Gerenciador
          </button>
        </div>
      </div>
    </div>
  );
};
