import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger"
import { AuthzGuard } from "../auth/guards/authz.guard"
import { ResourceType } from "../auth/decorators/resource-type.decorator"
import { mapTo } from "../shared/mapTo"
import { OptionalAuthGuard } from "../auth/guards/optional-auth.guard"
import { defaultValidationPipeOptions } from "../shared/default-validation-pipe-options"
import { ProgramsService } from "./programs.service"
import { ProgramDto } from "./dto/program.dto"
import { ProgramCreateDto } from "./dto/program-create.dto"
import { ProgramUpdateDto } from "./dto/program-update.dto"

@Controller("/programs")
@ApiTags("programs")
@ApiBearerAuth()
@ResourceType("program")
@UseGuards(OptionalAuthGuard, AuthzGuard)
@UsePipes(new ValidationPipe(defaultValidationPipeOptions))
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  @Get()
  @ApiOperation({ summary: "List programs", operationId: "list" })
  async list(): Promise<ProgramDto[]> {
    return mapTo(ProgramDto, await this.programsService.list())
  }

  @Post()
  @ApiOperation({ summary: "Create program", operationId: "create" })
  async create(@Body() program: ProgramCreateDto): Promise<ProgramDto> {
    return mapTo(ProgramDto, await this.programsService.create(program))
  }

  @Put(`:programId`)
  @ApiOperation({ summary: "Update program", operationId: "update" })
  async update(@Body() program: ProgramUpdateDto): Promise<ProgramDto> {
    return mapTo(ProgramDto, await this.programsService.update(program))
  }

  @Get(`:programId`)
  @ApiOperation({ summary: "Get program by id", operationId: "retrieve" })
  async retrieve(@Param("programId") programId: string): Promise<ProgramDto> {
    return mapTo(ProgramDto, await this.programsService.findOne({ where: { id: programId } }))
  }

  @Delete(`:programId`)
  @ApiOperation({ summary: "Delete program by id", operationId: "delete" })
  async delete(@Param("programId") programId: string): Promise<void> {
    await this.programsService.delete(programId)
  }
}
