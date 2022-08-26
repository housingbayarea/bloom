import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ListingsService } from "./listings.service"
import { ListingsController } from "./listings.controller"
import { Listing } from "./entities/listing.entity"
import { Unit } from "../units/entities/unit.entity"
import { MultiselectQuestion } from "../multiselect-question/entities/multiselect-question.entity"
import { AuthModule } from "../auth/auth.module"
import { User } from "../auth/entities/user.entity"
import { TranslationsModule } from "../translations/translations.module"
import { AmiChart } from "../ami-charts/entities/ami-chart.entity"
import { ListingFeatures } from "./entities/listing-features.entity"
import { ActivityLogModule } from "../activity-log/activity-log.module"
import { ListingRepository } from "./db/listing.repository"
import { ListingUtilities } from "./entities/listing-utilities.entity"

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Listing,
      MultiselectQuestion,
      Unit,
      User,
      AmiChart,
      ListingRepository,
      ListingFeatures,
      ListingUtilities,
    ]),
    AuthModule,
    TranslationsModule,
    ActivityLogModule,
  ],
  providers: [ListingsService],
  exports: [ListingsService],
  controllers: [ListingsController],
})
// We have to manually disconnect from redis on app close
export class ListingsModule {}
