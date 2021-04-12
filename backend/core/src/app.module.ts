import { DynamicModule, INestApplication, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { UserModule } from "./user/user.module"
// Use require because of the CommonJS/AMD style export.
// See https://www.typescriptlang.org/docs/handbook/modules.html#export--and-import--require
import { AuthModule } from "./auth/auth.module"

import { ListingsModule } from "./listings/listings.module"
import { ApplicationsModule } from "./applications/applications.module"
import { EntityNotFoundExceptionFilter } from "./filters/entity-not-found-exception.filter"
import { logger } from "./middleware/logger.middleware"
import { PreferencesModule } from "./preferences/preferences.module"
import { UnitsModule } from "./units/units.module"
import { ConfigModule } from "@nestjs/config"
import Joi from "joi"
import { PropertyGroupsModule } from "./property-groups/property-groups.module"
import { PropertiesModule } from "./property/properties.module"
import { AmiChartsModule } from "./ami-charts/ami-charts.module"
import { ApplicationFlaggedSetsModule } from "./application-flagged-sets/application-flagged-sets.module"
import * as bodyParser from "body-parser"

export function applicationSetup(app: INestApplication) {
  app.enableCors()
  app.use(logger)
  app.useGlobalFilters(new EntityNotFoundExceptionFilter())
  app.use(bodyParser.json({ limit: "50mb" }))
  app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }))
  return app
}

@Module({
  imports: [ApplicationFlaggedSetsModule],
})
export class AppModule {
  static register(dbOptions): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ConfigModule.forRoot({
          validationSchema: Joi.object({
            PORT: Joi.number().default(3100).required(),
            NODE_ENV: Joi.string()
              .valid("development", "staging", "production", "test")
              .default("development"),
            DATABASE_URL: Joi.string().required(),
          }),
        }),
        TypeOrmModule.forRoot({
          ...dbOptions,
          autoLoadEntities: true,
        }),
        UserModule,
        AuthModule,
        ListingsModule,
        ApplicationsModule,
        PreferencesModule,
        UnitsModule,
        PropertiesModule,
        PropertyGroupsModule,
        AmiChartsModule,
      ],
    }
  }
}
