/* TD Mobile Store storefront — vanilla SPA with hash routing. Data: data.js, renders: art.js */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const app = $('#app');
const fmt = n => n.toLocaleString('vi-VN') + '₫';
const esc = s => String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
const norm = s => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/đ/g, 'd').toLowerCase();
const sleep = ms => new Promise(r => setTimeout(r, ms));
const byId = id => PRODUCTS.find(p => p.id === id);
const catOf = id => CATEGORIES.find(c => c.id === id);
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- persistent state (per browser)
const LS = {
  get(k, d) { try { return JSON.parse(localStorage.getItem('tdstore.' + k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('tdstore.' + k, JSON.stringify(v)); } catch { /* private mode: keep in memory */ } },
};
const S = {};
['cart', 'wish', 'compare', 'recent', 'orders'].forEach(k => S[k] = LS.get(k, []));
S.user = LS.get('user', null);
S.coupon = LS.get('coupon', null);
function save(k) { LS.set(k, S[k]); renderChrome(); }

// ---------- pricing
const roundK = n => Math.round(n / 10000) * 10000;
function variant(p, o = {}) {
  const si = o.s ?? 0, cond = o.cond ?? p.conds[0];
  const [label, base, list] = p.storages[si];
  const price = CONDS[cond].f === 1 ? base : roundK(base * CONDS[cond].f);
  const color = p.colors.find(c => c.key === o.color) || p.colors[0];
  return { si, label, cond, color, price, list, off: Math.round((1 - price / list) * 100) };
}
const minPrice = (p, conds) => Math.min(...p.storages.flatMap((_, s) => p.conds.filter(c => !conds?.length || conds.includes(c)).map(cond => variant(p, { s, cond }).price)));
const maxOff = p => Math.max(...p.storages.map((_, s) => variant(p, { s }).off));
const isSale = p => p.badges.includes('sale') || maxOff(p) >= 10;

// ---------- icons
const I = {
  heart: '<svg viewBox="0 0 24 24"><path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z"/></svg>',
  compare: '<svg viewBox="0 0 24 24"><path d="M7 4v16M17 4v16M3 8h8M13 16h8"/></svg>',
  cart: '<svg viewBox="0 0 24 24"><path d="M5 7h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8z"/><path d="M9 9.5V6.5a3 3 0 0 1 6 0v3"/><path d="M12 12v5M9.5 14.5h5"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  minus: '<svg viewBox="0 0 24 24"><path d="M6 12h12"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 6v12M6 12h12"/></svg>',
  left: '<svg viewBox="0 0 24 24"><path d="m14.5 6-6 6 6 6"/></svg>',
  right: '<svg viewBox="0 0 24 24"><path d="m9.5 6 6 6-6 6"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/></svg>',
  shield: '<svg viewBox="0 0 24 24"><path d="M12 3.5 5 6v5.5c0 4.2 3 7.6 7 9 4-1.4 7-4.8 7-9V6z"/><path d="m9 12 2 2 4-4"/></svg>',
  truck: '<svg viewBox="0 0 24 24"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17.5" cy="17.5" r="1.8"/></svg>',
  refresh: '<svg viewBox="0 0 24 24"><path d="M19 12a7 7 0 1 1-2.1-5M19 4.5V8h-3.5"/></svg>',
  gift: '<svg viewBox="0 0 24 24"><rect x="4" y="9" width="16" height="11" rx="1.5"/><path d="M3 9h18M12 9v11M12 9c-2-4-6-4-6-1.5S10 9 12 9zm0 0c2-4 6-4 6-1.5S14 9 12 9z"/></svg>',
  filter: '<svg viewBox="0 0 24 24"><path d="M4 7h16M7 12h10M10 17h4"/></svg>',
  search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/></svg>',
  warn: '<svg viewBox="0 0 24 24"><path d="M12 7v6M12 17h.01"/></svg>',
  info: '<svg viewBox="0 0 24 24"><path d="M12 11v6M12 7h.01"/></svg>',
};

// ---------- product image: real photo from PHOTOS when available, otherwise the SVG render
const photosOf = (p, colorKey) => PHOTOS[p.id]?.[colorKey] || PHOTOS[p.id]?.default || null;
function media(p, colorKey, i = 0, view) {
  const c = p.colors.find(x => x.key === colorKey) || p.colors[0], list = photosOf(p, c.key);
  return list ? `<img src="${list[i % list.length]}" alt="${esc(p.name)} — ${esc(c.name)}" loading="lazy" decoding="async">` : art(p.art, c.hex, view);
}
const orderMedia = i => byId(i.id) ? media(byId(i.id), i.color) : art(i.art, i.hex);

// ---------- small render helpers
const stars = r => `<span class="stars" role="img" aria-label="${r} trên 5 sao"><span style="width:${r / 5 * 100}%">★★★★★</span>★★★★★</span>`;
const BADGE = { new: ['Mới', 'b-new'], hot: ['Bán chạy', 'b-hot'], sale: ['Giảm giá', 'b-sale'] };
const badges = p => p.badges.map(b => `<span class="badge ${BADGE[b][1]}">${BADGE[b][0]}</span>`).join('') + (p.stock === 'soon' ? '<span class="badge b-soon">Sắp về</span>' : '');
const priceRow = (v, cls = '') => `<div class="price ${cls}"><b>${fmt(v.price)}</b>${v.off > 0 ? `<s>${fmt(v.list)}</s><em>-${v.off}%</em>` : ''}</div>`;
const crumbs = items => `<nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Trang chủ</a>${items.map(([l, h]) => h ? `<span>/</span><a href="${h}">${esc(l)}</a>` : `<span>/</span><span aria-current="page">${esc(l)}</span>`).join('')}</nav>`;
const empty = (title, text, cta = ['Khám phá sản phẩm', '#/']) => `<div class="empty"><div class="empty-art">${art('phone-air', '#dfe1e3', 'front')}</div><h2>${title}</h2><p>${text}</p><a class="btn btn-primary" href="${cta[1]}">${cta[0]}</a></div>`;
const toolBtns = p => {
  const w = S.wish.includes(p.id), c = S.compare.includes(p.id);
  return `<button class="tool ${w ? 'on' : ''}" data-act="wish" data-id="${p.id}" aria-pressed="${w}" aria-label="Yêu thích ${esc(p.name)}" title="Yêu thích">${I.heart}</button><button class="tool ${c ? 'on' : ''}" data-act="compare" data-id="${p.id}" aria-pressed="${c}" aria-label="So sánh ${esc(p.name)}" title="So sánh">${I.compare}</button>`;
};

function card(p) {
  const v = variant(p);
  return `<article class="card reveal">
    <a href="#/p/${p.id}" class="card-media" tabindex="-1" aria-hidden="true">${media(p, v.color.key)}</a>
    <div class="card-badges">${badges(p)}</div>
    <div class="card-tools">${toolBtns(p)}</div>
    <div class="card-body">
      <div class="swatches" aria-label="${p.colors.length} màu">${p.colors.map(c => `<i style="--c:${c.hex}" title="${esc(c.name)}"></i>`).join('')}</div>
      <h3><a href="#/p/${p.id}">${esc(p.name)}</a></h3>
      <p class="card-vars">${p.storages.map((s, i) => `<span class="${i ? '' : 'on'}">${esc(s[0].replace(' Wi‑Fi', ''))}</span>`).join('')}</p>
      ${priceRow(v)}
      <div class="rating">${stars(p.rating)}<span>${p.rating} · ${p.reviews.toLocaleString('vi-VN')} đánh giá</span></div>
      <div class="card-cta">
        <button class="btn btn-primary btn-sm" data-act="buy" data-id="${p.id}">${p.stock === 'soon' ? 'Đặt trước' : 'Mua ngay'}</button>
        <button class="btn-icon" data-act="add" data-id="${p.id}" aria-label="Thêm ${esc(p.name)} vào giỏ" title="Thêm vào giỏ">${I.cart}</button>
      </div>
    </div>
  </article>`;
}
const grid = list => `<div class="pgrid">${list.map(card).join('')}</div>`;
const skCard = () => `<div class="card sk-card"><div class="sk sk-media"></div><div class="card-body"><div class="sk sk-line w40"></div><div class="sk sk-line w80"></div><div class="sk sk-line w60"></div><div class="sk sk-line w50 tall"></div></div></div>`;
const skGrid = (n = 8) => `<div class="pgrid">${Array.from({ length: n }, skCard).join('')}</div>`;

// ---------- cart
const lineKey = (id, v) => `${id}|${v.si}|${v.color.key}|${v.cond}`;
const cartCount = () => S.cart.reduce((n, l) => n + l.qty, 0);
function addToCart(id, v, fromEl, silent) {
  const p = byId(id); v = v || variant(p);
  const key = lineKey(id, v), qty = v.qty || 1;
  const line = S.cart.find(l => l.key === key);
  if (line) line.qty = Math.min(5, line.qty + qty);
  else S.cart.push({ key, id, s: v.si, color: v.color.key, cond: v.cond, qty });
  save('cart');
  flyToCart(fromEl);
  if (!silent) toast(`Đã thêm <b>${esc(p.name)}</b> vào giỏ hàng`, ['Xem giỏ hàng', '#/cart']);
}
function cartLines() {
  return S.cart.map(l => { const p = byId(l.id); return p && { ...l, p, v: variant(p, { s: l.s, color: l.color, cond: l.cond }) }; }).filter(Boolean);
}
function totals(ship = 'standard') {
  const lines = cartLines();
  const subtotal = lines.reduce((n, l) => n + l.v.price * l.qty, 0);
  const listTotal = lines.reduce((n, l) => n + l.v.list * l.qty, 0);
  let discount = 0, coupon = S.coupon && COUPONS[S.coupon];
  if (coupon && subtotal >= coupon.min) discount = coupon.off || Math.min(coupon.max, roundK(subtotal * coupon.pct / 100));
  else coupon = null;
  const shipFee = ship === 'express' ? 50000 : ship === 'pickup' ? 0 : subtotal >= 500000 || !subtotal ? 0 : 30000;
  return { lines, subtotal, saved: listTotal - subtotal, discount, coupon, shipFee, total: Math.max(0, subtotal - discount + shipFee) };
}

// ---------- chrome: header counts, compare bar
function renderChrome() {
  const counts = { cart: cartCount(), wish: S.wish.length };
  $$('[data-count]').forEach(el => { const n = counts[el.dataset.count]; el.textContent = n > 99 ? '99+' : n || ''; el.hidden = !n; });
  const bar = $('#compare-bar');
  bar.hidden = !S.compare.length || location.hash.startsWith('#/compare') || location.hash.startsWith('#/checkout');
  bar.innerHTML = S.compare.map(id => { const p = byId(id); return `<span class="cb-item" title="${esc(p.name)}">${media(p)}</span>`; }).join('') +
    `<span class="cb-text">${S.compare.length}/3 sản phẩm</span><a class="btn btn-primary btn-sm" href="#/compare">So sánh</a><button class="link" data-act="compare-clear">Xoá</button>`;
}
function bump(el) { el?.classList.remove('bump'); void el?.offsetWidth; el?.classList.add('bump'); }
function flyToCart(fromEl) {
  const target = getComputedStyle($('.bnav')).display !== 'none' ? $('.bnav [data-tab=cart]') : $('#cart-btn');
  if (!fromEl || reduceMotion) return $$('[data-count=cart]').forEach(bump);
  const a = fromEl.getBoundingClientRect(), b = target.getBoundingClientRect();
  const dot = document.createElement('div');
  dot.className = 'fly';
  dot.style.cssText = `left:${a.left + a.width / 2 - 10}px;top:${a.top + a.height / 2 - 10}px`;
  document.body.appendChild(dot);
  dot.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: `translate(${b.left + b.width / 2 - a.left - a.width / 2}px,${b.top + b.height / 2 - a.top - a.height / 2}px) scale(.4)`, opacity: .6 }], { duration: 650, easing: 'cubic-bezier(.5,0,.2,1)' }).onfinish = () => { dot.remove(); $$('[data-count=cart]').forEach(bump); };
}

