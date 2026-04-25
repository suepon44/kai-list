import React from 'react';
import { ErrorMessage } from './ErrorMessage';
import styles from './Select.module.css';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  required?: boolean;
  id?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  required = false,
  id,
}) => {
  const selectId = id || `select-${label}`;
  const errorId = error ? `${selectId}-error` : undefined;

  return (
    <div className={styles.field}>
      <label htmlFor={selectId} className={styles.label}>
        {label}
        {required && <span className={styles.required} aria-hidden="true">*</span>}
      </label>
      <select
        id={selectId}
        className={`${styles.select} ${error ? styles.hasError : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <ErrorMessage message={error} id={errorId} />}
    </div>
  );
};
