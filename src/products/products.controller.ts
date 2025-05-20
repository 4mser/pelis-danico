// src/products/products.controller.ts

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UploadedFile,
  UseInterceptors,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);

  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll() {
    this.logger.log('GET /products');
    return this.productsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`GET /products/${id}`);
    return this.productsService.findOne(id);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('imageFile', {
      storage: multer.memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
    }),
  )
  async create(
    @Body() createDto: CreateProductDto,
    @UploadedFile() imageFile?: Express.Multer.File,
  ) {
    this.logger.log(`POST /products – payload: ${JSON.stringify(createDto)}`);
    if (imageFile) {
      this.logger.log(
        `POST /products – received file: ${imageFile.originalname} (${imageFile.size} bytes)`,
      );
    }
    return this.productsService.create(createDto, imageFile);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('imageFile', {
      storage: multer.memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateProductDto,
    @UploadedFile() imageFile?: Express.Multer.File,
  ) {
    this.logger.log(
      `PATCH /products/${id} – payload: ${JSON.stringify(updateDto)}`,
    );
    if (imageFile) {
      this.logger.log(
        `PATCH /products/${id} – received file: ${imageFile.originalname}`,
      );
    }
    return this.productsService.update(id, updateDto, imageFile);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    this.logger.log(`DELETE /products/${id}`);
    return this.productsService.remove(id);
  }
}
