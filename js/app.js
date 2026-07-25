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
  heroFlagImg: document.getElementById('heroFlagImg'),
  heroCountryName: document.getElementById('heroCountryName'),
  heroLocation: document.getElementById('heroLocation'),
  heroBaseLabel: document.getElementById('heroBaseLabel'),
  heroCurrencySymbol: document.getElementById('heroCurrencySymbol'),
  heroCurrencyCode: document.getElementById('heroCurrencyCode'),
  heroCurrencyName: document.getElementById('heroCurrencyName'),
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
  cdFromFlag: document.getElementById('cdFromFlag'),
  cdToFlag: document.getElementById('cdToFlag'),
  cdFromSymbol: document.getElementById('cdFromSymbol'),
  cdToSymbol: document.getElementById('cdToSymbol'),
  cdFromAmount: document.getElementById('cdFromAmount'),
  cdToAmount: document.getElementById('cdToAmount'),
  cdFromCode: document.getElementById('cdFromCode'),
  cdToCode: document.getElementById('cdToCode'),
};

function formatNum(n, decimals = 4) {
  if (n === null || n === undefined || isNaN(n)) return '-';
  if (n >= 10000) return n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  if (n >= 1000) return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (n >= 1) return n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  if (n >= 0.01) return n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return n.toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 6 });
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
    state.currencies.set(c.iso_code, { name: c.name, symbol: c.symbol || '' });
  }
}

