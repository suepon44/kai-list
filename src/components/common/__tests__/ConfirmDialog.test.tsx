import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { ConfirmDialog } from '../ConfirmDialog';

describe('ConfirmDialog', () => {
  // jsdom doesn't implement HTMLDialogElement.showModal/close natively
  beforeAll(() => {
    if (!HTMLDialogElement.prototype.showModal) {
      HTMLDialogElement.prototype.showModal = function () {
        this.setAttribute('open', '');
      };
    }
    if (!HTMLDialogElement.prototype.close) {
      HTMLDialogElement.prototype.close = function () {
        this.removeAttribute('open');
      };
    }
  });

  const defaultProps = {
    open: true,
    title: '削除の確認',
    message: 'このレシピを削除しますか？',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  it('renders title and message when open', () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByText('削除の確認')).toBeInTheDocument();
    expect(screen.getByText('このレシピを削除しますか？')).toBeInTheDocument();
  });

  it('renders confirm and cancel buttons', () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByRole('button', { name: '確認' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = vi.fn();
    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByRole('button', { name: '確認' }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: 'キャンセル' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('renders custom button labels', () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        confirmLabel="削除する"
        cancelLabel="やめる"
      />
    );
    expect(screen.getByRole('button', { name: '削除する' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'やめる' })).toBeInTheDocument();
  });
});
