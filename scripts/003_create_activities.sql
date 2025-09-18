-- Create activities table
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid not null references public.activity_categories(id),
  title text not null,
  description text not null,
  activity_date date not null,
  duration_hours integer,
  location text,
  organizer text,
  evidence_urls text[], -- Array of URLs for certificates, photos, etc.
  points_claimed integer not null default 0,
  points_awarded integer default 0,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'revision_required')),
  rejection_reason text,
  approved_by uuid references public.profiles(id),
  approved_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.activities enable row level security;

-- Students can manage their own activities
create policy "activities_student_own"
  on public.activities for all
  using (auth.uid() = student_id);

-- Faculty and admin can view all activities for approval
create policy "activities_faculty_admin_select"
  on public.activities for select
  using (
    exists (
      select 1 from public.profiles p 
      where p.id = auth.uid() and p.user_type in ('faculty', 'admin')
    )
  );

-- Faculty and admin can update activities for approval
create policy "activities_faculty_admin_update"
  on public.activities for update
  using (
    exists (
      select 1 from public.profiles p 
      where p.id = auth.uid() and p.user_type in ('faculty', 'admin')
    )
  );

-- Create indexes for better performance
create index if not exists activities_student_id_idx on public.activities(student_id);
create index if not exists activities_status_idx on public.activities(status);
create index if not exists activities_category_id_idx on public.activities(category_id);
