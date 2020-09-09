import { IsDefined, IsOptional, IsString, ValidateNested } from "class-validator"
import { IdDto } from "../lib/id.dto"
import { Expose, Type } from "class-transformer"
import { OmitType } from "@nestjs/swagger"
import { Application } from "../entity/application.entity"

export class ApplicationsListQueryParams {
  @IsOptional()
  @IsString()
  listingId?: string
}

export class ApplicationDto extends OmitType(Application, ["listing", "user"] as const) {
  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => IdDto)
  user?: IdDto

  @Expose()
  @IsDefined()
  @ValidateNested()
  @Type(() => IdDto)
  listing: IdDto
}
