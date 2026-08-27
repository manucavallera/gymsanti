import { Body, Controller, Delete, ForbiddenException, Get, Param, ParseIntPipe, Post, Put, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProtocolsService } from './protocols.service';

@Controller('protocols')
export class ProtocolsController {
  constructor(private readonly svc: ProtocolsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() { return this.svc.findAll(); }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number) { return this.svc.findOne(id); }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req: any, @Body() body: any) {
    this.assertCoach(req);
    return this.svc.create(req.user.id, body);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Request() req: any, @Param('id', ParseIntPipe) id: number, @Body() body: any) {
    this.assertCoach(req);
    return this.svc.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  delete(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    this.assertCoach(req);
    return this.svc.delete(id);
  }

  private assertCoach(req: any) {
    if (req.user.role !== 'coach' && req.user.role !== 'admin') throw new ForbiddenException();
  }
}
