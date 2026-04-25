import React from 'react';
import styles from './Page.module.css';

export interface PageProps {
  children: React.ReactNode;
}

export const Page: React.FC<PageProps> = ({ children }) => {
  return (
    <main className={styles.page} role="main">
      {children}
    </main>
  );
};
