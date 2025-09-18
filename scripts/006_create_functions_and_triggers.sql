-- Function to auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, user_type)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'New User'),
    coalesce(new.raw_user_meta_data ->> 'user_type', 'student')
  )
  on conflict (id) do nothing;

  -- Create portfolio for students
  if coalesce(new.raw_user_meta_data ->> 'user_type', 'student') = 'student' then
    insert into public.portfolios (student_id)
    values (new.id)
    on conflict (student_id) do nothing;
  end if;

  return new;
end;
$$;

-- Trigger for new user creation
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Function to update portfolio when activities are approved
create or replace function public.update_portfolio_on_activity_approval()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Only update if status changed to approved
  if new.status = 'approved' and (old.status is null or old.status != 'approved') then
    -- Update portfolio points
    update public.portfolios
    set 
      total_points = total_points + new.points_awarded,
      total_activities = total_activities + 1,
      updated_at = now()
    where student_id = new.student_id;

    -- Create notification for student
    insert into public.notifications (user_id, title, message, type, activity_id)
    values (
      new.student_id,
      'Activity Approved!',
      'Your activity "' || new.title || '" has been approved and ' || new.points_awarded || ' points have been added to your portfolio.',
      'activity_approved',
      new.id
    );
  end if;

  -- Handle rejection
  if new.status = 'rejected' and (old.status is null or old.status != 'rejected') then
    insert into public.notifications (user_id, title, message, type, activity_id)
    values (
      new.student_id,
      'Activity Rejected',
      'Your activity "' || new.title || '" has been rejected. Reason: ' || coalesce(new.rejection_reason, 'No reason provided'),
      'activity_rejected',
      new.id
    );
  end if;

  return new;
end;
$$;

-- Trigger for activity approval
drop trigger if exists on_activity_status_change on public.activities;
create trigger on_activity_status_change
  after update on public.activities
  for each row
  execute function public.update_portfolio_on_activity_approval();

-- Function to update timestamps
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Add update triggers for timestamps
create trigger update_profiles_updated_at before update on public.profiles
  for each row execute function public.update_updated_at_column();

create trigger update_activities_updated_at before update on public.activities
  for each row execute function public.update_updated_at_column();

create trigger update_portfolios_updated_at before update on public.portfolios
  for each row execute function public.update_updated_at_column();
