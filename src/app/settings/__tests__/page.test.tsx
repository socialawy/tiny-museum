import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SettingsPage from '../page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('@/components/ui/ParentGate', () => ({
  ParentGate: ({
    onUnlock,
    onCancel,
  }: {
    onUnlock: () => void;
    onCancel: () => void;
  }) => (
    <div data-testid="parent-gate">
      <button onClick={onUnlock}>Unlock</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

describe('Settings Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders ParentGate first', () => {
    render(<SettingsPage />);
    expect(screen.getByTestId('parent-gate')).toBeDefined();
    expect(screen.queryByText('⚙️ Settings')).toBeNull();
  });

  it('renders settings after unlocking ParentGate', () => {
    render(<SettingsPage />);
    fireEvent.click(screen.getByText('Unlock'));
    expect(screen.getByText('⚙️ Settings')).toBeDefined();
  });

  it('loads existing PIN from localStorage', () => {
    localStorage.setItem('tiny_museum_pin', '4321');
    render(<SettingsPage />);
    fireEvent.click(screen.getByText('Unlock'));

    const input = screen.getByPlaceholderText('No PIN set') as HTMLInputElement;
    expect(input.value).toBe('4321');
  });

  it('saves new PIN to localStorage', async () => {
    render(<SettingsPage />);
    fireEvent.click(screen.getByText('Unlock'));

    const input = screen.getByPlaceholderText('No PIN set') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '9876' } });

    const saveButton = screen.getByText('Save PIN');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(localStorage.getItem('tiny_museum_pin')).toBe('9876');
      expect(screen.getByText('Settings Saved! ✨')).toBeDefined();
    });
  });

  it('clears PIN from localStorage', async () => {
    localStorage.setItem('tiny_museum_pin', '1234');
    render(<SettingsPage />);
    fireEvent.click(screen.getByText('Unlock'));

    const clearButton = screen.getByText('Clear PIN');
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(localStorage.getItem('tiny_museum_pin')).toBeNull();
      expect(screen.getByText('Settings Saved! ✨')).toBeDefined();
    });
  });

  it('alerts if PIN is not exactly 4 digits', () => {
    window.alert = vi.fn();
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<SettingsPage />);
    fireEvent.click(screen.getByText('Unlock'));

    const input = screen.getByPlaceholderText('No PIN set') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '12' } }); // Only 2 digits

    const saveButton = screen.getByText('Save PIN');
    fireEvent.click(saveButton);

    expect(alertMock).toHaveBeenCalledWith('PIN must be exactly 4 digits');
    expect(localStorage.getItem('tiny_museum_pin')).toBeNull(); // Should not save

    alertMock.mockRestore();
  });
});
