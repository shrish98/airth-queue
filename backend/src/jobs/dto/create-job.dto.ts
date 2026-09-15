import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { JobType } from '../jobs.enum';

export class CreateJobDto {
  @ApiProperty({
    description: 'Title of the job',
    example: 'Process Monthly Newsletter Emails',
  })
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @ApiProperty({
    description: 'Type of job',
    example: 'EMAIL_NOTIFICATION',
    enum: JobType,
    required: false,
  })
  @IsOptional()
  @IsString()
  type?: string;
}
