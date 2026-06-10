export interface TrainingFile {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  charCount: number;
  extractedText: string;
}

export interface Agent {
  id: string;
  name: string;
  status: 'Active' | 'Inactive' | 'Draft';
  trainingData: string;
  language: string;
  crmWebhookUrl: string;
  quickReplies?: string;
  createdAt: string;
  trainingFiles?: TrainingFile[];
  whatsappNumber?: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: 'Nuevo' | 'Contactado' | 'Cita Agendada' | 'Especial' | 'Perdido';
  notes: string;
  timestamp: string;
  agentId: string;
  score: number; // 1 to 5 lead scoring evaluation
}

export interface Message {
  id: string;
  text: string;
  sender: 'agent' | 'client' | 'system';
  timestamp: string;
}

export interface Conversation {
  id: string;
  leadId: string;
  agentId: string;
  lastMessageText: string;
  lastMessageTime: string;
  status: 'Open' | 'Closed' | 'PendingHuman';
  messages: Message[];
}

export interface Appointment {
  id: string;
  leadId: string;
  leadName: string;
  dateTime: string;
  channel: 'Google Calendar' | 'Outlook';
  status: 'Agendada' | 'Cancelada' | 'Completada';
  notes: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'Admin' | 'Supervisor' | 'Agent';
  permissions: string[];
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'urgent' | 'lead' | 'info';
  read: boolean;
  timestamp: string;
}

export interface DashboardMetrics {
  totalConversations: number;
  totalLeads: number;
  conversionRate: number; // calculated as (Cita Agendada or Especial) / totalLeads * 100
  scheduledCount: number;
  activeAgentsCount: number;
  averageResponseTimeSec: number;
  leadsByStatus: { [status: string]: number };
  conversationsOverTime: { date: string; chats: number }[];
}
