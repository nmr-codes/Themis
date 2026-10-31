-- ============================================================
-- Themis / Huquqiy Yordam — Initial Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- Profiles (extends auth.users)
-- ============================================================
create table public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  full_name text not null,
  phone text,
  email text,
  avatar_url text,
  region text,
  preferred_language text default 'uz' check (preferred_language in ('uz', 'ru')),
  role text not null default 'user' check (role in ('user', 'specialist', 'admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = user_id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = user_id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = user_id);
create policy "Admins can view all profiles" on public.profiles for select using (
  exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin')
);

-- ============================================================
-- Legal Categories
-- ============================================================
create table public.legal_categories (
  id text primary key,
  name_uz text not null,
  name_ru text not null,
  description_uz text,
  description_ru text,
  icon text,
  sort_order integer default 0
);

alter table public.legal_categories enable row level security;
create policy "Anyone can view categories" on public.legal_categories for select using (true);

-- Seed legal categories
insert into public.legal_categories (id, name_uz, name_ru, description_uz, description_ru, icon, sort_order) values
  ('labor', 'Mehnat huquqi', 'Трудовое право', 'Ish shartnomasi, ish haqi, ishdan bo''shatish', 'Трудовой договор, зарплата, увольнение', 'Briefcase', 1),
  ('family', 'Oila huquqi', 'Семейное право', 'Nikoh, ajralish, alimentlar, bolalar huquqlari', 'Брак, развод, алименты, права детей', 'Heart', 2),
  ('civil', 'Fuqarolik huquqi', 'Гражданское право', 'Fuqarolik shartnomalar, huquqlar', 'Гражданские договоры, права', 'Users', 3),
  ('housing', 'Uy-joy huquqi', 'Жилищное право', 'Uy-joy sotib olish, ijara, nizolar', 'Покупка жилья, аренда, споры', 'Home', 4),
  ('criminal', 'Jinoyat huquqi', 'Уголовное право', 'Jinoyat ishlari, himoya', 'Уголовные дела, защита', 'Shield', 5),
  ('administrative', 'Ma''muriy huquq', 'Административное право', 'Ma''muriy javobgarlik, jarima', 'Административная ответственность, штрафы', 'Building2', 6),
  ('business', 'Tadbirkorlik huquqi', 'Предпринимательское право', 'Biznes, litsenziyalash, soliq', 'Бизнес, лицензирование, налоги', 'TrendingUp', 7),
  ('property', 'Mulk huquqi', 'Право собственности', 'Ko''chmas mulk, meros', 'Недвижимость, наследство', 'Key', 8),
  ('contract', 'Shartnoma huquqi', 'Договорное право', 'Shartnomalar tuzish va buzilish', 'Заключение и расторжение договоров', 'FileText', 9),
  ('tax', 'Soliq huquqi', 'Налоговое право', 'Soliq to''lash, deklaratsiya', 'Налогообложение, декларации', 'Calculator', 10);

-- ============================================================
-- Specialists
-- ============================================================
create table public.specialists (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  full_name text not null,
  phone text not null,
  email text not null,
  avatar_url text,
  bio text,
  region text,
  languages text[] default '{"uz"}',
  experience_years integer default 0,
  education text,
  university text,
  graduation_year integer,
  previous_workplaces jsonb default '[]',
  verification_status text default 'draft' check (verification_status in ('draft', 'pending', 'approved', 'revision_needed', 'rejected', 'suspended')),
  admin_notes text,
  is_online boolean default false,
  rating_avg numeric(3,2) default 0,
  rating_count integer default 0,
  consultation_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_specialists_status on public.specialists(verification_status);
create index idx_specialists_region on public.specialists(region);
create index idx_specialists_rating on public.specialists(rating_avg desc);

alter table public.specialists enable row level security;
create policy "Anyone can view approved specialists" on public.specialists for select using (verification_status = 'approved');
create policy "Specialists can view own profile" on public.specialists for select using (auth.uid() = user_id);
create policy "Specialists can update own profile" on public.specialists for update using (auth.uid() = user_id);
create policy "Specialists can insert own profile" on public.specialists for insert with check (auth.uid() = user_id);
create policy "Admins can view all specialists" on public.specialists for select using (
  exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin')
);
create policy "Admins can update any specialist" on public.specialists for update using (
  exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin')
);

-- ============================================================
-- Specialist ↔ Category (many-to-many)
-- ============================================================
create table public.specialist_categories (
  specialist_id uuid references public.specialists(id) on delete cascade,
  category_id text references public.legal_categories(id) on delete cascade,
  primary key (specialist_id, category_id)
);

alter table public.specialist_categories enable row level security;
create policy "Anyone can view specialist categories" on public.specialist_categories for select using (true);
create policy "Specialists can manage own categories" on public.specialist_categories for all using (
  exists (select 1 from public.specialists s where s.id = specialist_id and s.user_id = auth.uid())
);

-- ============================================================
-- Specialist Credentials
-- ============================================================
create table public.specialist_credentials (
  id uuid primary key default uuid_generate_v4(),
  specialist_id uuid references public.specialists(id) on delete cascade not null,
  credential_type text not null check (credential_type in ('diploma', 'license', 'certificate', 'id_document', 'other')),
  title text not null,
  issuer text,
  issue_date date,
  expiry_date date,
  document_url text,
  verification_status text default 'pending' check (verification_status in ('pending', 'verified', 'rejected')),
  admin_notes text,
  created_at timestamptz default now()
);

alter table public.specialist_credentials enable row level security;
create policy "Specialists can manage own credentials" on public.specialist_credentials for all using (
  exists (select 1 from public.specialists s where s.id = specialist_id and s.user_id = auth.uid())
);
create policy "Admins can view all credentials" on public.specialist_credentials for select using (
  exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin')
);
create policy "Admins can update credentials" on public.specialist_credentials for update using (
  exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin')
);

-- ============================================================
-- Services (tariffs)
-- ============================================================
create table public.services (
  id uuid primary key default uuid_generate_v4(),
  specialist_id uuid references public.specialists(id) on delete cascade not null,
  name text not null,
  description text,
  duration_minutes integer not null,
  price numeric(12,2) not null,
  currency text default 'UZS',
  format text default 'chat' check (format in ('chat', 'video', 'audio')),
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.services enable row level security;
create policy "Anyone can view active services" on public.services for select using (is_active = true);
create policy "Specialists can manage own services" on public.services for all using (
  exists (select 1 from public.specialists s where s.id = specialist_id and s.user_id = auth.uid())
);

-- ============================================================
-- Availability
-- ============================================================
create table public.availability (
  id uuid primary key default uuid_generate_v4(),
  specialist_id uuid references public.specialists(id) on delete cascade not null,
  day_of_week integer check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  is_available boolean default true
);

alter table public.availability enable row level security;
create policy "Anyone can view availability" on public.availability for select using (true);
create policy "Specialists can manage own availability" on public.availability for all using (
  exists (select 1 from public.specialists s where s.id = specialist_id and s.user_id = auth.uid())
);

-- ============================================================
-- AI Conversations
-- ============================================================
create table public.ai_conversations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text,
  legal_category_id text references public.legal_categories(id),
  status text default 'active' check (status in ('active', 'closed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.ai_conversations enable row level security;
create policy "Users can manage own conversations" on public.ai_conversations for all using (auth.uid() = user_id);

-- ============================================================
-- AI Messages
-- ============================================================
create table public.ai_messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid references public.ai_conversations(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  sources jsonb default '[]',
  recommended_specialists uuid[] default '{}',
  created_at timestamptz default now()
);

alter table public.ai_messages enable row level security;
create policy "Users can manage own messages" on public.ai_messages for all using (
  exists (select 1 from public.ai_conversations c where c.id = conversation_id and c.user_id = auth.uid())
);

-- ============================================================
-- Consultations
-- ============================================================
create table public.consultations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  specialist_id uuid references public.specialists(id) on delete cascade not null,
  service_id uuid references public.services(id) not null,
  ai_conversation_id uuid references public.ai_conversations(id),
  status text default 'pending' check (status in ('pending', 'accepted', 'scheduled', 'in_progress', 'completed', 'cancelled', 'disputed')),
  scheduled_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  cancellation_reason text,
  meeting_link text,
  user_notes text,
  specialist_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_consultations_user on public.consultations(user_id);
create index idx_consultations_specialist on public.consultations(specialist_id);
create index idx_consultations_status on public.consultations(status);

alter table public.consultations enable row level security;
create policy "Users can view own consultations" on public.consultations for select using (auth.uid() = user_id);
create policy "Users can create consultations" on public.consultations for insert with check (auth.uid() = user_id);
create policy "Specialists can view assigned consultations" on public.consultations for select using (
  exists (select 1 from public.specialists s where s.id = specialist_id and s.user_id = auth.uid())
);
create policy "Specialists can update assigned consultations" on public.consultations for update using (
  exists (select 1 from public.specialists s where s.id = specialist_id and s.user_id = auth.uid())
);
create policy "Admins can view all consultations" on public.consultations for select using (
  exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin')
);
create policy "Admins can update consultations" on public.consultations for update using (
  exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin')
);

-- ============================================================
-- Chat Messages
-- ============================================================
create table public.chat_messages (
  id uuid primary key default uuid_generate_v4(),
  consultation_id uuid references public.consultations(id) on delete cascade not null,
  sender_id uuid references auth.users(id) not null,
  content text,
  attachment_url text,
  attachment_name text,
  is_read boolean default false,
  created_at timestamptz default now()
);

create index idx_chat_messages_consultation on public.chat_messages(consultation_id);

alter table public.chat_messages enable row level security;
create policy "Consultation participants can view messages" on public.chat_messages for select using (
  exists (
    select 1 from public.consultations c
    where c.id = consultation_id
    and (c.user_id = auth.uid() or exists (
      select 1 from public.specialists s where s.id = c.specialist_id and s.user_id = auth.uid()
    ))
  )
);
create policy "Consultation participants can send messages" on public.chat_messages for insert with check (
  auth.uid() = sender_id and exists (
    select 1 from public.consultations c
    where c.id = consultation_id
    and (c.user_id = auth.uid() or exists (
      select 1 from public.specialists s where s.id = c.specialist_id and s.user_id = auth.uid()
    ))
  )
);

-- ============================================================
-- Transactions
-- ============================================================
create table public.transactions (
  id uuid primary key default uuid_generate_v4(),
  consultation_id uuid references public.consultations(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  specialist_id uuid references public.specialists(id) not null,
  amount numeric(12,2) not null,
  platform_fee numeric(12,2) default 0,
  specialist_amount numeric(12,2) default 0,
  currency text default 'UZS',
  status text default 'pending' check (status in ('pending', 'paid', 'held', 'completed', 'refund_pending', 'refunded', 'disputed')),
  payment_provider text,
  payment_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.transactions enable row level security;
create policy "Users can view own transactions" on public.transactions for select using (auth.uid() = user_id);
create policy "Specialists can view own transactions" on public.transactions for select using (
  exists (select 1 from public.specialists s where s.id = specialist_id and s.user_id = auth.uid())
);
create policy "Admins can view all transactions" on public.transactions for select using (
  exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin')
);

-- ============================================================
-- Reviews
-- ============================================================
create table public.reviews (
  id uuid primary key default uuid_generate_v4(),
  consultation_id uuid references public.consultations(id) on delete cascade not null unique,
  user_id uuid references auth.users(id) not null,
  specialist_id uuid references public.specialists(id) not null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  specialist_reply text,
  status text default 'active' check (status in ('active', 'flagged', 'removed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_reviews_specialist on public.reviews(specialist_id);

alter table public.reviews enable row level security;
create policy "Anyone can view active reviews" on public.reviews for select using (status = 'active');
create policy "Users can create reviews" on public.reviews for insert with check (auth.uid() = user_id);
create policy "Users can view own reviews" on public.reviews for select using (auth.uid() = user_id);
create policy "Specialists can view own reviews" on public.reviews for select using (
  exists (select 1 from public.specialists s where s.id = specialist_id and s.user_id = auth.uid())
);
create policy "Specialists can reply to reviews" on public.reviews for update using (
  exists (select 1 from public.specialists s where s.id = specialist_id and s.user_id = auth.uid())
);
create policy "Admins can manage reviews" on public.reviews for all using (
  exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin')
);

-- ============================================================
-- Notifications
-- ============================================================
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null,
  title text not null,
  message text,
  data jsonb default '{}',
  is_read boolean default false,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;
create policy "Users can manage own notifications" on public.notifications for all using (auth.uid() = user_id);

-- ============================================================
-- Complaints
-- ============================================================
create table public.complaints (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid references auth.users(id) not null,
  reported_user_id uuid references auth.users(id),
  consultation_id uuid references public.consultations(id),
  review_id uuid references public.reviews(id),
  type text not null check (type in ('specialist', 'user', 'review', 'consultation', 'other')),
  description text not null,
  status text default 'open' check (status in ('open', 'investigating', 'resolved', 'dismissed')),
  admin_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.complaints enable row level security;
create policy "Users can create complaints" on public.complaints for insert with check (auth.uid() = reporter_id);
create policy "Users can view own complaints" on public.complaints for select using (auth.uid() = reporter_id);
create policy "Admins can manage complaints" on public.complaints for all using (
  exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin')
);

-- ============================================================
-- Audit Logs
-- ============================================================
create table public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  action text not null,
  entity_type text,
  entity_id text,
  details jsonb default '{}',
  ip_address text,
  created_at timestamptz default now()
);

alter table public.audit_logs enable row level security;
create policy "Admins can view audit logs" on public.audit_logs for select using (
  exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin')
);

-- ============================================================
-- Function: auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Foydalanuvchi'),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'user')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Function: update specialist rating on new review
-- ============================================================
create or replace function public.update_specialist_rating()
returns trigger as $$
begin
  update public.specialists
  set
    rating_avg = (select coalesce(avg(rating), 0) from public.reviews where specialist_id = new.specialist_id and status = 'active'),
    rating_count = (select count(*) from public.reviews where specialist_id = new.specialist_id and status = 'active'),
    updated_at = now()
  where id = new.specialist_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_review_change
  after insert or update on public.reviews
  for each row execute function public.update_specialist_rating();

-- ============================================================
-- Function: increment specialist consultation count
-- ============================================================
create or replace function public.update_consultation_count()
returns trigger as $$
begin
  if new.status = 'completed' and (old.status is null or old.status != 'completed') then
    update public.specialists
    set consultation_count = consultation_count + 1, updated_at = now()
    where id = new.specialist_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_consultation_completed
  after update on public.consultations
  for each row execute function public.update_consultation_count();

-- ============================================================
-- Enable realtime for chat
-- ============================================================
alter publication supabase_realtime add table public.chat_messages;
alter publication supabase_realtime add table public.notifications;

