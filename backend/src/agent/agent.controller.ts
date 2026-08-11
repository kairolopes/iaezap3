import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { AgentService } from './agent.service';

@Controller('agents')
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

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.agent.delete(id);
  }

  @Get('/meta/roles')
  getRoles() {
    return this.agent.getRoles();
  }

  @Get('/meta/tones')
  getTones() {
    return this.agent.getTones();
  }
}
