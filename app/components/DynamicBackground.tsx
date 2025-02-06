import {useCallback} from 'react'
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { RecursivePartial, Options } from "tsparticles-engine";

export default function DynamicBackground() {
    const particlesInit = useCallback(async (engine) => {
        await loadFull(engine);
      }, []);

    const particlesOptions: RecursivePartial<Options> = {
      background: {
        color: {
          value: "transparent",
        },
      },
      particles: {
        number: {
          value: 100,
          density: {
            enable: true,
            area: 800,
          },
        },
        color: {
          value: ["#b2b2b2"],
        },
        shape: {
          type: "edge",
        },
        opacity: {
          value: 0.8,
          random: {
            enable: true,
            minimumValue: 0.3,
          },
          animation: {
            enable: true,
            speed: 1,
            sync: false,
          },
        },
        size: {
          value: 5,
          random: {
            enable: true,
            minimumValue: 0.5,
          },
          animation: {
            enable: true,
            speed: 2,
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
          outModes: {
            default: "out"
          },
          attract: {
            enable: true,
            rotateX: 600,
            rotateY: 1200,
          },
        },
      },
      interactivity: {
        detectOn: "canvas",
        events: {
          onHover: {
            enable: true,
            mode: "grab",
          },
          onClick: {
            enable: true,
            mode: "push",
          },
          resize: {
            enable: true
          },
        },
        modes: {
          grab: {
            distance: 200,
            links: {
              opacity: 0.7,
            },
          },
          push: {
            quantity: 2,
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