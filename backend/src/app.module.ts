import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JobsModule } from './jobs/jobs.module';
import { Job } from './jobs/entities/job.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'airth_jobs.sqlite',
      entities: [Job],
      synchronize: true, // Auto sync schema for demo/dev mode
      logging: false,
    }),
    JobsModule,
  ],
})
export class AppModule {}
