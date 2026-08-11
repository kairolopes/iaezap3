import { Controller, Post, Get, UseGuards, Body, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CompanyService } from './company.service';

@Controller('companies')
@UseGuards(AuthGuard('jwt'))
export class CompanyController {
  constructor(private company: CompanyService) {}

  @Post()
  create(@Body() body: any, @Req() req: any) {
    return this.company.create({ ...body, ownerId: req.user.id });
  }

  @Get()
  findAll(@Req() req: any) {
    return this.company.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Req() req: any) {
    return this.company.findOne(req.params.id);
  }
}
