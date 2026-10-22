import type { SessionLength } from '../../types/session';

const LENGTHS: { value: SessionLength; label: string }[] = [
  { value: 5, label: '5 questions' },
  { value: 10, label: '10 questions' },
  { value: 20, label: '20 questions' },
  { value: 'continuous', label: 'Continuous practice' },
];
interface Props { selected: SessionLength; onChange: (length: SessionLength) => void; }
export function SessionLengthSelector({ selected, onChange }: Props) {
  return (
    <fieldset className="selector-section">
      <legend>3. Choose a session length</legend>
      <div className="option-grid">
        {LENGTHS.map(({ value, label }) => (
          <label key={value} className={`option-card ${selected === value ? 'selected' : ''}`}>
            <input type="radio" name="session-length" checked={selected === value} onChange={() => onChange(value)} />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
