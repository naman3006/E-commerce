/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  Inject,
  Optional,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { UploadService } from '../upload/upload.service';

// Define interface
export interface ProductQueryResult {
  products: ProductDocument[];
  total: number;
  page: number;
  totalPages: number;
}

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  private readonly CACHE_TTL = 300;
  private readonly FEATURED_CACHE_KEY = 'featured_products';

  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private readonly uploadService: UploadService, // ✔ REQUIRED FIRST
    @Optional() @Inject(CACHE_MANAGER) private cacheManager?: Cache, // ✔ OPTIONAL LAST
  ) {}

  // Convert array | string | "" → string
  private toStringValue(value: string[] | string | undefined): string {
    if (Array.isArray(value)) return value.join(',');
    return value || '';
  }

  // Create Product with file processing
  async processAndCreateProduct(
    createProductDto: CreateProductDto,
    files: Express.Multer.File[],
    sellerId?: string,
  ): Promise<ProductDocument> {
    let images: string[] = createProductDto.images || [];
    let thumbnail: string | undefined = createProductDto.thumbnail;

    if (files && files.length > 0) {
      const { images: processedImages, thumbnails } =
        await this.uploadService.processProductImages(files);

      images = processedImages;
      if (!thumbnail && processedImages.length > 0) {
        thumbnail = thumbnails[0];
      }
    }

    const finalDto: any = {
      ...createProductDto,
      images,
      thumbnail,
      tags: this.toStringValue(createProductDto.tags)
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),

      seo: {
        ...createProductDto.seo,
        keywords: this.toStringValue(createProductDto.seo?.keywords)
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean),
      },
    };

    return this.internalCreate(finalDto, sellerId);
  }

  // Internal create
  private async internalCreate(
    createProductDto: any,
    sellerId?: string,
  ): Promise<ProductDocument> {
    // Safely get categoryId and trim if it's a string
    const categoryId = typeof createProductDto?.categoryId === 'string' 
      ? createProductDto.categoryId.trim() 
      : createProductDto?.categoryId;
    
    if (!categoryId) {
      throw new BadRequestException('Category is required.');
    }

    if (!Types.ObjectId.isValid(categoryId)) {
      throw new BadRequestException('Invalid category ID.');
    }

    if (!createProductDto.sku) {
      createProductDto.sku = this.generateSKU(createProductDto.title);
    }

    if (!createProductDto.stockStatus) {
      createProductDto.stockStatus =
        createProductDto.stock > 0 ? 'in-stock' : 'out-of-stock';
    }

    try {
      const productData: any = {
        ...createProductDto,
        categoryId: new Types.ObjectId(categoryId),
      };

      if (sellerId && Types.ObjectId.isValid(sellerId)) {
        productData.sellerId = new Types.ObjectId(sellerId);
      }

      // Try saving the product. If there's a duplicate SKU error, attempt to
      // regenerate the SKU a few times before failing.
      let savedProduct: ProductDocument | null = null;
      let attempts = 0;
      const maxAttempts = 5;
      let lastError: any = null;

      while (attempts < maxAttempts) {
        try {
          const product = new this.productModel(productData);
          savedProduct = await product.save();
          break;
        } catch (err) {
          lastError = err;
          // If duplicate key on sku, regenerate and retry
          if ((err as any).code === 11000 && Object.keys((err as any).keyValue || {}).includes('sku')) {
            attempts += 1;
            this.logger.warn(`Duplicate SKU detected, regenerating SKU (attempt ${attempts})`);
            // Generate a new SKU using existing logic and append a short random suffix
            productData.sku = `${this.generateSKU(createProductDto.title)}-${Math.random().toString(36).slice(2, 7)}`;
            // continue loop to retry save
            continue;
          }

          // Non-recoverable error — break and handle below
          break;
        }
      }

      if (!savedProduct) {
        // If we exited without saving, rethrow lastError to be handled below
        throw lastError || new Error('Failed to save product');
      }

      this.invalidateProductCache();
      return savedProduct;
    } catch (error) {
      // Log original error for debugging
      this.logger.error('Failed to create product', error as any);

      // Try to extract a meaningful message from common Mongoose errors
      if (error && (error as any).name === 'ValidationError') {
        const msgs = Object.values((error as any).errors || {}).map((e: any) => e.message);
        throw new BadRequestException(msgs.join('; ') || 'Validation failed');
      }

      // Duplicate key (unique index) error
      if ((error as any).code === 11000) {
        const key = Object.keys((error as any).keyValue || {}).join(', ');
        throw new BadRequestException(`Duplicate value for field(s): ${key}`);
      }

      // Fallback to original message if available
      const msg = (error as any)?.message;
      throw new BadRequestException(msg || 'Failed to create product');
    }
  }

  // Update Product + files
  async processAndUpdateProduct(
    id: string,
    updateProductDto: UpdateProductDto,
    files?: Express.Multer.File[],
  ): Promise<ProductDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID format');
    }

    const existingProduct = await this.productModel.findById(id).exec();
    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    let images: string[] =
      updateProductDto.images || existingProduct.images || [];
    let thumbnail: string | undefined =
      updateProductDto.thumbnail || existingProduct.thumbnail;

    if (files && files.length > 0) {
      await this.uploadService.deleteProductImages(existingProduct.images);

      if (existingProduct.thumbnail) {
        await this.uploadService.deleteProductImages([
          existingProduct.thumbnail,
        ]);
      }

      const { images: processedImages, thumbnails } =
        await this.uploadService.processProductImages(files);

      images = processedImages;
      if (!thumbnail && processedImages.length > 0) {
        thumbnail = thumbnails[0];
      }
    }

    const finalDto: any = {
      ...updateProductDto,
      images,
      thumbnail,

      ...(updateProductDto.tags !== undefined && {
        tags: this.toStringValue(updateProductDto.tags)
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      }),

      ...(updateProductDto.seo && {
        seo: {
          ...updateProductDto.seo,
          keywords: this.toStringValue(updateProductDto.seo.keywords)
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean),
        },
      }),
    };

    return this.internalUpdate(id, finalDto);
  }

  // Internal update
  private async internalUpdate(
    id: string,
    updateProductDto: any,
  ): Promise<ProductDocument> {
    if (updateProductDto.categoryId !== undefined) {
      // Safely get categoryId and trim if it's a string
      const categoryId = typeof updateProductDto?.categoryId === 'string' 
        ? updateProductDto.categoryId.trim() 
        : updateProductDto?.categoryId;
      
      if (!categoryId) {
        throw new BadRequestException('Category cannot be empty.');
      }
      if (!Types.ObjectId.isValid(categoryId)) {
        throw new BadRequestException('Invalid category ID format');
      }
    }

    const updateData = {
      ...updateProductDto,
      ...(updateProductDto.categoryId && {
        categoryId: new Types.ObjectId(typeof updateProductDto.categoryId === 'string' 
          ? updateProductDto.categoryId.trim() 
          : updateProductDto.categoryId),
      }),
    };

    if (
      updateProductDto.stock !== undefined &&
      !updateProductDto.stockStatus
    ) {
      updateData.stockStatus =
        updateProductDto.stock > 0 ? 'in-stock' : 'out-of-stock';
    }

    try {
      const product = await this.productModel
        .findByIdAndUpdate(id, updateData, { new: true })
        .populate('categoryId')
        .exec();

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      this.invalidateProductCache();
      return product;
    } catch (error) {
      throw new BadRequestException('Failed to update product');
    }
  }

  async findAll(query: QueryProductDto): Promise<ProductQueryResult> {
    const {
      category,
      search,
      brand,
      minPrice,
      maxPrice,
      minRating,
      isFeatured,
      isActive,
      tags,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      limit = 10,
      page = 1,
    } = query;

    const cacheKey = this.generateCacheKey(query);

    if (this.cacheManager) {
      const cached = await this.cacheManager.get<ProductQueryResult>(cacheKey);
      if (cached) return cached;
    }

    const filter = this.buildFilter(query);
    const sort = this.buildSort(sortBy, sortOrder);
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.productModel
        .find(filter)
        .populate('categoryId')
        .collation({ locale: 'en' })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.productModel.countDocuments(filter).exec(),
    ]);

    const result: ProductQueryResult = {
      products: products as ProductDocument[],
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };

    if (this.cacheManager) {
      await this.cacheManager.set(cacheKey, result, this.CACHE_TTL * 1000);
    }

    return result;
  }

  async findOne(id: string): Promise<ProductDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID format');
    }

    const product = await this.productModel
      .findById(id)
      .populate('categoryId')
      .populate('reviews')
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    setTimeout(() => {
      this.productModel
        .updateOne({ _id: id }, { $inc: { viewCount: 1 } })
        .exec();
    }, 0);

    return product;
  }

  async create(
    createProductDto: CreateProductDto,
    sellerId?: string,
  ): Promise<ProductDocument> {
    const transformedDto: any = {
      ...createProductDto,
      tags: this.toStringValue(createProductDto.tags)
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),

      seo: {
        ...createProductDto.seo,
        keywords: this.toStringValue(createProductDto.seo?.keywords)
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean),
      },
    };

    return this.internalCreate(transformedDto, sellerId);
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductDocument> {
    const transformedDto: any = {
      ...updateProductDto,

      ...(updateProductDto.tags !== undefined && {
        tags: this.toStringValue(updateProductDto.tags)
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      }),

      ...(updateProductDto.seo && {
        seo: {
          ...updateProductDto.seo,
          keywords: this.toStringValue(updateProductDto.seo.keywords)
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean),
        },
      }),
    };

    return this.internalUpdate(id, transformedDto);
  }

  async remove(id: string): Promise<string> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid product ID format');
    }

    const product = await this.productModel.findById(id).exec();
    if (product) {
      if (product.images?.length > 0) {
        await this.uploadService.deleteProductImages(product.images);
      }
      if (product.thumbnail) {
        await this.uploadService.deleteProductImages([product.thumbnail]);
      }
    }

    const result = await this.productModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Product not found');
    }

    this.invalidateProductCache();
    return id;
  }

  async getFeaturedProducts(limit: number = 8): Promise<ProductDocument[]> {
    const cacheKey = `${this.FEATURED_CACHE_KEY}:${limit}`;

    if (this.cacheManager) {
      const cached = await this.cacheManager.get<ProductDocument[]>(cacheKey);
      if (cached) return cached;
    }

    const products = await this.productModel
      .find({ isFeatured: true, isActive: true })
      .populate('categoryId')
      .sort({ soldCount: -1, rating: -1 })
      .limit(limit)
      .lean()
      .exec();

    if (this.cacheManager) {
      await this.cacheManager.set(cacheKey, products, this.CACHE_TTL * 1000);
    }

    return products as ProductDocument[];
  }

  async getRelatedProducts(
    productId: string,
    limit: number = 4,
  ): Promise<ProductDocument[]> {
    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestException('Invalid ID');
    }

    const product = await this.productModel.findById(productId);
    if (!product) throw new NotFoundException('Product not found');

    return (await this.productModel
      .find({
        _id: { $ne: productId },
        categoryId: product.categoryId,
        isActive: true,
      })
      .populate('categoryId')
      .sort({ rating: -1 })
      .limit(limit)
      .lean()
      .exec()) as ProductDocument[];
  }

  private buildFilter(params: Partial<QueryProductDto>): Record<string, any> {
    const filter: Record<string, any> = {};
    filter.categoryId = { $exists: true, $ne: null };

    if (params.category) {
      filter.categoryId = new Types.ObjectId(params.category);
    }

    if (params.search) {
      filter.$text = { $search: params.search };
    }

    if (params.brand) {
      filter.brand = { $regex: params.brand, $options: 'i' };
    }

    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      filter.price = {};
      if (params.minPrice !== undefined) filter.price.$gte = params.minPrice;
      if (params.maxPrice !== undefined) filter.price.$lte = params.maxPrice;
    }

    if (params.minRating !== undefined) {
      filter.rating = { $gte: params.minRating };
    }

    if (params.isFeatured !== undefined) {
      filter.isFeatured = params.isFeatured;
    }

    filter.isActive = params.isActive ?? true;

    if (params.tags) {
      const tagArray = this.toStringValue(params.tags)
        .split(',')
        .map((t) => t.trim());
      filter.tags = { $in: tagArray };
    }

    return filter;
  }

  private buildSort(
    sortBy: string = 'createdAt',
    sortOrder: string = 'desc',
  ): Record<string, 1 | -1> {
    return { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
  }

  private generateCacheKey(params: Record<string, any>): string {
    const key = JSON.stringify(params);
    return `products:${Buffer.from(key).toString('base64')}`;
  }

  private generateSKU(title: string): string {
    const prefix = title
      .split(' ')
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase())
      .join('');

    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}-${timestamp}`;
  }

  private invalidateProductCache(): void {
    this.logger.debug('Product cache invalidated');
  }
}
