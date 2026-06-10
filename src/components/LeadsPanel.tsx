import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Star, 
  ExternalLink, 
  Database,
  Edit,
  Check,
  AlertCircle,
  Clock,
  Plus,
  Trash,
  Phone,
  Mail,
  FileSpreadsheet
} from 'lucide-react';
import { Lead, Agent } from '../types';

interface LeadsPanelProps {
  leads: Lead[];
  agents: Agent[];
  onSaveLeads: (newLeads: Lead[]) => void;
  onAddNotification: (title: string, msg: string, type: 'urgent' | 'lead' | 'info') => void;
}

export default function LeadsPanel({ leads, agents, onSaveLeads, onAddNotification }: LeadsPanelProps) {
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [scoreFilter, setScoreFilter] = useState<number | 'All'>('All');

  // Edit / Form states
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formStatus, setFormStatus] = useState<Lead['status']>('Nuevo');
  const [formNotes, setFormNotes] = useState('');
  const [formScore, setFormScore] = useState<number>(3);
  const [formAgent, setFormAgent] = useState('');

  // CRM simulation feedback state
  const [crmLog, setCrmLog] = useState<{ [leadId: string]: { status: string; data?: any; error?: string } }>({});
  const [isPushingCrm, setIsPushingCrm] = useState<string | null>(null);

  // Filter leads based on inputs
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          lead.phone.includes(searchTerm) || 
                          lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' ? true : lead.status === statusFilter;
    const matchesScore = scoreFilter === 'All' ? true : lead.score === Number(scoreFilter);

    return matchesSearch && matchesStatus && matchesScore;
  });

  // Export to CSV functionality
  const handleExportCSV = () => {
    try {
      if (filteredLeads.length === 0) {
        alert("No hay leads disponibles para exportar con los filtros seleccionados.");
        return;
      }

      // Create CSV headers
      const headers = ["ID", "Nombre", "Telefono", "Email", "Estado", "Clasificacion (Estrellas)", "Notas", "Fecha de Registro", "ID de Agente"];
      
      // Map data to CSV row strings
      const rows = filteredLeads.map(lead => [
        `"${lead.id}"`,
        `"${lead.name.replace(/"/g, '""')}"`,
        `"${lead.phone}"`,
        `"${lead.email}"`,
        `"${lead.status}"`,
        lead.score,
        `"${(lead.notes || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
        `"${lead.timestamp}"`,
        `"${lead.agentId}"`
      ]);

      // Combine structure
      const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
      // Download blob link trigger
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `whatsapp_leads_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      onAddNotification("Informe CSV Exportado", `Se descargaron ${filteredLeads.length} leads en formato CSV para análisis posterior`, "info");
    } catch (err: any) {
      console.error(err);
      alert("Error al descargar el archivo: " + err.message);
    }
  };

  // Launch editing modal/form
  const handleStartEdit = (lead: Lead) => {
    setEditingLead(lead);
    setFormName(lead.name);
    setFormPhone(lead.phone);
    setFormEmail(lead.email);
    setFormStatus(lead.status);
    setFormNotes(lead.notes);
    setFormScore(lead.score);
    setFormAgent(lead.agentId);
  };

  // Save changes to lead
  const handleSaveLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;

    const updatedLeads = leads.map(l => l.id === editingLead.id ? {
      ...l,
      name: formName,
      phone: formPhone,
      email: formEmail,
      status: formStatus,
      notes: formNotes,
      score: formScore,
      agentId: formAgent
    } : l);

    onSaveLeads(updatedLeads);
    setEditingLead(null);
    onAddNotification("Información Actualizada", `Los datos de contacto de ${formName} han sido modificados`, "info");
  };

  // Create lead manually
  const handleAddManualLead = () => {
    const newId = "lead-" + Math.random().toString(36).substring(2, 9);
    const newLead: Lead = {
      id: newId,
      name: "Nuevo Cliente Manual",
      phone: "+34 ",
      email: "cliente@empresa.com",
      status: "Nuevo",
      notes: "Añadido manualmente al panel de control.",
      timestamp: new Date().toISOString(),
      agentId: agents[0]?.id || "agent-1",
      score: 3
    };

    onSaveLeads([...leads, newLead]);
    handleStartEdit(newLead);
  };

  // Delete lead
  const handleDeleteLead = (id: string, name: string) => {
    if (confirm(`¿Estás seguro que deseas retirar el lead de ${name}?`)) {
      onSaveLeads(leads.filter(l => l.id !== id));
      onAddNotification("Lead Eliminado", `Se eliminó el lead de ${name}`, "info");
    }
  };

  // Simulate pushing lead to external production CRM systems
  const handlePushToCRM = async (lead: Lead) => {
    setIsPushingCrm(lead.id);
    const agent = agents.find(a => a.id === lead.agentId);
    const webhook = agent?.crmWebhookUrl || "https://crm.produccion.empresa.internal/api/webhook";

    try {
      const response = await fetch("/api/crm/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead,
          webhookUrl: webhook
        })
      });

      const data = await response.json();
      
      setCrmLog(prev => ({
        ...prev,
        [lead.id]: {
          status: "Success",
          data: data
        }
      }));

      onAddNotification("Sincronización CRM", `Lead ${lead.name} enviado al Webhook con cifrado SSL`, "info");

    } catch (err: any) {
      setCrmLog(prev => ({
        ...prev,
        [lead.id]: {
          status: "Error",
          error: "No se pudo conectar al endpoint interno del CRM."
        }
      }));
    } finally {
      setIsPushingCrm(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Upper header action triggers */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-100 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Histórico de Clientes Potenciales</h1>
          <p className="text-sm text-gray-500 mt-1">Inspecciona y organiza los contactos capturados de forma automatizada por tus agentes en WhatsApp.</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={handleAddManualLead}
            className="flex items-center gap-1.5 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4 text-gray-500" />
            Nuevo Lead Manual
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Filter panel */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono o correo electrónico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs border border-gray-100 bg-gray-50/50 rounded-xl py-3.5 pl-10 pr-4 outline-none focus:border-blue-500 bg-white"
          />
        </div>
        
        <div className="flex flex-wrap gap-3">
          {/* Status filter dropdown */}
          <div className="flex items-center gap-2 border border-gray-100 rounded-xl px-3 bg-gray-50/50">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-transparent outline-none py-2 text-gray-700 font-medium"
            >
              <option value="All">Todos los Estados</option>
              <option value="Nuevo">Estado: Nuevo</option>
              <option value="Contactado">Estado: Contactado</option>
              <option value="Cita Agendada">Estado: Cita Agendada</option>
              <option value="Especial">Estado: Especial</option>
              <option value="Perdido">Estado: Perdido</option>
            </select>
          </div>

          {/* Rating/Score Selection Filter */}
          <div className="flex items-center gap-2 border border-gray-100 rounded-xl px-3 bg-gray-50/50">
            <Star className="w-3.5 h-3.5 text-yellow-500" />
            <select
              value={scoreFilter}
              onChange={(e) => setScoreFilter(e.target.value === 'All' ? 'All' : Number(e.target.value))}
              className="text-xs bg-transparent outline-none py-2 text-gray-700 font-medium"
            >
              <option value="All">Calificación: Todas</option>
              <option value="5">5 Estrellas (Alta prioridad)</option>
              <option value="4">4 Estrellas</option>
              <option value="3">3 Estrellas</option>
              <option value="2">2 Estrellas</option>
              <option value="1">1 Estrella</option>
            </select>
          </div>
        </div>
      </div>

      {/* Editing popover/modal simulation */}
      {editingLead && (
        <div className="bg-[#fcf8f2] border border-orange-100 p-5 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <Edit className="w-4 h-4 text-orange-600" />
            Modificando Cliente: {editingLead.name}
          </h3>
          <form onSubmit={handleSaveLead} className="text-xs grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <span className="font-semibold text-gray-700">Nombre Completo</span>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full border border-gray-200 outline-none p-2 rounded bg-white text-xs"
              />
            </div>
            <div className="space-y-1">
              <span className="font-semibold text-gray-700">Teléfono WhatsApp</span>
              <input
                type="text"
                required
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                className="w-full border border-gray-200 outline-none p-2 rounded bg-white text-xs"
              />
            </div>
            <div className="space-y-1">
              <span className="font-semibold text-gray-700">Correo Electrónico</span>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="w-full border border-gray-200 outline-none p-2 rounded bg-white text-xs"
              />
            </div>
            <div className="space-y-1">
              <span className="font-semibold text-gray-700">Estado</span>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as any)}
                className="w-full border border-gray-200 outline-none p-2 rounded bg-white text-xs"
              >
                <option value="Nuevo">Nuevo</option>
                <option value="Contactado">Contactado</option>
                <option value="Cita Agendada">Cita Agendada</option>
                <option value="Especial">Especial</option>
                <option value="Perdido">Perdido</option>
              </select>
            </div>
            <div className="space-y-1">
              <span className="font-semibold text-gray-700">Calificación Prioridad</span>
              <select
                value={formScore}
                onChange={(e) => setFormScore(Number(e.target.value))}
                className="w-full border border-gray-200 outline-none p-2 rounded bg-white text-xs"
              >
                <option value={5}>5 Estrellas (Excelente)</option>
                <option value={4}>4 Estrellas (Bueno)</option>
                <option value={3}>3 Estrellas (Normal)</option>
                <option value={2}>2 Estrellas (Bajo)</option>
                <option value={1}>1 Estrella (Frío)</option>
              </select>
            </div>
            <div className="space-y-1">
              <span className="font-semibold text-gray-700 font-mono">Agente De WhatsApp</span>
              <select
                value={formAgent}
                onChange={(e) => setFormAgent(e.target.value)}
                className="w-full border border-gray-200 outline-none p-2 rounded bg-white text-xs"
              >
                {agents.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-3 space-y-1 text-xs">
              <span className="font-semibold text-gray-700">Notas sobre requerimientos / interés</span>
              <textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                rows={3}
                className="w-full border border-gray-200 outline-none p-2 rounded bg-white text-xs"
              />
            </div>

            <div className="md:col-span-3 flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-4 rounded cursor-pointer"
              >
                Guardar Cambios
              </button>
              <button
                type="button"
                onClick={() => setEditingLead(null)}
                className="border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium py-1.5 px-4 rounded cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Leads main list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-400 uppercase font-bold tracking-wider">
                <th className="p-4 pl-6">Cliente Potencial</th>
                <th className="p-4">WhatsApp / Correo</th>
                <th className="p-4">Prioridad / Score</th>
                <th className="p-4">Estado Conversación</th>
                <th className="p-4">Agente Asignado</th>
                <th className="p-4">Sincronización CRM</th>
                <th className="p-4 pr-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-gray-50 text-gray-700 font-sans">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-gray-400 font-semibold">
                    <Users className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                    No se encontraron leads con los filtros actuales.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const assignedAgent = agents.find(a => a.id === lead.agentId);
                  
                  // Style configurations for lead statuses
                  let statusColor = "bg-gray-100 text-gray-700";
                  if (lead.status === 'Nuevo') statusColor = "bg-blue-50 text-blue-700 border border-blue-100";
                  else if (lead.status === 'Contactado') statusColor = "bg-blue-50 text-blue-700 border border-blue-100";
                  else if (lead.status === 'Cita Agendada') statusColor = "bg-green-50 text-green-700 border border-green-100";
                  else if (lead.status === 'Especial') statusColor = "bg-amber-50 text-amber-700 border border-amber-100";
                  else if (lead.status === 'Perdido') statusColor = "bg-rose-50 text-rose-700 border border-rose-100";

                  // Star arrays
                  const stars = Array.from({ length: 5 }, (_, i) => (
                    <Star 
                      key={i} 
                      className={`w-3.5 h-3.5 ${i < lead.score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} 
                    />
                  ));

                  const statusSync = crmLog[lead.id];

                  return (
                    <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 pl-6 space-y-1">
                        <p className="font-semibold text-gray-900">{lead.name}</p>
                        <p className="text-[10px] text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Completo: {new Date(lead.timestamp).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="p-4 space-y-1.5">
                        <p className="font-mono text-gray-800 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gray-400" />
                          {lead.phone}
                        </p>
                        {lead.email && (
                          <p className="text-gray-400 flex items-center gap-1 font-mono hover:underline">
                            <Mail className="w-3 h-3 text-gray-300" />
                            {lead.email}
                          </p>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-0.5">{stars}</div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-1 text-[10px] font-semibold tracking-wide rounded-full ${statusColor}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-gray-700">{assignedAgent?.name || 'Varios / Bot'}</p>
                      </td>
                      
                      {/* Webhook Sync simulations panel cell */}
                      <td className="p-4">
                        {isPushingCrm === lead.id ? (
                          <span className="text-[10px] text-gray-400 italic flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                            Sincronizando...
                          </span>
                        ) : statusSync ? (
                          statusSync.status === 'Success' ? (
                            <div className="space-y-0.5">
                              <span className="text-[10px] bg-green-50 text-green-700 border border-green-100 rounded px-1.5 py-0.5 font-medium inline-block">
                                Sincronizado
                              </span>
                              <p className="text-[9px] text-gray-400 font-mono truncate max-w-[120px]" title={JSON.stringify(statusSync.data)}>
                                OK: {statusSync.data?.sentData?.origin}
                              </p>
                            </div>
                          ) : (
                            <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-100 rounded px-1.5 py-0.5 font-medium inline-block">
                              Fallo conexión
                            </span>
                          )
                        ) : (
                          <button
                            onClick={() => handlePushToCRM(lead)}
                            className="flex items-center gap-1.5 border border-blue-100 text-blue-700 hover:bg-blue-50 px-2 py-1 rounded text-[10px] font-semibold transition-colors cursor-pointer"
                          >
                            <Database className="w-3 h-3" />
                            Pulsar a CRM
                          </button>
                        )}
                      </td>

                      <td className="p-4 pr-6 text-right space-x-1">
                        <button
                          onClick={() => handleStartEdit(lead)}
                          className="inline-flex p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 border border-gray-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLead(lead.id, lead.name)}
                          className="inline-flex p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 border border-gray-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
