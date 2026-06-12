import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-memory relational database seeds for immediate high-quality previews
let database = {
  agents: [
    {
      id: "agent-1",
      name: "Asistente Inmobiliaria (Elena)",
      status: "Active",
      language: "Español",
      quickReplies: "Ver Propiedades, Agendar Visita, Hablar con Humano",
      crmWebhookUrl: "https://hook.us.services/crm-pipeline-inmobiliaria",
      trainingData: `Eres Elena, la asistente virtual experta de Inmobiliaria Express.
Nuestra empresa vende y alquila apartamentos modernos en la zona central.
Tenemos 3 proyectos principales:
1. Palermo Suites: Apartamentos de 1 habitación desde $85,000 USD. Piscina, gimnasio, pet-friendly.
2. Condominio El Roble: Casas familiares de 3 habitaciones desde $150,000 USD. Zona segura de alta plusvalía.
3. Lofts Centro: Arriendos amoblados desde $600 USD al mes. Cerca de estaciones de metro.

Tu objetivo es responder de manera amable, consisa y natural (como si chatearas por WhatsApp). 
Reglas estrictas de comportamiento:
1. NO inventes proyectos que no estén listados aquí.
2. Si preguntan por financiamiento, di que ofrecemos crédito directo con el 20% de enganche.
3. Siempre intenta capturar su Nombre, Correo y WhatsApp de forma amigable para agendarles una visita guiada.
4. Si te insisten mucho en hablar con un humano o tienen una queja compleja, di que transferirás la conversación al equipo de soporte de inmediato.`,
      createdAt: new Date().toISOString(),
      whatsappNumber: "+569 33207799",
      trainingFiles: [
        {
          id: "seed-file-1",
          name: "catalogo_propiedades_palermo.pdf",
          size: "1.42 MB",
          uploadedAt: "01 jun, 11:30",
          charCount: 420,
          extractedText: `--- DOCUMENTO MEMORIA PDF: catalogo_propiedades_palermo.pdf ---
Fecha de Escaneo por IA: 01/06/2026
Proyectos Inmobiliaria Express 2026:
- Palermo Suites: Apartamentos modernos con domótica. 1Rec, pet-friendly con piscina y gimnasio desde $85,000 USD.
- Condominio El Roble: Casas inteligentes unifamiliares con portón de acceso controlado. Zona de alta plusvalía y seguridad 24/7.
- Lofts Centro: Distribución moderna, amoblado completo para estudiantes o ejecutivos desde $600 USD al mes.`
        }
      ]
    }
  ],
  leads: [
    {
      id: "lead-1",
      name: "Carlos Mendoza",
      phone: "+52 55 1234 5678",
      email: "carlos.men@gmail.com",
      status: "Cita Agendada",
      notes: "Interesado en Palermo Suites, busca departamento de 1 recámara. Piso alto.",
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
      agentId: "agent-1",
      score: 5
    },
    {
      id: "lead-2",
      name: "Sofía Castro",
      phone: "+52 55 9876 5432",
      email: "sofia.castro@outlook.com",
      status: "Contactado",
      notes: "Interesada en alquilar un Loft amoblado en el Centro. Preguntó por la cercanía con estaciones del metro.",
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
      agentId: "agent-1",
      score: 4
    },
    {
      id: "lead-3",
      name: "Roberto Gómez",
      phone: "+52 55 4567 8901",
      email: "rgomez@yahoo.com",
      status: "Nuevo",
      notes: "Consulta directa iniciada vía WhatsApp. Pendiente agendar perfil de crédito.",
      timestamp: new Date().toISOString(),
      agentId: "agent-1",
      score: 3
    }
  ],
  conversations: [
    {
      id: "conv-1",
      leadId: "lead-1",
      agentId: "agent-1",
      lastMessageText: "Perfecto, agendado para mañana a las 4:00 PM. ¡Saludos!",
      lastMessageTime: new Date(Date.now() - 3600000 * 24).toISOString(),
      status: "Open",
      messages: [
        { id: "m1", text: "Hola, vi un anuncio sobre departamentos Palermo Suites.", sender: "client", timestamp: new Date(Date.now() - 3600000 * 24 - 60000 * 10).toISOString() },
        { id: "m2", text: "¡Hola! Claro que sí, con gusto te ayudo. Los departamentos de Palermo Suites inician desde $85,000 USD y cuentan con piscina, gimnasio y son pet-friendly. ¿Te gustaría conocer disponibilidad o agendar una visita?", sender: "agent", timestamp: new Date(Date.now() - 3600000 * 24 - 60000 * 9).toISOString() },
        { id: "m3", text: "Me interesa una visita. ¿Tiene elevador?", sender: "client", timestamp: new Date(Date.now() - 3600000 * 24 - 60000 * 7).toISOString() },
        { id: "m4", text: "Sí, todos nuestros edificios cuentan con elevadores inteligentes y de alta capacidad. Para agendar la visita guiada, ¿me compartirías tu correo y tu horario de preferencia?", sender: "agent", timestamp: new Date(Date.now() - 3600000 * 24 - 60000 * 6).toISOString() },
        { id: "m5", text: "Sí, carlos.men@gmail.com. Mañana a las 4:00 PM puedo.", sender: "client", timestamp: new Date(Date.now() - 3600000 * 24 - 60000 * 3).toISOString() },
        { id: "m6", text: "Perfecto, agendado para mañana a las 4:00 PM. ¡Saludos!", sender: "agent", timestamp: new Date(Date.now() - 3600000 * 24 - 60000 * 1).toISOString() }
      ]
    },
    {
      id: "conv-2",
      leadId: "lead-2",
      agentId: "agent-1",
      lastMessageText: "Excelente, ¿puede ir mi mascota conmigo? Es un perrito pequeño.",
      lastMessageTime: new Date(Date.now() - 3600000 * 12).toISOString(),
      status: "PendingHuman",
      messages: [
        { id: "m7", text: "Hola, vi el anuncio sobre los Lofts en el Centro amoblados.", sender: "client", timestamp: new Date(Date.now() - 3600000 * 12 - 60000 * 15).toISOString() },
        { id: "m8", text: "¡Hola! Qué gusto saludarte, Sofía. Sí, de hecho los Lofts Centro están amoblados de forma moderna para estudiantes o profesionales, desde $600 USD al mes, muy cerca del metro. ¿Te gustaría agendar una videollamada de recorrido virtual?", sender: "agent", timestamp: new Date(Date.now() - 3600000 * 12 - 60000 * 12).toISOString() },
        { id: "m9", text: "Excelente, ¿puede ir mi mascota conmigo? Es un perrito pequeño.", sender: "client", timestamp: new Date(Date.now() - 3600000 * 12 - 60000 * 10).toISOString() }
      ]
    }
  ],
  appointments: [
    {
      id: "appt-1",
      leadId: "lead-1",
      leadName: "Carlos Mendoza",
      dateTime: new Date(Date.now() + 3600000 * 16).toISOString().split('T')[0] + "T16:00:00.000Z",
      channel: "Google Calendar",
      status: "Agendada",
      notes: "Palermo Suites Visualizing"
    }
  ],
  users: [
    {
      uid: "user-default",
      name: "Administrador General",
      email: "agentechrisia@gmail.com",
      role: "Admin",
      permissions: ["CrearAgente", "VerMetricas", "ExportarLeads", "EditarRoles"],
      createdAt: new Date().toISOString()
    }
  ],
  notifications: [
    {
      id: "not-1",
      title: "Alerta Urgente",
      message: "El lead Sofía Castro ha solicitado hablar con un humano por dudas de la promoción.",
      type: "urgent",
      read: false,
      timestamp: new Date().toISOString()
    },
    {
      id: "not-2",
      title: "Nuevo Lead WhatsApp",
      message: "Se ha capturado el número y correo de Roberto Gómez en Inmobiliaria Express.",
      type: "lead",
      read: true,
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
    }
  ]
};

