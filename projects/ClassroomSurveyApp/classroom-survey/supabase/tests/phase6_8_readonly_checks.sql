-- Run after both migrations in Supabase SQL Editor. No data is changed.
-- Both functions must be callable by authenticated but NOT anon.
select
  has_function_privilege('authenticated', 'public.activate_survey(uuid)', 'EXECUTE') as instructor_can_activate,
  has_function_privilege('authenticated', 'public.close_survey(uuid)', 'EXECUTE') as instructor_can_close,
  has_function_privilege('anon', 'public.activate_survey(uuid)', 'EXECUTE') as student_cannot_activate_expected_false,
  has_function_privilege('anon', 'public.close_survey(uuid)', 'EXECUTE') as student_cannot_close_expected_false,
  has_function_privilege('anon', 'public.submit_survey_response(uuid,text,jsonb)', 'EXECUTE') as student_can_submit;

-- One active survey at a time, plus duplicate-token protection.
select indexname from pg_indexes where schemaname = 'public'
  and indexname in ('only_one_active_survey', 'responses_unique_student_per_survey');

-- Public reads restricted by RLS and anonymous responses private.
select tablename, policyname, roles, cmd from pg_policies
where schemaname = 'public' and tablename in ('surveys', 'questions', 'choices', 'responses', 'answers')
order by tablename, policyname;

select
  has_table_privilege('anon','public.responses','SELECT') as anon_response_read_expected_false,
  has_table_privilege('anon','public.responses','INSERT') as anon_direct_submit_expected_false,
  has_table_privilege('anon','public.answers','SELECT') as anon_answers_read_expected_false;
