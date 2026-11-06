import { supabase } from './supabase'

export type SurveyStatus = 'draft' | 'active' | 'closed' | 'archived'
export type Survey = {
  id: string
  title: string
  description: string | null
  status: SurveyStatus
  created_at: string
}
export type ChoiceDraft = { id: string; choice_text: string }
export type QuestionDraft = {
  id: string
  question_text: string
  question_type: 'multiple_choice' | 'true_false'
  choices: ChoiceDraft[]
}
export type SurveyDraft = {
  title: string
  description: string
  questions: QuestionDraft[]
}

export function newChoice(text = ''): ChoiceDraft {
  return { id: crypto.randomUUID(), choice_text: text }
}

export function newQuestion(type: QuestionDraft['question_type'] = 'multiple_choice'): QuestionDraft {
  return {
    id: crypto.randomUUID(),
    question_text: '',
    question_type: type,
    choices: type === 'true_false' ? [newChoice('True'), newChoice('False')] : [newChoice(), newChoice()],
  }
}

export function validateDraft(draft: SurveyDraft): string | null {
  if (!draft.title.trim()) return 'Enter a survey title.'
  if (draft.questions.length === 0) return 'Add at least one question.'
  for (const [index, question] of draft.questions.entries()) {
    const number = index + 1
    if (!question.question_text.trim()) return `Enter the text for question ${number}.`
    if (question.question_type === 'multiple_choice' && (question.choices.length < 2 || question.choices.length > 10)) {
      return `Question ${number} needs between 2 and 10 choices.`
    }
    if (question.question_type === 'true_false' &&
      (question.choices.length !== 2 || question.choices[0].choice_text !== 'True' || question.choices[1].choice_text !== 'False')) {
      return `Question ${number} must have True and False choices.`
    }
    if (question.choices.some((choice) => !choice.choice_text.trim())) return `Fill in every choice for question ${number}.`
    const labels = question.choices.map((choice) => choice.choice_text.trim().toLowerCase())
    if (new Set(labels).size !== labels.length) return `Question ${number} has duplicate choices.`
  }
  return null
}

function db() {
  if (!supabase) throw new Error('Supabase is not configured. Add your public project URL and key to .env.')
  return supabase
}

export async function fetchSurveys(): Promise<Survey[]> {
  const { data, error } = await db().from('surveys').select('id,title,description,status,created_at').order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Survey[]
}

export async function fetchSurveyDraft(id: string): Promise<{ status: SurveyStatus; draft: SurveyDraft }> {
  const client = db()
  const { data: survey, error } = await client.from('surveys').select('id,title,description,status').eq('id', id).single()
  if (error) throw error
  const { data: questions, error: questionError } = await client.from('questions')
    .select('id,question_text,question_type,position').eq('survey_id', id).order('position')
  if (questionError) throw questionError
  const questionIds = (questions ?? []).map((question) => question.id)
  let choices: { id: string; question_id: string; choice_text: string; position: number }[] = []
  if (questionIds.length) {
    const { data, error: choiceError } = await client.from('choices').select('id,question_id,choice_text,position').in('question_id', questionIds).order('position')
    if (choiceError) throw choiceError
    choices = data ?? []
  }
  return {
    status: survey.status as SurveyStatus,
    draft: {
      title: survey.title,
      description: survey.description ?? '',
      questions: (questions ?? []).map((question) => ({
        id: question.id,
        question_text: question.question_text,
        question_type: question.question_type as QuestionDraft['question_type'],
        choices: choices.filter((choice) => choice.question_id === question.id).map((choice) => ({ id: choice.id, choice_text: choice.choice_text })),
      })),
    },
  }
}

