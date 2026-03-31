import { render } from '@testing-library/react';
import RootLayout from '../layout';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@vercel/analytics/next', () => ({
  Analytics: () => <div data-testid="vercel-analytics" />,
}));

vi.mock('@vercel/speed-insights/next', () => ({
  SpeedInsights: () => <div data-testid="vercel-speed-insights" />,
}));

vi.mock('next/font/google', () => ({
  Nunito: () => ({
    variable: 'mock-nunito-font',
  }),
}));

vi.mock('@/components/ui/Celebrations', () => ({
  Celebrations: () => <div data-testid="celebrations" />,
}));

vi.mock('@/components/ui/DemoSeederTrigger', () => ({
  DemoSeederTrigger: () => <div data-testid="demo-seeder" />,
}));

vi.mock('@/components/pwa/ServiceWorkerRegister', () => ({
  ServiceWorkerRegister: () => <div data-testid="sw-register" />,
}));

describe('RootLayout', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    document.documentElement.innerHTML = '';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('does not render Analytics and SpeedInsights when not in production', () => {
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'development',
      configurable: true,
    });

    const { queryByTestId } = render(
      <RootLayout>
        <div data-testid="child">App Content</div>
      </RootLayout>,
      { container: document },
    );

    expect(queryByTestId('child')).toBeInTheDocument();
    expect(queryByTestId('vercel-analytics')).not.toBeInTheDocument();
    expect(queryByTestId('vercel-speed-insights')).not.toBeInTheDocument();
  });

  it('renders Analytics and SpeedInsights when in production', () => {
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'production',
      configurable: true,
    });

    const { getByTestId } = render(
      <RootLayout>
        <div data-testid="child">App Content</div>
      </RootLayout>,
      { container: document },
    );

    expect(getByTestId('child')).toBeInTheDocument();
    expect(getByTestId('vercel-analytics')).toBeInTheDocument();
    expect(getByTestId('vercel-speed-insights')).toBeInTheDocument();
  });
});
