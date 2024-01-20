import { Injectable } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  private readonly client: RedisClientType;

  constructor() {
    this.client = createClient();

    this.client.connect();

    this.client.on('error', (err) => {
      console.error('Redis Client Error', err);
    });
  }

  async getValueFromCache(key: string) {
    return this.client.get(key);
  }

  async setValueToCache(key: string, value: string) {
    return this.client.set(key, value);
  }

  async deleteValueFromCache(key: string) {
    return this.client.del(key);
  }
}
