// Pokédex Single Random Pokémon Implementation with Rich Details & Dynamic Color Shadows

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

// Type Shadow & Glow Color Mapping
const TYPE_COLOR_MAP = {
  fire: 'rgba(248, 113, 113, 0.65)',
  water: 'rgba(96, 165, 250, 0.65)',
  grass: 'rgba(74, 222, 128, 0.65)',
  electric: 'rgba(250, 204, 21, 0.75)',
  psychic: 'rgba(236, 72, 153, 0.65)',
  poison: 'rgba(168, 85, 247, 0.65)',
  dragon: 'rgba(99, 102, 241, 0.65)',
  ice: 'rgba(56, 189, 248, 0.65)',
  ghost: 'rgba(129, 140, 248, 0.65)',
  fairy: 'rgba(244, 114, 182, 0.65)',
  fighting: 'rgba(251, 146, 60, 0.65)',
  ground: 'rgba(245, 158, 11, 0.65)',
  rock: 'rgba(217, 119, 6, 0.65)',
  bug: 'rgba(163, 230, 53, 0.65)',
  steel: 'rgba(148, 163, 184, 0.65)',
  dark: 'rgba(107, 114, 128, 0.65)',
  normal: 'rgba(156, 163, 175, 0.65)',
  flying: 'rgba(167, 139, 250, 0.65)'
};

// Built-in fallback Pokémon dataset with rich details
const FALLBACK_POKEMON = [
  {
    id: 1,
    name: 'bulbasaur',
    category: 'Seed Pokémon',
    types: ['grass', 'poison'],
    height: 7,
    weight: 69,
    abilities: ['Overgrow', 'Chlorophyll (Hidden)'],
    baseExperience: 64,
    captureRate: '45 / 255',
    generation: 'Gen I',
    habitat: 'Grassland',
    eggGroups: ['Monster', 'Grass'],
    flavorText: 'A strange seed was planted on its back at birth. The plant sprouts and grows with this Pokémon.',
    isLegendary: false,
    isMythical: false,
    moves: ['Tackle', 'Vine Whip', 'Leech Seed', 'Razor Leaf', 'Solar Beam', 'Toxic'],
    stats: { hp: 45, attack: 49, defense: 49, spAtk: 65, spDef: 65, speed: 45 },
    imageNormal: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
    imageShiny: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/1.png',
    cryUrl: 'https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/1.ogg'
  },
  {
    id: 6,
    name: 'charizard',
    category: 'Flame Pokémon',
    types: ['fire', 'flying'],
    height: 17,
    weight: 905,
    abilities: ['Blaze', 'Solar Power (Hidden)'],
    baseExperience: 267,
    captureRate: '45 / 255',
    generation: 'Gen I',
    habitat: 'Mountain',
    eggGroups: ['Monster', 'Dragon'],
    flavorText: 'It spits fire that is hot enough to melt boulders. It may cause forest fires by blowing flames.',
    isLegendary: false,
    isMythical: false,
    moves: ['Flamethrower', 'Dragon Claw', 'Air Slash', 'Fire Blast', 'Wing Attack', 'Overheat'],
    stats: { hp: 78, attack: 84, defense: 78, spAtk: 109, spDef: 85, speed: 100 },
    imageNormal: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
    imageShiny: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/6.png',
    cryUrl: 'https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/6.ogg'
  },
  {
    id: 25,
    name: 'pikachu',
    category: 'Mouse Pokémon',
    types: ['electric'],
    height: 4,
    weight: 60,
    abilities: ['Static', 'Lightning Rod (Hidden)'],
    baseExperience: 112,
    captureRate: '190 / 255',
    generation: 'Gen I',
    habitat: 'Forest',
    eggGroups: ['Field', 'Fairy'],
    flavorText: 'When several of these Pokémon gather, their electricity could build and cause lightning storms.',
    isLegendary: false,
    isMythical: false,
    moves: ['Thunderbolt', 'Quick Attack', 'Thunder Shock', 'Iron Tail', 'Electro Ball', 'Volt Tackle'],
    stats: { hp: 35, attack: 55, defense: 40, spAtk: 50, spDef: 50, speed: 90 },
    imageNormal: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
    imageShiny: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/25.png',
    cryUrl: 'https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/25.ogg'
  },
  {
    id: 150,
    name: 'mewtwo',
    category: 'Genetic Pokémon',
    types: ['psychic'],
    height: 20,
    weight: 1220,
    abilities: ['Pressure', 'Unnerve (Hidden)'],
    baseExperience: 340,
    captureRate: '3 / 255',
    generation: 'Gen I',
    habitat: 'Rare',
    eggGroups: ['No Eggs'],
    flavorText: 'It was created by a scientist after years of horrific gene splicing and DNA engineering experiments.',
    isLegendary: true,
    isMythical: false,
    moves: ['Psystrike', 'Psychic', 'Aura Sphere', 'Shadow Ball', 'Ice Beam', 'Recover'],
    stats: { hp: 106, attack: 110, defense: 90, spAtk: 154, spDef: 90, speed: 130 },
    imageNormal: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png',
    imageShiny: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/150.png',
    cryUrl: 'https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/150.ogg'
  }
];

