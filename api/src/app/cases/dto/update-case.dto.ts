import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { UpdateCaseDto as IUpdateCaseDto } from '@case-manager/shared-types';

export class UpdateCaseDto implements IUpdateCaseDto {
  @ApiProperty({ description: 'The title of the case' })
  @IsString()
  @IsOptional()
  title?: string;
  @ApiProperty({ description: 'The patient name of the case' })
  @IsString()
  @IsOptional()
  patientName?: string;
  @ApiProperty({ description: 'The summary of the case' })
  @IsString()
  @IsOptional()
  summary?: string;
}
