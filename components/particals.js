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
            value: 'green',
          },
        },
        particles: {
          number: {
            value: 30,
            density: {
              enable: true,
              area: 800,
            },
          },
          color: {
            value: ['#ffffff'], // varied theme tones
          },
          shape: {
            type: ['circle'], // multiple shapes
          },
          opacity: {
            value: 0.5,
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
            speed: 1,
            direction: 'none',
            random: false,
            straight: true,
            outModes: {
              default: 'out',
            },
          },
          links: {
            enable: true,
            distance:300,
            color: '#ffffff',
            opacity: 0.6,
            width: 2,
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
