import { createApp } from './app.js';
import { config } from './config.js';
import { pool } from './db/pool.js';

const app = createApp();

await pool.query(
  "UPDATE chat_turns SET status = 'INTERRUPTED', finished_at = now() WHERE status = 'PROCESSING'"
);
await app.listen({ port: config.port, host: config.host });

let shuttingDown = false;
const shutdown = async (signal: string) => {
  if (shuttingDown) return;
  shuttingDown = true;
  app.log.info({ signal }, 'graceful shutdown initiated');
  await app.close();
  await pool.end();
};

process.on('uncaughtException', err => {
  app.log.error({ err }, 'uncaught exception');
});

process.on('unhandledRejection', reason => {
  app.log.error({ err: reason }, 'unhandled rejection');
});

process.once('SIGINT', () => {
  void shutdown('SIGINT').then(() => process.exit(0));
});

process.once('SIGTERM', () => {
  void shutdown('SIGTERM').then(() => process.exit(0));
});
