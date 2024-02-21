/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                'logo-blue': '#0d66ec',
            },
            width: {
                '5.88/12': '49%',
            }
        },
    },
    plugins: [
        require('flowbite/plugin')
    ],
}