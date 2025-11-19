import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { PrismaService } from '../prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class CasesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const results = await this.prisma.case.findMany();
    return results;
  }

  async findOne(id: string) {
    const caseItem = await this.prisma.case.findUnique({ where: { id } });
    if (!caseItem) throw new NotFoundException(`Case with id ${id} not found`);
    return caseItem;
  }

  async create(createCaseDto: CreateCaseDto) {
    const result = await this.prisma.case.create({ data: createCaseDto });
    return result;
  }

  async update(id: string, updateCaseDto: UpdateCaseDto) {
    try {
      const result = await this.prisma.case.update({
        where: { id },
        data: updateCaseDto,
      });
      return result;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      )
        throw new NotFoundException(`Case with id ${id} not found`);
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const result = await this.prisma.case.delete({ where: { id } });
      return result;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      )
        throw new NotFoundException(`Case with id ${id} not found`);
      throw error;
    }
  }
}
