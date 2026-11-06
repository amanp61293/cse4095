-- Phase 2 smoke test: run in Supabase SQL Editor AFTER the migration.
-- This script rolls back every fixture, including the anonymous response.
-- A passed script returns a JSON success response and finishes with ROLLBACK.
-- Do not replace ROLLBACK with COMMIT.
begin;

-- Known fixture UUIDs are for rollback-only tests, not app data.
insert into public.surveys(id, title, status, public_slug)
values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Phase 2 smoke test', 'active', 'phase2-test')
;
insert into public.questions(id, survey_id, question_text, question_type, position)
values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Test question?', 'true_false', 1);
insert into public.choices(id, question_id, choice_text, position)
values ('cccccccc-cccc-4ccc-8ccc-cccccccccccc',
        'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'True', 1);

-- Test actual anonymous grants and RLS by impersonating the anon DB role.
set local role anon;
select id, title from public.surveys where public_slug = 'phase2-test';
select id, question_text from public.questions
where survey_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
select id, choice_text from public.choices
where question_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
select public.submit_survey_response(
 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'::uuid,
 'phase2-smoke-token-000000000001',
 '[{"question_id":"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb","choice_id":"cccccccc-cccc-4ccc-8ccc-cccccccccccc"}]'::jsonb
) as expected_success;
reset role;

-- Ensure permissions are limited even though a privileged SQL editor can read everything.
do $$
begin
  if has_table_privilege('anon', 'public.responses', 'SELECT')
    or has_table_privilege('anon', 'public.responses', 'INSERT')
    or has_table_privilege('anon', 'public.answers', 'SELECT')
    or has_table_privilege('anon', 'public.answers', 'INSERT')
    or has_table_privilege('anon', 'public.surveys', 'UPDATE') then
    raise exception 'FAIL: anonymous role has inappropriate table privileges';
  end if;
  if not has_function_privilege('anon',
    'public.submit_survey_response(uuid,text,jsonb)', 'EXECUTE') then
    raise exception 'FAIL: anon cannot execute submission RPC';
  end if;
  if (select count(*) from public.responses
      where survey_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa') <> 1 then
    raise exception 'FAIL: missing response';
  end if;
  if (select count(*) from public.answers
      where response_id in (select id from public.responses
          where survey_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')) <> 1 then
    raise exception 'FAIL: missing answer';
  end if;
end;
$$;
rollback;
