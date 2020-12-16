import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger"
import { ResourceType } from "../auth/resource_type.decorator"
import { OptionalAuthGuard } from "../auth/optional-auth.guard"
import { ListingsService } from "../listings/listings.service"
import { EmailService } from "../shared/email.service"
import { ApplicationsService } from "./applications.service"
import { ApplicationCreateDto, ApplicationDto } from "./dto/application.dto"
import { mapTo } from "../shared/mapTo"
import { Request as ExpressRequest } from "express"
import { defaultValidationPipeOptions } from "../shared/default-validation-pipe-options"
import { ResourceAction } from "../auth/resource_action.decorator"
import { authzActions } from "../auth/authz.service"
import { AuthzGuard } from "../auth/authz.guard"

@Controller("applications")
@ApiTags("applications")
@ApiBearerAuth()
@ResourceType("application")
@UseGuards(OptionalAuthGuard, AuthzGuard)
@UsePipes(new ValidationPipe(defaultValidationPipeOptions))
export class ApplicationsSubmissionController {
  constructor(
    private readonly applicationsService: ApplicationsService,
    private readonly emailService: EmailService,
    private readonly listingsService: ListingsService
  ) {}

  @Post(`submit`)
  @ApiOperation({ summary: "Submit application", operationId: "submit" })
  @ResourceAction(authzActions.submit)
  async submit(
    @Request() req: ExpressRequest,
    @Body() applicationCreateDto: ApplicationCreateDto
  ): Promise<ApplicationDto> {
    const application = await this.applicationsService.create(applicationCreateDto, req.user)
    const listing = await this.listingsService.findOne(application.listing.id)
    if (application.applicant.emailAddress) {
      await this.emailService.confirmation(listing, application, applicationCreateDto.appUrl)
    }
    return mapTo(ApplicationDto, application)
  }
}