// Drafts are edited through the Supabase client as described in API.md.
// Stable IDs preserve existing question/choice references while reordering.
// This multi-request save is not atomic: errors are surfaced for a retry.
export async function saveDraft(draft: SurveyDraft, existingId?: string): Promise<string> {
  const validation = validateDraft(draft)
  if (validation) throw new Error(validation)
  const client = db()
  const title = draft.title.trim()
  const description = draft.description.trim() || null
  let surveyId = existingId

  if (surveyId) {
    const { data, error } = await client.from('surveys')
      .update({ title, description }).eq('id', surveyId).eq('status', 'draft').select('id')
    if (error) throw error
    if (!data?.length) throw new Error('Only draft surveys can be edited. Refresh the dashboard to check its status.')
  } else {
    const { data, error } = await client.from('surveys')
      .insert({ title, description, status: 'draft' }).select('id').single()
    if (error) throw error
    surveyId = data.id
  }

  // Recheck status before writing children. Existing active surveys are read-only.
  const { data: status, error: statusError } = await client.from('surveys').select('status').eq('id', surveyId).single()
  if (statusError) throw statusError
  if (status.status !== 'draft') throw new Error('This survey is no longer a draft and cannot be edited.')

  const { data: oldQuestions, error: readQuestionError } = await client.from('questions')
    .select('id').eq('survey_id', surveyId)
  if (readQuestionError) throw readQuestionError
  const oldIds = (oldQuestions ?? []).map((question) => question.id)
  const nextIds = new Set(draft.questions.map((question) => question.id))

  for (const [position, question] of draft.questions.entries()) {
    const { error: questionError } = await client.from('questions').upsert({
      id: question.id, survey_id: surveyId, question_text: question.question_text.trim(),
      question_type: question.question_type, position: position + 1,
    })
    if (questionError) throw questionError
    const { data: oldChoices, error: readChoiceError } = await client.from('choices')
      .select('id').eq('question_id', question.id)
    if (readChoiceError) throw readChoiceError
    const nextChoiceIds = new Set(question.choices.map((choice) => choice.id))
    for (const [choicePosition, choice] of question.choices.entries()) {
      const { error: choiceError } = await client.from('choices').upsert({
        id: choice.id, question_id: question.id, choice_text: choice.choice_text.trim(), position: choicePosition + 1,
      })
      if (choiceError) throw choiceError
    }
    const removedChoices = (oldChoices ?? []).map((choice) => choice.id).filter((id) => !nextChoiceIds.has(id))
    if (removedChoices.length) {
      const { error: deleteChoiceError } = await client.from('choices').delete().eq('question_id', question.id).in('id', removedChoices)
      if (deleteChoiceError) throw deleteChoiceError
    }
  }
  const removedQuestions = oldIds.filter((id) => !nextIds.has(id))
  if (removedQuestions.length) {
    const { error: deleteQuestionError } = await client.from('questions').delete().eq('survey_id', surveyId).in('id', removedQuestions)
    if (deleteQuestionError) throw deleteQuestionError
  }
  if (!surveyId) throw new Error('Survey save did not return an ID.')
  return surveyId
}

export async function duplicateSurvey(sourceId: string): Promise<string> {
  const source = await fetchSurveyDraft(sourceId)
  const draft: SurveyDraft = {
    title: `Copy of ${source.draft.title}`,
    description: source.draft.description,
    questions: source.draft.questions.map((question) => ({
      ...question, id: crypto.randomUUID(),
      choices: question.choices.map((choice) => ({ ...choice, id: crypto.randomUUID() })),
    })),
  }
  return saveDraft(draft)
}

export async function changeSurveyStatus(id: string, from: SurveyStatus, to: SurveyStatus) {
  const { data, error } = await db().from('surveys').update({ status: to }).eq('id', id).eq('status', from).select('id')
  if (error) throw error
  if (!data?.length) throw new Error('The survey status changed. Refresh and try again.')
}

export async function removeSurvey(id: string, status: SurveyStatus) {
  const { data, error } = await db().from('surveys').delete().eq('id', id).eq('status', status).select('id')
  if (error) throw error
  if (!data?.length) throw new Error('The survey changed. Refresh and try again.')
}
