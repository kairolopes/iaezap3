import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AgentService } from './agent.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('agents')
@UseGuards(JwtAuthGuard)
export class AgentController {
  constructor(private agent: AgentService) {}

  @Post(':companyId')
  create(
    @Param('companyId') companyId: string,
    @Body() data: any,
    @Request() req: any,
  ) {
    // req.user contém o usuário autenticado
    return this.agent.create(companyId, data);
  }

  @Get(':companyId')
  findByCompany(@Param('companyId') companyId: string, @Request() req: any) {
    return this.agent.findByCompany(companyId);
  }

  @Get('detail/:id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.agent.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() data: any,
    @Request() req: any,
  ) {
    return this.agent.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Request() req: any) {
    return this.agent.delete(id);
  }

  @Get('/meta/roles')
  getRoles(@Request() req: any) {
    return this.agent.getRoles();
  }

  @Get('/meta/tones')
  getTones(@Request() req: any) {
    return this.agent.getTones();
  }
}
