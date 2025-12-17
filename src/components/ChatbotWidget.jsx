import React, { useState } from 'react';

// URL del webhook de n8n - hardcodeada para evitar problemas con variables de entorno
const N8N_WEBHOOK_URL = 'http://localhost:5678/webhook/chatbot';
const OLLAMA_MODEL = 'llama3.2';

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
        '¡Hola! Soy tu asistente de Flota Vehicular. Pregúntame sobre conductores, vehículos, rutas o reportes.',
    },
  ]);

  const onSend = async (e) => {
    e?.preventDefault?.();
    const text = input.trim();
    if (!text || busy) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now() + '', role: 'user', content: text },
    ]);
    setInput('');
    setBusy(true);
    setError('');

    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history,
          model: OLLAMA_MODEL,
          source: 'webapp',
        }),
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status}`);
      }

      const json = await res.json();
      const reply = json.reply || json.answer || json.data || 'Sin respuesta';

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + '-bot', role: 'assistant', content: reply },
      ]);
    } catch (err) {
      console.error('Chatbot error:', err);
      setError(err.message || 'Error al consultar el asistente');
    }

    setBusy(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]" style={{ zIndex: 9999 }}>
      {open && (
        <div className="mb-4 w-80 md:w-96 h-[500px] bg-white shadow-2xl rounded-lg flex flex-col border-2 border-blue-500 animate-in slide-in-from-bottom duration-300">
          <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <span className="font-semibold">Asistente IA</span>
            </div>
            <button
              className="text-white/90 hover:text-white hover:bg-white/20 rounded-full w-6 h-6 flex items-center justify-center transition"
              onClick={() => setOpen(false)}
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-3 text-sm bg-gray-50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={
                  m.role === 'assistant'
                    ? 'bg-white text-gray-800 rounded-lg px-4 py-2.5 w-fit max-w-[85%] shadow-sm border border-gray-200'
                    : 'bg-blue-600 text-white rounded-lg px-4 py-2.5 ml-auto w-fit max-w-[85%] shadow-sm'
                }
              >
                {m.content}
              </div>
            ))}
            {busy && (
              <div className="bg-white text-gray-600 rounded-lg px-4 py-2.5 w-fit max-w-[85%] shadow-sm border border-gray-200 flex items-center gap-2">
                <div className="animate-pulse">●●●</div>
                Pensando...
              </div>
            )}
            {error && (
              <div className="bg-red-50 text-red-700 text-xs rounded px-3 py-2 border border-red-200">
                {error}
              </div>
            )}
          </div>

          <form
            onSubmit={onSend}
            className="p-3 border-t-2 border-gray-200 flex gap-2 bg-white rounded-b-lg"
          >
            <input
              className="flex-1 border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={busy ? 'Enviando...' : 'Escribe tu mensaje...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={busy}
            />
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
              disabled={busy}
              type="submit"
            >
              {busy ? '⏳' : '📤'}
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-2xl grid place-items-center text-2xl transition-all duration-200 hover:scale-110 border-2 border-white"
        aria-label="Abrir asistente"
        title="Asistente IA"
      >
        {open ? '✕' : '🤖'}
      </button>
    </div>
  );
}
