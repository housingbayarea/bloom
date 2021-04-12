import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common"
import { Request as ExpressRequest } from "express"
import { ApplicationsService } from "./applications.service"
import { ApiBearerAuth, ApiExtraModels, ApiOperation, ApiProperty, ApiTags } from "@nestjs/swagger"
import { OptionalAuthGuard } from "../auth/optional-auth.guard"
import { AuthzGuard } from "../auth/authz.guard"
import { ResourceType } from "../auth/resource_type.decorator"
import { authzActions, AuthzService } from "../auth/authz.service"
import { EmailService } from "../shared/email.service"
import { ListingsService } from "../listings/listings.service"
import { mapTo } from "../shared/mapTo"
import {
  ApplicationCreateDto,
  ApplicationDto,
  ApplicationUpdateDto,
  PaginatedApplicationDto,
} from "./dto/application.dto"
import { Expose, Transform } from "class-transformer"
import { IsBoolean, IsOptional, IsString, IsIn } from "class-validator"
import { PaginationQueryParams } from "../shared/dto/pagination.dto"
import { ValidationsGroupsEnum } from "../shared/validations-groups.enum"
import { defaultValidationPipeOptions } from "../shared/default-validation-pipe-options"
import { applicationPreferenceExtraModels } from "./entities/application-preferences.entity"
import { ApplicationCsvExporter } from "../csv/application-csv-exporter"

enum OrderByParam {
  firstName = "applicant.firstName",
  lastName = "applicant.lastName",
  submissionDate = "application.submissionDate",
  createdAt = "application.createdAt",
}

enum OrderParam {
  ASC = "ASC",
  DESC = "DESC",
}

export class ApplicationsListQueryParams extends PaginationQueryParams {
  @Expose()
  @ApiProperty({
    type: String,
    example: "listingId",
    required: false,
  })
  @IsOptional({ groups: [ValidationsGroupsEnum.default] })
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  listingId?: string

  @Expose()
  @ApiProperty({
    type: String,
    example: "search",
    required: false,
  })
  @IsOptional({ groups: [ValidationsGroupsEnum.default] })
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  search?: string

  @Expose()
  @ApiProperty({
    type: String,
    example: "userId",
    required: false,
  })
  @IsOptional({ groups: [ValidationsGroupsEnum.default] })
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  userId?: string

  @Expose()
  @ApiProperty({
    enum: Object.keys(OrderByParam),
    example: "createdAt",
    default: "createdAt",
    required: false,
  })
  @IsOptional({ groups: [ValidationsGroupsEnum.default] })
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @IsIn(Object.values(OrderByParam), { groups: [ValidationsGroupsEnum.default] })
  @Transform((value: string | undefined) =>
    value ? (OrderByParam[value] ? OrderByParam[value] : value) : OrderByParam.createdAt
  )
  orderBy?: OrderByParam

  @Expose()
  @ApiProperty({
    enum: OrderParam,
    example: "DESC",
    default: "DESC",
    required: false,
  })
  @IsOptional({ groups: [ValidationsGroupsEnum.default] })
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @IsIn(Object.keys(OrderParam), { groups: [ValidationsGroupsEnum.default] })
  @Transform((value: string | undefined) => (value ? value : OrderParam.DESC))
  order?: OrderParam
}

export class ApplicationsCsvListQueryParams {
  @Expose()
  @ApiProperty({
    type: String,
    example: "listingId",
    required: true,
  })
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  listingId: string

  @Expose()
  @ApiProperty({
    type: Boolean,
    example: true,
    required: false,
  })
  @IsOptional({ groups: [ValidationsGroupsEnum.default] })
  @IsBoolean({ groups: [ValidationsGroupsEnum.default] })
  @Transform((value: string | undefined) => value === "true", { toClassOnly: true })
  includeHeaders?: boolean

  @Expose()
  @ApiProperty({
    type: Boolean,
    example: true,
    required: false,
  })
  @IsOptional({ groups: [ValidationsGroupsEnum.default] })
  @IsBoolean({ groups: [ValidationsGroupsEnum.default] })
  @Transform((value: string | undefined) => value === "true", { toClassOnly: true })
  includeDemographics?: boolean