// Lazy initialization of Gemini client to prevent crash if no key provided yet
let aiClient: any = null;
function getGeminiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("La clave GEMINI_API_KEY no está configurada en los secretos de la plataforma.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Configurable verification token
let whatsappVerifyToken = "WhatsAppBotProToken2026";

// Helper to sync lead details with HubSpot CRM
async function pushLeadToHubSpot(lead: any) {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!token || token.trim() === "") {
    console.log("[HubSpot Sync] Token no configurado. Omitiendo.");
    return { success: false, warning: "Token no configurado" };
  }

  let firstName = lead.name;
  let lastName = "";
  const nameParts = lead.name.trim().split(/\s+/);
  if (nameParts.length > 1) {
    firstName = nameParts[0];
    lastName = nameParts.slice(1).join(" ");
  }

  const payload = {
    properties: {
      email: lead.email,
      firstname: firstName,
      lastname: lastName,
      phone: lead.phone,
      description: lead.notes || ""
    }
  };

  try {
    console.log(`[HubSpot Sync] Registrando en HubSpot: ${lead.email}...`);
    const response = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data: any = await response.json();

    if (response.status === 409 || (data.category === "CONFLICT" && data.message)) {
      console.log(`[HubSpot Sync] Conflicto de duplicado detectado. Intentando actualizar...`);
      const match = data.message.match(/Existing ID:\s*(\d+)/i);
      const existingId = match ? match[1] : null;

      if (existingId) {
        console.log(`[HubSpot Sync] Actualizando contacto existente ID: ${existingId}`);
        const updateResponse = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${existingId}`, {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            properties: {
              firstname: firstName,
              lastname: lastName,
              phone: lead.phone,
              description: lead.notes || ""
            }
          })
        });

        if (updateResponse.ok) {
          console.log(`[HubSpot Sync] Contacto actualizado con éxito.`);
          return { success: true, action: "updated", id: existingId };
        } else {
          const updateErr = await updateResponse.json();
          console.error("[HubSpot Sync Error] Fallo al actualizar:", updateErr);
          return { success: false, error: updateErr };
        }
      }
    }

    if (response.ok) {
      console.log(`[HubSpot Sync] Contacto creado con éxito. ID: ${data.id}`);
      return { success: true, action: "created", id: data.id };
    } else {
      console.error("[HubSpot Sync Error] Fallo al crear contacto:", data);
      return { success: false, error: data };
    }
  } catch (error) {
    console.error("[HubSpot Sync Error] Excepción al sincronizar:", error);
    return { success: false, error: String(error) };
  }
}

// 1. Health Endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// GET Endpoint for Meta WhatsApp Webhook verification
app.get("/api/whatsapp", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log(`[Meta WhatsApp Webhook Verification] Mode: ${mode}, Token: ${token}, Challenge: ${challenge}`);

  if (mode && token) {
    if (mode === "subscribe" && token === whatsappVerifyToken) {
      console.log("[Meta WhatsApp Webhook Verification] ¡Verificación de Webhook Exitosa!");
      return res.status(200).send(challenge);
    } else {
      console.warn("[Meta WhatsApp Webhook Verification] Error: verify_token inválido o modo incorrecto.");
      return res.status(403).json({ error: "Verification token mismatch" });
    }
  }
  return res.status(400).json({ error: "Missing webhook parameters" });
});

// GET Current Webhook configured details
app.get("/api/whatsapp/config", (req, res) => {
  res.json({
    verifyToken: whatsappVerifyToken,
    endpointUrl: "/api/whatsapp"
  });
});

// POST Endpoint to update verify token
app.post("/api/whatsapp/config", (req, res) => {
  const { verifyToken } = req.body;
  if (!verifyToken || verifyToken.trim() === "") {
    return res.status(400).json({ error: "El token de verificación no puede estar vacío." });
  }
  whatsappVerifyToken = verifyToken.trim();
  res.json({ status: "success", verifyToken: whatsappVerifyToken });
});

// Helper function to send outbound WhatsApp messages via Meta Graph API
async function sendWhatsAppMessage(phoneId: string, to: string, text: string) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const activePhoneId = phoneId || process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token) {
    console.warn("[WhatsApp API] No se pudo enviar el mensaje por WhatsApp porque la variable WHATSAPP_ACCESS_TOKEN no está configurada en el archivo .env.");
    return;
  }
  if (!activePhoneId) {
    console.warn("[WhatsApp API] No se pudo enviar el mensaje por WhatsApp porque no se recibió un Phone Number ID de Meta y WHATSAPP_PHONE_NUMBER_ID no está configurado.");
    return;
  }

  // Meta expects number without '+' or formatting, e.g. "56933207799"
  const cleanTo = to.replace(/[^0-9]/g, '');

  console.log(`[WhatsApp API] Enviando mensaje de respuesta a ${cleanTo} usando PhoneId: ${activePhoneId}...`);

  try {
    const response = await fetch(`https://graph.facebook.com/v20.0/${activePhoneId}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanTo,
        type: "text",
        text: {
          body: text
        }
      })
    });

    const data: any = await response.json();
    if (!response.ok) {
      console.error("[WhatsApp API Error] Error al enviar mensaje:", JSON.stringify(data, null, 2));
    } else {
      console.log(`[WhatsApp API Success] Mensaje enviado exitosamente a ${cleanTo}`);
    }
  } catch (error) {
    console.error("[WhatsApp API Error] Excepción al realizar petición a Meta:", error);
  }
}

