create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  username text unique,
  full_name text,
  avatar_url text,

  phone_number text,
  professional_role text,
  description text,
  location_city text,
  years_of_experience int4,
  social_links jsonb default '{}' not null,

  published_resume_url text,
  published_resume_slug text,

  profile_completed boolean default false not null,

  credits_balance int4 default 50 not null,
  plan text default 'free' not null,

  monthly_parse_count int4 default 0 not null,
  monthly_ai_credits_used int4 default 0 not null,
  public_resume_count int4 default 0 not null,

  billing_cycle_start timestamptz,
  billing_cycle_end timestamptz,
  last_credit_reset_at timestamptz,

  status text default 'active' not null,

  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table credits_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  amount int4 not null,
  balance_after int4 not null,
  reason text not null,
  related_entity_type text,
  related_entity_id uuid,
  metadata jsonb,
  created_at timestamptz default now() not null
);

create table resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  slug text unique,
  theme text default 'pixel' not null,
  visibility text default 'private' not null,
  resume_json jsonb not null default '{}',
  ats_score int4,
  published boolean default false not null,
  published_at timestamptz,
  last_exported_at timestamptz,
  seo_title text,
  seo_description text,
  version_number int4 default 1 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table resume_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  resume_id uuid references resumes(id) on delete set null,
  storage_path text not null,
  original_filename text not null,
  mime_type text,
  file_size bigint,
  checksum text,
  parse_status text default 'not_started' not null,
  parser_mode text,
  pages_count int4,
  uploaded_from text,
  deleted_at timestamptz,
  created_at timestamptz default now() not null
);

create table parse_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  resume_file_id uuid not null references resume_files(id) on delete cascade,
  provider text not null,
  external_job_id text,
  parser_mode text,
  status text default 'pending' not null,
  started_at timestamptz,
  completed_at timestamptz,
  failed_at timestamptz,
  retry_count int4 default 0 not null,
  raw_markdown text,
  raw_text text,
  parsed_items jsonb,
  parsed_json jsonb,
  quality_score int4,
  pages_count int4,
  credits_used int4,
  refunded boolean default false not null,
  error_message text,
  metadata jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table ai_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  resume_id uuid references resumes(id) on delete cascade,
  provider text not null,
  model text not null,
  feature text not null,
  input_tokens int4,
  output_tokens int4,
  credits_used int4 not null default 0,
  status text default 'completed' not null,
  error_message text,
  latency_ms int4,
  cached boolean default false not null,
  metadata jsonb,
  created_at timestamptz default now() not null
);

create table resume_analytics (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references resumes(id) on delete cascade,
  event_type text not null,
  visitor_hash text,
  country text,
  city text,
  device_type text,
  referrer text,
  user_agent text,
  metadata jsonb,
  created_at timestamptz default now() not null
);

