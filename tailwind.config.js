/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                barber: {
                    red: '#8B0000',      // Deep red
                    gold: '#D4AF37',     // Classic gold
                    brown: '#8B4513',    // Saddle brown
                    cream: '#FFFDD0',    // Cream
                    dark: '#1A1A1A',     // Almost black
                },
            },
            fontFamily: {
                display: ['Playfair Display', 'serif'],
                body: ['Roboto', 'sans-serif'],
            },
            backgroundImage: {
                'barber-pattern': "url('/images/barber-pattern.png')",
            },
        },
    },
    plugins: [],
} 