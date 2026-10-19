const API = "https://pokeapi.co/api/v2";
const MAX_ID = 1025;

const TYPE_COLORS = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
};

const STAT_LABELS = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  "special-attack": "Sp. Atk",
  "special-defense": "Sp. Def",
  speed: "Speed",
};

let activeAudio = null;

const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );

const titleCase = (value) =>
  String(value)
    .split(/[-\s]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const padId = (id) => `#${String(id).padStart(4, "0")}`;

const inkFor = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = [r, g, b].map((c) =>
    c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );
  const y = 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
  return (y + 0.05) / 0.05 >= 1.05 / (y + 0.05) ? "#000000" : "#ffffff";
};

const typeColor = (name) => TYPE_COLORS[name] ?? "#8A8F98";

const cleanText = (text) => text.replace(/[\n\f\u00ad]+/g, " ").trim();

const pickEnglish = (entries) => {
  const english = entries.filter((entry) => entry.language?.name === "en");
  return english.length ? english[english.length - 1] : null;
};

async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} for ${url}`);
  return res.json();
}

function artworkFor(pokemon) {
  return (
    pokemon.sprites?.other?.["official-artwork"]?.front_default ??
    pokemon.sprites?.other?.home?.front_default ??
    pokemon.sprites?.front_default ??
    null
  );
}

function renderLoading(out, id) {
  out.innerHTML = `
    <div class="state">
      <i class="state__icon spinner" data-lucide="loader-circle"></i>
      <p class="state__title">Loading ${esc(padId(id))}</p>
      <p class="state__code">pokéapi · pokemon + species</p>
    </div>`;
  window.lucide?.createIcons();
}

function renderError(out, id, retry) {
  out.innerHTML = `
    <div class="state">
      <i class="state__icon" data-lucide="circle-help"></i>
      <p class="state__title">Couldn’t reach PokéAPI</p>
      <p class="state__body">
        ${esc(padId(id))} didn’t come back. Check the connection and try
        again.
      </p>
      <button class="btn btn--primary" type="button" data-retry>
        <i data-lucide="refresh-cw"></i>
        Try again
      </button>
    </div>`;
  out.querySelector("[data-retry]").addEventListener("click", () => retry(id));
  window.lucide?.createIcons();
}

function renderSpecimen(out, pokemon, species, onCry) {
  const types = pokemon.types
    .slice()
    .sort((a, b) => a.slot - b.slot)
    .map((entry) => entry.type.name);

  const primary = types[0] ?? "normal";
  const color = typeColor(primary);
  const art = artworkFor(pokemon);
  const name = titleCase(pokemon.name);
  const genus = pickEnglish(species.genera)?.genus ?? "Unknown species";
  const flavor = pickEnglish(species.flavor_text_entries)?.flavor_text ?? "";
  const description = flavor ? cleanText(flavor) : "No description on file.";
  const generation = (
    species.generation?.name ?? "generation-i"
  )
    .replace("generation-", "")
    .toUpperCase();

  const vitals = [
    ["Height", `${(pokemon.height / 10).toFixed(1)} m`],
    ["Weight", `${(pokemon.weight / 10).toFixed(1)} kg`],
    ["Base exp", pokemon.base_experience == null ? "—" : String(pokemon.base_experience)],
    ["Capture rate", String(species.capture_rate ?? "—")],
    ["Generation", generation],
    ["Habitat", species.habitat ? titleCase(species.habitat.name) : "—"],
    ["Color", titleCase(species.color?.name ?? "unknown")],
    ["Growth", titleCase((species.growth_rate?.name ?? "unknown").replace(/-/g, " "))],
  ];

  const abilities = pokemon.abilities.map(
    (entry) => `
      <li class="ability">
        ${esc(titleCase(entry.ability.name.replace(/-/g, " ")))}
        ${entry.is_hidden ? '<span class="ability__flag">hidden</span>' : ""}
      </li>`,
  );

  const stats = pokemon.stats.map((entry) => {
    const key = entry.stat.name;
    const value = entry.base_stat;
    return `
      <li class="stat-row">
        <span class="stat-row__label">${esc(STAT_LABELS[key] ?? titleCase(key))}</span>
        <span class="stat-bar">
          <span class="stat-bar__fill" data-fill style="--bar-color: ${esc(color)}"
            data-width="${Math.min(100, (value / 255) * 100).toFixed(1)}"></span>
        </span>
        <span class="stat-row__value">${esc(value)}</span>
      </li>`;
  });

  const total = pokemon.stats.reduce((sum, entry) => sum + entry.base_stat, 0);
  const badges = [
    species.is_legendary ? "Legendary" : null,
    species.is_mythical ? "Mythical" : null,
  ].filter(Boolean);

  out.innerHTML = `
    <article class="specimen" style="--type-color: ${esc(color)}">
      <div class="specimen__plate">
        <span class="specimen__id">${esc(padId(pokemon.id))}</span>
        ${
          pokemon.cries?.latest
            ? `<button class="icon-btn specimen__cry" type="button" data-cry
                 aria-label="Play cry" title="Play cry">
                 <i data-lucide="volume-2"></i>
               </button>`
            : ""
        }
        <div class="specimen__art-wrap">
          ${
            art
              ? `<img class="specimen__art" src="${esc(art)}" alt="Official artwork of ${esc(name)}" width="360" height="360" />`
              : `<i class="state__icon" data-lucide="image"></i>`
          }
        </div>
        <div class="specimen__identity">
          <h2 class="specimen__name">${esc(name)}</h2>
          <p class="specimen__genus">${esc(genus)}</p>
          ${
            badges.length
              ? `<ul class="badge-list">${badges
                  .map((badge) => `<li class="badge">${esc(badge)}</li>`)
                  .join("")}</ul>`
              : ""
          }
          <ul class="type-list">
            ${types
              .map(
                (type) => `
              <li class="type-chip" style="--type: ${esc(typeColor(type))}; --type-contrast: ${esc(
                  inkFor(typeColor(type)),
                )}">${esc(titleCase(type))}</li>`,
              )
              .join("")}
          </ul>
        </div>
      </div>

      <div class="specimen__data">
        <p class="specimen__desc">${esc(description)}</p>

        <section class="block">
          <h3 class="block__title">Vitals</h3>
          <dl class="vitals">
            ${vitals
              .map(
                ([label, value]) => `
              <div class="vitals__row">
                <dt>${esc(label)}</dt>
                <dd>${esc(value)}</dd>
              </div>`,
              )
              .join("")}
          </dl>
        </section>

        <section class="block">
          <h3 class="block__title">Abilities</h3>
          <ul class="ability-list">${abilities.join("")}</ul>
        </section>

        <section class="block">
          <h3 class="block__title">Base stats</h3>
          <ul class="stat-list">${stats.join("")}</ul>
          <div class="stat-total">
            <span class="stat-total__label">Total</span>
            <span class="stat-total__value">${esc(total)}</span>
          </div>
        </section>
      </div>
    </article>`;

  const cryBtn = out.querySelector("[data-cry]");
  if (cryBtn && pokemon.cries?.latest) {
    cryBtn.addEventListener("click", () => onCry(pokemon.cries.latest, cryBtn));
  }

  window.lucide?.createIcons();

  requestAnimationFrame(() => {
    for (const fill of out.querySelectorAll("[data-fill]")) {
      fill.style.width = `${fill.dataset.width}%`;
    }
  });
}

export function initPokedex({ output, randomBtn, prevBtn, nextBtn }) {
  let currentId = null;
  let token = 0;

  const randomId = () => Math.floor(Math.random() * MAX_ID) + 1;

  const playCry = (url, button) => {
    if (activeAudio) {
      activeAudio.pause();
      activeAudio = null;
    }
    activeAudio = new Audio(url);
    activeAudio.volume = 0.4;
    button.setAttribute("aria-label", "Cry playing");
    activeAudio
      .play()
      .catch(() => {})
      .finally(() => {
        button.setAttribute("aria-label", "Play cry");
        activeAudio = null;
      });
  };

  const load = async (id) => {
    const bounded = Math.min(MAX_ID, Math.max(1, id));
    currentId = bounded;
    const ticket = ++token;
    renderLoading(output, bounded);
    try {
      const [pokemon, species] = await Promise.all([
        getJSON(`${API}/pokemon/${bounded}`),
        getJSON(`${API}/pokemon-species/${bounded}`),
      ]);
      if (ticket !== token) return;
      renderSpecimen(output, pokemon, species, playCry);
    } catch {
      if (ticket !== token) return;
      renderError(output, bounded, load);
    }
  };

  randomBtn.addEventListener("click", () => load(randomId()));
  prevBtn.addEventListener("click", () =>
    load(currentId <= 1 ? MAX_ID : currentId - 1),
  );
  nextBtn.addEventListener("click", () =>
    load(currentId >= MAX_ID ? 1 : currentId + 1),
  );

  return {
    start: () => load(randomId()),
    isLoaded: () => currentId !== null,
    load,
  };
}
