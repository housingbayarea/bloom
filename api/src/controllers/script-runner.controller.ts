import {
  Body,
  Controller,
  Put,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ScriptRunnerService } from '../services/script-runner.service';
import { defaultValidationPipeOptions } from '../utilities/default-validation-pipe-options';
import { SuccessDTO } from '../dtos/shared/success.dto';
import { OptionalAuthGuard } from '../guards/optional.guard';
import { AdminOrJurisdictionalAdminGuard } from '../guards/admin-or-jurisdiction-admin.guard';
import { BulkApplicationResendDTO } from '../dtos/script-runner/bulk-application-resend.dto';
import { AmiChartImportDTO } from '../dtos/script-runner/ami-chart-import.dto';
import { AmiChartUpdateImportDTO } from '../dtos/script-runner/ami-chart-update-import.dto';
import { CommunityTypeDTO } from '../dtos/script-runner/community-type.dto';
import { ApiKeyGuard } from '../guards/api-key.guard';

@Controller('scriptRunner')
@ApiTags('scriptRunner')
@UsePipes(new ValidationPipe(defaultValidationPipeOptions))
@UseGuards(ApiKeyGuard, OptionalAuthGuard, AdminOrJurisdictionalAdminGuard)
export class ScriptRunnerController {
  constructor(private readonly scriptRunnerService: ScriptRunnerService) {}

  @Put('exampleScript')
  @ApiOperation({
    summary: 'An example of how the script runner can work',
    operationId: 'exampleScript',
  })
  @ApiOkResponse({ type: SuccessDTO })
  async update(@Request() req: ExpressRequest): Promise<SuccessDTO> {
    return await this.scriptRunnerService.example(req);
  }

  @Put('bulkApplicationResend')
  @ApiOperation({
    summary:
      'A script that resends application confirmations to applicants of a listing',
    operationId: 'bulkApplicationResend',
  })
  @ApiOkResponse({ type: SuccessDTO })
  async bulkApplicationResend(
    @Body() bulkApplicationResendDTO: BulkApplicationResendDTO,
    @Request() req: ExpressRequest,
  ): Promise<SuccessDTO> {
    return await this.scriptRunnerService.bulkApplicationResend(
      req,
      bulkApplicationResendDTO,
    );
  }

  @Put('amiChartImport')
  @ApiOperation({
    summary:
      'A script that takes in a standardized string and outputs the input for the ami chart create endpoint',
    operationId: 'amiChartImport',
  })
  @ApiOkResponse({ type: SuccessDTO })
  async amiChartImport(
    @Body() amiChartImportDTO: AmiChartImportDTO,
    @Request() req: ExpressRequest,
  ): Promise<SuccessDTO> {
    return await this.scriptRunnerService.amiChartImport(
      req,
      amiChartImportDTO,
    );
  }

  @Put('amiChartUpdateImport')
  @ApiOperation({
    summary:
      'A script that takes in a standardized string and outputs the input for the ami chart update endpoint',
    operationId: 'amiChartUpdateImport',
  })
  @ApiOkResponse({ type: SuccessDTO })
  async amiChartUpdateImport(
    @Body() amiChartUpdateImportDTO: AmiChartUpdateImportDTO,
    @Request() req: ExpressRequest,
  ): Promise<SuccessDTO> {
    return await this.scriptRunnerService.amiChartUpdateImport(
      req,
      amiChartUpdateImportDTO,
    );
  }

  @Put('lotteryTranslations')
  @ApiOperation({
    summary: 'A script that adds lottery translations to the db',
    operationId: 'lotteryTranslations',
  })
  @ApiOkResponse({ type: SuccessDTO })
  async lotteryTranslations(
    @Request() req: ExpressRequest,
  ): Promise<SuccessDTO> {
    return await this.scriptRunnerService.addLotteryTranslations(req);
  }

  @Put('lotteryTranslationsCreateIfEmpty')
  @ApiOperation({
    summary:
      'A script that adds lottery translations to the db and creates them if it does not exist',
    operationId: 'lotteryTranslations',
  })
  @ApiOkResponse({ type: SuccessDTO })
  async lotteryTranslationsCreateIfEmpty(
    @Request() req: ExpressRequest,
  ): Promise<SuccessDTO> {
    return await this.scriptRunnerService.addLotteryTranslationsCreateIfEmpty(
      req,
    );
  }

