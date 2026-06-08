import { Worker } from 'bullmq';
import { bullConnection, EMAIL_QUEUE } from '../config/queue.js';
import { sendProductAddedEmail, sendVerificationEmail } from '../utils/sendVerificationEmail.js';

const emailWorker = new Worker(
  EMAIL_QUEUE,
  async (job) => {
    switch (job.name) {
      case 'sendVerificationEmail':
        await sendVerificationEmail(job.data);
        break;
        case 'sendProductAddedEmail':
          await sendProductAddedEmail(job.data);
          break;
      default:
        throw new Error(`Unknown email job: ${job.name}`);
    }
  },
  { connection: bullConnection }
);

emailWorker.on('completed', (job) => {
  console.log(`Email job ${job.id} (${job.name}) completed`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`Email job ${job?.id} (${job?.name}) failed:`, err.message);
});

export default emailWorker;
