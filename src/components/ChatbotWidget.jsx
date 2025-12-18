import React, { useState } from 'react';
import { sendChatMessage } from '../services/chatService';

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        '¡Hola! 👋 Soy Grok AI, tu asistente inteligente de FlotaVehicular. Puedo ayudarte con:\n\n📋 Preguntas sobre:\n• Arquitectura del sistema\n• Gestión de flota y conductores\n• Rutas y monitoreo\n• Roles y permisos\n• Características y funcionalidades\n\n¿En qué puedo ayudarte?',
    },
  ]);

  const onSend = async (e) => {
    e?.preventDefault?.();
    const text = input.trim();
    if (!text || busy) return;

    // Agregar mensaje del usuario
    setMessages((prev) => [
      ...prev,
      { id: Date.now() + '', role: 'user', content: text },
    ]);
    setInput('');
    setBusy(true);
    setError('');

    try {
      // Preparar histórico para el servicio
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      console.log('🚀 Enviando mensaje a Grok AI...', {
        message: text,
        historyLength: history.length,
      });

      // Llamar al servicio de chat
      const { data, error: chatError } = await sendChatMessage(text, history);

      if (chatError) {
        console.error('Error del servicio:', chatError);
        setError(chatError.message);
        return;
      }

      if (!data || !data.reply) {
        setError('Respuesta vacía del asistente');
        return;
      }

      // Agregar respuesta del asistente
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + '-bot',
          role: 'assistant',
          content: String(data.reply),
        },
      ]);
    } catch (err) {
      console.error('Error inesperado:', err);
      setError(err.message || 'Error al consultar el asistente');
    }

    setBusy(false);
  };

  return (
    <div className="fixed bottom-6 left-6 z-[9999]" style={{ zIndex: 9999 }}>
      {open && (
        <div className="mb-4 w-80 md:w-96 h-[500px] bg-white shadow-2xl rounded-lg flex flex-col border-2 border-blue-500 animate-in slide-in-from-bottom duration-300">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧠</span>
              <div className="flex flex-col">
                <span className="font-semibold">Grok AI</span>
                <span className="text-xs text-blue-100">
                  Asistente Inteligente
                </span>
              </div>
            </div>
            <button
              className="text-white/90 hover:text-white hover:bg-white/20 rounded-full w-6 h-6 flex items-center justify-center transition"
              onClick={() => setOpen(false)}
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-auto p-4 space-y-3 text-sm bg-gray-50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={m.role === 'assistant' ? 'text-left' : 'text-right'}
              >
                <div
                  className={
                    m.role === 'assistant'
                      ? 'bg-white text-gray-800 rounded-lg px-4 py-2.5 w-fit max-w-[85%] shadow-sm border border-gray-200 inline-block whitespace-pre-wrap'
                      : 'bg-blue-600 text-white rounded-lg px-4 py-2.5 ml-auto w-fit max-w-[85%] shadow-sm inline-block whitespace-pre-wrap'
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}
            {busy && (
              <div className="text-left">
                <div className="bg-white text-gray-600 rounded-lg px-4 py-2.5 w-fit max-w-[85%] shadow-sm border border-gray-200 flex items-center gap-2">
                  <div className="animate-pulse flex gap-1">
                    <span>🧠</span>
                  </div>
                  <span>Grok está pensando...</span>
                </div>
              </div>
            )}
            {error && (
              <div className="bg-red-50 text-red-700 text-xs rounded px-3 py-2 border border-red-200">
                ⚠️ {error}
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={onSend}
            className="p-3 border-t-2 border-gray-200 flex gap-2 bg-white rounded-b-lg"
          >
            <input
              className="flex-1 border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={busy ? 'Pensando...' : 'Pregunta algo...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={busy}
              autoFocus
            />
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
              disabled={busy}
              type="submit"
              title="Enviar mensaje"
            >
              {busy ? '⏳' : '➤'}
            </button>
          </form>
        </div>
      )}

      {/* Botón flotante */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-2xl grid place-items-center text-2xl transition-all duration-200 hover:scale-110 border-2 border-white"
        aria-label="Abrir asistente"
        title="Grok AI - Asistente Inteligente"
      >
        {open ? '✕' : '🧠'}
      </button>
    </div>
  );
}
