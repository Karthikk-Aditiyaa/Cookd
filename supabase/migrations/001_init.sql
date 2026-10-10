-- Sessions with tombstones, device tracking, status
create table if not exists sessions (
  id uuid primary key,
  task_name text not null,
  task_key text,
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_sec int default 0,
  category text,
  status text default 'complete',
  source text,
  device_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz,
  schema_version int default 1
);
create index idx_sessions_deleted_at on sessions(deleted_at) where deleted_at is not null;

-- Active timer checkpoint for crash resilience
create table if not exists active_timers (
  id uuid primary key,
  kind text,
  started_at timestamptz,
  paused_accum_sec int default 0,
  paused_at timestamptz,
  device_id text,
  deleted_at timestamptz
);

-- Free time spent records
create table if not exists free_time_spent (
  id uuid primary key,
  started_at timestamptz,
  ended_at timestamptz,
  seconds int,
  device_id text,
  deleted_at timestamptz
);

-- Overrides synced like any record
create table if not exists overrides (
  task_key text primary key,
  category text,
  device_id text,
  deleted_at timestamptz
);

-- Outbox for durable sync
create table if not exists outbox (
  id uuid primary key,
  table_name text,
  record_id uuid,
  op text,
  payload jsonb,
  attempts int default 0,
  last_error text,
  created_at timestamptz default now()
);

-- Ledger derived; history kept for audit (simplified)
create table if not exists ledger_entries (
  id uuid primary key,
  timestamp timestamptz,
  session_id uuid references sessions(id),
  type text,
  seconds int,
  device_id text
);

-- History trigger example (server-side)
-- Every update/deletes old row into *_history automatically.
