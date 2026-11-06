import { summarizeResults } from './results-core'
import { supabase } from './supabase'

export type ResultSurvey = { id: string; title: string; description: string | null; status: string; created_at: string; updated_at: string }
export type ResultChoice = { id: string; choice_text: string; position: number; count: number; percentage: number }
export type ResultQuestion = { id: string; question_text: string; position: number; responseCount: number; unanswered: number; choices: ResultChoice[] }
export type ResultResponse = { id: string; submitted_at: string }
export type ResultAnswer = { response_id: string; question_id: string; choice_id: string | null; text_answer: string | null }
export type SurveyResults = { survey: ResultSurvey; responseCount: number; questions: ResultQuestion[]; responses: ResultResponse[]; answers: ResultAnswer[] }

// Supabase REST requests can default to 1,000 rows. Fetch all pages before aggregating/exporting.
async function allRows<T>(table: 'questions' | 'choices' | 'responses' | 'answers', columns: string, field: string, values: string[]): Promise<T[]> {
  if (!supabase) throw new Error('Supabase is not configured.')
  if (!values.length) return []
  const rows: T[] = []
  // Keep each IN filter bounded. Pagination is necessary for large classes/historical data.
  for (let index = 0; index < values.length; index += 80) {
    const batch = values.slice(index, index + 80)
    for (let offset = 0; ; offset += 500) {
      const { data, error } = await supabase.from(table).select(columns).in(field, batch).range(offset, offset + 499)
      if (error) throw error
      const page = (data ?? []) as unknown as T[]
      rows.push(...page)
      if (page.length < 500) break
    }
  }
  return rows
}


export async function fetchSurveyResults(id: string): Promise<SurveyResults> {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data: survey, error } = await supabase.from('surveys').select('id,title,description,status,created_at,updated_at').eq('id', id).single()
  if (error) throw error
  const questions = await allRows<{ id: string; question_text: string; position: number }>('questions', 'id,question_text,position', 'survey_id', [id])
  const choices = await allRows<{ id: string; question_id: string; choice_text: string; position: number }>('choices', 'id,question_id,choice_text,position', 'question_id', questions.map((q) => q.id))
  const responses = await allRows<ResultResponse>('responses', 'id,submitted_at', 'survey_id', [id])
  const answers = await allRows<ResultAnswer>('answers', 'response_id,question_id,choice_id,text_answer', 'response_id', responses.map((r) => r.id))
  return summarizeResults(survey as ResultSurvey, questions, choices, responses, answers)
}
