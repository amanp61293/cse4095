import test from 'node:test'
import assert from 'node:assert/strict'
import { csvCell, exportResultsCsv } from '../src/lib/csv.ts'
import { summarizeResults } from '../src/lib/results-core.ts'

test('CSV quoting and formula injection prevention', () => {
  assert.equal(csvCell('hello,"world"\nnext'), '"hello,""world""\nnext"')
  for (const prefix of ['=', '+', '-', '@', '\t=']) assert.ok(csvCell(`${prefix}CMD`).includes("'"))
  assert.equal(csvCell(null), '""')
})

test('CSV includes metadata, each response, choices, and blanks for unanswered', () => {
  const output = exportResultsCsv(summarizeResults(
    { id: 's', title: '=malicious', description: 'Hi, "you"', status: 'archived', created_at: '2026-01-01', updated_at: '2026-01-02' },
    [{ id: 'q1', question_text: 'Question?', position: 1 }],
    [{ id: 'c1', question_id: 'q1', choice_text: 'Yes', position: 1 }],
    [{ id: 'r1', submitted_at: '2026-02-01' }, { id: 'r2', submitted_at: '2026-02-02' }],
    [{ response_id: 'r1', question_id: 'q1', choice_id: 'c1', text_answer: null }],
  ))
  assert.equal(output.trimEnd().split('\r\n').length, 3)
  assert.match(output, /"survey_created_at"/)
  assert.match(output, /"'=malicious"/)
  assert.match(output, /"Hi, ""you"""/)
  assert.match(output, /"r2","2026-02-02",""/)
})
