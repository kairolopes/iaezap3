import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { ConfigService } from '@nestjs/config';

export interface ZApiMessagePayload {
  phone: string;
  message: string;
  delayMessage?: number;
}

export interface ZApiImagePayload {
  phone: string;
  image: string;
  caption?: string;
  delayMessage?: number;
}

export interface ZApiMessageResponse {
  id: string;
  status: 'QUEUED' | 'SENT' | 'RECEIVED' | 'READ' | 'FAILED';
  timestamp: string;
}

export interface ZApiWebhookPayload {
  type: 'messages.upsert' | 'message.update' | 'chats.update' | 'contacts.update';
  data: {
    key?: {
      remoteJid: string;
      fromMe?: boolean;
      id?: string;
    };
    message?: {
      conversation?: string;
      imageMessage?: {
        url: string;
        caption?: string;
      };
      documentMessage?: {
        url: string;
        fileName?: string;
      };
    };
    messageTimestamp?: string;
    status?: string;
  };
}

@Injectable()
export class ZApiService {
  private readonly logger = new Logger(ZApiService.name);
  private readonly client: AxiosInstance;
  private readonly baseUrl = 'https://api.z-api.io';
  private readonly instanceId: string;
  private readonly token: string;

  constructor(private configService: ConfigService) {
    this.instanceId = this.configService.get<string>('Z_API_INSTANCE_ID', '');
    this.token = this.configService.get<string>('Z_API_TOKEN', '');

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Client-Token': this.token,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    this.validateCredentials();
  }

  private validateCredentials(): void {
    if (!this.instanceId || !this.token) {
      this.logger.warn(
        'Z-API credentials not configured. Set Z_API_INSTANCE_ID and Z_API_TOKEN in .env'
      );
    }
  }

  /**
   * Envia uma mensagem de texto via WhatsApp
   */
  async sendTextMessage(payload: ZApiMessagePayload): Promise<ZApiMessageResponse> {
    try {
      this.logger.debug(`Enviando mensagem para ${payload.phone}`);

      const response = await this.client.post<ZApiMessageResponse>(
        `/instances/${this.instanceId}/messages/text`,
        {
          phone: payload.phone,
          message: payload.message,
          delayMessage: payload.delayMessage || 1000,
        }
      );

      this.logger.log(`Mensagem enviada com sucesso: ${response.data.id}`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'sendTextMessage');
    }
  }

  /**
   * Envia uma imagem via WhatsApp
   */
  async sendImage(payload: ZApiImagePayload): Promise<ZApiMessageResponse> {
    try {
      this.logger.debug(`Enviando imagem para ${payload.phone}`);

      const response = await this.client.post<ZApiMessageResponse>(
        `/instances/${this.instanceId}/messages/image`,
        {
          phone: payload.phone,
          image: payload.image,
          caption: payload.caption || '',
          delayMessage: payload.delayMessage || 1000,
        }
      );

      this.logger.log(`Imagem enviada com sucesso: ${response.data.id}`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'sendImage');
    }
  }

  /**
   * Envia uma mensagem com botões
   */
  async sendButtonMessage(
    phone: string,
    message: string,
    buttons: Array<{ id: string; text: string }>
  ): Promise<ZApiMessageResponse> {
    try {
      this.logger.debug(`Enviando mensagem com botões para ${phone}`);

      const response = await this.client.post<ZApiMessageResponse>(
        `/instances/${this.instanceId}/messages/button`,
        {
          phone,
          message,
          buttons,
          delayMessage: 1000,
        }
      );

      this.logger.log(`Mensagem com botões enviada: ${response.data.id}`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'sendButtonMessage');
    }
  }

  /**
   * Envia um documento
   */
  async sendDocument(
    phone: string,
    documentUrl: string,
    fileName: string,
    caption?: string
  ): Promise<ZApiMessageResponse> {
    try {
      this.logger.debug(`Enviando documento para ${phone}`);

      const response = await this.client.post<ZApiMessageResponse>(
        `/instances/${this.instanceId}/messages/document`,
        {
          phone,
          document: documentUrl,
          fileName,
          caption: caption || '',
          delayMessage: 1000,
        }
      );

      this.logger.log(`Documento enviado: ${response.data.id}`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'sendDocument');
    }
  }

  /**
   * Obtém lista de contatos
   */
  async getContacts(): Promise<any[]> {
    try {
      const response = await this.client.get(`/instances/${this.instanceId}/contacts`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'getContacts');
    }
  }

  /**
   * Obtém lista de chats
   */
  async getChats(): Promise<any[]> {
    try {
      const response = await this.client.get(`/instances/${this.instanceId}/chats`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'getChats');
    }
  }

  /**
   * Registra webhook para receber eventos
   */
  async registerWebhook(url: string, events: string[]): Promise<any> {
    try {
      this.logger.debug(`Registrando webhook: ${url}`);

      const response = await this.client.post(
        `/instances/${this.instanceId}/webhooks`,
        {
          url,
          events,
        }
      );

      this.logger.log('Webhook registrado com sucesso');
      return response.data;
    } catch (error) {
      this.handleError(error, 'registerWebhook');
    }
  }

  /**
   * Extrai o número de telefone do payload do webhook
   */
  extractPhoneFromWebhook(payload: ZApiWebhookPayload): string | null {
    const remoteJid = payload.data?.key?.remoteJid;
    if (!remoteJid) return null;

    // Formato: 5585987654321@s.whatsapp.net
    return remoteJid.replace('@s.whatsapp.net', '');
  }

  /**
   * Extrai o conteúdo da mensagem do webhook
   */
  extractMessageContent(payload: ZApiWebhookPayload): string | null {
    return payload.data?.message?.conversation || null;
  }

  /**
   * Verifica se é uma mensagem recebida (não enviada por nós)
   */
  isIncomingMessage(payload: ZApiWebhookPayload): boolean {
    return payload.type === 'messages.upsert' && !payload.data?.key?.fromMe;
  }

  private handleError(error: any, context: string): void {
    const message = error.response?.data?.message || error.message;
    const statusCode = error.response?.status;

    this.logger.error(`Erro em ${context}: ${statusCode} - ${message}`);

    if (statusCode === 401) {
      this.logger.error('Credenciais Z-API inválidas. Verifique Z_API_TOKEN');
    } else if (statusCode === 404) {
      this.logger.error(`Recurso não encontrado. Verifique Z_API_INSTANCE_ID`);
    }

    throw error;
  }
}
