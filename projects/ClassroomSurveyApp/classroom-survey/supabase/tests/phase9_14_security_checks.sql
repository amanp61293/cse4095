-- Read-only. Run in Supabase SQL Editor AFTER Phase 2 and Phase 6–8 migrations.
-- Expected: five tables with RLS enabled; anonymous students cannot SELECT responses
-- or answers; only anon read permissions on survey content and RPC EXECUTE.
select c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c join pg_namespace n on c.relnamespace = n.oid
where n.nspname = 'public' and c.relname in ('surveys','questions','choices','responses','answers')
order by c.relname;

select
  has_table_privilege('anon', 'public.surveys', 'select') as anon_can_select_surveys,
  has_table_privilege('anon', 'public.responses', 'select') as anon_can_select_responses_should_be_false,
  has_table_privilege('anon', 'public.responses', 'insert') as anon_can_insert_responses_should_be_false,
  has_table_privilege('anon', 'public.answers', 'select') as anon_can_select_answers_should_be_false,
  has_table_privilege('authenticated', 'public.responses', 'select') as instructor_can_read_results,
  has_function_privilege('anon', 'public.submit_survey_response(uuid,text,jsonb)', 'execute') as anon_can_submit_securely;

select tablename, policyname, roles, cmd
from pg_policies
where schemaname = 'public' and tablename in ('surveys','questions','choices','responses','answers')
order by tablename, policyname;

-- Returns aggregate counts only. Compare totals with the instructor Results page.
select s.id, s.title, s.status, count(r.id) as response_count
from public.surveys s left join public.responses r on r.survey_id = s.id
group by s.id, s.title, s.status
order by s.title;

-- Check no survey has been accidentally activated alongside another.
select count(*) as active_survey_count from public.surveys where status='active';
