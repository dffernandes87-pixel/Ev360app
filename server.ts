import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

// In-memory state storage for events
interface ShowState {
  isActive: boolean;
  color: string;
  colorMode: 'single' | 'gradient';
  gradientEndColor?: string;
  gradientAngle?: number;
  brightness: number;
  intensity: number;
  effect: string;
  effectSpeed: number;
  bpm: number;
  image: {
    enabled: boolean;
    url: string;
    name: string;
    scale: number;
    position: string;
    effect: string;
    opacity: number;
  };
  strobeActive: boolean;
  blackoutActive: boolean;
  message?: string;
  targetSector?: string;
  audioSyncEnabled: boolean;
  audioSensitivity: number;
  audioReactionMode: string;
  audioFftBand: string;
  updatedAt: number;
}

interface EventData {
  id: string;
  name: string;
  code: string;
  connectionKey: string;
  status: 'online' | 'offline' | 'standby';
  connectedDevices: number;
  peakDevices: number;
  location: string;
  producer: string;
  sectors: string[];
  state: ShowState;
}

const defaultState: ShowState = {
  isActive: true,
  color: '#3B82F6',
  colorMode: 'single',
  gradientEndColor: '#8B5CF6',
  gradientAngle: 135,
  brightness: 90,
  intensity: 85,
  effect: 'pulse',
  effectSpeed: 1.0,
  bpm: 124,
  image: {
    enabled: true,
    url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=80',
    name: 'Logo Oficial PHN 2026',
    scale: 85,
    position: 'center',
    effect: 'pulse',
    opacity: 95,
  },
  strobeActive: false,
  blackoutActive: false,
  message: '',
  targetSector: 'Todos',
  audioSyncEnabled: true,
  audioSensitivity: 75,
  audioReactionMode: 'flash_beat',
  audioFftBand: 'bass',
  updatedAt: Date.now(),
};

const eventsStore: Record<string, EventData> = {
  'phn-2026': {
    id: 'phn-2026',
    name: 'PHN 2026',
    code: 'PHN2026-001',
    connectionKey: 'KEY-PHN-2026-LIVE-889',
    status: 'online',
    connectedDevices: 1248,
    peakDevices: 1850,
    location: 'Centro de Evangelização / Cachoeira Paulista',
    producer: 'Produção Central PHN',
    sectors: ['Todos', 'Pista Central', 'Arquibancada Norte', 'Arquibancada Sul', 'Área VIP'],
    state: { ...defaultState },
  },
  'festival-verao-2026': {
    id: 'festival-verao-2026',
    name: 'Festival de Verão 2026',
    code: 'FV2026-LIVE-02',
    connectionKey: 'KEY-FV26-SUMMER-771',
    status: 'online',
    connectedDevices: 2350,
    peakDevices: 3100,
    location: 'Parque de Exposições / Salvador',
    producer: 'iContent Entretenimento',
    sectors: ['Todos', 'Arena', 'Camarote Open Bar', 'Golden Front'],
    state: {
      ...defaultState,
      color: '#EC4899',
      effect: 'rainbow',
      intensity: 95,
      brightness: 100,
    },
  },
  'arena-rock-2026': {
    id: 'arena-rock-2026',
    name: 'Arena Rock Experience',
    code: 'AROCK-2026-X',
    connectionKey: 'KEY-AROCK-STAGE-502',
    status: 'standby',
    connectedDevices: 845,
    peakDevices: 1200,
    location: 'Allianz Parque / São Paulo',
    producer: 'Mercury Concerts',
    sectors: ['Todos', 'Pista Premium', 'Pista Comum', 'Cadeira Superior'],
    state: {
      ...defaultState,
      color: '#EF4444',
      effect: 'flash',
      intensity: 90,
      brightness: 95,
    },
  },
  'expo-tech-2026': {
    id: 'expo-tech-2026',
    name: 'Expo Innovation Summit',
    code: 'EXPO-TECH-009',
    connectionKey: 'KEY-EXPOTECH-332',
    status: 'offline',
    connectedDevices: 0,
    peakDevices: 620,
    location: 'São Paulo Expo',
    producer: 'Global Tech Events',
    sectors: ['Todos', 'Auditório Principal', 'Palco Startups'],
    state: {
      ...defaultState,
      isActive: false,
      color: '#06B6D4',
      effect: 'fixed',
      intensity: 50,
      brightness: 50,
    },
  },
};

