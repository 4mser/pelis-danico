// src/products/products.controller.ts
import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
  } from '@nestjs/common';
  import { ProductsService } from './products.service';
  
  @Controller('products')
  export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}
  
    @Post()
    async create(
      @Body() body: { name: string; image?: string }
    ) {
      return this.productsService.create(body.name, body.image);
    }
  
    @Get()
    async findAll() {
      return this.productsService.findAll();
    }
  
    @Get(':id')
    async findOne(@Param('id') id: string) {
      return this.productsService.findOne(id);
    }
  
    @Patch(':id')
    async update(
      @Param('id') id: string,
      @Body() body: {
        name?: string;
        image?: string;
        bought?: boolean;
        likeNico?: boolean;
        likeBarbara?: boolean;
      },
    ) {
      return this.productsService.update(id, body);
    }
  
    @Delete(':id')
    async remove(@Param('id') id: string) {
      return this.productsService.remove(id);
    }
  }
  