  @Expose()
  @ApiProperty({
    type: String,
    example: "userId",
    required: false,
  })
  @IsOptional({ groups: [ValidationsGroupsEnum.default] })
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  userId?: string
}

@Controller("applications")
@ApiTags("applications")
@ApiBearerAuth()
@ResourceType("application")
@UseGuards(OptionalAuthGuard, AuthzGuard)
@UsePipes(
  new ValidationPipe({
    ...defaultValidationPipeOptions,
    groups: [ValidationsGroupsEnum.default, ValidationsGroupsEnum.partners],
  })
)
@ApiExtraModels(...applicationPreferenceExtraModels)
export class ApplicationsController {
  constructor(
    private readonly applicationsService: ApplicationsService,
    private readonly emailService: EmailService,
    private readonly listingsService: ListingsService,
    private readonly authzService: AuthzService,
    private readonly applicationCsvExporter: ApplicationCsvExporter
  ) {}

  @Get()
  @ApiOperation({ summary: "List applications", operationId: "list" })
  async list(
    @Request() req: ExpressRequest,
    @Query() queryParams: ApplicationsListQueryParams
  ): Promise<PaginatedApplicationDto> {
    const response = await this.applicationsService.listPaginated(queryParams)
    await Promise.all(
      response.items.map(async (application) => {
        await this.authorizeUserAction(req.user, application, authzActions.read)
      })
    )
    return mapTo(PaginatedApplicationDto, response)
  }

  @Get(`csv`)
  @ApiOperation({ summary: "List applications as csv", operationId: "listAsCsv" })
  @Header("Content-Type", "text/csv")
  async listAsCsv(
    @Request() req: ExpressRequest,
    @Query() queryParams: ApplicationsCsvListQueryParams
  ): Promise<string> {
    const applications = await this.applicationsService.list(queryParams.listingId, null)
    await Promise.all(
      applications.map(async (application) => {
        await this.authorizeUserAction(req.user, application, authzActions.read)
      })
    )
    return this.applicationCsvExporter.export(
      applications,
      queryParams.includeHeaders,
      queryParams.includeDemographics
    )
  }

  @Post()
  @ApiOperation({ summary: "Create application", operationId: "create" })
  async create(
    @Request() req: ExpressRequest,
    @Body() applicationCreateDto: ApplicationCreateDto
  ): Promise<ApplicationDto> {
    await this.authorizeUserAction(req.user, applicationCreateDto, authzActions.create)
    const application = await this.applicationsService.create(applicationCreateDto, req.user)
    const listing = await this.listingsService.findOne(application.listing.id)
    if (application.applicant.emailAddress) {
      await this.emailService.confirmation(listing, application, applicationCreateDto.appUrl)
    }
    return mapTo(ApplicationDto, application)
  }

  @Get(`:applicationId`)
  @ApiOperation({ summary: "Get application by id", operationId: "retrieve" })
  async retrieve(
    @Request() req: ExpressRequest,
    @Param("applicationId") applicationId: string
  ): Promise<ApplicationDto> {
    const app = await this.applicationsService.findOne(applicationId)
    await this.authorizeUserAction(req.user, app, authzActions.read)
    return mapTo(ApplicationDto, app)
  }

  @Put(`:applicationId`)
  @ApiOperation({ summary: "Update application by id", operationId: "update" })
  async update(
    @Request() req: ExpressRequest,
    @Param("applicationId") applicationId: string,
    @Body() applicationUpdateDto: ApplicationUpdateDto
  ): Promise<ApplicationDto> {
    const app = await this.applicationsService.findOne(applicationId)
    await this.authorizeUserAction(req.user, app, authzActions.update)
    return mapTo(ApplicationDto, await this.applicationsService.update(applicationUpdateDto, app))
  }

  @Delete(`:applicationId`)
  @ApiOperation({ summary: "Delete application by id", operationId: "delete" })
  async delete(@Request() req: ExpressRequest, @Param("applicationId") applicationId: string) {
    const app = await this.applicationsService.findOne(applicationId)
    await this.authorizeUserAction(req.user, app, authzActions.delete)
    await this.applicationsService.delete(applicationId)
  }

  private authorizeUserAction(user, app, action) {
    return this.authzService.canOrThrow(user, "application", action, {
      ...app,
      user_id: app.user?.id,
      listing_id: app.listing?.id,
    })
  }
}
