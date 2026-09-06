// Movies & Shows Page Implementation - JSON Backed Model

// Shared Theme Logic
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
    });
  }

  prefersDark.addEventListener('change', function (e) {
    if (!localStorage.getItem('theme')) {
      setTheme(e.matches);
    }
  });
})();

// Default Fallback Dataset (if JSON fetch restricted)
const DEFAULT_MOVIES_DATA = [
  {
    "id": 1,
    "name": "Pokémon: The First Movie - Mewtwo Strikes Back",
    "poster": "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80",
    "category": "Movie",
    "year": 1998,
    "rating": "9.5 / 10",
    "tags": ["Anime", "Classics", "Nostalgic"]
  },
  {
    "id": 2,
    "name": "Pokémon: Detective Pikachu",
    "poster": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80",
    "category": "Movie",
    "year": 2019,
    "rating": "9.0 / 10",
    "tags": ["Live Action", "Mystery", "Comedy"]
  },
  {
    "id": 3,
    "name": "Pokémon: Lucario and the Mystery of Mew",
    "poster": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
    "category": "Movie",
    "year": 2005,
    "rating": "9.2 / 10",
    "tags": ["Adventure", "Emotional", "Lucario"]
  },
  {
    "id": 4,
    "name": "Pokémon: Indigo League",
    "poster": "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80",
    "category": "TV Series",
    "year": 1997,
    "rating": "9.8 / 10",
    "tags": ["Series", "Kanto", "Origin"]
  },
  {
    "id": 5,
    "name": "Pokémon Horizons: The Series",
    "poster": "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
    "category": "TV Series",
    "year": 2023,
    "rating": "9.0 / 10",
    "tags": ["New Era", "Liko & Roy", "Adventure"]
  }
];

let moviesData = [...DEFAULT_MOVIES_DATA];
let activeCategory = 'all';
let searchQuery = '';

// Fetch Data from movies.json
async function loadMoviesJSON() {
  try {
    const res = await fetch('movies.json');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        moviesData = data;
      }
    }
  } catch (err) {
    console.log('Using default dataset due to fetch restriction:', err);
  }
  renderMoviesList();
}

// Render Movies Grid
function renderMoviesList() {
  const grid = document.getElementById('movies-grid');
  if (!grid) return;

  const filtered = moviesData.filter(item => {
    const isTV = item.category.toLowerCase().includes('series') || item.category.toLowerCase().includes('tv');
    const itemCatKey = isTV ? 'series' : 'movie';
    const matchesCategory = activeCategory === 'all' || itemCatKey === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery) || String(item.year).includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  grid.innerHTML = '';

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--color-subtext-0);">
        <p>No movies or shows found matching your filter.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(item => {
    const card = document.createElement('article');
    card.className = 'movie-card';

    const isTV = item.category.toLowerCase().includes('series') || item.category.toLowerCase().includes('tv');
    const typeBadgeClass = isTV ? 'badge-type tv' : 'badge-type';

    const tagsHtml = (item.tags || [])
      .map(t => `<span class="tag-item">${t}</span>`)
      .join(' ');

    card.innerHTML = `
      <div class="movie-poster-wrap">
        <img src="${item.poster}" alt="${item.name}" loading="lazy">
        <span class="${typeBadgeClass}">${item.category}</span>
        <span class="badge-year">${item.year}</span>
      </div>
      <div class="movie-info">
        <h3 class="movie-title-text">${item.name}</h3>
        <div class="movie-meta-row">
          <div class="rating-badge">
            <i data-lucide="star"></i>
            <span>${item.rating}</span>
          </div>
          <div class="tags-row">${tagsHtml}</div>
        </div>
      </div>
    `;

    // Anime.js hover scale bindings
    card.addEventListener('mouseenter', () => {
      if (typeof AppAnimations !== 'undefined') AppAnimations.animateHoverIn(card);
    });
    card.addEventListener('mouseleave', () => {
      if (typeof AppAnimations !== 'undefined') AppAnimations.animateHoverOut(card);
    });

    grid.appendChild(card);
  });

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Stagger entrance transform animation
  if (typeof AppAnimations !== 'undefined') {
    AppAnimations.animateStaggerEntrance('.movie-card', { duration: 600, translateY: 24 });
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  const tabs = document.querySelectorAll('.tab-btn');
  const searchInput = document.getElementById('movies-search-input');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeCategory = tab.dataset.category;
      if (typeof AppAnimations !== 'undefined') AppAnimations.animatePop(tab);
      renderMoviesList();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderMoviesList();
    });
  }

  if (typeof AppAnimations !== 'undefined') {
    AppAnimations.animateFadeInDown('.movies-title');
  }

  loadMoviesJSON();
});
