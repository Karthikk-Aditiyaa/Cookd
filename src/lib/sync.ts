// Outbox push: idempotent upserts to Supabase; ack removes item.
// Conflict: per-record last-writer-wins (updatedAt). Server keeps history.
// Never discard loser silently.

export interface SyncStatus {
  state: 'synced' | 'pending' | 'offline' | 'error';
  pendingCount: number;
  lastSyncAt: Date | null;
  error?: string;
}
