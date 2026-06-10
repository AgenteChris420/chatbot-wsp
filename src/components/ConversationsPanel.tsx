import React, { useState } from 'react';
import { 
  MessageSquare, 
  Search, 
  User, 
  Bot, 
  Send, 
  UserPlus, 
  ShieldAlert, 
  Maximize, 
  CheckCheck,
  AlertTriangle,
  Users,
  CheckCircle2,
  Lock,
  PhoneCall
} from 'lucide-react';
import { Conversation, Lead, Agent, Message } from '../types';

interface ConversationsPanelProps {
  conversations: Conversation[];
  leads: Lead[];
  agents: Agent[];
  onSaveConversations: (newConvs: Conversation[]) => void;
  onSaveLeads: (newLeads: Lead[]) => void;
  onAddNotification: (title: string, msg: string, type: 'urgent' | 'lead' | 'info') => void;
}

export default function ConversationsPanel({ 
  conversations, 
  leads, 
  agents, 
  onSaveConversations, 
  onSaveLeads, 
  onAddNotification 
}: ConversationsPanelProps) {
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(conversations[0] || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userReplyText, setUserReplyText] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);

  // Filter conversations list on search
  const filteredConversations = conversations.filter(conv => {
    const lead = leads.find(l => l.id === conv.leadId);
    if (!lead) return false;
    return lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           lead.phone.includes(searchTerm) || 
           conv.lastMessageText.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Current conversation context
  const currentLead = selectedConv ? leads.find(l => l.id === selectedConv.leadId) : null;
  const currentAgent = selectedConv ? agents.find(a => a.id === selectedConv.agentId) : null;

  // Toggle Human Takeover / Intervention status
  const handleToggleTakeover = () => {
    if (!selectedConv) return;
    const isNowPendingHuman = selectedConv.status !== 'PendingHuman';
    
    const updatedConvs = conversations.map(c => c.id === selectedConv.id ? {
      ...c,
      status: isNowPendingHuman ? 'PendingHuman' as const : 'Open' as const
    } : c);

    onSaveConversations(updatedConvs);
    const target = updatedConvs.find(c => c.id === selectedConv.id)!;
    setSelectedConv(target);

    if (isNowPendingHuman) {
      onAddNotification(
        "Intervención Humana Activada", 
        `Chat de ${currentLead?.name} pausado temporalmente para el chatbot. Asesor tomando el control`, 
        "urgent"
      );
    } else {
      onAddNotification(
        "Control IA Reestablecido", 
        `Chatbot activado nuevamente para responder de forma automática a ${currentLead?.name}`, 
        "info"
      );
    }
  };

  // Trigger outbound / test message inside conversation panel
  const handleSendMessage = async (e: React.FormEvent, senderType: 'agent' | 'client') => {
    e.preventDefault();
    if (!userReplyText.trim() || !selectedConv || !currentLead) return;

    const newMessage: Message = {
      id: "msg-" + Date.now(),
      text: userReplyText,
      sender: senderType,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...selectedConv.messages, newMessage];
    
    let updatedConvs = conversations.map(c => c.id === selectedConv.id ? {
      ...c,
      lastMessageText: userReplyText,
      lastMessageTime: new Date().toISOString(),
      messages: updatedMessages
    } : c);

    onSaveConversations(updatedConvs);
    let activeConv = updatedConvs.find(c => c.id === selectedConv.id)!;
    setSelectedConv(activeConv);
    setUserReplyText('');

    // If client sent a message and AI is in control ('Open' or 'PendingHuman'), let's trigger auto AI answer from the server
    if (senderType === 'client' && selectedConv.status === 'Open') {
      setIsAnswering(true);
      const startTime = Date.now();
      const clientMessageText = newMessage.text;
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: clientMessageText,
            agentId: selectedConv.agentId,
            conversationHistory: updatedMessages
          })
        });

        if (response.ok) {
          const data = await response.json();
          const botResponseMsg: Message = {
            id: "msg-bot-" + Date.now(),
            text: data.response,
            sender: "agent",
            timestamp: new Date().toISOString()
          };

          // Generate simulated typing delay of 5 to 10 seconds for realistic user pacing
          const randomDelay = Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000;
          const elapsed = Date.now() - startTime;
          if (elapsed < randomDelay) {
            await new Promise(resolve => setTimeout(resolve, randomDelay - elapsed));
          }

          const furtherMessages = [...updatedMessages, botResponseMsg];
          updatedConvs = conversations.map(c => c.id === selectedConv.id ? {
            ...c,
            lastMessageText: data.response,
            lastMessageTime: new Date().toISOString(),
            messages: furtherMessages
          } : c);

          onSaveConversations(updatedConvs);
          setSelectedConv(updatedConvs.find(c => c.id === selectedConv.id)!);

          // Check if lead data captured simulator
          const capturesLeadInfo = data.response.toLowerCase().includes("agendad") || data.response.toLowerCase().includes("confirmad");
          if (capturesLeadInfo && currentLead.status !== 'Cita Agendada') {
            const updatedLeads = leads.map(l => l.id === currentLead.id ? {
              ...l,
              status: 'Cita Agendada' as const,
              notes: l.notes + `\n[Update] Cita detectada y agendada automáticamente por chatbot ${agents.find(a => a.id === selectedConv?.agentId)?.name || 'Elena'}.`
            } : l);
            onSaveLeads(updatedLeads);
            onAddNotification("Cita Agendada WhatsApp", `El bot agendó una cita para el cliente ${currentLead.name}`, "lead");
          }
        }
      } catch (err) {
        console.error("Auto responder failed:", err);
      } finally {
        setIsAnswering(false);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Area */}
      <div className="border-b border-gray-100 pb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Consola Central de Conversaciones</h1>
        <p className="text-sm text-gray-500 mt-1">Supervisa y audita las conversaciones históricas completas de cada cliente potencial. Intervén con control manual con un solo clic.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white border border-gray-100 rounded-3xl overflow-hidden min-h-[580px] shadow-sm">
        
        {/* Left Side: Chats Directory */}
        <div className="lg:col-span-4 border-r border-gray-100 flex flex-col justify-between h-full bg-gray-50/10">
          <div className="p-4 border-b border-gray-50 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">Canal de Chat WhatsApp</h2>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar chats..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs border border-gray-100 bg-white shadow-3xs rounded-xl py-2.5 pl-9 pr-3.5 outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {/* List of chat threads */}
          <div className="flex-1 overflow-y-auto max-h-[460px] divide-y divide-gray-50">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs font-medium">No se hallaron hilos de chat.</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const lead = leads.find(l => l.id === conv.leadId);
                const isSelected = selectedConv?.id === conv.id;
                if (!lead) return null;

                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConv(conv)}
                    className={`w-full p-4 flex gap-3 text-left transition-colors items-start cursor-pointer border-l-3 ${
                      isSelected 
                        ? 'bg-blue-50/50 border-blue-600' 
                        : 'border-transparent hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0 border border-gray-200">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                    
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-gray-900 truncate">{lead.name}</p>
                        <span className="text-[9px] font-mono text-gray-400">
                          {new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 truncate">{conv.lastMessageText}</p>
                      
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[9px] font-mono text-gray-400">{lead.phone}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                          conv.status === 'PendingHuman'
                            ? 'bg-rose-50 text-rose-700 font-bold border border-rose-100'
                            : 'bg-green-50 text-green-700 border border-green-100'
                        }`}>
                          {conv.status === 'PendingHuman' ? 'Soporte Humano' : 'Automatizado IA'}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Middle/Center Column: Chat Window and Bubbles */}
        {selectedConv && currentLead ? (
          <div className="lg:col-span-8 flex flex-col justify-between h-[580px] bg-[#efeae2]/10 relative">
            
            {/* Thread Header bar */}
            <div className="p-4 bg-white border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-full text-blue-600">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-900">{currentLead.name}</h3>
                  <p className="text-[10px] text-gray-400 font-medium">WhatsApp Canal: {currentLead.phone} | Agente: <span className="font-semibold text-gray-600">{currentAgent?.name}</span></p>
                </div>
              </div>

              {/* Human Takeover Trigger Button */}
              <button
                onClick={handleToggleTakeover}
                className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl border transition-all cursor-pointer ${
                  selectedConv.status === 'PendingHuman'
                    ? 'bg-rose-600 text-white border-rose-600 hover:bg-rose-700'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50/80 hover:border-gray-300'
                }`}
              >
                <ShieldAlert className="w-4 h-4 shrink-0" />
                {selectedConv.status === 'PendingHuman' ? 'Detener Intervención (Soporte)' : 'Intervenir Chat (Manual)'}
              </button>
            </div>

            {/* Bubble Thread Panel Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[400px]">
              {selectedConv.messages.map((message) => {
                const isAgent = message.sender === 'agent';
                const isSystem = message.sender === 'system';

                if (isSystem) {
                  return (
                    <div key={message.id} className="text-center font-sans tracking-wide my-2">
                      <span className="bg-gray-100 border border-gray-200/50 text-[10px] font-medium text-gray-500 px-3 py-1 rounded inline-block">
                        {message.text}
                      </span>
                    </div>
                  );
                }

                return (
                  <div 
                    key={message.id} 
                    className={`flex flex-col max-w-[70%] gap-0.5 ${isAgent ? 'self-end items-end' : 'self-start items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 text-[9px] text-gray-400 px-1 font-mono">
                      {isAgent ? (
                        <>
                          <span className="font-semibold text-blue-600 flex items-center gap-0.5">
                            <Bot className="w-3 h-3" />
                            Elena Chatbot
                          </span>
                        </>
                      ) : (
                        <span className="font-semibold text-gray-600">{currentLead.name}</span>
                      )}
                      <span>• {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    
                    <div className={`p-3 text-xs leading-relaxed rounded-2xl ${
                      isAgent 
                        ? 'bg-blue-600 text-white rounded-tr-none shadow-sm' 
                        : 'bg-white text-gray-800 rounded-tl-none border border-gray-100 shadow-3xs'
                    }`}>
                      {message.text}
                    </div>
                  </div>
                );
              })}

              {isAnswering && (
                <div className="self-end bg-blue-50 border border-blue-100 text-blue-700 text-xs px-3.5 py-2.5 rounded-2xl rounded-tr-none shadow-xs max-w-[60%] flex items-center gap-1.5 italic font-medium animate-pulse">
                  <Bot className="w-4 h-4 text-blue-600 animate-spin" />
                  <span>{agents.find(a => a.id === selectedConv?.agentId)?.name || 'Elena'} está escribiendo una respuesta...</span>
                </div>
              )}
            </div>

            {/* Simulated Chat Input Box Controls */}
            <div className="p-4 bg-gray-50/70 border-t border-gray-100 flex flex-col gap-2 shrink-0">
              {selectedConv.status === 'PendingHuman' && (
                <div className="flex items-center gap-2 bg-rose-50 text-rose-700 border border-rose-100/50 text-[10px] p-2 rounded-lg font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>Has tomado el control manual de este chat. El bot no responderá automáticamente hasta que detengas la intervención.</span>
                </div>
              )}

              {/* Toggle option select to simulate WHOM sends the message */}
              <div className="flex items-center justify-between text-xs gap-4">
                <span className="text-[11px] text-gray-500">¿Quién envía el mensaje de prueba?</span>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => handleSendMessage(e, 'client')}
                    disabled={!userReplyText.trim() || isAnswering}
                    className="flex items-center gap-1 text-[10px] font-bold border border-gray-300 hover:bg-gray-150 px-2.5 py-1 rounded-lg text-gray-700 cursor-pointer transition-colors"
                    title="Simular cliente escribiendo por su celular"
                  >
                    <User className="w-3.5 h-3.5" />
                    Enviar como Cliente
                  </button>
                  <button
                    onClick={(e) => handleSendMessage(e, 'agent')}
                    disabled={!userReplyText.trim() || isAnswering}
                    className="flex items-center gap-1 text-[10px] font-bold bg-blue-600 text-white hover:bg-blue-700 px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
                    title="Simular respuesta manual de asesor humano"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Enviar como Asesor
                  </button>
                </div>
              </div>

              {/* Primary Typing input field */}
              <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 py-1 mt-1.5 shadow-2xs">
                <input
                  type="text"
                  value={userReplyText}
                  onChange={(e) => setUserReplyText(e.target.value)}
                  placeholder="Redacta un mensaje de prueba... Escribe algo como 'Quiero agendar cita' para probar la IA."
                  className="flex-1 bg-transparent text-xs text-gray-800 border-none outline-none py-2 px-1"
                />
              </div>
            </div>

          </div>
        ) : (
          <div className="lg:col-span-8 flex flex-col items-center justify-center p-10 h-[580px] text-gray-400">
            <MessageSquare className="w-12 h-12 text-gray-200 mb-3" />
            <p className="text-sm font-semibold text-gray-600">Selecciona una conversación del histórico</p>
            <p className="text-xs text-gray-400 mt-1">Podrás revisar transcripciones, intervenciones y depurar respuestas.</p>
          </div>
        )}

      </div>
    </div>
  );
}
