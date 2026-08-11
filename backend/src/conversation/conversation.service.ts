import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ConversationService {
  constructor(private supabase: SupabaseService) {}

  async create(companyId: string, data: any) {
    return this.supabase.createConversation(companyId, {
      customer_name: data.customerName,
      customer_phone: data.customerPhone,
      customer_email: data.customerEmail || null,
      agent_id: data.agentId || null,
      status: 'OPEN',
    });
  }

  async findByCompany(companyId: string) {
    return this.supabase.query('conversations', { company_id: companyId });
  }

  async findOne(id: string) {
    return this.supabase.query('conversations').then(({ data }) => {
      const conv = data?.find(c => c.id === id);
      if (!conv) return null;
      return this.supabase.query('messages', { conversation_id: id }).then(({ data: msgs }) => ({
        ...conv,
        messages: msgs || [],
      }));
    });
  }

  async addMessage(conversationId: string, text: string, sender: string, isFromAI: boolean) {
    return this.supabase.addMessage(conversationId, {
      text,
      sender,
      is_from_ai: isFromAI,
      sender_name: isFromAI ? 'IA' : 'Customer',
    });
  }

  async updateStatus(id: string, status: string) {
    return this.supabase.updateAgent(id, { status, updated_at: new Date() });
  }
}
