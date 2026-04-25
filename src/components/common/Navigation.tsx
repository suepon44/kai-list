import React from 'react';
import styles from './Navigation.module.css';

export interface NavItem {
  id: string;
  label: string;
  icon: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'recipes', label: 'レシピ', icon: '🍳' },
  { id: 'meal-plan', label: '献立', icon: '🗓️' },
  { id: 'shopping-list', label: 'おかいもの', icon: '🧺' },
  { id: 'store-settings', label: 'お店', icon: '🏠' },
  { id: 'diary', label: 'ごはん日記', icon: '📖' },
];

export interface NavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <nav className={styles.nav} role="navigation" aria-label="メインナビゲーション">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          className={`${styles.tab} ${activeTab === item.id ? styles.active : ''}`}
          onClick={() => onTabChange(item.id)}
          aria-current={activeTab === item.id ? 'page' : undefined}
          type="button"
        >
          <span className={styles.icon} aria-hidden="true">
            {item.icon}
          </span>
          <span className={styles.label}>{item.label}</span>
        </button>
      ))}
    </nav>
  );
};
