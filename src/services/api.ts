import { EventProfile, ShowState, ShowPreset, ShowScene, GalleryPhoto, AgendaShowItem } from '../types';
import { INITIAL_EVENTS, INITIAL_PRESETS, INITIAL_SCENES, INITIAL_GALLERY_PHOTOS, INITIAL_AGENDA_ITEMS } from '../mockData';

const LOCAL_STORAGE_KEY_EVENTS = 'modo_show_events_v1';
const LOCAL_STORAGE_KEY_CURRENT_EVENT = 'modo_show_active_event_id';
const LOCAL_STORAGE_KEY_PRESETS = 'modo_show_presets_v1';
const LOCAL_STORAGE_KEY_SCENES = 'modo_show_scenes_v1';
const LOCAL_STORAGE_KEY_GALLERY = 'modo_show_gallery_v1';
const LOCAL_STORAGE_KEY_AGENDA = 'modo_show_agenda_v1';

class ShowApiService {
  private events: EventProfile[] = [];
  private presets: ShowPreset[] = [];
  private scenes: ShowScene[] = [];
  private gallery: GalleryPhoto[] = [];
  private agenda: AgendaShowItem[] = [];
  private eventSource: EventSource | null = null;
  private stateListeners: Set<(state: ShowState) => void> = new Set();
  private deviceCountListeners: Set<(count: number) => void> = new Set();
  private galleryListeners: Set<(photos: GalleryPhoto[]) => void> = new Set();
  private isServerConnected: boolean = false;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const savedEvents = localStorage.getItem(LOCAL_STORAGE_KEY_EVENTS);
      const parsedEvents = savedEvents ? JSON.parse(savedEvents) : null;
      this.events = Array.isArray(parsedEvents) && parsedEvents.length > 0 ? parsedEvents : INITIAL_EVENTS;

      const savedPresets = localStorage.getItem(LOCAL_STORAGE_KEY_PRESETS);
      const parsedPresets = savedPresets ? JSON.parse(savedPresets) : null;
      this.presets = Array.isArray(parsedPresets) && parsedPresets.length > 0 ? parsedPresets : INITIAL_PRESETS;

      const savedScenes = localStorage.getItem(LOCAL_STORAGE_KEY_SCENES);
      const parsedScenes = savedScenes ? JSON.parse(savedScenes) : null;
      this.scenes = Array.isArray(parsedScenes) && parsedScenes.length > 0 ? parsedScenes : INITIAL_SCENES;

      const savedGallery = localStorage.getItem(LOCAL_STORAGE_KEY_GALLERY);
      const parsedGallery = savedGallery ? JSON.parse(savedGallery) : null;
      this.gallery = Array.isArray(parsedGallery) && parsedGallery.length > 0 ? parsedGallery : INITIAL_GALLERY_PHOTOS;

