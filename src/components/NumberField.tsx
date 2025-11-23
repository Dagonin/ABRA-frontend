
import React from 'react';
import styles from './NumberField.module.css';


// https://base-ui.com/react/components/number-field


interface NumberFieldProps {
  min?: number;
  max?: number;
  defaultValue?: number;
  value?: number;
  disabled?: boolean;
  onChange?: (value: number) => void;
}

export default function ExampleNumberField({ min = 0, max = 100, defaultValue = 10, value, disabled = false, onChange }: NumberFieldProps) {
  const id = React.useId();
  const [internal, setInternal] = React.useState<number>(typeof value === 'number' ? value : defaultValue);

  React.useEffect(() => {
    if (typeof value === 'number' && value !== internal) {
      setInternal(value);
    }
  }, [value, internal]);

  const current = typeof value === 'number' ? value : internal;
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const apply = (v: number) => {
    const next = clamp(v);
    setInternal(next);
    onChange?.(next);
  };

  return (
    <div className={styles.Field}>
      <label htmlFor={id} className={styles.Label}>Waga</label>
      <div className={styles.Group}>
        <button
          type="button"
          className={styles.Decrement}
          disabled={disabled}
          onClick={() => apply(current - 1)}
        >
          <MinusIcon />
        </button>
        <input
          id={id}
            className={styles.Input}
            disabled={disabled}
            value={String(current)}
            onChange={(e) => {
              const next = Number(e.target.value);
              if (!Number.isNaN(next)) {
                apply(next);
              }
            }}
            onBlur={(e) => {
              if (e.target.value.trim() === '') {
                apply(min);
              }
            }}
        />
        <button
          type="button"
          className={styles.Increment}
          disabled={disabled}
          onClick={() => apply(current + 1)}
        >
          <PlusIcon />
        </button>
      </div>
    </div>
  );
}

// Removed animated cursor used by previous library-based component.

function PlusIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentcolor"
      strokeWidth="1.6"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M0 5H5M10 5H5M5 5V0M5 5V10" />
    </svg>
  );
}

function MinusIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentcolor"
      strokeWidth="1.6"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M0 5H10" />
    </svg>
  );
}
