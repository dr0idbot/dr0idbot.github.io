/* Reusable Anime.js Animations (Transforms & Easings Only) */

const AppAnimations = {
  // Staggered entrance animation for cards/grid items
  animateStaggerEntrance: function (targets, options = {}) {
    if (typeof anime === 'undefined') return;
    const elements = typeof targets === 'string' ? document.querySelectorAll(targets) : targets;
    if (!elements || elements.length === 0) return;

    anime({
      targets: elements,
      translateY: [options.translateY || 30, 0],
      opacity: [0, 1],
      scale: [options.scale || 0.95, 1],
      easing: options.easing || 'easeOutExpo',
      duration: options.duration || 800,
      delay: anime.stagger(options.delay || 80, { start: options.startDelay || 100 })
    });
  },

  // Pop/Bounce animation for buttons and interactive elements
  animatePop: function (target, options = {}) {
    if (typeof anime === 'undefined') return;
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (!element) return;

    anime({
      targets: element,
      scale: [0.92, 1.05, 1],
      rotate: options.rotate ? [-3, 3, 0] : 0,
      easing: 'easeOutElastic(1, .5)',
      duration: 600
    });
  },

  // Card hover scale transform
  animateHoverIn: function (element) {
    if (typeof anime === 'undefined' || !element) return;
    anime.remove(element);
    anime({
      targets: element,
      translateY: -6,
      scale: 1.02,
      easing: 'easeOutCubic',
      duration: 250
    });
  },

  animateHoverOut: function (element) {
    if (typeof anime === 'undefined' || !element) return;
    anime.remove(element);
    anime({
      targets: element,
      translateY: 0,
      scale: 1,
      easing: 'easeOutCubic',
      duration: 250
    });
  },

  // Page header / section title fade in
  animateFadeInDown: function (targets) {
    if (typeof anime === 'undefined') return;
    const elements = typeof targets === 'string' ? document.querySelectorAll(targets) : targets;
    if (!elements || elements.length === 0) return;

    anime({
      targets: elements,
      translateY: [-20, 0],
      opacity: [0, 1],
      easing: 'easeOutCubic',
      duration: 700,
      delay: anime.stagger(60)
    });
  },

  // Pulse/shake transform for feedback
  animatePulse: function (target) {
    if (typeof anime === 'undefined') return;
    anime({
      targets: target,
      scale: [1, 1.08, 1],
      easing: 'easeInOutQuad',
      duration: 350
    });
  }
};
