-- Create activity categories table
create table if not exists public.activity_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  points_multiplier decimal(3,2) default 1.0,
  color text default '#3b82f6',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.activity_categories enable row level security;

-- Allow everyone to read categories
create policy "activity_categories_select_all"
  on public.activity_categories for select
  using (true);

-- Only admin can manage categories
create policy "activity_categories_admin_only"
  on public.activity_categories for all
  using (
    exists (
      select 1 from public.profiles p 
      where p.id = auth.uid() and p.user_type = 'admin'
    )
  );

-- Insert default categories
insert into public.activity_categories (name, description, points_multiplier, color) values
  ('Academic Excellence', 'Academic achievements, competitions, research', 1.5, '#10b981'),
  ('Leadership', 'Leadership roles, organizing events, team management', 1.3, '#f59e0b'),
  ('Community Service', 'Volunteering, social work, community engagement', 1.2, '#ef4444'),
  ('Sports & Recreation', 'Sports competitions, fitness activities, outdoor events', 1.0, '#3b82f6'),
  ('Cultural Activities', 'Arts, music, dance, cultural events', 1.1, '#8b5cf6'),
  ('Technical Skills', 'Workshops, certifications, technical projects', 1.4, '#06b6d4'),
  ('Entrepreneurship', 'Business ventures, startups, innovation projects', 1.6, '#f97316');
