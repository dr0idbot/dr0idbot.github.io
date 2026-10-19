const THEME_URL = "assets/themes/theme.json";
const STORAGE_THEME = "theme-id";
const COLOR_SLOTS = 6;

const FALLBACK_THEME = {
  id: "pcb-blue",
  name: "PCB Blue",
  type: "analogous",
  colors: {
    "color-1": "#00ffff",
    "color-1-contrast": "#000000",
    "color-2": "#001e13",
    "color-2-contrast": "#ffffff",
    "color-3": "#002800",
    "color-3-contrast": "#ffffff",
    "color-4": "#009f64",
    "color-4-contrast": "#000000",
    "color-5": "#88ffe8",
    "color-5-contrast": "#000000",
    "color-6": "#b8d1ec",
    "color-6-contrast": "#000000",
  },
};

export async function fetchThemes() {
  try {
    const res = await fetch(THEME_URL, { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const themes = Array.isArray(data.themes) ? data.themes : [];
    return themes.length ? themes : [FALLBACK_THEME];
  } catch {
    return [FALLBACK_THEME];
  }
}

export function applyTheme(theme) {
  const root = document.documentElement;
  for (let i = 1; i <= COLOR_SLOTS; i += 1) {
    const color = theme.colors?.[`color-${i}`];
    const contrast = theme.colors?.[`color-${i}-contrast`];
    if (color) root.style.setProperty(`--color-${i}`, color);
    if (contrast) root.style.setProperty(`--color-${i}-contrast`, contrast);
  }
  root.dataset.themeId = theme.id;
  localStorage.setItem(STORAGE_THEME, theme.id);
  document.dispatchEvent(new CustomEvent("themechange", { detail: theme }));
}

export function getActiveThemeId() {
  return localStorage.getItem(STORAGE_THEME);
}

export function mountThemePicker(select, themes) {
  const frag = document.createDocumentFragment();
  for (const theme of themes) {
    const option = document.createElement("option");
    option.value = theme.id;
    option.textContent = theme.name;
    frag.append(option);
  }
  select.replaceChildren(frag);

  const saved = getActiveThemeId();
  const initial = themes.find((theme) => theme.id === saved) ?? themes[0];
  select.value = initial.id;
  applyTheme(initial);

  select.addEventListener("change", () => {
    const next = themes.find((theme) => theme.id === select.value);
    if (next) applyTheme(next);
  });

  return initial;
}

export function mountSchemeToggle(button) {
  const sync = () => {
    const scheme = document.documentElement.dataset.scheme ?? "light";
    const next = scheme === "dark" ? "light" : "dark";
    const label = `Switch to ${next} mode`;
    button.setAttribute("aria-label", label);
    button.title = label;
    button.replaceChildren();
    const icon = document.createElement("i");
    icon.dataset.lucide = scheme === "dark" ? "sun" : "moon";
    button.append(icon);
    window.lucide?.createIcons();
  };

  button.addEventListener("click", () => {
    const current = document.documentElement.dataset.scheme ?? "light";
    const scheme = current === "dark" ? "light" : "dark";
    document.documentElement.dataset.scheme = scheme;
    localStorage.setItem("scheme", scheme);
    sync();
    document.dispatchEvent(new CustomEvent("schemechange", { detail: { scheme } }));
  });

  sync();
}
