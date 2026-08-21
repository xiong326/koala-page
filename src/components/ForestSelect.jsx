import { useEffect, useId, useRef, useState } from 'react';

export default function ForestSelect({ value, options, onChange, ariaLabel }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const optionRefs = useRef([]);
  const listboxId = useId();
  const selectedIndex = Math.max(0, options.findIndex((option) => String(option.value) === String(value)));
  const selectedOption = options[selectedIndex];

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [open]);

  const focusOption = (index) => {
    const nextIndex = (index + options.length) % options.length;
    optionRefs.current[nextIndex]?.focus();
  };

  const openAndFocus = (index = selectedIndex) => {
    setOpen(true);
    window.requestAnimationFrame(() => focusOption(index));
  };

  const selectOption = (option) => {
    onChange(option.value);
    setOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  };

  const handleTriggerKeyDown = (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      openAndFocus(event.key === 'ArrowDown' ? selectedIndex : selectedIndex - 1);
    }
  };

  const handleOptionKeyDown = (event, index) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusOption(index + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusOption(index - 1);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      focusOption(event.key === 'Home' ? 0 : options.length - 1);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    }
  };

  return (
    <div ref={rootRef} className="forest-select">
      <button
        ref={triggerRef}
        type="button"
        className="forest-select-trigger"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => (open ? setOpen(false) : openAndFocus())}
        onKeyDown={handleTriggerKeyDown}
      >
        <span className="truncate">{selectedOption?.label}</span>
        <span className={`forest-select-chevron ${open ? 'is-open' : ''}`} aria-hidden="true">⌄</span>
      </button>

      {open && (
        <div id={listboxId} className="forest-select-options" role="listbox" aria-label={ariaLabel}>
          {options.map((option, index) => {
            const selected = String(option.value) === String(value);
            return (
              <button
                key={option.value}
                ref={(element) => { optionRefs.current[index] = element; }}
                type="button"
                role="option"
                aria-selected={selected}
                className={`forest-select-option ${selected ? 'is-selected' : ''}`}
                onClick={() => selectOption(option)}
                onKeyDown={(event) => handleOptionKeyDown(event, index)}
              >
                <span className="forest-select-check" aria-hidden="true">{selected ? '✓' : ''}</span>
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
