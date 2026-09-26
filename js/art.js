// Product renders drawn as SVG so every colour option gets its own image.
// ponytail: stand-in for real product photography; swap art() for <img> once licensed photos exist.
let _gid = 0;

function shade(hex, amt) { // amt -1 (black) .. 1 (white)
  const n = parseInt(hex.slice(1), 16), t = amt < 0 ? 0 : 255, p = Math.abs(amt);
  const ch = s => Math.round(((n >> s) & 255) + (t - ((n >> s) & 255)) * p);
  return '#' + ((1 << 24) + (ch(16) << 16) + (ch(8) << 8) + ch(0)).toString(16).slice(1);
}
function wallColor(hex) { // greys make dull wallpapers; tint them blue
  const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  return Math.max(r, g, b) - Math.min(r, g, b) < 28 ? '#7c7c82' : hex;
}

const ART_VIEWS = {
  'phone-pro': ['duo', 'back', 'front'], 'phone-air': ['duo', 'back', 'front'], phone: ['duo', 'back', 'front'], 'phone-e': ['duo', 'back', 'front'],
  tablet: ['duo', 'front', 'back'], 'tablet-pro': ['duo', 'front', 'back'],
  laptop: ['front', 'back'], 'laptop-pro': ['front', 'back'], imac: ['front', 'back'], macmini: ['front', 'back'],
  'airpods-pro': ['main', 'case'], airpods: ['main', 'case'],
};
const artViews = type => ART_VIEWS[type] || ['main', 'tilt'];

