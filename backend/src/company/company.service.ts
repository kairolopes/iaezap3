import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; businessName: string; cnpj: string; ownerId: string }) {
    return this.prisma.company.create({ data });
  }

  async findAll(userId: string) {
    return this.prisma.company.findMany({
      where: { OR: [{ ownerId: userId }, { users: { some: { id: userId } } }] },
    });
  }

  async findOne(id: string) {
    return this.prisma.company.findUnique({
      where: { id },
      include: { agents: true, users: true },
    });
  }
}
