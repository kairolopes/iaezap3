import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { ConversationService } from '../conversation/conversation.service';

@Injectable()
export class ZApiService {
  private readonly logger = new Logger(ZApiService.name);

  constructor(
    private supabase: SupabaseService,
    private conversation: ConversationService,
  ) {}

  /**
   * Get all conversations for a specific company
   * @param companyId - The company ID
   * @returns Array of conversations with their metadata
   */
  async getConversations(companyId: string) {
    try {
      this.logger.debug(`Fetching conversations for company: ${companyId}`);

      const client = this.supabase.getClient();
      const { data, error } = await client
        .from('conversations')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) {
        this.logger.error(`Error fetching conversations: ${error.message}`);
        throw new HttpException(
          {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Failed to fetch conversations',
            error: error.message,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      this.logger.debug(`Successfully fetched ${data?.length || 0} conversations`);
      return {
        success: true,
        data: data || [],
        count: data?.length || 0,
      };
    } catch (error) {
      this.logger.error(`Error in getConversations: ${error.message}`);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get all messages for a specific conversation
   * @param conversationId - The conversation ID
   * @returns Array of messages with timestamps and sender info
   */
  async getConversationMessages(conversationId: string) {
    try {
      this.logger.debug(`Fetching messages for conversation: ${conversationId}`);

      // First, verify the conversation exists
      const client = this.supabase.getClient();
      const { data: conversationData, error: convError } = await client
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (convError || !conversationData) {
        this.logger.warn(`Conversation not found: ${conversationId}`);
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Conversation not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // Fetch messages
      const { data: messages, error: msgError } = await client
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (msgError) {
        this.logger.error(`Error fetching messages: ${msgError.message}`);
        throw new HttpException(
          {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Failed to fetch messages',
            error: msgError.message,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      this.logger.debug(`Successfully fetched ${messages?.length || 0} messages`);
      return {
        success: true,
        conversationId,
        conversation: conversationData,
        messages: messages || [],
        count: messages?.length || 0,
      };
    } catch (error) {
      this.logger.error(`Error in getConversationMessages: ${error.message}`);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Send a message in a conversation via Z-API
   * @param conversationId - The conversation ID
   * @param text - The message text to send
   * @returns The created message object
   */
  async sendMessage(conversationId: string, text: string) {
    try {
      this.logger.debug(`Sending message to conversation: ${conversationId}`);

      if (!text || text.trim().length === 0) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Message text cannot be empty',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Verify conversation exists
      const client = this.supabase.getClient();
      const { data: conversationData, error: convError } = await client
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (convError || !conversationData) {
        this.logger.warn(`Conversation not found: ${conversationId}`);
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Conversation not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // TODO: Integrate with actual Z-API to send WhatsApp message
      // For now, we'll just store the message in the database
      // When Z-API integration is complete, add the actual WhatsApp sending logic here

      const messageData = {
        conversation_id: conversationId,
        text: text.trim(),
        sender: 'agent', // System is sending on behalf of agent
        is_from_ai: false,
        sender_name: 'Agent',
        z_api_status: 'pending', // Will be updated when Z-API confirms delivery
        created_at: new Date(),
      };

      const { data: newMessage, error: msgError } = await client
        .from('messages')
        .insert([messageData])
        .select()
        .single();

      if (msgError) {
        this.logger.error(`Error creating message: ${msgError.message}`);
        throw new HttpException(
          {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Failed to send message',
            error: msgError.message,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      this.logger.debug(`Message sent successfully: ${newMessage?.id}`);

      // TODO: Call Z-API here to actually send the WhatsApp message
      // this.sendViaZApi(conversationData.customer_phone, text);

      return {
        success: true,
        message: newMessage,
        status: 'pending', // Waiting for Z-API confirmation
      };
    } catch (error) {
      this.logger.error(`Error in sendMessage: ${error.message}`);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Send message via Z-API (to be implemented with actual Z-API integration)
   * @param phoneNumber - Customer phone number
   * @param messageText - Message text to send
   */
  private async sendViaZApi(phoneNumber: string, messageText: string) {
    try {
      // TODO: Implement actual Z-API call
      // Example structure:
      // const response = await fetch(`${Z_API_URL}/send-message`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${Z_API_TOKEN}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     phone: phoneNumber,
      //     message: messageText,
      //   }),
      // });
      // return response.json();
      this.logger.log(
        `[Z-API Integration] Would send message to ${phoneNumber}: ${messageText}`,
      );
    } catch (error) {
      this.logger.error(`Error sending via Z-API: ${error.message}`);
      // Don't throw - we've already saved the message
    }
  }

  async seedTestConversations() {
    const companyId = '550e8400-e29b-41d4-a716-446655440000';
    const client = this.supabase.getClient();

    const conversations = [
      {
        company_id: companyId,
        contact_phone: '+5511987654321',
        status: 'active',
      },
      {
        company_id: companyId,
        contact_phone: '+5511912345678',
        status: 'active',
      },
    ];

    const { data, error } = await client
      .from('conversations')
      .insert(conversations)
      .select();

    if (error) {
      this.logger.error(`Error seeding conversations: ${error.message}`);
      throw error;
    }

    this.logger.log(`Seeded ${data?.length || 0} test conversations`);
    return {
      success: true,
      message: `Created ${data?.length || 0} test conversations`,
      conversations: data,
    };
  }
}