// POST Endpoint for receiving WhatsApp Business API Webhooks (Real and Mock Simulator)
app.post("/api/whatsapp", async (req, res) => {
  try {
    const payload = req.body;
    console.log("[Meta WhatsApp Webhook Event Received]:", JSON.stringify(payload, null, 2));

    // Handle standard Meta payload format:
    // payload.entry[0].changes[0].value.messages[0]
    let incomingMessage = "";
    let customerPhone = "";
    let customerName = "Usuario de WhatsApp";
    let recipientNumber = "";
    let isMock = false;

    let webhookPhoneId = "";

    // Check if it is our custom UI simulator request or real Meta WhatsApp Webhook
    if (payload.isSimulated) {
      incomingMessage = payload.message || "Hola";
      customerPhone = payload.phone || "+52 55 9876 5432";
      customerName = payload.name || "Cliente Meta Simulado";
      recipientNumber = payload.recipientNumber || "";
      isMock = true;
    } else if (payload.entry && payload.entry[0]?.changes && payload.entry[0].changes[0]?.value) {
      const value = payload.entry[0].changes[0].value;
      if (value.messages && value.messages[0]) {
        const msg = value.messages[0];
        incomingMessage = msg.text?.body || "";
        customerPhone = "+" + msg.from; // e.g. "525512345678" -> "+525512345678"
        
        // Grab display name if available
        if (value.contacts && value.contacts[0]?.profile) {
          customerName = value.contacts[0].profile.name;
        }
      }
      if (value.metadata) {
        if (value.metadata.display_phone_number) {
          recipientNumber = value.metadata.display_phone_number;
        }
        if (value.metadata.phone_number_id) {
          webhookPhoneId = value.metadata.phone_number_id;
        }
      }
    }

    if (!incomingMessage) {
      // Just acknowledge non-message event updates (e.g. status read, delivery reciepts)
      return res.status(200).json({ status: "acknowledged", details: "No content or message found" });
    }

    // Now, associate this inbound WhatsApp message with an agent.
    // Try to find if there is an active conversation or default to agent-1 (Elena)
    let selectedAgent = database.agents[0]; // defaults to Elena (Inmobiliaria)
    let matchedByNumber = false;

    // 1st Priority: Match by specific recipient WhatsApp phone number
    if (recipientNumber) {
      const cleanRecipient = recipientNumber.replace(/[^0-9]/g, '');
      const matchedAgent = database.agents.find(a => {
        if (!a.whatsappNumber) return false;
        const cleanAgentNum = a.whatsappNumber.replace(/[^0-9]/g, '');
        return cleanAgentNum.includes(cleanRecipient) || cleanRecipient.includes(cleanAgentNum);
      });
      if (matchedAgent) {
        selectedAgent = matchedAgent;
        matchedByNumber = true;
        console.log(`[Meta Webhook Router] Mensaje enrutado por número de WhatsApp receptor: ${recipientNumber} -> Agente: ${selectedAgent.name}`);
      }
    }

    // Look if lead already exists
    let existingLead = database.leads.find(l => {
      const cleanDb = l.phone.replace(/[^0-9]/g, '');
      const cleanIn = customerPhone.replace(/[^0-9]/g, '');
      return cleanDb.includes(cleanIn) || cleanIn.includes(cleanDb);
    });

    if (existingLead) {
      // If we matched the agent by number, keep it as it's the specific department. Otherwise, fall back to historical lead assignment
      if (!matchedByNumber) {
        const associatedAgent = database.agents.find(a => a.id === existingLead?.agentId);
        if (associatedAgent) {
          selectedAgent = associatedAgent;
        }
      }
    } else {
      // Create new Lead!

      existingLead = {
        id: "lead-" + Math.random().toString(36).substring(2, 9),
        name: customerName,
        phone: customerPhone,
        email: customerName.toLowerCase().replace(/\s+/g, '') + "@whatsapp.com",
        status: "Nuevo",
        notes: `Capturado automáticamente por Webhook de WhatsApp (${isMock ? 'Simulación Express' : 'Meta Business Production'}).`,
        timestamp: new Date().toISOString(),
        agentId: selectedAgent.id,
        score: 3
      };
      
      database.leads = [existingLead, ...database.leads];
    }

    // Resolve conversation thread
    let conversation = database.conversations.find(c => c.leadId === existingLead?.id);
    if (!conversation) {
      conversation = {
        id: "conv-" + Math.random().toString(36).substring(2, 9),
        leadId: existingLead.id,
        agentId: selectedAgent.id,
        lastMessageText: incomingMessage,
        lastMessageTime: new Date().toISOString(),
        status: "Open",
        messages: []
      };
      database.conversations = [conversation, ...database.conversations];
    }

    // Append client message
    const clientMsgId = "msg-" + Math.random().toString(36).substring(2, 9);
    conversation.messages.push({
      id: clientMsgId,
      text: incomingMessage,
      sender: "client",
      timestamp: new Date().toISOString()
    });
    conversation.lastMessageText = incomingMessage;
    conversation.lastMessageTime = new Date().toISOString();

    // Trigger push notification to active UI users
    const pushTitle = isMock ? "Webhook Simulador" : "Meta Webhook Activo";
    const pushMsg = `Inbound WhatsApp de ${existingLead.name}: "${incomingMessage}"`;
    
    // Create notification item in database
    const newNot = {
      id: "not-" + Math.random().toString(36).substring(2, 9),
      title: pushTitle,
      message: pushMsg,
      type: "lead" as "lead" | "urgent" | "info",
      read: false,
      timestamp: new Date().toISOString()
    };
    database.notifications = [newNot, ...database.notifications];

    // Generate responsive AI message from simulated Bot
    let responseText = "¡Hola! Estoy procesando tu mensaje con nuestra inteligencia artificial empresarial. Para darte la mejor respuesta de inmediato, indícanos tu nombre e interés.";
    
    // We can simulate bot responding back after short delay (or do it synchronously here using heuristic or Gemini)
    // For maximum UX, let's call local fallback or Gemini immediately
    try {
      const ai = getGeminiClient();
      const systemPrompt = `Eres un chatbot de WhatsApp empresarial (${selectedAgent.name}). Idioma: ${selectedAgent.language}. Responde breve, amable y directo.`;
      const prompt = `Información de entrenamiento:\n${selectedAgent.trainingData}\n\nMensaje recibido: ${incomingMessage}\nRespuesta de WhatsApp breve con formato:`;
      const aiResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        }
      });
      responseText = aiResponse.text || responseText;
    } catch (e) {
      // Fallback
      if (selectedAgent.id === "agent-1") {
        responseText = `¡Hola! Gracias por escribir a Inmobiliaria Express 🏠. Mi nombre es Elena. En un momento te brindamos toda la información de Palermo Suites o Lofts Centro. ¿Tus datos de email son correctos?`;
      } else {
        responseText = `¡Hola! Gracias por contactarme. Soy ${selectedAgent.name}, tu asistente virtual. He recibido tu mensaje y estoy listo para ayudarte. ¿En qué puedo apoyarte hoy?`;
      }
    }

    // Append bot response
    const botMsgId = "msg-" + Math.random().toString(36).substring(2, 9);
    conversation.messages.push({
      id: botMsgId,
      text: responseText,
      sender: "agent",
      timestamp: new Date().toISOString()
    });
    conversation.lastMessageText = responseText;
    conversation.lastMessageTime = new Date().toISOString();

    console.log(`[Meta WhatsApp Webhook response sent as ${selectedAgent.name}] -> ${responseText}`);

    if (!isMock) {
      // Call Meta Graph API asynchronously (without blocking response)
      sendWhatsAppMessage(webhookPhoneId, customerPhone, responseText).catch(e => {
        console.error("Error sending async WhatsApp message:", e);
      });
    }

    // Sync with HubSpot in background
    pushLeadToHubSpot(existingLead).catch(e => {
      console.error("[WhatsApp Webhook] Fallo en la sincronización automática con HubSpot:", e);
    });

    return res.status(200).json({
      status: "success",
      event: "message_processed",
      phone: customerPhone,
      sender: customerName,
      agentAssigned: selectedAgent.name,
      replySent: responseText
    });

  } catch (err: any) {
    console.error("Error in Webhook reception handler:", err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Main data fetching
app.get("/api/data", (req, res) => {
  res.json(database);
});

// 3. Save updates
app.post("/api/save", (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key || !value) {
       return res.status(400).json({ error: "Missing key or value" });
    }
    
    if (key === "agents") database.agents = value;
    else if (key === "leads") database.leads = value;
    else if (key === "conversations") database.conversations = value;
    else if (key === "appointments") database.appointments = value;
    else if (key === "users") database.users = value;
    else if (key === "notifications") database.notifications = value;
    else {
      return res.status(400).json({ error: "Invalid database collection key: " + key });
    }

    res.json({ status: "success", saved: key });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST Endpoint to authenticate admin user
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  const expectedUsername = process.env.ADMIN_USERNAME || "admin";
  const expectedPassword = process.env.ADMIN_PASSWORD || "admin000";

  console.log(`[Auth API] Intento de login para usuario: "${username}"`);

  if (username === expectedUsername && password === expectedPassword) {
    console.log(`[Auth API Success] Login exitoso para "${username}"`);
    return res.json({ success: true, token: "session-active-token" });
  } else {
    console.warn(`[Auth API Warning] Login fallido para "${username}"`);
    return res.status(401).json({ success: false, error: "Usuario o contraseña incorrectos." });
  }
});

// 4. Sincronización con HubSpot CRM (Manual)
app.post("/api/crm/push", async (req, res) => {
  const { lead } = req.body;
  if (!lead) {
    return res.status(400).json({ error: "No lead provided" });
  }

  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!token || token.trim() === "") {
    console.log(`[CRM INTEGRATION] Token HubSpot no configurado. Simulando registro para ${lead.name}.`);
    return res.json({
      status: "Integrated",
      message: `[Simulación] Cliente ${lead.name} registrado con éxito (Token HUBSPOT_ACCESS_TOKEN no configurado en secretos).`,
      sentData: {
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        crmScore: lead.score,
        origin: "WhatsApp Integration Simulator"
      }
    });
  }

  const result = await pushLeadToHubSpot(lead);
  if (result.success) {
    return res.json({
      status: "Integrated",
      message: `Cliente ${lead.name} sincronizado con éxito en HubSpot (${result.action === 'created' ? 'Creado nuevo' : 'Actualizado existente'}).`,
      sentData: {
        id: result.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        origin: "HubSpot CRM Direct Integration"
      }
    });
  } else {
    return res.status(500).json({
      error: "Error al sincronizar con HubSpot",
      details: result.error || result.warning
    });
  }
});

