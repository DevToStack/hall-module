'use client';
import { useEffect, useRef } from 'react';

const SnowfallCanvasBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        let snowflakes = Array.from({ length: 200 }).map(() => ({
            x: Math.random() * width,
            y: Math.random() * height,
            r: Math.random() * 3 + 1,
            d: Math.random() * 1 + 0.5
        }));

        const draw = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            for (let flake of snowflakes) {
                ctx.moveTo(flake.x, flake.y);
                ctx.arc(flake.x, flake.y, flake.r, 0, Math.PI * 2);
            }
            ctx.fill();
            update();
        };

        const update = () => {
            for (let flake of snowflakes) {
                flake.y += flake.d;
                if (flake.y > height) {
                    flake.y = 0;
                    flake.x = Math.random() * width;
                }
            }
        };

        const loop = () => {
            draw();
            requestAnimationFrame(loop);
        };

        loop();

        const resize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);

        return () => window.removeEventListener('resize', resize);
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-0 pointer-events-none"
        />
    );
};

export default SnowfallCanvasBackground;
