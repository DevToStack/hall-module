import { useCallback, useMemo } from 'react';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';

const HeroParticlesBackground = () => {
    const particlesInit = useCallback(async (engine) => {
        await loadSlim(engine);
    }, []);

    const options = useMemo(() => ({
        fullScreen: {
          enable: false, // Important: keep it scoped to hero
        },
        background: {
          color: {
            value: 'transparent',
          },
        },
        particles: {
          number: {
            value: 45,
            density: {
              enable: true,
              area: 800,
            },
          },
          color: {
            value: ['#192949', '#c2e6ff', '#fc466b'], // varied theme tones
          },
          shape: {
            type: ['circle', 'triangle', 'edge'], // multiple shapes
          },
          opacity: {
            value: 0.6,
            random: true,
            anim: {
              enable: true,
              speed: 1,
              opacity_min: 0.1,
              sync: false,
            },
          },
          size: {
            value: { min: 4, max: 8 },
            random: true,
          },
          move: {
            enable: true,
            speed: 1.7,
            direction: 'none',
            random: true,
            straight: false,
            outModes: {
              default: 'out',
            },
          },
          links: {
            enable: true,
            distance:300,
            color: '#0070ff',
            opacity: 0.6,
            width: 2,
          },
          rotate: {
            value: { min: 0, max: 360 },
            direction: "random",
            animation: {
              enable: true,
              speed: 9,
            },
          },
          wobble: {
            enable: true,
            distance: 5,
            speed: 2,
          },
        },
        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: 'grab',
            },
          },
          modes: {
            grab: {
              distance: 300,
              links: {
                opacity: 0.5,
              },
            },
          },
        },
      }), []);
      

    return (
        <Particles
            init={particlesInit}
            options={options}
            className="w-full h-full"
        />
    );
};

export default HeroParticlesBackground;
