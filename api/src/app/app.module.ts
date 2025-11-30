import { Module } from '@nestjs/common';
import { CasesModule } from './cases/cases.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [CasesModule, PrismaModule],
})
export class AppModule {}
