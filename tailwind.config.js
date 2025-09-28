module.exports = {
    theme: {
        extend: {
            colors: {
                peach: '#FFBBA4',
            },
            animation: {
                'spin-slow': 'spin 1.5s linear infinite',
                'spin-reverse-slow': 'spin-reverse 1.5s linear infinite',
            },
            keyframes: {
                'spin-reverse': {
                    from: { transform: 'rotate(360deg)' },
                    to: { transform: 'rotate(0deg)' },
                },
            },
        },
    },
    plugins: [],
}
  