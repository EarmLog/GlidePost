import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

export default function Settings() {
  const [tokens, setTokens] = useState({
    tg_api_id: '', tg_api_hash: '', tg_phone: '',
    tg_bot_token: '', fb_token: '', ig_token: '',
    tt_api_key: '', discord_webhook: ''
  });
  
  const [activeSection, setActiveSection] = useState('telegram');
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/settings')
      .then(res => res.json())
      .then(data => setTokens(prev => ({ ...prev, ...data })))
      .catch(console.error);
  }, []);

  const saveSettings = async () => {
    const res = await fetch('http://localhost:5000/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tokens)
    });
    if (res.ok) setStatus('¡Guardado con éxito!');
  };

  const Section = ({ id, title, children }) => (
    <div className="border rounded-lg mb-4 overflow-hidden">
      <button 
        onClick={() => setActiveSection(activeSection === id ? null : id)}
        className="w-full p-4 bg-gray-100 font-bold text-left flex justify-between hover:bg-gray-200"
      >
        {title} <span>{activeSection === id ? '▲' : '▼'}</span>
      </button>
      {activeSection === id && <div className="p-4 space-y-3 bg-white">{children}</div>}
    </div>
  );

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6">Configuración de Redes</h2>
      
      <Section id="telegram" title="Telegram (Userbot & Bot)">
        <input className="w-full border p-2 rounded" placeholder="API ID" value={tokens.tg_api_id} onChange={(e) => setTokens({...tokens, tg_api_id: e.target.value})} />
        <input className="w-full border p-2 rounded" placeholder="API Hash" value={tokens.tg_api_hash} onChange={(e) => setTokens({...tokens, tg_api_hash: e.target.value})} />
        <input className="w-full border p-2 rounded" placeholder="Teléfono (+58...)" value={tokens.tg_phone} onChange={(e) => setTokens({...tokens, tg_phone: e.target.value})} />
        <input className="w-full border p-2 rounded" placeholder="Bot Token (Opcional)" value={tokens.tg_bot_token} onChange={(e) => setTokens({...tokens, tg_bot_token: e.target.value})} />
      </Section>

      <Section id="facebook" title="Facebook / Instagram">
        <input className="w-full border p-2 rounded" placeholder="FB Access Token" value={tokens.fb_token} onChange={(e) => setTokens({...tokens, fb_token: e.target.value})} />
        <input className="w-full border p-2 rounded" placeholder="IG Access Token" value={tokens.ig_token} onChange={(e) => setTokens({...tokens, ig_token: e.target.value})} />
      </Section>

      <Section id="social" title="TikTok / Discord">
        <input className="w-full border p-2 rounded" placeholder="TikTok API Key" value={tokens.tt_api_key} onChange={(e) => setTokens({...tokens, tt_api_key: e.target.value})} />
        <input className="w-full border p-2 rounded" placeholder="Discord Webhook URL" value={tokens.discord_webhook} onChange={(e) => setTokens({...tokens, discord_webhook: e.target.value})} />
      </Section>

      <button onClick={saveSettings} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700">
        Guardar Todas las Credenciales
      </button>
      {status && <p className="mt-4 text-center font-bold text-green-600">{status}</p>}
    </Layout>
  );
}