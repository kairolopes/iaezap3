import { Controller, Post, Body, Logger, HttpStatus, HttpCode, BadRequestException } from '@nestjs/common';
import { ZApiService, ZApiWebhookPayload } from './z-api.service';
import { SupabaseService } from '../supabase/supabase.service';
import {
  SendMessageDto,
  SendImageDto,
  SendButtonMessageDto,
  SendDocumentDto,
  ZApiWebhookDto,
} from './dtos/webhook.dto';

interface ConversationData {
  phone: string;
  source: 'whatsapp';
  external_id: string;
  status: 'active' | 'archived';
  last_message_at: string;
  metadata: {
    z_api_instance: string;
    user_name?: string;
  };
}

interface MessageData {
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  external_id: string;
  metadata: {
    z_api_message_id?: string;
    status?: string;
    timestamp?: string;
  };
}

@Controller('api/whatsapp')
export class WhatsappController {
  private readonly logger = new Logger(WhatsappController.name);

  constructor(
    private readonly zApiService: ZApiService,
    private readonly supabaseService: SupabaseService
  ) {}

  /**
   * Webhook para receber mensagens do Z-API
   * POST /api/whatsapp/webhook
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() payload: ZApiWebhookDto): Promise<{ status: string }> {
    try {
      this.logger.debug(`Webhook recebido: tipo=${payload.type}`);

      // Validar payload
      if (!payload.type || !payload.data) {
        throw new BadRequestException('Payload inválido');
      }

      // Processar apenas mensagens recebidas
      if (!this.zApiService.isIncomingMessage(payload as ZApiWebhookPayload)) {
        return { status: 'ignored' };
      }

      // Extrair dados da mensagem
      const phone = this.zApiService.extractPhoneFromWebhook(payload as ZApiWebhookPayload);
      const messageContent = this.zApiService.extractMessageContent(payload as ZApiWebhookPayload);

      if (!phone || !messageContent) {
        this.logger.warn('Dados insuficientes no webhook');
        return { status: 'ignored' };
      }

      this.logger.log(`Mensagem recebida de ${phone}: ${messageContent}`);

      // Criar ou atualizar conversa
      const conversation = await this.getOrCreateConversation(phone);

      // Criar mensagem no Supabase
      await this.createMessage(conversation.id, messageContent, phone);

      // Rotear para agente TRIAGE
      await this.routeToTriageAgent(conversation.id, phone, messageContent);

      return { status: 'processed' };
    } catch (error) {
      this.logger.error(`Erro ao processar webhook: ${error.message}`);
      return { status: 'error' };
    }
  }

  /**
   * Enviar mensagem de texto via WhatsApp
   * POST /api/whatsapp/send/text
   */
  @Post('send/text')
  @HttpCode(HttpStatus.CREATED)
  async sendTextMessage(@Body() dto: SendMessageDto) {
    if (!dto.phone || !dto.message) {
      throw new BadRequestException('phone e message são obrigatórios');
    }

    const result = await this.zApiService.sendTextMessage({
      phone: dto.phone,
      message: dto.message,
      delayMessage: dto.delayMessage,
    });

    this.logger.log(`Mensagem de texto enviada: ${result.id}`);
    return result;
  }

  /**
   * Enviar imagem via WhatsApp
   * POST /api/whatsapp/send/image
   */
  @Post('send/image')
  @HttpCode(HttpStatus.CREATED)
  async sendImage(@Body() dto: SendImageDto) {
    if (!dto.phone || !dto.imageUrl) {
      throw new BadRequestException('phone e imageUrl são obrigatórios');
    }

    const result = await this.zApiService.sendImage({
      phone: dto.phone,
      image: dto.imageUrl,
      caption: dto.caption,
    });

    this.logger.log(`Imagem enviada: ${result.id}`);
    return result;
  }

  /**
   * Enviar mensagem com botões
   * POST /api/whatsapp/send/buttons
   */
  @Post('send/buttons')
  @HttpCode(HttpStatus.CREATED)
  async sendButtonMessage(@Body() dto: SendButtonMessageDto) {
    if (!dto.phone || !dto.message || !dto.buttons || dto.buttons.length === 0) {
      throw new BadRequestException('phone, message e buttons são obrigatórios');
    }

    const result = await this.zApiService.sendButtonMessage(dto.phone, dto.message, dto.buttons);

    this.logger.log(`Mensagem com botões enviada: ${result.id}`);
    return result;
  }

