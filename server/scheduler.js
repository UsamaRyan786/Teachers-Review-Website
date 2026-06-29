import 'dotenv/config';
import cron from 'node-cron';
import { runDailySync } from './utils/ucpSync.js';

let dailySyncRunning = false;

const runScheduledSync = async () => {
  if (dailySyncRunning) {
    console.log('[scheduler] Daily sync already in progress, skipping');
    return;
  }

  dailySyncRunning = true;
  try {
    await runDailySync();
  } catch (err) {
    console.error('[scheduler] Daily sync failed:', err.message);
  } finally {
    dailySyncRunning = false;
  }
};

export const startScheduler = () => {
  const enabled = process.env.SYNC_ENABLED !== 'false';
  if (!enabled) {
    console.log('[scheduler] Automatic sync disabled (SYNC_ENABLED=false)');
    return;
  }

  const cronExpr = process.env.SYNC_CRON || '0 1 * * *';
  const timezone = process.env.SYNC_TIMEZONE || 'Asia/Karachi';

  if (!cron.validate(cronExpr)) {
    console.error(`[scheduler] Invalid SYNC_CRON expression: ${cronExpr}`);
    return;
  }

  cron.schedule(cronExpr, runScheduledSync, { timezone });
  console.log(`[scheduler] Daily UCP sync scheduled at "${cronExpr}" (${timezone})`);
};
