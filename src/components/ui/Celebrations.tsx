'use client';

import { useUIStore } from '@/stores/ui.store';
import { useEffect, useState } from 'react';

interface Particle {
    id: number;
    emoji: string;
    x: number;
    delay: number;
    duration: number;
}

const EMOJIS = ['⭐', '🌟', '✨', '🎨', '🎉', '💜', '💛', '🩵'];

export function Celebrations() {
    const celebrating = useUIStore((s) => s.celebrating);
    const [particles, setParticles] = useState<Particle[]>([]);

    useEffect(() => {
        if (!celebrating) {
            setParticles([]);
            return;
        }

        const newParticles: Particle[] = Array.from({ length: 20 }, (_, i) => ({
            id: i,
            emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
            x: Math.random() * 100,
            delay: Math.random() * 0.5,
            duration: 1 + Math.random() * 1.5,
        }));
        setParticles(newParticles);
    }, [celebrating]);

    if (!celebrating || particles.length === 0) return null;

    return (
        <div
            className="fixed inset-0 pointer-events-none z-[9999]"
            aria-hidden="true"
        >
            {particles.map((p) => (
                <span
                    key={p.id}
                    className="absolute text-2xl"
                    style={{
                        left: `${p.x}%`,
                        top: '-10%',
                        animation: `celebrateFall ${p.duration}s ease-in ${p.delay}s forwards`,
                    }}
                >
                    {p.emoji}
                </span>
            ))}

            <style>{`
        @keyframes celebrateFall {
          0% {
            transform: translateY(0) rotate(0deg) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
            transform: translateY(10vh) rotate(45deg) scale(1.2);
          }
          100% {
            transform: translateY(110vh) rotate(360deg) scale(0.5);
            opacity: 0;
          }
        }
      `}</style>
        </div>
    );
}