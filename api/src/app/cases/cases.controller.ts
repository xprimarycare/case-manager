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

@Controller('cases')
export class CasesController {
  @Get()
  findAll(): CaseDto[] {
    return [
      {
        id: '1',
        title: 'Test Case',
        patientName: 'John Doe',
        summary: 'A sample case for testing.',
      },
    ];
  }

  @Post()
  create(@Body() createCaseDto: CreateCaseDto) {
    return {
      id: 'generated-id-123',
      ...createCaseDto,
    };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCaseDto: UpdateCaseDto) {
    return {
      id,
      ...updateCaseDto,
    };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return {
      deleted: true,
      id,
    };
  }
}
