import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common"
import { PreferencesService } from "../preferences/preferences.service"
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger"
import { TransformInterceptor } from "../interceptors/transform.interceptor"
import { PreferenceDto } from "../preferences/preference.dto"
import { PreferenceCreateDto } from "../preferences/preference.create.dto"
import { PreferenceUpdateDto } from "../preferences/preference.update.dto"
import { DefaultAuthGuard } from "../auth/default.guard"
import { AuthzGuard } from "../auth/authz.guard"
import { ResourceType } from "../auth/resource_type.decorator"

@Controller("/preferences")
@ApiTags("preferences")
@ApiBearerAuth()
@ResourceType("preference")
@UseGuards(DefaultAuthGuard, AuthzGuard)
@UseInterceptors(new TransformInterceptor(PreferenceDto))
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  @Get()
  @ApiOperation({ summary: "List preferences", operationId: "list" })
  async list(): Promise<PreferenceDto[]> {
    return await this.preferencesService.list()
  }

  @Post()
  @ApiOperation({ summary: "Create preference", operationId: "create" })
  async create(@Body() preference: PreferenceCreateDto): Promise<PreferenceDto> {
    return this.preferencesService.create(preference)
  }

  @Put(`:preferenceId`)
  @ApiOperation({ summary: "Update preference", operationId: "update" })
  async update(@Body() preference: PreferenceUpdateDto): Promise<PreferenceDto> {
    return this.preferencesService.update(preference)
  }

  @Get(`:preferenceId`)
  @ApiOperation({ summary: "Get preference by id", operationId: "retrieve" })
  async retrieve(@Param("preferenceId") preferenceId: string): Promise<PreferenceDto> {
    return await this.preferencesService.findOne({ where: { id: preferenceId } })
  }

  @Delete(`:preferenceId`)
  @ApiOperation({ summary: "Delete preference by id", operationId: "delete" })
  async delete(@Param("preferenceId") preferenceId: string): Promise<void> {
    await this.preferencesService.delete(preferenceId)
  }
}
