import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';

@Injectable()
export class CasesService {
  private cases = [
    {
      id: '1',
      title: 'Test Case',
      patientName: 'John Doe',
      summary: 'A sample case for testing.',
    },
  ];

  findAll() {
    return this.cases;
  }

  findOne(id: string) {
    const caseItem = this.cases.find((c) => c.id === id);
    if (!caseItem) throw new NotFoundException(`Case with id ${id} not found`);
    return caseItem;
  }

  create(createCaseDto: CreateCaseDto) {
    const newCase = {
      id: crypto.randomUUID(),
      ...createCaseDto,
    };

    this.cases.push(newCase);
    return newCase;
  }

  update(id: string, updateCaseDto: UpdateCaseDto) {
    const caseIndex = this.cases.findIndex((c) => c.id === id);
    if (caseIndex === -1)
      throw new NotFoundException(`Case with id ${id} not found`);
    const updated = { ...this.cases[caseIndex], ...updateCaseDto };
    this.cases[caseIndex] = updated;
    return updated;
  }

  remove(id: string) {
    const caseIndex = this.cases.findIndex((c) => c.id === id);
    if (caseIndex === -1)
      throw new NotFoundException(`Case with id ${id} not found`);
    this.cases.splice(caseIndex, 1);
    return {
      deleted: true,
      id,
    };
  }
}
