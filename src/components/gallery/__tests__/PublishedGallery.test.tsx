import { render, screen, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PublishedGallery } from '../PublishedGallery';
import type { PublishedArtwork } from '@/lib/cloud/types';

describe('PublishedGallery', () => {
  it('renders images with object-cover and rounded-lg classes', async () => {
    const mockArtworks: PublishedArtwork[] = [
      {
        id: 'pub-1',
        title: 'Cloud Masterpiece',
        type: 'drawing',
        published_at: new Date('2026-03-22T10:00:00Z').toISOString(),
        updated_at: new Date('2026-03-22T10:00:00Z').toISOString(),
        image_url: 'https://example.com/art1.png',
        room_name: 'Gallery',
      },
    ];

    await act(async () => {
      render(<PublishedGallery artworks={mockArtworks} />);
    });

    // The image should have the correct alt text
    const image = screen.getByAltText('Cloud Masterpiece');

    // Verify object-cover and rounded-lg classes are present
    expect(image).toHaveClass('object-cover');
    expect(image).toHaveClass('rounded-lg');
  });

  it('renders a flipbook badge if type is flipbook', async () => {
    const mockArtworks: PublishedArtwork[] = [
      {
        id: 'pub-2',
        title: 'Cloud Animation',
        type: 'flipbook',
        published_at: new Date('2026-03-22T10:00:00Z').toISOString(),
        updated_at: new Date('2026-03-22T10:00:00Z').toISOString(),
        image_url: 'https://example.com/anim1.gif',
        room_name: 'Gallery',
      },
    ];

    await act(async () => {
      render(<PublishedGallery artworks={mockArtworks} />);
    });

    expect(screen.getByText('🎬')).toBeInTheDocument();
  });
});
