-- Phases 6-8: Run AFTER the Phase 2 schema migration in Supabase SQL Editor.
-- Idempotent: safe to rerun when no other version of these functions exists.
begin;

-- Guard against edits to published questions/choices even if a client bypasses the UI.
-- On deleting a survey, foreign-key cascades still apply (only updates/inserts are guarded).
create or replace function public.require_draft_question_mutation()
returns trigger language plpgsql set search_path = '' as $$
declare v_status text;
begin
  select s.status into v_status from public.surveys s where s.id = new.survey_id for share;
  if v_status is distinct from 'draft' then raise exception 'SURVEY_NOT_DRAFT'; end if;
  if tg_op = 'UPDATE' and new.survey_id <> old.survey_id then
    raise exception 'CANNOT_MOVE_QUESTION';
  end if;
  return new;
end;
$$;
drop trigger if exists questions_draft_only on public.questions;
create trigger questions_draft_only before insert or update on public.questions
for each row execute function public.require_draft_question_mutation();

create or replace function public.require_draft_choice_mutation()
returns trigger language plpgsql set search_path = '' as $$
declare v_status text;
begin
  select s.status into v_status from public.questions q
    join public.surveys s on s.id = q.survey_id
    where q.id = new.question_id for share of s;
  if v_status is distinct from 'draft' then raise exception 'SURVEY_NOT_DRAFT'; end if;
  if tg_op = 'UPDATE' and new.question_id <> old.question_id then
    raise exception 'CANNOT_MOVE_CHOICE';
  end if;
  return new;
end;
$$;
drop trigger if exists choices_draft_only on public.choices;
create trigger choices_draft_only before insert or update on public.choices
for each row execute function public.require_draft_choice_mutation();

-- Single-instructor project: only authenticated accounts created by the owner can execute these.
-- Transaction-level advisory lock serializes concurrent activations; partial unique index
-- only_one_active_survey provides the final database invariant.
create or replace function public.activate_survey(p_survey_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_survey public.surveys%rowtype; v_slug text;
begin
  if auth.uid() is null then raise exception 'AUTHENTICATION_REQUIRED'; end if;
  perform pg_catalog.pg_advisory_xact_lock(746201, 1);
  select * into v_survey from public.surveys where id = p_survey_id for update;
  if not found then raise exception 'SURVEY_NOT_FOUND'; end if;
  if v_survey.status not in ('draft', 'closed', 'active') then
    raise exception 'SURVEY_CANNOT_BE_ACTIVATED';
  end if;
  if not exists (select 1 from public.questions where survey_id = p_survey_id) then
    raise exception 'SURVEY_HAS_NO_QUESTIONS';
  end if;
  if exists (select 1 from public.questions q where q.survey_id = p_survey_id
    and (not exists (select 1 from public.choices c where c.question_id = q.id)
      or (q.question_type = 'true_false' and
         (select count(*) from public.choices c where c.question_id = q.id) <> 2))) then
    raise exception 'SURVEY_HAS_INVALID_CHOICES';
  end if;
  -- Close any other currently active survey before activating target.
  update public.surveys set status = 'closed' where status = 'active' and id <> p_survey_id;
  v_slug := v_survey.public_slug;
  if v_slug is null then
    -- UUID-derived, non-sequential and effectively unguessable 32-hex slug.
    v_slug := replace(pg_catalog.gen_random_uuid()::text, '-', '');
  end if;
  update public.surveys set status = 'active', public_slug = v_slug
    where id = p_survey_id;
  return pg_catalog.jsonb_build_object('id', p_survey_id, 'status', 'active', 'public_slug', v_slug);
end;
$$;

create or replace function public.close_survey(p_survey_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'AUTHENTICATION_REQUIRED'; end if;
  -- Row lock conflicts with submission's FOR SHARE, so submission and close
  -- cannot interleave between status checking and response insertion.
  update public.surveys set status = 'closed' where id = p_survey_id and status = 'active'
    returning id into v_id;
  if v_id is null then raise exception 'SURVEY_NOT_ACTIVE'; end if;
  return pg_catalog.jsonb_build_object('id', v_id, 'status', 'closed');
end;
$$;

revoke all on function public.require_draft_question_mutation() from public, anon, authenticated;
revoke all on function public.require_draft_choice_mutation() from public, anon, authenticated;
revoke all on function public.activate_survey(uuid) from public, anon, authenticated;
revoke all on function public.close_survey(uuid) from public, anon, authenticated;
grant execute on function public.activate_survey(uuid) to authenticated;
grant execute on function public.close_survey(uuid) to authenticated;
commit;