create table resume_versions (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references resumes(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  version_number int4 not null,
  resume_json jsonb not null,
  change_summary text,
  created_at timestamptz default now() not null
);

create table published_resumes (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references resumes(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  slug text unique not null,
  is_active boolean default true not null,
  published_at timestamptz default now() not null,
  unpublished_at timestamptz,
  metadata jsonb,
  created_at timestamptz default now() not null
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  plan text not null,
  status text not null,
  provider text,
  provider_customer_id text,
  provider_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  provider text not null,
  provider_payment_id text,
  provider_order_id text,
  amount int4 not null,
  currency text default 'INR' not null,
  credits_added int4 default 0 not null,
  status text not null,
  metadata jsonb,
  created_at timestamptz default now() not null
);

create table credit_packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  credits int4 not null,
  price int4 not null,
  currency text default 'INR' not null,
  razorpay_plan_id text,
  active boolean default true not null,
  metadata jsonb,
  created_at timestamptz default now() not null
);

insert into credit_packages (name, credits, price) values
  ('Starter Pack', 100, 9900),
  ('Builder Pack', 300, 24900),
  ('Pro Pack', 700, 49900);

create table plan_limits (
  id uuid primary key default gen_random_uuid(),
  plan text unique not null,
  monthly_parse_limit int4 not null,
  public_resume_limit int4 not null,
  monthly_ai_credit_limit int4,
  nano_enabled boolean default true not null,
  nano_mini_enabled boolean default true not null,
  nano_pro_enabled boolean default false not null,
  auto_enabled boolean default false not null,
  cover_letter_enabled boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

insert into plan_limits
  (plan, monthly_parse_limit, public_resume_limit, nano_pro_enabled, auto_enabled, cover_letter_enabled)
values
  ('free',    5,           1,           false, false, false),
  ('pro',     50,          5,           true,  true,  true),
  ('premium', 2147483647,  2147483647,  true,  true,  true);

alter table profiles enable row level security;
alter table credits_ledger enable row level security;
alter table resumes enable row level security;
alter table resume_files enable row level security;
alter table parse_jobs enable row level security;
alter table ai_events enable row level security;
alter table resume_analytics enable row level security;
alter table resume_versions enable row level security;
alter table published_resumes enable row level security;
alter table subscriptions enable row level security;
alter table payments enable row level security;
alter table plan_limits enable row level security;
alter table credit_packages enable row level security;

create policy "users_own_profile" on profiles for all using (auth.uid() = id);
create policy "public_profile_read" on profiles for select using (profile_completed = true);
create policy "users_own_ledger" on credits_ledger for select using (auth.uid() = user_id);
create policy "users_own_resumes" on resumes for all using (auth.uid() = user_id);
create policy "public_resume_read" on resumes for select using (published = true and visibility = 'public');
create policy "users_own_files" on resume_files for all using (auth.uid() = user_id);
create policy "users_own_parse_jobs" on parse_jobs for all using (auth.uid() = user_id);
create policy "users_own_ai_events" on ai_events for select using (auth.uid() = user_id);
create policy "authenticated_read_plan_limits" on plan_limits for select using (auth.role() = 'authenticated');
create policy "authenticated_read_credit_packages" on credit_packages for select using (auth.role() = 'authenticated');
create policy "users_own_subscriptions" on subscriptions for select using (auth.uid() = user_id);
create policy "users_own_payments" on payments for select using (auth.uid() = user_id);
create policy "users_own_published_resumes" on published_resumes for all using (auth.uid() = user_id);
create policy "public_read_published_resumes" on published_resumes for select using (is_active = true);

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id, email, full_name, avatar_url, credits_balance,
    social_links, profile_completed
  )
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    50,
    '{"github":"","linkedin":"","leetcode":"","portfolio":"","twitter":"","youtube":""}',
    false
  );

  insert into public.credits_ledger (user_id, amount, balance_after, reason)
  values (new.id, 50, 50, 'signup_bonus');

  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

create or replace function deduct_credits(
  p_user_id uuid,
  p_amount int4,
  p_reason text,
  p_related_entity_type text default null,
  p_related_entity_id uuid default null,
  p_metadata jsonb default null
)
returns int4 as $$
declare
  v_current_balance int4;
  v_new_balance int4;
begin
  select credits_balance into v_current_balance
  from profiles where id = p_user_id for update;

  if v_current_balance < p_amount then
    raise exception 'insufficient_credits';
  end if;

  v_new_balance := v_current_balance - p_amount;

  update profiles
  set credits_balance = v_new_balance, updated_at = now()
  where id = p_user_id;

  insert into credits_ledger
    (user_id, amount, balance_after, reason, related_entity_type, related_entity_id, metadata)
  values
    (p_user_id, -p_amount, v_new_balance, p_reason,
     p_related_entity_type, p_related_entity_id, p_metadata);

  return v_new_balance;
end;
$$ language plpgsql security definer;

create or replace function add_credits(
  p_user_id uuid,
  p_amount int4,
  p_reason text,
  p_related_entity_type text default null,
  p_related_entity_id uuid default null,
  p_metadata jsonb default null
)
returns int4 as $$
declare
  v_new_balance int4;
begin
  update profiles
  set credits_balance = credits_balance + p_amount, updated_at = now()
  where id = p_user_id
  returning credits_balance into v_new_balance;

  insert into credits_ledger
    (user_id, amount, balance_after, reason, related_entity_type, related_entity_id, metadata)
  values
    (p_user_id, p_amount, v_new_balance, p_reason,
     p_related_entity_type, p_related_entity_id, p_metadata);

  return v_new_balance;
end;
$$ language plpgsql security definer;
