export async function sendChatMessage(message, history = []) {
  const url = import.meta.env.VITE_N8N_WEBHOOK_URL;
  const model = import.meta.env.VITE_OLLAMA_MODEL || 'llama3.2';

  if (!url) {
    return {
      data: null,
      error: new Error('Falta configurar VITE_N8N_WEBHOOK_URL en .env'),
    };
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history,
        model,
        source: 'webapp',
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Error ${res.status}: ${text || 'Solicitud fallida'}`);
    }

    const json = await res.json();
    // Se espera que n8n responda { reply: 'texto', usage?: {...} }
    const reply = json.reply || json.answer || json.data || '';

    return { data: { reply, raw: json }, error: null };
  } catch (error) {
    console.error('Chatbot error:', error);
    return { data: null, error };
  }
}