  @Put('optOutExistingLotteries')
  @ApiOperation({
    summary: 'A script that opts out existing lottery listings',
    operationId: 'optOutExistingLotteries',
  })
  @ApiOkResponse({ type: SuccessDTO })
  async optOutExistingLotteries(
    @Request() req: ExpressRequest,
  ): Promise<SuccessDTO> {
    return await this.scriptRunnerService.optOutExistingLotteries(req);
  }

  @Put('createNewReservedCommunityType')
  @ApiOperation({
    summary: 'A script that creates a new reserved community type',
    operationId: 'createNewReservedCommunityType',
  })
  @ApiOkResponse({ type: SuccessDTO })
  async createNewReservedCommunityType(
    @Body() body: CommunityTypeDTO,
    @Request() req: ExpressRequest,
  ): Promise<SuccessDTO> {
    return await this.scriptRunnerService.createNewReservedCommunityType(
      req,
      body.id,
      body.name,
      body.description,
    );
  }

  @Put('updateCodeExpirationTranslations')
  @ApiOperation({
    summary:
      'A script that updates single use code translations to show extended expiration time',
    operationId: 'updateCodeExpirationTranslations',
  })
  @ApiOkResponse({ type: SuccessDTO })
  async updateCodeExpirationTranslations(
    @Request() req: ExpressRequest,
  ): Promise<SuccessDTO> {
    return await this.scriptRunnerService.updateCodeExpirationTranslations(req);
  }

  @Put('correctApplicationPreferenceDataForSparksHomes')
  @ApiOperation({
    summary:
      'A script that updates the preference keys for applications on Spark Homes',
    operationId: 'correctApplicationPreferenceDataForSparksHomes',
  })
  @ApiOkResponse({ type: SuccessDTO })
  async correctApplicationPreferenceDataForSparksHomes(
    @Request() req: ExpressRequest,
  ): Promise<SuccessDTO> {
    return await this.scriptRunnerService.correctApplicationPreferenceDataForSparksHomes(
      req,
    );
  }

  @Put('insertSanJoseMapLayers')
  @ApiOperation({
    summary: 'A script that adds map layers for San Jose',
    operationId: 'insertSanJoseMapLayers',
  })
  @ApiOkResponse({ type: SuccessDTO })
  async insertSanJoseMapLayers(
    @Request() req: ExpressRequest,
  ): Promise<SuccessDTO> {
    return await this.scriptRunnerService.insertSanJoseMapLayers(req);
  }

  @Put('hideProgramsFromListings')
  @ApiOperation({
    summary:
      'A script that hides program multiselect questions from the public detail page',
    operationId: 'hideProgramsFromListings',
  })
  @ApiOkResponse({ type: SuccessDTO })
  async hideProgramsFromListings(
    @Request() req: ExpressRequest,
  ): Promise<SuccessDTO> {
    return await this.scriptRunnerService.hideProgramsFromListings(req);
  }

  @Put('updatesWhatHappensInLotteryEmail')
  @ApiOperation({
    summary:
      'A script that updates the "what happens next" content in lottery email',
    operationId: 'updatesWhatHappensInLotteryEmail',
  })
  @ApiOkResponse({ type: SuccessDTO })
  async updatesWhatHappensInLotteryEmail(
    @Request() req: ExpressRequest,
  ): Promise<SuccessDTO> {
    return await this.scriptRunnerService.updatesWhatHappensInLotteryEmail(req);
  }

  @Put('addFeatureFlags')
  @ApiOperation({
    summary:
      'A script that adds existing feature flags into the feature flag table',
    operationId: 'addFeatureFlags',
  })
  @ApiOkResponse({ type: SuccessDTO })
  async addFeatureFlags(@Request() req: ExpressRequest): Promise<SuccessDTO> {
    return await this.scriptRunnerService.addFeatureFlags(req);
  }

  @Put('migrateDetroitToMultiselectQuestions')
  @ApiOperation({
    summary:
      'A script that moves preferences and programs to multiselect questions in Detroit db',
    operationId: 'migrateDetroitToMultiselectQuestions',
  })
  @ApiOkResponse({ type: SuccessDTO })
  async migrateDetroitToMultiselectQuestions(
    @Request() req: ExpressRequest,
  ): Promise<SuccessDTO> {
    return await this.scriptRunnerService.migrateDetroitToMultiselectQuestions(
      req,
    );
  }
}
