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
      name: "Elena (GravityMed)",
      status: "Active",
      language: "Español",
      quickReplies: "Exámenes y Precios, Horarios y Dirección, Agendar Examen, Hablar con Humano",
      crmWebhookUrl: "https://api.hubapi.com/crm/v3/objects/contacts",
      trainingData: `Eres Elena, la asistente virtual experta del centro médico GravityMed.
Ubicación: Calle 2 norte 1334, Talca.
Horario de atención: Lunes a Domingo de 9:00 am a 19:00 pm.
GravityMed es un centro de excelencia que ofrece servicios de exámenes de resonancia magnética.

Tu rol es entregar información detallada sobre los exámenes de resonancia magnética disponibles, sus indicaciones y sus valores.
Los pacientes pueden optar por el valor FONASA (con copago/bono) o el valor Particular.

Para agendar un examen, debes verificar la disponibilidad horaria del paciente y solicitar obligatoriamente los siguientes datos personales:
1. Nombre completo
2. RUT (Rol Único Tributario)
3. Correo electrónico
4. Teléfono de contacto

Indica al paciente que apenas se complete el agendamiento del examen, se registrará en el sistema (CRM HubSpot) y se le enviará una notificación automática de confirmación.

Aquí está la tabla oficial de precios y exámenes de resonancia magnética en GravityMed:
- Resonancia Magnética de Cerebro / Cerebral: Particular: $180.000 CLP | FONASA: $90.000 CLP
- Resonancia Magnética de Columna (Cervical / Dorsal / Lumbar): Particular: $170.000 CLP | FONASA: $85.000 CLP
- Resonancia Magnética de Rodilla: Particular: $160.000 CLP | FONASA: $80.000 CLP
- Resonancia Magnética de Hombro: Particular: $165.000 CLP | FONASA: $82.500 CLP
- Resonancia Magnética de Abdomen / Pelvis: Particular: $220.000 CLP | FONASA: $110.000 CLP
- Resonancia Magnética Cerebral con Contraste: Particular: $240.000 CLP | FONASA: $120.000 CLP

Reglas de comportamiento y tono:
- Responde siempre de manera muy empática, profesional y concisa (ideal para chat de WhatsApp).
- Si el paciente desea agendar, pídele amablemente los datos personales que falten (Nombre, RUT, Correo, Teléfono de contacto).
- Explícale que se le notificará inmediatamente al finalizar la reserva.`,
      createdAt: new Date().toISOString(),
      whatsappNumber: "+569 33207799",
      trainingFiles: [
        {
          id: "seed-file-1",
          name: "valores_resonancias_gravitymed.pdf",
          size: "1.15 MB",
          uploadedAt: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
          charCount: 780,
          extractedText: `--- DOCUMENTO MEMORIA PDF: valores_resonancias_gravitymed.pdf ---
Fecha de Escaneo por IA: 13/06/2026
GravityMed Talca - Tabla Oficial de Aranceles para Resonancia Magnética (2026)
Dirección: Calle 2 norte 1334, Talca.

EXAMEN | CÓDIGO FONASA | VALOR PARTICULAR | COPAGO FONASA (Nivel B/C/D)
--------------------------------------------------------------------------
Resonancia Magnética de Cerebro | 0405001 | $180.000 | $90.000
Resonancia Magnética de Columna Cervical | 0405002 | $170.000 | $85.000
Resonancia Magnética de Columna Dorsal | 0405003 | $170.000 | $85.000
Resonancia Magnética de Columna Lumbar | 0405004 | $170.000 | $85.000
Resonancia Magnética de Rodilla | 0405005 | $160.000 | $80.000
Resonancia Magnética de Hombro | 0405006 | $165.000 | $82.500
Resonancia Magnética de Abdomen y Pelvis | 0405007 | $220.000 | $110.000
Resonancia Magnética Cerebral con Contraste | 0405008 | $240.000 | $120.000

Instrucciones de Agendamiento:
- Se requiere orden médica para realizar cualquier resonancia magnética.
- Ayuno mínimo de 4 horas para exámenes con contraste.
- Presentar RUT y credencial de Fonasa/Isapre al momento del ingreso.`
        }
      ]
    }
  ],
  leads: [
    {
      id: "lead-1",
      name: "Juan Pérez",
      phone: "+56 9 1234 5678",
      email: "juan.perez@gmail.com",
      status: "Cita Agendada",
      notes: "RUT: 12.345.678-9. Interesado en Resonancia Lumbar por dolor de espalda agudo.",
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
      agentId: "agent-1",
      score: 5
    },
    {
      id: "lead-2",
      name: "María González",
      phone: "+56 9 9876 5432",
      email: "mgonzalez@outlook.com",
      status: "Contactado",
      notes: "Consulta por valor de resonancia cerebral con contraste. Tiene Fonasa.",
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
      agentId: "agent-1",
      score: 4
    },
    {
      id: "lead-3",
      name: "Andrés Silva",
      phone: "+56 9 4567 8901",
      email: "asilva@yahoo.com",
      status: "Nuevo",
      notes: "Preguntó por ubicación del centro en Talca y horarios.",
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
      lastMessageText: "Perfecto, agendado para mañana a las 11:00 AM. ¡Saludos!",
      lastMessageTime: new Date(Date.now() - 3600000 * 24).toISOString(),
      status: "Open",
      messages: [
        { id: "m1", text: "Hola, necesito saber el valor de una resonancia de columna lumbar.", sender: "client", timestamp: new Date(Date.now() - 3600000 * 24 - 60000 * 10).toISOString() },
        { id: "m2", text: "¡Hola! Claro que sí. En GravityMed, la resonancia de columna lumbar tiene un valor de $170.000 Particular y $85.000 con Fonasa. ¿Te gustaría agendar una hora?", sender: "agent", timestamp: new Date(Date.now() - 3600000 * 24 - 60000 * 9).toISOString() },
        { id: "m3", text: "Sí, me sirve. Tengo Fonasa. ¿Tienen disponible mañana a las 11:00 AM?", sender: "client", timestamp: new Date(Date.now() - 3600000 * 24 - 60000 * 7).toISOString() },
        { id: "m4", text: "Sí, tenemos disponibilidad a esa hora. Para completar la reserva, por favor confírmame tu nombre completo, RUT, correo y teléfono.", sender: "agent", timestamp: new Date(Date.now() - 3600000 * 24 - 60000 * 6).toISOString() },
        { id: "m5", text: "Juan Pérez, 12.345.678-9, juan.perez@gmail.com, +56912345678.", sender: "client", timestamp: new Date(Date.now() - 3600000 * 24 - 60000 * 3).toISOString() },
        { id: "m6", text: "Perfecto, agendado para mañana a las 11:00 AM. ¡Saludos!", sender: "agent", timestamp: new Date(Date.now() - 3600000 * 24 - 60000 * 1).toISOString() }
      ]
    },
    {
      id: "conv-2",
      leadId: "lead-2",
      agentId: "agent-1",
      lastMessageText: "Consulta de valor de resonancia cerebral con contraste. Tiene Fonasa.",
      lastMessageTime: new Date(Date.now() - 3600000 * 12).toISOString(),
      status: "PendingHuman",
      messages: [
        { id: "m7", text: "Hola, quisiera saber si tienen resonancia cerebral con contraste y qué precio tiene.", sender: "client", timestamp: new Date(Date.now() - 3600000 * 12 - 60000 * 15).toISOString() },
        { id: "m8", text: "¡Hola, María! Sí, realizamos resonancia cerebral con contraste. El valor Particular es de $240.000 y con copago Fonasa es de $120.000. Recuerda que para este examen se requiere ayuno mínimo de 4 horas y orden médica. ¿Deseas buscar una hora para agendar?", sender: "agent", timestamp: new Date(Date.now() - 3600000 * 12 - 60000 * 12).toISOString() },
        { id: "m9", text: "Perfecto, deja consultar con mi médico la orden y les vuelvo a escribir.", sender: "client", timestamp: new Date(Date.now() - 3600000 * 12 - 60000 * 10).toISOString() }
      ]
    }
  ],
  appointments: [
    {
      id: "appt-1",
      leadId: "lead-1",
      leadName: "Juan Pérez",
      dateTime: new Date(Date.now() + 3600000 * 16).toISOString().split('T')[0] + "T11:00:00.000Z",
      channel: "Google Calendar",
      status: "Agendada",
      notes: "Resonancia Lumbar - Fonasa"
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
      message: "El lead María González ha solicitado hablar con un humano por dudas de la promoción.",
      type: "urgent",
      read: false,
      timestamp: new Date().toISOString()
    },
    {
      id: "not-2",
      title: "Nuevo Lead WhatsApp",
      message: "Se ha capturado el número y correo de Andrés Silva en GravityMed.",
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

// Shared scheduler and entity extractor utilizing Gemini
async function processSchedulingAndCRM(
  incomingMessage: string,
  historyMessages: { sender: string; text: string }[],
  existingLead: any,
  agentName: string,
  trainingData: string,
  language: string,
  isWebhook: boolean
): Promise<string | null> {
  const ai = getGeminiClient();
  let extractedData = {
    name: null,
    rut: null,
    email: null,
    phone: null,
    intentToSchedule: false,
    dateTime: null,
    exam: null,
    insurance: null
  };

  try {
    const parsePrompt = `Analiza la conversación de WhatsApp entre un paciente y un asistente médico. Extrae los datos del paciente en formato JSON estricto.
Historial completo de conversación:
${historyMessages.map((m: any) => `${m.sender === 'client' ? 'Paciente' : 'Asistente'}: ${m.text}`).join("\n")}
Paciente (último mensaje): ${incomingMessage}

Genera ÚNICAMENTE un objeto JSON válido con las siguientes llaves (usa null si no se menciona o no está claro):
{
  "name": "Nombre completo extraído del paciente (solo si lo menciona explícitamente en el chat)",
  "rut": "RUT chileno extraído (formato 12.345.678-9 o similar)",
  "email": "Correo electrónico extraído",
  "phone": "Teléfono de contacto extraído",
  "intentToSchedule": true/false (solo si el paciente desea confirmar, coordinar o agendar un examen de resonancia en una fecha/hora específicas en el último mensaje)",
  "dateTime": "Fecha y hora solicitada en formato ISO (ej. 2026-06-15T10:00:00.000Z) calculada a partir del mensaje si se define un slot de tiempo",
  "exam": "Nombre del examen de resonancia magnética solicitado",
  "insurance": "Fonasa" o "Particular"
}
Respuesta en JSON:`;

    const parseResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: parsePrompt,
    });

    const text = parseResponse.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      extractedData = { ...extractedData, ...parsed };
    }
  } catch (e) {
    console.error("[Entity Extraction Error] Failed to parse entities:", e);
  }

  console.log("[Extraction Result] Extracted fields:", JSON.stringify(extractedData));

  // Update lead information if extracted
  let leadUpdated = false;
  if (extractedData.name && extractedData.name !== existingLead.name && !extractedData.name.toLowerCase().includes("usuario") && !extractedData.name.toLowerCase().includes("simulado")) {
    existingLead.name = extractedData.name;
    leadUpdated = true;
  }
  if (extractedData.email && extractedData.email !== existingLead.email && !extractedData.email.includes("@whatsapp.com") && extractedData.email !== "cliente@empresa.com") {
    existingLead.email = extractedData.email;
    leadUpdated = true;
  }
  if (extractedData.phone && extractedData.phone !== existingLead.phone) {
    existingLead.phone = extractedData.phone;
    leadUpdated = true;
  }
  if (extractedData.rut) {
    const rutLabel = `RUT: ${extractedData.rut}`;
    if (!existingLead.notes.includes(rutLabel)) {
      existingLead.notes = `${rutLabel}. ${existingLead.notes}`.trim();
      leadUpdated = true;
    }
  }

  // Force score update if they provide detailed data
  if (leadUpdated) {
    existingLead.score = Math.min(5, (existingLead.score || 3) + 1);
  }

  // Check if user is intending to schedule and we have a valid date/time
  if (extractedData.intentToSchedule && extractedData.dateTime) {
    const requestedTime = new Date(extractedData.dateTime);
    
    // Real-time availability check: verify if there is an overlapping appointment (within 45 minutes)
    const isSlotBusy = database.appointments.some((appt: any) => {
      const apptTime = new Date(appt.dateTime);
      const diffMs = Math.abs(apptTime.getTime() - requestedTime.getTime());
      return diffMs < 45 * 60 * 1000 && appt.status !== "Cancelada";
    });

    if (isSlotBusy) {
      // Overlapping appointment detected: reject slot
      const timeStr = requestedTime.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
      const dateStr = requestedTime.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
      return `Lo lamento, pero el horario del *${dateStr}* a las *${timeStr}* ya está reservado por otro paciente. ¿Tendrías disponibilidad en otro horario entre las 9:00 y las 19:00?`;
    }

    // Check if required fields (Name, RUT, Email) are complete. If not, prompt for them
    const missingFields = [];
    const lowerName = existingLead.name.toLowerCase();
    if (!existingLead.name || lowerName.includes("usuario") || lowerName.includes("simulado") || lowerName === "nuevo cliente manual") {
      missingFields.push("Nombre Completo");
    }
    if (!existingLead.notes.includes("RUT:")) {
      missingFields.push("RUT");
    }
    if (!existingLead.email || existingLead.email.includes("@whatsapp.com") || existingLead.email === "cliente@empresa.com") {
      missingFields.push("Correo Electrónico");
    }

    if (missingFields.length > 0) {
      const timeStr = requestedTime.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
      const dateStr = requestedTime.toLocaleDateString('es-CL', { day: 'numeric', month: 'numeric', year: 'numeric' });
      return `¡Tengo disponibilidad para tu examen de *Resonancia de ${extractedData.exam || 'Cerebro'}* el día *${dateStr}* a las *${timeStr}*! 📅\n\nPara poder confirmar y registrar tu reserva en el sistema, por favor indícame tu *${missingFields.join(", ")}*.`;
    }

    // Complete details are present! Schedule the appointment!
    const apptId = "appt-" + Math.random().toString(36).substring(2, 9);
    const newAppt = {
      id: apptId,
      leadId: existingLead.id,
      leadName: existingLead.name,
      dateTime: requestedTime.toISOString(),
      channel: "Google Calendar" as const,
      status: "Agendada" as const,
      notes: `Resonancia: ${extractedData.exam || 'Cerebro'} - Previsión: ${extractedData.insurance || 'Particular'}`
    };

    database.appointments = [...database.appointments, newAppt];
    existingLead.status = "Cita Agendada";
    existingLead.score = 5;

    // Trigger urgent notification on active admin dashboard
    const notMsg = `Resonancia de ${extractedData.exam || 'Cerebro'} agendada para ${existingLead.name} (RUT: ${extractedData.rut || 'N/A'}) el ${requestedTime.toLocaleDateString('es-CL')} a las ${requestedTime.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}. Sincronizado en HubSpot.`;
    const newNot = {
      id: "not-" + Math.random().toString(36).substring(2, 9),
      title: "Cita Agendada (GravityMed)",
      message: notMsg,
      type: "urgent" as const,
      read: false,
      timestamp: new Date().toISOString()
    };
    database.notifications = [newNot, ...database.notifications];

    // Push updated lead info to HubSpot CRM
    pushLeadToHubSpot(existingLead).catch(e => {
      console.error("[HubSpot Sync Error] Failed background sync:", e);
    });

    const timeStr = requestedTime.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
    const dateStr = requestedTime.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });

    return `✅ *¡Examen Agendado Exitosamente!*\n\nHola *${existingLead.name}*, confirmamos tu hora para una *Resonancia de ${extractedData.exam || 'Cerebro'}*:\n\n📅 *Fecha:* ${dateStr}\n⏰ *Hora:* ${timeStr}\n📍 *Dirección:* Calle 2 norte 1334, Talca (GravityMed)\n\n*Datos Registrados en CRM:*\n- RUT: ${extractedData.rut || 'N/A'}\n- Correo: ${existingLead.email}\n- Teléfono: ${existingLead.phone}\n- Previsión: ${extractedData.insurance || 'Particular'}\n\nTe hemos enviado un correo de confirmación y recibirás una notificación de recordatorio. ¡Que tengas un excelente día!`;
  }

  // If lead info was updated but we are not scheduling yet, we sync with HubSpot in background too
  if (leadUpdated) {
    pushLeadToHubSpot(existingLead).catch(e => {
      console.error("[HubSpot Sync Error] Failed background sync:", e);
    });
  }

  return null;
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
    
    // 1st Priority: Check if there's any scheduling action or client details update to process
    let schedulingReply: string | null = null;
    try {
      schedulingReply = await processSchedulingAndCRM(
        incomingMessage,
        conversation.messages.slice(0, -1), // pass history excluding the current message
        existingLead,
        selectedAgent.name,
        selectedAgent.trainingData,
        selectedAgent.language || "Español",
        !isMock
      );
    } catch (schedErr) {
      console.error("[Scheduling Engine Error in webhook]:", schedErr);
    }

    if (schedulingReply) {
      responseText = schedulingReply;
    } else {
      // We can simulate bot responding back after short delay (or do it synchronously here using heuristic or Gemini)
      // For maximum UX, let's call local fallback or Gemini immediately
      try {
        const ai = getGeminiClient();
        const systemPrompt = `Eres un chatbot de WhatsApp empresarial (${selectedAgent.name}). Idioma: ${selectedAgent.language || 'Español'}. Responde breve, amable y directo.`;
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
          responseText = `¡Hola! Gracias por escribir a GravityMed 🩺. Mi nombre es Elena. En un momento te brindamos toda la información de nuestras resonancias magnéticas y valores Fonasa/Particular. ¿Tus datos de email son correctos?`;
        } else {
          responseText = `¡Hola! Gracias por contactarme. Soy ${selectedAgent.name}, tu asistente virtual. He recibido tu mensaje y estoy listo para ayudarte. ¿En qué puedo apoyarte hoy?`;
        }
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

    // Ensure simulated lead exists in the database
    let existingLead = database.leads.find(l => l.phone === "+56 9 9999 9999");
    if (!existingLead) {
      existingLead = {
        id: "lead-simulated",
        name: "Usuario Simulado",
        phone: "+56 9 9999 9999",
        email: "simulado@gravitymed.cl",
        status: "Nuevo",
        notes: "Creado automáticamente para simulación de chat en tiempo real.",
        timestamp: new Date().toISOString(),
        agentId: agent.id,
        score: 3
      };
      database.leads = [existingLead, ...database.leads];
    }

    let conversation = database.conversations.find(c => c.leadId === existingLead?.id);
    if (!conversation) {
      conversation = {
        id: "conv-simulated",
        leadId: existingLead.id,
        agentId: agent.id,
        lastMessageText: message,
        lastMessageTime: new Date().toISOString(),
        status: "Open",
        messages: []
      };
      database.conversations = [conversation, ...database.conversations];
    }

    // Sync conversation history messages from request
    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversation.messages = conversationHistory.map((m: any, index: number) => ({
        id: `msg-sim-${index}`,
        text: m.text,
        sender: m.sender,
        timestamp: new Date().toISOString()
      }));
    }

    // Append client message
    conversation.messages.push({
      id: `msg-sim-user-${Date.now()}`,
      text: message,
      sender: "client",
      timestamp: new Date().toISOString()
    });
    conversation.lastMessageText = message;
    conversation.lastMessageTime = new Date().toISOString();

    // 1st Priority: Check if there's any scheduling action or client details update to process
    let schedulingReply: string | null = null;
    try {
      schedulingReply = await processSchedulingAndCRM(
        message,
        conversation.messages.slice(0, -1),
        existingLead,
        agent.name,
        agent.trainingData,
        agent.language || "Español",
        false
      );
    } catch (schedErr) {
      console.error("[Scheduling Engine Error in simulator]:", schedErr);
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
2. Capturar los datos de contacto (Nombre, RUT, Correo, Teléfono de contacto) si aún no los conocemos.
3. Si el usuario solicita agendar, invítale a proponer un día y hora concretos.
4. Si pide hablar con un humano o asesor real, dile que lo derivarás inmediatamente e invita a tener paciencia.

Genera ÚNICAMENTE el texto que el agente debe responder por WhatsApp, sin metadatos ni etiquetas adicionales.`;

    let responseText = "";

    if (schedulingReply) {
      responseText = schedulingReply;
      
      // Append bot response to the simulated conversation log
      conversation.messages.push({
        id: `msg-sim-bot-${Date.now()}`,
        text: responseText,
        sender: "agent",
        timestamp: new Date().toISOString()
      });
      conversation.lastMessageText = responseText;
      conversation.lastMessageTime = new Date().toISOString();
      
      return res.json({ response: responseText.trim() });
    }

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

      responseText = aiResponse.text || "Entendido. ¿Me podrías brindar más detalles?";
      
      // Append bot response
      conversation.messages.push({
        id: `msg-sim-bot-${Date.now()}`,
        text: responseText,
        sender: "agent",
        timestamp: new Date().toISOString()
      });
      conversation.lastMessageText = responseText;
      conversation.lastMessageTime = new Date().toISOString();

      return res.json({ response: responseText.trim() });

    } catch (geminiErr: any) {
      console.warn("Gemini execution failed, falling back to heuristic answers:", geminiErr.message);
      
      // Friendly, highly customizable rule-based answering fallback when API key is not fully configured yet
      let fallbackText = "¡Hola! Estoy revisando tu solicitud sobre nuestra empresa. Para darte la mejor asesoría inmediata, ¿me podrías indicar cuál de nuestros servicios te interesa más o tu horario de preferencia?";
      
      const lowerMsg = message.toLowerCase();
      if (lowerMsg.includes("precio") || lowerMsg.includes("costo") || lowerMsg.includes("cuanto cuesta")) {
        if (agentId === "agent-1") {
          fallbackText = "En GravityMed Talca 🩺, las resonancias magnéticas de cerebro tienen un valor de *$180.000 Particular* y *$90.000 FONASA*, y las resonancias de columna tienen un valor de *$170.000 Particular* y *$85.000 FONASA*. ¿Te gustaría agendar una hora para tu examen?";
        } else {
          fallbackText = "¡Por supuesto! En la clínica contamos con Limpieza de Ultrasonido a *$40 USD* y Blanqueamiento LED a *$120 USD* con promoción especial 2x1 esta semana. ¿Prefieres agendar por la mañana o por la tarde?";
        }
      } else if (lowerMsg.includes("visita") || lowerMsg.includes("cita") || lowerMsg.includes("agendar") || lowerMsg.includes("horario")) {
        fallbackText = "¡Claro! Me encantaría agendar tu hora. ¿Qué te parece coordinar una cita? Compárteme tu *Nombre Completo, Teléfono, RUT e Email* y el día de tu preferencia para reservar de inmediato.";
      } else if (lowerMsg.includes("humano") || lowerMsg.includes("persona") || lowerMsg.includes("asesor") || lowerMsg.includes("hablar")) {
        fallbackText = "De acuerdo. Estoy enviando una Alerta Urgente al Panel de Control para que uno de nuestros asesores humanos tome el control de este chat de WhatsApp. ¡Por favor espera un minuto!";
      }

      responseText = fallbackText;
      
      // Append bot response
      conversation.messages.push({
        id: `msg-sim-bot-${Date.now()}`,
        text: responseText,
        sender: "agent",
        timestamp: new Date().toISOString()
      });
      conversation.lastMessageText = responseText;
      conversation.lastMessageTime = new Date().toISOString();

      return res.json({ 
        response: responseText.trim(),
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
