import Link from 'next/link';

export default function HomePage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-full px-6 py-12 text-center">
            {/* Museum entrance */}
            <div className="mb-8">
                <h1 className="text-5xl font-extrabold mb-2">
                    🏛️
                </h1>
                <h2
                    className="text-3xl font-extrabold"
                    style={{ color: '#2D1B69' }}
                >
                    Tiny Museum
                </h2>
                <p className="text-lg mt-2 text-gray-500 font-semibold">
                    Your art. Your museum.
                </p>
            </div>

            {/* Two big doors */}
            <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md">
                <Link
                    href="/gallery"
                    className="flex-1 flex flex-col items-center gap-3 p-8 rounded-kid
                     bg-museum-wall border-4 border-museum-frame
                     hover:scale-105 active:scale-95
                     transition-transform duration-150 no-underline"
                >
                    <span className="text-5xl">🖼️</span>
                    <span className="text-xl font-bold text-museum-plaque">
                        Gallery
                    </span>
                    <span className="text-sm text-gray-500">
                        Explore your art
                    </span>
                </Link>

                <Link
                    href="/studio/canvas"
                    className="flex-1 flex flex-col items-center gap-3 p-8 rounded-kid
                     bg-studio-bg border-4 border-kid-purple
                     hover:scale-105 active:scale-95
                     transition-transform duration-150 no-underline"
                >
                    <span className="text-5xl">🎨</span>
                    <span className="text-xl font-bold text-kid-purple">
                        Studio
                    </span>
                    <span className="text-sm text-gray-500">
                        Create something new
                    </span>
                </Link>
            </div>
        </div>
    );
}