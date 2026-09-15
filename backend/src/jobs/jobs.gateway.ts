import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { Job } from './entities/job.entity';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class JobsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(JobsGateway.name);

  afterInit() {
    this.logger.log('WebSocket Gateway initialized for Jobs Dashboard');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  notifyJobCreated(job: Job) {
    this.server.emit('jobCreated', job);
  }

  notifyJobUpdated(job: Job) {
    this.server.emit('jobUpdated', job);
  }

  notifyJobDeleted(id: string) {
    this.server.emit('jobDeleted', { id });
  }

  notifyCountsUpdated(counts: Record<string, number>) {
    this.server.emit('countsUpdated', counts);
  }
}
