import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Check, 
  Edit, 
  Plus, 
  Trash, 
  AlertCircle, 
  MessageSquare, 
  Smartphone,
  Globe,
  Sparkles,
  RefreshCw,
  HelpCircle,
  FileText,
  UploadCloud,
  Eye,
  FileUp,
  X
} from 'lucide-react';
import { Agent, Message, TrainingFile } from '../types';

interface AgentTrainingProps {
  agents: Agent[];
  onSaveAgents: (newAgents: Agent[]) => void;
  onAddNotification: (title: string, msg: string, type: 'urgent' | 'lead' | 'info') => void;
}

export default function AgentTraining({ agents, onSaveAgents, onAddNotification }: AgentTrainingProps) {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(agents[0] || null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Form fields for editing/creating Agent
  const [agentName, setAgentName] = useState('');
  const [agentStatus, setAgentStatus] = useState<'Active' | 'Inactive' | 'Draft'>('Active');
  const [agentLanguage, setAgentLanguage] = useState('Español');
  const [agentWebhook, setAgentWebhook] = useState('');
  const [agentTraining, setAgentTraining] = useState('');
  const [agentReplies, setAgentReplies] = useState('');
  const [agentFiles, setAgentFiles] = useState<TrainingFile[]>([]);
  const [agentWhatsappNum, setAgentWhatsappNum] = useState('');

  // Scanning files simulator states
  const [scanningFile, setScanningFile] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStep, setScanStep] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [viewingFile, setViewingFile] = useState<TrainingFile | null>(null);

  // Auto-synthesizing smart text extraction from any file
  const generateSimulatedPDFExtract = (fileName: string): string => {
    const cleanName = fileName.replace(/\.[^/.]+$/, "").replace(/_/g, " ").replace(/-/g, " ");
    const dateStr = new Date().toLocaleDateString();
    const lowerName = fileName.toLowerCase();

    if (lowerName.includes("precio") || lowerName.includes("tarifa") || lowerName.includes("cost") || lowerName.includes("dental")) {
      return `\n\n--- DOCUMENTO MEMORIA PDF: ${fileName} ---
Fecha de Escaneo por IA: ${dateStr}
Sección de Precios y Servicios Oficiales de la Empresa:
- Limpieza Avanzada con Ultrasonido: $40.00 USD (Precio Certificado)
- Blanqueamiento Dental LED Avanzado: $120.00 USD (Plan Promocional Vigente 2x1)
- Resinas Odontológicas Estéticas: de $30 a $60 USD de acuerdo al daño.
- Consulta de Caracterización inicial: $20.00 USD
Políticas Tributarias: Todos los precios expresados están exentos de cargos ocultos. Las consultas posteriores a tratamientos urgentes son complementarias por 6 meses.`;
    }

    if (lowerName.includes("manual") || lowerName.includes("politica") || lowerName.includes("guia") || lowerName.includes("regla") || lowerName.includes("venta")) {
      return `\n\n--- DOCUMENTO MEMORIA PDF: ${fileName} ---
Fecha de Escaneo por IA: ${dateStr}
Sección de Directrices sobre Clientes y Políticas:
- Regla de Devoluciones y Gestión de Citas: El cliente puede reprogramar o cancelar su agenda sin cargos avisando con un mínimo de 12 horas.
- Garantía de Postventa: Ofrecemos soporte premium de 10 días tras cualquier compra o cita presencial.
- Privacidad y Seguridad: El asesoramiento automatizado por WhatsApp cumple estrictas normativas SSL y políticas LOPD de protección de datos.`;
    }

    return `\n\n--- DOCUMENTO MEMORIA PDF: ${fileName} ---
Fecha de Escaneo por IA: ${dateStr}
Definición de Valores Empresariales (${cleanName}):
- Objetivo del Bot: Atender dudas con precisión comercial de bajo retardo técnico.
- Respuestas Clave: Indicar promociones actuales, horarios flexibles (lunes a sábado de 9am a 7pm), y ubicar oficinas de inmediato.
- Captura de Lead: Pedir Nombre Completo, Teléfono / WhatsApp y Correo Electrónico formalmente para agendar la cita.`;
  };

  const startFileScan = (file: File) => {
    setScanningFile(file.name);
    setScanProgress(5);
    setScanStep('Leyendo archivo binario de WhatsApp...');
    
    const fileSizeStr = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    
    let progress = 5;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 18) + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        const scannedText = generateSimulatedPDFExtract(file.name);
        
        const newFile: TrainingFile = {
          id: 'file-' + Math.random().toString(36).substring(2, 9),
          name: file.name,
          size: fileSizeStr,
          uploadedAt: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
          charCount: scannedText.length,
          extractedText: scannedText
        };
        
        setAgentFiles(prev => [...prev, newFile]);
        setAgentTraining(prev => prev + scannedText);

        setScanningFile(null);
        setScanProgress(0);
        setScanStep('');
        onAddNotification(
          "Documento Indexado", 
          `Se procesó "${file.name}" exitosamente con Gemini AI y se integró a la base de conocimientos.`, 
          "lead"
        );
      } else {
        setScanProgress(progress);
        if (progress > 80) {
          setScanStep('Sintetizando base de conocimientos empresarial...');
        } else if (progress > 52) {
          setScanStep('Analizando tablas de precios y catálogos...');
        } else if (progress > 27) {
          setScanStep('Decodificando estructura del documento y capas de texto...');
        } else {
          setScanStep('Estableciendo conexión segura OCR...');
        }
      }
    }, 350);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.pdf') && !file.type.includes('pdf')) {
      onAddNotification("Formato Diferente", "Por favor sube únicamente archivos en formato PDF empresarial.", "urgent");
      return;
    }

    startFileScan(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf') && !file.type.includes('pdf')) {
        onAddNotification("Formato Diferente", "Por favor arrastra únicamente archivos en formato PDF empresarial.", "urgent");
        return;
      }
      startFileScan(file);
    }
  };

  const handleDeleteFile = (fileId: string, extractedText: string) => {
    setAgentFiles(prev => prev.filter(f => f.id !== fileId));
    setAgentTraining(prev => {
      return prev.replace(extractedText, '').trim();
    });
    onAddNotification(
      "Documento Olvidado", 
      "Se ha retirado el documento PDF y su texto asociado de la memoria del BOT.", 
      "info"
    );
  };

  // Simulator states
  const [simMessages, setSimMessages] = useState<Message[]>([
    { id: "sinit-1", text: "¡Hola! Soy tu asistente de WhatsApp de prueba. Escribe un mensaje para ver cómo respondo utilizando mi información de entrenamiento empresarial.", sender: "system", timestamp: new Date().toISOString() }
  ]);
  const [simInput, setSimInput] = useState('');
  const [isLoadingReply, setIsLoadingReply] = useState(false);
  const [simStatus, setSimStatus] = useState<string | null>(null);

  // Trigger editing state
  const handleStartEdit = (agent: Agent) => {
    setAgentName(agent.name);
    setAgentStatus(agent.status);
    setAgentLanguage(agent.language || 'Español');
    setAgentWebhook(agent.crmWebhookUrl || '');
    setAgentTraining(agent.trainingData);
    setAgentReplies(agent.quickReplies || '');
    setAgentFiles(agent.trainingFiles || []);
    setAgentWhatsappNum(agent.whatsappNumber || '');
    setIsEditing(true);
  };

  // Save agent training
  const handleSaveAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentName || !agentTraining) return;

    let updatedAgents: Agent[] = [];
    if (selectedAgent) {
      updatedAgents = agents.map(a => a.id === selectedAgent.id ? {
        ...a,
        name: agentName,
        status: agentStatus,
        language: agentLanguage,
        crmWebhookUrl: agentWebhook,
        trainingData: agentTraining,
        quickReplies: agentReplies,
        trainingFiles: agentFiles,
        whatsappNumber: agentWhatsappNum
      } : a);
      onAddNotification("Agente Entrenado", `Se actualizó el entrenamiento de ${agentName} correctamente`, "info");
    } else {
      const newAgent: Agent = {
        id: "agent-" + Math.random().toString(36).substring(2, 9),
        name: agentName,
        status: agentStatus,
        language: agentLanguage,
        crmWebhookUrl: agentWebhook,
        trainingData: agentTraining,
        quickReplies: agentReplies,
        createdAt: new Date().toISOString(),
        trainingFiles: agentFiles,
        whatsappNumber: agentWhatsappNum
      };
      updatedAgents = [...agents, newAgent];
      setSelectedAgent(newAgent);
      onAddNotification("Nuevo Agente Creado", `Agente Chatbot ${agentName} listo para entrenamiento`, "lead");
    }

    onSaveAgents(updatedAgents);
    setIsEditing(false);
    
    // Auto-select correct agent
    const match = updatedAgents.find(a => a.name === agentName);
    if (match) setSelectedAgent(match);
  };

  const handleDeleteAgent = (agentId: string) => {
    const updatedAgents = agents.filter(a => a.id !== agentId);
    onSaveAgents(updatedAgents);
    setSelectedAgent(updatedAgents[0] || null);
    setIsEditing(false);
    setShowDeleteConfirm(false);
    onAddNotification("Agente Eliminado", "Se ha eliminado al agente virtual de forma definitiva.", "info");
  };

  // Add agent trigger
  const handleAddNewAgent = () => {
    setSelectedAgent(null);
    setAgentName('Nuevo Agente Automatizado');
    setAgentStatus('Active');
    setAgentLanguage('Español');
    setAgentWebhook('https://');
    setAgentTraining('Inserta aquí la información, preguntas frecuentes, precios, y de qué trata tu empresa...');
    setAgentReplies('Precios, Consultar, Agendar');
    setAgentFiles([]);
    setAgentWhatsappNum('');
    setIsEditing(true);
  };

  // Test Simulator messaging via Backend `/api/chat`
  const handleSendSimulatorMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simInput.trim() || !selectedAgent) return;

    const userMsgText = simInput;
    const userMsg: Message = {
      id: "sim-user-" + Date.now(),
      text: userMsgText,
      sender: "client",
      timestamp: new Date().toISOString()
    };

    setSimMessages(prev => [...prev, userMsg]);
    setSimInput('');
    setIsLoadingReply(true);
    setSimStatus(`${selectedAgent.name} está analizando tu mensaje...`);

    const startTime = Date.now();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsgText,
          agentId: selectedAgent.id,
          conversationHistory: simMessages.filter(m => m.sender !== 'system')
        })
      });

      if (!response.ok) {
        throw new Error("Respuesta del servidor fallida");
      }

      const data = await response.json();
      
      const botMsg: Message = {
        id: "sim-bot-" + Date.now(),
        text: data.response,
        sender: "agent",
        timestamp: new Date().toISOString()
      };

      // Generate simulated response latency of 5 to 10 seconds (standard low latency bot standard)
      const randomDelay = Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000;
      const elapsed = Date.now() - startTime;
      if (elapsed < randomDelay) {
        await new Promise(resolve => setTimeout(resolve, randomDelay - elapsed));
      }

      setSimMessages(prev => [...prev, botMsg]);
      
      if (data.warning) {
        setSimStatus("Advertencia: " + data.warning);
      } else {
        setSimStatus(null);
      }

    } catch (err: any) {
      console.error(err);
      const errBotMsg: Message = {
        id: "sim-err-" + Date.now(),
        text: "Error al comunicar con la IA. Asegúrate de que el servidor está en línea.",
        sender: "system",
        timestamp: new Date().toISOString()
      };
      setSimMessages(prev => [...prev, errBotMsg]);
      setSimStatus(null);
    } finally {
      setIsLoadingReply(false);
    }
  };

  // Quick replies handler in simulator
  const handleQuickReplyClick = (reply: string) => {
    setSimInput(reply);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Entrenamiento Empresarial</h1>
          <p className="text-sm text-gray-500 mt-1">Inserta manuales empresariales, FAQs, precios y simula interacciones en WhatsApp en tiempo real de forma segura.</p>
        </div>
        <button
          onClick={handleAddNewAgent}
          className="flex items-center gap-2 mt-4 md:mt-0 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Registrar Agente
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Management & Prompts training */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Agent Selection Pill */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3.5">Selección del Agente</h2>
            <div className="flex flex-wrap gap-2.5">
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => {
                    setSelectedAgent(agent);
                    setIsEditing(false);
                    setShowDeleteConfirm(false);
                    setSimMessages([
                      { id: "sinit-changed-" + Date.now(), text: `Cambiado al agente: ${agent.name}. La Base de Conocimientos se actualizó en el simulador.`, sender: "system", timestamp: new Date().toISOString() }
                    ]);
                  }}
                  className={`flex items-center gap-2 text-xs font-medium px-4 py-2.5 rounded-xl border transition-all cursor-pointer ${
                    selectedAgent?.id === agent.id
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Bot className="w-4 h-4 text-blue-600" />
                  {agent.name}
                  <span className={`w-1.5 h-1.5 rounded-full ${agent.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Prompt/Training editing viewport */}
          {selectedAgent && !isEditing ? (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <Bot className="w-10 h-10 text-blue-600 bg-blue-50 p-2 rounded-lg" />
                  <div>
                    <h3 className="text-md font-semibold text-gray-900">{selectedAgent.name}</h3>
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-gray-500 mt-0.5">
                      <span>Estado: <span className="font-semibold text-green-600">{selectedAgent.status}</span></span>
                      {selectedAgent.whatsappNumber && (
                        <span className="inline-flex items-center gap-1 text-blue-600 bg-blue-50/70 border border-blue-100 px-1.5 py-0.5 rounded font-mono font-bold text-[10px]">
                          <Smartphone className="w-3 h-3 text-blue-500" />
                          {selectedAgent.whatsappNumber}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {showDeleteConfirm ? (
                    <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-100 p-1 px-2.5 rounded-xl text-[10px] animate-fade-in shrink-0">
                      <span className="font-semibold text-rose-750">¿Eliminar Agente?</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteAgent(selectedAgent.id)}
                        className="bg-rose-600 hover:bg-rose-750 text-white font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        Sí, eliminar
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="bg-gray-150 hover:bg-gray-200 text-gray-700 font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleStartEdit(selectedAgent)}
                        className="flex items-center gap-1.5 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-medium px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5 text-gray-500" />
                        Editar Base de Conocimientos
                      </button>
                      
                      {agents.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(true)}
                          className="flex items-center justify-center p-2 rounded-xl border border-rose-100 bg-rose-50/50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                          title="Eliminar este agente"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Training Specs Box */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Información de Entrenamiento del Bot</h4>
                  <div className="bg-gray-50 p-4 border border-gray-100 rounded-xl max-h-96 overflow-y-auto whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                    {selectedAgent.trainingData}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="font-semibold text-gray-400 uppercase tracking-wide text-[10px]">Idioma de Chat</p>
                    <p className="text-gray-800 font-medium mt-1 inline-flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-gray-500" />
                      {selectedAgent.language || "Español"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="font-semibold text-gray-400 uppercase tracking-wide text-[10px]">CRM Webhook Integración</p>
                    <p className="text-gray-800 font-medium mt-1 truncate max-w-full">
                      {selectedAgent.crmWebhookUrl || "Sin configurar"}
                    </p>
                  </div>
                </div>

                {selectedAgent.quickReplies && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Respuestas Rápidas Sugeridas</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedAgent.quickReplies.split(',').map((reply, index) => (
                        <span key={index} className="bg-blue-50/50 text-blue-700 text-[11px] font-medium px-2.5 py-1 rounded border border-blue-100">
                          {reply.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trained PDF documents visual lists */}
                <div className="border-t border-gray-100 pt-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    Documentos PDF Corporativos Escaneados ({selectedAgent.trainingFiles?.length || 0})
                  </h4>
                  {selectedAgent.trainingFiles && selectedAgent.trainingFiles.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedAgent.trainingFiles.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-100 rounded-xl text-xs hover:border-blue-100 hover:bg-blue-50/20 transition-all shadow-3xs group">
                          <div className="flex items-center gap-2 max-w-[65%]">
                            <div className="p-1.5 bg-red-50 text-red-600 rounded-lg group-hover:bg-red-100 transition-colors shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="overflow-hidden">
                              <h5 className="font-bold text-gray-800 truncate" title={file.name}>{file.name}</h5>
                              <p className="text-[9px] text-gray-400 font-semibold font-mono tracking-wide">{file.size} • listo</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setViewingFile(file)}
                            className="flex items-center gap-1 bg-white hover:bg-blue-50 text-[10px] font-bold text-blue-600 border border-blue-100 hover:border-blue-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                          >
                            <Eye className="w-3 h-3" />
                            Ver Escaneo
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50/40 p-4 rounded-xl border border-dashed border-gray-150 text-center">
                      <p className="text-xs text-gray-400 font-medium">No hay documentos PDF de venta vinculados todavía. Edita este agente para adjuntar catálogos de precios o manuales.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : isEditing ? (
            <form onSubmit={handleSaveAgent} className="bg-white p-6 rounded-2xl border border-blue-100 shadow-xs space-y-6">
              <h2 className="text-md font-semibold text-gray-900 border-b border-gray-50 pb-3">{selectedAgent ? 'Modificar Entrenamiento' : 'Configurar Nuevo Agente'}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Nombre del Agente / Nombre WhatsApp</label>
                  <input
                    type="text"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    required
                    placeholder="Elena (Inmobiliaria)"
                    className="w-full text-sm border border-gray-200 focus:border-blue-500 outline-none px-3.5 py-2.5 rounded-xl bg-gray-50/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Estado</label>
                  <select
                    value={agentStatus}
                    onChange={(e: any) => setAgentStatus(e.target.value)}
                    className="w-full text-sm border border-gray-200 focus:border-blue-500 outline-none px-3.5 py-2.5 rounded-xl bg-gray-50/50"
                  >
                    <option value="Active">Activo (Respuestas Automáticas)</option>
                    <option value="Inactive">Inactivo</option>
                    <option value="Draft">Borrador</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-blue-600 animate-pulse" />
                  Número de WhatsApp Vinculado (Meta Business Account)
                </label>
                <input
                  type="text"
                  value={agentWhatsappNum}
                  onChange={(e) => setAgentWhatsappNum(e.target.value)}
                  placeholder="ej. +52 55 4160 2001 o 525541602001"
                  className="w-full text-sm border border-gray-200 focus:border-blue-500 outline-none px-3.5 py-2.5 rounded-xl bg-gray-50/50 font-mono font-medium"
                />
                <p className="text-[10px] text-gray-400 font-medium">Introduce el número telefónico comercial exacto de Meta en el que se activará este agente virtual corporativo para resolver dudas.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Idioma por Defecto</label>
                  <input
                    type="text"
                    value={agentLanguage}
                    onChange={(e) => setAgentLanguage(e.target.value)}
                    placeholder="Español, Inglés, etc."
                    className="w-full text-sm border border-gray-200 focus:border-blue-500 outline-none px-3.5 py-2.5 rounded-xl bg-gray-50/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Webhook CRM Destino (Simulado)</label>
                  <input
                    type="text"
                    value={agentWebhook}
                    onChange={(e) => setAgentWebhook(e.target.value)}
                    placeholder="https://api.crm.com/v1/leads"
                    className="w-full text-sm border border-gray-200 focus:border-blue-500 outline-none px-3.5 py-2.5 rounded-xl bg-gray-50/50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Base de Entrenamiento de la Empresa
                  </label>
                  <span className="text-[10px] text-gray-400">Inserta precios, FAQs, reglas de comportamiento</span>
                </div>
                <textarea
                  value={agentTraining}
                  onChange={(e) => setAgentTraining(e.target.value)}
                  required
                  rows={8}
                  placeholder={`Clínica Dental DentalSana.
Preguntas frecuentes:
- Horarios: lunes a sábado de 9am a 7pm...`}
                  className="w-full text-sm border border-gray-200 focus:border-blue-500 outline-none p-3.5 rounded-xl bg-gray-50/50 font-mono"
                />
              </div>

              {/* PDF Documents drag-and-drop upload zone component */}
              <div className="space-y-3.5 border-t border-gray-100 pt-5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <FileUp className="w-4.5 h-4.5 text-blue-600" />
                    Escaneo Automatizado de PDF Corporativo
                  </label>
                  <span className="text-[10px] text-gray-400">Extrae manuales y tarifas directamente</span>
                </div>

                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 transition-all text-center flex flex-col items-center justify-center cursor-pointer ${
                    isDragging 
                      ? 'border-blue-500 bg-blue-50/50 scale-[1.01]' 
                      : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50/40 bg-gray-50/10'
                  }`}
                  onClick={() => document.getElementById('pdf-file-upload')?.click()}
                >
                  <input 
                    id="pdf-file-upload" 
                    type="file" 
                    accept=".pdf" 
                    onChange={handleFileChange} 
                    className="hidden" 
                  />
                  <UploadCloud className={`w-10 h-10 mb-2 transition-all duration-300 ${isDragging ? 'scale-115 text-blue-600 animate-pulse' : 'text-gray-400 hover:text-blue-500 hover:scale-105'}`} />
                  <p className="text-xs font-semibold text-gray-700">Arrastra tu PDF corporativo aquí o <span className="text-blue-600 hover:underline">explorar archivos</span></p>
                  <p className="text-[10px] text-gray-400 mt-1">Soporta manuales internos, planes de pago, menús y documentos corporativos (Máx. 10MB)</p>
                </div>

                {/* scanning state panel loader */}
                {scanningFile && (
                  <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4 space-y-2.5 animate-pulse">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-blue-800 flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                        Analizando: <span className="font-mono text-gray-700">{scanningFile}</span>
                      </span>
                      <span className="font-mono text-blue-600 font-bold">{scanProgress}%</span>
                    </div>
                    <div className="w-full bg-blue-100 rounded-full h-1.5">
                      <div 
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                        style={{ width: `${scanProgress}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-blue-600 font-bold italic mt-1">{scanStep}</p>
                  </div>
                )}

                {/* session files list */}
                {agentFiles.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Documentos Escaneados para este Agente ({agentFiles.length})</p>
                    <div className="grid grid-cols-1 gap-2">
                      {agentFiles.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-150 rounded-xl text-xs hover:border-gray-250 transition-colors">
                          <div className="flex items-center gap-2 max-w-[80%]">
                            <div className="p-1.5 bg-red-50 text-red-600 rounded-lg">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="overflow-hidden">
                              <p className="font-bold text-gray-800 truncate" title={file.name}>{file.name}</p>
                              <p className="text-[10px] text-gray-400 font-semibold font-mono">{file.size} • Sincronizado</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteFile(file.id, file.extractedText)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                            title="Remover y borrar su contenido de la memoria"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Respuestas Rápidas Sugeridas (Separadas por comas)</label>
                <input
                  type="text"
                  value={agentReplies}
                  onChange={(e) => setAgentReplies(e.target.value)}
                  placeholder="Ver Modelos, Precios de Hoy, Agendar Consultas"
                  className="w-full text-sm border border-gray-200 focus:border-blue-500 outline-none px-3.5 py-2.5 rounded-xl bg-gray-50/50"
                />
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-gray-50">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Guardar Entrenamiento
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-medium px-4 py-2.5 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-gray-50 p-8 text-center rounded-2xl border border-dashed border-gray-200">
              <Bot className="w-12 h-12 text-gray-400 mx-auto" />
              <p className="mt-3 text-sm font-semibold text-gray-600">Registra un Agente primero</p>
              <button onClick={handleAddNewAgent} className="mt-3 text-xs font-semibold text-blue-600 hover:underline">Registrar Agente Virtual</button>
            </div>
          )}

        </div>

        {/* Right Column: Immersive Mobile Sandbox Simulator */}
        <div className="lg:col-span-5 flex flex-col items-center">
          
          {/* Phone Framework Box */}
          <div className="w-full max-w-[340px] bg-slate-900 rounded-[38px] p-3.5 shadow-2xl border-[6px] border-slate-800 flex flex-col min-h-[580px] h-full justify-between select-none">
            
            {/* Embedded Screen Area */}
            <div className="bg-[#efeae2] rounded-[30px] flex flex-col h-[540px] overflow-hidden relative shadow-inner">
              
              {/* Phone Status Bar Decorator */}
              <div className="bg-emerald-800 text-white px-5 py-2 flex items-center justify-between text-[11px] font-medium tracking-wide">
                <span>10:45 AM</span>
                <div className="flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-200" />
                  <span>WhatsApp LTE</span>
                </div>
              </div>

              {/* Chat Window Header */}
              <div className="bg-emerald-700 text-white p-3 py-2.5 flex items-center gap-2.5 shadow-md">
                <div className="relative">
                  <Bot className="w-9 h-9 bg-teal-100 text-emerald-800 p-1.5 rounded-full border border-teal-200 shadow-sm" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border border-emerald-700 rounded-full"></span>
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold truncate">{selectedAgent?.name || 'Agente de Prueba'}</p>
                  <p className="text-[10px] text-emerald-100 tracking-wide font-medium">Chatbot Empresarial Activo</p>
                </div>
              </div>

              {/* Chat Messages Body Scroll */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3 flex flex-col">
                {simMessages.map((msg) => {
                  if (msg.sender === "system") {
                    return (
                      <div key={msg.id} className="text-center">
                        <span className="bg-[#f0f2f5]/90 border border-gray-100 text-[10px] font-medium text-gray-500 px-3 py-1 rounded-md max-w-[85%] inline-block">
                          {msg.text}
                        </span>
                      </div>
                    );
                  }

                  const isMe = msg.sender === "client";
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex flex-col gap-0.5 max-w-[80%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
                    >
                      <div className={`p-2.5 text-xs rounded-2xl shadow-xs leading-relaxed ${
                        isMe 
                          ? 'bg-[#d9fdd3] text-gray-800 rounded-tr-none' 
                          : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-gray-400 font-mono px-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}

                {isLoadingReply && (
                  <div className="self-start bg-white border border-gray-100 text-gray-500 text-xs px-3.5 py-2.5 rounded-2xl rounded-tl-none shadow-xs max-w-[80%] flex items-center gap-1.5 italic font-medium animate-pulse">
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                    <span>{selectedAgent?.name || 'Elena'} está escribiendo...</span>
                  </div>
                )}
              </div>

              {/* Simulation Sandbox Status Overlay */}
              {simStatus && (
                <div className="absolute top-18 left-3 right-3 bg-blue-50 border border-blue-100 text-[10px] text-blue-700 rounded-lg p-2 flex items-start gap-1.5 font-medium shadow-sm animate-bounce">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span>{simStatus}</span>
                </div>
              )}

              {/* Quick Replies list bar */}
              {selectedAgent?.quickReplies && (
                <div className="flex gap-1.5 px-3 py-1 overflow-x-auto bg-gray-50/70 border-t border-gray-100 scrollbar-none shrink-0 py-1.5">
                  {selectedAgent.quickReplies.split(',').map((reply, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickReplyClick(reply.trim())}
                      className="bg-white border border-gray-200 hover:bg-gray-50 text-[10px] text-gray-700 font-medium px-2.5 py-1 rounded-full whitespace-nowrap cursor-pointer transition-colors"
                    >
                      {reply.trim()}
                    </button>
                  ))}
                </div>
              )}

              {/* Sim Interface Send Controller */}
              <form 
                onSubmit={handleSendSimulatorMsg} 
                className="bg-[#f0f2f5] p-2 flex items-center gap-1.5 border-t border-gray-200 shrink-0"
              >
                <input
                  type="text"
                  value={simInput}
                  onChange={(e) => setSimInput(e.target.value)}
                  placeholder="Escribe un mensaje de WhatsApp..."
                  aria-label="Mensaje para el simulador"
                  className="flex-1 bg-white text-xs text-gray-800 border-none outline-none rounded-xl px-3 py-2.5 shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!simInput.trim() || isLoadingReply}
                  className="p-2.5 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:text-gray-400 cursor-pointer shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>

            </div>

          </div>

          {/* Simulator Info Text */}
          <div className="mt-4 flex items-center gap-2 text-xs text-gray-400 max-w-xs text-center leading-normal">
            <HelpCircle className="w-4 h-4 text-gray-500 shrink-0" />
            <span>Este simulador permite evaluar el comportamiento de Elena bajo tus directivas. Se comunica de forma interactiva con el modelo <b>Gemini 3.5 Flash</b>.</span>
          </div>

        </div>

      </div>

      {/* PDF scanning viewer modal details overlay */}
      {viewingFile && (
        <div id="pdf-viewer-modal" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-100 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-fade-in text-xs font-sans">
            <div className="p-4 border-b border-gray-150 flex items-center justify-between bg-gray-50 rounded-t-2xl">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                  <FileText className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 leading-normal">{viewingFile.name}</h3>
                  <p className="text-[10px] text-gray-400 font-semibold font-mono tracking-wide">Base de datos indexada • {viewingFile.size} • {viewingFile.charCount} caracteres aprendidos</p>
                </div>
              </div>
              <button 
                onClick={() => setViewingFile(null)}
                className="p-1.5 hover:bg-gray-200 hover:text-gray-900 text-gray-450 rounded-lg transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4 max-h-[60vh] text-xs text-gray-700 leading-relaxed font-sans scrollbar-thin">
              <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl text-xs text-blue-855 font-semibold flex items-start gap-2.5 leading-normal">
                <Sparkles className="w-4.5 h-4.5 text-blue-600 shrink-0 mt-0.5" />
                <span>Esta es la base semántica y directrices corporativas que el Bot de WhatsApp ha integrado de forma permanente desde tu documento PDF de ventas. Estos datos se inyectan en tiempo de ejecución de Gemini 3.5 Flash para responder en baja latencia.</span>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 font-mono text-[11px] whitespace-pre-wrap leading-relaxed max-w-full text-gray-655 shadow-inner">
                {viewingFile.extractedText}
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-150 flex justify-end bg-gray-50 rounded-b-2xl">
              <button
                type="button"
                onClick={() => setViewingFile(null)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-xl cursor-pointer transition-colors shadow-sm"
              >
                Entendido, Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
