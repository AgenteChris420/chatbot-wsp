import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ExternalLink, 
  Plus, 
  Check, 
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { Appointment, Lead } from '../types';

interface CalendarAppointmentsProps {
  appointments: Appointment[];
  leads: Lead[];
  onSaveAppointments: (newAppts: Appointment[]) => void;
  onAddNotification: (title: string, msg: string, type: 'urgent' | 'lead' | 'info') => void;
}

export default function CalendarAppointments({ 
  appointments, 
  leads, 
  onSaveAppointments, 
  onAddNotification 
}: CalendarAppointmentsProps) {
  // Appointment Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState(leads[0]?.id || '');
  const [apptDay, setApptDay] = useState('');
  const [apptTime, setApptTime] = useState('10:00');
  const [apptChannel, setApptChannel] = useState<'Google Calendar' | 'Outlook'>('Google Calendar');
  const [apptNotes, setApptNotes] = useState('');

  // Syncing simulation animation states
  const [isSyncing, setIsSyncing] = useState<string | null>(null);

  // Filter Active / All
  const [filterChannel, setFilterChannel] = useState<string>('All');

  const filteredAppts = appointments.filter(appt => {
    return filterChannel === 'All' ? true : appt.channel === filterChannel;
  });

  // Schedule an appointment
  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const lead = leads.find(l => l.id === selectedLeadId);
    if (!lead || !apptDay || !apptTime) return;

    // Combine date time correctly
    const combinedDateTime = `${apptDay}T${apptTime}:00.000Z`;

    const newAppt: Appointment = {
      id: "appt-" + Math.random().toString(36).substring(2, 9),
      leadId: selectedLeadId,
      leadName: lead.name,
      dateTime: combinedDateTime,
      channel: apptChannel,
      status: 'Agendada',
      notes: apptNotes
    };

    onSaveAppointments([...appointments, newAppt]);
    setShowAddForm(false);
    setApptNotes('');
    onAddNotification("Cita Programada", `Se agendó la cita para ${lead.name} el día ${apptDay} a las ${apptTime}`, "lead");
  };

  // Switch status
  const handleUpdateStatus = (apptId: string, status: Appointment['status']) => {
    const updated = appointments.map(a => a.id === apptId ? { ...a, status } : a);
    onSaveAppointments(updated);
    
    const item = appointments.find(a => a.id === apptId);
    if (item) {
      onAddNotification("Estado de Cita modificado", `La cita de ${item.leadName} el día ${new Date(item.dateTime).toLocaleDateString()} ahora está: ${status}`, "info");
    }
  };

  // Synchronize Google / Outlook Calendars APIs
  const handleSyncCalendars = (platform: 'Google' | 'Outlook') => {
    setIsSyncing(platform);
    
    setTimeout(() => {
      setIsSyncing(null);
      onAddNotification(
        `Calendarios Sincronizados`, 
        `Se importaron e integraron todas las citas de forma bidireccional con tu cuenta corporativa de ${platform}`, 
        "info"
      );
    }, 1800);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header section with platform sync action triggers */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-100 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Agenda e Integración de Calendarios</h1>
          <p className="text-sm text-gray-500 mt-1">Sincroniza tus citas capturadas con tus agendas de Google Calendar o Outlook corporativos.</p>
        </div>
        
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => handleSyncCalendars('Google')}
            disabled={isSyncing !== null}
            className="flex items-center gap-1.5 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing === 'Google' ? 'animate-spin text-blue-600' : 'text-gray-500'}`} />
            {isSyncing === 'Google' ? 'Sincronizando Google...' : 'Sincronizar Google Calendar'}
          </button>
          
          <button
            onClick={() => handleSyncCalendars('Outlook')}
            disabled={isSyncing !== null}
            className="flex items-center gap-1.5 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing === 'Outlook' ? 'animate-spin text-blue-600' : 'text-gray-500'}`} />
            {isSyncing === 'Outlook' ? 'Sincronizando Outlook...' : 'Sincronizar con Outlook'}
          </button>
        </div>
      </div>

      {/* Grid container section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Hand: Controls & Create Appointment Forms */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Acciones rápidas</h3>
              <Calendar className="w-4 h-4 text-gray-400" />
            </div>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="w-full justify-center flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-3 px-4 rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Agendar Cita Manual
            </button>

            {/* Sync summary widget status card */}
            <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100 text-xs space-y-2.5">
              <div className="flex items-center justify-between font-medium">
                <span className="text-gray-500">Google Calendar</span>
                <span className="text-green-600 font-semibold flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  Conectado
                </span>
              </div>
              <div className="flex items-center justify-between font-medium">
                <span className="text-gray-500">Microsoft Outlook</span>
                <span className="text-green-600 font-semibold flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  Conectado
                </span>
              </div>
              <div className="text-[10px] text-gray-400 leading-normal border-t border-gray-50 pt-2 flex items-start gap-1 justify-between">
                <span>Último sync realizado en segundo plano hace pocos minutos.</span>
              </div>
            </div>
          </div>

          {/* Collapsible Manual Scheduling Panel Form */}
          {showAddForm && (
            <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4 border-b border-gray-50 pb-2">Agendador Citas Manual</h3>
              
              <form onSubmit={handleCreateAppointment} className="text-xs space-y-4">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Seleccionar Cliente (Lead)</label>
                  <select
                    value={selectedLeadId}
                    onChange={(e) => setSelectedLeadId(e.target.value)}
                    className="w-full border border-gray-200 outline-none p-2.5 rounded-lg bg-gray-50/50 text-xs"
                  >
                    {leads.map(l => (
                      <option key={l.id} value={l.id}>{l.name} ({l.phone})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-700">Día</label>
                    <input
                      type="date"
                      required
                      value={apptDay}
                      onChange={(e) => setApptDay(e.target.value)}
                      className="w-full border border-gray-200 outline-none p-2.5 rounded-lg bg-gray-50/50 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-700">Hora</label>
                    <input
                      type="time"
                      required
                      value={apptTime}
                      onChange={(e) => setApptTime(e.target.value)}
                      className="w-full border border-gray-200 outline-none p-2.5 rounded-lg bg-gray-50/50 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Canal Destino</label>
                  <select
                    value={apptChannel}
                    onChange={(e) => setApptChannel(e.target.value as any)}
                    className="w-full border border-gray-200 outline-none p-2.5 rounded-lg bg-gray-50/50 text-xs"
                  >
                    <option value="Google Calendar">Sincronizar Google Calendar</option>
                    <option value="Outlook">Sincronizar Outlook Calendar</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Notas Adicionales</label>
                  <textarea
                    value={apptNotes}
                    onChange={(e) => setApptNotes(e.target.value)}
                    rows={3}
                    placeholder="E.g., Revisar catálogo inmobiliario de Palermo Suites"
                    className="w-full border border-gray-200 outline-none p-2.5 rounded-lg bg-gray-50/50 text-xs"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg cursor-pointer"
                  >
                    Programar Cita
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Right Hand: Schedule Display View */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-50 pb-4 mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Sincronizador Agenda en Tiempo Real</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterChannel('All')}
                  className={`px-3 py-1 text-[11px] font-semibold rounded-full border transition-all cursor-pointer ${
                    filterChannel === 'All'
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-150 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Todas las Agendas
                </button>
                <button
                  onClick={() => setFilterChannel('Google Calendar')}
                  className={`px-3 py-1 text-[11px] font-semibold rounded-full border transition-all cursor-pointer ${
                    filterChannel === 'Google Calendar'
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-150 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Google Calendar
                </button>
                <button
                  onClick={() => setFilterChannel('Outlook')}
                  className={`px-3 py-1 text-[11px] font-semibold rounded-full border transition-all cursor-pointer ${
                    filterChannel === 'Outlook'
                      ? 'bg-violet-50 border-violet-200 text-violet-700'
                      : 'bg-white border-gray-150 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Outlook
                </button>
              </div>
            </div>

            {/* List appointments cards */}
            <div className="space-y-4">
              {filteredAppts.length === 0 ? (
                <div className="text-center p-12 text-gray-400 text-xs font-medium space-y-1">
                  <Calendar className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                  <p>No hay citas agendadas registradas aún.</p>
                  <p className="text-gray-400 font-normal">Los chatbot de WhatsApp añadirán citas según conversen con el cliente.</p>
                </div>
              ) : (
                filteredAppts.map((appt) => {
                  let statusBadgeStyle = "bg-green-50 text-green-700 border border-green-100";
                  if (appt.status === 'Cancelada') statusBadgeStyle = "bg-rose-50 text-rose-700 border border-rose-100";
                  else if (appt.status === 'Completada') statusBadgeStyle = "bg-gray-50 text-gray-600 border border-gray-200";

                  return (
                    <div 
                      key={appt.id} 
                      className="p-5 border border-gray-100 hover:border-gray-200 rounded-2xl bg-white shadow-3xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-colors"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded ${
                            appt.channel === 'Google Calendar' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-cyan-50 text-cyan-700 border border-cyan-100'
                          }`}>
                            {appt.channel}
                          </span>
                          <span className={`px-2.5 py-0.5 text-[9px] font-semibold rounded-full ${statusBadgeStyle}`}>
                            {appt.status}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">{appt.leadName}</h4>
                          {appt.notes && <p className="text-[11px] text-gray-500 mt-1 leading-normal">{appt.notes}</p>}
                        </div>

                        <div className="flex flex-wrap gap-4 text-xs font-mono text-gray-500">
                          <p className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {new Date(appt.dateTime).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                          <p className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {new Date(appt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC
                          </p>
                        </div>
                      </div>

                      {/* Manual Action buttons to reschedule/cancel */}
                      <div className="flex sm:flex-col gap-1.5 items-end justify-start shrink-0">
                        {appt.status === 'Agendada' ? (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(appt.id, 'Completada')}
                              className="w-full flex items-center justify-center gap-1.5 text-[10px] font-bold bg-green-50 text-green-700 border border-green-200/50 py-1.5 px-3 rounded-lg hover:bg-green-100 cursor-pointer transition-colors"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Completar cita
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(appt.id, 'Cancelada')}
                              className="w-full flex items-center justify-center gap-1.5 text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/50 py-1.5 px-3 rounded-lg hover:bg-rose-100 cursor-pointer transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Cancelar cita
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleUpdateStatus(appt.id, 'Agendada')}
                            className="w-full text-center text-[10px] font-bold border border-gray-200 py-1.5 px-3 rounded-lg hover:bg-gray-50 cursor-pointer text-gray-600 transition-colors"
                          >
                            Re-Agendar
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
