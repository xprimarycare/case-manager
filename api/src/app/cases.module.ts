import { Module } from '@nestjs/common';
import { CasesController } from './cases/cases.controller';
import { CasesService } from './cases/cases.service';
import { PrismaService } from './prisma.service';
@Module({
  controllers: [CasesController],
  providers: [CasesService, PrismaService],
})
export class CasesModule {}