// SSE active clients keyed by eventId
const sseClients: Record<string, Set<Response>> = {};

function broadcastToEvent(eventId: string, data: object) {
  const clients = sseClients[eventId];
  if (!clients || clients.size === 0) return;
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const client of clients) {
    try {
      client.write(payload);
    } catch {
      clients.delete(client);
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(express.json({ limit: '15mb' }));

  // CORS headers for external mobile apps
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Connection-Key');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'Modo Show Central Controller',
      timestamp: Date.now(),
      eventsCount: Object.keys(eventsStore).length,
    });
  });

  // List all events
  app.get('/api/events', (_req, res) => {
    const list = Object.values(eventsStore);
    res.json(list);
  });

  // Create or register new event
  app.post('/api/events', (req, res) => {
    const body = req.body;
    if (!body.name || !body.id) {
      return res.status(400).json({ error: 'Event name and id are required' });
    }
    const newEvent: EventData = {
      id: body.id,
      name: body.name,
      code: body.code || `${body.id.toUpperCase()}-001`,
      connectionKey: body.connectionKey || `KEY-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      status: body.status || 'online',
      connectedDevices: body.connectedDevices || 0,
      peakDevices: body.peakDevices || 0,
      location: body.location || 'Local a definir',
      producer: body.producer || 'Produção Geral',
      sectors: body.sectors || ['Todos', 'Pista', 'VIP'],
      state: body.state || { ...defaultState },
    };
    eventsStore[newEvent.id] = newEvent;
    res.status(201).json(newEvent);
  });

  // Get specific event
  app.get('/api/events/:eventId', (req: Request, res: Response) => {
    const event = eventsStore[req.params.eventId];
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  });

  // Get show state for mobile app / polling
  app.get('/api/events/:eventId/state', (req: Request, res: Response) => {
    const event = eventsStore[req.params.eventId];
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({
      eventId: event.id,
      eventName: event.name,
      state: event.state,
      connectedDevices: event.connectedDevices,
      status: event.status,
    });
  });

  // Update show state (from Dashboard operator)
  app.post('/api/events/:eventId/state', (req: Request, res: Response) => {
    const { eventId } = req.params;
    const event = eventsStore[eventId];
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Update state
    event.state = {
      ...event.state,
      ...req.body,
      updatedAt: Date.now(),
    };

    // Broadcast instant update to all connected participant smartphones and operator viewers
    broadcastToEvent(eventId, {
      type: 'state_update',
      eventId,
      state: event.state,
    });

    res.json({
      success: true,
      state: event.state,
    });
  });

  // Heartbeat / Device connect ping from participant mobile apps
  app.post('/api/events/:eventId/heartbeat', (req: Request, res: Response) => {
    const { eventId } = req.params;
    const event = eventsStore[eventId];
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // increment / fluctuate realistically
    const delta = Math.floor(Math.random() * 3) - 1; // -1, 0, or +1
    event.connectedDevices = Math.max(1, event.connectedDevices + delta);
    if (event.connectedDevices > event.peakDevices) {
      event.peakDevices = event.connectedDevices;
    }

    broadcastToEvent(eventId, {
      type: 'device_count',
      eventId,
      count: event.connectedDevices,
    });

    res.json({ success: true, count: event.connectedDevices });
  });

  // In-memory gallery store per event
  const defaultGallery = [
    {
      id: 'gal-2026-01',
      year: '2026',
      title: 'Abertura Triunfal com Mar de Telas',
      url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
      caption: 'Primeiro momento de ativação coletiva na Arena Principal.',
      photographer: 'Lucas Mendes / Mídia Oficial',
      sector: 'Pista Central',
      timestamp: 'Hoje, 21:15',
    },
    {
      id: 'gal-2026-02',
      year: '2026',
      title: 'Show Pirotécnico e Pulso Vermelho',
      url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
      caption: 'Momento de clímax sonoro com flash sincronizado via Modo Show.',
      photographer: 'Ana Clara Lima',
      sector: 'Camarote VIP',
      timestamp: 'Hoje, 22:05',
    },
    {
      id: 'gal-2026-03',
      year: '2026',
      title: 'Visão Aérea da Arena Lotada',
      url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
      caption: 'Mais de 40 mil pessoas conectadas através do aplicativo.',
      photographer: 'Drone Oficial FPV',
      sector: 'Geral',
      timestamp: 'Hoje, 22:40',
    },
    {
      id: 'gal-2026-04',
      year: '2026',
      title: 'Refrão Iluminado com Luz Âmbar',
      url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
      caption: 'Efeito vela quente iluminando toda a arquibancada.',
      photographer: 'Rafael Costa',
      sector: 'Arquibancada Norte',
      timestamp: 'Hoje, 23:10',
    },
    {
      id: 'gal-2025-01',
      year: '2025',
      title: 'A Noite Mais Memorável de 2025',
      url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80',
      caption: 'O encerramento emocionante da edição 2025.',
      photographer: 'Arquivo PHN 2025',
      sector: 'Palco Principal',
      timestamp: '15 Julho 2025',
    },
    {
      id: 'gal-2025-02',
      year: '2025',
      title: 'Público Vibrando no Pôr do Sol',
      url: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=800&q=80',
      caption: 'Tarde inesquecível no Sunset Stage com energia contagiante.',
      photographer: 'Mariana Duarte',
      sector: 'Pista Sunset',
      timestamp: '14 Julho 2025',
    },
    {
      id: 'gal-2025-03',
      year: '2025',
      title: 'Show de Luzes e Laser 2025',
      url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
      caption: 'Produção visual premiada como destaque do festival.',
      photographer: 'Felipe Rocha',
      sector: 'Arena 2025',
      timestamp: '13 Julho 2025',
    },
  ];

  const eventGalleries: Record<string, any[]> = {
    'phn-2026': [...defaultGallery],
    'festival-verao-2026': [...defaultGallery],
  };

  // Gallery API endpoints (Allows Dashboard & Apps to sync 2026 and 2025 galleries)
  app.get('/api/events/:eventId/gallery', (req: Request, res: Response) => {
    const { eventId } = req.params;
    const gallery = eventGalleries[eventId] || defaultGallery;
    res.json(gallery);
  });

  app.post('/api/events/:eventId/gallery', (req: Request, res: Response) => {
    const { eventId } = req.params;
    if (!eventGalleries[eventId]) {
      eventGalleries[eventId] = [...defaultGallery];
    }
    const newPhoto = {
      ...req.body,
      id: req.body.id || `photo-${Date.now()}`,
      timestamp: req.body.timestamp || (req.body.year === '2026' ? 'Hoje, ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Edição 2025'),
    };
    eventGalleries[eventId].unshift(newPhoto);

    // Broadcast gallery update
    broadcastToEvent(eventId, {
      type: 'gallery_update',
      eventId,
      gallery: eventGalleries[eventId],
    });

    res.status(201).json(newPhoto);
  });

  app.delete('/api/events/:eventId/gallery/:photoId', (req: Request, res: Response) => {
    const { eventId, photoId } = req.params;
    if (!eventGalleries[eventId]) {
      eventGalleries[eventId] = [...defaultGallery];
    }
    eventGalleries[eventId] = eventGalleries[eventId].filter((p) => p.id !== photoId);

    // Broadcast gallery update
    broadcastToEvent(eventId, {
      type: 'gallery_update',
      eventId,
      gallery: eventGalleries[eventId],
    });

    res.json({ success: true, gallery: eventGalleries[eventId] });
  });

  // Real-time SSE Stream for Mobile Apps and Dashboard
  app.get('/api/events/:eventId/stream', (req: Request, res: Response) => {
    const { eventId } = req.params;
    const event = eventsStore[eventId];

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Set headers for Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    if (!sseClients[eventId]) {
      sseClients[eventId] = new Set();
    }
    sseClients[eventId].add(res);

    // Send initial handshake state
    const initData = {
      type: 'init',
      eventId,
      state: event.state,
      devices: event.connectedDevices,
      status: event.status,
      gallery: eventGalleries[eventId] || defaultGallery,
    };
    res.write(`data: ${JSON.stringify(initData)}\n\n`);

    // Keep connection alive with periodic comment pings every 25 seconds
    const pingInterval = setInterval(() => {
      try {
        res.write(': ping\n\n');
      } catch {
        clearInterval(pingInterval);
      }
    }, 25000);

    req.on('close', () => {
      clearInterval(pingInterval);
      sseClients[eventId]?.delete(res);
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Modo Show Controller] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
