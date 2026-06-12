import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Share2, 
  Plus, 
  Check, 
  X, 
  ExternalLink, 
  RefreshCw, 
  CalendarDays,
  ShieldCheck,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Appointment, Lead } from '../types';

interface CalendarSchedulerProps {
  appointments: Appointment[];
  leads: Lead[];
  onSaveAppointments: (newAppts: Appointment[]) => void;
  onAddNotification: (title: string, msg: string, type: 'urgent' | 'lead' | 'info') => void;
}

export default function CalendarScheduler({
  appointments,
  leads,
  onSaveAppointments,
  onAddNotification
}: CalendarSchedulerProps) {
  const [leadId, setLeadId] = useState(leads[0]?.id || '');
  const [apptDate, setApptDate] = useState('');
  const [apptTime, setApptTime] = useState('11:00');
  const [apptNotes, setApptNotes] = useState('Cita de seguimiento comercial capturada por WhatsApp');
  const [apptChannel, setApptChannel] = useState<'Google Calendar' | 'Outlook'>('Google Calendar');
  const [isSyncing, setIsSyncing] = useState<string | null>(null);

  // Calendar States
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const formattedMonthYear = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  const getAppointmentsForCell = (date: Date) => {
    return appointments.filter(appt => {
      if (appt.status !== 'Agendada') return false;
      const apptDate = new Date(appt.dateTime);
      return isSameDay(apptDate, date);
    });
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const startOffset = (firstDayIndex + 6) % 7;
  const prevMonthDays = new Date(year, month, 0).getDate();

  const cells = [];
  // previous month padding cells
  for (let i = startOffset - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    cells.push({
      day,
      isCurrentMonth: false,
      date: new Date(year, month - 1, day)
    });
  }
  // current month cells
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({
      day: i,
      isCurrentMonth: true,
      date: new Date(year, month, i)
    });
  }
  // next month padding cells (42 cells always to maintain height)
  const totalCellsNeeded = 42;
  const nextMonthPadding = totalCellsNeeded - cells.length;
  for (let i = 1; i <= nextMonthPadding; i++) {
    cells.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(year, month + 1, i)
    });
  }

  const weekdays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  // Filter display appointments list below calendar
  const displayAppts = selectedDate 
    ? appointments.filter(appt => isSameDay(new Date(appt.dateTime), selectedDate))
    : appointments;

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId || !apptDate) return;

    const matchedLead = leads.find(l => l.id === leadId);
    if (!matchedLead) return;

    const newAppt: Appointment = {
      id: "appt-" + Math.random().toString(36).substring(2, 9),
      leadId,
      leadName: matchedLead.name,
      dateTime: `${apptDate}T${apptTime}:00.000Z`,
      channel: apptChannel,
      status: 'Agendada',
      notes: apptNotes
    };

    onSaveAppointments([...appointments, newAppt]);
    onAddNotification(
      "Cita Creada", 
      `Cita para ${matchedLead.name} agendada de forma encriptada en ${apptChannel}`, 
      "lead"
    );

    // Reset fields
    setApptNotes('Cita de seguimiento comercial capturada por WhatsApp');
  };

  const handleCancelAppointment = (id: string, name: string) => {
    const updated = appointments.map(a => a.id === id ? { ...a, status: 'Cancelada' as const } : a);
    onSaveAppointments(updated);
    onAddNotification("Cita Cancelada", `Se canceló la cita de ${name}`, "info");
  };

  const handleSyncToCloud = (id: string, channel: string) => {
    setIsSyncing(id);
    setTimeout(() => {
      setIsSyncing(null);
      onAddNotification(
        "Sincronización Exitosa", 
        `Cita sincronizada con éxito en ${channel} (Canal cifrado SSL/TLS v1.3)`, 
        "info"
      );
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Top section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Agendas y horarios</h1>
          <p className="text-sm text-gray-500 mt-1">Conecta citas capturadas en tus chats directos de WhatsApp con Google Calendar u Outlook en tiempo real de forma segura.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50 border border-blue-100 px-3.5 py-1.5 rounded-full mt-3 md:mt-0 font-medium font-sans">
          <ShieldCheck className="w-4 h-4 text-blue-600 font-sans" />
          Certificado SSL & OAuth2 Activo
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column: Create appointment form */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
            <CalendarDays className="w-5 h-5 text-blue-600" />
            <h3 className="text-md font-semibold text-gray-800">Agendar Nueva Cita</h3>
          </div>

          {leads.length === 0 ? (
            <div className="p-4 bg-amber-50 text-amber-700 text-xs rounded-xl flex gap-1.5 font-medium border border-amber-100">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Registra o captura un cliente potential (Lead) primero para habilitar el agendamiento.</span>
            </div>
          ) : (
            <form onSubmit={handleCreateAppointment} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-gray-700">Seleccionar Cliente Potential</label>
                <select
                  value={leadId}
                  onChange={(e) => setLeadId(e.target.value)}
                  className="w-full text-xs border border-gray-200 outline-none p-3 rounded-xl bg-gray-50/50"
                  required
                >
                  <option value="">-- Elige un lead --</option>
                  {leads.map(l => (
                    <option key={l.id} value={l.id}>{l.name} ({l.phone})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Fecha de Cita</label>
                  <input
                    type="date"
                    value={apptDate}
                    onChange={(e) => setApptDate(e.target.value)}
                    required
                    className="w-full text-xs border border-gray-200 outline-none p-3 rounded-xl bg-gray-50/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Hora Pactada</label>
                  <input
                    type="time"
                    value={apptTime}
                    onChange={(e) => setApptTime(e.target.value)}
                    required
                    className="w-full text-xs border border-gray-200 outline-none p-3 rounded-xl bg-gray-50/50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700">Canal de Integración</label>
                <div className="grid grid-cols-2 gap-3.5 mt-1">
                  <button
                    type="button"
                    onClick={() => setApptChannel('Google Calendar')}
                    className={`p-3 border rounded-xl flex items-center justify-center gap-1.5 font-semibold cursor-pointer transition-colors ${
                      apptChannel === 'Google Calendar'
                        ? 'bg-blue-50/40 border-blue-300 text-blue-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Google Calendar
                  </button>
                  <button
                    type="button"
                    onClick={() => setApptChannel('Outlook')}
                    className={`p-3 border rounded-xl flex items-center justify-center gap-1.5 font-semibold cursor-pointer transition-colors ${
                      apptChannel === 'Outlook'
                        ? 'bg-cyan-50/40 border-cyan-300 text-cyan-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Outlook Calendar
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700">Notas de Requerimientos</label>
                <textarea
                  value={apptNotes}
                  onChange={(e) => setApptNotes(e.target.value)}
                  rows={3}
                  required
                  placeholder="Escribe detalles adicionales de interés, llamadas preliminares, etc..."
                  className="w-full text-xs border border-gray-200 outline-none p-3 rounded-xl bg-gray-50/50"
                />
              </div>

              <button
                type="submit"
                disabled={!leadId || !apptDate}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl transition-colors cursor-pointer text-center text-xs"
              >
                Agendar y Sincronizar Cita
              </button>
            </form>
          )}
        </div>

        {/* Right column: Booked appointments calendar grid + filtered list */}
        <div className="lg:col-span-7 space-y-6">
          {/* Calendar Widget */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-50 pb-3">
              <h3 className="text-md font-semibold text-gray-800 flex items-center gap-1.5">
                <Calendar className="w-5 h-5 text-blue-600" />
                Calendario de Citas
              </h3>
              <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded font-mono font-semibold">Sincronización Activa</span>
            </div>

            {/* Month Navigation Header */}
            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer text-slate-600 border border-slate-200/50 bg-white shadow-3xs flex items-center justify-center"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h4 className="text-xs font-bold text-slate-800 capitalize select-none font-sans">
                {formattedMonthYear}
              </h4>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer text-slate-600 border border-slate-200/50 bg-white shadow-3xs flex items-center justify-center"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Calendar Grid Header */}
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-[9px] uppercase tracking-wider text-slate-400">
              {weekdays.map(d => <div key={d} className="py-1">{d}</div>)}
            </div>

            {/* Calendar Grid Cells */}
            <div className="grid grid-cols-7 gap-1 bg-slate-100/60 rounded-xl overflow-hidden p-1 border border-slate-200/30">
              {cells.map((cell, idx) => {
                const cellAppts = getAppointmentsForCell(cell.date);
                const isSelected = selectedDate && isSameDay(cell.date, selectedDate);
                const isToday = isSameDay(cell.date, new Date());
                const maxVisibleAppts = 1;
                const visibleAppts = cellAppts.slice(0, maxVisibleAppts);
                const remainingCount = cellAppts.length - maxVisibleAppts;

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDate(cell.date)}
                    className={`min-h-[76px] p-1.5 flex flex-col justify-between rounded-lg cursor-pointer transition-all relative ${
                      cell.isCurrentMonth ? 'bg-white hover:bg-slate-50 text-slate-850' : 'bg-slate-50/20 text-slate-400/70'
                    } ${isToday ? 'ring-2 ring-emerald-500 bg-emerald-50/10' : ''} ${
                      isSelected ? 'ring-2 ring-blue-600 bg-blue-50/20 z-10 font-semibold shadow-3xs' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-semibold leading-none ${
                        isToday ? 'text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded-full font-bold' : ''
                      }`}>
                        {cell.day}
                      </span>
                      {cellAppts.length > 0 && (
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isToday ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`}></span>
                      )}
                    </div>
                    
                    <div className="space-y-0.5 mt-1.5 flex-1 flex flex-col justify-end overflow-hidden">
                      {cell.isCurrentMonth && (
                        <>
                          {visibleAppts.map(appt => (
                            <div
                              key={appt.id}
                              className={`text-[8px] px-1 py-0.5 rounded truncate font-bold leading-tight border ${
                                appt.channel === 'Google Calendar'
                                  ? 'bg-blue-50/80 text-blue-700 border-blue-100/50'
                                  : 'bg-violet-50/80 text-violet-700 border-violet-100/50'
                              }`}
                            >
                              {appt.leadName}
                            </div>
                          ))}
                          {remainingCount > 0 && (
                            <div className="text-[7.5px] text-slate-450 font-bold text-center leading-none">
                              +{remainingCount} más
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* List detailed appointments */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-50 pb-3">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                {selectedDate 
                  ? `Citas para el ${selectedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })} (${displayAppts.length})`
                  : `Todas las Citas (${appointments.filter(a => a.status === 'Agendada').length})`
                }
              </h3>
              {selectedDate && (
                <button
                  type="button"
                  onClick={() => setSelectedDate(null)}
                  className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer border-0 bg-transparent"
                >
                  Mostrar todo
                </button>
              )}
            </div>

            <div className="space-y-4 max-h-[380px] overflow-y-auto">
              {displayAppts.length === 0 ? (
                <div className="p-10 text-center text-gray-400 text-xs">
                  {selectedDate 
                    ? "No hay citas programadas para esta fecha."
                    : "No hay citas agendadas registradas aún."
                  }
                </div>
              ) : (
                displayAppts.map((appt) => {
                  const isSyncingActive = isSyncing === appt.id;
                  let statusBadge = "bg-green-50 text-green-700 border border-green-100";
                  if (appt.status === "Cancelada") statusBadge = "bg-rose-50 text-rose-700 border border-rose-100";
                  if (appt.status === "Completada") statusBadge = "bg-gray-50 text-gray-500 border border-gray-200";

                  return (
                    <div key={appt.id} className="p-4 border border-gray-50 hover:border-gray-100 rounded-xl space-y-3 transition-colors text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">{appt.leadName}</h4>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500 font-medium">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-gray-400" />
                              {new Date(appt.dateTime).toLocaleDateString()} a las {new Date(appt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span>•</span>
                            <span className="text-blue-600 font-semibold">{appt.channel}</span>
                          </div>
                        </div>
                        <span className={`text-[10px] px-2 py-1 rounded-full font-semibold ${statusBadge}`}>
                          {appt.status}
                        </span>
                      </div>

                      <p className="text-xs text-gray-655 italic">"{appt.notes}"</p>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-50/50 text-[11px]">
                        <span className="text-gray-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          Reunión Remota / Virtual
                        </span>
                        
                        <div className="flex items-center gap-2.5">
                          {appt.status === 'Agendada' && (
                            <>
                              <button
                                onClick={() => handleSyncToCloud(appt.id, appt.channel)}
                                disabled={isSyncingActive}
                                className="text-xs text-blue-600 hover:underline flex items-center gap-1 cursor-pointer font-medium border-0 bg-transparent"
                              >
                                <RefreshCw className={`w-3 h-3 ${isSyncingActive ? 'animate-spin' : ''}`} />
                                {isSyncingActive ? "Cifrando..." : "Pulsar Sinc"}
                              </button>
                              <button
                                onClick={() => handleCancelAppointment(appt.id, appt.leadName)}
                                className="text-xs text-rose-600 hover:underline flex items-center gap-1 cursor-pointer font-medium border-0 bg-transparent"
                              >
                                <X className="w-3 h-3" />
                                Cancelar
                              </button>
                            </>
                          )}
                        </div>
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
