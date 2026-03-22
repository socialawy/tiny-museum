import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ArtworkCard } from '../ArtworkCard';
import type { Artwork } from '@/lib/storage/db';

describe('ArtworkCard', () => {
  beforeEach(() => {
    // Mock URL.createObjectURL and URL.revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => 'blob:mocked-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  it('renders image with object-cover and rounded-lg classes', async () => {
    const mockArtwork: Artwork = {
      id: 'art-1',
      title: 'My Masterpiece',
      roomId: 'room-1',
      canvasJSON: '{}',
      thumbnail: new Blob(['mock image data'], { type: 'image/png' }),
      createdAt: new Date('2026-03-22T10:00:00Z').getTime(),
      updatedAt: new Date('2026-03-22T10:00:00Z').getTime(),
      type: 'drawing',
      tags: [],
    };

    await act(async () => {
      render(<ArtworkCard artwork={mockArtwork} />);
    });

    // The image should have the correct alt text
    const image = screen.getByAltText('My Masterpiece');

    // Verify object-cover and rounded-lg classes are present
    expect(image).toHaveClass('object-cover');
    expect(image).toHaveClass('rounded-lg');
  });

  it('renders a flipbook badge if type is flipbook', async () => {
    const mockArtwork: Artwork = {
      id: 'art-2',
      title: 'Animation',
      roomId: 'room-1',
      canvasJSON: '{}',
      thumbnail: new Blob(['mock image data'], { type: 'image/png' }),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      type: 'flipbook',
      tags: [],
    };

    await act(async () => {
      render(<ArtworkCard artwork={mockArtwork} />);
    });

    expect(screen.getByText('🎬')).toBeInTheDocument();
  });
});
