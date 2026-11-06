-- Phase 2: Run once in a new Supabase project's SQL Editor as the project owner.
-- Creates only the five tables specified in DATABASE.md.
-- IMPORTANT: do not paste secret keys into SQL or frontend files.

begin;

create table public.surveys (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'draft'
    constraint surveys_status_check check (status in ('draft', 'active', 'closed', 'archived')),
  public_slug text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index surveys_status_idx on public.surveys (status);
create unique index only_one_active_survey on public.surveys (status) where status = 'active';

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references public.surveys(id) on delete cascade,
  question_text text not null,
  question_type text not null
    constraint questions_question_type_check check (question_type in ('multiple_choice', 'true_false')),
  position integer not null,
  created_at timestamptz not null default now()
);
create index questions_survey_id_idx on public.questions (survey_id);

create table public.choices (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  choice_text text not null,
  position integer not null,
  created_at timestamptz not null default now()
);
create index choices_question_id_idx on public.choices (question_id);

create table public.responses (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references public.surveys(id) on delete cascade,
  anonymous_token text,
  submitted_at timestamptz not null default now()
);
create index responses_survey_id_idx on public.responses (survey_id);
create index responses_submitted_at_idx on public.responses (submitted_at);
create unique index responses_unique_student_per_survey
  on public.responses (survey_id, anonymous_token)
  where anonymous_token is not null;

