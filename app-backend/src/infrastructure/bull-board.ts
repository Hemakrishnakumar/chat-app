import { INestApplication } from '@nestjs/common';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { Queue } from 'bullmq';

export function setupBullBoard(app: INestApplication, queue: Queue) {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');

  createBullBoard({
    queues: [new BullMQAdapter(queue)],
    serverAdapter,
  });

  app.use('/admin/queues', serverAdapter.getRouter());
}
