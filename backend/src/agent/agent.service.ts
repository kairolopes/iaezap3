import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AgentService {
  constructor(private supabase: SupabaseService) {}

  async create(companyId: string, data: any) {
    return this.supabase.createAgent(companyId, {
      name: data.name,
      role: data.role || 'SALES',
      personality: data.personality || 'Friendly',
      tone: data.tone || 'FRIENDLY',
      language: data.language || 'pt-BR',
      instructions: data.instructions || '',
      can_respond_24h: data.canRespond24h || false,
      can_create_order: data.canCreateOrder || false,
      can_schedule: data.canSchedule || false,
      max_discount: data.maxDiscount || 0,
      is_active: true,
    });
  }

  async findByCompany(companyId: string) {
    return this.supabase.getAgents(companyId);
  }

  async findOne(id: string) {
    return this.supabase.query('agents').then(({ data }) => data?.find(a => a.id === id));
  }

  async update(id: string, data: any) {
    return this.supabase.updateAgent(id, data);
  }

  async delete(id: string) {
    return this.supabase.deleteAgent(id);
  }

  // List available roles
  async getRoles() {
    return ['TRIAGE', 'SALES', 'SCHEDULING', 'SUPPORT'];
  }

  // List available tones
  async getTones() {
    return ['FRIENDLY', 'PROFESSIONAL', 'FORMAL', 'FUNNY'];
  }
}