let currentPokemon = null;
let isShinyActive = false;

// Helper to format ID to #001
function formatId(id) {
  return '#' + String(id).padStart(3, '0');
}

// Format Generation text
function formatGen(genName) {
  if (!genName) return 'Gen I';
  const romanMap = { i: 'I', ii: 'II', iii: 'III', iv: 'IV', v: 'V', vi: 'VI', vii: 'VII', viii: 'VIII', ix: 'IX' };
  const parts = genName.split('-');
  const roman = parts[1] ? (romanMap[parts[1].toLowerCase()] || parts[1].toUpperCase()) : '';
  return `Gen ${roman}`;
}

// Display Pokémon Data in Featured Card
function displayPokemon(pkmn) {
  currentPokemon = pkmn;
  isShinyActive = false;

  const card = document.getElementById('featured-card');
  const img = document.getElementById('pkmn-img');
  const glowBg = document.getElementById('img-glow');
  const name = document.getElementById('pkmn-name');
  const idTag = document.getElementById('pkmn-id');
  const category = document.getElementById('pkmn-category');
  const typesContainer = document.getElementById('pkmn-types');
  const flavorText = document.getElementById('pkmn-flavor-text');
  const statusBadge = document.getElementById('pkmn-status-badge');

  // Metrics
  const heightVal = document.getElementById('pkmn-height');
  const weightVal = document.getElementById('pkmn-weight');
  const abilitiesVal = document.getElementById('pkmn-abilities');
  const baseBxpVal = document.getElementById('pkmn-base-xp');
  const captureRateVal = document.getElementById('pkmn-capture-rate');
  const generationVal = document.getElementById('pkmn-generation');
  const habitatVal = document.getElementById('pkmn-habitat');
  const eggGroupsVal = document.getElementById('pkmn-egg-groups');

  // Moves
  const movesContainer = document.getElementById('pkmn-moves');

  // Shiny button reset
  const shinyBtn = document.getElementById('btn-shiny');
  if (shinyBtn) shinyBtn.classList.remove('active');

  if (card) card.classList.remove('loading');
  if (idTag) idTag.textContent = formatId(pkmn.id);
  if (name) name.textContent = pkmn.name.replace('-', ' ');
  if (category) category.textContent = pkmn.category || 'Pokémon';
  if (flavorText) flavorText.textContent = pkmn.flavorText || 'No Pokédex entry available.';

  // Status Badge
  if (statusBadge) {
    if (pkmn.isLegendary) {
      statusBadge.textContent = 'Legendary';
      statusBadge.className = 'status-badge legendary';
      statusBadge.style.display = 'inline-block';
    } else if (pkmn.isMythical) {
      statusBadge.textContent = 'Mythical';
      statusBadge.className = 'status-badge mythical';
      statusBadge.style.display = 'inline-block';
    } else {
      statusBadge.style.display = 'none';
    }
  }

  // Dynamic Type Color Shadow & Aura Glow
  const primaryType = (pkmn.types && pkmn.types[0]) ? pkmn.types[0].toLowerCase() : 'normal';
  const shadowColor = TYPE_COLOR_MAP[primaryType] || 'rgba(136, 57, 239, 0.65)';

  if (img) {
    img.src = pkmn.imageNormal;
    img.alt = pkmn.name;
    img.style.filter = `drop-shadow(0 14px 28px ${shadowColor})`;
  }

  if (glowBg) {
    glowBg.style.background = `radial-gradient(circle, ${shadowColor} 0%, rgba(0, 0, 0, 0) 70%)`;
  }

  // Types
  if (typesContainer) {
    typesContainer.innerHTML = pkmn.types
      .map(t => `<span class="type-badge type-${t}">${t}</span>`)
      .join(' ');
  }

  // Metrics Display
  if (heightVal) heightVal.textContent = (pkmn.height / 10).toFixed(1) + ' m';
  if (weightVal) weightVal.textContent = (pkmn.weight / 10).toFixed(1) + ' kg';
  if (abilitiesVal) abilitiesVal.textContent = pkmn.abilities.join(', ');
  if (baseBxpVal) baseBxpVal.textContent = pkmn.baseExperience ? `${pkmn.baseExperience} XP` : 'N/A';
  if (captureRateVal) captureRateVal.textContent = pkmn.captureRate || 'N/A';
  if (generationVal) generationVal.textContent = pkmn.generation || 'Gen I';
  if (habitatVal) habitatVal.textContent = pkmn.habitat ? pkmn.habitat.replace('-', ' ') : 'Unknown';
  if (eggGroupsVal) eggGroupsVal.textContent = pkmn.eggGroups ? pkmn.eggGroups.join(', ') : 'N/A';

  // Moves Display
  if (movesContainer) {
    if (pkmn.moves && pkmn.moves.length > 0) {
      movesContainer.innerHTML = pkmn.moves
        .map(m => `<span class="move-badge">${m.replace('-', ' ')}</span>`)
        .join(' ');
    } else {
      movesContainer.innerHTML = `<span class="move-badge">None</span>`;
    }
  }

  // Update Stat Bars
  const stats = pkmn.stats;
  let totalScore = 0;
  
  for (const [statKey, val] of Object.entries(stats)) {
    totalScore += val;
    const numElem = document.getElementById(`stat-${statKey}`);
    const barElem = document.getElementById(`bar-${statKey}`);
    if (numElem) numElem.textContent = val;
    if (barElem) {
      const pct = Math.min(100, Math.round((val / 180) * 100));
      barElem.style.width = pct + '%';
    }
  }

  const totalElem = document.getElementById('stats-total-val');
  if (totalElem) totalElem.textContent = `Total: ${totalScore}`;

  // Trigger Anime.js Card Entrance Transform Animation
  if (typeof AppAnimations !== 'undefined') {
    AppAnimations.animateStaggerEntrance('#featured-card', { duration: 600, scale: 0.96 });
  }
}

