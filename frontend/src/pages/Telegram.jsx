import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

export default function Telegram() {
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('GlidePost_form');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed.groups)) return { ...parsed, groups: [''] };
      return parsed;
    }
    return { content: '', frequency: '', groups: [''], sendNow: false };
  });

  const [telegramCode, setTelegramCode] = useState(localStorage.getItem('GlidePost_code') || '');
  const [status, setStatus] = useState('');
  const [imageBase64, setImageBase64] = useState(localStorage.getItem('GlidePost_img') || null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    localStorage.setItem('GlidePost_form', JSON.stringify(formData));
    localStorage.setItem('GlidePost_code', telegramCode);
    if (imageBase64) localStorage.setItem('GlidePost_img', imageBase64);
  }, [formData, telegramCode, imageBase64]);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImageBase64(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const addGroup = () => setFormData({ ...formData, groups: [...formData.groups, ''] });
  const updateGroup = (index, value) => {
    const newGroups = [...formData.groups];
    newGroups[index] = value;
    setFormData({ ...formData, groups: newGroups });
  };
  const removeGroup = (index) => {
    const newGroups = formData.groups.filter((_, i) => i !== index);
    setFormData({ ...formData, groups: newGroups.length ? newGroups : [''] });
  };

  const handleAction = async (action) => {
    if (action === 'cancel') {
      try {
        const res = await fetch('http://localhost:5000/api/cancel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ job_id: `job_${formData.content.substring(0, 10)}` })
        });
        const data = await res.json();
        setStatus(data.message);
        setIsActive(false);
      } catch (err) { setStatus("Error al cancelar."); }
      return;
    }

    if (action === 'submit-code') {
      try {
        const res = await fetch('http://localhost:5000/api/submit-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: telegramCode })
        });
        const data = await res.json();
        setStatus(data.message);
      } catch (err) { setStatus("Error al enviar el código."); }
      return;
    }

    const data = new FormData();
    data.append('content', formData.content);
    data.append('frequency', formData.frequency);
    data.append('groups', formData.groups.filter(g => g.trim() !== '').join(','));
    data.append('sendNow', formData.sendNow);

    if (imageBase64) {
      const byteString = atob(imageBase64.split(',')[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
      data.append('image', new Blob([ia], { type: 'image/jpeg' }), 'post.jpg');
    }

    try {
      const res = await fetch(`http://localhost:5000/api/schedule`, { method: 'POST', body: data });
      const result = await res.json();
      setStatus(result.message);
      if (res.ok) setIsActive(true);
    } catch (err) { setStatus("Error al conectar con el servidor."); }
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Automatización Telegram</h2>
            {isActive && <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold animate-pulse">● ACTIVO</span>}
          </div>
          
          <label className="block text-sm font-semibold text-gray-700">Contenido</label>
          <textarea className="w-full border p-3 rounded-lg" rows="3" value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} />
          
          <label className="block text-sm font-semibold text-gray-700">Destinos</label>
          <div className="space-y-2 max-h-48 overflow-y-auto p-2 bg-gray-50 border rounded-lg">
            {formData.groups.map((group, index) => (
              <div key={index} className="flex gap-2">
                <input className="flex-1 border p-2 rounded-lg" placeholder="@grupo" value={group} onChange={(e) => updateGroup(index, e.target.value)} />
                <button onClick={() => removeGroup(index)} className="px-3 bg-red-100 text-red-600 rounded-lg font-bold">×</button>
              </div>
            ))}
          </div>
          <button onClick={addGroup} className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg">+ Agregar grupo</button>

          <label className="block text-sm font-semibold text-gray-700">Intervalo (Horas)</label>
          <input type="number" className="w-full border p-3 rounded-lg" value={formData.frequency} onChange={(e) => setFormData({...formData, frequency: e.target.value})} />
          
          <label className="flex items-center gap-2"><input type="checkbox" checked={!!formData.sendNow} onChange={(e) => setFormData({...formData, sendNow: e.target.checked})} /> Enviar de inmediato</label>
          
          <input type="file" onChange={handleFile} className="block w-full" />
          
          <div className="flex gap-2 pt-4">
            <button onClick={() => handleAction('schedule')} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700">Programar</button>
            <button onClick={() => handleAction('cancel')} className="flex-1 bg-red-500 text-white py-3 rounded-lg font-bold hover:bg-red-600">Cancelar</button>
          </div>
          
          <div className="flex gap-2 p-2 bg-gray-50 rounded-lg border">
            <input className="flex-1 bg-transparent p-2 outline-none" placeholder="Código..." value={telegramCode} onChange={(e) => setTelegramCode(e.target.value)} />
            <button onClick={() => handleAction('submit-code')} className="bg-yellow-500 text-white px-4 rounded-lg font-bold">Enviar</button>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl border-2 border-dashed flex flex-col items-center">
          <h3 className="font-bold text-gray-500 mb-4">Vista Previa</h3>
          {imageBase64 && <img src={imageBase64} className="max-h-64 rounded-lg shadow" alt="Preview" />}
          <p className="text-gray-700 italic mt-4">{formData.content || "El mensaje aparecerá aquí..."}</p>
        </div>
      </div>
      {status && <div className="mt-6 p-4 bg-blue-50 text-blue-700 rounded-lg">{status}</div>}
    </Layout>
  );
}