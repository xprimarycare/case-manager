import { ApiProperty } from '@nestjs/swagger';

export class UpdateCaseDto {
  @ApiProperty({ description: 'The title of the case' })
  title?: string;
  @ApiProperty({ description: 'The patient name of the case' })
  patientName?: string;
  @ApiProperty({ description: 'The summary of the case' })
  summary?: string;
}
