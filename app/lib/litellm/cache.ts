/**
 * Cache Abstraction
 *
 * Provides pluggable cache implementation for model info and other data.
 * Defaults to in-memory cache but can be swapped with Redis, Vercel KV, etc.
 */

import type { CacheAdapter } from './types'

/**
 * Simple in-memory cache implementation
 * Good for development and single-instance deployments
 */
export class MemoryCache implements CacheAdapter {
  private cache = new Map<string, { value: any; expiresAt?: number }>()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000)
  }

  async get(key: string): Promise<any | null> {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Check if expired
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.value
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const expiresAt = ttl ? Date.now() + ttl * 1000 : undefined

    this.cache.set(key, {
      value,
      expiresAt,
    })
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key)
  }

  async clear(): Promise<void> {
    this.cache.clear()
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt && now > entry.expiresAt) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Destroy the cache and stop cleanup
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.cache.clear()
  }
}

/**
 * No-op cache implementation (disabled caching)
 */
export class NoCache implements CacheAdapter {
  async get(): Promise<null> {
    return null
  }

  async set(): Promise<void> {
    // Do nothing
  }

  async delete(): Promise<void> {
    // Do nothing
  }

  async clear(): Promise<void> {
    // Do nothing
  }
}

/**
 * Example Redis cache implementation (not included, for reference)
 *
 * export class RedisCache implements CacheAdapter {
 *   constructor(private redis: Redis) {}
 *
 *   async get(key: string): Promise<any | null> {
 *     const value = await this.redis.get(key)
 *     return value ? JSON.parse(value) : null
 *   }
 *
 *   async set(key: string, value: any, ttl?: number): Promise<void> {
 *     const serialized = JSON.stringify(value)
 *     if (ttl) {
 *       await this.redis.setex(key, ttl, serialized)
 *     } else {
 *       await this.redis.set(key, serialized)
 *     }
 *   }
 *
 *   async delete(key: string): Promise<void> {
 *     await this.redis.del(key)
 *   }
 *
 *   async clear(): Promise<void> {
 *     await this.redis.flushdb()
 *   }
 * }
 */
