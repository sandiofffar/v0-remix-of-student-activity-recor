-- Create portfolios table for auto-generated student portfolios
create table if not exists public.portfolios (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade unique,
  total_points integer not null default 0,
  total_activities integer not null default 0,
  academic_points integer not null default 0,
  leadership_points integer not null default 0,
  community_points integer not null default 0,
  sports_points integer not null default 0,
  cultural_points integer not null default 0,
  technical_points integer not null default 0,
  entrepreneurship_points integer not null default 0,
  achievements_summary jsonb default '[]'::jsonb,
  skills_acquired text[],
  portfolio_url text, -- Generated portfolio URL
  last_generated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.portfolios enable row level security;

-- Students can view their own portfolio
create policy "portfolios_student_own"
  on public.portfolios for select
  using (auth.uid() = student_id);

-- Faculty and admin can view all portfolios
create policy "portfolios_faculty_admin_select"
  on public.portfolios for select
  using (
    exists (
      select 1 from public.profiles p 
      where p.id = auth.uid() and p.user_type in ('faculty', 'admin')
    )
  );

-- System can update portfolios (for auto-generation)
create policy "portfolios_system_update"
  on public.portfolios for all
  using (true);
