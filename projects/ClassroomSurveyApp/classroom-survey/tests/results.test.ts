import test from 'node:test'
import assert from 'node:assert/strict'
import { summarizeResults } from '../src/lib/results-core.ts'
import type { ResultSurvey } from '../src/lib/results.ts'

const survey: ResultSurvey = { id: 's', title: 'Sample', description: null, status: 'closed', created_at: '2026-10-01', updated_at: '2026-10-02' }
const questions = [{ id: 'q1', question_text: 'Pick one', position: 1 }, { id: 'q2', question_text: 'True or false', position: 2 }]
const choices = [{ id: 'c1', question_id: 'q1', choice_text: 'A', position: 1 }, { id: 'c2', question_id: 'q1', choice_text: 'B', position: 2 }, { id: 'c3', question_id: 'q2', choice_text: 'True', position: 1 }]
const responses = [{ id: 'r1', submitted_at: '2026-10-02' }, { id: 'r2', submitted_at: '2026-10-03' }, { id: 'r3', submitted_at: '2026-10-04' }]

test('counts and percentages use valid answered submissions as denominator', () => {
  const data = summarizeResults(survey, questions, choices, responses, [
    { response_id: 'r1', question_id: 'q1', choice_id: 'c1', text_answer: null },
    { response_id: 'r2', question_id: 'q1', choice_id: 'c2', text_answer: null },
    { response_id: 'r3', question_id: 'q1', choice_id: 'c1', text_answer: null },
    { response_id: 'r1', question_id: 'q2', choice_id: 'c3', text_answer: null },
  ])
  assert.equal(data.responseCount, 3)
  assert.deepEqual(data.questions[0].choices.map(c => [c.count, c.percentage]), [[2, 66.7], [1, 33.3]])
  assert.equal(data.questions[1].unanswered, 2)
  assert.equal(data.questions[1].choices[0].percentage, 100)
})

test('zero responses produce zero percentages and no divide by zero', () => {
  const data = summarizeResults(survey, questions, choices, [], [])
  assert.equal(data.questions[0].responseCount, 0)
  assert.equal(data.questions[0].choices[0].percentage, 0)
})

test('ignores answers for non-existent responses or invalid choice IDs', () => {
  const data = summarizeResults(survey, questions, choices, responses, [
    { response_id: 'ghost', question_id: 'q1', choice_id: 'c1', text_answer: null },
    { response_id: 'r1', question_id: 'q1', choice_id: 'not-a-choice', text_answer: null },
  ])
  assert.equal(data.questions[0].responseCount, 0)
  assert.equal(data.questions[0].unanswered, 3)
})