function art(type, hex, view) {
  view = view || artViews(type)[0];
  const id = 'g' + (++_gid), c = hex, w = wallColor(hex);
  const defs = `
    <linearGradient id="${id}b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(c, .3)}"/><stop offset=".55" stop-color="${c}"/><stop offset="1" stop-color="${shade(c, -.18)}"/></linearGradient>
    <radialGradient id="${id}w" cx=".28" cy=".2" r="1.1"><stop offset="0" stop-color="${shade(w, .25)}"/><stop offset=".45" stop-color="${shade(w, -.35)}"/><stop offset="1" stop-color="#07070a"/></radialGradient>
    <linearGradient id="${id}s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#f1f1f3"/><stop offset="1" stop-color="#d9d9de"/></linearGradient>`;
  const B = `url(#${id}b)`, W = `url(#${id}w)`, S = `url(#${id}s)`;
  const out = (vb, body) => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><defs>${defs}</defs>${body}</svg>`;
  const tilt = (cx, cy, body) => view === 'tilt' ? `<g transform="rotate(-12 ${cx} ${cy})">${body}</g>` : body;
  const lens = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r + 3}" fill="${shade(c, -.2)}"/><circle cx="${x}" cy="${y}" r="${r}" fill="#15161a"/><circle cx="${x}" cy="${y}" r="${r * .55}" fill="#252a35"/><circle cx="${x - r * .3}" cy="${y - r * .3}" r="${r * .2}" fill="#fff" opacity=".35"/>`;
  const clock = (x, y, size) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="Inter Tight, Inter, sans-serif" font-size="${size}" font-weight="600" fill="#fff" fill-opacity=".92" letter-spacing="-1">9:41</text>`;
  const shadow = (cx, cy, rx) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${rx * .06}" fill="#000" opacity=".07"/>`;

  // ---- phones (180 x 372)
  const phoneBack = kind => {
    let cam = '';
    if (kind === 'phone-pro') cam = `<rect x="9" y="9" width="162" height="116" rx="27" fill="${shade(c, -.07)}" stroke="${shade(c, .18)}" stroke-width="1.5"/>${lens(44, 42, 17)}${lens(44, 94, 17)}${lens(88, 68, 17)}<circle cx="136" cy="44" r="7" fill="#f3efe4"/><circle cx="136" cy="92" r="7" fill="#1c1c1f"/>`;
    else if (kind === 'phone-air') cam = `<rect x="12" y="14" width="156" height="48" rx="24" fill="${shade(c, -.1)}"/>${lens(40, 38, 14)}<circle cx="142" cy="38" r="5" fill="#f3efe4"/>`;
    else if (kind === 'phone-e') cam = `<rect x="14" y="14" width="48" height="48" rx="15" fill="${shade(c, -.06)}"/>${lens(38, 38, 14)}<circle cx="76" cy="24" r="5" fill="#f3efe4"/>`;
    else cam = `<rect x="14" y="14" width="50" height="96" rx="25" fill="${shade(c, -.06)}" stroke="${shade(c, .18)}"/>${lens(39, 39, 14)}${lens(39, 85, 14)}<circle cx="80" cy="26" r="5" fill="#f3efe4"/>`;
    return `<rect width="180" height="372" rx="34" fill="${shade(c, -.28)}"/><rect x="3" y="3" width="174" height="366" rx="31" fill="${B}"/>${cam}<path d="M3 210 L177 70 L177 150 L3 290Z" fill="#fff" opacity=".07"/>`;
  };
  const phoneFront = (withClock = true) => `<rect width="180" height="372" rx="34" fill="${shade(c, -.28)}"/><rect x="5" y="5" width="170" height="362" rx="29" fill="#0a0a0c"/><rect x="9" y="9" width="162" height="354" rx="26" fill="${W}"/><rect x="63" y="18" width="54" height="16" rx="8" fill="#000"/>${withClock ? clock(90, 118, 54) : ''}<rect x="62" y="346" width="56" height="4" rx="2" fill="#fff" opacity=".7"/>`;
  if (type.startsWith('phone')) {
    if (view === 'duo') return out('0 0 300 420', `${shadow(150, 408, 120)}<g transform="translate(12 36) scale(.92)">${phoneFront(false)}</g><g transform="translate(108 14)">${phoneBack(type)}</g>`);
    return out('0 0 220 400', `${shadow(110, 390, 80)}<g transform="translate(20 10)">${view === 'front' ? phoneFront() : phoneBack(type)}</g>`);
  }

  // ---- tablets (280 x 380)
  if (type.startsWith('tablet')) {
    const front = `<rect width="280" height="380" rx="24" fill="${shade(c, -.3)}"/><rect x="4" y="4" width="272" height="372" rx="21" fill="#0a0a0c"/><rect x="14" y="14" width="252" height="352" rx="11" fill="${W}"/>${clock(140, 150, 62)}${[0, 1, 2, 3].map(i => `<rect x="${58 + i * 44}" y="310" width="32" height="32" rx="9" fill="#fff" opacity=".16"/>`).join('')}`;
    const cam = type === 'tablet-pro' ? `<rect x="16" y="16" width="44" height="70" rx="18" fill="${shade(c, -.08)}"/>${lens(38, 37, 9)}${lens(38, 65, 9)}` : lens(34, 34, 10);
    const back = `<rect width="280" height="380" rx="24" fill="${shade(c, -.2)}"/><rect x="2" y="2" width="276" height="376" rx="22" fill="${B}"/>${cam}<path d="M2 250 L278 90 L278 170 L2 330Z" fill="#fff" opacity=".07"/>`;
    if (view === 'duo') return out('0 0 400 440', `${shadow(200, 428, 170)}<g transform="translate(96 10)">${back}</g><g transform="translate(20 50) scale(.95)">${front}</g>`);
    return out('0 0 320 420', `${shadow(160, 408, 130)}<g transform="translate(20 14)">${view === 'back' ? back : front}</g>`);
  }

  // ---- laptops (440 x 290)
  if (type.startsWith('laptop')) {
    if (view === 'back') return out('0 0 440 300', `${shadow(220, 272, 190)}<rect x="40" y="36" width="360" height="226" rx="18" fill="${shade(c, -.18)}"/><rect x="42" y="38" width="356" height="222" rx="16" fill="${B}"/><path d="M42 200 L398 70 L398 140 L42 262Z" fill="#fff" opacity=".08"/><rect x="150" y="252" width="140" height="6" rx="3" fill="${shade(c, -.25)}"/>`);
    return out('0 0 440 290', `${shadow(220, 256, 196)}<rect x="60" y="12" width="320" height="216" rx="14" fill="${shade(c, -.12)}"/><rect x="64" y="16" width="312" height="208" rx="11" fill="#0a0a0c"/><rect x="72" y="26" width="296" height="190" rx="3" fill="${W}"/><rect x="72" y="26" width="296" height="7" fill="#fff" opacity=".12"/><rect x="112" y="62" width="150" height="100" rx="6" fill="#fff" opacity=".1"/><rect x="160" y="198" width="120" height="12" rx="5" fill="#fff" opacity=".18"/><rect x="205" y="16" width="30" height="9" rx="3" fill="#0a0a0c"/><path d="M20 228 H420 L413 242 Q410 247 402 247 H38 Q30 247 27 242 Z" fill="${B}"/><rect x="190" y="228" width="60" height="5" rx="2.5" fill="${shade(c, -.22)}"/>`);
  }
  if (type === 'imac') {
    const stand = `<path d="M166 262 H234 L246 330 H154Z" fill="${shade(c, -.06)}"/><rect x="128" y="328" width="144" height="8" rx="4" fill="${shade(c, -.16)}"/>`;
    if (view === 'back') return out('0 0 400 360', `${shadow(200, 342, 150)}${stand}<rect x="20" y="10" width="360" height="252" rx="14" fill="${B}"/><path d="M20 200 L380 60 L380 120 L20 262Z" fill="#fff" opacity=".08"/>`);
    return out('0 0 400 360', `${shadow(200, 342, 150)}${stand}<rect x="20" y="10" width="360" height="252" rx="14" fill="${B}"/><rect x="20" y="10" width="360" height="206" rx="14" fill="#f3f3f5"/><rect x="20" y="200" width="360" height="16" fill="#f3f3f5"/><rect x="30" y="20" width="340" height="186" rx="3" fill="${W}"/>${clock(200, 128, 56)}`);
  }
  if (type === 'macmini') {
    const ports = view === 'back' ? [0, 1, 2, 3, 4].map(i => `<rect x="${142 + i * 26}" y="170" width="14" height="6" rx="3" fill="#2a2a2d"/>`).join('') : `<rect x="176" y="170" width="12" height="5" rx="2.5" fill="#2a2a2d"/><rect x="196" y="170" width="12" height="5" rx="2.5" fill="#2a2a2d"/><circle cx="296" cy="172" r="2.5" fill="#7ad17f"/>`;
    return out('0 0 400 260', `${shadow(200, 214, 150)}<rect x="80" y="138" width="240" height="64" rx="16" fill="${shade(c, -.14)}"/><rect x="80" y="58" width="240" height="110" rx="30" fill="${B}"/>${ports}`);
  }

  // ---- watches (220 x 360)
  if (type.startsWith('watch')) {
    const ultra = type === 'watch-ultra', band = ultra ? shade(c, -.35) : shade(c, -.06), r = ultra ? 30 : 44;
    const body = `<rect x="66" y="-10" width="88" height="124" rx="18" fill="${band}"/><rect x="66" y="246" width="88" height="124" rx="18" fill="${band}"/>${[0, 1, 2].map(i => `<circle cx="110" cy="${300 + i * 18}" r="3" fill="${shade(band, -.3)}"/>`).join('')}<rect x="44" y="80" width="132" height="200" rx="${r}" fill="${B}"/><rect x="52" y="88" width="116" height="184" rx="${r - 8}" fill="#000"/><rect x="172" y="136" width="10" height="32" rx="4" fill="${ultra ? '#e8742c' : shade(c, -.12)}"/><rect x="174" y="184" width="6" height="36" rx="3" fill="${shade(c, -.12)}"/>${ultra ? '<rect x="38" y="150" width="8" height="42" rx="3" fill="#e8742c"/>' : ''}<text x="110" y="168" text-anchor="middle" font-family="Inter Tight, Inter, sans-serif" font-size="40" font-weight="600" fill="#fff">10:09</text><circle cx="110" cy="220" r="20" fill="none" stroke="#fa114f" stroke-width="5" stroke-dasharray="95 200" stroke-linecap="round" transform="rotate(-90 110 220)"/><circle cx="110" cy="220" r="13" fill="none" stroke="#9be22d" stroke-width="5" stroke-dasharray="60 200" stroke-linecap="round" transform="rotate(-90 110 220)"/><circle cx="110" cy="220" r="6" fill="none" stroke="#28d5e8" stroke-width="4" stroke-dasharray="28 200" stroke-linecap="round" transform="rotate(-90 110 220)"/>`;
    return out('0 0 220 380', `${shadow(110, 372, 70)}${tilt(110, 180, body)}`);
  }

  // ---- audio
  const bud = (x, y, flip, pro) => `<g transform="translate(${x} ${y}) scale(${flip ? -1 : 1} 1) rotate(-14)"><rect x="18" y="34" width="17" height="${pro ? 64 : 76}" rx="8.5" fill="${S}"/><ellipse cx="30" cy="30" rx="27" ry="23" fill="${S}"/>${pro ? '<ellipse cx="12" cy="36" rx="10" ry="12" fill="#e2e2e6"/>' : ''}<rect x="21" y="${pro ? 86 : 98}" width="11" height="6" rx="3" fill="#bdbdc3"/></g>`;
  const pCase = `<rect x="95" y="98" width="150" height="130" rx="46" fill="${S}"/><path d="M95 142 H245" stroke="#d6d6db" stroke-width="1.5"/><circle cx="170" cy="182" r="3" fill="#6fce76"/>`;
  if (type === 'airpods-pro' || type === 'airpods') {
    const pro = type === 'airpods-pro';
    if (view === 'case') return out('0 0 340 290', `${shadow(170, 250, 100)}<g transform="translate(0 6)">${pCase}</g>`);
    return out('0 0 340 290', `${shadow(170, 250, 120)}${pCase}${bud(48, 58, false, pro)}${bud(292, 58, true, pro)}`);
  }
  if (type === 'airpods-max') return out('0 0 320 310', `${shadow(160, 290, 120)}${tilt(160, 160, `<path d="M84 160 C84 34 236 34 236 160" fill="none" stroke="#cfd0d4" stroke-width="7" stroke-linecap="round"/><path d="M96 150 C98 60 222 60 224 150" fill="none" stroke="${shade(c, -.05)}" stroke-width="18" stroke-linecap="round" opacity=".9"/><rect x="48" y="146" width="74" height="118" rx="34" fill="${B}"/><rect x="198" y="146" width="74" height="118" rx="34" fill="${B}"/><rect x="108" y="160" width="14" height="90" rx="7" fill="${shade(c, -.2)}"/><rect x="198" y="160" width="14" height="90" rx="7" fill="${shade(c, -.2)}"/>`)}`);

  // ---- accessories
  if (type === 'pencil') return out('0 0 320 320', `${shadow(160, 292, 110)}<g transform="rotate(${view === 'tilt' ? 50 : -40} 160 160)"><rect x="149" y="16" width="22" height="250" rx="5" fill="${S}"/><rect x="149" y="16" width="6" height="250" rx="3" fill="#e4e4e8"/><path d="M149 266 H171 L163 296 Q160 301 157 296Z" fill="#ececf0"/><path d="M157 288 L163 288 L161 297 Q160 299 159 297Z" fill="#9a9aa0"/></g>`);
  if (type === 'magsafe') return out('0 0 320 320', `${shadow(160, 296, 100)}<path d="M160 214 C160 270 250 250 266 292" fill="none" stroke="#e7e7ea" stroke-width="9" stroke-linecap="round"/><circle cx="160" cy="132" r="82" fill="${view === 'tilt' ? '#d8d9dd' : S}"/><circle cx="160" cy="132" r="62" fill="none" stroke="#e0e0e5" stroke-width="2"/><circle cx="160" cy="132" r="10" fill="#ededf0"/>`);
  if (type === 'adapter') return out('0 0 320 320', `${shadow(160, 290, 90)}${tilt(160, 160, `<rect x="134" y="222" width="10" height="46" rx="5" fill="#c9c9ce"/><rect x="176" y="222" width="10" height="46" rx="5" fill="#c9c9ce"/><rect x="96" y="80" width="128" height="148" rx="28" fill="${S}"/><rect x="140" y="138" width="40" height="13" rx="6.5" fill="#2a2a2d"/>`)}`);
  if (type === 'cable') return out('0 0 320 320', `${shadow(160, 280, 110)}${tilt(160, 160, [0, 1, 2, 3].map(i => `<ellipse cx="160" cy="${150 + i * 10}" rx="${92 - i * 4}" ry="${58 - i * 3}" fill="none" stroke="#dcdce0" stroke-width="10"/><ellipse cx="160" cy="${148 + i * 10}" rx="${92 - i * 4}" ry="${58 - i * 3}" fill="none" stroke="#f6f6f8" stroke-width="7"/>`).join('') + '<rect x="238" y="60" width="18" height="44" rx="6" fill="#ededf0" transform="rotate(20 247 82)"/><rect x="241" y="44" width="12" height="20" rx="4" fill="#c7c7cc" transform="rotate(20 247 82)"/>')}`);
  if (type === 'case') return out('0 0 220 400', `${shadow(110, 390, 80)}${tilt(110, 196, `<g transform="translate(20 10)"><rect width="180" height="372" rx="36" fill="${B}"/><rect x="9" y="9" width="162" height="116" rx="27" fill="#ececef"/><rect x="13" y="13" width="154" height="108" rx="24" fill="${shade(c, -.12)}" opacity=".35"/><circle cx="90" cy="230" r="52" fill="none" stroke="${shade(c, -.15)}" stroke-width="3" opacity=".5"/><rect x="-2" y="140" width="4" height="40" rx="2" fill="${shade(c, -.2)}"/></g>`)}`);
  if (type === 'airtag') return out('0 0 320 320', `${shadow(160, 280, 90)}<circle cx="160" cy="150" r="90" fill="#c9cacf"/><circle cx="160" cy="150" r="84" fill="${view === 'tilt' ? '#e3e4e8' : S}"/>${view === 'tilt' ? '<path d="M100 110 A84 84 0 0 1 220 110" fill="none" stroke="#fff" stroke-width="10" opacity=".7"/>' : ''}`);
  return out('0 0 320 320', `<rect x="80" y="80" width="160" height="160" rx="32" fill="${B}"/>`);
}
