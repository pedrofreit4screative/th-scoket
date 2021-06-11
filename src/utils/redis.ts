import ioRedis from 'ioredis'

export class Redis {
  private redis: ioRedis.Redis

  constructor() {
    this.redis = new ioRedis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      keyPrefix: 'cache:',
    })
  }

  async getCache<T>(key: string): Promise<T> {
    const value = await this.redis.get(key)

    return JSON.parse(value)
  }

  setCache<T>(key: string, value: T): void {
    this.redis.set(key, JSON.stringify(value))
  }

  deleteCache(key: string) {
    return this.redis.del(key)
  }
}

export class RedisIn {
  public redis: ioRedis.Redis

  constructor() {
    this.redis = new ioRedis({
      host: process.env.REDIS_PROD_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PROD_PORT) || 6379,
      password: process.env.REDIS_PROD_PASS || 'localhost',
    })
  }

  async getCache<T>(key: string): Promise<T> {
    const value = await this.redis.get(key)

    return value ? JSON.parse(value) : null
  }

  setCache<T>(key: string, value: T): void {
    this.redis.set(key, JSON.stringify(value))
  }

  deleteCache(key: string) {
    return this.redis.del(key)
  }
}