// Fetch Random Pokémon by ID with full details from PokéAPI
async function loadRandomPokemon() {
  const card = document.getElementById('featured-card');
  if (card) card.classList.add('loading');

  const randomId = Math.floor(Math.random() * 1025) + 1;

  try {
    const [pokemonRes, speciesRes] = await Promise.all([
      fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`),
      fetch(`https://pokeapi.co/api/v2/pokemon-species/${randomId}`).catch(() => null)
    ]);

    if (!pokemonRes.ok) throw new Error('API Response Error');
    const d = await pokemonRes.json();
    let speciesData = null;
    if (speciesRes && speciesRes.ok) {
      speciesData = await speciesRes.json();
    }

    let flavorText = '';
    if (speciesData && speciesData.flavor_text_entries) {
      const enEntry = speciesData.flavor_text_entries.find(f => f.language.name === 'en');
      if (enEntry) flavorText = enEntry.flavor_text.replace(/[\n\f\r]/g, ' ');
    }

    let categoryText = 'Pokémon';
    if (speciesData && speciesData.genera) {
      const enGen = speciesData.genera.find(g => g.language.name === 'en');
      if (enGen) categoryText = enGen.genus;
    }

    const abilitiesList = d.abilities.map(a => {
      const name = a.ability.name.replace('-', ' ');
      return a.is_hidden ? `${name} (Hidden)` : name;
    });

    const topMoves = d.moves.slice(0, 8).map(m => m.move.name);
    const eggGroupsList = speciesData && speciesData.egg_groups
      ? speciesData.egg_groups.map(g => g.name)
      : [];

    const pkmn = {
      id: d.id,
      name: d.name,
      category: categoryText,
      types: d.types.map(t => t.type.name),
      height: d.height,
      weight: d.weight,
      abilities: abilitiesList,
      baseExperience: d.base_experience,
      captureRate: speciesData ? `${speciesData.capture_rate} / 255` : 'N/A',
      generation: speciesData ? formatGen(speciesData.generation?.name) : 'Gen I',
      habitat: speciesData?.habitat?.name || 'Unknown',
      eggGroups: eggGroupsList,
      flavorText: flavorText || 'No entry text available.',
      isLegendary: speciesData?.is_legendary || false,
      isMythical: speciesData?.is_mythical || false,
      moves: topMoves,
      stats: {
        hp: d.stats.find(s => s.stat.name === 'hp')?.base_stat || 50,
        attack: d.stats.find(s => s.stat.name === 'attack')?.base_stat || 50,
        defense: d.stats.find(s => s.stat.name === 'defense')?.base_stat || 50,
        spAtk: d.stats.find(s => s.stat.name === 'special-attack')?.base_stat || 50,
        spDef: d.stats.find(s => s.stat.name === 'special-defense')?.base_stat || 50,
        speed: d.stats.find(s => s.stat.name === 'speed')?.base_stat || 50,
      },
      imageNormal: d.sprites.other?.['official-artwork']?.front_default || d.sprites.front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${d.id}.png`,
      imageShiny: d.sprites.other?.['official-artwork']?.front_shiny || d.sprites.front_shiny || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${d.id}.png`,
      cryUrl: d.cries?.latest || d.cries?.legacy || `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${d.id}.ogg`
    };

    displayPokemon(pkmn);
  } catch (err) {
    console.log('Using fallback dataset due to error:', err);
    const randomIndex = Math.floor(Math.random() * FALLBACK_POKEMON.length);
    displayPokemon(FALLBACK_POKEMON[randomIndex]);
  }
}

