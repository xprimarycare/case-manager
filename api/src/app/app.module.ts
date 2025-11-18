import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CasesModule } from './cases.module';
import { CasesController } from './cases/cases.controller';
import { CasesService } from './cases/cases.service';

@Module({
  imports: [CasesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
