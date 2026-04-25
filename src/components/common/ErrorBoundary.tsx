import React from 'react';
import styles from './ErrorBoundary.module.css';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className={styles.container} role="alert">
          <div className={styles.content}>
            <span className={styles.icon} aria-hidden="true">😵</span>
            <h2 className={styles.title}>予期しないエラーが発生しました</h2>
            <p className={styles.message}>
              {this.state.error?.message || 'アプリケーションでエラーが発生しました。'}
            </p>
            <button
              className={styles.button}
              onClick={this.handleReset}
              type="button"
            >
              再試行
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
