export class ZApiWebhookDto {
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
    status?: 'QUEUED' | 'SENT' | 'RECEIVED' | 'READ' | 'FAILED';
  };
}

export class SendMessageDto {
  phone: string;
  message: string;
  delayMessage?: number;
}

export class SendImageDto {
  phone: string;
  imageUrl: string;
  caption?: string;
}

export class SendButtonMessageDto {
  phone: string;
  message: string;
  buttons: Array<{
    id: string;
    text: string;
  }>;
}

export class SendDocumentDto {
  phone: string;
  documentUrl: string;
  fileName: string;
  caption?: string;
}
