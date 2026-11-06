-- Run after the migration. Expected: five rows with rowsecurity=true.
select c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
  and c.relname in ('surveys','questions','choices','responses','answers')
order by c.relname;

-- Verify constraints for all five tables.
select
  conrelid::regclass as table_name,
  conname,
  contype
from pg_constraint
where connamespace = 'public'::regnamespace
  and conrelid in (
    'public.surveys'::regclass,
    'public.questions'::regclass,
    'public.choices'::regclass,
    'public.responses'::regclass,
    'public.answers'::regclass
  )
order by conrelid::regclass::text, conname;

-- Verify all named indexes including one active survey and duplicate protection.
select tablename, indexname from pg_indexes
where schemaname = 'public' and tablename in
  ('surveys','questions','choices','responses','answers')
order by tablename, indexname;

-- Inspect RLS policies.
select tablename, policyname, roles, cmd from pg_policies
where schemaname = 'public' and tablename in
  ('surveys','questions','choices','responses','answers')
order by tablename, policyname;

-- Expected: anon reads survey/question/choice; no anon response/answer SELECT/INSERT;
-- authenticated can manage all five tables; anon can execute RPC.
select
  has_table_privilege('anon','public.surveys','SELECT') as anon_can_read_surveys,
  has_table_privilege('anon','public.responses','SELECT') as anon_can_read_responses,
  has_table_privilege('anon','public.responses','INSERT') as anon_can_insert_responses,
  has_table_privilege('anon','public.answers','SELECT') as anon_can_read_answers,
  has_table_privilege('authenticated','public.responses','SELECT') as instructor_can_read_responses,
  has_function_privilege('anon','public.submit_survey_response(uuid,text,jsonb)','EXECUTE') as anon_can_submit_rpc;
