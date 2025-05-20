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
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { Express } from 'express'
import * as multer from 'multer'
import { ProductsService } from './products.service'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'

@Controller('products')
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name)

  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('imageFile', {
      storage: multer.memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async create(
    @Body() createDto: CreateProductDto,
    @UploadedFile() imageFile?: Express.Multer.File,
  ) {
    this.logger.log(`POST /products - body: ${JSON.stringify(createDto)}`)
    if (imageFile) {
      this.logger.log(`POST /products - received file: ${imageFile.originalname} (${imageFile.size} bytes)`)
    }
    try {
      const product = await this.productsService.create(createDto, imageFile)
      this.logger.log(`Product created: ${product._id}`)
      return product
    } catch (err) {
      this.logger.error('Error in ProductsController.create()', err.stack)
      throw err
    }
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
    this.logger.log(`PATCH /products/${id} - body: ${JSON.stringify(updateDto)}`)
    if (imageFile) {
      this.logger.log(`PATCH /products/${id} - received file: ${imageFile.originalname}`)
    }
    try {
      const updated = await this.productsService.update(id, updateDto, imageFile)
      this.logger.log(`Product updated: ${updated._id}`)
      return updated
    } catch (err) {
      this.logger.error(`Error in ProductsController.update(${id})`, err.stack)
      throw err
    }
  }

  // el resto queda igual, pero puedes añadir logs parecidos en remove()
}
