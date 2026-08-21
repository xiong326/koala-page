export default function ForestSegmentedControl({ value, options, onChange, ariaLabel, className = '' }) {
  return (
    <div className={`forest-segmented ${className}`} role="group" aria-label={ariaLabel}>
      {options.map((option) => {
        const selected = String(option.value) === String(value);
        return (
          <button
            key={option.value}
            type="button"
            className={`forest-segmented-option ${option.icon ? 'has-icon' : ''} ${selected ? `is-selected ${option.tone ? `tone-${option.tone}` : ''}` : ''}`}
            aria-pressed={selected}
            aria-label={option.label}
            title={option.icon ? option.label : undefined}
            onClick={() => onChange(option.value)}
          >
            {option.icon ? (
              <>
                <span className="forest-segmented-icon" aria-hidden="true">{option.icon}</span>
                <span className="sr-only">{option.label}</span>
              </>
            ) : option.label}
          </button>
        );
      })}
    </div>
  );
}
