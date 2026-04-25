import React from 'react';
import styles from './Header.module.css';

export interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className={styles.header} role="banner">
      <h1 className={styles.title}>{title}</h1>
    </header>
  );
};
