import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common"
import { ApplicationDto, ApplicationsListQueryParams } from "./applications.dto"
import { ApplicationsService } from "./applications.service"
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger"
import { DefaultAuthGuard } from "../auth/default.guard"
import { ApplicationCreateDto } from "./application.create.dto"
import { ApplicationUpdateDto } from "./application.update.dto"
import { TransformInterceptor } from "../interceptors/transform.interceptor"
import { OptionalAuthGuard } from "../auth/optional-auth.guard"
import { EmailService } from "../shared/email.service"
import { ListingsService } from "../listings/listings.service"
import { Application } from "../entity/application.entity"

@Controller("applications")
@ApiTags("applications")
@ApiBearerAuth()
export class ApplicationsController {
  constructor(
    private readonly applicationsService: ApplicationsService,
    private readonly emailService: EmailService,
    private readonly listingsService: ListingsService
  ) {}

  @Get()
  @UseGuards(DefaultAuthGuard)
  @ApiOperation({ summary: "List applications", operationId: "list" })
  @UseInterceptors(new TransformInterceptor(ApplicationDto))
  async list(@Query() params: ApplicationsListQueryParams): Promise<Application[]> {
    return await this.applicationsService.list(params)
  }

  @Post()
  @ApiOperation({ summary: "Create application", operationId: "create" })
  @UseGuards(OptionalAuthGuard)
  @UseInterceptors(new TransformInterceptor(ApplicationDto))
  async create(@Body() applicationCreateDto: ApplicationCreateDto): Promise<Application> {
    const application = await this.applicationsService.create(applicationCreateDto)
    const listing = await this.listingsService.findOne(application.listing.id)
    await this.emailService.confirmation(
      listing,
      application.application,
      applicationCreateDto.appUrl
    )
    return application
  }

  @Get(`:applicationId`)
  @UseGuards(DefaultAuthGuard)
  @ApiOperation({ summary: "Get application by id", operationId: "retrieve" })
  @UseInterceptors(new TransformInterceptor(ApplicationDto))
  async retrieve(@Param("applicationId") applicationId: string): Promise<Application> {
    return await this.applicationsService.findOne(applicationId)
  }

  @Put(`:applicationId`)
  @UseGuards(DefaultAuthGuard)
  @ApiOperation({ summary: "Update application by id", operationId: "update" })
  @UseInterceptors(new TransformInterceptor(ApplicationDto))
  async update(
    @Param("applicationId") applicationId: string,
    @Body() applicationUpdateDto: ApplicationUpdateDto
  ): Promise<Application> {
    return await this.applicationsService.update(applicationUpdateDto)
  }

  @Delete(`:applicationId`)
  @UseGuards(DefaultAuthGuard)
  @ApiOperation({ summary: "Delete application by id", operationId: "delete" })
  async delete(@Param("applicationId") applicationId: string) {
    await this.applicationsService.delete(applicationId)
  }
}
