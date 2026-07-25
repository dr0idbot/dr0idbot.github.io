const FRANKFURTER = 'https://api.frankfurter.dev/v2';
const COUNTRIES_API = 'https://countries.dev';

const state = {
  currencies: new Map(),
  rates: null,
  base: 'USD',
  countries: new Map(),
  currencyCountry: new Map(),
  ratesDate: null,
  theme: localStorage.getItem('theme') || 'light',
};

const els = {
  themeToggle: document.getElementById('themeToggle'),
  updateTime: document.getElementById('updateTime'),
  heroBaseCode: document.getElementById('heroBaseCode'),
  heroBaseName: document.getElementById('heroBaseName'),
  heroFlagImg: document.getElementById('heroFlagImg'),
  baseCurrency: document.getElementById('baseCurrency'),
  currencyFrom: document.getElementById('currencyFrom'),
  currencyTo: document.getElementById('currencyTo'),
  amountFrom: document.getElementById('amountFrom'),
  amountTo: document.getElementById('amountTo'),
  swapBtn: document.getElementById('swapBtn'),
  rateDisplay: document.getElementById('rateDisplay'),
  ratesGrid: document.getElementById('ratesGrid'),
  loadingState: document.getElementById('loadingState'),
  errorState: document.getElementById('errorState'),
  errorMessage: document.getElementById('errorMessage'),
  retryBtn: document.getElementById('retryBtn'),
  searchInput: document.getElementById('searchInput'),
};

function formatNum(n, decimals = 4) {
  if (n === null || n === undefined || isNaN(n)) return '-';
  if (n >= 1000) return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (n >= 1) return n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}

async function init() {
  applyTheme(state.theme);
  lucide.createIcons();

  showLoading();
  try {
    await Promise.all([fetchCurrencies(), fetchCountries()]);
    buildCurrencyCountryMap();
    await fetchRates(state.base);
    populateSelects();
    render();
    setupListeners();
    runEntryAnimations();
  } catch (err) {
    console.error(err);
    showError(err.message);
  }
}

async function fetchCurrencies() {
  const data = await fetchJSON(`${FRANKFURTER}/currencies`);
  state.currencies = new Map();
  for (const c of data) {
    state.currencies.set(c.iso_code, c.name);
  }
}

async function fetchCountries() {
  const data = await fetchJSON(`${COUNTRIES_API}/countries?fields=name,alpha2Code,currencies,flag,flags,capital`);
  state.countries = new Map();
  for (const c of data) {
    state.countries.set(c.alpha2Code, c);
  }
}

function buildCurrencyCountryMap() {
  state.currencyCountry = new Map();
  for (const c of state.countries.values()) {
    if (!c.currencies) continue;
    for (const curr of c.currencies) {
      if (curr.code && !state.currencyCountry.has(curr.code)) {
        state.currencyCountry.set(curr.code, c);
      }
    }
  }
}

function getCountryForCurrency(code) {
  return state.currencyCountry.get(code) || null;
}

function getFlagUrl(country) {
  if (!country) return '';
  if (country.flags && country.flags.svg) return country.flags.svg;
  return '';
}

async function fetchRates(base) {
  state.base = base;
  const data = await fetchJSON(`${FRANKFURTER}/rates?base=${base}`);
  state.rates = {};
  for (const r of data) {
    state.rates[r.quote] = r.rate;
  }
  state.ratesDate = data.length > 0 ? data[0].date : null;
  if (state.ratesDate) {
    const d = new Date(state.ratesDate);
    els.updateTime.textContent = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }
}

function populateSelects() {
  const codes = Array.from(state.currencies.keys()).sort();
  const opts = codes.map(c => {
    const country = getCountryForCurrency(c);
    const flag = country ? country.flag : '';
    return `<option value="${c}">${flag} ${c} — ${state.currencies.get(c)}</option>`;
  }).join('');

  els.baseCurrency.innerHTML = opts;
  els.currencyFrom.innerHTML = opts;
  els.currencyTo.innerHTML = opts;

  els.baseCurrency.value = 'USD';
  els.currencyFrom.value = 'USD';
  els.currencyTo.value = 'EUR';
}

function render() {
  hideError();
  hideLoading();
  updateHero();
  updateConverterRate();
  renderRates();
}

function updateHero() {
  const country = getCountryForCurrency(state.base);
  els.heroBaseCode.textContent = state.base;
  els.heroBaseName.textContent = state.currencies.get(state.base) || state.base;
  els.heroFlagImg.src = getFlagUrl(country);
  els.heroFlagImg.alt = country ? country.name : state.base;

  const majors = ['EUR', 'GBP', 'JPY', 'CHF'];
  for (const code of majors) {
    const el = document.getElementById(`hrRate${code}`);
    if (el) {
      const rate = state.rates?.[code];
      el.textContent = rate != null ? formatNum(rate, 4) : '-';
    }
    const flagEl = document.getElementById(`hrFlag${code}`);
    if (flagEl) {
      const c = getCountryForCurrency(code);
      flagEl.textContent = c ? c.flag : '';
    }
  }
}

function getRateFor(code) {
  if (code === state.base) return 1;
  return state.rates?.[code] ?? null;
}

function updateConverterRate() {
  const from = els.currencyFrom.value;
  const to = els.currencyTo.value;
  const fromRate = getRateFor(from);
  const toRate = getRateFor(to);
  if (fromRate != null && toRate != null) {
    const rate = toRate / fromRate;
    els.rateDisplay.textContent = `1 ${from} = ${formatNum(rate, 6)} ${to}`;
  } else {
    els.rateDisplay.textContent = '-';
  }
}

