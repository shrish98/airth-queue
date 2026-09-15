import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobStatusDto } from './dto/update-job-status.dto';
import { JobStatus } from './jobs.enum';
import { Job } from './entities/job.entity';

@ApiTags('Jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new job (status defaults to pending)' })
  @ApiResponse({ status: 201, description: 'Job created successfully', type: Job })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async create(@Body() createJobDto: CreateJobDto): Promise<Job> {
    return this.jobsService.create(createJobDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all jobs (with optional status filter)' })
  @ApiQuery({ name: 'status', enum: JobStatus, required: false })
  @ApiResponse({ status: 200, description: 'List of jobs', type: [Job] })
  async findAll(@Query('status') status?: JobStatus): Promise<Job[]> {
    return this.jobsService.findAll(status);
  }

  @Get('counts')
  @ApiOperation({ summary: 'Get status counts breakdown' })
  @ApiResponse({ status: 200, description: 'Object containing counts for each status' })
  async getCounts(): Promise<Record<JobStatus, number>> {
    return this.jobsService.getStatusCounts();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job by ID' })
  @ApiResponse({ status: 200, description: 'Job details', type: Job })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async findOne(@Param('id') id: string): Promise<Job> {
    return this.jobsService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update job status with state machine & concurrency check' })
  @ApiResponse({ status: 200, description: 'Status updated successfully', type: Job })
  @ApiResponse({ status: 400, description: 'Invalid state machine transition' })
  @ApiResponse({ status: 409, description: 'Concurrency conflict (Race condition)' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateJobStatusDto: UpdateJobStatusDto,
  ): Promise<Job> {
    return this.jobsService.updateStatus(id, updateJobStatusDto.status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a job' })
  @ApiResponse({ status: 200, description: 'Job deleted' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.jobsService.delete(id);
  }
}
