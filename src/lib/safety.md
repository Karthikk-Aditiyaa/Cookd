// Safety-first rules documented in README.md
// 1. UUIDs client-side; createdAt/updatedAt/deletedAt + deviceId on every record.
// 2. Delete = tombstone (deletedAt); restore via Trash; no purge.
// 3. Write-ahead: Stop saves session (pending_description) BEFORE modal.
// 4. Outbox pattern: mutation + outbox in same DB transaction; worker pushes with retry.
// 5. Conflict: per-record last-writer-wins (updatedAt + hybrid clock); server keeps history.
// 6. Ledger derived from source of truth (sessions + freeTimeSpent); never stored alone.
// 7. Backups 3 layers (in-app JSON, scripts/backup.ts + GitHub Action, import dry-run/merge).
// 8. Migration snapshot before run.
// 9. Sync status indicator + loud >24h warning.
// 10. Integrity check (counts + checksums).
