import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('Jobs Module (E2E) - State Machine & Concurrency Tests', () => {
  let app: INestApplication;
  let createdJobId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/jobs (POST) - should create a job with status PENDING', async () => {
    const res = await request(app.getHttpServer())
      .post('/jobs')
      .send({ title: 'Test E2E Job', type: 'DATA_EXPORT' })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.status).toBe('pending');
    createdJobId = res.body.id;
  });

  it('/jobs/counts (GET) - should return job status count breakdown', async () => {
    const res = await request(app.getHttpServer()).get('/jobs/counts').expect(200);

    expect(res.body).toHaveProperty('pending');
    expect(res.body).toHaveProperty('running');
    expect(res.body).toHaveProperty('completed');
    expect(res.body).toHaveProperty('failed');
  });

  it('/jobs/:id/status (PATCH) - should reject illegal transition pending -> completed', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/jobs/${createdJobId}/status`)
      .send({ status: 'completed' })
      .expect(400);

    expect(res.body.message).toContain('Invalid state transition');
  });

  it('CONCURRENCY TEST: 2 simultaneous requests to change status pending -> running', async () => {
    // Fire 2 parallel requests at the exact same millisecond
    const req1 = request(app.getHttpServer())
      .patch(`/jobs/${createdJobId}/status`)
      .send({ status: 'running' });

    const req2 = request(app.getHttpServer())
      .patch(`/jobs/${createdJobId}/status`)
      .send({ status: 'running' });

    const [res1, res2] = await Promise.all([req1, req2]);

    const statuses = [res1.status, res2.status].sort();

    // Exactly one request MUST succeed (200 OK)
    // The other request MUST be rejected (409 Conflict or 400 Bad Request)
    expect(statuses).toContain(200);
    expect(statuses[1]).toBeGreaterThanOrEqual(400);
  });

  it('/jobs/:id (DELETE) - should delete a job by ID', async () => {
    await request(app.getHttpServer()).delete(`/jobs/${createdJobId}`).expect(200);

    // Verify 404 after deletion
    await request(app.getHttpServer()).get(`/jobs/${createdJobId}`).expect(404);
  });
});
