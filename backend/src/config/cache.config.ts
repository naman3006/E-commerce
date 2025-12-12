import { CacheModuleOptions } from '@nestjs/cache-manager';

export const cacheConfig = (): CacheModuleOptions => {
  if (process.env.REDIS_URL) {
    // Redis configuration for production
    return {
      isGlobal: true,
      ttl: parseInt(process.env.CACHE_TTL || '300', 10) * 1000, // Default 5 minutes
      max: 100,
    };
  }

  // In-memory cache for development
  return {
    isGlobal: true,
    ttl: 300000, // 5 minutes
    max: 100,
  };
};
