-- Preserve the context of an entry without storing per-entry GPS coordinates.
alter table public.entries
  add column if not exists location_name text,
  add column if not exists weather_condition text,
  add column if not exists weather_code integer,
  add column if not exists weather_is_day boolean,
  add column if not exists weather_category text,
  add column if not exists local_date date,
  add column if not exists local_time time without time zone,
  add column if not exists timezone text,
  add column if not exists time_period text;

comment on column public.entries.location_name is
  'Approximate reverse-geocoded city/region captured with the entry; exact GPS is not stored here.';
comment on column public.entries.time_period is
  'Visual time-of-day period active when the entry was created.';
