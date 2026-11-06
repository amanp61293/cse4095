import { supabase } from './supabase'

export type ActivatedSurvey = { id: string; status: 'active'; public_slug: string }
function client() {
  if (!supabase) throw new Error('Supabase is not configured.')
  return supabase
}
export async function activateSurvey(id: string): Promise<ActivatedSurvey> {
  const { data, error } = await client().rpc('activate_survey', { p_survey_id: id })
  if (error) {
    if (error.message.includes('SURVEY_HAS_NO_QUESTIONS')) throw new Error('Add at least one question before activating.')
    if (error.message.includes('SURVEY_HAS_INVALID_CHOICES')) throw new Error('Every question must have valid answer choices.')
    throw new Error('Could not activate this survey. Check its status and try again.')
  }
  return data as ActivatedSurvey
}
export async function closeSurvey(id: string): Promise<void> {
  const { error } = await client().rpc('close_survey', { p_survey_id: id })
  if (error) throw new Error('Could not close the survey. Refresh and try again.')
}
export function publicSurveyUrl(slug: string): string {
  return `${window.location.origin}/s/${encodeURIComponent(slug)}`
}
