import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConversationService } from './conversation.service';

@Controller('conversations')
@UseGuards(AuthGuard('jwt'))
export class ConversationController {
  constructor(private conversation: ConversationService) {}

  @Post(':companyId')
  create(@Param('companyId') companyId: string, @Body() data: any) {
    return this.conversation.create(companyId, data);
  }

  @Get(':companyId')
  findByCompany(@Param('companyId') companyId: string) {
    return this.conversation.findByCompany(companyId);
  }

  @Get('detail/:id')
  findOne(@Param('id') id: string) {
    return this.conversation.findOne(id);
  }

  @Post(':id/messages')
  addMessage(
    @Param('id') id: string,
    @Body() body: { text: string; sender: string; isFromAI: boolean },
  ) {
    return this.conversation.addMessage(id, body.text, body.sender, body.isFromAI);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.conversation.updateStatus(id, body.status);
  }
}
