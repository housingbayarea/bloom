import { Expose, Type } from "class-transformer"
import {
  ArrayMaxSize,
  IsString,
  MaxLength,
  ValidateNested,
  IsOptional,
  IsBoolean,
} from "class-validator"
import { ValidationsGroupsEnum } from "../../../shared/types/validations-groups-enum"
import { FormMetadataOptions } from "./form-metadata-options"
import { ApiProperty } from "@nestjs/swagger"

export enum FormMetaDataType {
  radio = "radio",
  checkbox = "checkbox",
}

export class FormMetadata {
  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @MaxLength(128, { groups: [ValidationsGroupsEnum.default] })
  @ApiProperty()
  key: string

  @Expose()
  @ArrayMaxSize(64, { groups: [ValidationsGroupsEnum.default] })
  @ValidateNested({ groups: [ValidationsGroupsEnum.default], each: true })
  @Type(() => FormMetadataOptions)
  @ApiProperty({ type: [FormMetadataOptions], nullable: true })
  options: FormMetadataOptions[]

  @Expose()
  @IsOptional({ groups: [ValidationsGroupsEnum.default] })
  @IsBoolean({ groups: [ValidationsGroupsEnum.default] })
  @ApiProperty()
  hideGenericDecline?: boolean

  @Expose()
  @IsOptional({ groups: [ValidationsGroupsEnum.default] })
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @ApiProperty()
  customSelectText?: string

  @Expose()
  @IsOptional({ groups: [ValidationsGroupsEnum.default] })
  @IsBoolean({ groups: [ValidationsGroupsEnum.default] })
  @ApiProperty()
  hideFromListing?: boolean

  @Expose()
  @IsOptional({ groups: [ValidationsGroupsEnum.default] })
  @ApiProperty({ enum: FormMetaDataType, enumName: "FormMetaDataType" })
  type?: FormMetaDataType
}
