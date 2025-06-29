import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                dark: "var(--dark)",
                primary: "var(--primary)",
            },
            spacing: {
                'main': '500px',
                '500px': '500px',
            },
            borderRadius: {
                'normal': 'var(--corners)',
            },
        },

    },
    plugins: [],
};
export default config;
