import { OmitType } from "@nestjs/swagger"
import { User } from "../entities/user.entity"
import { Expose, Type } from "class-transformer"
import {
  IsDate,
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from "class-validator"
import { ValidationsGroupsEnum } from "../../shared/types/validations-groups-enum"
import { IdNameDto } from "../../shared/dto/idName.dto"
import { IdDto } from "../../shared/dto/id.dto"
import { Match } from "../../shared/decorators/match.decorator"
import { passwordRegex } from "../../shared/password-regex"
import { PaginationFactory, PaginationAllowsAllQueryParams } from "../../shared/dto/pagination.dto"
import { UserRolesDto } from "./user-roles.dto"
import { JurisdictionDto } from "../../jurisdictions/dto/jurisdiction.dto"

export class UserDto extends OmitType(User, [
  "leasingAgentInListings",
  "passwordHash",
  "resetToken",
  "confirmationToken",
  "roles",
  "jurisdictions",
] as const) {
  @Expose()
  @IsOptional()
  @IsDefined({ groups: [ValidationsGroupsEnum.default] })
  @ValidateNested({ groups: [ValidationsGroupsEnum.default], each: true })
  @Type(() => IdNameDto)
  leasingAgentInListings?: IdNameDto[] | null

  @Expose()
  @IsOptional()
  @IsDefined({ groups: [ValidationsGroupsEnum.default] })
  @Type(() => UserRolesDto)
  roles?: UserRolesDto | null

  @Expose()
  @IsDefined({ groups: [ValidationsGroupsEnum.default] })
  @ValidateNested({ groups: [ValidationsGroupsEnum.default], each: true })
  @Type(() => JurisdictionDto)
  jurisdictions: JurisdictionDto[]
}

export class UserBasicDto extends OmitType(User, [
  "leasingAgentInListings",
  "passwordHash",
  "confirmationToken",
  "resetToken",
  "roles",
  "jurisdictions",
] as const) {
  @Expose()
  @IsDefined({ groups: [ValidationsGroupsEnum.default] })
  @ValidateNested({ groups: [ValidationsGroupsEnum.default], each: true })
  @Type(() => UserRolesDto)
  roles: UserRolesDto

  @Expose()
  @IsDefined({ groups: [ValidationsGroupsEnum.default] })
  @ValidateNested({ groups: [ValidationsGroupsEnum.default], each: true })
  @Type(() => JurisdictionDto)
  jurisdictions: JurisdictionDto[]
}

export class UserDtoWithAccessToken extends UserDto {
  @Expose()
  accessToken: string
}

export class EmailDto {
  @Expose()
  @IsEmail({}, { groups: [ValidationsGroupsEnum.default] })
  email: string

  @Expose()
  @IsOptional({ groups: [ValidationsGroupsEnum.default] })
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @MaxLength(256, { groups: [ValidationsGroupsEnum.default] })
  appUrl?: string | null
}

export class UserCreateDto extends OmitType(UserDto, [
  "id",
  "createdAt",
  "updatedAt",
  "leasingAgentInListings",
  "roles",
  "jurisdictions",
] as const) {
  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @Matches(passwordRegex, {
    message: "passwordTooWeak",
    groups: [ValidationsGroupsEnum.default],
  })
  password: string

  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @MaxLength(64, { groups: [ValidationsGroupsEnum.default] })
  @Match("password", { groups: [ValidationsGroupsEnum.default] })
  passwordConfirmation: string

  @Expose()
  @IsEmail({}, { groups: [ValidationsGroupsEnum.default] })
  @Match("email", { groups: [ValidationsGroupsEnum.default] })
  emailConfirmation: string

  @Expose()
  @IsOptional({ groups: [ValidationsGroupsEnum.default] })
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @MaxLength(256, { groups: [ValidationsGroupsEnum.default] })
  appUrl?: string | null

  @Expose()
  @IsOptional({ groups: [ValidationsGroupsEnum.default] })
  @ValidateNested({ groups: [ValidationsGroupsEnum.default], each: true })
  @Type(() => JurisdictionDto)
  jurisdictions?: JurisdictionDto[]
}

export class UserUpdateDto extends OmitType(UserDto, [
  "id",
  "createdAt",
  "updatedAt",
  "leasingAgentInListings",
  "roles",
  "jurisdictions",
] as const) {
  @Expose()
  @IsOptional({ groups: [ValidationsGroupsEnum.default] })
  @IsUUID(4, { groups: [ValidationsGroupsEnum.default] })
  id?: string

  @Expose()
  @IsOptional({ groups: [ValidationsGroupsEnum.default] })
  @IsDate({ groups: [ValidationsGroupsEnum.default] })
  @Type(() => Date)
  createdAt?: Date

  @Expose()
  @IsOptional({ groups: [ValidationsGroupsEnum.default] })
  @IsDate({ groups: [ValidationsGroupsEnum.default] })
  @Type(() => Date)
  updatedAt?: Date

  @Expose()
  @IsOptional({ groups: [ValidationsGroupsEnum.default] })
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @Matches(passwordRegex, {
    message: "passwordTooWeak",
    groups: [ValidationsGroupsEnum.default],
  })
  password?: string

  @Expose()
  @ValidateIf((o) => o.password, { groups: [ValidationsGroupsEnum.default] })
  @IsNotEmpty({ groups: [ValidationsGroupsEnum.default] })
  currentPassword?: string

  @Expose()
  @IsDefined({ groups: [ValidationsGroupsEnum.default] })
  @ValidateNested({ groups: [ValidationsGroupsEnum.default], each: true })
  @Type(() => IdDto)
  jurisdictions: IdDto[]
}

export class UserListQueryParams extends PaginationAllowsAllQueryParams {}

export class PaginatedUserListDto extends PaginationFactory<UserDto>(UserDto) {}
