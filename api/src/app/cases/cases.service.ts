import { Injectable } from '@nestjs/common';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';

@Injectable()
export class CasesService {
  findAll() {
    return [
      {
        id: '1',
        title: 'Test Case',
        patientName: 'John Doe',
        summary: 'A sample case for testing.',
      },
    ];
  }

  create(createCaseDto: CreateCaseDto) {
    return {
      id: 'generated-id-123',
      ...createCaseDto,
    };
  }

  update(id: string, updateCaseDto: UpdateCaseDto) {
    return {
      id,
      ...updateCaseDto,
    };
  }

  remove(id: string) {
    return {
      deleted: true,
      id,
    };
  }
}
