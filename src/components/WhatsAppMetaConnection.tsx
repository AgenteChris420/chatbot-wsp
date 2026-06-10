import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Key, 
  Copy, 
  Check, 
  HelpCircle, 
  Activity, 
  Smartphone, 
  ArrowRight, 
  ShieldAlert, 
  Sparkles, 
  Send,
  RefreshCw,
  Sliders,
  Settings,
  MessageSquare,
  Edit,
  X,
  Link2
} from 'lucide-react';

interface WhatsAppMetaConnectionProps {
  agents: any[];
  onSaveAgents: (newAgents: any[]) => void;
  onAddNotification: (title: string, message: string, type: 'urgent' | 'lead' | 'info') => void;
}

export default function WhatsAppMetaConnection({ agents, onSaveAgents, onAddNotification }: WhatsAppMetaConnectionProps) {
  const [callbackUrl, setCallbackUrl] = useState('');
  const [verifyToken, setVerifyToken] = useState('WhatsAppBotProToken2026');
  const [isEditingToken, setIsEditingToken] = useState(false);
  const [newTokenValue, setNewTokenValue] = useState('WhatsAppBotProToken2552');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Inline editing state for linking WhatsApp number
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);
  const [tempWhatsappNumber, setTempWhatsappNumber] = useState('');

  useEffect(() => {
    // Generate dynamic Callback URL matching the precise deployment host
    setCallbackUrl(window.location.origin + '/api/whatsapp');
    
    // Fetch currently configured verify token from backend
    fetch('/api/whatsapp/config')
      .then(res => res.json())
      .then(data => {
        if (data.verifyToken) {
          setVerifyToken(data.verifyToken);
          setNewTokenValue(data.verifyToken);
        }
      })
      .catch(err => console.error("Could not fetch webhook config", err));
  }, []);

  const handleStartEditingNumber = (agent: any) => {
    setEditingAgentId(agent.id);
    setTempWhatsappNumber(agent.whatsappNumber || '');
  };

  const handleSaveAgentNumber = (agentId: string) => {
    const updatedAgents = agents.map(agent => {
      if (agent.id === agentId) {
        return {
          ...agent,
          whatsappNumber: tempWhatsappNumber.trim()
        };
      }
      return agent;
    });
    
    onSaveAgents(updatedAgents);
    setEditingAgentId(null);
    onAddNotification(
      "Número Enlazado", 
      `Se ha vinculado el número de Meta WhatsApp al agente correctamente.`, 
      "info"
    );
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(callbackUrl);
    setCopiedUrl(true);
    onAddNotification("URL Copiada", "La dirección de callback fue copiada al portapapeles", "info");
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(verifyToken);
    setCopiedToken(true);
    onAddNotification("Token Copiado", "El token de verificación fue copiado al portapapeles", "info");
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleSaveToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTokenValue.trim()) return;
    
    setIsSaving(true);
    try {
      const res = await fetch('/api/whatsapp/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verifyToken: newTokenValue.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        setVerifyToken(data.verifyToken);
        setIsEditingToken(false);
        onAddNotification("Token Actualizado", "Token de verificación de Meta actualizado con éxito.", "info");
      }
    } catch (err) {
      console.error(err);
      onAddNotification("Error", "No se pudo guardar el token en el servidor", "urgent");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-xs">
      {/* Intro Banner */}
      <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-3xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Enlace con Meta WhatsApp Business</h1>
            <p className="text-gray-500 text-sm leading-relaxed max-w-2xl">
              Aquí tienes las credenciales oficiales de servidor seguro SSL y las directrices técnicas indispensables para registrar este sistema dentro del panel oficial de Facebook Developers.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono bg-blue-50 border border-blue-100 text-blue-700 px-3.5 py-1.5 rounded-full shrink-0">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            Servicios Webhook: Activos en Puerto 3000
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column - Configuration & Copy Area */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Webhook credentials panel */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-3xs space-y-5">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 border-b border-gray-50 pb-3">
              <Sliders className="w-4 h-4 text-blue-600" />
              Credenciales para Configuración de Webhook en Meta
            </h3>


            {/* Callback URL */}
            <div className="space-y-1.5">
              <label className="font-bold text-gray-700 flex items-center justify-between">
                <span>URL de devolución de llamada (Callback URL)</span>
                <span className="text-[10px] text-green-600 font-mono font-semibold">SSL HTTPS Requerido</span>
              </label>
              <div className="flex gap-2">
                <div className="flex-1 bg-gray-50 border border-gray-200 text-gray-600 px-3.5 py-2.5 rounded-xl font-mono truncate select-all flex items-center justify-between text-xs">
                  {callbackUrl || "Generando URL segura de devolución..."}
                </div>
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="bg-gray-100 hover:bg-gray-250 border border-gray-200 text-gray-700 p-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 font-bold shrink-0"
                  title="Copiar URL de Devolución"
                >
                  {copiedUrl ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  <span>Copiar</span>
                </button>
              </div>
              <p className="text-[10px] text-gray-400">Esta es la ruta única express de tu servidor Cloud Run que Meta validará enviando su firma cifrada SHA-1.</p>
            </div>

            {/* Verification Token */}
            <div className="space-y-2 border-t border-gray-50 pt-4">
              <div className="flex items-center justify-between">
                <label className="font-bold text-gray-700">Token de verificación (Verify Token)</label>
                <button 
                  onClick={() => {
                    setIsEditingToken(!isEditingToken);
                    setNewTokenValue(verifyToken);
                  }}
                  className="text-blue-600 hover:underline font-bold text-[10px]"
                >
                  {isEditingToken ? "Cancelar Edición" : "Cambiar Token"}
                </button>
              </div>

              {isEditingToken ? (
                <form onSubmit={handleSaveToken} className="flex gap-2">
                  <input
                    type="text"
                    value={newTokenValue}
                    onChange={(e) => setNewTokenValue(e.target.value)}
                    placeholder="Escribe tu token de seguridad personalizado..."
                    className="flex-1 border border-gray-200 px-3.5 py-2.5 rounded-xl focus:border-blue-500 outline-none text-xs font-mono"
                    maxLength={64}
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold px-4 rounded-xl transition-colors shrink-0 cursor-pointer"
                  >
                    {isSaving ? "Guardando..." : "Guardar"}
                  </button>
                </form>
              ) : (
                <div className="flex gap-2">
                  <div className="flex-1 bg-gray-50 border border-gray-200 text-gray-700 px-3.5 py-2.5 rounded-xl font-mono select-all flex items-center justify-between text-xs">
                    {verifyToken}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyToken}
                    className="bg-gray-100 hover:bg-gray-250 border border-gray-200 text-gray-700 p-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 font-bold shrink-0"
                    title="Copiar Token"
                  >
                    {copiedToken ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    <span>Copiar</span>
                  </button>
                </div>
              )}
              <p className="text-[10px] text-gray-400">Introduce exactamente esta misma palabra clave en Meta. Tu servidor rechazará cualquier solicitud que no incluya esta firma de verificación.</p>
            </div>
          </div>



        </div>

        {/* Right Column - Webhook Instruction Guide & Active Lines linking */}
        <div className="lg:col-span-5 space-y-6">
          

          {/* Active Corporate Lines Summary with direct interactive editing */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-3xs space-y-4">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 border-b border-gray-50 pb-2">
              <Activity className="w-4 h-4 text-green-500 animate-pulse animate-duration-1000" />
              Líneas WhatsApp Activas en Meta
            </h3>
            <p className="text-[11px] text-gray-500 leading-normal">
              Vincula o edita directamente los números comerciales de Meta para cada uno de tus Agentes Inteligentes creados:
            </p>
            <div className="space-y-2.5 pt-1">
              {agents.map((agent) => (
                <div key={agent.id} className="p-3 bg-gray-50/50 border border-gray-150 rounded-xl flex min-h-[52px] items-center">
                  {editingAgentId === agent.id ? (
                    <div className="flex items-center gap-1.5 w-full animate-fade-in">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={tempWhatsappNumber}
                          onChange={(e) => setTempWhatsappNumber(e.target.value)}
                          placeholder="ej. +52 55 4160 2001"
                          className="w-full text-xs border border-blue-300 rounded-lg px-2.5 py-1.5 focus:border-blue-500 outline-none font-mono bg-blue-50/10 text-gray-800 font-bold"
                          autoFocus
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSaveAgentNumber(agent.id)}
                        className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-all shrink-0 cursor-pointer flex items-center justify-center"
                        title="Guardar Número"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingAgentId(null)}
                        className="bg-gray-100 hover:bg-gray-250 text-gray-600 p-2 rounded-lg transition-all shrink-0 cursor-pointer flex items-center justify-center"
                        title="Cancelar"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <span className="flex h-2 w-2 relative shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <div className="overflow-hidden">
                          <h4 className="font-bold text-gray-800 text-xs truncate">{agent.name}</h4>
                          <p className="text-[10px] text-gray-400 font-semibold truncate">Auto-enrutamiento activo</p>
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center gap-1.5 pl-1">
                        {agent.whatsappNumber ? (
                          <div className="flex items-center gap-1">
                            <span className="inline-flex items-center gap-1 text-blue-600 bg-blue-50/70 border border-blue-100 px-2 py-1 rounded-lg font-mono font-bold text-[10px]">
                              <Smartphone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                              {agent.whatsappNumber}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleStartEditingNumber(agent)}
                              className="p-1 px-1.5 text-gray-400 hover:text-blue-600 border border-gray-100 bg-white hover:bg-slate-50 rounded-lg transition-all cursor-pointer text-[10px] font-medium"
                              title="Editar Número"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleStartEditingNumber(agent)}
                            className="inline-flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 hover:bg-amber-100 active:bg-amber-150 px-2.5 py-1 rounded-lg font-bold border border-amber-100 cursor-pointer transition-all shrink-0"
                          >
                            <Link2 className="w-3 h-3 text-amber-500 shrink-0" />
                            <span>Vincular línea</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Security details checklist */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-3xs space-y-2">
            <h4 className="font-bold text-gray-800 text-xs flex items-center gap-1.5"><Key className="w-4 h-4 text-blue-600" /> Cifrado y Privacidad</h4>
            <p className="text-gray-500 leading-relaxed font-sans mt-1">
              Todos los datos inbound enviados hacia la ruta HTTPS de la plataforma están protegidos con cabeceras de firma securizada <strong>X-Hub-Signature-256</strong>. El BOT descifra y valida las firmas en tiempo récord para velar por la integridad de tu negocio.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
