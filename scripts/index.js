lucide.createIcons();

(function () {
  const html = document.documentElement;
  const toggle = document.getElementById('theme-toggle');
  const sun = document.getElementById('theme-sun');
  const moon = document.getElementById('theme-moon');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  function setTheme(dark) {
    if (dark) {
      html.setAttribute('data-theme', 'dark');
      if (sun) sun.style.display = '';
      if (moon) moon.style.display = 'none';
      localStorage.setItem('theme', 'dark');
    } else {
      html.setAttribute('data-theme', 'light');
      if (sun) sun.style.display = 'none';
      if (moon) moon.style.display = '';
      localStorage.setItem('theme', 'light');
    }
  }

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    setTheme(savedTheme === 'dark');
  } else {
    setTheme(prefersDark.matches);
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      const isDark = html.getAttribute('data-theme') === 'dark';
      setTheme(!isDark);
      if (typeof AppAnimations !== 'undefined') AppAnimations.animatePop(toggle);
    });
  }

  prefersDark.addEventListener('change', function (e) {
    if (!localStorage.getItem('theme')) {
      setTheme(e.matches);
    }
  });

  // Entrance & Hover Animations with Anime.js
  document.addEventListener('DOMContentLoaded', () => {
    if (typeof AppAnimations !== 'undefined') {
      AppAnimations.animateFadeInDown('.hero-title, .hero-subtitle');
      AppAnimations.animateStaggerEntrance('.card', { duration: 700, translateY: 30 });
    }

    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        if (typeof AppAnimations !== 'undefined') AppAnimations.animateHoverIn(card);
      });
      card.addEventListener('mouseleave', () => {
        if (typeof AppAnimations !== 'undefined') AppAnimations.animateHoverOut(card);
      });
    });
  });
})();
