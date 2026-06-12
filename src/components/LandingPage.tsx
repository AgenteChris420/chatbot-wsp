import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  ShieldCheck, 
  ArrowRight, 
  MessageSquare, 
  Zap, 
  Sparkles, 
  Calendar, 
  Users, 
  CheckCircle,
  TrendingUp,
  MessageCircle,
  Send,
  Lock
} from 'lucide-react';

interface LandingPageProps {
  onGoToApp: () => void;
}

export default function LandingPage({ onGoToApp }: LandingPageProps) {
  // Simulator chat state
  const [messages, setMessages] = useState<{ sender: 'client' | 'agent'; text: string; time: string }[]>([
    { 
      sender: 'agent', 
      text: '¡Hola! 🏠 Soy Elena, la asistente virtual inteligente. ¿Cómo te llamas y en qué puedo ayudarte hoy?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll simulator chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSimulateChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const userText = inputText.trim();
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setMessages(prev => [...prev, { sender: 'client', text: userText, time: currentTime }]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          agentId: 'agent-1', // Default Elena agent
          conversationHistory: messages.map(m => ({ sender: m.sender, text: m.text }))
        })
      });
      const data = await response.json();
      
      // Simulate WhatsApp delay
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          sender: 'agent', 
          text: data.response,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setIsTyping(false);
      }, 800);
      
    } catch (err) {
      console.error(err);
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          sender: 'agent', 
          text: '¡Entendido! Conectando tus datos. ¿Me podrías indicar tu correo para agendarte?',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setIsTyping(false);
      }, 800);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[150px] pointer-events-none"></div>
      <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-600/5 blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[150px] pointer-events-none"></div>

      {/* Header / Navbar */}
      <header className="border-b border-slate-900 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-lg text-white">
              W
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              WhatsAppBot <span className="text-blue-500">Pro</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition">Características</a>
            <a href="#simulator" className="hover:text-white transition">Demo Interactiva</a>
            <a href="#pricing" className="hover:text-white transition">Planes</a>
          </nav>

          <div className="flex items-center space-x-4">
            <button 
              onClick={onGoToApp}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold tracking-wide transition shadow-lg shadow-blue-500/10 flex items-center gap-2 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Ingresar al Panel</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-24 md:py-32 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        {/* Left marketing content */}
        <div className="lg:col-span-7 space-y-8 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>NUEVA VERSIÓN 2.4 CON GEMINI IA</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Automatiza tu WhatsApp con <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400">Agentes de IA</span>
          </h1>
          
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl">
            Entrena agentes inteligentes con tus propios documentos de empresa en minutos. Captura prospectos, responde preguntas frecuentes sin inventar datos y agenda reuniones en Google Calendar automáticamente las 24 horas del día.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={onGoToApp}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold tracking-wide transition shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <span>Probar Demo Gratis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a 
              href="#simulator"
              className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-sm font-semibold tracking-wide transition border border-slate-800 flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chatear con la IA</span>
            </a>
          </div>

          {/* Core highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-900">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
              <span className="text-xs font-semibold text-slate-300">WhatsApp API Oficial</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
              <span className="text-xs font-semibold text-slate-300">Cero mentiras (Anti-alucinación)</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
              <span className="text-xs font-semibold text-slate-300">Agenda en Google Calendar</span>
            </div>
          </div>
        </div>

        {/* Right WhatsApp Simulator */}
        <div id="simulator" className="lg:col-span-5 w-full flex justify-center">
          <div className="w-full max-w-[390px] h-[580px] bg-slate-950 rounded-[40px] p-3 border-[6px] border-slate-850 shadow-2xl shadow-blue-900/10 flex flex-col relative overflow-hidden">
            {/* Camera notch simulation */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-950 rounded-full z-20"></div>

            {/* Chat header */}
            <div className="bg-slate-900 px-4 pt-8 pb-3 border-b border-slate-850 flex items-center gap-3 shrink-0 rounded-t-[30px]">
              <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400 relative">
                E
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"></span>
              </div>
              <div className="flex-1 text-left">
                <h4 className="text-xs font-bold text-white tracking-tight">Elena (Inmobiliaria)</h4>
                <p className="text-[10px] text-green-500 font-medium">Asistente IA • Activa</p>
              </div>
              <div className="p-1 rounded-full bg-slate-800/50 text-slate-400 text-[10px] font-bold font-mono px-2">
                Simulador
              </div>
            </div>

            {/* Message area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950 flex flex-col">
              {messages.map((m, idx) => (
                <div 
                  key={idx} 
                  className={`flex flex-col max-w-[80%] ${
                    m.sender === 'client' ? 'self-end items-end' : 'self-start items-start'
                  }`}
                >
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    m.sender === 'client' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-slate-900 text-slate-200 rounded-tl-none border border-slate-850'
                  }`}>
                    {m.text}
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono mt-1 px-1">{m.time}</span>
                </div>
              ))}

              {isTyping && (
                <div className="self-start flex flex-col items-start max-w-[80%]">
                  <div className="p-3 bg-slate-900 rounded-2xl rounded-tl-none border border-slate-850 flex items-center space-x-1.5 py-2.5">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSimulateChat} className="p-3 bg-slate-900 border-t border-slate-850 rounded-b-[30px] flex gap-2 shrink-0">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Escribe un mensaje..."
                disabled={isTyping}
                className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-full text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isTyping || !inputText.trim()}
                className="w-9 h-9 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-850 text-white rounded-full flex items-center justify-center transition shrink-0 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="bg-slate-950/40 border-y border-slate-900/60 py-24 relative">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-16">
          <div className="space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              ¿Por qué elegir nuestros Agentes de WhatsApp?
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Diseñamos una plataforma integral donde la inteligencia artificial de vanguardia se conecta con tu canal de ventas más valioso.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="p-8 bg-slate-900/40 border border-slate-900/70 rounded-2xl text-left hover:border-slate-800 transition hover:bg-slate-900/60 flex flex-col space-y-4">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Entrenamiento con Archivos</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Sube catálogos PDF, archivos de texto o ingresa instrucciones directas. La IA responderá estrictamente basándose en tus datos comerciales.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 bg-slate-900/40 border border-slate-900/70 rounded-2xl text-left hover:border-slate-800 transition hover:bg-slate-900/60 flex flex-col space-y-4">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Calificación Automática</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                El bot analiza el interés, recopila el nombre, correo y teléfono del cliente, y le asigna una puntuación de 1 a 5 estrellas.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 bg-slate-900/40 border border-slate-900/70 rounded-2xl text-left hover:border-slate-800 transition hover:bg-slate-900/60 flex flex-col space-y-4">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Google Calendar Sync</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Cuando el bot detecta intenciones de agenda, solicita fecha y hora al cliente y crea el evento automáticamente en la agenda del equipo.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 bg-slate-900/40 border border-slate-900/70 rounded-2xl text-left hover:border-slate-800 transition hover:bg-slate-900/60 flex flex-col space-y-4">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Traspaso Humano</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Si un prospecto tiene dudas complejas o exige hablar con un humano, el sistema envía una alerta y el bot cede el control del chat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 max-w-7xl mx-auto px-6 text-center space-y-16">
        <div className="space-y-4 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Planes de Suscripción a tu Medida
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Consigue la licencia de tu agente y empieza a responder clientes de inmediato con total autonomía.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Plan 1 */}
          <div className="p-8 bg-slate-900/30 border border-slate-900 rounded-2xl flex flex-col text-left space-y-6">
            <div>
              <h4 className="text-xs font-bold tracking-wider text-slate-500 uppercase font-mono">Básico</h4>
              <p className="text-3xl font-extrabold text-white mt-2">$29 <span className="text-xs text-slate-500">/ mes</span></p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ideal para pequeños emprendedores que buscan automatizar respuestas de un solo negocio.
            </p>
            <ul className="space-y-3 text-xs text-slate-300 flex-1">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>1 Agente de IA Activo</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Hasta 1,000 Mensajes / mes</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Entrenamiento con Texto Plano</span>
              </li>
            </ul>
            <button 
              onClick={onGoToApp}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Comenzar Básico
            </button>
          </div>

          {/* Plan 2 */}
          <div className="p-8 bg-slate-900/60 border border-blue-500/30 rounded-2xl flex flex-col text-left space-y-6 relative shadow-xl shadow-blue-500/5">
            <div className="absolute -top-3.5 left-6 bg-blue-600 text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
              Más Popular
            </div>
            <div>
              <h4 className="text-xs font-bold tracking-wider text-blue-400 uppercase font-mono">Profesional</h4>
              <p className="text-3xl font-extrabold text-white mt-2">$59 <span className="text-xs text-slate-500">/ mes</span></p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Perfecto para pymes en crecimiento que desean calificar clientes y conectar agendas.
            </p>
            <ul className="space-y-3 text-xs text-slate-300 flex-1">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>3 Agentes de IA Activos</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Hasta 5,000 Mensajes / mes</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Entrenamiento con Archivos PDF</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Sincronización con Google Calendar</span>
              </li>
            </ul>
            <button 
              onClick={onGoToApp}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-lg shadow-blue-500/10"
            >
              Comenzar Profesional
            </button>
          </div>

          {/* Plan 3 */}
          <div className="p-8 bg-slate-900/30 border border-slate-900 rounded-2xl flex flex-col text-left space-y-6">
            <div>
              <h4 className="text-xs font-bold tracking-wider text-slate-500 uppercase font-mono">Empresarial</h4>
              <p className="text-3xl font-extrabold text-white mt-2">$149 <span className="text-xs text-slate-500">/ mes</span></p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Diseñado para grandes inmobiliarias, corporativos y soporte de alto volumen.
            </p>
            <ul className="space-y-3 text-xs text-slate-300 flex-1">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Agentes de IA Ilimitados</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Mensajes Ilimitados</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Soporte Dedicado y Webhooks CRM</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Despliegues en VPS propios</span>
              </li>
            </ul>
            <button 
              onClick={onGoToApp}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Comenzar Corporativo
            </button>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 max-w-5xl mx-auto px-6 text-center">
        <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 rounded-3xl border border-blue-950 p-12 space-y-8 flex flex-col items-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-[-50%] left-[-10%] w-[400px] h-[400px] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-[-50%] right-[-10%] w-[400px] h-[400px] rounded-full bg-emerald-600/5 blur-[100px] pointer-events-none"></div>
          
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight max-w-2xl leading-tight">
            ¿Listo para automatizar tu atención al cliente en WhatsApp?
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
            Únete a cientos de empresas que ya han delegado sus tareas repetitivas a nuestros agentes inteligentes. Pruébalo sin costo ingresando al panel de pruebas.
          </p>
          <button 
            onClick={onGoToApp}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold tracking-wide transition shadow-xl shadow-blue-500/20 flex items-center gap-2.5 cursor-pointer"
          >
            <span>Ingresar a Probar Demo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-12 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-medium space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-600/20 rounded-lg flex items-center justify-center font-bold text-xs text-blue-500">W</div>
            <span className="text-slate-400">© 2026 WhatsAppBot Pro. Todos los derechos reservados.</span>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-slate-300">Términos de Servicio</a>
            <a href="#" className="hover:text-slate-300">Privacidad</a>
            <a href="#simulator" className="hover:text-slate-300">Soporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
