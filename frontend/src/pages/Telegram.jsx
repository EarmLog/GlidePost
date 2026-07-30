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
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Panel de Formulario (Izquierda) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            
            {/* Cabecera del Panel */}
            <div className="flex flex-wrap justify-between items-center gap-2 pb-4 border-b border-gray-100">
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-800 tracking-tight">Automatización Telegram</h2>
              {isActive && (
                <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-bold animate-pulse flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span> ACTIVO
                </span>
              )}
            </div>
            
            {/* Contenido */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Contenido del Mensaje</label>
              <textarea 
                className="w-full border border-gray-200 p-3.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50/50 transition-all resize-y min-h-[100px]" 
                rows="3" 
                placeholder="Escribe tu mensaje aquí..."
                value={formData.content} 
                onChange={(e) => setFormData({...formData, content: e.target.value})} 
              />
            </div>
            
            {/* Destinos / Grupos */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Destinos (Grupos / Canales)</label>
              <div className="space-y-2.5 max-h-48 overflow-y-auto p-3 bg-gray-50 border border-gray-200 rounded-xl">
                {formData.groups.map((group, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input 
                      className="flex-1 border border-gray-200 bg-white p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                      placeholder="@nombre_grupo" 
                      value={group} 
                      onChange={(e) => updateGroup(index, e.target.value)} 
                    />
                    <button 
                      onClick={() => removeGroup(index)} 
                      className="w-10 h-10 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-bold transition-colors shrink-0"
                      title="Eliminar grupo"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button 
                onClick={addGroup} 
                className="w-full py-2.5 border-2 border-dashed border-gray-200 hover:border-blue-300 text-gray-600 hover:text-blue-600 rounded-xl font-semibold text-sm transition-all bg-gray-50/50"
              >
                + Agregar grupo
              </button>
            </div>

            {/* Intervalo y Extras */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Intervalo (Horas)</label>
                <input 
                  type="number" 
                  className="w-full border border-gray-200 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50/50" 
                  value={formData.frequency} 
                  placeholder="Ej. 24"
                  onChange={(e) => setFormData({...formData, frequency: e.target.value})} 
                />
              </div>

              <div className="flex items-center pt-5 sm:pt-6">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    checked={!!formData.sendNow} 
                    onChange={(e) => setFormData({...formData, sendNow: e.target.checked})} 
                  />
                  <span className="text-sm font-semibold text-gray-700">Enviar de inmediato</span>
                </label>
              </div>
            </div>

            {/* Archivo Imagen */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Imagen Adjunta</label>
              <input 
                type="file" 
                onChange={handleFile} 
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-gray-200 rounded-xl p-1 bg-gray-50/50" 
              />
            </div>
            
            {/* Botones de Acción Principal */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button 
                onClick={() => handleAction('schedule')} 
                className="flex-1 bg-blue-600 text-white py-3.5 px-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 text-sm"
              >
                Programar Publicación
              </button>
              <button 
                onClick={() => handleAction('cancel')} 
                className="flex-1 bg-red-500 text-white py-3.5 px-4 rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 text-sm"
              >
                Cancelar Tarea
              </button>
            </div>
            
            {/* Input de Código de Verificación Telegram */}
            <div className="flex gap-2 p-2 bg-gray-50 rounded-xl border border-gray-200 items-center">
              <input 
                className="flex-1 bg-transparent px-3 py-1.5 outline-none text-sm text-gray-700 placeholder-gray-400" 
                placeholder="Ingresa el código de Telegram..." 
                value={telegramCode} 
                onChange={(e) => setTelegramCode(e.target.value)} 
              />
              <button 
                onClick={() => handleAction('submit-code')} 
                className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-colors shadow-sm"
              >
                Enviar Código
              </button>
            </div>
          </div>

          {/* Panel de Vista Previa (Derecha) */}
          <div className="lg:col-span-5 bg-gray-50/80 p-6 sm:p-8 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center min-h-[400px]">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-6">Vista Previa del Mensaje</h3>
            
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden transition-all">
              {imageBase64 && (
                <div className="w-full bg-gray-100 max-h-72 overflow-hidden flex items-center justify-center border-b border-gray-100">
                  <img src={imageBase64} className="w-full h-auto object-cover max-h-72" alt="Preview" />
                </div>
              )}
              <div className="p-5">
                <p className="text-gray-700 text-sm whitespace-pre-wrap break-words leading-relaxed">
                  {formData.content || <span className="text-gray-400 italic">El mensaje aparecerá aquí en tiempo real...</span>}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Notificación de Estado / Status */}
        {status && (
          <div className="p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-sm font-medium shadow-sm flex items-center justify-between">
            <span>{status}</span>
            <button onClick={() => setStatus('')} className="text-blue-400 hover:text-blue-700 font-bold px-2">×</button>
          </div>
        )}

      </div>
    </Layout>
  );
}