create table public.answers (
  id uuid primary key default gen_random_uuid(),
  response_id uuid not null references public.responses(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  choice_id uuid references public.choices(id) on delete set null,
  text_answer text,
  created_at timestamptz not null default now(),
  constraint answers_response_question_unique unique (response_id, question_id)
);
create index answers_response_id_idx on public.answers (response_id);
create index answers_question_id_idx on public.answers (question_id);
create index answers_choice_id_idx on public.answers (choice_id);

create function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
create trigger surveys_updated_at
  before update on public.surveys
  for each row execute function public.update_updated_at_column();

-- Disable all default client access first, then grant the minimum required.
alter table public.surveys enable row level security;
alter table public.questions enable row level security;
alter table public.choices enable row level security;
alter table public.responses enable row level security;
alter table public.answers enable row level security;

revoke all on table public.surveys, public.questions, public.choices,
  public.responses, public.answers from public, anon, authenticated;

-- The public student can read ONLY active survey content.
grant select on public.surveys, public.questions, public.choices to anon;
create policy "anon read active surveys" on public.surveys
  for select to anon using (status = 'active');
create policy "anon read active questions" on public.questions
  for select to anon using (
    exists (select 1 from public.surveys s
            where s.id = questions.survey_id and s.status = 'active')
  );
create policy "anon read active choices" on public.choices
  for select to anon using (
    exists (select 1 from public.questions q
            join public.surveys s on s.id = q.survey_id
            where q.id = choices.question_id and s.status = 'active')
  );

-- DATABASE.md allows any authenticated user to be an instructor for a single-instructor MVP.
-- CRITICAL: disable public sign-ups in Supabase Auth and invite/create ONLY the instructor.
-- All authenticated users would otherwise have instructor access.
grant select, insert, update, delete on public.surveys, public.questions,
  public.choices, public.responses, public.answers to authenticated;
create policy "instructors manage surveys" on public.surveys
  for all to authenticated using (true) with check (true);
create policy "instructors manage questions" on public.questions
  for all to authenticated using (true) with check (true);
create policy "instructors manage choices" on public.choices
  for all to authenticated using (true) with check (true);
create policy "instructors manage responses" on public.responses
  for all to authenticated using (true) with check (true);
create policy "instructors manage answers" on public.answers
  for all to authenticated using (true) with check (true);

-- SECURITY DEFINER performs all checks and inserts atomically. Students are
-- NOT given direct INSERT or SELECT on responses or answers.
-- The function owner is the privileged migration runner, not anon.
create function public.submit_survey_response(
  p_survey_id uuid,
  p_anonymous_token text,
  p_answers jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_survey_status text;
  v_question_count integer;
  v_answer_count integer;
  v_item jsonb;
  v_question_id uuid;
  v_choice_id uuid;
  v_response_id uuid;
  v_constraint_name text;
begin
  -- Keep a shared row lock until commit so closing/activating the survey
  -- cannot race with the submission checks and writes.
  select status into v_survey_status
    from public.surveys where id = p_survey_id for share;

  if v_survey_status is distinct from 'active' then
    raise exception 'SURVEY_NOT_ACTIVE';
  end if;

  if p_anonymous_token is null or length(btrim(p_anonymous_token)) < 16
    or length(p_anonymous_token) > 256 then
    raise exception 'INVALID_ANONYMOUS_TOKEN';
  end if;

  if p_answers is null or jsonb_typeof(p_answers) <> 'array' then
    raise exception 'INVALID_ANSWERS';
  end if;

  select count(*) into v_question_count from public.questions
    where survey_id = p_survey_id;
  v_answer_count := jsonb_array_length(p_answers);

  -- Version 1 questions require exactly one choice each; reject missing,
  -- extra, duplicate, or malformed submitted answers.
  if v_question_count = 0 or v_answer_count <> v_question_count then
    raise exception 'MISSING_REQUIRED_ANSWER';
  end if;

  for v_item in select value from jsonb_array_elements(p_answers) loop
    if jsonb_typeof(v_item) <> 'object'
      or jsonb_typeof(v_item->'question_id') <> 'string'
      or jsonb_typeof(v_item->'choice_id') <> 'string'
      or (v_item - 'question_id' - 'choice_id') <> '{}'::jsonb then
      raise exception 'INVALID_ANSWERS';
    end if;

    begin
      v_question_id := (v_item->>'question_id')::uuid;
    exception when invalid_text_representation then
      raise exception 'INVALID_QUESTION';
    end;
    begin
      v_choice_id := (v_item->>'choice_id')::uuid;
    exception when invalid_text_representation then
      raise exception 'INVALID_CHOICE';
    end;

    if not exists (select 1 from public.questions
                   where id = v_question_id and survey_id = p_survey_id) then
      raise exception 'INVALID_QUESTION';
    end if;
    if not exists (select 1 from public.choices
                   where id = v_choice_id and question_id = v_question_id) then
      raise exception 'INVALID_CHOICE';
    end if;
  end loop;

  if (select count(distinct (value->>'question_id'))
        from jsonb_array_elements(p_answers)) <> v_answer_count then
    raise exception 'INVALID_QUESTION';
  end if;

  -- Unique index is the final race-safe guard for concurrent duplicate requests.
  if exists (select 1 from public.responses
             where survey_id = p_survey_id and anonymous_token = p_anonymous_token) then
    raise exception 'DUPLICATE_RESPONSE';
  end if;

  insert into public.responses (survey_id, anonymous_token)
    values (p_survey_id, p_anonymous_token)
    returning id into v_response_id;

  insert into public.answers (response_id, question_id, choice_id)
    select v_response_id, (value->>'question_id')::uuid,
           (value->>'choice_id')::uuid
    from jsonb_array_elements(p_answers);

  return jsonb_build_object('success', true, 'response_id', v_response_id);
exception
  when unique_violation then
    get stacked diagnostics v_constraint_name = constraint_name;
    if v_constraint_name = 'responses_unique_student_per_survey' then
      raise exception 'DUPLICATE_RESPONSE';
    end if;
    raise;
end;
$$;

-- Revoke default PUBLIC function execution. Only the submission RPC is public.
revoke all on function public.update_updated_at_column() from public, anon, authenticated;
revoke all on function public.submit_survey_response(uuid, text, jsonb)
  from public, anon, authenticated;
grant execute on function public.submit_survey_response(uuid, text, jsonb) to anon;

commit;
