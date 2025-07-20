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
            value: 40,
            density: {
              enable: true,
              area: 800,
            },
          },
          color: {
            value: ['#192949', '#3f5efb', '#fc466b'], // varied theme tones
          },
          shape: {
            type: ['circle', 'triangle', 'edge'], // multiple shapes
          },
          opacity: {
            value: 0.6,
            random: true,
            anim: {
              enable: true,
              speed: 0.5,
              opacity_min: 0.1,
              sync: false,
            },
          },
          size: {
            value: { min: 2, max: 6 },
            random: true,
          },
          move: {
            enable: true,
            speed: 1,
            direction: 'none',
            random: true,
            straight: false,
            outModes: {
              default: 'out',
            },
          },
          links: {
            enable: true,
            distance: 130,
            color: '#ffffff',
            opacity: 0.4,
            width: 2,
          },
          rotate: {
            value: { min: 0, max: 360 },
            direction: "random",
            animation: {
              enable: true,
              speed: 5,
            },
          },
          wobble: {
            enable: true,
            distance: 5,
            speed: 1,
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
              distance: 100,
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
