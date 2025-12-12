// src/modules/products/products.controller.ts (Updated to handle raw FormData body)
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import { ProductsService, ProductQueryResult } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { Product } from './schemas/product.schema';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../common/interfaces/user.interface';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

// Multer storage configuration for product images
const getProductImageStorage = () => {
  const uploadDir = join(process.cwd(), 'uploads', 'products', 'temp');

  // Create directory if it doesn't exist
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  return diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
      const ext = extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  });
};

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) { }

  @Public()
  @Get()
  findAll(@Query() queryProductDto: QueryProductDto): Promise<ProductQueryResult> {
    return this.productsService.findAll(queryProductDto);
  }

  @Public()
  @Get('featured')
  getFeaturedProducts(@Query('limit') limit?: number): Promise<Product[]> {
    return this.productsService.getFeaturedProducts(limit);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Product> {
    return this.productsService.findOne(id);
  }

  @Public()
  @Get(':id/related')
  getRelatedProducts(@Param('id') id: string, @Query('limit') limit?: number): Promise<Product[]> {
    return this.productsService.getRelatedProducts(id, limit);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'seller')
  @UseInterceptors(FilesInterceptor('images', 10, { storage: getProductImageStorage() }))
  async create(
    @Body() rawBody: any, // Raw multipart body (flat object from FormData)
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB per file
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|gif|webp)$/, skipMagicNumbersValidation: true }),
        ],
        fileIsRequired: false,
      }),
    )
    files: Express.Multer.File[],
    @CurrentUser() user: User,
  ) {
    // Transform raw flat body to DTO structure
    const createDto = this.transformRawBodyToDto(rawBody, CreateProductDto);
    return this.productsService.processAndCreateProduct(createDto, files, user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'seller')
  @UseInterceptors(FilesInterceptor('images', 10, { storage: getProductImageStorage() }))
  async update(
    @Param('id') id: string,
    @Body() rawBody: any, // Raw multipart body
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|gif|webp)$/, skipMagicNumbersValidation: true }),
        ],
        fileIsRequired: false,
      }),
    )
    files: Express.Multer.File[],
  ) {
    // Transform raw flat body to DTO structure
    const updateDto = this.transformRawBodyToDto(rawBody, UpdateProductDto);
    return this.productsService.processAndUpdateProduct(id, updateDto, files);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'seller')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  // Helper method to transform flat FormData keys to nested DTO
  private transformRawBodyToDto(rawBody: any, DtoClass: any): any {
    const dto = new DtoClass();

    // Simple fields
    const simpleFields = [
      'title', 'description', 'longDescription', 'brand', 'sku', 'tags',
      'isFeatured', 'isActive', 'stockStatus', 'thumbnail'
    ];
    simpleFields.forEach(field => {
      if (rawBody[field] !== undefined) {
        dto[field] = rawBody[field];
      }
    });

    // Handle images explicitly (can be one string or array of strings)
    if (rawBody.images) {
      if (Array.isArray(rawBody.images)) {
        dto.images = rawBody.images;
      } else {
        dto.images = [rawBody.images];
      }
    }

    // Numbers
    ['price', 'discountPrice', 'stock', 'weight'].forEach(field => {
      if (rawBody[field] !== undefined) {
        dto[field] = parseFloat(rawBody[field]) || parseInt(rawBody[field], 10) || 0;
      }
    });

    // Boolean
    ['isFeatured', 'isActive'].forEach(field => {
      if (rawBody[field] !== undefined) {
        dto[field] = rawBody[field] === 'true' || rawBody[field] === true;
      }
    });

    // categoryId - always assign, even if empty for validation
    dto.categoryId = typeof rawBody.categoryId === 'object'
      ? (rawBody.categoryId?._id || rawBody.categoryId?.toString() || '')
      : (rawBody.categoryId || '');

    // Tags - split if string
    if (typeof dto.tags === 'string') {
      dto.tags = dto.tags.split(',').map(t => t.trim()).filter(Boolean);
    }

    // Variants - build array
    dto.variants = [];
    let variantIndex = 0;
    while (rawBody[`variants[${variantIndex}].name`]) {
      const name = rawBody[`variants[${variantIndex}].name`];
      const options: string[] = [];
      let optIndex = 0;
      while (rawBody[`variants[${variantIndex}].options[${optIndex}`]) {
        options.push(rawBody[`variants[${variantIndex}].options[${optIndex}`]);
        optIndex++;
      }
      if (name && options.length > 0) {
        dto.variants.push({ name, options });
      }
      variantIndex++;
    }

    // Specifications - similar
    dto.specifications = [];
    let specIndex = 0;
    while (rawBody[`specifications[${specIndex}].key`]) {
      const key = rawBody[`specifications[${specIndex}].key`];
      const value = rawBody[`specifications[${specIndex}].value`];
      if (key && value) {
        dto.specifications.push({ key, value });
      }
      specIndex++;
    }

    // SEO
    dto.seo = {
      metaTitle: rawBody['seo[metaTitle]'] || '',
      metaDescription: rawBody['seo[metaDescription]'] || '',
      keywords: typeof rawBody['seo[keywords]'] === 'string'
        ? rawBody['seo[keywords]'].split(',').map(k => k.trim()).filter(Boolean)
        : [],
    };

    return dto;
  }
}