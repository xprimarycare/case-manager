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
import { ApiNotFoundResponse } from '@nestjs/swagger';

@Controller('cases')
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Get()
  findAll(): CaseDto[] {
    return this.casesService.findAll();
  }

  @ApiNotFoundResponse({ description: 'Case not found' })
  @Get(':id')
  findOne(@Param('id') id: string): CaseDto {
    return this.casesService.findOne(id);
  }

  @Post()
  create(@Body() createCaseDto: CreateCaseDto) {
    return this.casesService.create(createCaseDto);
  }

  @ApiNotFoundResponse({ description: 'Case not found' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCaseDto: UpdateCaseDto) {
    return this.casesService.update(id, updateCaseDto);
  }

  @ApiNotFoundResponse({ description: 'Case not found' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.casesService.remove(id);
  }
}
