import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;
  private supabaseAdmin: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_ANON_KEY || '',
    );
    this.supabaseAdmin = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    );
  }

  getClient() {
    return this.supabase;
  }

  getAdminClient() {
    return this.supabaseAdmin;
  }

  // Auth
  async signup(email: string, password: string) {
    return this.supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.FRONTEND_URL || 'https://iaezap.com.br'}/auth/confirm`,
      },
    });
  }

  async login(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  async getUser(userId: string) {
    return this.supabaseAdmin.auth.admin.getUserById(userId);
  }

  // Agents CRUD
  async createAgent(companyId: string, agentData: any) {
    return this.supabase
      .from('agents')
      .insert({ ...agentData, company_id: companyId })
      .select();
  }

  async getAgents(companyId: string) {
    return this.supabase
      .from('agents')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true);
  }

  async updateAgent(agentId: string, data: any) {
    return this.supabase
      .from('agents')
      .update(data)
      .eq('id', agentId)
      .select();
  }

  async deleteAgent(agentId: string) {
    return this.supabase
      .from('agents')
      .update({ is_active: false })
      .eq('id', agentId);
  }

  // Conversations
  async createConversation(companyId: string, conversationData: any) {
    return this.supabase
      .from('conversations')
      .insert({ ...conversationData, company_id: companyId })
      .select();
  }

  async addMessage(conversationId: string, messageData: any) {
    return this.supabase
      .from('messages')
      .insert({ ...messageData, conversation_id: conversationId })
      .select();
  }

  // Generic query
  async query(table: string, filter?: any) {
    let query = this.supabase.from(table).select('*');
    if (filter) {
      Object.keys(filter).forEach((key) => {
        query = query.eq(key, filter[key]);
      });
    }
    return query;
  }
}
