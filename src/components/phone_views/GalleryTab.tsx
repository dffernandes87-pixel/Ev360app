import React, { useState, useEffect } from 'react';
import { 
  Image as GalleryIcon, 
  Sparkles, 
  Calendar, 
  X, 
  Maximize2, 
  Camera, 
  Radio, 
  Heart,
  Share2
} from 'lucide-react';
import { GalleryPhoto } from '../../types';
import { showApi } from '../../services/api';

export const GalleryTab: React.FC = () => {
  const [photos, setPhotos] = useState<GalleryPhoto[]>(() => {
    const p = showApi.getGallery();
    return Array.isArray(p) ? p : [];
  });
  const [selectedYear, setSelectedYear] = useState<'2026' | '2025'>('2026');
  const [activePhoto, setActivePhoto] = useState<GalleryPhoto | null>(null);
  const [likedPhotos, setLikedPhotos] = useState<Set<string>>(new Set());

  // Subscribe to live gallery updates (e.g. when added from the dashboard!)
  useEffect(() => {
    const unsub = showApi.subscribeToGallery((updated) => {
      if (Array.isArray(updated)) {
        setPhotos(updated);
      }
    });
    return () => unsub();
  }, []);

  const safePhotos = Array.isArray(photos) ? photos : [];
  const filteredPhotos = safePhotos.filter((p) => p && p.year === selectedYear);

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedPhotos((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto text-left space-y-3 p-3 text-white">
      {/* Title & Sync Status */}
      <div className="flex items-center justify-between pb-1 border-b border-neutral-800">
        <div>
          <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
            <GalleryIcon className="w-3.5 h-3.5 text-purple-400" />
            <span>Galeria do Evento</span>
          </h3>
          <p className="text-[10px] text-neutral-400">Fotos oficiais e momentos da arena</p>
        </div>

        <div className="flex items-center gap-1 text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
          <Radio className="w-2.5 h-2.5 animate-pulse" />
          <span>Ao Vivo</span>
        </div>
      </div>

      {/* Year Tabs: Galeria 2026 e Galeria 2025 (User prompt requirement) */}
      <div className="grid grid-cols-2 gap-1.5 bg-neutral-900/90 p-1 rounded-xl border border-neutral-800 text-xs">
        <button
          onClick={() => setSelectedYear('2026')}
          className={`py-1.5 px-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            selectedYear === '2026'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3 h-3 text-amber-300" />
          <span>Galeria 2026</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono">
            {safePhotos.filter((p) => p && p.year === '2026').length}
          </span>
        </button>

        <button
          onClick={() => setSelectedYear('2025')}
          className={`py-1.5 px-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            selectedYear === '2025'
              ? 'bg-neutral-800 text-white shadow-md'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Calendar className="w-3 h-3 text-neutral-400" />
          <span>Galeria 2025</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono">
            {safePhotos.filter((p) => p && p.year === '2025').length}
          </span>
        </button>
      </div>

      {/* Info notice */}
      <div className="text-[9.5px] text-neutral-400 bg-neutral-900/60 p-2 rounded-xl border border-neutral-800/80 flex items-center justify-between">
        <span>
          {selectedYear === '2026' 
            ? '🔥 Fotos publicadas em tempo real pela produção' 
            : '✨ Momentos históricos e destaques da edição 2025'}
        </span>
        <span className="font-mono text-purple-300 font-bold">{selectedYear}</span>
      </div>

      {/* Photo Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="text-center py-8 text-neutral-500 text-xs space-y-1">
          <Camera className="w-6 h-6 mx-auto opacity-50" />
          <p>Nenhuma foto na Galeria {selectedYear}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {filteredPhotos.map((photo) => {
            const isLiked = likedPhotos.has(photo.id);
            return (
              <div
                key={photo.id}
                onClick={() => setActivePhoto(photo)}
                className="group relative rounded-xl bg-neutral-900 border border-neutral-800 overflow-hidden cursor-pointer hover:border-purple-500/50 transition-all shadow-sm flex flex-col"
              >
                <div className="relative aspect-4/3 overflow-hidden bg-neutral-950">
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                  {/* Sector Badge */}
                  {photo.sector && (
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md text-[8px] font-mono text-white">
                      {photo.sector}
                    </span>
                  )}

                  {/* Like Button */}
                  <button
                    onClick={(e) => toggleLike(photo.id, e)}
                    className={`absolute top-1.5 right-1.5 p-1 rounded-full backdrop-blur-md transition-all ${
                      isLiked ? 'bg-rose-500 text-white' : 'bg-black/50 text-white/80 hover:text-white'
                    }`}
                  >
                    <Heart className="w-2.5 h-2.5 fill-current" />
                  </button>
                </div>

                <div className="p-1.5 text-left">
                  <h4 className="text-[10px] font-bold text-white line-clamp-1 group-hover:text-purple-300">
                    {photo.title}
                  </h4>
                  <div className="text-[8px] text-neutral-400 font-mono mt-0.5">
                    {photo.timestamp}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Inside Phone Screen */}
      {activePhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 animate-fadeIn"
          onClick={() => setActivePhoto(null)}
        >
          {/* Lightbox Header */}
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <span className="px-1.5 py-0.5 rounded bg-purple-600 text-[9px] font-mono">
                {activePhoto.year}
              </span>
              <span className="line-clamp-1">{activePhoto.title}</span>
            </div>
            <button
              onClick={() => setActivePhoto(null)}
              className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Lightbox Image */}
          <div className="my-auto flex items-center justify-center max-h-[60vh] overflow-hidden rounded-xl bg-neutral-900">
            <img
              src={activePhoto.url}
              alt={activePhoto.title}
              className="w-full h-auto max-h-[60vh] object-contain rounded-xl"
            />
          </div>

          {/* Lightbox Details */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-2.5 space-y-1 text-left">
            <div className="text-xs font-bold text-white">{activePhoto.title}</div>
            {activePhoto.caption && (
              <p className="text-[10px] text-neutral-300 leading-relaxed">
                {activePhoto.caption}
              </p>
            )}
            <div className="flex items-center justify-between pt-1 border-t border-neutral-800 text-[9px] text-neutral-400 font-mono">
              <span>Créditos: {activePhoto.photographer || 'Mídia Oficial'}</span>
              <span>{activePhoto.timestamp}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
