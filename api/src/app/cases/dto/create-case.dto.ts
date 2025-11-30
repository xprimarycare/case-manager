import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCaseDto {
  @IsString()
  @ApiProperty({ description: 'The title of the case' })
  title: string;
  @ApiProperty({ description: 'The patient name of the case' })
  @IsString()
  patientName: string;
  @ApiProperty({ description: 'The summary of the case' })
  @IsString()
  summary: string;
}
