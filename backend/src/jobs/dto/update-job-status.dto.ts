import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { JobStatus } from '../jobs.enum';

export class UpdateJobStatusDto {
  @ApiProperty({
    description: 'Target status to transition job into',
    enum: JobStatus,
    example: JobStatus.RUNNING,
  })
  @IsEnum(JobStatus, {
    message: `Status must be one of: ${Object.values(JobStatus).join(', ')}`,
  })
  @IsNotEmpty()
  status: JobStatus;
}
