import React from 'react';
import styles from './ErrorMessage.module.css';

export interface ErrorMessageProps {
  message: string;
  id?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, id }) => {
  if (!message) return null;

  return (
    <p className={styles.error} role="alert" id={id}>
      <span className={styles.icon} aria-hidden="true">⚠</span>
      {message}
    </p>
  );
};
