// src/products/dto/create-product.dto.ts
import { 
    IsString, 
    IsOptional, 
    IsUrl, 
    IsBoolean 
  } from 'class-validator';
  
  export class CreateProductDto {
    @IsString()
    name: string;
  
    @IsOptional()
    @IsUrl()
    imageUrl?: string;
  
    @IsOptional()
    @IsString()
    storeName?: string;
  
    @IsOptional()
    @IsUrl()
    storeLink?: string;
  
    @IsOptional()
    @IsBoolean()
    bought?: boolean;
  
    @IsOptional()
    @IsBoolean()
    likeNico?: boolean;
  
    @IsOptional()
    @IsBoolean()
    likeBarbara?: boolean;
  }
  