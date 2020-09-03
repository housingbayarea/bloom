import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { logger } from "./middleware/logger.middleware"
import { Logger, ValidationPipe } from "@nestjs/common"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import { EntityNotFoundExceptionFilter } from "./filters/entity-not-found-exception.filter"
import { getConnection } from "typeorm"

let app
async function bootstrap() {
  app = await NestFactory.create(AppModule)
  app.enableCors()
  app.use(logger)
  app.useGlobalFilters(new EntityNotFoundExceptionFilter())
  app.useGlobalPipes(
    new ValidationPipe({
      // Only allow props through that have been specified in the appropriate DTO
      whitelist: true,
      // Automatically transform validated prop values into their specified types
      transform: true,
    })
  )

  const conn = getConnection()
  // showMigrations returns true if there are pending migrations
  if (await conn.showMigrations()) {
    Logger.error("Detected pending migrations. Please run them before starting the app.")
    process.exit(1)
  }

  const options = new DocumentBuilder()
    .setTitle("Bloom API")
    .setVersion("1.0")
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, options)
  SwaggerModule.setup("docs", app, document)
  await app.listen(process.env.PORT || 3001)
}
bootstrap()

export default app
