import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CaseDto } from './dto/case.dto';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { CasesService } from './cases.service';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '@nestjs/swagger';

@Controller('cases')
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @ApiOkResponse({
    type: CaseDto,
    isArray: true,
    description: 'Cases retrieved successfully',
  })
  @Get()
  async findAll(): Promise<CaseDto[]> {
    return await this.casesService.findAll();
  }

  @ApiOkResponse({
    type: CaseDto,
    description: 'Case retrieved successfully',
  })
  @ApiNotFoundResponse({ description: 'Case not found' })
  @ApiBadRequestResponse({ description: 'Invalid id format' })
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<CaseDto> {
    return await this.casesService.findOne(id);
  }

  @ApiCreatedResponse({
    type: CaseDto,
    description: 'Case created successfully',
  })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  @Post()
  async create(@Body() createCaseDto: CreateCaseDto): Promise<CaseDto> {
    return await this.casesService.create(createCaseDto);
  }

  @ApiOkResponse({
    type: CaseDto,
    description: 'Case updated successfully',
  })
  @ApiNotFoundResponse({ description: 'Case not found' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCaseDto: UpdateCaseDto
  ): Promise<CaseDto> {
    return await this.casesService.update(id, updateCaseDto);
  }

  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        deleted: { type: 'boolean' },
        id: { type: 'string' },
      },
    },
    description: 'Case deleted successfully',
  })
  @ApiNotFoundResponse({ description: 'Case not found' })
  @ApiBadRequestResponse({ description: 'Invalid id format' })
  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<{ deleted: boolean; id: string }> {
    const result = await this.casesService.remove(id);
    return { deleted: true, id: result.id };
  }
}
