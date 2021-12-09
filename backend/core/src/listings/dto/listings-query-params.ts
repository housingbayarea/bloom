import { PaginationAllowsAllQueryParams } from "../../shared/dto/pagination.dto"
import { Expose, Type } from "class-transformer"
import { ApiProperty, getSchemaPath } from "@nestjs/swagger"
import { ListingFilterParams } from "./listing-filter-params"
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator"
import { ValidationsGroupsEnum } from "../../shared/types/validations-groups-enum"
import { OrderByFieldsEnum } from "../types/listing-orderby-enum"

export class ListingsQueryParams extends PaginationAllowsAllQueryParams {
  @Expose()
  @ApiProperty({
    name: "filter",
    required: false,
    type: [String],
    items: {
      $ref: getSchemaPath(ListingFilterParams),
    },
    example: { $comparison: "=", status: "active", name: "Coliseum" },
  })
  @IsOptional({ groups: [ValidationsGroupsEnum.default] })
  @IsArray({ groups: [ValidationsGroupsEnum.default] })
  @ArrayMaxSize(16, { groups: [ValidationsGroupsEnum.default] })
  @Type(() => ListingFilterParams)
  @ValidateNested({ groups: [ValidationsGroupsEnum.default], each: true })
  filter?: ListingFilterParams[]

  @Expose()
  @ApiProperty({
    name: "view",
    required: false,
    type: String,
  })
  @IsOptional({ groups: [ValidationsGroupsEnum.default] })
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  view?: string

  @Expose()
  @ApiProperty({
    name: "orderBy",
    required: false,
    enum: OrderByFieldsEnum,
    enumName: "OrderByFieldsEnum",
    example: "updatedAt",
  })
  @IsOptional({ groups: [ValidationsGroupsEnum.default] })
  @IsEnum(OrderByFieldsEnum, { groups: [ValidationsGroupsEnum.default] })
  orderBy?: OrderByFieldsEnum
}