// 5. Intelligent Gemini powered Chat simulation endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message, agentId, conversationHistory } = req.body;
    
    if (!message || !agentId) {
      return res.status(400).json({ error: "Por favor provee un mensaje y un AgentID." });
    }

    const agent = database.agents.find(a => a.id === agentId);
    if (!agent) {
       return res.status(404).json({ error: "Agente no encontrado." });
    }

    // Build chat history structure for Gemini
    const systemPrompt = `Eres un agente de mensajería de WhatsApp para atención automatizada.
Información del agente:
Nombre: ${agent.name}
Idioma de respuesta: ${agent.language || 'Español'}

BASE DE ENTRENAMIENTO EMPRESARIAL (Sigue estrictamente esta información para responder, NUNCA inventes mentiras ni des datos incorrectos):
----------------------------------
${agent.trainingData}
----------------------------------

Garantiza respuestas breves, amigables, humanas y con formato de WhatsApp (puedes usar negritas con asterisco, emojis, saltos de línea ordenados).
NUESTRAS PRIORIDADES DE NEGOCIO:
1. Responder las dudas iniciales.
2. Capturar los datos de contacto (Nombre, WhatsApp o Teléfono, Email) si aún no los conocemos.
3. Si el usuario solicita agendar, invítale a proponer un día y hora concretos.
4. Si pide hablar con un humano o asesor real, dile que lo derivarás inmediatamente e invita a tener paciencia.

Genera ÚNICAMENTE el texto que el agente debe responder por WhatsApp, sin metadatos ni etiquetas adicionales.`;

    try {
      const ai = getGeminiClient();
      
      // Call Gemini 3.5 Flash for latency and high quality
      const formattedHistory = (conversationHistory || []).map((m: any) => {
        return `${m.sender === 'client' ? 'Cliente' : 'Agente'}: ${m.text}`;
      }).join("\n");

      const prompt = `Historial actual de conversación:\n${formattedHistory}\n\nCliente: ${message}\nAgente (responde según tu entrenamiento empresarial):`;

      const aiResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        }
      });

      const responseText = aiResponse.text || "Entendido. ¿Me podrías brindar más detalles?";
      return res.json({ response: responseText.trim() });

    } catch (geminiErr: any) {
      console.warn("Gemini execution failed, falling back to heuristic answers:", geminiErr.message);
      
      // Friendly, highly customizable rule-based answering fallback when API key is not fully configured yet
      let fallbackText = "¡Hola! Estoy revisando tu solicitud sobre nuestra empresa. Para darte la mejor asesoría inmediata, ¿me podrías indicar cuál de nuestros servicios te interesa más o tu horario de preferencia?";
      
      const lowerMsg = message.toLowerCase();
      if (lowerMsg.includes("precio") || lowerMsg.includes("costo") || lowerMsg.includes("cuanto cuesta")) {
        if (agentId === "agent-1") {
          fallbackText = "Nuestros desarrollos inmobiliarios en Palermo Suites inician desde los *$85,000 USD* con acabados premium, y los Lofts centrales amoblados en alquiler desde *$600 USD/mes*. ¿Te gustaría agendar una videollamada para revisar el catálogo?";
        } else {
          fallbackText = "¡Por supuesto! En la clínica contamos con Limpieza de Ultrasonido a *$40 USD* y Blanqueamiento LED a *$120 USD* con promoción especial 2x1 esta semana. ¿Prefieres agendar por la mañana o por la tarde?";
        }
      } else if (lowerMsg.includes("visita") || lowerMsg.includes("cita") || lowerMsg.includes("agendar") || lowerMsg.includes("horario")) {
        fallbackText = "¡Claro! Me encantaría agendar tu hora. ¿Qué te parece coordinar una cita? Compárteme tu *Nombre Completo, Teléfono e Email* y el día de tu preferencia para reservar de inmediato en nuestro Google Calendar.";
      } else if (lowerMsg.includes("humano") || lowerMsg.includes("persona") || lowerMsg.includes("asesor") || lowerMsg.includes("hablar")) {
        fallbackText = "De acuerdo. Estoy enviando una Alerta Urgente al Panel de Control para que uno de nuestros asesores humanos tome el control de este chat de WhatsApp. ¡Por favor espera un minuto!";
      }

      return res.json({ 
        response: fallbackText,
        isFallback: true,
        warning: "Operando en modo de respuesta simulado local por GEMINI_API_KEY no ingresado aún en secretos."
      });
    }

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Setup server and integrate client-side
async function startServer() {
  // Determine environment
  const isProdEnv = process.env.NODE_ENV === "production";
  const isCompiled = typeof __filename !== 'undefined' && __filename.endsWith("server.cjs");
  const useProductionMode = isProdEnv || isCompiled;

  console.log(`[Server Setup] Starting server in ${useProductionMode ? 'PRODUCTION' : 'DEVELOPMENT'} mode.`);
  console.log(`[Server Setup] Environment variables: NODE_ENV=${process.env.NODE_ENV || 'undefined'}, isCompiled=${isCompiled}`);

  // General request logging middleware
  app.use((req, res, next) => {
    console.log(`[HTTP Request] ${req.method} ${req.url}`);
    next();
  });

  if (!useProductionMode) {
    console.log("[Server Setup] Initializing Vite Dev Server...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    console.log(`[Server Setup] Production mode: Serving static files from distPath="${distPath}"`);
    
    // Check if dist directory and index.html exist
    const fs = require('fs');
    if (!fs.existsSync(distPath)) {
      console.error(`[Server Setup ERROR] The distribution folder "${distPath}" does NOT exist! Make sure to run "npm run build" first.`);
    } else {
      console.log(`[Server Setup] Distribution folder exists. Contents:`, fs.readdirSync(distPath));
      const assetsPath = path.join(distPath, 'assets');
      if (fs.existsSync(assetsPath)) {
        console.log(`[Server Setup] Assets folder exists. Contents:`, fs.readdirSync(assetsPath));
      } else {
        console.warn(`[Server Setup WARNING] Assets folder does NOT exist at "${assetsPath}"!`);
      }
    }

    // Static files middleware with explicit header setting and fallback warning
    app.use(express.static(distPath, {
      setHeaders: (res, filePath) => {
        console.log(`[Static File Served] Path: ${filePath}`);
        if (filePath.endsWith('.js')) {
          res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
          console.log(`[Static File Content-Type Set] application/javascript for ${path.basename(filePath)}`);
        } else if (filePath.endsWith('.css')) {
          res.setHeader('Content-Type', 'text/css; charset=utf-8');
          console.log(`[Static File Content-Type Set] text/css for ${path.basename(filePath)}`);
        }
      }
    }));

    // Wildcard fallback
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (!fs.existsSync(indexPath)) {
        console.error(`[Server Setup ERROR] index.html not found at "${indexPath}" for fallback route!`);
        return res.status(404).send("Application files not found. Please build the application.");
      }
      res.sendFile(indexPath);
    });
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server fully operational on port ${PORT}`);
  });
}

startServer();
