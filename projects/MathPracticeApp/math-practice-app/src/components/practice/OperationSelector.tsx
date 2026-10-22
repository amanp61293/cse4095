import type { MathOperation } from '../../types/question';

const OPERATIONS: { value: MathOperation; label: string; symbol: string }[] = [
  { value: 'addition', label: 'Addition', symbol: '+' },
  { value: 'subtraction', label: 'Subtraction', symbol: '−' },
  { value: 'multiplication', label: 'Multiplication', symbol: '×' },
  { value: 'division', label: 'Division', symbol: '÷' },
];

interface Props {
  selected: MathOperation[];
  onChange: (operations: MathOperation[]) => void;
}

export function OperationSelector({ selected, onChange }: Props) {
  const allSelected = selected.length === OPERATIONS.length;
  return (
    <fieldset className="selector-section">
      <legend>1. Choose your operations</legend>
      <p className="selector-help">
        Pick one or more types of math to practice.
      </p>
      <div className="option-grid">
        {OPERATIONS.map(({ value, label, symbol }) => (
          <label
            className={`option-card ${selected.includes(value) ? 'selected' : ''}`}
            key={value}
          >
            <input
              type="checkbox"
              checked={selected.includes(value)}
              onChange={(event) =>
                onChange(
                  event.target.checked
                    ? [...selected, value]
                    : selected.filter((item) => item !== value),
                )
              }
            />
            <span className="option-symbol" aria-hidden="true">
              {symbol}
            </span>
            <span>{label}</span>
          </label>
        ))}
      </div>
      <button
        type="button"
        className="text-button"
        onClick={() =>
          onChange(
            allSelected ? [] : OPERATIONS.map((operation) => operation.value),
          )
        }
      >
        {allSelected ? 'Clear all operations' : 'Select all (Mixed operations)'}
      </button>
    </fieldset>
  );
}
