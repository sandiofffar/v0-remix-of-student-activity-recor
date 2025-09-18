-- Create notifications table
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null check (type in ('activity_approved', 'activity_rejected', 'revision_required', 'portfolio_updated', 'system')),
  read boolean not null default false,
  activity_id uuid references public.activities(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.notifications enable row level security;

-- Users can manage their own notifications
create policy "notifications_own"
  on public.notifications for all
  using (auth.uid() = user_id);

-- Create index for better performance
create index if not exists notifications_user_id_idx on public.notifications(user_id);
create index if not exists notifications_read_idx on public.notifications(read);