async function fetchCountries() {
  const data = await fetchJSON(
    `${COUNTRIES_API}/countries?fields=name,alpha2Code,currencies,flag,flags,capital,region`
  );
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
      if (!curr.code) continue;
      if (!state.currencyCountry.has(curr.code)) {
        state.currencyCountry.set(curr.code, c);
      }
    }
  }
  for (const c of state.countries.values()) {
    if (!c.currencies) continue;
    for (const curr of c.currencies) {
      if (curr.code && c.alpha2Code === curr.code.substring(0, 2)) {
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
  if (country.flags && country.flags.png) return country.flags.png;
  return '';
}

function getCurrencyInfo(code) {
  return state.currencies.get(code) || { name: code, symbol: '' };
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
    els.updateTime.textContent = d.toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  }
}

function populateSelects() {
  const codes = Array.from(state.currencies.keys()).sort();
  const opts = codes.map(c => {
    const country = getCountryForCurrency(c);
    const info = getCurrencyInfo(c);
    const flag = country ? country.flag : '';
    const sym = info.symbol ? ` (${info.symbol})` : '';
    return `<option value="${c}">${flag} ${c}${sym} — ${info.name}</option>`;
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
  updateConverter();
  renderRates();
}

function updateHero() {
  const country = getCountryForCurrency(state.base);
  const info = getCurrencyInfo(state.base);

  els.heroCountryName.textContent = country ? country.name : state.base;
  els.heroFlagImg.src = getFlagUrl(country);
  els.heroFlagImg.alt = country ? country.name : state.base;
  els.heroFlagImg.onerror = function () {
    this.style.display = 'none';
  };
  els.heroBaseLabel.textContent = state.base;
  els.heroLocation.textContent = country
    ? [country.capital, country.region].filter(Boolean).join(' · ')
    : '—';
  els.heroCurrencySymbol.textContent = info.symbol || '—';
  els.heroCurrencyCode.textContent = state.base;
  els.heroCurrencyName.textContent = info.name;

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

function convert(amount, from, to) {
  const fromRate = getRateFor(from);
  const toRate = getRateFor(to);
  if (fromRate == null || toRate == null) return null;
  return (amount * toRate) / fromRate;
}

function updateConverter() {
  const from = els.currencyFrom.value;
  const to = els.currencyTo.value;
  const amount = parseFloat(els.amountFrom.value) || 0;
  const fromInfo = getCurrencyInfo(from);
  const toInfo = getCurrencyInfo(to);
  const fromCountry = getCountryForCurrency(from);
  const toCountry = getCountryForCurrency(to);

  els.cdFromFlag.textContent = fromCountry ? fromCountry.flag : '';
  els.cdToFlag.textContent = toCountry ? toCountry.flag : '';
  els.cdFromSymbol.textContent = fromInfo.symbol || '';
  els.cdToSymbol.textContent = toInfo.symbol || '';
  els.cdFromAmount.textContent = formatNum(amount, 4);
  els.cdFromCode.textContent = from;
  els.cdToCode.textContent = to;

  const result = convert(amount, from, to);
  if (result != null) {
    const formatted = formatNum(result, 4);
    const prev = els.cdToAmount.textContent;
    els.cdToAmount.textContent = formatted;
    els.amountTo.value = formatted;

    if (prev !== formatted && prev !== '-') {
      anime({
        targets: els.cdToAmount,
        scale: [1.05, 1],
        duration: 300,
        easing: 'easeOutQuad',
      });
    }
  } else {
    els.cdToAmount.textContent = '-';
    els.amountTo.value = '-';
  }

  const fromRate = getRateFor(from);
  const toRate = getRateFor(to);
  if (fromRate != null && toRate != null) {
    const rate = toRate / fromRate;
    els.rateDisplay.textContent = `1 ${from} = ${formatNum(rate, 6)} ${to}`;
  } else {
    els.rateDisplay.textContent = '-';
  }
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
    const info = getCurrencyInfo(code);
    const flagUrl = getFlagUrl(country);

    const card = document.createElement('div');
    card.className = 'currency-card';
    card.dataset.code = code;
    card.dataset.name = info.name.toLowerCase();
    card.dataset.country = (country?.name || '').toLowerCase();

    let flagHtml;
    if (flagUrl) {
      flagHtml =
        `<img src="${flagUrl}" alt="${country?.name || code}" loading="lazy">` +
        `<span class="flag-emoji" style="display:none">${country?.flag || '💱'}</span>`;
    } else if (country && country.flag) {
      flagHtml = `<span class="flag-emoji">${country.flag}</span>`;
    } else {
      flagHtml = `<span class="flag-emoji">💱</span>`;
    }

    card.innerHTML = `
      <div class="card-flag-row">
        <div class="card-flag">${flagHtml}</div>
        <div class="card-country-name">${country?.name || info.name}</div>
      </div>
      <div class="card-currency-line">
        ${info.symbol ? `<span class="card-currency-symbol">${info.symbol}</span>` : ''}
        <span class="card-currency-code">${code}</span>
        <span class="card-currency-name">${info.name}</span>
      </div>
      <div class="card-rate">
        <span class="card-rate-value">${formatNum(rate, 4)}</span>
        <span class="card-rate-label">/${base}</span>
      </div>
    `;

    card.addEventListener('click', () => {
      els.currencyTo.value = code;
      updateConverter();
    });

    const cardImg = card.querySelector('.card-flag > img');
    if (cardImg) {
      cardImg.addEventListener('error', function handler() {
        this.style.display = 'none';
        const fallback = this.nextElementSibling;
        if (fallback) fallback.style.display = 'flex';
      });
    }

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
  gsap.from('.hero-country', { opacity: 0, x: -30, duration: 0.7, ease: 'power2.out' });
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

function handleSwap() {
  const tmp = els.currencyFrom.value;
  els.currencyFrom.value = els.currencyTo.value;
  els.currencyTo.value = tmp;

  anime({
    targets: els.swapBtn,
    rotate: ['0deg', '360deg'],
    duration: 500,
    easing: 'easeInOutQuad',
  });
  setTimeout(() => { els.swapBtn.style.rotate = ''; }, 550);

  updateConverter();
}

function setupListeners() {
  els.themeToggle.addEventListener('click', toggleTheme);
  els.baseCurrency.addEventListener('change', handleBaseChange);
  els.currencyFrom.addEventListener('change', updateConverter);
  els.currencyTo.addEventListener('change', updateConverter);
  els.amountFrom.addEventListener('input', updateConverter);
  els.swapBtn.addEventListener('click', handleSwap);
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
