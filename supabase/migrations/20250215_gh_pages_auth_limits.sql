-- PriorityMatrix Supabase hardening script
-- Ensures per-user isolation, capacity controls, and insert rate limiting.

begin;

-- 1. Ensure todos have a user owner.
alter table public.todos
  add column if not exists user_id uuid default auth.uid();

alter table public.todos
  add constraint if not exists todos_user_id_fkey
    foreign key (user_id) references auth.users(id) on delete cascade;

-- 2. Track active users.
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists user_profiles_email_idx on public.user_profiles (lower(email));

-- 3. Function to ensure a user slot exists or reject when capacity is reached.
create or replace function public.ensure_user_slot(user_uuid uuid, user_email text)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  capacity integer;
  exists_profile boolean;
begin
  select exists(select 1 from public.user_profiles where id = user_uuid)
    into exists_profile;

  if exists_profile then
    return;
  end if;

  select count(*) into capacity from public.user_profiles;

  if capacity >= 100 then
    raise exception 'USER_CAPACITY_REACHED'
      using errcode = 'PMCAP', detail = 'Capacity reached';
  end if;

  insert into public.user_profiles(id, email)
  values (user_uuid, lower(user_email))
  on conflict (id) do nothing;
end;
$$;

grant execute on function public.ensure_user_slot(uuid, text) to authenticated;

-- 4. Capacity pre-check for new signups.
create or replace function public.check_user_capacity(email_input text)
returns table (
  capacity_reached boolean,
  is_existing_user boolean,
  allow_signup boolean
)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  total integer;
begin
  email_input := lower(email_input);

  select count(*) into total from public.user_profiles;
  select exists(select 1 from public.user_profiles where lower(email) = email_input)
    into is_existing_user;

  capacity_reached := total >= 100;
  allow_signup := is_existing_user or not capacity_reached;
  return;
end;
$$;

grant execute on function public.check_user_capacity(text) to anon, authenticated;

-- 5. Trigger to apply per-user rules on todos.
create or replace function public.handle_todo_insert()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  active_count integer;
  recent_count integer;
begin
  if new.user_id is null then
    new.user_id := auth.uid();
  end if;

  if new.user_id is null then
    raise exception 'TODO_USER_REQUIRED'
      using errcode = 'PMNUL', detail = 'User id required.';
  end if;

  select count(*)
    into active_count
    from public.todos
   where user_id = new.user_id
     and status <> 'completed';

  if active_count >= 30 then
    raise exception 'TASK_CAP_REACHED'
      using errcode = 'PMTMA', detail = 'User already has 30 active tasks.';
  end if;

  select count(*)
    into recent_count
    from public.todos
   where user_id = new.user_id
     and created_at > now() - interval '1 second';

  if recent_count >= 1 then
    raise exception 'TASK_RATE_LIMIT'
      using errcode = 'PMTRL', detail = 'One task per second allowed.';
  end if;

  return new;
end;
$$;

drop trigger if exists todos_handle_insert on public.todos;
create trigger todos_handle_insert
before insert on public.todos
for each row execute function public.handle_todo_insert();

-- 6. Enforce row level security.
alter table public.todos enable row level security;
alter table public.user_profiles enable row level security;

drop policy if exists "Users select own todos" on public.todos;
drop policy if exists "Users modify own todos" on public.todos;
drop policy if exists "Users delete own todos" on public.todos;
drop policy if exists "Users insert own todos" on public.todos;

create policy "Users select own todos"
  on public.todos
  for select
  using (user_id = auth.uid());

create policy "Users insert own todos"
  on public.todos
  for insert
  with check (user_id = auth.uid());

create policy "Users update own todos"
  on public.todos
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users delete own todos"
  on public.todos
  for delete
  using (user_id = auth.uid());

drop policy if exists "Users select own profile" on public.user_profiles;
drop policy if exists "Users insert own profile" on public.user_profiles;
drop policy if exists "Users update own profile" on public.user_profiles;

create policy "Users select own profile"
  on public.user_profiles
  for select
  using (id = auth.uid());

create policy "Users insert own profile"
  on public.user_profiles
  for insert
  with check (id = auth.uid());

create policy "Users update own profile"
  on public.user_profiles
  for update
  using (id = auth.uid())
  with check (id = auth.uid());

commit;
