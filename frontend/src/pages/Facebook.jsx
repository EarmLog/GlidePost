import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

export default function Facebook() {
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('tg_form');
    return saved ? JSON.parse(saved) : { content: '', frequency: '', groups: '', sendNow: false };
  });
  const [telegramCode, setTelegramCode] = useState(localStorage.getItem('tg_code') || '');
  const [status, setStatus] = useState('');
  const [imageBase64, setImageBase64] = useState(localStorage.getItem('tg_img') || null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    localStorage.setItem('tg_form', JSON.stringify(formData));
    localStorage.setItem('tg_code', telegramCode);
    if (imageBase64) localStorage.setItem('tg_img', imageBase64);
  }, [formData, telegramCode, imageBase64]);

  const handleAction = async (action) => {
    if (action === 'submit-code') {
      const res = await fetch('http://localhost:5000/api/submit-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: telegramCode })
      });
      const data = await res.json();
      setStatus(data.message);
      return;
    }

    const data = new FormData();
    data.append('content', formData.content);
    data.append('frequency', formData.frequency);
    data.append('groups', formData.groups);
    data.append('sendNow', formData.sendNow);
    // ... (logic para imagen igual al anterior) ...

    const res = await fetch(`http://localhost:5000/api/${action}`, { method: 'POST', body: data });
    const result = await res.json();
    setStatus(result.message);
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Automatización Telegram</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulario e Inputs de Telegram aquí... */}
        {/* Incluye el bloque de entrada de código Telegram */}
      </div>
    </Layout>
  );
}