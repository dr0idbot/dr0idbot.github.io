import { fetchThemes, mountThemePicker, mountSchemeToggle } from "./theme.js";
import { initPokedex } from "./pokedex.js";

const MOBILE_QUERY = "(max-width: 860px)";

const renderIcons = () => window.lucide?.createIcons();

const routeFromHash = () => {
  const raw = window.location.hash.replace(/^#\/?/, "").split("/")[0];
  return raw === "pokedex" ? "pokedex" : "home";
};

function initSidebar() {
  const body = document.body;
  const toggle = document.getElementById("sidebar-toggle");
  const brand = document.querySelector(".brand");
  const menuBtn = document.getElementById("menu-btn");
  const scrim = document.getElementById("scrim");
  const mobile = window.matchMedia(MOBILE_QUERY);

  const sync = () => {
    const state = body.dataset.sidebar;
    const expanded = state === "expanded";
    toggle.setAttribute("aria-expanded", String(expanded));
    const label = expanded ? "Collapse sidebar" : "Expand sidebar";
    toggle.setAttribute("aria-label", label);
    toggle.title = label;
    toggle.replaceChildren();
    const icon = document.createElement("i");
    icon.dataset.lucide = expanded ? "panel-left-close" : "panel-left-open";
    toggle.append(icon);

    if (expanded) {
      brand.removeAttribute("role");
      brand.removeAttribute("aria-label");
      brand.removeAttribute("title");
      brand.removeAttribute("tabindex");
    } else {
      brand.setAttribute("role", "button");
      brand.setAttribute("aria-label", "Expand sidebar");
      brand.title = "Expand sidebar";
      brand.tabIndex = 0;
    }

    menuBtn.setAttribute("aria-expanded", String(expanded && mobile.matches));
    scrim.hidden = !(expanded && mobile.matches);
    renderIcons();
  };

  const setState = (state) => {
    body.dataset.sidebar = state;
    localStorage.setItem("sidebar", state);
    sync();
  };

  const activateBrand = () => {
    if (body.dataset.sidebar === "collapsed") {
      setState("expanded");
    }
  };

  toggle.addEventListener("click", () =>
    setState(body.dataset.sidebar === "expanded" ? "collapsed" : "expanded"),
  );
  brand.addEventListener("click", activateBrand);
  brand.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activateBrand();
    }
  });
  menuBtn.addEventListener("click", () => setState("expanded"));
  scrim.addEventListener("click", () => setState("collapsed"));
  mobile.addEventListener("change", (event) => {
    if (!event.matches) {
      scrim.hidden = true;
      menuBtn.setAttribute("aria-expanded", "false");
    }
  });

  if (!body.dataset.sidebar) {
    setState(mobile.matches ? "collapsed" : "expanded");
  } else {
    sync();
  }
}

function initRouter(pokedex) {
  const pages = {
    home: document.getElementById("page-home"),
    pokedex: document.getElementById("page-pokedex"),
  };
  const navItems = document.querySelectorAll(".nav-item[data-route]");

  const navigate = () => {
    const route = routeFromHash();
    for (const [name, page] of Object.entries(pages)) {
      page.hidden = name !== route;
    }
    for (const item of navItems) {
      if (item.dataset.route === route) {
        item.setAttribute("aria-current", "page");
      } else {
        item.removeAttribute("aria-current");
      }
    }
    document.title =
      route === "pokedex"
        ? "Pokédex — dr0idspace"
        : "Home — dr0idspace";
    if (route === "pokedex" && !pokedex.isLoaded()) {
      pokedex.start();
    }
    document.getElementById("main").focus({ preventScroll: true });
  };

  window.addEventListener("hashchange", navigate);
  navigate();
}

async function boot() {
  renderIcons();
  initSidebar();

  const themes = await fetchThemes();
  const select = document.getElementById("theme-select");
  mountThemePicker(select, themes);
  mountSchemeToggle(document.getElementById("scheme-toggle"));

  const pokedex = initPokedex({
    output: document.getElementById("pokedex-out"),
    randomBtn: document.getElementById("pokedex-random"),
    prevBtn: document.getElementById("pokedex-prev"),
    nextBtn: document.getElementById("pokedex-next"),
  });

  initRouter(pokedex);
  renderIcons();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
