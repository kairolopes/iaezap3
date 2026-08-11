import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AgentService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, data: any) {
    // Get or create personality
    const personality = await this.prisma.personality.findFirst({
      where: { name: data.personality || 'Default' },
    });

    return this.prisma.agent.create({
      data: {
        ...data,
        company: { connect: { id: companyId } },
        personality: {
          connect: {
            id: personality?.id || (await this.createDefaultPersonality()).id,
          },
        },
      },
    });
  }

  async findByCompany(companyId: string) {
    return this.prisma.agent.findMany({
      where: { companyId, isActive: true },
      include: { personality: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.agent.findUnique({
      where: { id },
      include: { personality: true, conversations: { take: 10 } },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.agent.update({
      where: { id },
      data,
      include: { personality: true },
    });
  }

  private async createDefaultPersonality() {
    return this.prisma.personality.create({
      data: { name: 'Default', description: 'Default personality' },
    });
  }
}
