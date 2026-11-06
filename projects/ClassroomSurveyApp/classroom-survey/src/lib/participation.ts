import { supabase } from './supabase'

export type PublicChoice = { id: string; choice_text: string; position: number }
export type PublicQuestion = {
  id: string
  question_text: string
  question_type: 'multiple_choice' | 'true_false'
  position: number
  choices: PublicChoice[]
}
export type PublicSurvey = { id: string; title: string; description: string | null; questions: PublicQuestion[] }

function client() {
  if (!supabase) throw new Error('The survey service is not configured. Please contact your instructor.')
  return supabase
}

export async function loadPublicSurvey(slug: string): Promise<PublicSurvey | null> {
  if (!/^[a-zA-Z0-9_-]{6,64}$/.test(slug)) return null
  const { data: survey, error } = await client().from('surveys')
    .select('id,title,description').eq('public_slug', slug).eq('status', 'active').maybeSingle()
  if (error) throw new Error('Unable to load the survey. Please try again.')
  if (!survey) return null
  const { data: questions, error: qError } = await client().from('questions')
    .select('id,question_text,question_type,position').eq('survey_id', survey.id).order('position')
  if (qError) throw new Error('Unable to load the survey questions.')
  const questionIds = (questions ?? []).map((question) => question.id)
  const choices: (PublicChoice & { question_id: string })[] = []
  if (questionIds.length) {
    const { data, error: cError } = await client().from('choices')
      .select('id,question_id,choice_text,position').in('question_id', questionIds).order('position')
    if (cError) throw new Error('Unable to load the answer choices.')
    choices.push(...(data ?? []))
  }
  return {
    id: survey.id, title: survey.title, description: survey.description,
    questions: (questions ?? []).map((question) => ({
      ...question, question_type: question.question_type as PublicQuestion['question_type'],
      choices: choices.filter((choice) => choice.question_id === question.id)
        .map(({ id, choice_text, position }) => ({ id, choice_text, position })),
    })),
  }
}

const TOKEN_KEY = 'classroom-survey:anonymous-token:v1'
export function getAnonymousToken(): string {
  try {
    const existing = localStorage.getItem(TOKEN_KEY)
    if (existing && /^[a-f0-9-]{36}$/.test(existing)) return existing
    const token = crypto.randomUUID()
    localStorage.setItem(TOKEN_KEY, token)
    return token
  } catch {
    // Storage-blocked browsers can still submit, but repeat-submission protection
    // cannot persist when localStorage is unavailable.
    return crypto.randomUUID()
  }
}

function isDuplicate(message: string): boolean { return message.includes('DUPLICATE_RESPONSE') }
export async function submitPublicSurvey(survey: PublicSurvey, selections: Record<string, string>) {
  if (survey.questions.length === 0 || survey.questions.some((question) =>
    !question.choices.some((choice) => choice.id === selections[question.id]))) {
    throw new Error('Please answer every question before submitting.')
  }
  const { data, error } = await client().rpc('submit_survey_response', {
    p_survey_id: survey.id,
    p_anonymous_token: getAnonymousToken(),
    p_answers: survey.questions.map((question) => ({
      question_id: question.id, choice_id: selections[question.id],
    })),
  })
  if (error) {
    if (isDuplicate(error.message)) throw new Error('You have already submitted a response to this survey.')
    if (error.message.includes('SURVEY_NOT_ACTIVE')) throw new Error('This survey is no longer accepting responses.')
    if (error.message.includes('MISSING_REQUIRED_ANSWER')) throw new Error('Please answer every question.')
    if (error.message.includes('INVALID_QUESTION') || error.message.includes('INVALID_CHOICE'))
      throw new Error('The survey has changed. Refresh the page and try again.')
    throw new Error('Your response could not be submitted. Please check your connection and try again.')
  }
  if (!data || data.success !== true) throw new Error('The submission could not be confirmed. Please contact your instructor.')
  return data.response_id as string
}

export function hasSubmittedSurvey(id: string): boolean {
  try { return localStorage.getItem(`classroom-survey:submitted:${id}`) === '1' } catch { return false }
}
export function markSubmittedSurvey(id: string): void {
  try { localStorage.setItem(`classroom-survey:submitted:${id}`, '1') } catch { /* RPC still prevents duplicates */ }
}
