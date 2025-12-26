import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import Redis from 'ioredis';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';

@Injectable()
export class SocialProofService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis | null = null;
  private readonly logger = new Logger(SocialProofService.name);
  private memoryCache = new Map<string, number>();

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel('Product') private productModel: Model<ProductDocument>,
  ) {
    if (process.env.REDIS_HOST) {
      this.redisClient = new Redis({
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379'),
      });
      this.logger.log('Social Proof Service initialized with Redis');
    } else {
      this.logger.warn(
        'REDIS_HOST not defined. Social Proof Service running in memory-only mode.',
      );
    }
  }

  onModuleInit() {
    // Already handled in constructor
  }

  onModuleDestroy() {
    if (this.redisClient) {
      this.redisClient.disconnect();
    }
  }

  async incrementViewers(productId: string): Promise<number> {
    const key = `viewers:product:${productId}`;
    if (this.redisClient) {
      const count = await this.redisClient.incr(key);
      await this.redisClient.expire(key, 7200);
      return count;
    }
    // Memory Fallback
    const current = this.memoryCache.get(key) || 0;
    this.memoryCache.set(key, current + 1);
    return current + 1;
  }

  async decrementViewers(productId: string): Promise<number> {
    const key = `viewers:product:${productId}`;
    if (this.redisClient) {
      const count = await this.redisClient.decr(key);
      if (count < 0) {
        await this.redisClient.set(key, 0);
        return 0;
      }
      return count;
    }
    // Memory Fallback
    const current = this.memoryCache.get(key) || 0;
    if (current > 0) {
      this.memoryCache.set(key, current - 1);
      return current - 1;
    }
    return 0;
  }

  async getViewers(productId: string): Promise<number> {
    const key = `viewers:product:${productId}`;
    if (this.redisClient) {
      const count = await this.redisClient.get(key);
      return count ? parseInt(count, 10) : 0;
    }
    return this.memoryCache.get(key) || 0;
  }

  async getProductStats(
    productId: string,
  ): Promise<{ soldCount: number; boughtInLast24h: number }> {
    try {
      const product = (await this.productModel
        .findById(productId)
        .select('soldCount')
        .lean()) as Product; // Use simple cast or generic lean if supported

      const soldCount = product ? product.soldCount : 0;

      // Calculate bought in last 24h
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const aggregation = [
        {
          $match: {
            createdAt: { $gte: twentyFourHoursAgo },
            'items.productId': new Types.ObjectId(productId),
          },
        },
        { $unwind: '$items' },
        {
          $match: {
            'items.productId': new Types.ObjectId(productId),
          },
        },
        {
          $group: {
            _id: null,
            totalBought: { $sum: '$items.quantity' },
          },
        },
      ];

      const result = await this.orderModel.aggregate<{
        _id: null;
        totalBought: number;
      }>(aggregation);
      const boughtInLast24h = result.length > 0 ? result[0].totalBought : 0;

      return { soldCount, boughtInLast24h };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error fetching product stats: ${errorMessage}`);
      return { soldCount: 0, boughtInLast24h: 0 };
    }
  }
}
