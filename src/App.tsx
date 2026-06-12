import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Bot, 
  Users, 
  MessageSquare, 
  Calendar, 
  ShieldCheck, 
  Bell, 
  Check, 
  Activity, 
  AlertCircle,
  LogOut,
  User,
  ExternalLink,
  Smartphone,
  Globe
} from 'lucide-react';
import { Agent, Lead, Conversation, Appointment, UserProfile, Notification, DashboardMetrics } from './types';
import Dashboard from './components/Dashboard';
import AgentTraining from './components/AgentTraining';
import LeadsPanel from './components/LeadsPanel';
import ConversationLogs from './components/ConversationLogs';
import CalendarScheduler from './components/CalendarScheduler';
import UserRoles from './components/UserRoles';
import WhatsAppMetaConnection from './components/WhatsAppMetaConnection';
import LandingPage from './components/LandingPage';

// Import our Firestore and Firebase Auth configurations
import { db, auth, testConnection, handleFirestoreError } from './firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User as FirebaseUser } from 'firebase/auth';

export default function App() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Security Login barrier state (username & password)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => sessionStorage.getItem('isAuthenticated') === 'true');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  // SPA Routing state ('landing' or 'app')
  const [view, setView] = useState<'landing' | 'app'>(() => window.location.pathname.startsWith('/app') ? 'app' : 'landing');

  useEffect(() => {
    const handlePopState = () => {
      setView(window.location.pathname.startsWith('/app') ? 'app' : 'landing');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (newView: 'landing' | 'app') => {
    const path = newView === 'app' ? '/app' : '/';
    window.history.pushState(null, '', path);
    setView(newView);
  };

  // Core state synced with sever
  const [agents, setAgents] = useState<Agent[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // App UI states
  const [activeTab, setActiveTab] = useState<'kpis' | 'agents' | 'leads' | 'chats' | 'calendar' | 'roles' | 'meta'>('kpis');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'Synced' | 'Syncing' | 'Offline'>('Synced');
  const [dataError, setDataError] = useState<string | null>(null);

  // Active push system notifications states
  const [pushAlert, setPushAlert] = useState<Notification | null>(null);

  // Dynamic User Profile Resolving & Access Control
  const loggedInProfile = currentUser
    ? users.find(u => u.email.toLowerCase() === currentUser.email?.toLowerCase())
    : null;
  const userRole = loggedInProfile ? loggedInProfile.role : 'Admin'; // Out-of-box default to Admin when newly created or first-time signed in
  const isAdmin = userRole === 'Admin';

  // Redirect if non-admin somehow winds up on the Meta tab
  useEffect(() => {
    if (activeTab === 'meta' && !isAdmin) {
      setActiveTab('kpis');
    }
  }, [activeTab, isAdmin]);

  // Check auth and initial boot connection
  useEffect(() => {
    testConnection(); // trigger compliance test
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch initial relational preseeds from database
  useEffect(() => {
    async function loadInitialData() {
      try {
        setSyncStatus('Syncing');
        const res = await fetch('/api/data');
        if (!res.ok) throw new Error("No se pudo conectar con el servidor de la plataforma.");
        const data = await res.json();
        
        setAgents(data.agents || []);
        setLeads(data.leads || []);
        setConversations(data.conversations || []);
        setAppointments(data.appointments || []);
        setUsers(data.users || []);
        setNotifications(data.notifications || []);
        
        setSyncStatus('Synced');
      } catch (err: any) {
        console.error(err);
        setDataError(err.message || "Fallo cargando preseeds del backend");
        setSyncStatus('Offline');
      }
    }
    loadInitialData();
  }, []);

  // Save general updates helper (Sync with express memory database + notify client)
  const syncWithServer = async (key: string, value: any) => {
    try {
      setSyncStatus('Syncing');
      const response = await fetch('/api/save', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value })
      });

      if (!response.ok) {
        throw new Error("Fallo al guardar copia de seguridad en el backend.");
      }
      setSyncStatus('Synced');
    } catch (err) {
      console.error(err);
      setSyncStatus('Offline');
    }
  };

  // State handlers triggers (Passed to child dashboards)
  const handleSaveAgents = (newAgents: Agent[]) => {
    setAgents(newAgents);
    syncWithServer("agents", newAgents);
  };

  const handleSaveLeads = (newLeads: Lead[]) => {
    setLeads(newLeads);
    syncWithServer("leads", newLeads);
  };

  const handleSaveConversations = (newConvs: Conversation[]) => {
    setConversations(newConvs);
    syncWithServer("conversations", newConvs);
  };

  const handleSaveAppointments = (newAppts: Appointment[]) => {
    setAppointments(newAppts);
    syncWithServer("appointments", newAppts);
  };

  const handleSaveUsers = (newUsers: UserProfile[]) => {
    setUsers(newUsers);
    syncWithServer("users", newUsers);
  };

  // Sinks push notifications in-app to alerts panel or dynamic alert banner 
  const handleAddNotification = (title: string, msg: string, type: 'urgent' | 'lead' | 'info') => {
    const newNot: Notification = {
      id: "not-" + Math.random().toString(36).substring(2, 9),
      title,
      message: msg,
      type,
      read: false,
      timestamp: new Date().toISOString()
    };

    const nextNots = [newNot, ...notifications];
    setNotifications(nextNots);
    syncWithServer("notifications", nextNots);

    // Dynamic banner alert (Simulate Live Push Notification)
    setPushAlert(newNot);
    setTimeout(() => {
      setPushAlert(null);
    }, 5000);
  };

  // Sign in with Google handler (Iframe friendly)
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setAuthLoading(true);
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Auth Exception: ", err);
      if (err.code === 'auth/popup-closed-by-user' || err.message?.includes('popup-closed-by-user')) {
        handleAddNotification(
          "Inicio de Sesión", 
          "La ventana de autenticación fue cerrada antes de completarse.", 
          "info"
        );
      } else {
        handleAddNotification(
          "Error de Autenticación", 
          err.message || "No se pudo realizar la autenticación OAuth2.", 
          "urgent"
        );
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      handleAddNotification(
        "Sesión Cerrada", 
        "Has cerrado tu sesión correctamente.", 
        "info"
      );
    } catch (err: any) {
      console.error("SignOut Exception: ", err);
      handleAddNotification(
        "Error", 
        "No se pudo cerrar la sesión: " + (err.message || ""), 
        "urgent"
      );
    }
  };

  const handleLocalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSubmitting(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem('isAuthenticated', 'true');
      } else {
        setLoginError(data.error || 'Credenciales inválidas.');
      }
    } catch (err) {
      console.error(err);
      setLoginError('Error de red al intentar iniciar sesión.');
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleLocalLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('isAuthenticated');
    setLoginUsername('');
    setLoginPassword('');
    navigateTo('landing');
  };

  const handleSystemLogout = async () => {
    handleLocalLogout();
    await handleSignOut();
  };

  const handleMarkAllNotificationsRead = () => {
    const readNots = notifications.map(n => ({ ...n, read: true }));
    setNotifications(readNots);
    syncWithServer("notifications", readNots);
  };

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  if (view === 'landing') {
    return <LandingPage onGoToApp={() => navigateTo('app')} />;
  }

  if (!isAuthenticated) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex items-center justify-center overflow-hidden antialiased font-sans relative">
        {/* Dynamic Abstract Background shapes */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none"></div>
        
        <div className="w-full max-w-md p-8 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800/80 shadow-2xl z-10 flex flex-col items-center">
          {/* Logo Header */}
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4 animate-pulse">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-1">Panel de Control</h2>
          <p className="text-xs text-slate-450 mb-8 font-mono">Agente-Bot WhatsApp Talca</p>

          <form onSubmit={handleLocalLogin} className="w-full space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono" htmlFor="username">
                Usuario
              </label>
              <input
                id="username"
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="Ingresa tu usuario"
                required
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono" htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all font-sans"
              />
            </div>

            {loginError && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs px-4 py-2.5 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loginSubmitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer shadow-lg shadow-blue-500/15 flex items-center justify-center gap-2"
            >
              {loginSubmitting ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Acceder al Sistema</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-slate-50 text-slate-900 flex flex-col overflow-hidden antialiased">
      
      {/* 1. Dynamic Mock/Real Push Notification Banner top center alerts */}
      {pushAlert && (
        <div id="push-notification-banner" className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900 text-white rounded-2xl shadow-2xl p-4 max-w-sm w-11/12 border border-slate-700/80 flex gap-3 animate-bounce">
          <div className={`p-2 rounded-xl shrink-0 ${
            pushAlert.type === 'urgent' ? 'bg-rose-500 text-white' :
            pushAlert.type === 'lead' ? 'bg-emerald-500 text-white' :
            'bg-blue-500 text-white'
          }`}>
            <Bell className="w-4 h-4" />
          </div>
          <div className="flex-1 text-xs">
            <h4 className="font-bold tracking-tight text-white">{pushAlert.title}</h4>
            <p className="text-slate-300 mt-0.5 leading-relaxed">{pushAlert.message}</p>
          </div>
          <button onClick={() => setPushAlert(null)} aria-label="Close notification" className="text-slate-400 hover:text-white shrink-0 self-start text-xs font-bold px-1.5 focus:outline-none">
            ×
          </button>
        </div>
      )}

      {/* Main horizontal layout wrapping left aside and right panel */}
      <div className="flex flex-1 overflow-hidden h-full w-full">
        
        {/* Navigation Sidebar Panel (Full height style matching Professional Polish) */}
        <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl shrink-0">
          {/* Brand header */}
          <div 
            onClick={() => navigateTo('landing')}
            className="p-6 border-b border-slate-800 flex items-center space-x-3 cursor-pointer hover:bg-slate-800/40 transition"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg text-white">W</div>
            <h1 className="text-lg font-bold tracking-tight text-white">WhatsAppBot <span className="text-blue-400">Pro</span></h1>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-3 mb-2.5 font-mono">Navegación</p>
            
            <button
              onClick={() => { setActiveTab('kpis'); setNotificationsOpen(false); }}
              className={`flex items-center gap-3 w-full p-3 text-sm font-medium rounded-lg transition-all text-left cursor-pointer ${
                activeTab === 'kpis' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4 shrink-0" />
              <span>Métricas y Funnel</span>
            </button>

            <button
              onClick={() => { setActiveTab('agents'); setNotificationsOpen(false); }}
              className={`flex items-center gap-3 w-full p-3 text-sm font-medium rounded-lg transition-all text-left cursor-pointer ${
                activeTab === 'agents' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Bot className="w-4 h-4 shrink-0" />
              <span>Entrenamiento de IA</span>
            </button>

            <button
              onClick={() => { setActiveTab('leads'); setNotificationsOpen(false); }}
              className={`flex items-center gap-3 w-full p-3 text-sm font-medium rounded-lg transition-all text-left cursor-pointer ${
                activeTab === 'leads' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>Leads Capturados</span>
            </button>

            <button
              onClick={() => { setActiveTab('chats'); setNotificationsOpen(false); }}
              className={`flex items-center gap-3 w-full p-3 text-sm font-medium rounded-lg transition-all text-left cursor-pointer ${
                activeTab === 'chats' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span>Central de Chats</span>
            </button>

            <button
              onClick={() => { setActiveTab('calendar'); setNotificationsOpen(false); }}
              className={`flex items-center gap-3 w-full p-3 text-sm font-medium rounded-lg transition-all text-left cursor-pointer ${
                activeTab === 'calendar' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Schedules y Agenda</span>
            </button>

            <button
              onClick={() => { setActiveTab('roles'); setNotificationsOpen(false); }}
              className={`flex items-center gap-3 w-full p-3 text-sm font-medium rounded-lg transition-all text-left cursor-pointer ${
                activeTab === 'roles' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Roles de Acceso</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => { setActiveTab('meta'); setNotificationsOpen(false); }}
                className={`flex items-center gap-3 w-full p-3 text-sm font-medium rounded-lg transition-all text-left cursor-pointer ${
                  activeTab === 'meta' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Globe className="w-4 h-4 shrink-0" />
                <span>Conexión Meta WhatsApp</span>
              </button>
            )}

            {/* Current entity container visual decoration */}
            <div className="pt-4 mt-6 border-t border-slate-800 space-y-1 px-3">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block font-mono">Empresa Activa</span>
              <p className="text-xs font-bold text-slate-202 truncate">Inmobiliaria Express & Corp</p>
            </div>
          </nav>

          {/* Footer of Sidebar */}
          <div className="p-4 border-t border-slate-800 space-y-2">
            <div className="bg-slate-800 p-3 rounded-lg flex items-center justify-between text-xs text-slate-400">
              <span className="truncate">Sinc: {syncStatus === 'Synced' ? 'Firestore OK' : 'Guardando...'}</span>
              <div className={`w-2 h-2 rounded-full shrink-0 ${syncStatus === 'Synced' ? 'bg-green-500 animate-pulse' : 'bg-amber-500 animate-spin'}`}></div>
            </div>

            {currentUser && (
              <div className="flex items-center space-x-3 p-1">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200 shrink-0">
                  {currentUser.displayName?.[0] || currentUser.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 text-xs overflow-hidden">
                  <p className="font-semibold text-slate-200 truncate">{currentUser.displayName || currentUser.email?.split('@')[0]}</p>
                  <p className="text-slate-500 text-[10px]">{userRole}</p>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Right Content Space */}
        <main className="flex-1 flex flex-col bg-slate-50 overflow-hidden h-full">
          
          {/* Top Bar Header styled matching Professional Polish */}
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm shrink-0">
            {/* Page title with latency indicator */}
            <div className="flex items-center space-x-4">
              <h2 className="text-[16px] font-semibold text-slate-800 tracking-tight">
                {activeTab === 'kpis' && 'Métricas de Rendimiento'}
                {activeTab === 'agents' && 'Entrenamiento de Agente IA'}
                {activeTab === 'leads' && 'Histórico de Leads Capturados'}
                {activeTab === 'chats' && 'Central de Chats Activos'}
                {activeTab === 'calendar' && 'Calendario y Citas Agendadas'}
                {activeTab === 'roles' && 'Roles y Permisos de Acceso'}
                {activeTab === 'meta' && 'Conexión con Meta WhatsApp Business'}
              </h2>
              <div className="hidden md:flex items-center text-xs text-green-700 bg-green-50 px-2 py-1 rounded border border-green-200 font-mono">
                <span className="mr-1 text-[10px] text-green-500">●</span> SSL Cifrado
              </div>
            </div>

            {/* Notification Drawer and Account trigger */}
            <div className="flex items-center space-x-6">
              
              {/* Notifications bell dropdown button */}
              <div className="relative">
                <button 
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-1.5 text-slate-500 hover:text-slate-700 relative rounded-lg hover:bg-slate-100 transition cursor-pointer"
                  aria-label="Alertas"
                >
                  <span className="sr-only">🔔 Notifications</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                  )}
                  <Bell className="w-5 h-5" />
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-3 bg-white border border-slate-200 rounded-xl w-80 shadow-xl z-40 p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="text-xs font-bold text-slate-800">Alertas urgentes ({unreadCount})</h4>
                      <button 
                        onClick={handleMarkAllNotificationsRead} 
                        className="text-[10px] text-blue-600 font-semibold hover:underline cursor-pointer"
                      >
                        Marcar todo leído
                      </button>
                    </div>

                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-5">Sin alertas urgentes.</p>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className={`p-2 rounded-lg border text-left flex flex-col gap-0.5 ${!n.read ? 'bg-blue-50/20 border-blue-100' : 'bg-slate-50/50 border-slate-100'}`}>
                            <div className="flex items-center justify-between">
                              <span className={`text-[9px] font-bold uppercase tracking-wider font-mono ${
                                n.type === 'urgent' ? 'text-rose-600' :
                                n.type === 'lead' ? 'text-green-600' :
                                'text-blue-600'
                              }`}>{n.type}</span>
                              <span className="text-[9px] text-slate-400 font-mono">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <h5 className="font-semibold text-xs text-slate-900 mt-0.5">{n.title}</h5>
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Login / Output Trigger */}
              {authLoading ? (
                <span className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
              ) : currentUser ? (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-xs font-semibold text-slate-800 truncate max-w-[120px]" title={currentUser.email || "Usuario"}>
                      {currentUser.displayName || currentUser.email?.split('@')[0]}
                    </span>
                    <span className="text-[9px] text-slate-450 font-mono font-medium">{userRole}</span>
                  </div>
                  <button 
                    onClick={handleSystemLogout}
                    className="p-2 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-400 rounded-lg transition-all cursor-pointer"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleGoogleLogin}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-blue-700 transition cursor-pointer"
                >
                  Conectar Cloud
                </button>
              )}

            </div>
          </header>

          {/* Current view viewport content padding */}
          <div className="flex-1 p-8 overflow-y-auto space-y-6">
            
            {dataError && (
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 text-xs text-rose-700 flex gap-2 items-start mb-6">
                <AlertCircle className="w-4 h-4 mt-0.5 text-rose-600 shrink-0" />
                <div>
                  <p className="font-bold">Error de sincronización con base de datos.</p>
                  <p className="mt-1 text-rose-500">{dataError}</p>
                </div>
              </div>
            )}

            {activeTab === 'kpis' && (
              <Dashboard 
                leads={leads}
                agents={agents}
                conversations={conversations}
                appointments={appointments}
              />
            )}

            {activeTab === 'agents' && (
              <AgentTraining 
                agents={agents}
                onSaveAgents={handleSaveAgents}
                onAddNotification={handleAddNotification}
              />
            )}

            {activeTab === 'leads' && (
              <LeadsPanel 
                leads={leads}
                agents={agents}
                onSaveLeads={handleSaveLeads}
                onAddNotification={handleAddNotification}
              />
            )}

            {activeTab === 'chats' && (
              <ConversationLogs 
                conversations={conversations}
                leads={leads}
                agents={agents}
                onSaveConversations={handleSaveConversations}
                onAddNotification={handleAddNotification}
              />
            )}

            {activeTab === 'calendar' && (
              <CalendarScheduler 
                appointments={appointments}
                leads={leads}
                onSaveAppointments={handleSaveAppointments}
                onAddNotification={handleAddNotification}
              />
            )}

            {activeTab === 'roles' && (
              <UserRoles 
                users={users}
                onSaveUsers={handleSaveUsers}
                onAddNotification={handleAddNotification}
              />
            )}

            {activeTab === 'meta' && isAdmin && (
              <WhatsAppMetaConnection 
                agents={agents}
                onSaveAgents={handleSaveAgents}
                onAddNotification={handleAddNotification}
              />
            )}

          </div>

          {/* Footer Bar styled matching Professional Polish */}
          <footer className="h-10 bg-slate-100 border-t border-slate-200 flex items-center justify-between px-8 text-[10px] text-slate-400 font-medium shrink-0">
            <div className="flex space-x-4">
              <span>Versión 2.4.0 (Stable)</span>
              <span>Cifrado AES-256</span>
              <span>Infraestructura Firebase</span>
            </div>
            <div>© 2026 WhatsAppBot Suite - Conectado a Firestore Realtime</div>
          </footer>

        </main>
      </div>

    </div>
  );
}
