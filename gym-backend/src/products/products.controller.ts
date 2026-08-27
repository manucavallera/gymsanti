import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, Request, UseGuards, ForbiddenException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product, ProductCategory } from './product.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query('category') category?: ProductCategory) {
    return this.productsService.findAll(category);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard)
  adminList(@Request() req: any) { this.assertAdmin(req); return this.productsService.findAllAdmin(); }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req: any, @Body() body: Partial<Product>) { this.assertAdmin(req); return this.productsService.create(body); }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Request() req: any, @Param('id', ParseIntPipe) id: number, @Body() body: Partial<Product>) { this.assertAdmin(req); return this.productsService.update(id, body); }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  hide(@Request() req: any, @Param('id', ParseIntPipe) id: number) { this.assertAdmin(req); return this.productsService.hide(id); }

  @Get(':id/stock-movements')
  @UseGuards(JwtAuthGuard)
  movements(@Request() req: any, @Param('id', ParseIntPipe) id: number) { this.assertAdmin(req); return this.productsService.getMovements(id); }

  @Post(':id/stock-movements')
  @UseGuards(JwtAuthGuard)
  addMovement(@Request() req: any, @Param('id', ParseIntPipe) id: number, @Body() body: { type: 'entrada' | 'salida' | 'ajuste'; quantity: number; reason?: string }) {
    this.assertAdmin(req);
    return this.productsService.addMovement(id, req.user.id, body);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  private assertAdmin(req: any) {
    if (req.user.role !== 'admin') throw new ForbiddenException();
  }
}
