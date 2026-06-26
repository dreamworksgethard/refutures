/* Refutures AI — Solana Agent Command Center */

document.addEventListener('DOMContentLoaded', () => {
  initMenu();
  initClock();
  initPriceTicker();
  initCharts();
  initOrderbook();
  initLeverageSlider();
  initToggleButtons();
  initScanlineToggle();
  initKeyboardNav();
});

/* Menu Navigation */
function initMenu() {
  const items = document.querySelectorAll('.menu-item');
  const panels = document.querySelectorAll('.panel');

  items.forEach(item => {
    item.addEventListener('click', () => selectMenuItem(item, items, panels));
    item.addEventListener('mouseenter', () => playHoverSound());
  });
}

function selectMenuItem(item, items, panels) {
  const target = item.dataset.panel;

  items.forEach(i => {
    i.classList.remove('active');
    i.setAttribute('aria-selected', 'false');
  });
  panels.forEach(p => p.classList.remove('active'));

  item.classList.add('active');
  item.setAttribute('aria-selected', 'true');
  document.getElementById(`panel-${target}`)?.classList.add('active');
}

/* Clock */
function initClock() {
  const clock = document.getElementById('clock');
  if (!clock) return;

  const tick = () => {
    const now = new Date();
    clock.textContent = now.toLocaleTimeString('en-US', { hour12: false });
  };
  tick();
  setInterval(tick, 1000);
}

/* Simulated SOL Price Ticker */
function initPriceTicker() {
  const priceEl = document.getElementById('solPrice');
  const changeEl = document.getElementById('solChange');
  if (!priceEl) return;

  let price = 148.42;
  let change = 3.12;

  setInterval(() => {
    const delta = (Math.random() - 0.48) * 0.4;
    price += delta;
    change += (Math.random() - 0.5) * 0.08;

    priceEl.textContent = `$${price.toFixed(2)}`;
    const sign = change >= 0 ? '+' : '';
    changeEl.textContent = `${sign}${change.toFixed(2)}%`;
    changeEl.className = `ticker-change ${change >= 0 ? 'positive' : 'negative'}`;
  }, 2000);
}

/* Canvas Charts */
function initCharts() {
  drawPriceChart();
  drawFundingChart();
}

function drawPriceChart() {
  const canvas = document.getElementById('priceChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  const points = generatePriceData(60, 140, 156);
  const signalPoints = generatePriceData(60, 142, 154);

  ctx.clearRect(0, 0, w, h);

  // Grid
  ctx.strokeStyle = 'rgba(161, 0, 126, 0.1)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    const y = (h / 5) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  drawLine(ctx, signalPoints, w, h, 'rgba(255, 230, 247, 0.3)', 1, true);
  drawLine(ctx, points, w, h, '#A1007E', 2, true);

  // Glow under price line
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, 'rgba(161, 0, 126, 0.25)');
  grad.addColorStop(1, 'rgba(161, 0, 126, 0)');
  fillArea(ctx, points, w, h, grad);
}

function drawFundingChart() {
  const canvas = document.getElementById('fundingChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  const data = Array.from({ length: 30 }, () => (Math.random() - 0.3) * 0.02);

  ctx.clearRect(0, 0, w, h);

  const barW = w / data.length - 2;
  const mid = h / 2;

  ctx.strokeStyle = 'rgba(255, 230, 247, 0.15)';
  ctx.beginPath();
  ctx.moveTo(0, mid);
  ctx.lineTo(w, mid);
  ctx.stroke();

  data.forEach((val, i) => {
    const x = i * (barW + 2);
    const barH = (val / 0.02) * (h / 2 - 10);
    ctx.fillStyle = val >= 0 ? 'rgba(161, 0, 126, 0.7)' : 'rgba(255, 61, 110, 0.5)';
    if (val >= 0) {
      ctx.fillRect(x, mid - barH, barW, barH);
    } else {
      ctx.fillRect(x, mid, barW, Math.abs(barH));
    }
  });
}

function generatePriceData(len, min, max) {
  const data = [];
  let val = (min + max) / 2;
  for (let i = 0; i < len; i++) {
    val += (Math.random() - 0.48) * (max - min) * 0.04;
    val = Math.max(min, Math.min(max, val));
    data.push(val);
  }
  return data;
}

function drawLine(ctx, data, w, h, color, width, smooth) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();

  data.forEach((val, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((val - min) / range) * (h - 20) - 10;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
}

function fillArea(ctx, data, w, h, grad) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  ctx.fillStyle = grad;
  ctx.beginPath();
  data.forEach((val, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((val - min) / range) * (h - 20) - 10;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();
}

/* Orderbook */
function initOrderbook() {
  const asksEl = document.getElementById('orderbookAsks');
  const bidsEl = document.getElementById('orderbookBids');
  if (!asksEl || !bidsEl) return;

  let mid = 148.42;

  const render = () => {
    asksEl.innerHTML = '';
    bidsEl.innerHTML = '';

    for (let i = 5; i >= 1; i--) {
      const price = mid + i * 0.02 + Math.random() * 0.01;
      const size = (Math.random() * 500 + 50).toFixed(0);
      const total = (price * size / 1000).toFixed(1);
      asksEl.appendChild(createObRow(price, size, total, 'ask', Math.random() * 80 + 20));
    }

    for (let i = 1; i <= 5; i++) {
      const price = mid - i * 0.02 - Math.random() * 0.01;
      const size = (Math.random() * 500 + 50).toFixed(0);
      const total = (price * size / 1000).toFixed(1);
      bidsEl.appendChild(createObRow(price, size, total, 'bid', Math.random() * 80 + 20));
    }
  };

  render();
  setInterval(() => {
    mid += (Math.random() - 0.5) * 0.15;
    render();
  }, 3000);
}

function createObRow(price, size, total, side, width) {
  const row = document.createElement('div');
  row.className = `ob-row ${side}`;
  row.innerHTML = `
    <span>${price.toFixed(2)}</span>
    <span>${size}</span>
    <span>${total}K</span>
    <div class="ob-bg" style="width: ${width}%"></div>
  `;
  return row;
}

/* Leverage Slider */
function initLeverageSlider() {
  const slider = document.getElementById('leverageSlider');
  const display = document.getElementById('leverageValue');
  if (!slider || !display) return;

  slider.addEventListener('input', () => {
    display.textContent = `${slider.value}x`;
  });
}

/* Long/Short Toggle */
function initToggleButtons() {
  document.querySelectorAll('.toggle-group').forEach(group => {
    group.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  });
}

/* Scanline Toggle */
function initScanlineToggle() {
  const toggle = document.getElementById('scanlineToggle');
  const scanlines = document.querySelector('.scanlines');
  if (!toggle || !scanlines) return;

  toggle.addEventListener('change', () => {
    scanlines.style.display = toggle.checked ? 'block' : 'none';
  });
}

/* Keyboard Navigation */
function initKeyboardNav() {
  const items = Array.from(document.querySelectorAll('.menu-item'));
  const panels = document.querySelectorAll('.panel');

  document.addEventListener('keydown', e => {
    const currentIdx = items.findIndex(i => i.classList.contains('active'));

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.min(currentIdx + 1, items.length - 1);
      selectMenuItem(items[next], items, panels);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = Math.max(currentIdx - 1, 0);
      selectMenuItem(items[prev], items, panels);
    }
  });
}

function playHoverSound() {
  // Placeholder for optional UI sound
}
