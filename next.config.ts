import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    reactStrictMode: true,

    // Fabric.js uses node APIs in some paths — keep it client-only
    webpack: (config, { isServer }) => {
        if (isServer) {
            // Prevent fabric from being bundled server-side
            config.externals = config.externals || [];
        }
        // Handle canvas native module (not needed in browser)
        config.resolve.alias = {
            ...config.resolve.alias,
            canvas: false,
        };
        return config;
    },
};

export default nextConfig;