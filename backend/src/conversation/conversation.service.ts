import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AgentService } from '../agent/agent.service';

@Injectable()
export class ConversationService {
  constructor(private prisma: PrismaService, private agent: AgentService) {}

  async create(companyId: string, data: any) {
    return this.prisma.conversation.create({
      data: {
        ...data,
        company: { connect: { id: companyId } },
        status: 'OPEN',
      },
      include: { messages: true, agent: true },
    });
  }

  async findByCompany(companyId: string) {
    return this.prisma.conversation.findMany({
      where: { companyId },
      include: { agent: true, messages: { take: 5 } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.conversation.findUnique({
      where: { id },
      include: { messages: true, agent: true },
    });
  }

  async addMessage(conversationId: string, text: string, sender: string, isFromAI: boolean) {
    // Auto-route to agent if new conversation
    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    let agentId = conv?.agentId;
    if (!agentId) {
      // Get first agent (TRIAGE) for routing
      const triageAgent = await this.prisma.agent.findFirst({
        where: { role: 'TRIAGE', isActive: true },
      });
      agentId = triageAgent?.id;
    }

    return this.prisma.message.create({
      data: {
        text,
        sender,
        isFromAI,
        conversation: { connect: { id: conversationId } },
        senderName: isFromAI ? 'IA' : 'Customer',
      },
    });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.conversation.update({
      where: { id },
      data: { status, updatedAt: new Date() },
    });
  }
}
