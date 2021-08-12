import { CacheModule, CACHE_MANAGER, Inject, Module, OnModuleDestroy } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import * as redisStore from "cache-manager-redis-store"
import { ListingsService } from "./listings.service"
import { ListingsController } from "./listings.controller"
import { Listing } from "./entities/listing.entity"
import { Unit } from "../units/entities/unit.entity"
import { Preference } from "../preferences/entities/preference.entity"
import { AuthModule } from "../auth/auth.module"
import { User } from "../auth/entities/user.entity"
import { Property } from "../property/entities/property.entity"
import { Store } from "cache-manager"
import Redis from "redis"

interface RedisCache extends Cache {
  store: RedisStore
}

interface RedisStore extends Store {
  name: "redis"
  getClient: () => Redis.RedisClient
  isCacheableValue: (value: unknown) => boolean
}

const cacheConfig = {
  ttl: 24 * 60 * 60,
  store: redisStore,
  url: process.env.REDIS_URL,
  tls: undefined,
}

if (process.env.REDIS_USE_TLS !== "0") {
  cacheConfig.url = process.env.REDIS_TLS_URL
  cacheConfig.tls = {
    rejectUnauthorized: false,
  }
}

@Module({
  imports: [
    CacheModule.register(cacheConfig),
    TypeOrmModule.forFeature([Listing, Preference, Unit, User, Property]),
    AuthModule,
  ],
  providers: [ListingsService],
  exports: [ListingsService],
  controllers: [ListingsController],
})
// We have to manually disconnect from redis on app close
export class ListingsModule implements OnModuleDestroy {
  redisClient: Redis.RedisClient
  constructor(@Inject(CACHE_MANAGER) private cacheManager: RedisCache) {
    this.redisClient = this.cacheManager.store.getClient()

    this.redisClient.on("error", (error) => {
      console.log("redis error = ", error)
    })
  }
  onModuleDestroy() {
    console.log("Disconnect from Redis")
    this.redisClient.quit()
  }

  onModuleInit() {
    console.log("Reset Redis Cache")
    this.redisClient.reset()
  }
}