// ---------- toast
function toast(html, action, kind = '') {
  const t = document.createElement('div');
  t.className = 'toast ' + kind;
  t.innerHTML = `<span class="toast-ic">${{ err: I.x, warn: I.warn, info: I.info }[kind] || I.check}</span><span>${html}</span>${action ? (action[1].startsWith('#') ? `<a href="${action[1]}">${action[0]}</a>` : `<button>${action[0]}</button>`) : ''}`;
  if (action && typeof action[2] === 'function') t.querySelector('button').onclick = () => { action[2](); t.remove(); };
  $('#toasts').appendChild(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 300); }, 3600);
}

// ---------- lists (wish / compare / recent)
function toggleList(k, id) {
  const on = !S[k].includes(id);
  if (k === 'compare' && on && S.compare.length >= 3) { toast('Chỉ so sánh tối đa 3 sản phẩm. Bỏ bớt một sản phẩm để thêm mới.', null, 'warn'); return; }
  S[k] = on ? [...S[k], id] : S[k].filter(x => x !== id);
  save(k);
  $$(`[data-act=${k}][data-id="${id}"]`).forEach(b => { b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
  const name = byId(id).name;
  if (k === 'wish') toast(on ? `Đã lưu <b>${esc(name)}</b> vào Yêu thích` : `Đã bỏ <b>${esc(name)}</b> khỏi Yêu thích`, on ? ['Xem', '#/wishlist'] : null);
  if (k === 'compare' && on) toast(`Đã thêm <b>${esc(name)}</b> để so sánh`, ['So sánh', '#/compare']);
  if (location.hash === '#/wishlist' || location.hash === '#/compare') rerender();
}
function pushRecent(id) { S.recent = [id, ...S.recent.filter(x => x !== id)].slice(0, 8); LS.set('recent', S.recent); }
const recentBlock = (skip) => {
  const list = S.recent.filter(id => id !== skip).map(byId).filter(Boolean).slice(0, 4);
  return list.length ? `<section class="wrap sec"><div class="sec-head"><h2>Đã xem gần đây</h2></div>${grid(list)}</section>` : '';
};

// =====================================================================
// Views. Each returns { title, render(), mount?(), skeleton? }
// =====================================================================
let heroTimer = null, heroIdx = 0;
const HERO = [
  { id: 'iphone-17-pro-max', theme: 'dark', eyebrow: 'Mới ra mắt', color: 'cosmic' },
  { id: 'macbook-air-m4-13', theme: 'light', eyebrow: 'Pin đến 18 giờ', color: 'mbasky', title: 'MacBook Air M4', tagline: 'Mỏng nhẹ đến bất ngờ. Mạnh mẽ cho cả ngày dài.' },
  { id: 'airpods-pro-3', theme: 'mist', eyebrow: 'Chống ồn gấp đôi', color: 'white' },
];

function home() {
  const featured = ['iphone-17-pro-max', 'iphone-17', 'macbook-air-m4-13', 'ipad-air-m3', 'watch-s11', 'airpods-pro-3', 'iphone-air', 'mac-mini-m4'].map(byId);
  const deals = PRODUCTS.filter(isSale).sort((a, b) => maxOff(b) - maxOff(a)).slice(0, 4);
  return {
    render: () => `
    <section class="hero" aria-roledescription="carousel" aria-label="Sản phẩm nổi bật">
      ${HERO.map((h, i) => {
        const p = byId(h.id), v = variant(p, { color: h.color });
        return `<div class="slide t-${h.theme} ${i === heroIdx ? 'on' : ''}" role="group" aria-roledescription="slide" aria-label="${i + 1} / ${HERO.length}" ${i === heroIdx ? '' : 'aria-hidden="true"'}>
          <div class="wrap slide-in">
            <div class="slide-copy">
              <p class="eyebrow">${h.eyebrow}</p>
              <h1>${esc(h.title || p.name)}</h1>
              <p class="slide-tag">${esc(h.tagline || p.tagline)}</p>
              <div class="slide-price"><span>Chỉ từ</span>${priceRow(v)}</div>
              <div class="slide-cta"><button class="btn btn-primary" data-act="buy" data-id="${p.id}" ${i === heroIdx ? '' : 'tabindex="-1"'}>Mua ngay</button><a class="btn btn-ghost" href="#/p/${p.id}" ${i === heroIdx ? '' : 'tabindex="-1"'}>Xem chi tiết</a></div>
            </div>
            <div class="slide-art">${media(p, v.color.key)}</div>
          </div>
        </div>`;
      }).join('')}
      <div class="hero-ctl wrap">
        <div class="dots">${HERO.map((h, i) => `<button class="${i === heroIdx ? 'on' : ''}" data-act="slide" data-i="${i}" aria-label="Xem slide ${i + 1}"></button>`).join('')}</div>
        <div class="arrows"><button data-act="slide-step" data-i="-1" aria-label="Slide trước">${I.left}</button><button data-act="slide-step" data-i="1" aria-label="Slide sau">${I.right}</button></div>
      </div>
    </section>

    <section class="wrap perks reveal" aria-label="Cam kết">
      <div>${I.shield}<span><b>Chính hãng VN/A</b>Bảo hành 12 tháng</span></div>
      <div>${I.truck}<span><b>Giao nhanh 2 giờ</b>Miễn phí từ 500.000₫</span></div>
      <div>${I.refresh}<span><b>Đổi trả 30 ngày</b>1 đổi 1 nếu lỗi</span></div>
      <div>${I.gift}<span><b>Trả góp 0%</b>Duyệt trong 15 phút</span></div>
    </section>

    <section class="wrap sec">
      <div class="sec-head reveal"><h2>Khám phá Apple</h2><p>Chọn dòng sản phẩm phù hợp với bạn.</p></div>
      <div class="cats">${CATEGORIES.map((c, i) => catCard(c, i)).join('')}</div>
    </section>

    <section class="wrap sec">
      <div class="sec-head reveal"><h2>Thiết bị Apple nổi bật</h2><a class="more" href="#/c/iphone">Xem tất cả ${I.right}</a></div>
      ${grid(featured)}
    </section>

    <section class="wrap sec">
      <div class="band reveal">
        <div><p class="eyebrow">Thu cũ đổi mới</p><h2>Lên đời iPhone 17, trợ giá đến 2.000.000₫</h2><p>Định giá máy cũ trong 5 phút tại cửa hàng hoặc ngay khi giao hàng tận nơi.</p><a class="btn btn-primary" href="#/c/iphone">Chọn iPhone mới</a></div>
        <div class="band-art">${art('phone-pro', '#32374a', 'duo')}</div>
      </div>
    </section>

    <section class="wrap sec">
      <div class="sec-head reveal"><h2>Giá tốt hôm nay</h2><a class="more" href="#/c/sale">Tất cả khuyến mãi ${I.right}</a></div>
      ${grid(deals)}
    </section>
    ${recentBlock()}`,
    mount: startHero,
  };
}
function catCard(c, i) {
  const from = Math.min(...PRODUCTS.filter(p => p.cat === c.id).map(p => minPrice(p, ['new'])));
  return `<a class="cat reveal ${i < 2 ? 'cat-lg' : ''}" href="#/c/${c.id}">
    <div class="cat-copy"><h3>${c.name}</h3><p>${c.tagline}</p><span class="cat-from">Từ ${fmt(from)}</span><span class="cat-cta">Mua ngay ${I.right}</span></div>
    <div class="cat-art">${(p => p ? media(p) : art(c.art, c.color))(PRODUCTS.find(p => p.cat === c.id && PHOTOS[p.id]))}</div>
  </a>`;
}
function goSlide(i) {
  heroIdx = (i + HERO.length) % HERO.length;
  $$('.slide').forEach((s, k) => { const on = k === heroIdx; s.classList.toggle('on', on); on ? s.removeAttribute('aria-hidden') : s.setAttribute('aria-hidden', 'true'); $$('a,button', s).forEach(b => on ? b.removeAttribute('tabindex') : b.setAttribute('tabindex', '-1')); });
  $$('.dots button').forEach((d, k) => d.classList.toggle('on', k === heroIdx));
}
function startHero() {
  clearInterval(heroTimer);
  if (reduceMotion) return;
  const hero = $('.hero');
  const run = () => { clearInterval(heroTimer); heroTimer = setInterval(() => goSlide(heroIdx + 1), 6000); };
  hero.addEventListener('mouseenter', () => clearInterval(heroTimer));
  hero.addEventListener('mouseleave', run);
  hero.addEventListener('focusin', () => clearInterval(heroTimer));
  run();
}

// ---------- category
const FS = {}; // filter state per category
const PRICE_RANGES = {
  default: [['0-10', 'Dưới 10 triệu'], ['10-20', '10 – 20 triệu'], ['20-30', '20 – 30 triệu'], ['30-', 'Trên 30 triệu']],
  small: [['0-1', 'Dưới 1 triệu'], ['1-3', '1 – 3 triệu'], ['3-8', '3 – 8 triệu'], ['8-', 'Trên 8 triệu']],
};
const SORTS = [['pop', 'Phổ biến nhất'], ['asc', 'Giá thấp → cao'], ['desc', 'Giá cao → thấp'], ['new', 'Mới nhất'], ['rating', 'Đánh giá cao']];
const storageLabel = s => s[0].replace(' Wi‑Fi', '');
const gb = l => { const m = [...l.matchAll(/(\d+)\s*(GB|TB)/g)].pop(); return m ? +m[1] * (m[2] === 'TB' ? 1024 : 1) : 0; };

function category(cid) {
  const isSaleCat = cid === 'sale';
  const cat = isSaleCat ? { id: 'sale', name: 'Khuyến mãi', tagline: 'Giá tốt nhất cho thiết bị Apple chính hãng, cập nhật mỗi ngày.' } : catOf(cid);
  if (!cat) return notFound();
  const base = isSaleCat ? PRODUCTS.filter(isSale) : PRODUCTS.filter(p => p.cat === cid);
  const F = FS[cid] ||= { price: '', line: [], storage: [], color: [], stock: [], year: [], cond: [], sort: 'pop' };
  const uniq = arr => [...new Set(arr)];
  const opts = {
    line: uniq(base.map(p => p.line)),
    storage: uniq(base.flatMap(p => p.storages.map(storageLabel))).sort((a, b) => gb(a) - gb(b)),
    color: uniq(base.flatMap(p => p.colors.map(c => c.name))), // grouped by name: several models share “Trắng”, “Đen”…
    stock: [['in', 'Còn hàng'], ['soon', 'Hàng sắp về']],
    year: uniq(base.map(p => String(p.year))).sort().reverse(),
    cond: Object.entries(CONDS).filter(([k]) => base.some(p => p.conds.includes(k))).map(([k, c]) => [k, c.label]),
  };
  const ranges = ['airpods', 'accessory', 'watch'].includes(cid) ? PRICE_RANGES.small : PRICE_RANGES.default;

  const filtered = () => {
    const [lo, hi] = F.price ? F.price.split('-').map(x => x === '' ? Infinity : +x * 1e6) : [0, Infinity];
    const list = base.filter(p => {
      const mp = minPrice(p, F.cond);
      return mp >= lo && mp <= hi
        && (!F.line.length || F.line.includes(p.line))
        && (!F.storage.length || p.storages.some(s => F.storage.includes(storageLabel(s))))
        && (!F.color.length || p.colors.some(c => F.color.includes(c.name)))
        && (!F.stock.length || F.stock.includes(p.stock))
        && (!F.year.length || F.year.includes(String(p.year)))
        && (!F.cond.length || p.conds.some(c => F.cond.includes(c)));
    });
    const by = { pop: (a, b) => b.reviews - a.reviews, asc: (a, b) => minPrice(a) - minPrice(b), desc: (a, b) => minPrice(b) - minPrice(a), new: (a, b) => b.year - a.year, rating: (a, b) => b.rating - a.rating }[F.sort];
    return list.sort(by);
  };
  const activeChips = () => {
    const chips = [];
    if (F.price) chips.push(['price', F.price, ranges.find(r => r[0] === F.price)?.[1]]);
    F.line.forEach(v => chips.push(['line', v, v]));
    F.storage.forEach(v => chips.push(['storage', v, v]));
    F.color.forEach(v => chips.push(['color', v, v]));
    F.stock.forEach(v => chips.push(['stock', v, opts.stock.find(o => o[0] === v)[1]]));
    F.year.forEach(v => chips.push(['year', v, 'Năm ' + v]));
    F.cond.forEach(v => chips.push(['cond', v, CONDS[v].label]));
    return chips;
  };
  const chk = (k, v, label, extra = '') => `<label class="${k === 'color' ? 'swatch-opt' : 'chip'}"><input type="checkbox" data-f="${k}" value="${esc(v)}" ${F[k].includes(v) ? 'checked' : ''}>${extra}<span>${esc(label)}</span></label>`;
  const group = (legend, body, show = true) => show ? `<fieldset><legend>${legend}</legend><div class="fopts">${body}</div></fieldset>` : '';

  const updateResults = () => {
    const list = filtered(), chips = activeChips();
    $('#grid').innerHTML = list.length ? grid(list) : `<div class="empty small"><h2>Không có sản phẩm phù hợp</h2><p>Thử bỏ bớt bộ lọc hoặc chọn khoảng giá khác.</p><button class="btn btn-primary" data-act="filter-clear">Xoá bộ lọc</button></div>`;
    $$('[data-result-count]').forEach(el => el.textContent = list.length);
    $('#active').innerHTML = chips.map(([k, v, l]) => `<button class="achip" data-act="chip-remove" data-k="${k}" data-v="${esc(v)}" aria-label="Bỏ lọc ${esc(l)}">${esc(l)} ${I.x}</button>`).join('') + (chips.length ? '<button class="link" data-act="filter-clear">Xoá tất cả</button>' : '');
    $('#filter-count').textContent = chips.length ? `(${chips.length})` : '';
    $$('.qline').forEach(b => b.classList.toggle('on', F.line.length === 1 && F.line[0] === b.dataset.v));
    revealAll();
  };
  categoryCtl = { F, updateResults };

  return {
    title: cat.name,
    skeleton: `<div class="wrap page">${crumbs([[cat.name]])}<div class="sk sk-line w20 tall"></div><div class="cat-layout"><div class="sk sk-aside"></div><div>${skGrid()}</div></div></div>`,
    render: () => `
    <div class="wrap page">
      ${crumbs([[cat.name]])}
      <header class="page-head"><h1>${cat.name}</h1><p>${cat.tagline}</p></header>
      ${opts.line.length > 1 ? `<div class="qlines" aria-label="Dòng sản phẩm">${opts.line.map(l => `<button class="qline" data-act="quick-line" data-v="${esc(l)}">${esc(l)}</button>`).join('')}</div>` : ''}
      <div class="cat-layout">
        <aside class="filters" id="filters" aria-label="Bộ lọc sản phẩm">
          <div class="filters-head"><h2>Bộ lọc</h2><button class="icon-btn only-sm" data-act="filter-close" aria-label="Đóng bộ lọc">${I.x}</button></div>
          <form id="filter-form">
            ${group('Khoảng giá', `<label class="chip"><input type="radio" name="price" data-f="price" value="" ${F.price ? '' : 'checked'}><span>Tất cả</span></label>` + ranges.map(([v, l]) => `<label class="chip"><input type="radio" name="price" data-f="price" value="${v}" ${F.price === v ? 'checked' : ''}><span>${l}</span></label>`).join(''))}
            ${group('Dòng sản phẩm', opts.line.map(l => chk('line', l, l)).join(''), opts.line.length > 1)}
            ${group(cid === 'mac' ? 'Cấu hình' : 'Dung lượng / phiên bản', opts.storage.map(s => chk('storage', s, s)).join(''), opts.storage.length > 1)}
            ${group('Màu sắc', opts.color.map(n => chk('color', n, n, `<i style="--c:${base.flatMap(p => p.colors).find(c => c.name === n).hex}"></i>`)).join(''), opts.color.length > 1)}
            ${group('Tình trạng', opts.stock.map(([v, l]) => chk('stock', v, l)).join(''))}
            ${group('Năm sản xuất', opts.year.map(y => chk('year', y, y)).join(''), opts.year.length > 1)}
            ${group('Hình thức', opts.cond.map(([v, l]) => chk('cond', v, l)).join(''), opts.cond.length > 1)}
          </form>
          <div class="filters-foot only-sm"><button class="btn btn-primary btn-block" data-act="filter-close">Xem <span data-result-count></span> sản phẩm</button></div>
        </aside>
        <div class="cat-main">
          <div class="toolbar">
            <button class="btn btn-outline btn-sm only-sm" data-act="filter-open">${I.filter} Bộ lọc <span id="filter-count"></span></button>
            <p class="result"><b data-result-count></b> sản phẩm</p>
            <label class="sort"><span>Sắp xếp</span><select id="sort" data-f="sort">${SORTS.map(([v, l]) => `<option value="${v}" ${F.sort === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
          </div>
          <div class="active" id="active"></div>
          <div id="grid"></div>
        </div>
      </div>
      <div class="scrim" data-act="filter-close"></div>
    </div>`,
    mount: updateResults,
  };
}
let categoryCtl = null;
function readFilters() {
  const { F } = categoryCtl, form = $('#filter-form');
  F.price = $('[data-f=price]:checked', form)?.value || '';
  ['line', 'storage', 'color', 'stock', 'year', 'cond'].forEach(k => F[k] = $$(`[data-f=${k}]:checked`, form).map(i => i.value));
  F.sort = $('#sort').value;
  categoryCtl.updateResults();
}
function syncFilterInputs() {
  const { F } = categoryCtl;
  $$('#filter-form input').forEach(i => i.checked = i.type === 'radio' ? (F.price === i.value) : F[i.dataset.f].includes(i.value));
}

// ---------- product detail
let pd = {};
const VIEW_LABEL = { duo: 'Tổng quan', back: 'Mặt sau', front: 'Mặt trước', main: 'Tổng quan', case: 'Hộp sạc', tilt: 'Góc nghiêng' };
const CAT_COPY = {
  iphone: [['Thiết kế bền bỉ', 'Khung kim loại nguyên khối, mặt kính Ceramic Shield thế hệ mới chống trầy và va đập tốt hơn, cầm chắc và nhẹ tay.'], ['Camera chuyên nghiệp', 'Cảm biến 48MP cho ảnh chi tiết cả ngày lẫn đêm, quay video 4K Dolby Vision, chế độ chân dung thế hệ mới.'], ['Pin trọn ngày', 'Chip Apple tối ưu điện năng, sạc nhanh USB‑C và MagSafe, dùng thoải mái từ sáng đến tối.']],
  ipad: [['Màn hình tuyệt đẹp', 'Màu sắc chính xác, độ sáng cao, lý tưởng để đọc, vẽ và xem phim.'], ['Sáng tạo không giới hạn', 'Kết hợp Apple Pencil và bàn phím để ghi chú, thiết kế hay làm việc như một chiếc laptop.'], ['iPadOS 26', 'Đa nhiệm cửa sổ linh hoạt, Apple Intelligence hỗ trợ viết và tóm tắt.']],
  mac: [['Chip Apple', 'Hiệu năng vượt trội cho lập trình, dựng video và đồ hoạ, vận hành mát và êm.'], ['Pin cả ngày', 'Làm việc cả ngày không cần mang sạc, sạc nhanh qua MagSafe.'], ['Hệ sinh thái liền mạch', 'Sao chép giữa iPhone và Mac, AirDrop, Continuity Camera và iPhone Mirroring.']],
  watch: [['Sức khoẻ toàn diện', 'Theo dõi nhịp tim, ECG, SpO2, giấc ngủ và cảnh báo bất thường.'], ['Luyện tập thông minh', 'Hàng chục chế độ tập, GPS chính xác, vòng hoạt động tạo động lực mỗi ngày.'], ['An toàn', 'Phát hiện té ngã, phát hiện va chạm, SOS khẩn cấp.']],
  airpods: [['Chống ồn chủ động', 'Loại bỏ tiếng ồn xung quanh, chế độ Xuyên âm thích ứng khi cần nghe môi trường.'], ['Âm thanh không gian', 'Theo dõi chuyển động đầu cho trải nghiệm như rạp hát.'], ['Kết nối tức thì', 'Mở nắp là kết nối, tự chuyển giữa iPhone, iPad và Mac.']],
  accessory: [['Chính hãng', 'Phụ kiện Apple chính hãng, tương thích hoàn hảo và an toàn cho thiết bị.'], ['Bền bỉ', 'Vật liệu cao cấp, kiểm định chất lượng nghiêm ngặt.'], ['Bảo hành 12 tháng', '1 đổi 1 nếu lỗi do nhà sản xuất.']],
};
const POLICY = {
  warranty: ['Chính sách bảo hành', ['Máy mới: bảo hành chính hãng Apple 12 tháng tại các trung tâm uỷ quyền trên toàn quốc.', 'Máy like new: bảo hành TD Mobile Store 6 tháng, 1 đổi 1 trong 30 ngày đầu nếu lỗi phần cứng.', 'Máy đã qua sử dụng: bảo hành TD Mobile Store 3 tháng cho lỗi phần cứng.', 'Không áp dụng cho máy rơi vỡ, vào nước hoặc can thiệp phần mềm trái phép.']],
  returns: ['Chính sách đổi trả', ['1 đổi 1 trong 30 ngày nếu lỗi do nhà sản xuất, miễn phí.', 'Đổi sang sản phẩm khác trong 7 ngày: phí 5% giá trị hoá đơn, máy còn đủ hộp và phụ kiện.', 'Hoàn tiền trong 3–5 ngày làm việc qua phương thức thanh toán ban đầu.']],
  installment: ['Hướng dẫn trả góp', ['Trả góp 0% qua thẻ tín dụng của hơn 25 ngân hàng, kỳ hạn 6, 9 hoặc 12 tháng.', 'Trả góp qua công ty tài chính: chỉ cần CCCD, duyệt hồ sơ trong 15 phút.', 'Chọn “Trả góp” ở bước thanh toán, nhân viên sẽ gọi xác nhận trong 30 phút.']],
};
const FAQ = [
  ['Sản phẩm có phải hàng chính hãng không?', 'Tất cả sản phẩm máy mới tại TD Mobile Store là hàng chính hãng VN/A, có hoá đơn VAT và kích hoạt bảo hành Apple.'],
  ['Tôi có được kiểm tra hàng trước khi thanh toán?', 'Có. Với đơn COD bạn được mở hộp, kiểm tra ngoại hình và bật máy trước khi thanh toán.'],
  ['Thời gian giao hàng bao lâu?', 'Giao nhanh 2 giờ nội thành TP.HCM, Hà Nội, Đà Nẵng. Các tỉnh khác 1–3 ngày làm việc.'],
  ['Máy like new khác gì máy mới?', 'Máy like new đã kích hoạt, ngoại hình đẹp 99%, pin trên 90% và được TD Mobile Store kiểm tra 30 bước trước khi bán.'],
];

function product(id) {
  const p = byId(id);
  if (!p) return notFound('Không tìm thấy sản phẩm', 'Sản phẩm có thể đã ngừng kinh doanh hoặc đường dẫn không đúng.');
  if (pd.id !== id) pd = { id, s: 0, color: p.colors[0].key, cond: p.conds[0], qty: 1, img: 0, tab: 'desc' };
  pushRecent(id);
  const cat = catOf(p.cat), svgViews = artViews(p.art);
  const label = p.varLabel || 'Dung lượng';
  const related = PRODUCTS.filter(x => x.cat === p.cat && x.id !== id).slice(0, 4);
  return {
    title: p.name,
    skeleton: `<div class="wrap page">${crumbs([[cat.name, '#/c/' + cat.id], [p.name]])}<div class="pdp"><div class="sk sk-gallery"></div><div><div class="sk sk-line w40"></div><div class="sk sk-line w80 tall"></div><div class="sk sk-line w60"></div><div class="sk sk-block"></div><div class="sk sk-block"></div></div></div></div>`,
    render: () => {
      const v = variant(p, pd), photos = photosOf(p, v.color.key), views = photos || svgViews;
      if (pd.img >= views.length) pd.img = 0;
      const tabs = [['desc', 'Mô tả'], ['specs', 'Thông số kỹ thuật'], ['reviews', `Đánh giá (${p.reviews.toLocaleString('vi-VN')})`], ['warranty', 'Bảo hành'], ['returns', 'Đổi trả'], ['faq', 'Câu hỏi thường gặp']];
      const cta = p.stock === 'soon' ? 'Đặt trước' : 'Mua ngay';
      return `
      <div class="wrap page">
        ${crumbs([[cat.name, '#/c/' + cat.id], [p.name]])}
        <div class="pdp">
          <div class="gallery">
            <div class="g-main" id="g-main" title="Rê chuột để phóng to">${media(p, v.color.key, pd.img, views[pd.img])}</div>
            <div class="g-thumbs" role="group" aria-label="Ảnh sản phẩm">${views.map((vw, i) => `<button class="${i === pd.img ? 'on' : ''}" data-act="img" data-i="${i}" aria-label="${photos ? `Ảnh ${i + 1}` : VIEW_LABEL[vw]}" aria-pressed="${i === pd.img}">${media(p, v.color.key, i, vw)}</button>`).join('')}</div>
          </div>

          <div class="buy">
            <div class="buy-top"><div class="card-badges static">${badges(p)}</div><div class="buy-tools">${toolBtns(p)}</div></div>
            <h1>${esc(p.name)}</h1>
            <div class="rating">${stars(p.rating)}<span>${p.rating}</span><button class="link" data-act="tab" data-tab="reviews" data-scroll="1">${p.reviews.toLocaleString('vi-VN')} đánh giá</button></div>

            <div class="buy-price">${priceRow(v, 'lg')}<p class="installment">Trả góp 0% chỉ từ <b>${fmt(roundK(v.price / 12))}/tháng</b> · kỳ hạn 12 tháng</p></div>

            <div class="opt-group"><p class="opt-label">Màu sắc: <b>${esc(v.color.name)}</b></p>
              <div class="swatch-row">${p.colors.map(c => `<button class="sw ${c.key === v.color.key ? 'on' : ''}" style="--c:${c.hex}" data-act="pick" data-k="color" data-v="${c.key}" aria-label="${esc(c.name)}" aria-pressed="${c.key === v.color.key}" title="${esc(c.name)}"></button>`).join('')}</div></div>

            ${p.storages.length > 1 ? `<div class="opt-group"><p class="opt-label">${label}</p><div class="opt-row">${p.storages.map((s, i) => `<button class="opt ${i === v.si ? 'on' : ''}" data-act="pick" data-k="s" data-v="${i}" aria-pressed="${i === v.si}"><b>${esc(storageLabel(s))}</b><span>${fmt(variant(p, { ...pd, s: i }).price)}</span></button>`).join('')}</div></div>` : `<p class="opt-label">${label}: <b>${esc(p.storages[0][0])}</b></p>`}

            ${p.conds.length > 1 ? `<div class="opt-group"><p class="opt-label">Tình trạng máy</p><div class="opt-row">${p.conds.map(k => `<button class="opt ${k === v.cond ? 'on' : ''}" data-act="pick" data-k="cond" data-v="${k}" aria-pressed="${k === v.cond}"><b>${CONDS[k].label}</b><span>${CONDS[k].note}</span></button>`).join('')}</div></div>` : ''}

            <div class="opt-group qty-row"><p class="opt-label">Số lượng</p>
              <div class="stepper"><button data-act="pd-qty" data-i="-1" aria-label="Giảm số lượng" ${pd.qty <= 1 ? 'disabled' : ''}>${I.minus}</button><output aria-live="polite">${pd.qty}</output><button data-act="pd-qty" data-i="1" aria-label="Tăng số lượng" ${pd.qty >= 5 ? 'disabled' : ''}>${I.plus}</button></div>
              <span class="stock ${p.stock}">${p.stock === 'in' ? 'Còn hàng · giao trong 2 giờ' : 'Hàng sắp về · đặt trước giữ giá'}</span>
            </div>

            <div class="buy-cta">
              <button class="btn btn-primary btn-lg" data-act="pd-buy"><span>${cta}</span><small>Giao nhanh hoặc nhận tại cửa hàng</small></button>
              <button class="btn btn-outline btn-lg" data-act="pd-add">${I.cart} Thêm vào giỏ hàng</button>
            </div>

            <div class="promo"><h2>${I.gift} Khuyến mãi</h2><ul>${PROMOS.map(t => `<li>${I.check}${t}</li>`).join('')}</ul></div>
            <ul class="assure"><li>${I.shield}${v.cond === 'new' ? 'Bảo hành chính hãng 12 tháng' : CONDS[v.cond].note}</li><li>${I.refresh}Đổi trả 30 ngày</li><li>${I.truck}Miễn phí giao hàng</li></ul>
          </div>
        </div>

        <section class="pd-tabs" id="pd-tabs">
          <div class="tabs" role="tablist">${tabs.map(([k, l]) => `<button role="tab" aria-selected="${pd.tab === k}" data-act="tab" data-tab="${k}">${l}</button>`).join('')}</div>
          <div class="tab-panel" role="tabpanel">${tabPanel(p, v)}</div>
        </section>

        ${related.length ? `<section class="sec"><div class="sec-head"><h2>Có thể bạn cũng thích</h2></div>${grid(related)}</section>` : ''}
      </div>
      ${recentBlock(id)}
      <div class="sticky-cta"><div><b>${fmt(v.price)}</b><span>${esc(p.name)} · ${esc(storageLabel(p.storages[v.si]))}</span></div><button class="btn-icon" data-act="pd-add" aria-label="Thêm vào giỏ hàng">${I.cart}</button><button class="btn btn-primary" data-act="pd-buy">${cta}</button></div>`;
    },
    mount: mountZoom,
  };
}
function tabPanel(p, v) {
  switch (pd.tab) {
    case 'desc': return `<div class="desc"><div class="desc-hero"><div><p class="eyebrow">${esc(p.line)}</p><h2>${esc(p.tagline)}</h2></div><div class="desc-art">${media(p, v.color.key)}</div></div><div class="desc-grid">${CAT_COPY[p.cat].map(([t, d]) => `<div><h3>${t}</h3><p>${d}</p></div>`).join('')}</div></div>`;
    case 'specs': return `<table class="specs"><tbody>${Object.entries({ ...p.specs, 'Năm ra mắt': p.year, 'Màu sắc': p.colors.map(c => c.name).join(', '), [p.varLabel || 'Dung lượng']: p.storages.map(s => s[0]).join(', ') }).map(([k, val]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(val)}</td></tr>`).join('')}</tbody></table>`;
    case 'reviews': {
      const five = Math.round((p.rating - 3.9) * 85), dist = [five, 94 - five, 3, 2, 1];
      return `<div class="reviews"><div class="rv-sum"><b>${p.rating}</b>${stars(p.rating)}<span>${p.reviews.toLocaleString('vi-VN')} đánh giá</span>${[5, 4, 3, 2, 1].map((s, i) => `<div class="bar"><span>${s}★</span><i><em style="width:${Math.max(0, dist[i])}%"></em></i></div>`).join('')}</div>
        <ul class="rv-list">${REVIEW_POOL.map(([n, r, t], i) => `<li><div class="rv-head"><span class="avatar">${n[0]}</span><b>${n}</b>${stars(r)}<span class="verified">${I.check} Đã mua tại TD Mobile Store</span></div><p>${t}</p><small>${i + 2} ngày trước · ${esc(storageLabel(p.storages[i % p.storages.length]))}</small></li>`).join('')}</ul></div>`;
    }
    case 'warranty': case 'returns': return `<div class="policy"><h2>${POLICY[pd.tab][0]}</h2><ul>${POLICY[pd.tab][1].map(t => `<li>${I.check}${t}</li>`).join('')}</ul></div>`;
    case 'faq': return `<div class="faq">${FAQ.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</div>`;
  }
}
function mountZoom() {
  const box = $('#g-main');
  if (!box) return;
  const svg = () => box.firstElementChild;
  box.addEventListener('mousemove', e => { const r = box.getBoundingClientRect(); svg().style.transformOrigin = `${(e.clientX - r.left) / r.width * 100}% ${(e.clientY - r.top) / r.height * 100}%`; box.classList.add('zoom'); });
  box.addEventListener('mouseleave', () => box.classList.remove('zoom'));
  box.addEventListener('click', () => box.classList.toggle('zoom')); // touch: tap to zoom
}

// ---------- cart
function cartView() {
  return {
    title: 'Giỏ hàng',
    render: () => {
      const t = totals();
      if (!t.lines.length) return `<div class="wrap page">${crumbs([['Giỏ hàng']])}${empty('Giỏ hàng đang trống', 'Hãy chọn một thiết bị Apple bạn yêu thích. Chúng tôi giao nhanh trong 2 giờ.', ['Khám phá sản phẩm', '#/'])}</div>${recentBlock()}`;
      return `<div class="wrap page">
        ${crumbs([['Giỏ hàng']])}
        <header class="page-head"><h1>Giỏ hàng <span class="muted">(${cartCount()})</span></h1></header>
        <div class="cart-layout">
          <ul class="lines">${t.lines.map(l => `
            <li class="line">
              <a class="line-media" href="#/p/${l.id}" tabindex="-1" aria-hidden="true">${media(l.p, l.v.color.key)}</a>
              <div class="line-info">
                <a class="line-name" href="#/p/${l.id}">${esc(l.p.name)}</a>
                <p class="line-var">${esc(storageLabel(l.p.storages[l.v.si]))} · ${esc(l.v.color.name)} · ${CONDS[l.v.cond].label}</p>
                <div class="line-price">${priceRow(l.v, 'sm')}</div>
              </div>
              <div class="stepper sm"><button data-act="line-qty" data-key="${l.key}" data-i="-1" aria-label="Giảm số lượng" ${l.qty <= 1 ? 'disabled' : ''}>${I.minus}</button><output>${l.qty}</output><button data-act="line-qty" data-key="${l.key}" data-i="1" aria-label="Tăng số lượng" ${l.qty >= 5 ? 'disabled' : ''}>${I.plus}</button></div>
              <b class="line-total">${fmt(l.v.price * l.qty)}</b>
              <button class="line-remove" data-act="line-remove" data-key="${l.key}" aria-label="Xoá ${esc(l.p.name)} khỏi giỏ">${I.trash}<span>Xoá</span></button>
            </li>`).join('')}
          </ul>
          <aside class="summary">${summaryBox(t)}
            <form class="coupon" id="coupon-form">
              <label for="coupon-input">Mã giảm giá</label>
              <div class="coupon-row"><input id="coupon-input" placeholder="Nhập mã, ví dụ TDMOBILE500" value="${esc(S.coupon || '')}" autocomplete="off"><button class="btn btn-outline btn-sm">Áp dụng</button></div>
              <p class="field-msg" id="coupon-msg">${t.coupon ? `${I.check} ${t.coupon.text} <button type="button" class="link" data-act="coupon-remove">Bỏ mã</button>` : S.coupon ? `<span class="err">Mã ${esc(S.coupon)} chưa đủ điều kiện: đơn tối thiểu ${fmt(COUPONS[S.coupon].min)}.</span>` : 'Gợi ý: TDMOBILE500, WELCOME5'}</p>
            </form>
            <a class="btn btn-primary btn-lg btn-block" href="#/checkout">Tiến hành thanh toán</a>
            <p class="secure">${I.shield} Thanh toán bảo mật · Kiểm tra hàng trước khi nhận</p>
          </aside>
        </div>
      </div>`;
    },
  };
}
const summaryBox = t => `<h2>Tóm tắt đơn hàng</h2><dl class="sum">
  <div><dt>Tạm tính</dt><dd>${fmt(t.subtotal)}</dd></div>
  ${t.saved > 0 ? `<div class="saved"><dt>Tiết kiệm so với giá niêm yết</dt><dd>-${fmt(t.saved)}</dd></div>` : ''}
  <div><dt>Giảm giá${t.coupon ? ` (${S.coupon})` : ''}</dt><dd>${t.discount ? '-' + fmt(t.discount) : '0₫'}</dd></div>
  <div><dt>Phí vận chuyển</dt><dd>${t.shipFee ? fmt(t.shipFee) : 'Miễn phí'}</dd></div>
  <div class="total"><dt>Tổng tiền</dt><dd>${fmt(t.total)}<small>Đã gồm VAT</small></dd></div></dl>`;

// ---------- checkout
const co = { step: 1, info: {}, addr: {}, ship: 'standard', pay: 'cod', wallet: 'MoMo', months: 12 };
const SHIP = { standard: ['Giao tiêu chuẩn', '1–3 ngày · miễn phí từ 500.000₫'], express: ['Giao nhanh 2 giờ', 'Nội thành TP.HCM, Hà Nội, Đà Nẵng · 50.000₫'], pickup: ['Nhận tại cửa hàng', 'Giữ hàng 48 giờ · miễn phí'] };
const PAY = { cod: ['Thanh toán khi nhận hàng (COD)', 'Kiểm tra hàng rồi thanh toán'], bank: ['Chuyển khoản ngân hàng', 'Nhận thông tin chuyển khoản sau khi đặt'], wallet: ['Ví điện tử', 'MoMo, ZaloPay, VNPay, ShopeePay'], card: ['Thẻ ngân hàng', 'Visa, Mastercard, JCB, thẻ nội địa ATM'], installment: ['Trả góp', '0% qua thẻ tín dụng hoặc công ty tài chính'] };
const STEPS = ['Thông tin khách hàng', 'Địa chỉ giao hàng', 'Phương thức giao hàng', 'Phương thức thanh toán', 'Xác nhận đơn hàng'];

function checkout() {
  return {
    title: 'Thanh toán',
    render: () => {
      const t = totals(co.ship);
      if (!t.lines.length) return `<div class="wrap page">${empty('Chưa có sản phẩm để thanh toán', 'Giỏ hàng của bạn đang trống.', ['Tiếp tục mua sắm', '#/'])}</div>`;
      if (S.user && !co.info.name) co.info = { name: S.user.name, phone: S.user.phone, email: '' };
      const f = (id, label, val, attrs = '', hint = '') => `<div class="field"><label for="${id}">${label}</label><input id="${id}" name="${id}" value="${esc(val || '')}" ${attrs}><p class="field-msg" id="${id}-msg">${hint}</p></div>`;
      const section = (n, body, summary) => {
        const state = n < co.step ? 'done' : n === co.step ? 'open' : 'todo';
        return `<section class="co-step ${state}" aria-labelledby="st${n}">
          <header><span class="co-num">${state === 'done' ? I.check : n}</span><h2 id="st${n}">${STEPS[n - 1]}</h2>${state === 'done' ? `<button class="link" data-act="co-edit" data-i="${n}">Sửa</button>` : ''}</header>
          ${state === 'open' ? `<form class="co-body" id="co-form" data-step="${n}" novalidate>${body}</form>` : state === 'done' ? `<p class="co-sum">${summary}</p>` : ''}
        </section>`;
      };
      const radios = (name, map, cur) => `<div class="radios">${Object.entries(map).map(([k, [l, d]]) => `<label class="radio ${k === cur ? 'on' : ''}"><input type="radio" name="${name}" value="${k}" ${k === cur ? 'checked' : ''} data-co="${name}"><span><b>${l}</b><small>${d}</small></span></label>`).join('')}</div>`;
      const next = n => `<button class="btn btn-primary">${n === 4 ? 'Xem lại đơn hàng' : 'Tiếp tục'}</button>`;
      const payExtra = co.pay === 'wallet' ? `<div class="sub-opts">${['MoMo', 'ZaloPay', 'VNPay', 'ShopeePay'].map(w => `<label class="chip"><input type="radio" name="wallet" value="${w}" data-co="wallet" ${co.wallet === w ? 'checked' : ''}><span>${w}</span></label>`).join('')}</div>`
        : co.pay === 'installment' ? `<div class="sub-opts">${[6, 9, 12].map(m => `<label class="chip"><input type="radio" name="months" value="${m}" data-co="months" ${co.months === m ? 'checked' : ''}><span>${m} tháng · ${fmt(roundK(t.total / m))}/tháng</span></label>`).join('')}</div>`
        : co.pay === 'card' ? `<p class="note">${I.shield} Bạn sẽ được chuyển đến cổng thanh toán bảo mật của ngân hàng để nhập thông tin thẻ. TD Mobile Store không lưu thông tin thẻ.</p>` : '';

      return `<div class="wrap page">
        ${crumbs([['Giỏ hàng', '#/cart'], ['Thanh toán']])}
        <header class="page-head"><h1>Thanh toán</h1></header>
        <ol class="stepper-bar" aria-label="Tiến trình thanh toán">${STEPS.map((s, i) => `<li class="${i + 1 < co.step ? 'done' : i + 1 === co.step ? 'cur' : ''}" ${i + 1 === co.step ? 'aria-current="step"' : ''}><span>${i + 1}</span><em>${s}</em></li>`).join('')}</ol>
        <p class="stepper-cap">Bước ${co.step}/${STEPS.length} · <b>${STEPS[co.step - 1]}</b></p>
        <div class="co-layout">
          <div class="co-steps">
            ${section(1, `<div class="fields">${f('name', 'Họ và tên', co.info.name, 'autocomplete="name" required')}${f('phone', 'Số điện thoại', co.info.phone, 'type="tel" autocomplete="tel" inputmode="tel" required')}${f('email', 'Email (không bắt buộc)', co.info.email, 'type="email" autocomplete="email"', 'Nhận hoá đơn điện tử qua email')}</div>${next(1)}`, `${esc(co.info.name)} · ${esc(co.info.phone)}${co.info.email ? ' · ' + esc(co.info.email) : ''}`)}
            ${section(2, `<div class="fields"><div class="field"><label for="province">Tỉnh / Thành phố</label><select id="province" name="province" required><option value="">Chọn tỉnh / thành phố</option>${PROVINCES.map(x => `<option ${co.addr.province === x ? 'selected' : ''}>${x}</option>`).join('')}</select><p class="field-msg" id="province-msg"></p></div>${f('district', 'Quận / Huyện, Phường / Xã', co.addr.district, 'autocomplete="address-level2" required')}${f('street', 'Số nhà, tên đường', co.addr.street, 'autocomplete="street-address" required')}${f('note', 'Ghi chú cho người giao (không bắt buộc)', co.addr.note, '', 'Ví dụ: giao giờ hành chính')}</div>${next(2)}`, `${esc(co.addr.street)}, ${esc(co.addr.district)}, ${esc(co.addr.province)}`)}
            ${section(3, `${radios('ship', SHIP, co.ship)}${next(3)}`, SHIP[co.ship][0])}
            ${section(4, `${radios('pay', PAY, co.pay)}${payExtra}${next(4)}`, PAY[co.pay][0] + (co.pay === 'wallet' ? ` · ${co.wallet}` : co.pay === 'installment' ? ` · ${co.months} tháng` : ''))}
            ${section(5, `<dl class="review">
                <div><dt>Người nhận</dt><dd>${esc(co.info.name)} · ${esc(co.info.phone)}</dd></div>
                <div><dt>Giao đến</dt><dd>${co.ship === 'pickup' ? 'Nhận tại cửa hàng TD Mobile Store gần nhất' : `${esc(co.addr.street)}, ${esc(co.addr.district)}, ${esc(co.addr.province)}`}</dd></div>
                <div><dt>Giao hàng</dt><dd>${SHIP[co.ship][0]}</dd></div>
                <div><dt>Thanh toán</dt><dd>${PAY[co.pay][0]}</dd></div>
              </dl><p class="note">Bằng việc đặt hàng, bạn đồng ý với điều khoản mua hàng và chính sách đổi trả của TD Mobile Store.</p><button class="btn btn-primary btn-lg">Đặt hàng · ${fmt(t.total)}</button>`, '')}
          </div>
          <aside class="summary co-summary">
            <ul class="mini">${t.lines.map(l => `<li><span class="mini-media">${media(l.p, l.v.color.key)}<b>${l.qty}</b></span><span class="mini-info"><b>${esc(l.p.name)}</b><small>${esc(storageLabel(l.p.storages[l.v.si]))} · ${esc(l.v.color.name)}</small></span><span>${fmt(l.v.price * l.qty)}</span></li>`).join('')}</ul>
            ${summaryBox(t)}
            <a class="link" href="#/cart">Chỉnh sửa giỏ hàng</a>
          </aside>
        </div>
      </div>`;
    },
    mount: () => $('#co-form input, #co-form select')?.focus({ preventScroll: true }),
  };
}
function validate(fields) {
  let first = null;
  fields.forEach(([id, ok, msg]) => {
    const el = $('#' + id), m = $('#' + id + '-msg');
    el.setAttribute('aria-invalid', !ok);
    if (!ok) { m.innerHTML = `<span class="err">${msg}</span>`; first ||= el; } else if (m.querySelector('.err')) m.textContent = '';
    el.setAttribute('aria-describedby', id + '-msg');
  });
  first?.focus();
  return !first;
}
function submitStep(form) {
  const v = id => form.elements[id]?.value.trim() || '';
  const n = +form.dataset.step;
  if (n === 1) {
    if (!validate([['name', v('name').length >= 2, 'Nhập họ và tên người nhận.'], ['phone', /^(0|\+84)\d{9}$/.test(v('phone').replace(/\s/g, '')), 'Số điện thoại gồm 10 chữ số, bắt đầu bằng 0.'], ['email', !v('email') || /^\S+@\S+\.\S+$/.test(v('email')), 'Email chưa đúng định dạng, ví dụ ten@gmail.com.']])) return;
    co.info = { name: v('name'), phone: v('phone').replace(/\s/g, ''), email: v('email') };
  }
  if (n === 2) {
    if (!validate([['province', !!v('province'), 'Chọn tỉnh / thành phố.'], ['district', v('district').length >= 2, 'Nhập quận / huyện và phường / xã.'], ['street', v('street').length >= 3, 'Nhập số nhà và tên đường.']])) return;
    co.addr = { province: v('province'), district: v('district'), street: v('street'), note: v('note') };
  }
  if (n === 5) return placeOrder();
  co.step = n + 1;
  rerender();
  $('.co-step.open')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
}
function placeOrder() {
  const t = totals(co.ship);
  const order = { code: 'OR' + String(Date.now()).slice(-6), date: Date.now(), info: co.info, addr: co.addr, ship: co.ship, pay: co.pay, wallet: co.wallet, months: co.months, items: t.lines.map(l => ({ id: l.id, color: l.v.color.key, name: l.p.name, art: l.p.art, hex: l.v.color.hex, variant: `${storageLabel(l.p.storages[l.v.si])} · ${l.v.color.name}`, qty: l.qty, price: l.v.price })), total: t.total, discount: t.discount, shipFee: t.shipFee };
  S.orders = [order, ...S.orders]; save('orders');
  S.cart = []; save('cart');
  S.coupon = null; LS.set('coupon', null);
  co.step = 1;
  location.hash = '#/order/' + order.code;
}
function orderDone(code) {
  const o = S.orders.find(x => x.code === code);
  if (!o) return notFound('Không tìm thấy đơn hàng', 'Mã đơn hàng không tồn tại trên trình duyệt này.');
  return {
    title: 'Đặt hàng thành công',
    render: () => `<div class="wrap page narrow">
      <div class="order-done"><span class="done-ic">${I.check}</span><h1>Đặt hàng thành công</h1><p>Cảm ơn ${esc(o.info.name)}. Mã đơn của bạn là <b>${o.code}</b>. Nhân viên TD Mobile Store sẽ gọi xác nhận qua số ${esc(o.info.phone)} trong 15 phút.</p></div>
      ${o.pay === 'bank' ? `<div class="bank"><h2>Thông tin chuyển khoản</h2><dl class="review"><div><dt>Ngân hàng</dt><dd>Vietcombank — CN Sài Gòn</dd></div><div><dt>Số tài khoản</dt><dd>0071 000 686 868</dd></div><div><dt>Chủ tài khoản</dt><dd>CÔNG TY TNHH TD MOBILE STORE</dd></div><div><dt>Số tiền</dt><dd>${fmt(o.total)}</dd></div><div><dt>Nội dung</dt><dd><b>${o.code}</b></dd></div></dl></div>` : ''}
      <div class="summary"><ul class="mini">${o.items.map(i => `<li><span class="mini-media">${orderMedia(i)}<b>${i.qty}</b></span><span class="mini-info"><b>${esc(i.name)}</b><small>${esc(i.variant)}</small></span><span>${fmt(i.price * i.qty)}</span></li>`).join('')}</ul>
      <dl class="sum"><div><dt>Giao hàng</dt><dd>${SHIP[o.ship][0]}</dd></div><div><dt>Thanh toán</dt><dd>${PAY[o.pay][0]}</dd></div><div class="total"><dt>Tổng tiền</dt><dd>${fmt(o.total)}</dd></div></dl></div>
      <div class="done-cta"><a class="btn btn-primary" href="#/track?code=${o.code}&phone=${encodeURIComponent(o.info.phone)}">Theo dõi đơn hàng</a><a class="btn btn-outline" href="#/">Tiếp tục mua sắm</a></div>
    </div>`,
  };
}

// ---------- order tracking
const TRACK_STEPS = ['Đã đặt hàng', 'Đã xác nhận', 'Đang đóng gói', 'Đang giao hàng', 'Giao thành công'];
function track(_, q) {
  const code = (q.get('code') || '').toUpperCase(), phone = q.get('phone') || '';
  const o = code && S.orders.find(x => x.code === code && x.info.phone === phone);
  // ponytail: demo status advances with elapsed time; replace with order-status API.
  const stage = o ? Math.min(4, Math.floor((Date.now() - o.date) / 120000)) : 0;
  return {
    title: 'Theo dõi đơn hàng',
    render: () => `<div class="wrap page narrow">
      ${crumbs([['Theo dõi đơn hàng']])}
      <header class="page-head"><h1>Theo dõi đơn hàng</h1><p>Nhập mã đơn hàng và số điện thoại đã dùng khi đặt.</p></header>
      <form class="track-form" id="track-form">
        <div class="field"><label for="t-code">Mã đơn hàng</label><input id="t-code" name="code" placeholder="Ví dụ OR123456" value="${esc(code)}" required></div>
        <div class="field"><label for="t-phone">Số điện thoại</label><input id="t-phone" name="phone" type="tel" inputmode="tel" value="${esc(phone)}" required></div>
        <button class="btn btn-primary">Tra cứu</button>
      </form>
      ${code && !o ? `<div class="alert err" role="alert">${I.x}<div><b>Không tìm thấy đơn hàng ${esc(code)}</b><p>Kiểm tra lại mã đơn và số điện thoại, hoặc gọi 1800 6868 để được hỗ trợ.</p></div></div>` : ''}
      ${o ? `<div class="track-card"><div class="track-head"><div><p class="eyebrow">Đơn ${o.code}</p><h2>${TRACK_STEPS[stage]}</h2></div><span>${new Date(o.date).toLocaleString('vi-VN')}</span></div>
        <ol class="timeline">${TRACK_STEPS.map((s, i) => `<li class="${i <= stage ? 'done' : ''} ${i === stage ? 'cur' : ''}"><span></span><b>${s}</b></li>`).join('')}</ol>
        <ul class="mini">${o.items.map(i => `<li><span class="mini-media">${orderMedia(i)}<b>${i.qty}</b></span><span class="mini-info"><b>${esc(i.name)}</b><small>${esc(i.variant)}</small></span><span>${fmt(i.price * i.qty)}</span></li>`).join('')}</ul></div>` : ''}
      ${!code && S.orders.length ? `<div class="recent-orders"><h2>Đơn hàng gần đây trên thiết bị này</h2>${S.orders.slice(0, 5).map(x => `<a href="#/track?code=${x.code}&phone=${encodeURIComponent(x.info.phone)}"><b>${x.code}</b><span>${x.items.length} sản phẩm · ${fmt(x.total)}</span>${I.right}</a>`).join('')}</div>` : ''}
    </div>`,
  };
}

// ---------- search
function results(q) {
  const t = norm(q.trim());
  if (!t) return [];
  const words = t.split(/\s+/);
  return PRODUCTS.filter(p => { const hay = norm(`${p.name} ${p.line} ${catOf(p.cat).name} ${p.cat}`); return words.every(w => hay.includes(w)); });
}
function searchPage(_, q) {
  const term = q.get('q') || '', list = results(term);
  return {
    title: `Tìm “${term}”`,
    skeleton: `<div class="wrap page"><div class="sk sk-line w40 tall"></div>${skGrid(4)}</div>`,
    render: () => `<div class="wrap page">
      ${crumbs([['Tìm kiếm']])}
      <header class="page-head"><h1>${list.length} kết quả cho “${esc(term)}”</h1></header>
      ${list.length ? grid(list) : empty('Không tìm thấy sản phẩm phù hợp', 'Thử từ khoá ngắn hơn như “iPhone 17”, “MacBook” hoặc “AirPods”.', ['Xem tất cả iPhone', '#/c/iphone'])}
    </div>`,
  };
}
const POPULAR = ['iPhone 17 Pro Max', 'iPhone Air', 'MacBook Air M4', 'AirPods Pro 3', 'iPad Air', 'Apple Watch'];
function renderSearch() {
  const q = $('#search-input').value, list = results(q).slice(0, 6), box = $('#search-results');
  if (!q.trim()) {
    const recent = S.recent.map(byId).filter(Boolean).slice(0, 4);
    box.innerHTML = `<p class="sr-label">Tìm kiếm phổ biến</p><div class="sr-chips">${POPULAR.map(t => `<button class="chip" data-act="search-term" data-v="${t}">${t}</button>`).join('')}</div>${recent.length ? `<p class="sr-label">Đã xem gần đây</p>${recent.map(srRow).join('')}` : ''}`;
  } else box.innerHTML = list.length ? `<p class="sr-label">Sản phẩm</p>${list.map(srRow).join('')}<a class="sr-all" href="#/search?q=${encodeURIComponent(q)}">Xem tất cả kết quả cho “${esc(q)}” ${I.right}</a>` : `<div class="sr-empty"><b>Không có kết quả cho “${esc(q)}”</b><p>Kiểm tra chính tả hoặc thử từ khoá khác.</p></div>`;
}
const srRow = p => `<a class="sr-row" href="#/p/${p.id}"><span class="sr-media">${media(p)}</span><span><b>${esc(p.name)}</b><small>${catOf(p.cat).name}</small></span>${priceRow(variant(p), 'sm')}</a>`;
function openSearch() { const s = $('#search'); s.hidden = false; requestAnimationFrame(() => s.classList.add('on')); document.body.classList.add('lock'); renderSearch(); $('#search-input').focus(); }
function closeSearch() { const s = $('#search'); if (s.hidden) return; s.classList.remove('on'); document.body.classList.remove('lock'); setTimeout(() => s.hidden = true, 200); }

// ---------- wishlist / compare / account / misc
function wishlist() {
  return { title: 'Yêu thích', render: () => { const list = S.wish.map(byId).filter(Boolean); return `<div class="wrap page">${crumbs([['Yêu thích']])}<header class="page-head"><h1>Sản phẩm yêu thích</h1>${list.length ? `<p>${list.length} sản phẩm đã lưu</p>` : ''}</header>${list.length ? grid(list) : empty('Chưa có sản phẩm yêu thích', 'Nhấn biểu tượng trái tim trên sản phẩm để lưu lại và xem sau.')}</div>`; } };
}
function compare() {
  return {
    title: 'So sánh sản phẩm',
    render: () => {
      const list = S.compare.map(byId).filter(Boolean);
      if (!list.length) return `<div class="wrap page">${crumbs([['So sánh']])}${empty('Chưa có sản phẩm để so sánh', 'Nhấn biểu tượng so sánh trên thẻ sản phẩm để thêm tối đa 3 sản phẩm.', ['Chọn iPhone', '#/c/iphone'])}</div>`;
      const keys = [...new Set(list.flatMap(p => Object.keys(p.specs)))];
      return `<div class="wrap page">${crumbs([['So sánh']])}<header class="page-head"><h1>So sánh sản phẩm</h1><p>Đang so sánh ${list.length}/3 sản phẩm.</p></header>
        <div class="cmp-wrap"><table class="cmp"><thead><tr><th scope="col"><span class="sr">Thuộc tính</span></th>${list.map(p => { const v = variant(p); return `<th scope="col"><button class="cmp-x" data-act="compare" data-id="${p.id}" aria-label="Bỏ ${esc(p.name)} khỏi so sánh">${I.x}</button><a href="#/p/${p.id}" class="cmp-media">${media(p, v.color.key)}</a><a href="#/p/${p.id}" class="cmp-name">${esc(p.name)}</a>${priceRow(v, 'sm')}<button class="btn btn-primary btn-sm" data-act="add" data-id="${p.id}">Thêm vào giỏ</button></th>`; }).join('')}</tr></thead>
        <tbody><tr><th scope="row">Đánh giá</th>${list.map(p => `<td>${stars(p.rating)} ${p.rating}</td>`).join('')}</tr><tr><th scope="row">Phiên bản</th>${list.map(p => `<td>${p.storages.map(s => esc(storageLabel(s))).join(', ')}</td>`).join('')}</tr>${keys.map(k => `<tr><th scope="row">${esc(k)}</th>${list.map(p => `<td>${esc(p.specs[k] || '—')}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`;
    },
  };
}
let otpFor = null;
function account() {
  return {
    title: 'Tài khoản',
    render: () => S.user ? `<div class="wrap page">
        ${crumbs([['Tài khoản']])}
        <header class="page-head"><h1>Xin chào, ${esc(S.user.name)}</h1><p>${esc(S.user.phone)}</p></header>
        <div class="acc-stats"><a href="#/track"><b>${S.orders.length}</b>Đơn hàng</a><a href="#/wishlist"><b>${S.wish.length}</b>Yêu thích</a><a href="#/compare"><b>${S.compare.length}</b>So sánh</a></div>
        <section class="sec"><div class="sec-head"><h2>Đơn hàng của bạn</h2></div>${S.orders.length ? `<div class="recent-orders">${S.orders.map(x => `<a href="#/track?code=${x.code}&phone=${encodeURIComponent(x.info.phone)}"><b>${x.code}</b><span>${new Date(x.date).toLocaleDateString('vi-VN')} · ${x.items.length} sản phẩm · ${fmt(x.total)}</span>${I.right}</a>`).join('')}</div>` : '<p class="muted">Bạn chưa có đơn hàng nào.</p>'}</section>
        <button class="btn btn-outline" data-act="logout">Đăng xuất</button>
      </div>${recentBlock()}`
      : `<div class="wrap page narrow"><div class="auth">
        <h1>Đăng nhập</h1><p>Theo dõi đơn hàng, lưu sản phẩm yêu thích và nhận ưu đãi dành riêng cho thành viên.</p>
        <form id="login-form" novalidate>
          ${otpFor ? `<div class="field"><label for="otp">Mã OTP gửi đến ${esc(otpFor.phone)}</label><input id="otp" name="otp" inputmode="numeric" autocomplete="one-time-code" maxlength="6" required><p class="field-msg" id="otp-msg">Bản demo: nhập 6 chữ số bất kỳ.</p></div><button class="btn btn-primary btn-block">Xác nhận</button><button type="button" class="link" data-act="otp-back">Đổi số điện thoại</button>`
          : `<div class="field"><label for="l-name">Họ và tên</label><input id="l-name" name="name" autocomplete="name" required><p class="field-msg" id="l-name-msg"></p></div><div class="field"><label for="l-phone">Số điện thoại</label><input id="l-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" required><p class="field-msg" id="l-phone-msg"></p></div><button class="btn btn-primary btn-block">Nhận mã OTP</button>`}
        </form></div></div>`,
  };
}
function categoriesPage() {
  return { title: 'Danh mục', render: () => `<div class="wrap page"><header class="page-head"><h1>Danh mục</h1></header><div class="cats">${CATEGORIES.map((c, i) => catCard(c, i)).join('')}</div><a class="cat-sale" href="#/c/sale">Khuyến mãi hôm nay ${I.right}</a></div>` };
}
function policy(k) {
  const pol = POLICY[k];
  if (!pol) return notFound();
  return { title: pol[0], render: () => `<div class="wrap page narrow">${crumbs([[pol[0]]])}<div class="policy"><h1>${pol[0]}</h1><ul>${pol[1].map(t => `<li>${I.check}${t}</li>`).join('')}</ul></div></div>` };
}
function notFound(title = 'Không tìm thấy trang', text = 'Đường dẫn có thể đã thay đổi hoặc không tồn tại.') {
  return { title, render: () => `<div class="wrap page">${empty(title, text, ['Về trang chủ', '#/'])}</div>` };
}

// =====================================================================
// Router
// =====================================================================
const ROUTES = [
  [/^\/?$/, home], [/^\/c\/([\w-]+)$/, category], [/^\/p\/([\w-]+)$/, product], [/^\/cart$/, cartView], [/^\/checkout$/, checkout],
  [/^\/order\/(\w+)$/, orderDone], [/^\/track$/, track], [/^\/search$/, searchPage], [/^\/wishlist$/, wishlist], [/^\/compare$/, compare],
  [/^\/account$/, account], [/^\/categories$/, categoriesPage], [/^\/policy\/(\w+)$/, policy],
];
let view = null, navToken = 0;
async function router() {
  if (location.hash && !location.hash.startsWith('#/')) return; // in-page anchors (skip link)
  const tok = ++navToken;
  const [path, qs = ''] = location.hash.slice(1).split('?');
  const q = new URLSearchParams(qs);
  clearInterval(heroTimer);
  closeSearch();
  document.body.classList.remove('filters-open');
  let v = null;
  for (const [re, fn] of ROUTES) { const m = path.match(re); if (m) { v = fn(m[1], q); break; } }
  v ||= notFound();
  document.title = v.title ? `${v.title} — TD Mobile Store` : 'TD Mobile Store — Thiết bị Apple chính hãng';
  window.scrollTo(0, 0);
  if (v.skeleton) {
    app.innerHTML = v.skeleton; app.setAttribute('aria-busy', 'true');
    await sleep(350); // ponytail: simulated API latency so skeletons are exercised; drop when data comes from a real API
    if (tok !== navToken) return;
    app.removeAttribute('aria-busy');
  }
  view = v;
  app.innerHTML = v.render();
  afterRender(true);
  v.mount?.();
  const top = path.split('/')[1] || '';
  $$('.nav a').forEach(a => a.getAttribute('href') === '#' + path ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
  const tab = { '': 'home', categories: 'categories', c: 'categories', cart: 'cart', checkout: 'cart', account: 'account', search: 'search' }[top];
  $$('.bnav [data-tab]').forEach(a => a.classList.toggle('on', a.dataset.tab === tab));
  document.body.dataset.page = top || 'home';
  renderChrome();
}
function rerender() {
  const a = document.activeElement, d = a?.dataset || {};
  const sel = d.act ? `[data-act="${d.act}"]` + ['k', 'v', 'i', 'key', 'id', 'tab'].map(x => d[x] != null ? `[data-${x}="${CSS.escape(d[x])}"]` : '').join('') : a?.name && a.type === 'radio' ? `[name="${a.name}"][value="${CSS.escape(a.value)}"]` : a?.id ? '#' + a.id : null;
  const y = scrollY;
  app.innerHTML = view.render();
  afterRender(false);
  view.mount?.();
  window.scrollTo(0, y);
  if (sel) $(sel)?.focus({ preventScroll: true });
  renderChrome();
}

// scroll reveal
const io = 'IntersectionObserver' in window && !reduceMotion ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' }) : null;
function afterRender(animate) { $$('.reveal:not(.in)', app).forEach(el => animate && io ? io.observe(el) : el.classList.add('in')); }
function revealAll() { $$('.reveal:not(.in)', app).forEach(el => el.classList.add('in')); }

// =====================================================================
// Events
// =====================================================================
document.addEventListener('click', e => {
  const t = e.target.closest('[data-act]');
  if (!t) return;
  const { act, id, k, i, key } = t.dataset;
  switch (act) {
    case 'add': addToCart(id, null, t); break;
    case 'buy': addToCart(id, null, null, true); location.hash = '#/checkout'; break;
    case 'wish': case 'compare': toggleList(act, id); break;
    case 'compare-clear': S.compare = []; save('compare'); $$('[data-act=compare]').forEach(b => { b.classList.remove('on'); b.setAttribute('aria-pressed', false); }); break;
    case 'open-search': openSearch(); break;
    case 'close-search': closeSearch(); break;
    case 'search-term': $('#search-input').value = t.dataset.v; renderSearch(); $('#search-input').focus(); break;
    case 'slide': goSlide(+i); break;
    case 'slide-step': goSlide(heroIdx + +i); break;
    case 'pick': pd[k] = k === 's' ? +t.dataset.v : t.dataset.v; rerender(); break;
    case 'img': pd.img = +i; rerender(); break;
    case 'pd-qty': pd.qty = Math.max(1, Math.min(5, pd.qty + +i)); rerender(); break;
    case 'pd-add': case 'pd-buy': {
      const p = byId(pd.id), v = { ...variant(p, pd), qty: pd.qty };
      if (act === 'pd-buy') { addToCart(pd.id, v, null, true); location.hash = '#/checkout'; } else addToCart(pd.id, v, $('#g-main'));
      break;
    }
    case 'tab': pd.tab = t.dataset.tab; rerender(); if (t.dataset.scroll) $('#pd-tabs').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }); break;
    case 'line-qty': { const l = S.cart.find(x => x.key === key); l.qty = Math.max(1, Math.min(5, l.qty + +i)); save('cart'); rerender(); break; }
    case 'line-remove': {
      const idx = S.cart.findIndex(x => x.key === key), [removed] = S.cart.splice(idx, 1);
      save('cart'); rerender();
      toast(`Đã xoá <b>${esc(byId(removed.id).name)}</b>`, ['Hoàn tác', '', () => { S.cart.splice(idx, 0, removed); save('cart'); rerender(); }]);
      break;
    }
    case 'coupon-remove': S.coupon = null; LS.set('coupon', null); rerender(); break;
    case 'filter-open': document.body.classList.add('filters-open'); $('#filters button, #filters input')?.focus(); break;
    case 'filter-close': document.body.classList.remove('filters-open'); break;
    case 'filter-clear': Object.assign(categoryCtl.F, { price: '', line: [], storage: [], color: [], stock: [], year: [], cond: [] }); syncFilterInputs(); categoryCtl.updateResults(); break;
    case 'chip-remove': { const F = categoryCtl.F; if (k === 'price') F.price = ''; else F[k] = F[k].filter(x => x !== t.dataset.v); syncFilterInputs(); categoryCtl.updateResults(); break; }
    case 'quick-line': { const F = categoryCtl.F, v = t.dataset.v; F.line = F.line.length === 1 && F.line[0] === v ? [] : [v]; syncFilterInputs(); categoryCtl.updateResults(); break; }
    case 'co-edit': co.step = +i; rerender(); break;
    case 'logout': S.user = null; LS.set('user', null); toast('Đã đăng xuất', null, 'info'); rerender(); break;
    case 'otp-back': otpFor = null; rerender(); break;
  }
});

document.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.f && categoryCtl && $('#filter-form')) readFilters();
  if (t.dataset.co) { co[t.dataset.co] = t.dataset.co === 'months' ? +t.value : t.value; rerender(); }
});

document.addEventListener('submit', e => {
  const f = e.target;
  e.preventDefault();
  if (f.id === 'search-form') { const q = $('#search-input').value.trim(); if (q) location.hash = '#/search?q=' + encodeURIComponent(q); }
  if (f.id === 'co-form') submitStep(f);
  if (f.id === 'coupon-form') {
    const code = $('#coupon-input').value.trim().toUpperCase();
    if (!COUPONS[code]) { $('#coupon-msg').innerHTML = `<span class="err">Mã “${esc(code || '…')}” không hợp lệ hoặc đã hết hạn.</span>`; $('#coupon-input').setAttribute('aria-invalid', 'true'); return; }
    S.coupon = code; LS.set('coupon', code); rerender();
    if (totals().coupon) toast(`Đã áp dụng mã <b>${code}</b>`);
  }
  if (f.id === 'track-form') location.hash = `#/track?code=${encodeURIComponent(f.code.value.trim().toUpperCase())}&phone=${encodeURIComponent(f.phone.value.replace(/\s/g, ''))}`;
  if (f.id === 'login-form') {
    if (otpFor) {
      if (!validate([['otp', /^\d{6}$/.test(f.otp.value), 'Mã OTP gồm 6 chữ số.']])) return;
      S.user = otpFor; LS.set('user', S.user); otpFor = null; toast(`Chào mừng ${esc(S.user.name)}`); rerender();
    } else {
      const name = f.name.value.trim(), phone = f.phone.value.replace(/\s/g, '');
      if (!validate([['l-name', name.length >= 2, 'Nhập họ và tên.'], ['l-phone', /^(0|\+84)\d{9}$/.test(phone), 'Số điện thoại gồm 10 chữ số, bắt đầu bằng 0.']])) return;
      otpFor = { name, phone }; rerender();
    }
  }
});

$('#search-input').addEventListener('input', renderSearch);
$('#search').addEventListener('click', e => { if (e.target.id === 'search') closeSearch(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeSearch(); document.body.classList.remove('filters-open'); }
  if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); }
});
const hdr = $('#hdr');
addEventListener('scroll', () => hdr.classList.toggle('scrolled', scrollY > 8), { passive: true });
addEventListener('hashchange', router);
router();
