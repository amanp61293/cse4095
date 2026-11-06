import type { ResultSurvey, ResultResponse, ResultAnswer, SurveyResults } from './results.ts'

export function summarizeResults(
  survey: ResultSurvey,
  questions: { id: string; question_text: string; position: number }[],
  choices: { id: string; question_id: string; choice_text: string; position: number }[],
  responses: ResultResponse[],
  answers: ResultAnswer[],
): SurveyResults {
  const responseIds = new Set(responses.map((response) => response.id))
  const validAnswers = answers.filter((answer) => responseIds.has(answer.response_id))
  const resultQuestions = [...questions].sort((a, b) => a.position - b.position).map((question) => {
    const questionChoices = choices.filter((choice) => choice.question_id === question.id).sort((a, b) => a.position - b.position)
    const allowedChoices = new Set(questionChoices.map((choice) => choice.id))
    const answered = validAnswers.filter((answer) => answer.question_id === question.id && answer.choice_id && allowedChoices.has(answer.choice_id))
    const answerByResponse = new Map(answered.map((answer) => [answer.response_id, answer.choice_id]))
    const responseCount = answerByResponse.size
    return {
      id: question.id, question_text: question.question_text, position: question.position,
      responseCount, unanswered: Math.max(0, responses.length - responseCount),
      choices: questionChoices.map((choice) => {
        const count = [...answerByResponse.values()].filter((id) => id === choice.id).length
        return { id: choice.id, choice_text: choice.choice_text, position: choice.position,
          count, percentage: responseCount ? Math.round((count / responseCount) * 1000) / 10 : 0 }
      }),
    }
  })
  return { survey, responseCount: responses.length, questions: resultQuestions, responses, answers: validAnswers }
}

