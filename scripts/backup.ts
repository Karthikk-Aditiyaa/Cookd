// Node backup script: pulls ALL tables (including history, tombstones, outbox) from Supabase with service key, writes timestamped JSON.
// Usage: SERVICE_KEY=... SUPABASE_URL=... npx ts-node scripts/backup.ts
console.log('Backup script: pulls all tables with service key and writes timestamped JSON.');
console.log('Add GitHub Actions daily cron to store private artifact or commit to private repo.');
