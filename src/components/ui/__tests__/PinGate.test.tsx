import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PinGate } from '../PinGate';

vi.mock('@/components/ui/ParentGate', () => ({
  ParentGate: ({
    onUnlock,
    onCancel,
  }: {
    onUnlock: () => void;
    onCancel: () => void;
  }) => (
    <div data-testid="parent-gate">
      <button onClick={onUnlock}>Unlock Parent Gate</button>
      <button onClick={onCancel}>Cancel Parent Gate</button>
    </div>
  ),
}));

describe('PinGate Component', () => {
  const mockOnUnlock = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('unlocks immediately if no PIN is set', async () => {
    render(<PinGate onUnlock={mockOnUnlock} onCancel={mockOnCancel} />);
    expect(mockOnUnlock).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Studio Locked')).toBeNull();
  });

  it('shows PIN gate if PIN is set in localStorage', () => {
    localStorage.setItem('tiny_museum_pin', '1234');
    render(<PinGate onUnlock={mockOnUnlock} onCancel={mockOnCancel} />);
    expect(mockOnUnlock).not.toHaveBeenCalled();
    expect(screen.getByText('Studio Locked')).toBeDefined();
  });

  it('updates dots when buttons are clicked', () => {
    localStorage.setItem('tiny_museum_pin', '1234');
    render(<PinGate onUnlock={mockOnUnlock} onCancel={mockOnCancel} />);

    // Initially no dots are filled
    const dot0 = screen.getByTestId('pin-dot-0');
    expect(dot0.className).toContain('bg-transparent');

    fireEvent.click(screen.getByText('1'));
    expect(dot0.className).toContain('bg-kid-purple');
  });

  it('unlocks when correct PIN is entered', async () => {
    localStorage.setItem('tiny_museum_pin', '1234');
    render(<PinGate onUnlock={mockOnUnlock} onCancel={mockOnCancel} />);

    fireEvent.click(screen.getByText('1'));
    fireEvent.click(screen.getByText('2'));
    fireEvent.click(screen.getByText('3'));
    fireEvent.click(screen.getByText('4'));

    await waitFor(() => {
      expect(mockOnUnlock).toHaveBeenCalledTimes(1);
    });
  });

  it('shows error state when incorrect PIN is entered', async () => {
    localStorage.setItem('tiny_museum_pin', '1234');
    render(<PinGate onUnlock={mockOnUnlock} onCancel={mockOnCancel} />);

    fireEvent.click(screen.getByText('1'));
    fireEvent.click(screen.getByText('1'));
    fireEvent.click(screen.getByText('1'));
    fireEvent.click(screen.getByText('1'));

    await waitFor(() => {
      expect(mockOnUnlock).not.toHaveBeenCalled();
      const dot0 = screen.getByTestId('pin-dot-0');
      expect(dot0.className).toContain('border-kid-red'); // Error state
    });
  });

  it('deletes last digit when DEL is clicked', () => {
    localStorage.setItem('tiny_museum_pin', '1234');
    render(<PinGate onUnlock={mockOnUnlock} onCancel={mockOnCancel} />);

    fireEvent.click(screen.getByText('1'));
    fireEvent.click(screen.getByText('DEL'));

    const dot0 = screen.getByTestId('pin-dot-0');
    expect(dot0.className).toContain('bg-transparent');
  });

  it('shows ParentGate when Forgot PIN is clicked', () => {
    localStorage.setItem('tiny_museum_pin', '1234');
    render(<PinGate onUnlock={mockOnUnlock} onCancel={mockOnCancel} />);

    fireEvent.click(screen.getByText('Forgot PIN? 🤔'));
    expect(screen.getByTestId('parent-gate')).toBeDefined();
  });

  it('unlocks when ParentGate is passed', async () => {
    localStorage.setItem('tiny_museum_pin', '1234');
    render(<PinGate onUnlock={mockOnUnlock} onCancel={mockOnCancel} />);

    fireEvent.click(screen.getByText('Forgot PIN? 🤔'));
    fireEvent.click(screen.getByText('Unlock Parent Gate'));

    expect(mockOnUnlock).toHaveBeenCalledTimes(1);
  });
});
