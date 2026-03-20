import dynamic from 'next/dynamic';

// Fabric.js requires DOM — no SSR
const StudioCanvas = dynamic(
    () => import('@/components/canvas/StudioCanvas'),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <p className="text-5xl mb-3 animate-bounce">🎨</p>
                    <p className="text-xl font-bold text-kid-purple">
                        Opening Studio...
                    </p>
                </div>
            </div>
        ),
    }
);

export default function StudioCanvasPage() {
    return (
        <div className="h-full studio-active">
            <StudioCanvas />
        </div>
    );
}