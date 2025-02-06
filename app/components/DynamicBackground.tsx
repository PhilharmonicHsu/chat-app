import {useCallback} from 'react'
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

export default function DynamicBackground() {
    const particlesInit = useCallback(async (engine) => {
        console.log(engine)
        await loadFull(engine);
      }, []);

      const particlesOptions = {
        background: {
          color: {
            value: "transparent",
          },
        },
        particles: {
          number: {
            value: 100, // Number of particles
            density: {
              enable: true,
              value_area: 800, // Particle density control range
            },
          },
          color: {
            value: ["#b2b2b2"],
          },
          shape: {
            type: "edge", // can be  "circle", "edge", "triangle", "star"
          },
          opacity: {
            value: 0.8,
            random: true,
            anim: {
              enable: true,
              speed: 1,
              opacity_min: 0.3,
              sync: false,
            },
          },
          size: {
            value: 5,
            random: true,
            anim: {
              enable: true,
              speed: 2,
              size_min: 0.5,
              sync: false,
            },
          },
          links: {
            enable: true,
            distance: 150,
            color: "#ffffff",
            opacity: 0.4,
            width: 1,
          },
          move: {
            enable: true,
            speed: 2,
            direction: "none",
            random: false,
            straight: false,
            out_mode: "out",
            attract: {
              enable: true,
              rotateX: 600,
              rotateY: 1200,
            },
          },
        },
        interactivity: {
          detect_on: "canvas",
          events: {
            onhover: {
              enable: true,
              mode: "grab",
            },
            onclick: {
              enable: true,
              mode: "push",
            },
            resize: true,
          },
          modes: {
            grab: {
              distance: 200,
              line_linked: {
                opacity: 0.7,
              },
            },
            push: {
              particles_nb: 2,
            },
          },
        },
        retina_detect: true,
      };

    return <Particles
            id="tsparticles"
            init={particlesInit}
            options={particlesOptions}
            className="absolute top-0 left-0 w-full h-full z-[1]"
          />
}