  /**
   * Enviar documento
   * POST /api/whatsapp/send/document
   */
  @Post('send/document')
  @HttpCode(HttpStatus.CREATED)
  async sendDocument(@Body() dto: SendDocumentDto) {
    if (!dto.phone || !dto.documentUrl || !dto.fileName) {
      throw new BadRequestException('phone, documentUrl e fileName são obrigatórios');
    }

    const result = await this.zApiService.sendDocument(
      dto.phone,
      dto.documentUrl,
      dto.fileName,
      dto.caption
    );

    this.logger.log(`Documento enviado: ${result.id}`);
    return result;
  }

  /**
   * Obter ou criar conversa
   */
  private async getOrCreateConversation(phone: string) {
    const supabase = this.supabaseService.getClient();

    // Procurar conversa existente
    const { data: existingConversation } = await supabase
      .from('conversations')
      .select('*')
      .eq('phone', phone)
      .eq('source', 'whatsapp')
      .single();

    if (existingConversation) {
      // Atualizar timestamp
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', existingConversation.id);

      return existingConversation;
    }

    // Criar nova conversa
    const conversationData: ConversationData = {
      phone,
      source: 'whatsapp',
      external_id: `whatsapp_${phone}_${Date.now()}`,
      status: 'active',
      last_message_at: new Date().toISOString(),
      metadata: {
        z_api_instance: process.env.Z_API_INSTANCE_ID || '',
      },
    };

    const { data: newConversation, error } = await supabase
      .from('conversations')
      .insert(conversationData)
      .select()
      .single();

    if (error) {
      this.logger.error(`Erro ao criar conversa: ${error.message}`);
      throw error;
    }

    this.logger.log(`Nova conversa criada: ${newConversation.id}`);
    return newConversation;
  }

  /**
   * Criar mensagem no Supabase
   */
  private async createMessage(conversationId: string, content: string, phone: string) {
    const supabase = this.supabaseService.getClient();

    const messageData: MessageData = {
      conversation_id: conversationId,
      role: 'user',
      content,
      external_id: `whatsapp_msg_${Date.now()}`,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    const { data, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single();

    if (error) {
      this.logger.error(`Erro ao criar mensagem: ${error.message}`);
      throw error;
    }

    this.logger.log(`Mensagem criada: ${data.id}`);
    return data;
  }

  /**
   * Rotear para agente TRIAGE
   */
  private async routeToTriageAgent(conversationId: string, phone: string, messageContent: string) {
    try {
      // Aqui você pode integrar com um fila de mensagens ou chamar o agente TRIAGE
      // Exemplo: enviar para uma fila Redis, RabbitMQ ou chamar um endpoint do agente

      this.logger.log(`Roteando conversa ${conversationId} para agente TRIAGE`);

      // Exemplo simples: você pode chamar uma API do agente
      // await this.triageService.processConversation(conversationId, messageContent);

      // Ou enviar para uma fila
      // await this.queueService.enqueue('triage', { conversationId, phone, messageContent });

      return { status: 'routed' };
    } catch (error) {
      this.logger.error(`Erro ao rotear para TRIAGE: ${error.message}`);
      // Não lançar erro aqui, apenas logar
    }
  }

  /**
   * Registrar webhook no Z-API (chamar uma única vez)
   * POST /api/whatsapp/register-webhook
   */
  @Post('register-webhook')
  async registerWebhook(@Body() body: { webhookUrl: string }) {
    if (!body.webhookUrl) {
      throw new BadRequestException('webhookUrl é obrigatório');
    }

    const result = await this.zApiService.registerWebhook(
      `${body.webhookUrl}/api/whatsapp/webhook`,
      ['messages.upsert', 'message.update', 'contacts.update']
    );

    this.logger.log('Webhook registrado com sucesso no Z-API');
    return result;
  }
}
