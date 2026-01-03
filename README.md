# Dracowest Arena (admin-only) + Supabase sync

This folder contains:
- /arena/index.html (Monster Arena Checklist)
- /functions/arena/_middleware.js (protects /arena + /api/arena)
- /functions/api/arena/tallies.js (GET/PUT bulk tallies)
- /functions/api/arena/tally.js (PUT single tally)

## Cloudflare Pages env vars
Set these in Cloudflare Pages -> Settings -> Environment variables:

- ARENA_ADMIN_CODE = your private passcode
- ARENA_OWNER = a label for you, e.g. "jeremy"
- SUPABASE_URL = your Supabase project URL (https://xxxx.supabase.co)
- SUPABASE_SERVICE_ROLE_KEY = Supabase service_role key (KEEP SECRET)

## Supabase SQL
Run this in Supabase SQL editor:

create table if not exists public.arena_tallies (
  owner text not null,
  monster_id text not null,
  tally integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (owner, monster_id)
);

-- optional trigger to auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_arena_updated_at on public.arena_tallies;
create trigger trg_arena_updated_at
before update on public.arena_tallies
for each row execute function public.set_updated_at();

