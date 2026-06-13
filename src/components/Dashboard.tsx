import React from 'react';
import { 
  Users, 
  MessageSquare, 
  Clock, 
  Calendar, 
  CheckCircle, 
  ArrowUpRight, 
  Percent, 
  Bot, 
  ShieldCheck 
} from 'lucide-react';
import { Lead, Agent, Conversation, Appointment } from '../types';

interface DashboardProps {
  leads: Lead[];
  agents: Agent[];
  conversations: Conversation[];
  appointments: Appointment[];
}

export default function Dashboard({ leads, agents, conversations, appointments }: DashboardProps) {
  // Compute metric calculations
  const totalLeads = leads.length;
  const totalConversations = conversations.reduce((acc, c) => acc + c.messages.length, 0);
  const activeAgents = agents.filter(a => a.status === 'Active').length;
  const scheduledCount = appointments.filter(a => a.status === 'Agendada').length;
  
  // Calculate lead conversion rate (%)
  const qualifiedLeads = leads.filter(l => l.status === 'Cita Agendada' || l.status === 'Especial').length;
  const conversionRate = totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0;
  
  // Status breakdown
  const statusCounts = leads.reduce((acc: { [key: string]: number }, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, { "Nuevo": 0, "Contactado": 0, "Cita Agendada": 0, "Especial": 0, "Perdido": 0 });

  // Mock static historical dates of chatbot activities
  const recentActivity = [
    { time: "Hace 10 min", event: "Elena respondió consulta sobre Palermo Suites", status: "Auto" },
    { time: "Hace 22 min", event: "Elena capturó datos de contacto de Sofía", status: "Lead" },
    { time: "Hace 1 hora", event: "Alerta Urgente de inactividad enviada a Supervisor", status: "Urgente" },
    { time: "Hace 3 horas", event: "Sincronización de Google Calendar exitosa", status: "System" }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner (Minimalist Welcome) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Métricas y Rendimiento</h1>
          <p className="text-sm text-gray-500 mt-1">Supervisa la actividad, eficiencia de conversión e interacciones de tus agentes en tiempo real.</p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0 text-xs font-mono bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-100">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Conexión en Tiempo Real Activa
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between hover:border-gray-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Conversaciones Totales</span>
            <div className="p-2.5 bg-gray-50 rounded-xl text-gray-600">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-semibold font-mono tracking-tight text-gray-900">
              {totalConversations}
            </span>
            <div className="flex items-center gap-1 mt-1.5 text-xs text-green-600">
              <span className="font-semibold">+18.2%</span>
              <span className="text-gray-400">vs semana anterior</span>
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between hover:border-gray-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Clientes Potenciales (Leads)</span>
            <div className="p-2.5 bg-gray-50 rounded-xl text-gray-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-semibold font-mono tracking-tight text-gray-900">
              {totalLeads}
            </span>
            <div className="flex items-center gap-1 mt-1.5 text-xs text-green-600">
              <span className="font-semibold">+8.4%</span>
              <span className="text-gray-400">hoy vía WhatsApp</span>
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between hover:border-gray-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Tasa de Conversión (Engaged)</span>
            <div className="p-2.5 bg-gray-50 rounded-xl text-gray-600">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-semibold font-mono tracking-tight text-gray-900">
              {conversionRate}%
            </span>
            <div className="flex items-center gap-1 mt-1.5 text-xs text-green-600">
              <span className="font-semibold">Alto Rendimiento</span>
              <span className="text-gray-400">citas capturadas</span>
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between hover:border-gray-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Citas de Calendario</span>
            <div className="p-2.5 bg-gray-50 rounded-xl text-gray-600">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-semibold font-mono tracking-tight text-gray-900">
              {scheduledCount}
            </span>
            <div className="flex items-center gap-1 mt-1.5 text-xs text-blue-600">
              <span className="font-semibold">Google & Outlook</span>
              <span className="text-gray-400">activas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Charts & State Distribution Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SVG Lead Funnel Progress */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-md font-semibold text-gray-900">Embudo del Chatbot en Tiempo Real</h3>
              <p className="text-xs text-gray-500">Proporción de clientes potenciales según su avance conversational.</p>
            </div>
            <div className="p-1 px-2.5 text-[10px] uppercase tracking-wider font-mono font-bold bg-gray-50 rounded text-gray-600">
              Análisis Visual
            </div>
          </div>

          <div className="space-y-4">
            {Object.keys(statusCounts).map((status) => {
              const count = statusCounts[status];
              const percent = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
              let color = "bg-gray-400";
              if (status === "Nuevo") color = "bg-blue-500";
              if (status === "Contactado") color = "bg-blue-400";
              if (status === "Cita Agendada") color = "bg-green-500";
              if (status === "Especial") color = "bg-emerald-500";
              if (status === "Perdido") color = "bg-rose-400";

              return (
                <div key={status} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-700 flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                      {status}
                    </span>
                    <span className="font-mono text-gray-500 font-medium">
                      {count} ({Math.round(percent)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${color} transition-all duration-1000`} 
                      style={{ width: `${percent || 2}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-gray-50 mt-6 pt-5 text-center">
            <div>
              <p className="text-xs text-gray-400">Velocidad Respuesta</p>
              <p className="text-lg font-semibold font-mono text-gray-800 mt-1">~1.2s</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Disponibilidad</p>
              <p className="text-lg font-semibold font-mono text-green-600 mt-1">99.98%</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Precisión IA</p>
              <p className="text-lg font-semibold font-mono text-gray-800 mt-1">97.4%</p>
            </div>
          </div>
        </div>

        {/* Live System Log & Audits */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-md font-semibold text-gray-900">Monitoreo del Sistema</h3>
            </div>
            <p className="text-xs text-gray-500 mb-5">Operatividad en vivo y transferencias de chats de WhatsApp.</p>
            
            <div className="space-y-4">
              {recentActivity.map((act, i) => (
                <div key={i} className="flex gap-3 justify-between items-start text-xs border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                  <div className="space-y-0.5">
                    <p className="font-medium text-gray-800">{act.event}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{act.time}</p>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 font-mono font-medium rounded-full ${
                    act.status === 'Urgente' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                    act.status === 'Lead' ? 'bg-green-50 text-green-700 border border-green-100' :
                    act.status === 'Auto' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                    'bg-gray-50 text-gray-600 border border-gray-200'
                  }`}>
                    {act.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 mt-5 text-[11px] text-gray-500 space-y-1.5 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-gray-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-800">Protección Cortafuegos</p>
              <p>Encriptación SSL y cifrado de punta a punta. Simulación de Integración API CRM lista.</p>
            </div>
          </div>
        </div>

      </div>

      {/* Integration details cards */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Bot className="w-10 h-10 text-blue-600 bg-blue-50 p-2.5 rounded-xl border border-blue-100" />
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Sincronización Escalable a Sistemas de Producción</h4>
            <p className="text-xs text-gray-500">Este panel simula llamadas en baja latencia. Puedes exportar informes detallados de clientes capturados a CSV.</p>
          </div>
        </div>
        <div className="text-xs font-mono text-gray-400">
          Versión de API: v1.8.4-stable
        </div>
      </div>
    </div>
  );
}
