import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JobsModule } from './jobs/jobs.module';
import { Job } from './jobs/entities/job.entity';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbUrl = configService.get<string>('DATABASE_URL');
        const isPostgres = configService.get<string>('DB_TYPE') === 'postgres' || !!dbUrl;

        if (isPostgres && dbUrl) {
          return {
            type: 'postgres',
            url: dbUrl,
            entities: [Job],
            synchronize: true,
            ssl: { rejectUnauthorized: false },
          };
        }

        return {
          type: 'sqlite',
          database: configService.get<string>('DB_NAME') || 'airth_jobs.sqlite',
          entities: [Job],
          synchronize: true,
          logging: false,
        };
      },
    }),
    JobsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
