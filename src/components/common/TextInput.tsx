import React from 'react';
import { ErrorMessage } from './ErrorMessage';
import styles from './TextInput.module.css';

export interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  id?: string;
  autoFocus?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  id,
  autoFocus = false,
}) => {
  const inputId = id || `text-input-${label}`;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className={styles.field}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
        {required && <span className={styles.required} aria-hidden="true">*</span>}
      </label>
      <input
        id={inputId}
        type="text"
        className={`${styles.input} ${error ? styles.hasError : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        autoFocus={autoFocus}
      />
      {error && <ErrorMessage message={error} id={errorId} />}
    </div>
  );
};
