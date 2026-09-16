import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Browser-compliant CORS configuration (resolves wildcards with credentials issue)
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global Exception Filter for standardized API error contracts
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global DTO Validation Pipe with whitelist protection
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // OpenAPI Swagger Setup
  const config = new DocumentBuilder()
    .setTitle('Airth Mini Job Queue API')
    .setDescription(
      'Enterprise NestJS REST API with Finite State Machine validation and Atomic Concurrency Locking for Job Queue Management',
    )
    .setVersion('1.0.0')
    .addTag('Jobs')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`Backend server running on: http://localhost:${port}`);
  logger.log(`Swagger documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
