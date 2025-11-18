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

@Controller('cases')
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Get()
  findAll(): CaseDto[] {
    return this.casesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): CaseDto {
    return this.casesService.findOne(id);
  }

  @Post()
  create(@Body() createCaseDto: CreateCaseDto) {
    return this.casesService.create(createCaseDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCaseDto: UpdateCaseDto) {
    return this.casesService.update(id, updateCaseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.casesService.remove(id);
  }
}
