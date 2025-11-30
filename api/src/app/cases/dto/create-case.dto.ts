import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { CreateCaseDto as ICreateCaseDto } from '@case-manager/shared-types';

export class CreateCaseDto implements ICreateCaseDto {
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
