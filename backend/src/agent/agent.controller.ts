import { Controller, Get, Post, Put, Param, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AgentService } from './agent.service';

@Controller('agents')
@UseGuards(AuthGuard('jwt'))
export class AgentController {
  constructor(private agent: AgentService) {}

  @Post(':companyId')
  create(@Param('companyId') companyId: string, @Body() data: any) {
    return this.agent.create(companyId, data);
  }

  @Get(':companyId')
  findByCompany(@Param('companyId') companyId: string) {
    return this.agent.findByCompany(companyId);
  }

  @Get('detail/:id')
  findOne(@Param('id') id: string) {
    return this.agent.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.agent.update(id, data);
  }
}
