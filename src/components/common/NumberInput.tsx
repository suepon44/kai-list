import React from 'react';
import { ErrorMessage } from './ErrorMessage';
import styles from './NumberInput.module.css';

export interface NumberInputProps {
  label: string;
  value: number | '';
  onChange: (value: number | '') => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  min?: number;
  step?: number;
  id?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  min,
  step,
  id,
}) => {
  const inputId = id || `number-input-${label}`;
  const errorId = error ? `${inputId}-error` : undefined;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') {
      onChange('');
    } else {
      const num = parseFloat(raw);
      if (!isNaN(num)) {
        onChange(num);
      }
    }
  };

  return (
    <div className={styles.field}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
        {required && <span className={styles.required} aria-hidden="true">*</span>}
      </label>
      <input
        id={inputId}
        type="number"
        className={`${styles.input} ${error ? styles.hasError : ''}`}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        min={min}
        step={step}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        inputMode="decimal"
      />
      {error && <ErrorMessage message={error} id={errorId} />}
    </div>
  );
};
