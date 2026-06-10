import React, { useState } from 'react';
import { 
  MessageSquare, 
  User, 
  Clock, 
  Send, 
  CheckCircle, 
  CornerDownRight, 
  UserCheck, 
  ShieldAlert, 
  Activity 
} from 'lucide-react';
import { Conversation, Lead, Agent, Message } from '../types';

interface ConversationLogsProps {
  conversations: Conversation[];
  leads: Lead[];
  agents: Agent[];
  onSaveConversations: (newConvs: Conversation[]) => void;
  onAddNotification: (title: string, msg: string, type: 'urgent' | 'lead' | 'info') => void;
}

export default function ConversationLogs({ 
  conversations, 
  leads, 
  agents, 
  onSaveConversations,
  onAddNotification 
}: ConversationLogsProps) {
  const [selectedConvId, setSelectedConvId] = useState<string | null>(conversations[0]?.id || null);
  const [replyText, setReplyText] = useState('');

  const activeConv = conversations.find(c => c.id === selectedConvId);
  const activeLead = leads.find(l => l.id === activeConv?.leadId);
  const activeAgentName = agents.find(a => a.id === activeConv?.agentId)?.name || 'Agente IA';

  const handleIntervene = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConv || !replyText.trim()) return;

    const newMsg: Message = {
      id: "manual-" + Date.now(),
      text: replyText,
      sender: "agent",
      timestamp: new Date().toISOString()
    };

    const updatedConvs = conversations.map(c => {
      if (c.id === activeConv.id) {
        return {
          ...c,
          lastMessageText: replyText,
          lastMessageTime: new Date().toISOString(),
          status: 'Open' as const, // clear PendingHuman flag upon intervention
          messages: [...c.messages, newMsg]
        };
      }
      return c;
    });

    onSaveConversations(updatedConvs);
    setReplyText('');
    onAddNotification(
      "Intervención Humana", 
      `Mensaje enviado manualmente por WhatsApp a ${activeLead?.name || 'Cliente'}`, 
      "info"
    );
  };

  const handleToggleStatus = (status: Conversation['status']) => {
    if (!activeConv) return;
    const updatedConvs = conversations.map(c => {
      if (c.id === activeConv.id) {
        return { ...c, status };
      }
      return c;
    });
    onSaveConversations(updatedConvs);
    onAddNotification(
      "Estado de Chat Modificado", 
      `Conversación con ${activeLead?.name} marcada como ${status}`, 
      "info"
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Historial Centralizado de Chats</h1>
          <p className="text-sm text-gray-500 mt-1">Supervisa transcripciones, monitorea respuestas automáticas e interviene como asesor humano en WhatsApp.</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono bg-blue-50 border border-blue-100 text-blue-700 px-3.5 py-1.5 rounded-full mt-3 md:mt-0">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          Conexión WhatsApp Web: Activa
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column: Conversation threads list */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="p-4 bg-gray-50/50 border-b border-gray-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Hilos Activos</h3>
          </div>

          <div className="divide-y divide-gray-50 max-h-[460px] overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-10 text-center text-gray-400">
                <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                Ningún chat registrado.
              </div>
            ) : (
              conversations.map((conv) => {
                const lead = leads.find(l => l.id === conv.leadId);
                const isSelected = conv.id === selectedConvId;
                const isPending = conv.status === 'PendingHuman';

                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors flex flex-col gap-1.5 border-l-4 cursor-pointer focus:outline-none ${
                      isSelected 
                        ? 'bg-blue-50/30 border-blue-500' 
                        : isPending 
                          ? 'border-rose-400 bg-rose-50/10' 
                          : 'border-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className="font-semibold text-xs text-gray-900">{lead?.name || "Cliente Anónimo"}</span>
                      <span className="text-[9px] font-mono text-gray-400">
                        {new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-500 truncate w-full italic">
                      "{conv.lastMessageText}"
                    </p>

                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span className="text-[9px] px-2 py-0.5 font-sans font-semibold rounded-full bg-slate-50 text-slate-500 border border-slate-100">
                        Bot: {agents.find(a => a.id === conv.agentId)?.name.split(' ')[0] || "Asistente IA"}
                      </span>
                      {isPending && (
                        <span className="text-[8px] uppercase tracking-wider font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-rose-100 animate-pulse">
                          <ShieldAlert className="w-2.5 h-2.5 text-rose-500" />
                          Urgente
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right column: Chat transcript & reply actions */}
        <div className="lg:col-span-8 space-y-6">
          {activeConv ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden flex flex-col justify-between min-h-[460px]">
              
              {/* Active Header */}
              <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-900">{activeLead?.name || "Cliente Anónimo"}</h3>
                    <p className="text-[10px] text-gray-400 leading-normal flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-300" />
                      Sesión coordinada con: <b>{activeAgentName}</b>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-gray-400">Gestionar Estado:</span>
                  <button 
                    onClick={() => handleToggleStatus('Open')}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-l-md transition-colors border border-r-0 cursor-pointer ${
                      activeConv.status === 'Open' 
                        ? 'bg-blue-50/50 border-blue-200 text-blue-700' 
                        : 'bg-white hover:bg-gray-50 border-gray-100 text-gray-400'
                    }`}
                  >
                    Abierto
                  </button>
                  <button 
                    onClick={() => handleToggleStatus('PendingHuman')}
                    className={`px-2.5 py-1 text-[10px] font-bold transition-colors border cursor-pointer border-r-0 ${
                      activeConv.status === 'PendingHuman' 
                        ? 'bg-rose-50/50 border-rose-200 text-rose-700 animate-pulse' 
                        : 'bg-white hover:bg-gray-50 border-gray-100 text-gray-400'
                    }`}
                  >
                    Atención Humana
                  </button>
                  <button 
                    onClick={() => handleToggleStatus('Closed')}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-r-md transition-colors border cursor-pointer ${
                      activeConv.status === 'Closed' 
                        ? 'bg-emerald-50/50 border-emerald-200 text-emerald-700' 
                        : 'bg-white hover:bg-gray-50 border-gray-100 text-gray-400'
                    }`}
                  >
                    Cerrado
                  </button>
                </div>
              </div>

              {/* Message transcript list body */}
              <div className="p-6 bg-slate-50/50 space-y-4 max-h-[320px] overflow-y-auto flex-1 flex flex-col justify-end">
                <div className="space-y-4 overflow-y-auto">
                  {activeConv.messages.map((msg) => {
                    const isClient = msg.sender === 'client';
                    const isSystem = msg.sender === 'system';

                    if (isSystem) {
                      return (
                        <div key={msg.id} className="text-center my-2">
                          <span className="bg-gray-200/60 text-gray-500 font-mono text-[10px] px-3 py-1 rounded-md border border-gray-100 inline-block">
                            {msg.text}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div 
                        key={msg.id} 
                        className={`flex flex-col gap-1 max-w-[80%] ${isClient ? 'self-start' : 'self-end items-end'}`}
                      >
                        <div className={`p-3 text-xs leading-relaxed rounded-2xl shadow-xs ${
                          isClient 
                            ? 'bg-white text-gray-800 rounded-tl-none border border-gray-100' 
                            : 'bg-blue-600 text-white rounded-tr-none'
                        }`}>
                          {msg.text}
                        </div>
                        <span className="text-[9px] text-gray-400 px-1 font-mono">
                          {isClient ? 'Cliente' : 'Tú'} - {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom message response form */}
              <form onSubmit={handleIntervene} className="p-3 bg-gray-50/70 border-t border-gray-100 flex gap-2">
                <input
                  type="text"
                  placeholder={`Responder a ${activeLead?.name || 'Cliente'} (Intervenir y responder vía WhatsApp)...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 text-xs border border-gray-200 focus:border-blue-500 outline-none px-3.5 py-3 rounded-xl bg-white shadow-xs"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-3 rounded-xl transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 text-gray-400 flex flex-col items-center justify-center min-h-[300px]">
              <MessageSquare className="w-12 h-12 text-gray-300 mb-2" />
              <p className="font-semibold text-gray-600">Ningún chat seleccionado</p>
              <p className="text-xs text-gray-400 max-w-sm mt-1">Selecciona uno de los hilos conversacionales activos a la izquierda para supervisar y responder.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
