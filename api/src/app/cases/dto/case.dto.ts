import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CaseDto {
  @IsString()
  @ApiProperty({ description: 'The id of the case' })
  id: string;
  @ApiProperty({ description: 'The title of the case' })
  @IsString()
  title: string;
  @ApiProperty({ description: 'The patient name of the case' })
  @IsString()
  patientName: string;
  @ApiProperty({ description: 'The summary of the case' })
  @IsString()
  summary: string;
}
