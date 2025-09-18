-- Create user profiles table that references auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  user_type text not null check (user_type in ('student', 'faculty', 'admin')),
  department text,
  student_id text unique, -- Only for students
  employee_id text unique, -- Only for faculty/admin
  phone text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- RLS policies for profiles
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Allow faculty and admin to view student profiles for approval purposes
create policy "profiles_select_students_by_faculty"
  on public.profiles for select
  using (
    user_type = 'student' and 
    exists (
      select 1 from public.profiles p 
      where p.id = auth.uid() and p.user_type in ('faculty', 'admin')
    )
  );
