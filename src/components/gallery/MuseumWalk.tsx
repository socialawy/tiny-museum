'use client';

import { useRef } from 'react';
import type { Artwork } from '@/lib/storage/db';
import { ArtworkCard } from './ArtworkCard';

interface MuseumWalkProps {
    artworks: Artwork[];
    onArtworkTap: (id: string) => void;
}

export function MuseumWalk({ artworks, onArtworkTap }: MuseumWalkProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    if (artworks.length === 0) {
        return (
            <div className="museum-walk justify-center">
                <div className="text-center px-8">
                    <p className="text-5xl mb-4">🖼️</p>
                    <p className="text-xl font-bold text-museum-plaque">
                        This room is waiting for art!
                    </p>
                    <p className="text-gray-500 mt-2">
                        Go to the Studio and create something amazing
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div ref={scrollRef} className="museum-walk">
            {/* Leading spacer for centered first item */}
            <div className="flex-shrink-0 w-8" />

            {artworks.map((artwork) => (
                <div
                    key={artwork.id}
                    style={{ scrollSnapAlign: 'center' }}
                >
                    <ArtworkCard
                        artwork={artwork}
                        size="walk"
                        onClick={() => onArtworkTap(artwork.id)}
                    />
                </div>
            ))}

            {/* Trailing spacer */}
            <div className="flex-shrink-0 w-8" />
        </div>
    );
}