-- ============================================================
-- E1 — plants_public
-- ============================================================
create table if not exists public.plants_public (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  scientific_name text not null,
  common_names  text[] not null default '{}',
  family        text,
  kind          text not null,                 -- maps to extended PlantKind union
  difficulty    smallint check (difficulty between 1 and 3),
  sun           text check (sun in ('pleno','medio','sombra')),
  water         smallint check (water between 1 and 3),
  companions    text[] not null default '{}',  -- slugs or free-form names; resolved client-side
  avoid         text[] not null default '{}',
  sow_months    smallint[] not null default '{}',
  plant_months  smallint[] not null default '{}',
  harvest_months smallint[] not null default '{}',
  description_md text,
  images        text[] not null default '{}',  -- source URLs in E1; Storage proxy deferred
  galicia_relevant boolean not null default false,
  status        text not null default 'draft'
                check (status in ('draft','published','archived')),
  source_name   text,                          -- e.g. 'flora-iberica', 'app-seed'
  source_url    text,
  content_hash  text,                          -- sha256 of normalised payload, for scraper skip logic
  schema_version smallint not null default 1,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists plants_public_status_idx
  on public.plants_public (status);
create index if not exists plants_public_kind_idx
  on public.plants_public (kind) where status = 'published';
create index if not exists plants_public_galicia_idx
  on public.plants_public (galicia_relevant) where status = 'published';

alter table public.plants_public enable row level security;

create policy plants_public_anon_read on public.plants_public
  for select to anon
  using (status = 'published');

create policy plants_public_authenticated_read on public.plants_public
  for select to authenticated
  using (status = 'published');

-- Writes restricted to service_role (no policy = denied by RLS for anon/authenticated)

-- View used during curation in Supabase Studio (no in-app admin in E1)
create or replace view public.plants_pending_approval as
  select * from public.plants_public where status = 'draft' order by updated_at desc;

-- ============================================================
-- E1 — guides
-- ============================================================
create table if not exists public.guides (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  category     text not null
               check (category in ('poda','diseño','bancales','plagas','riego','compost','setos')),
  summary      text,
  content_md   text not null,
  hero_image   text,
  related_plant_slugs text[] not null default '{}',
  reading_time_min smallint,
  status       text not null default 'draft'
               check (status in ('draft','published','archived')),
  source_name  text,                           -- 'hand-written' for seed content
  source_url   text,
  schema_version smallint not null default 1,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists guides_status_idx on public.guides (status);
create index if not exists guides_category_idx
  on public.guides (category) where status = 'published';

alter table public.guides enable row level security;

create policy guides_anon_read on public.guides
  for select to anon using (status = 'published');
create policy guides_authenticated_read on public.guides
  for select to authenticated using (status = 'published');

-- ============================================================
-- E1 — scrape_log
-- ============================================================
create table if not exists public.scrape_log (
  id            bigserial primary key,
  run_id        uuid not null,                 -- one per scraper invocation
  source_name   text not null,
  target_table  text not null,                 -- 'plants_public' | 'guides' (future)
  started_at    timestamptz not null default now(),
  finished_at   timestamptz,
  status        text not null
                check (status in ('running','success','partial','failed')),
  rows_scanned  integer not null default 0,
  rows_inserted integer not null default 0,
  rows_updated  integer not null default 0,
  rows_skipped  integer not null default 0,    -- content_hash unchanged
  rows_failed   integer not null default 0,
  schema_version smallint not null default 1,  -- scraper-side snapshot version
  error_summary text,
  notes         jsonb
);

create index if not exists scrape_log_run_idx on public.scrape_log (run_id);
create index if not exists scrape_log_started_idx on public.scrape_log (started_at desc);

alter table public.scrape_log enable row level security;
-- No anon/authenticated policy: only service_role reads/writes. The app never reads this.
