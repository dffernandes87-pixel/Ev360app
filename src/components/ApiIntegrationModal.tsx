import React, { useState } from 'react';
import { 
  X, 
  Code2, 
  Copy, 
  Check, 
  Key, 
  Radio, 
  ExternalLink, 
  Send, 
  Layers,
  Terminal,
  Smartphone
} from 'lucide-react';
import { EventProfile, ShowState } from '../types';

interface ApiIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEvent: EventProfile;
  activeState: ShowState;
}

export const ApiIntegrationModal: React.FC<ApiIntegrationModalProps> = ({
  isOpen,
  onClose,
  currentEvent,
  activeState,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'curl' | 'react_native' | 'flutter'>('overview');
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isLoadingTest, setIsLoadingTest] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const streamUrl = `${window.location.origin}/api/events/${currentEvent.id}/stream`;
  const stateUrl = `${window.location.origin}/api/events/${currentEvent.id}/state`;

  const handleRunLiveTest = async () => {
    setIsLoadingTest(true);
    try {
      const res = await fetch(`/api/events/${currentEvent.id}/state`);
      const data = await res.json();
      setTestResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setTestResponse(`Erro ao consultar API: ${err.message}`);
    } finally {
      setIsLoadingTest(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-neutral-900 border border-neutral-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                API de Conexão & Integração com o App do Evento
              </h2>
              <p className="text-xs text-neutral-400">
                Parâmetros técnicos para conectar qualquer aplicativo mobile ao Dashboard Central
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

        {/* Navigation Tabs */}
        <div className="px-5 pt-3 border-b border-neutral-800 flex gap-2 bg-neutral-950/40 overflow-x-auto">
          {[
            { id: 'overview', label: 'Credenciais & Endpoints' },
            { id: 'curl', label: 'Comando cURL' },
            { id: 'react_native', label: 'React Native / Expo' },
            { id: 'flutter', label: 'Flutter / Dart' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2 px-2 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-purple-500 text-white'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          
          {/* TAB 1: OVERVIEW & CREDENTIALS */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              
              {/* Credentials Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800">
                  <div className="text-[10.5px] uppercase font-mono text-neutral-400">ID ÚNICO DO EVENTO</div>
                  <div className="text-sm font-bold font-mono text-white mt-1 flex items-center justify-between">
                    <span>{currentEvent.id}</span>
                    <button
                      onClick={() => copyToClipboard(currentEvent.id, 'id')}
                      className="text-neutral-400 hover:text-white p-1"
                    >
                      {copiedKey === 'id' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800">
                  <div className="text-[10.5px] uppercase font-mono text-neutral-400">CÓDIGO PÚBLICO</div>
                  <div className="text-sm font-bold font-mono text-purple-400 mt-1 flex items-center justify-between">
                    <span>{currentEvent.code}</span>
                    <button
                      onClick={() => copyToClipboard(currentEvent.code, 'code')}
                      className="text-neutral-400 hover:text-white p-1"
                    >
                      {copiedKey === 'code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 sm:col-span-2">
                  <div className="text-[10.5px] uppercase font-mono text-neutral-400 flex items-center gap-1.5">
                    <Key className="w-3 h-3 text-amber-400" />
                    <span>CHAVE DE CONEXÃO (API KEY / TOKEN DE AUTORIZAÇÃO)</span>
                  </div>
                  <div className="text-sm font-bold font-mono text-amber-300 mt-1 flex items-center justify-between">
                    <code className="bg-neutral-900 px-2 py-1 rounded">{currentEvent.connectionKey}</code>
                    <button
                      onClick={() => copyToClipboard(currentEvent.connectionKey, 'key')}
                      className="text-neutral-400 hover:text-white p-1"
                    >
                      {copiedKey === 'key' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Endpoints Table */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                  Endpoints Disponíveis
                </div>
                <div className="space-y-2 text-xs font-mono">
                  
                  {/* SSE Stream */}
                  <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">GET</span>
                        <span className="text-white font-bold">Stream SSE em Tempo Real</span>
                      </div>
                      <div className="text-neutral-400 text-[11px] mt-1 break-all">
                        {streamUrl}
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(streamUrl, 'streamUrl')}
                      className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 text-[11px] shrink-0 self-start sm:self-auto"
                    >
                      {copiedKey === 'streamUrl' ? 'Copiado!' : 'Copiar URL'}
                    </button>
                  </div>

                  {/* REST State */}
                  <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-bold">GET</span>
                        <span className="text-white font-bold">Estado Atual do Modo Show (JSON)</span>
                      </div>
                      <div className="text-neutral-400 text-[11px] mt-1 break-all">
                        {stateUrl}
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(stateUrl, 'stateUrl')}
                      className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 text-[11px] shrink-0 self-start sm:self-auto"
                    >
                      {copiedKey === 'stateUrl' ? 'Copiado!' : 'Copiar URL'}
                    </button>
                  </div>

                  {/* Device Heartbeat */}
                  <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 text-[10px] font-bold">POST</span>
                        <span className="text-white font-bold">Heartbeat / Registro de Dispositivo</span>
                      </div>
                      <div className="text-neutral-400 text-[11px] mt-1 break-all">
                        {window.location.origin}/api/events/{currentEvent.id}/heartbeat
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Live Test Console */}
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Testar Resposta da API ao Vivo</span>
                  </span>
                  <button
                    onClick={handleRunLiveTest}
                    disabled={isLoadingTest}
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-neutral-950 text-xs font-bold font-mono transition-colors"
                  >
                    {isLoadingTest ? 'Consultando...' : 'Executar GET /state'}
                  </button>
                </div>
                {testResponse ? (
                  <pre className="p-3 bg-neutral-900 rounded-lg text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-48">
                    {testResponse}
                  </pre>
                ) : (
                  <p className="text-[11px] text-neutral-400">
                    Clique em &quot;Executar GET /state&quot; para verificar os dados que o app mobile recebe em tempo real.
                  </p>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: CURL */}
          {activeTab === 'curl' && (
            <div className="space-y-3">
              <div className="text-xs text-neutral-300 font-mono">
                Consulte o status via terminal:
              </div>
              <pre className="p-4 bg-neutral-950 rounded-xl text-xs font-mono text-neutral-200 border border-neutral-800 overflow-x-auto">
{`# 1. Ouvir atualizações em tempo real (SSE)
curl -N -H "Accept: text/event-stream" \\
  "${streamUrl}"

# 2. Consultar estado pontual
curl "${stateUrl}"`}
              </pre>
            </div>
          )}

          {/* TAB 3: REACT NATIVE / EXPO */}
          {activeTab === 'react_native' && (
            <div className="space-y-3">
              <div className="text-xs text-neutral-300">
                Exemplo de código para implementar no aplicativo móvel do participante:
              </div>
              <pre className="p-4 bg-neutral-950 rounded-xl text-[11px] font-mono text-indigo-300 border border-neutral-800 overflow-x-auto max-h-72">
{`// No App do Evento (Modo Show Screen)
import React, { useEffect, useState } from 'react';
import { View, Image, Text, Animated } from 'react-native';

export function ModoShowScreen() {
  const [showState, setShowState] = useState(null);

  useEffect(() => {
    // Conectar ao stream de eventos em tempo real do Dashboard
    const eventSource = new EventSource('${streamUrl}');

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'state_update' || data.type === 'init') {
        setShowState(data.state);
      }
    };

    return () => eventSource.close();
  }, []);

  if (!showState?.isActive) {
    return <View style={{ flex: 1, backgroundColor: '#000' }} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: showState.color }}>
      {showState.image?.enabled && (
        <Image 
          source={{ uri: showState.image.url }} 
          style={{ width: 140, height: 140, alignSelf: 'center' }} 
        />
      )}
    </View>
  );
}`}
              </pre>
            </div>
          )}

          {/* TAB 4: FLUTTER / DART */}
          {activeTab === 'flutter' && (
            <div className="space-y-3">
              <div className="text-xs text-neutral-300">
                Código Flutter para escutar o stream SSE:
              </div>
              <pre className="p-4 bg-neutral-950 rounded-xl text-[11px] font-mono text-blue-300 border border-neutral-800 overflow-x-auto max-h-72">
{`// Flutter Event App - Modo Show
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class ModoShowWidget extends StatefulWidget {
  @override
  _ModoShowWidgetState createState() => _ModoShowWidgetState();
}

class _ModoShowWidgetState extends State<ModoShowWidget> {
  Color currentColor = Colors.black;

  @override
  void initState() {
    super.initState();
    _connectToStream();
  }

  void _connectToStream() async {
    final client = http.Client();
    final request = http.Request('GET', Uri.parse('${streamUrl}'));
    final response = await client.send(request);

    response.stream.transform(utf8.decoder).listen((data) {
      // Processa atualizações em tempo real enviadas pelo Dashboard
    });
  }
}`}
              </pre>
            </div>
          )}

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