// Shiny Toggle Event
function toggleShiny() {
  if (!currentPokemon) return;
  const img = document.getElementById('pkmn-img');
  const shinyBtn = document.getElementById('btn-shiny');
  isShinyActive = !isShinyActive;

  if (typeof AppAnimations !== 'undefined') {
    AppAnimations.animatePop('#btn-shiny');
  }

  if (img) {
    img.src = isShinyActive ? currentPokemon.imageShiny : currentPokemon.imageNormal;
  }

  if (shinyBtn) {
    if (isShinyActive) shinyBtn.classList.add('active');
    else shinyBtn.classList.remove('active');
  }
}

// Audio Cry Event
function playCry() {
  if (!currentPokemon || !currentPokemon.cryUrl) return;
  if (typeof AppAnimations !== 'undefined') {
    AppAnimations.animatePop('#btn-cry');
  }
  try {
    const audio = new Audio(currentPokemon.cryUrl);
    audio.play().catch(e => console.log('Audio error:', e));
  } catch (e) {
    console.log('Cry audio error:', e);
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  const randomBtn = document.getElementById('btn-random');
  const shinyBtn = document.getElementById('btn-shiny');
  const cryBtn = document.getElementById('btn-cry');

  if (randomBtn) {
    randomBtn.addEventListener('click', () => {
      if (typeof AppAnimations !== 'undefined') {
        AppAnimations.animatePop('#btn-random');
      }
      loadRandomPokemon();
    });
  }
  if (shinyBtn) shinyBtn.addEventListener('click', toggleShiny);
  if (cryBtn) cryBtn.addEventListener('click', playCry);

  // Initial Load & Entrance Animations
  if (typeof AppAnimations !== 'undefined') {
    AppAnimations.animateFadeInDown('.pokedex-title');
  }
  loadRandomPokemon();
});
