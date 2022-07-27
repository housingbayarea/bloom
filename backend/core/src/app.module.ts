// dotenv is a dev dependency, so conditionally import it (don't need it in Prod).
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("dotenv").config()
} catch {
  // Pass
}
if (process.env.NEW_RELIC_APP_NAME && process.env.NEW_RELIC_LICENSE_KEY) {
  require("newrelic")
}
import { ClassSerializerInterceptor, DynamicModule, INestApplication, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
// Use require because of the CommonJS/AMD style export.
// See https://www.typescriptlang.org/docs/handbook/modules.html#export--and-import--require
import { AuthModule } from "./auth/auth.module"
import { ListingsModule } from "./listings/listings.module"
import { ApplicationsModule } from "./applications/applications.module"
import { PreferencesModule } from "./preferences/preferences.module"
import { UnitsModule } from "./units/units.module"
import { AmiChartsModule } from "./ami-charts/ami-charts.module"
import { ApplicationFlaggedSetsModule } from "./application-flagged-sets/application-flagged-sets.module"
import * as bodyParser from "body-parser"
import { ThrottlerModule } from "@nestjs/throttler"
import { ThrottlerStorageRedisService } from "nestjs-throttler-storage-redis"
import Redis from "ioredis"
import { SharedModule } from "./shared/shared.module"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { TranslationsModule } from "./translations/translations.module"
import { HttpAdapterHost, Reflector } from "@nestjs/core"
import { AssetsModule } from "./assets/assets.module"
import { JurisdictionsModule } from "./jurisdictions/jurisdictions.module"
import { ReservedCommunityTypesModule } from "./reserved-community-type/reserved-community-types.module"
import { UnitTypesModule } from "./unit-types/unit-types.module"
import { UnitRentTypesModule } from "./unit-rent-types/unit-rent-types.module"
import { UnitAccessibilityPriorityTypesModule } from "./unit-accessbility-priority-types/unit-accessibility-priority-types.module"
import { ApplicationMethodsModule } from "./application-methods/applications-methods.module"
import { PaperApplicationsModule } from "./paper-applications/paper-applications.module"
import { ProgramsModule } from "./program/programs.module"
import { ActivityLogModule } from "./activity-log/activity-log.module"
import { logger } from "./shared/middlewares/logger.middleware"
import { CatchAllFilter } from "./shared/filters/catch-all-filter"

export function applicationSetup(app: INestApplication) {
  const { httpAdapter } = app.get(HttpAdapterHost)
  app.enableCors()
  app.use(logger)
  app.useGlobalFilters(new CatchAllFilter(httpAdapter))
  app.use(bodyParser.json({ limit: "50mb" }))
  app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }))
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), { excludeExtraneousValues: true })
  )
  return app
}

@Module({
  imports: [ActivityLogModule],
})
export class AppModule {
  static register(dbOptions): DynamicModule {
    /**
     * DEV NOTE:
     * This configuration is required due to issues with
     * self signed certificates in Redis 6.
     *
     * { rejectUnauthorized: false } option is intentional and required
     *
     * Read more:
     * https://help.heroku.com/HC0F8CUS/redis-connection-issues
     * https://devcenter.heroku.com/articles/heroku-redis#ioredis-module
     */
    const redis =
      "0" === process.env.REDIS_USE_TLS
        ? new Redis(process.env.REDIS_URL)
        : new Redis(process.env.REDIS_TLS_URL, {
            tls: {
              rejectUnauthorized: false,
            },
          })

    return {
      module: AppModule,
      imports: [
        AuthModule,
        AmiChartsModule,
        ApplicationFlaggedSetsModule,
        ApplicationMethodsModule,
        ApplicationsModule,
        AssetsModule,
        JurisdictionsModule,
        ListingsModule,
        PaperApplicationsModule,
        PreferencesModule,
        ProgramsModule,
        ProgramsModule,
        ReservedCommunityTypesModule,
        SharedModule,
        TranslationsModule,
        TypeOrmModule.forRoot({
          ...dbOptions,
          autoLoadEntities: true,
        }),
        ThrottlerModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (config: ConfigService) => ({
            ttl: config.get("THROTTLE_TTL"),
            limit: config.get("THROTTLE_LIMIT"),
            storage: new ThrottlerStorageRedisService(redis),
          }),
        }),
        UnitsModule,
        UnitTypesModule,
        UnitRentTypesModule,
        UnitAccessibilityPriorityTypesModule,
      ],
    }
  }
}
