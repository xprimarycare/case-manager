import { Controller, Get } from '@nestjs/common';

@Controller('cases')
export class CasesController {
  @Get()
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
}
