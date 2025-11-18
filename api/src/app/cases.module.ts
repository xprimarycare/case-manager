import { Module } from '@nestjs/common';
import { CasesController } from './cases/cases.controller';
import { CasesService } from './cases/cases.service';

@Module({
  controllers: [CasesController],
  providers: [CasesService],
})
export class CasesModule {}
