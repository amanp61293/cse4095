import type { DifficultyLevel } from '../../types/question';

const LEVELS: { value: DifficultyLevel; label: string; description: string }[] = [
  { value: 1, label: 'Beginner', description: 'Small numbers and simple facts' },
  { value: 2, label: 'Easy', description: 'Build confidence with bigger numbers' },
  { value: 3, label: 'Intermediate', description: 'More challenging number facts' },
  { value: 4, label: 'Advanced', description: 'Multi-digit math challenges' },
];

interface Props { selected: DifficultyLevel; onChange: (level: DifficultyLevel) => void; }

export function DifficultySelector({ selected, onChange }: Props) {
  return (
    <fieldset className="selector-section">
      <legend>2. Choose a difficulty</legend>
      <div className="option-grid">
        {LEVELS.map(({ value, label, description }) => (
          <label key={value} className={`option-card difficulty-option ${selected === value ? 'selected' : ''}`}>
            <input type="radio" name="difficulty" checked={selected === value} onChange={() => onChange(value)} />
            <span className="option-heading">Level {value}: {label}</span>
            <span className="option-description">{description}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
