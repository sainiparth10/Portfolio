/* ========================================================================
   particles-config.js — tsParticles configuration
   ======================================================================== */

const particlesConfig = {
  fullScreen: false,
  background: { color: { value: "transparent" } },
  fpsLimit: 60,
  interactivity: {
    events: {
      onHover: {
        enable: true,
        mode: "grab"
      },
      onClick: {
        enable: true,
        mode: "push"
      },
      resize: true
    },
    modes: {
      grab: {
        distance: 150,
        links: { opacity: 0.4 }
      },
      push: { quantity: 3 }
    }
  },
  particles: {
    color: { value: ["#00d4ff", "#7b2ff7", "#ff2d75"] },
    links: {
      color: "#00d4ff",
      distance: 130,
      enable: true,
      opacity: 0.15,
      width: 1
    },
    move: {
      enable: true,
      speed: 1.2,
      direction: "none",
      random: true,
      straight: false,
      outModes: { default: "bounce" }
    },
    number: {
      density: { enable: true, area: 900 },
      value: 70
    },
    opacity: {
      value: { min: 0.15, max: 0.5 },
      animation: {
        enable: true,
        speed: 0.8,
        minimumValue: 0.1,
        sync: false
      }
    },
    shape: { type: "circle" },
    size: {
      value: { min: 1, max: 3 },
      animation: {
        enable: true,
        speed: 2,
        minimumValue: 0.5,
        sync: false
      }
    }
  },
  detectRetina: true
};
