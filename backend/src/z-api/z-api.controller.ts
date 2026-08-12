import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  HttpException,
  HttpStatus,
  Logger,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ZApiService } from './z-api.service';

@Controller('z-api')
@UseGuards(AuthGuard('jwt'))
export class ZApiController {
  private readonly logger = new Logger(ZApiController.name);

  constructor(private zapi: ZApiService) {}

  /**
   * GET /z-api/conversations/:companyId
   * Get all conversations for a company
   * @param companyId - The company ID
   */
  @Get('conversations/:companyId')
  async getConversations(@Param('companyId') companyId: string) {
    try {
      this.logger.log(`GET /z-api/conversations/${companyId}`);

      if (!companyId || companyId.trim().length === 0) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Company ID is required',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.zapi.getConversations(companyId);
      return result;
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
   * GET /z-api/conversations/:conversationId/messages
   * Get all messages for a conversation
   * @param conversationId - The conversation ID
   */
  @Get('conversations/:conversationId/messages')
  async getConversationMessages(
    @Param('conversationId') conversationId: string,
  ) {
    try {
      this.logger.log(
        `GET /z-api/conversations/${conversationId}/messages`,
      );

      if (!conversationId || conversationId.trim().length === 0) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Conversation ID is required',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.zapi.getConversationMessages(
        conversationId,
      );
      return result;
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
   * POST /z-api/conversations/:conversationId/send
   * Send a message in a conversation
   * @param conversationId - The conversation ID
   * @param body - Request body containing the message text
   */
  @Post('conversations/:conversationId/send')
  async sendMessage(
    @Param('conversationId') conversationId: string,
    @Body() body: { text: string },
  ) {
    try {
      this.logger.log(
        `POST /z-api/conversations/${conversationId}/send`,
      );

      if (!conversationId || conversationId.trim().length === 0) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Conversation ID is required',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!body || !body.text) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Message text is required in request body',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.zapi.sendMessage(
        conversationId,
        body.text,
      );
      return result;
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

  @Post('seed-conversations/:companyId')
  async seedConversations(@Param('companyId') companyId: string) {
    try {
      const result = await this.zapi.seedTestConversations(companyId);
      return result;
    } catch (error) {
      this.logger.error(`Error in seedConversations: ${error.message}`);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error seeding conversations',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('seed-all')
  async seedAll(@Req() req: any) {
    try {
      const userId = req.user?.sub;
      const result = await this.zapi.seedAll(userId);
      return result;
    } catch (error) {
      this.logger.error(`Error in seedAll: ${error.message}`);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error seeding data',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
