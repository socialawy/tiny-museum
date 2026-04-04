import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { InstallPrompt } from '../InstallPrompt';

describe('InstallPrompt', () => {
  beforeEach(() => {
    // Reset local storage
    localStorage.clear();

    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false, // Default to not standalone
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    // Mock navigator userAgent
    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      configurable: true,
    });

    Object.defineProperty(document, 'referrer', {
      value: '',
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders nothing initially when conditions are not met', () => {
    render(<InstallPrompt />);
    expect(screen.queryByText('Add to Home Screen!')).not.toBeInTheDocument();
  });

  it('shows iOS instructions when on iOS device', () => {
    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3 like Mac OS X)',
      configurable: true,
    });

    act(() => {
      render(<InstallPrompt />);
    });

    expect(screen.getByText('Add to Home Screen!')).toBeInTheDocument();
    expect(
      screen.getByText(/Tap the share button and choose 'Add to Home Screen'/),
    ).toBeInTheDocument();
    expect(screen.queryByText('Install!')).not.toBeInTheDocument(); // Install button is hidden on iOS
  });

  it('shows Android/Chrome install prompt when beforeinstallprompt fires', async () => {
    render(<InstallPrompt />);

    const event = new Event('beforeinstallprompt') as Event & {
      prompt: () => void;
      userChoice: Promise<{ outcome: string; platform: string }>;
    };
    event.prompt = vi.fn();
    event.userChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' });

    await act(async () => {
      fireEvent(window, event);
    });

    expect(screen.getByText('Add to Home Screen!')).toBeInTheDocument();
    expect(
      screen.getByText(/Install Mira's Museum to play like an app!/),
    ).toBeInTheDocument();
    expect(screen.getByText('Install!')).toBeInTheDocument();
  });

  it('hides the prompt when dismissed and sets localStorage flag', async () => {
    render(<InstallPrompt />);

    const event = new Event('beforeinstallprompt');
    act(() => {
      fireEvent(window, event);
    });

    const laterButton = screen.getByText('Later');
    act(() => {
      fireEvent.click(laterButton);
    });

    expect(screen.queryByText('Add to Home Screen!')).not.toBeInTheDocument();
    expect(localStorage.getItem('pwa_prompt_dismissed')).toBe('true');
  });

  it('does not show if previously dismissed', async () => {
    localStorage.setItem('pwa_prompt_dismissed', 'true');

    render(<InstallPrompt />);

    const event = new Event('beforeinstallprompt');
    act(() => {
      fireEvent(window, event);
    });

    expect(screen.queryByText('Add to Home Screen!')).not.toBeInTheDocument();
  });

  it('does not show if already running in standalone mode', async () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: query === '(display-mode: standalone)',
        media: query,
      })),
    });

    render(<InstallPrompt />);

    const event = new Event('beforeinstallprompt');
    act(() => {
      fireEvent(window, event);
    });

    expect(screen.queryByText('Add to Home Screen!')).not.toBeInTheDocument();
  });

  it('calls prompt on the event when Install is clicked', async () => {
    render(<InstallPrompt />);

    const event = new Event('beforeinstallprompt') as Event & {
      prompt: () => void;
      userChoice: Promise<{ outcome: string; platform: string }>;
    };
    event.prompt = vi.fn();
    event.userChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' });

    act(() => {
      fireEvent(window, event);
    });

    const installButton = screen.getByText('Install!');
    await act(async () => {
      fireEvent.click(installButton);
    });

    // wait for promise to resolve to suppress unhandled state update warning in tests
    await act(async () => {
      await event.userChoice;
    });

    expect(event.prompt).toHaveBeenCalled();
  });
});
