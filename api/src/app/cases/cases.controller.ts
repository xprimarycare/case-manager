import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
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
  findAll(): CaseDto[] {
    return this.casesService.findAll();
  }

  @ApiOkResponse({
    type: CaseDto,
    description: 'Case retrieved successfully',
  })
  @ApiNotFoundResponse({ description: 'Case not found' })
  @Get(':id')
  findOne(@Param('id') id: string): CaseDto {
    return this.casesService.findOne(id);
  }

  @ApiCreatedResponse({
    type: CreateCaseDto,
    description: 'Case created successfully',
  })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  @Post()
  create(@Body() createCaseDto: CreateCaseDto) {
    return this.casesService.create(createCaseDto);
  }

  @ApiOkResponse({
    type: UpdateCaseDto,
    description: 'Case updated successfully',
  })
  @ApiNotFoundResponse({ description: 'Case not found' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCaseDto: UpdateCaseDto) {
    return this.casesService.update(id, updateCaseDto);
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
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.casesService.remove(id);
  }
}
