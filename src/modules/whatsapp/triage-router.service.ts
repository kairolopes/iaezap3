import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface TriageRequest {
  conversationId: string;
  phone: string;
  messageContent: string;
  priority?: 'low' | 'medium' | 'high';
}

@Injectable()
export class TriageRouterService {
  private readonly logger = new Logger(TriageRouterService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Roteia uma mensagem para o agente TRIAGE
   * Cria um registro na tabela triage_queue para processamento assíncrono
   */
  async routeToTriage(request: TriageRequest): Promise<void> {
    const supabase = this.supabaseService.getClient();

    try {
      const triageData = {
        conversation_id: request.conversationId,
        phone: request.phone,
        message_content: request.messageContent,
        priority: request.priority || 'medium',
        status: 'pending',
        created_at: new Date().toISOString(),
        processed_at: null,
      };

      const { error } = await supabase.from('triage_queue').insert(triageData);

      if (error) {
        this.logger.error(`Erro ao inserir na fila TRIAGE: ${error.message}`);
        throw error;
      }

      this.logger.log(`Conversa ${request.conversationId} adicionada à fila TRIAGE`);
    } catch (error) {
      this.logger.error(`Erro ao rotear para TRIAGE: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obter próximas tarefas da fila TRIAGE (para worker/background job)
   */
  async getNextTriageTasks(limit: number = 10): Promise<any[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('triage_queue')
      .select('*')
      .eq('status', 'pending')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      this.logger.error(`Erro ao buscar tarefas TRIAGE: ${error.message}`);
      throw error;
    }

    return data || [];
  }

  /**
   * Marcar tarefa TRIAGE como processada
   */
  async markAsProcessed(taskId: string, result?: any): Promise<void> {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase
      .from('triage_queue')
      .update({
        status: 'completed',
        processed_at: new Date().toISOString(),
        result,
      })
      .eq('id', taskId);

    if (error) {
      this.logger.error(`Erro ao marcar tarefa como processada: ${error.message}`);
      throw error;
    }

    this.logger.log(`Tarefa ${taskId} marcada como completa`);
  }

  /**
   * Marcar tarefa TRIAGE como falhada
   */
  async markAsFailed(taskId: string, error: string): Promise<void> {
    const supabase = this.supabaseService.getClient();

    const { error: updateError } = await supabase
      .from('triage_queue')
      .update({
        status: 'failed',
        processed_at: new Date().toISOString(),
        error_message: error,
      })
      .eq('id', taskId);

    if (updateError) {
      this.logger.error(`Erro ao marcar tarefa como falhada: ${updateError.message}`);
      throw updateError;
    }

    this.logger.log(`Tarefa ${taskId} marcada como falha: ${error}`);
  }

  /**
   * Classificar prioridade da mensagem (exemplo simples)
   */
  private classifyPriority(messageContent: string): 'low' | 'medium' | 'high' {
    const urgentWords = ['urgente', 'emergência', 'problema', 'erro', 'crítico'];
    const hasUrgent = urgentWords.some((word) =>
      messageContent.toLowerCase().includes(word)
    );

    if (hasUrgent) return 'high';
    if (messageContent.length > 200) return 'low';
    return 'medium';
  }
}