function convert(amount, from, to) {
  const fromRate = getRateFor(from);
  const toRate = getRateFor(to);
  if (fromRate == null || toRate == null) return null;
  return (amount * toRate) / fromRate;
}

function updateConvertedAmount() {
  const amount = parseFloat(els.amountFrom.value) || 0;
  const from = els.currencyFrom.value;
  const to = els.currencyTo.value;
  const result = convert(amount, from, to);
  if (result != null) {
    const formatted = formatNum(result, 4);
    if (els.amountTo.value !== formatted) {
      els.amountTo.value = formatted;
      anime({
        targets: els.amountTo,
        scale: [1.05, 1],
        duration: 300,
        easing: 'easeOutQuad',
      });
    }
  } else {
    els.amountTo.value = '-';
  }
  updateConverterRate();
}

function renderRates() {
  const grid = els.ratesGrid;
  const base = state.base;
  const codes = Array.from(state.currencies.keys()).sort();
  const fragment = document.createDocumentFragment();

  for (const code of codes) {
    const rate = code === base ? 1 : (state.rates?.[code] ?? null);
    if (rate == null) continue;

    const country = getCountryForCurrency(code);
    const card = document.createElement('div');
    card.className = 'currency-card';
    card.dataset.code = code;
    card.dataset.name = (state.currencies.get(code) || '').toLowerCase();
    card.dataset.country = (country?.name || '').toLowerCase();

    let flagHtml;
    const flagUrl = getFlagUrl(country);
    if (flagUrl) {
      flagHtml = `<img src="${flagUrl}" alt="${country.name}" loading="lazy">`;
    } else if (country && country.flag) {
      flagHtml = `<span class="flag-placeholder">${country.flag}</span>`;
    } else {
      flagHtml = `<span class="flag-placeholder">💱</span>`;
    }

    card.innerHTML = `
      <div class="card-top">
        <div class="card-flag">${flagHtml}</div>
        <span class="card-code">${code}</span>
      </div>
      <div class="card-name">${state.currencies.get(code) || code}</div>
      <div class="card-rate">
        <span class="card-rate-value">${formatNum(rate, 4)}</span>
        <span class="card-rate-label">/${base}</span>
      </div>
    `;

    card.addEventListener('click', () => {
      els.currencyTo.value = code;
      updateConvertedAmount();
    });

    fragment.appendChild(card);
  }

  grid.innerHTML = '';
  grid.appendChild(fragment);

  const cards = grid.querySelectorAll('.currency-card');
  gsap.to(cards, {
    opacity: 1,
    y: 0,
    duration: 0.5,
    stagger: 0.03,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '#ratesSection',
      start: 'top 85%',
    },
  });
}

function filterRates() {
  const q = els.searchInput.value.toLowerCase().trim();
  const cards = els.ratesGrid.querySelectorAll('.currency-card');
  for (const card of cards) {
    const code = card.dataset.code;
    const name = card.dataset.name;
    const country = card.dataset.country;
    const match = !q || code.toLowerCase().includes(q) || name.includes(q) || country.includes(q);
    card.classList.toggle('hidden', !match);
  }
}

function showLoading() {
  els.loadingState.style.display = 'flex';
  els.errorState.style.display = 'none';
}

function hideLoading() {
  els.loadingState.style.display = 'none';
}

function showError(msg) {
  els.loadingState.style.display = 'none';
  els.errorState.style.display = 'flex';
  els.errorMessage.textContent = msg || 'Something went wrong. Please try again.';
  lucide.createIcons();
}

function hideError() {
  els.errorState.style.display = 'none';
}

function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  applyTheme(state.theme);
  localStorage.setItem('theme', state.theme);
  lucide.createIcons();
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

function runEntryAnimations() {
  gsap.from('.hero-base', { opacity: 0, x: -30, duration: 0.7, ease: 'power2.out' });
  gsap.from('.hero-rate-card', {
    opacity: 0,
    y: 20,
    duration: 0.5,
    stagger: 0.1,
    ease: 'back.out(1.7)',
    delay: 0.3,
  });
  gsap.from('.converter-card', {
    opacity: 0,
    y: 30,
    duration: 0.6,
    ease: 'power2.out',
    scrollTrigger: { trigger: '#converterSection', start: 'top 85%' },
  });
}

async function handleBaseChange() {
  const newBase = els.baseCurrency.value;
  if (newBase === state.base) return;
  showLoading();
  try {
    await fetchRates(newBase);
    await refreshAll();
    hideLoading();
  } catch (err) {
    showError(err.message);
  }
}

async function refreshAll() {
  render();
  lucide.createIcons();
}

function setupListeners() {
  els.themeToggle.addEventListener('click', toggleTheme);
  els.baseCurrency.addEventListener('change', handleBaseChange);
  els.currencyFrom.addEventListener('change', updateConvertedAmount);
  els.currencyTo.addEventListener('change', updateConvertedAmount);
  els.amountFrom.addEventListener('input', updateConvertedAmount);

  els.swapBtn.addEventListener('click', () => {
    const tmp = els.currencyFrom.value;
    els.currencyFrom.value = els.currencyTo.value;
    els.currencyTo.value = tmp;

    anime({
      targets: els.swapBtn,
      rotate: ['0deg', '180deg'],
      duration: 400,
      easing: 'easeInOutQuad',
    });
    setTimeout(() => {
      els.swapBtn.style.rotate = '';
    }, 450);

    updateConvertedAmount();
  });

  els.searchInput.addEventListener('input', filterRates);

  els.retryBtn.addEventListener('click', async () => {
    showLoading();
    try {
      await fetchRates(state.base);
      render();
      lucide.createIcons();
    } catch (err) {
      showError(err.message);
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
