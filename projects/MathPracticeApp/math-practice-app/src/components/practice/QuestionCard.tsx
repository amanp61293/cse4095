import { useEffect, useState } from 'react';
import type { Question } from '../../types/question';

interface Props {
  question: Question;
  index: number;
  total: number | 'continuous';
  onResult: (correct: boolean, selectedAnswer: number) => void;
  animationsEnabled?: boolean;
  showExplanations?: boolean;
  soundEnabled?: boolean;
}

function explanation(question: Question): string {
  const { firstOperand: a, secondOperand: b, correctAnswer: result } = question;
  switch (question.operation) {
    case 'addition':
      return `Add ${a} and ${b} to get ${result}.`;
    case 'subtraction':
      return `Take ${b} away from ${a} to get ${result}.`;
    case 'multiplication':
      return `${a} groups of ${b} make ${result}.`;
    case 'division':
      return `${a} split into ${b} equal groups gives ${result} in each group.`;
  }
}

export function QuestionCard({
  question,
  index,
  total,
  onResult,
  animationsEnabled = true,
  showExplanations = true,
  soundEnabled = true,
}: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setSelected(null);
    setFlipped(false);
    setSubmitted(false);
  }, [question.id]);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (
        flipped ||
        submitted ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey
      )
        return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
          target.isContentEditable)
      )
        return;
      const index = Number(event.key) - 1;
      if (Number.isInteger(index) && index >= 0 && index < 4)
        setSelected(question.choices[index]);
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [flipped, submitted, question]);

  function submit(correct: boolean) {
    if (!flipped || selected === null || submitted) return;
    setSubmitted(true);
    if (soundEnabled) {
      try {
        const context = new AudioContext();
        const tone = context.createOscillator();
        const gain = context.createGain();
        tone.frequency.value = correct ? 650 : 300;
        gain.gain.value = 0.03;
        tone.connect(gain);
        gain.connect(context.destination);
        tone.start();
        tone.stop(context.currentTime + 0.09);
        void context.close().catch(() => {});
      } catch {
        /* Audio unsupported: question cards still work without sound. */
      }
    }
    onResult(correct, selected);
  }

  return (
    <article
      className={`question-card ${flipped && animationsEnabled ? 'question-card-flipped' : ''}`}
      aria-label="Math question card"
      aria-keyshortcuts="1 2 3 4"
    >
      <p className="eyebrow">
        Question {index} {total === 'continuous' ? '' : `of ${total}`}
      </p>
      <h2 className="math-question">{question.displayText}</h2>
      {!flipped ? (
        <div className="question-face" key={`front-${question.id}`}>
          <p id="choice-instructions">
            Choose the answer you think is correct. You can also press 1, 2, 3,
            or 4.
          </p>
          <div
            className="answers"
            role="group"
            aria-labelledby="choice-instructions"
          >
            {question.choices.map((choice) => (
              <button
                key={choice}
                type="button"
                className={`answer-choice ${selected === choice ? 'answer-selected' : ''}`}
                aria-pressed={selected === choice}
                onClick={() => setSelected(choice)}
              >
                {choice}
                {selected === choice ? (
                  <span className="selected-indicator"> ✓ Selected</span>
                ) : null}
              </button>
            ))}
          </div>
          <button
            className="button button-primary card-action"
            disabled={selected === null}
            onClick={() => setFlipped(true)}
          >
            Flip Card
          </button>
        </div>
      ) : (
        <div
          className="question-face answer-face"
          key={`back-${question.id}`}
          aria-live="polite"
        >
          <p className="answer-reveal">
            Correct answer: <strong>{question.correctAnswer}</strong>
          </p>
          <p>
            Your answer: <strong>{selected}</strong>
          </p>
          {showExplanations && (
            <p className="card-explanation">{explanation(question)}</p>
          )}
          <p>How did you do?</p>
          <div className="action-group">
            <button
              className="button button-primary"
              disabled={submitted}
              onClick={() => submit(true)}
            >
              I Got It Right
            </button>
            <button
              className="button button-secondary"
              disabled={submitted}
              onClick={() => submit(false)}
            >
              I Got It Wrong
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
