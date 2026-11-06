import type { SurveyResults } from './results'

/** Escape CSV quotes, separators, newlines, and spreadsheet formula prefixes. */
export function csvCell(value: unknown): string {
  const text = value == null ? '' : String(value)
  // Excel and other spreadsheet tools can execute formulas, even with whitespace before a prefix.
  const safe = /^[\s\u0000-\u001f]*[=+@\-]/.test(text) ? `'${text}` : text
  return `"${safe.replace(/"/g, '""')}"`
}

export function exportResultsCsv(results: SurveyResults): string {
  const { survey, questions, responses, answers } = results
  const headers = ['survey_id', 'survey_title', 'survey_description', 'survey_status', 'survey_created_at', 'survey_updated_at', 'response_id', 'submitted_at', ...questions.map((question) => question.question_text)]
  const choiceLabels = new Map(questions.flatMap((question) => question.choices.map((choice) => [choice.id, choice.choice_text] as const)))
  const answerMap = new Map(answers.map((answer) => [`${answer.response_id}:${answer.question_id}`, answer]))
  const rows = [...responses].sort((a, b) => a.submitted_at.localeCompare(b.submitted_at)).map((response) => [
    survey.id, survey.title, survey.description, survey.status, survey.created_at, survey.updated_at,
    response.id, response.submitted_at,
    ...questions.map((question) => {
      const answer = answerMap.get(`${response.id}:${question.id}`)
      return answer?.choice_id ? choiceLabels.get(answer.choice_id) ?? '' : answer?.text_answer ?? ''
    }),
  ])
  return [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n') + '\r\n'
}

export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob(['\uFEFF', content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
