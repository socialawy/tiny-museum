import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './src/**/*.{ts,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                museum: {
                    wall: '#F5E6D3',
                    'wall-deep': '#E8D5BE',
                    frame: '#8B6914',
                    plaque: '#2D1B69',
                    canvas: '#FFFEF7',
                },
                studio: {
                    bg: '#F0F4FF',
                    toolbar: '#FFFFFF',
                    active: '#FECA57',
                },
                kid: {
                    red: '#FF6B6B',
                    orange: '#FF8E53',
                    yellow: '#FECA57',
                    blue: '#48DBFB',
                    purple: '#6C5CE7',
                    lavender: '#A29BFE',
                    pink: '#FD79A8',
                    green: '#00B894',
                    dark: '#2D3436',
                    white: '#FDFDFD',
                    coral: '#E17055',
                    teal: '#81ECEC',
                },
            },
            fontFamily: {
                display: ['Nunito', 'sans-serif'],
                body: ['Nunito', 'sans-serif'],
            },
            spacing: {
                'touch-min': '48px',
                'touch': '56px',
                'touch-lg': '64px',
            },
            borderRadius: {
                'kid': '16px',
            },
        },
    },
    plugins: [],
};

export default config;