      const savedAgenda = localStorage.getItem(LOCAL_STORAGE_KEY_AGENDA);
      const parsedAgenda = savedAgenda ? JSON.parse(savedAgenda) : null;
      this.agenda = Array.isArray(parsedAgenda) && parsedAgenda.length > 0 ? parsedAgenda : INITIAL_AGENDA_ITEMS;
    } catch {
      this.events = INITIAL_EVENTS;
      this.presets = INITIAL_PRESETS;
      this.scenes = INITIAL_SCENES;
      this.gallery = INITIAL_GALLERY_PHOTOS;
      this.agenda = INITIAL_AGENDA_ITEMS;
    }

    if (!Array.isArray(this.events)) this.events = INITIAL_EVENTS;
    if (!Array.isArray(this.presets)) this.presets = INITIAL_PRESETS;
    if (!Array.isArray(this.scenes)) this.scenes = INITIAL_SCENES;
    if (!Array.isArray(this.gallery)) this.gallery = INITIAL_GALLERY_PHOTOS;
    if (!Array.isArray(this.agenda)) this.agenda = INITIAL_AGENDA_ITEMS;
  }

  private saveToStorage() {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_EVENTS, JSON.stringify(this.events));
      localStorage.setItem(LOCAL_STORAGE_KEY_PRESETS, JSON.stringify(this.presets));
      localStorage.setItem(LOCAL_STORAGE_KEY_SCENES, JSON.stringify(this.scenes));
      localStorage.setItem(LOCAL_STORAGE_KEY_GALLERY, JSON.stringify(this.gallery));
      localStorage.setItem(LOCAL_STORAGE_KEY_AGENDA, JSON.stringify(this.agenda));
    } catch {
      // Storage unavailable or quota exceeded
    }
  }

  public async getEvents(): Promise<EventProfile[]> {
    try {
      const res = await fetch('/api/events');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          this.events = data;
          this.saveToStorage();
          this.isServerConnected = true;
          return this.events;
        }
      }
    } catch {
      // Fallback to local
    }
    return this.events;
  }

  public getSavedActiveEventId(): string {
    return localStorage.getItem(LOCAL_STORAGE_KEY_CURRENT_EVENT) || this.events[0]?.id || 'phn-2026';
  }

  public setSavedActiveEventId(id: string) {
    localStorage.setItem(LOCAL_STORAGE_KEY_CURRENT_EVENT, id);
  }

  public async getEventById(eventId: string): Promise<EventProfile | null> {
    const local = this.events.find((e) => e.id === eventId);
    try {
      const res = await fetch(`/api/events/${eventId}`);
      if (res.ok) {
        const serverEvent = await res.json();
        this.isServerConnected = true;
        return serverEvent;
      }
    } catch {
      // Return local fallback
    }
    return local || null;
  }

  public async createEvent(newEvent: Omit<EventProfile, 'state'>): Promise<EventProfile> {
    const fullEvent: EventProfile = {
      ...newEvent,
      state: { ...this.events[0]?.state, updatedAt: Date.now() },
    };

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullEvent),
      });
      if (res.ok) {
        const data = await res.json();
        this.events.unshift(data);
        this.saveToStorage();
        return data;
      }
    } catch {
      // offline fallback
    }

    this.events.unshift(fullEvent);
    this.saveToStorage();
    return fullEvent;
  }

  public async updateShowState(eventId: string, partial: Partial<ShowState>): Promise<ShowState> {
    const event = this.events.find((e) => e.id === eventId);
    const updatedState: ShowState = {
      ...(event ? event.state : INITIAL_EVENTS[0].state),
      ...partial,
      updatedAt: Date.now(),
    };

    if (event) {
      event.state = updatedState;
      this.saveToStorage();
    }

    // Notify local subscribers immediately (zero latency UI)
    this.notifyStateListeners(updatedState);

    // Sync to backend server
    try {
      await fetch(`/api/events/${eventId}/state`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Connection-Key': event?.connectionKey || '',
        },
        body: JSON.stringify(updatedState),
      });
      this.isServerConnected = true;
    } catch {
      // offline mode
    }

    return updatedState;
  }

  public subscribeToEventStream(
    eventId: string,
    onState: (state: ShowState) => void,
    onDevices?: (count: number) => void
  ): () => void {
    this.stateListeners.add(onState);
    if (onDevices) this.deviceCountListeners.add(onDevices);

    // Initial trigger with current state
    const current = this.events.find((e) => e.id === eventId);
    if (current) {
      onState(current.state);
      if (onDevices) onDevices(current.connectedDevices);
    }

    // Close previous SSE if any
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    try {
      this.eventSource = new EventSource(`/api/events/${eventId}/stream`);

      this.eventSource.onopen = () => {
        this.isServerConnected = true;
      };

      this.eventSource.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.type === 'state_update' && payload.state) {
            this.notifyStateListeners(payload.state);
          }
          if (payload.type === 'device_count' && typeof payload.count === 'number') {
            this.notifyDeviceListeners(payload.count);
          }
          if (payload.type === 'gallery_update' && Array.isArray(payload.gallery)) {
            this.gallery = payload.gallery;
            this.saveToStorage();
            this.notifyGalleryListeners(this.gallery);
          }
          if (payload.type === 'init') {
            if (payload.state) this.notifyStateListeners(payload.state);
            if (typeof payload.devices === 'number') this.notifyDeviceListeners(payload.devices);
            if (Array.isArray(payload.gallery)) {
              this.gallery = payload.gallery;
              this.saveToStorage();
              this.notifyGalleryListeners(this.gallery);
            }
          }
        } catch {
          // ignore malformed SSE
        }
      };

      this.eventSource.onerror = () => {
        this.isServerConnected = false;
        // The browser will auto-reconnect EventSource automatically
      };
    } catch {
      this.isServerConnected = false;
    }

    return () => {
      this.stateListeners.delete(onState);
      if (onDevices) this.deviceCountListeners.delete(onDevices);
      if (this.stateListeners.size === 0 && this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
      }
    };
  }

  private notifyStateListeners(state: ShowState) {
    this.stateListeners.forEach((listener) => {
      try {
        listener(state);
      } catch (err) {
        console.error('Error in state listener:', err);
      }
    });
  }

  private notifyDeviceListeners(count: number) {
    this.deviceCountListeners.forEach((listener) => {
      try {
        listener(count);
      } catch (err) {
        console.error('Error in device count listener:', err);
      }
    });
  }

  public getPresets(): ShowPreset[] {
    if (!Array.isArray(this.presets)) {
      this.presets = [...INITIAL_PRESETS];
    }
    return this.presets;
  }

  public savePreset(preset: ShowPreset): ShowPreset[] {
    if (!Array.isArray(this.presets)) {
      this.presets = [...INITIAL_PRESETS];
    }
    const idx = this.presets.findIndex((p) => p.id === preset.id);
    if (idx >= 0) {
      this.presets[idx] = preset;
    } else {
      this.presets.push(preset);
    }
    this.saveToStorage();
    return [...this.presets];
  }

  public deletePreset(id: string): ShowPreset[] {
    this.presets = (this.presets || []).filter((p) => p && p.id !== id);
    this.saveToStorage();
    return [...this.presets];
  }

  public getScenes(): ShowScene[] {
    if (!Array.isArray(this.scenes)) {
      this.scenes = [...INITIAL_SCENES];
    }
    return this.scenes;
  }

  public saveScene(scene: ShowScene): ShowScene[] {
    const idx = this.scenes.findIndex((s) => s.id === scene.id);
    if (idx >= 0) {
      this.scenes[idx] = scene;
    } else {
      this.scenes.push(scene);
    }
    this.saveToStorage();
    return [...this.scenes];
  }

  private notifyGalleryListeners(photos: GalleryPhoto[]) {
    const safe = Array.isArray(photos) ? photos : (Array.isArray(this.gallery) ? this.gallery : INITIAL_GALLERY_PHOTOS);
    for (const listener of this.galleryListeners) {
      try {
        listener([...safe]);
      } catch {
        // ignore subscriber errors
      }
    }
  }

  public subscribeToGallery(callback: (photos: GalleryPhoto[]) => void): () => void {
    this.galleryListeners.add(callback);
    const safe = Array.isArray(this.gallery) ? this.gallery : INITIAL_GALLERY_PHOTOS;
    try {
      callback([...safe]);
    } catch {
      // ignore initial callback error
    }
    return () => {
      this.galleryListeners.delete(callback);
    };
  }

  public getGallery(year?: '2026' | '2025'): GalleryPhoto[] {
    if (!Array.isArray(this.gallery)) {
      this.gallery = [...INITIAL_GALLERY_PHOTOS];
    }
    if (year) {
      return (this.gallery || []).filter((p) => p && p.year === year);
    }
    return [...(this.gallery || [])];
  }

  public async addGalleryPhoto(eventId: string, photoData: Omit<GalleryPhoto, 'id' | 'timestamp'>): Promise<GalleryPhoto> {
    if (!Array.isArray(this.gallery)) {
      this.gallery = [...INITIAL_GALLERY_PHOTOS];
    }

    const newPhoto: GalleryPhoto = {
      ...photoData,
      id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: photoData.year === '2026' ? 'Hoje, ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Edição 2025',
    };

    this.gallery.unshift(newPhoto);
    this.saveToStorage();
    this.notifyGalleryListeners(this.gallery);

    // Sync with server if available
    try {
      await fetch(`/api/events/${eventId}/gallery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPhoto),
      });
    } catch {
      // Offline local sync
    }

    return newPhoto;
  }

  public async deleteGalleryPhoto(eventId: string, photoId: string): Promise<GalleryPhoto[]> {
    if (!Array.isArray(this.gallery)) {
      this.gallery = [...INITIAL_GALLERY_PHOTOS];
    }
    this.gallery = (this.gallery || []).filter((p) => p && p.id !== photoId);
    this.saveToStorage();
    this.notifyGalleryListeners(this.gallery);

    try {
      await fetch(`/api/events/${eventId}/gallery/${photoId}`, {
        method: 'DELETE',
      });
    } catch {
      // Offline local sync
    }

    return [...(this.gallery || [])];
  }

  public getAgenda(): AgendaShowItem[] {
    if (!Array.isArray(this.agenda)) {
      this.agenda = [...INITIAL_AGENDA_ITEMS];
    }
    return [...(this.agenda || [])];
  }

  public updateAgendaItemStatus(itemId: string, status: 'completed' | 'live' | 'upcoming'): AgendaShowItem[] {
    const item = this.agenda.find((i) => i.id === itemId);
    if (item) {
      item.status = status;
      this.saveToStorage();
    }
    return [...this.agenda];
  }

  // Device Simulator Heartbeat ping to server
  public async sendDeviceHeartbeat(eventId: string, deviceId: string, sector: string = 'Pista'): Promise<void> {
    try {
      await fetch(`/api/events/${eventId}/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, sector, timestamp: Date.now() }),
      });
    } catch {
      // local simulator only
    }
  }

  public isConnected(): boolean {
    return this.isServerConnected;
  }
}

export const showApi = new ShowApiService();
