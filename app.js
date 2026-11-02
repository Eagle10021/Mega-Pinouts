// Mega Kit Pinouts: tabbed views (board, parts, resistors, sources), board diagram, part pages.
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const SVGNS = 'http://www.w3.org/2000/svg';

  // ---------- pin facts ----------
  function pinInfo(ref) {
    if (POWER[ref]) return { ref, title: POWER[ref].name, tags: POWER[ref].tags.slice(), lines: [], desc: POWER[ref].desc };
    const m = /^([DA])(\d+)$/.exec(ref);
    const analog = m[1] === 'A';
    const n = analog ? 54 + +m[2] : +m[2];
    const tags = analog ? ['analog'] : ['digital'];
    const lines = [];
    if (analog) {
      lines.push(['Analog in', `A${m[2]}, 10-bit (0–1023)`]);
      lines.push(['As digital', `pin ${n}`]);
      lines.push(['AVR port', (+m[2] < 8 ? 'PF' : 'PK') + (+m[2] % 8)]);
      if (+m[2] >= 8) lines.push(['Pin change int', `PCINT${16 + +m[2] - 8}`]);
    } else {
      lines.push(['AVR port', PORTS[n]]);
      if (PWM[n]) { tags.push('pwm'); lines.push(['PWM', `analogWrite(), timer ${PWM[n].slice(2, 3)} (${PWM[n]})`]); }
      if (n in INTS) { tags.push('interrupt'); lines.push(['Interrupt', `attachInterrupt(${INTS[n]}, …) or digitalPinToInterrupt(${n})`]); }
      if (SERIAL[n]) { tags.push('serial'); lines.push(['Serial', SERIAL[n]]); }
      if (n === 20 || n === 21) tags.push('i2c');
      if (n >= 50 && n <= 53) tags.push('spi');
      if (SPECIAL[n]) lines.push(['Special', SPECIAL[n]]);
      if (n in PCINT) lines.push(['Pin change int', `PCINT${PCINT[n]}`]);
    }
    return { ref, n, title: analog ? `A${m[2]}` : `Pin ${n}`, tags, lines, desc: '' };
  }

  // Which kit parts use which Mega pins (parsed from the wiring tables).
  const REF_RE = /^(D\d{1,2}|A\d{1,2}|5V|3V3|GND|VIN)$/;
  function refsOf(s) {
    const out = [];
    for (const part of String(s).split(/,\s*/)) {
      const r = /^D(\d+)–D(\d+)$/.exec(part);
      if (r) { for (let i = +r[1]; i <= +r[2]; i++) out.push('D' + i); continue; }
      if (REF_RE.test(part)) out.push(part); else return [];
    }
    return out;
  }
  const usage = {};
  for (const c of COMPONENTS) for (const w of c.wiring) for (const [pin, mega] of w.rows)
    for (const r of refsOf(mega)) (usage[r] ||= []).push({ c, set: w.title, pin });
  const compRefs = c => [...new Set(c.wiring.flatMap(w => w.rows.flatMap(r => refsOf(r[1]))))];
  const refName = r => /^D\d+$/.test(r) ? r.slice(1) : r === '3V3' ? '3.3V' : r;

  // ---------- board geometry ----------
  const P = 25.4;
  const pins = [];
  const add = (ref, label, x, y, side) => pins.push({ ref, label, x, y, side });
  const row = (list, x0, y, side) => list.forEach((p, i) => add(p[0], p[1], x0 + i * P, y, side));
  const d = n => ['D' + n, String(n)];
  row([['D21', 'SCL'], ['D20', 'SDA'], ['AREF', 'AREF'], ['GND', 'GND'], ...[13, 12, 11, 10, 9, 8].map(d)], 230, 34, 'top');
  row([7, 6, 5, 4, 3, 2, 1, 0].map(d), 486, 34, 'top');
  row([14, 15, 16, 17, 18, 19, 20, 21].map(d), 690, 34, 'top');
  row([['NC', ''], ['IOREF', 'IOREF'], ['RESET', 'RESET'], ['3V3', '3.3V'], ['5V', '5V'], ['GND', 'GND'], ['GND', 'GND'], ['VIN', 'VIN']], 250, 526, 'bottom');
  row([0, 1, 2, 3, 4, 5, 6, 7].map(i => ['A' + i, 'A' + i]), 473, 526, 'bottom');
  row([8, 9, 10, 11, 12, 13, 14, 15].map(i => ['A' + i, 'A' + i]), 696, 526, 'bottom');
  for (let r = 0; r < 18; r++) {
    const y = 70 + r * P;
    const pair = r === 0 ? [['5V', '5V'], ['5V', '5V']] : r === 17 ? [['GND', 'GND'], ['GND', 'GND']] : [d(20 + r * 2), d(21 + r * 2)];
    add(pair[0][0], pair[0][1], 962, y, 'left');
    add(pair[1][0], pair[1][1], 987, y, 'right');
  }
  // ICSP for the ATmega2560: 1 CIPO 2 5V / 3 SCK 4 COPI / 5 RESET 6 GND
  [['D50', 'CIPO'], ['5V', '5V'], ['D52', 'SCK'], ['D51', 'COPI'], ['RESET', 'RST'], ['GND', 'GND']].forEach((p, i) =>
    add(p[0], p[1], 800 + (i % 2) * P, 250 + Math.floor(i / 2) * P, i % 2 ? 'right' : 'left'));
  pins.forEach(p => { p.info = pinInfo(p.ref); });

  function buildBoard() {
    const svg = $('#board');
    const g = (tag, attrs, parent = svg) => {
      const el = document.createElementNS(SVGNS, tag);
      for (const k in attrs) el.setAttribute(k, attrs[k]);
      parent.appendChild(el);
      return el;
    };
    const text = (cls, x, y, t, anchor = 'middle') => { g('text', { class: 'silk ' + cls, x, y, 'text-anchor': anchor }).textContent = t; };
    g('path', { class: 'pcb', d: 'M14 0 H1026 Q1040 0 1040 14 V546 Q1040 560 1026 560 H14 Q0 560 0 546 V14 Q0 0 14 0Z' });
    [[40, 40], [40, 520], [1010, 40], [1010, 520], [400, 120]].forEach(([cx, cy]) => g('circle', { class: 'hole', cx, cy, r: 9 }));
    g('rect', { class: 'usb', x: -18, y: 70, width: 120, height: 96, rx: 4 });
    text('small', 44, 124, 'USB-B');
    g('rect', { class: 'jack', x: -18, y: 396, width: 130, height: 94, rx: 6 });
    text('small', 50, 448, 'DC 7–12V');
    // USB-serial chip and its ICSP1 header (Rev3: ATmega16U2)
    g('rect', { class: 'chip', x: 128, y: 196, width: 44, height: 44, rx: 3 });
    text('tiny', 150, 222, '16U2');
    for (let i = 0; i < 6; i++) g('rect', { class: 'pad dead', x: 192 + (i % 2) * 16 - 6, y: 192 + Math.floor(i / 2) * 16 - 6, width: 12, height: 12, rx: 2 });
    text('tiny', 200, 256, 'ICSP1 (USB chip)');
    const chip = g('g', { transform: 'translate(560 300) rotate(45)' });
    g('rect', { class: 'chip', x: -78, y: -78, width: 156, height: 156, rx: 4 }, chip);
    g('circle', { class: 'chipdot', cx: -60, cy: -60, r: 5 }, chip);
    text('chiptext', 560, 296, 'ATmega2560');
    text('small', 560, 314, '16 MHz · 5V logic');
    g('text', { class: 'silk brand', x: 230, y: 380 }).textContent = 'MEGA 2560';
    text('small', 232, 402, 'Rev3 · datasheet rev 4 (Oct 2026)', 'start');
    text('small', 813, 236, 'ICSP');
    [[344, 'PWM / I2C'], [575, 'PWM ~'], [779, 'COMMUNICATION']].forEach(([x, t]) => text('group', x, 118, t));
    [[339, 'POWER'], [562, 'ANALOG IN'], [785, 'ANALOG IN']].forEach(([x, t]) => text('group', x, 452, t));
    [[230, 34, 10], [486, 34, 8], [690, 34, 8], [250, 526, 8], [473, 526, 8], [696, 526, 8]].forEach(([x, y, n]) =>
      g('rect', { class: 'header', x: x - 12, y: y - 12, width: (n - 1) * P + 24, height: 24, rx: 2 }));
    g('rect', { class: 'header', x: 950, y: 58, width: 49.4, height: 17 * P + 24, rx: 2 });
    g('rect', { class: 'header', x: 788, y: 238, width: 49.4, height: 2 * P + 24, rx: 2 });

    pins.forEach((p, i) => {
      const el = g('g', { class: 'pin', tabindex: 0, role: 'button', 'data-i': i, 'aria-label': `${p.label || p.ref}: ${p.info.title}` });
      g('rect', { class: 'pad', x: p.x - 9, y: p.y - 9, width: 18, height: 18, rx: 3 }, el);
      g('circle', { class: 'drill', cx: p.x, cy: p.y, r: 4 }, el);
      if (p.label) {
        let t;
        if (p.side === 'top') t = g('text', { class: 'silk lbl', x: p.x + 4, y: p.y + 18, transform: `rotate(90 ${p.x + 4} ${p.y + 18})` }, el);
        else if (p.side === 'bottom') t = g('text', { class: 'silk lbl', x: p.x + 4, y: p.y - 18, transform: `rotate(-90 ${p.x + 4} ${p.y - 18})` }, el);
        else if (p.side === 'left') t = g('text', { class: 'silk lbl', x: p.x - 16, y: p.y + 4, 'text-anchor': 'end' }, el);
        else t = g('text', { class: 'silk lbl', x: p.x + 16, y: p.y + 4 }, el);
        t.textContent = p.label;
      }
      el.addEventListener('click', () => selectPin(p));
      el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectPin(p); } });
    });
  }

  // ---------- board state ----------
  const FN_COLOR = { pwm: 'var(--c-pwm)', interrupt: 'var(--c-interrupt)', serial: 'var(--c-serial)', i2c: 'var(--c-i2c)', spi: 'var(--c-spi)', analog: 'var(--c-analog)', power: 'var(--c-power)' };
  const TAGS = { digital: 'Digital', pwm: 'PWM', interrupt: 'Interrupt', serial: 'Serial', i2c: 'I2C', spi: 'SPI', analog: 'Analog', power: 'Power' };
  const state = { filter: 'all', pin: null, comp: null, highlight: null, cat: 'all' };

  function paint() {
    const svg = $('#board');
    svg.classList.toggle('filtering', state.filter !== 'all' || !!state.highlight);
    $$('.pin', svg).forEach(el => {
      const p = pins[+el.dataset.i];
      let on, color = '';
      if (state.highlight) { on = state.highlight.includes(p.ref); color = CAT_COLORS[state.comp.cat]; }
      else if (state.filter === 'kit') { on = !!usage[p.ref] && !/^(5V|GND|3V3)$/.test(p.ref); if (on) color = CAT_COLORS[usage[p.ref][0].c.cat]; }
      else { on = state.filter === 'all' || p.info.tags.includes(state.filter); color = FN_COLOR[state.filter] || ''; }
      el.classList.toggle('on', on);
      el.style.setProperty('--hc', color || 'var(--pad-on)');
      el.classList.toggle('sel', !!state.pin && state.pin.ref === p.ref);
    });
    $$('.chip-filter[data-f]').forEach(b => b.setAttribute('aria-pressed', String(!state.highlight && b.dataset.f === state.filter)));
    const hb = $('#hl-banner');
    if (state.highlight) {
      hb.hidden = false;
      hb.style.setProperty('--cc', CAT_COLORS[state.comp.cat]);
      $('#hl-text').innerHTML = `Pins used by <strong>${esc(state.comp.name)}</strong>: ${state.highlight.map(r => `<span class="megapin">${esc(refName(r))}</span>`).join(' ')}`;
      $('#hl-back').href = '#part-' + state.comp.id;
    } else hb.hidden = true;
    renderLegend();
  }

  function renderLegend() {
    const L = $('#legend');
    if (state.highlight) { L.innerHTML = `<span><i style="background:${CAT_COLORS[state.comp.cat]}"></i>${esc(state.comp.cat)}: ${esc(state.comp.name)}</span>`; return; }
    if (state.filter === 'kit') {
      L.innerHTML = '<span class="muted">Pin colour = the type of kit part that uses it:</span>' + CATEGORIES.map(c => `<span><i style="background:${CAT_COLORS[c]}"></i>${esc(c)}</span>`).join('');
      return;
    }
    if (state.filter !== 'all') { L.innerHTML = `<span><i style="background:${FN_COLOR[state.filter]}"></i>${TAGS[state.filter]} pins</span>`; return; }
    L.innerHTML = '<span class="muted">Seen from the top, USB on the left. The SDA/SCL pair by AREF is the same as pins 20 and 21. The ICSP header carries the same SPI signals as pins 50–52.</span>';
  }

  const pinSlug = p => encodeURIComponent(p.label || refName(p.ref));
  function selectPin(p, link = true) {
    state.pin = p;
    if (link && !$('#view-board').hidden) history.replaceState(null, '', '#pin-' + pinSlug(p));
    const info = p.info;
    const used = usage[p.ref] || [];
    const aka = p.label && p.label !== refName(p.ref) && !/^A\d+$/.test(p.label) ? ` <span class="aka">(${esc(p.label)} label)</span>` : '';
    $('#pin-panel').innerHTML = `
      <p class="eyebrow">Selected pin</p>
      <h3>${esc(info.title)}${aka}</h3>
      <div class="tags">${info.tags.map(t => `<span class="tag t-${t}">${TAGS[t] || t}</span>`).join('')}</div>
      ${info.desc ? `<p>${esc(info.desc)}</p>` : ''}
      ${info.lines.length ? `<dl>${info.lines.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>` : ''}
      ${info.n !== undefined ? `<p class="limit">Max 20 mA per pin, 5V logic.</p>` : ''}
      <div class="pin-actions"><button class="btn ghost small" type="button" id="copy-pin">Copy link to this pin</button></div>
      <h4>Used by kit parts</h4>
      ${used.length ? `<ul class="uses">${used.map(u => `<li style="--cc:${CAT_COLORS[u.c.cat]}"><a href="#part-${u.c.id}">${esc(u.c.name)}</a><span>${esc(u.pin)} · ${esc(u.set)}</span></li>`).join('')}</ul>` : '<p class="muted">No kit lesson uses this pin, so it is free for your own wiring.</p>'}`;
    $('#copy-pin').addEventListener('click', e => {
      const url = location.origin + location.pathname + '#pin-' + pinSlug(p);
      const done = t => { e.target.textContent = t; setTimeout(() => { e.target.textContent = 'Copy link to this pin'; }, 1800); };
      history.replaceState(null, '', '#pin-' + pinSlug(p));
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(url).then(() => done('Link copied'), () => done('Link is in the address bar'));
      else done('Link is in the address bar');
    });
    paint();
  }

  function renderRevision() {
    $('#rev-body').innerHTML = `
      <dl>${BOARD.facts.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
      <div><h4>How to tell it's a Rev3</h4><ul class="notes">${BOARD.howToTell.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
      <h4>About the kit's board sheet</h4><p class="small">${esc(BOARD.outdated)}</p>
      <p class="small"><a href="${SOURCES.megaSheet.url}" target="_blank" rel="noopener">Current Rev3 datasheet</a> · <a href="${SOURCES.megaPinout.url}" target="_blank" rel="noopener">Full pinout PDF</a></p></div>`;
  }

  // ---------- parts ----------
  function kind(desc) {
    if (/^Ground|common cathode|Backlight −/i.test(desc)) return 'gnd';
    if (/^\+|power|supply|^5V|Backlight \+/i.test(desc)) return 'pwr';
    return 'sig';
  }
  // ---------- part drawings ----------
  // Every part is drawn as it looks from the front, pins along the edge, each pin labelled and coloured by kind.
  const PITCH = 64;
  function pinLabel(x, y, [n, name, desc], up) {
    const k = kind(desc);
    const by = up ? y - 44 : y;
    return `<g class="pp k-${k}"><rect x="${x - 28}" y="${by}" width="56" height="44" rx="6"/>
      <text class="pn" x="${x}" y="${by + 16}" text-anchor="middle">${n}</text>
      <text class="pl" x="${x}" y="${by + 34}" text-anchor="middle">${esc(name)}</text></g>`;
  }
  const leg = (x, y1, y2, color) => `<line class="leg" x1="${x}" y1="${y1}" x2="${x}" y2="${y2}"${color ? ` style="stroke:${color}"` : ''}/>`;
  const SERVO_WIRE = { Brown: '#7b4a26', Red: '#d02b2b', Orange: '#f07c1f' };

  // Body artwork per part, drawn inside the box (x, y, w, h).
  function bodyArt(c, x, y, w, h) {
    const cx = x + w / 2, cy = y + h / 2;
    const label = `<text class="silk-t" x="${x + 12}" y="${y + 20}">${esc(c.part)}</text>`;
    switch (c.id) {
      case '5461as': case '5161as': {
        const nd = c.id === '5461as' ? 4 : 1, dw = 62;
        let s = `<rect class="b-disp" x="${x}" y="${y}" width="${w}" height="${h}" rx="6"/>`;
        const sx = cx - (nd * dw) / 2;
        for (let i = 0; i < nd; i++) s += sevenSeg(sx + i * dw + 8, y + 14, 40, h - 28);
        return s + `<text class="dim-t" x="${x + w - 10}" y="${y + h - 8}" text-anchor="end">${esc(c.part)}</text>`;
      }
      case 'lcd1602': {
        let s = `<rect class="b-green" x="${x}" y="${y}" width="${w}" height="${h}" rx="6"/>`;
        s += `<rect class="b-bezel" x="${x + 40}" y="${y + 22}" width="${w - 80}" height="${h - 40}" rx="4"/>`;
        s += `<rect class="b-screen" x="${x + 56}" y="${y + 34}" width="${w - 112}" height="${h - 64}" rx="2"/>`;
        s += `<text class="lcd-t" x="${cx}" y="${cy - 2}" text-anchor="middle">Hello, Mega!</text><text class="lcd-t" x="${cx}" y="${cy + 18}" text-anchor="middle">16 x 2 LCD</text>`;
        return s;
      }
      case 'keypad': {
        let s = `<rect class="b-key" x="${x}" y="${y}" width="${w}" height="${h}" rx="8"/>`;
        const keys = ['1','2','3','A','4','5','6','B','7','8','9','C','*','0','#','D'];
        const kw = Math.min(54, (w - 60) / 4), kh = (h - 30) / 4, kx = cx - kw * 2;
        keys.forEach((t, i) => {
          const px = kx + (i % 4) * kw, py = y + 14 + Math.floor(i / 4) * kh;
          s += `<rect class="${i % 4 === 3 ? 'k-red' : 'k-blue'}" x="${px + 3}" y="${py + 3}" width="${kw - 6}" height="${kh - 6}" rx="6"/><text class="key-t" x="${px + kw / 2}" y="${py + kh / 2 + 5}" text-anchor="middle">${t}</text>`;
        });
        return s;
      }
      case 'sg90': {
        return `<rect class="b-servo" x="${x + 30}" y="${y + 10}" width="${w - 60}" height="${h - 20}" rx="6"/>
          <circle class="b-horn" cx="${x + 70}" cy="${cy}" r="22"/><rect class="b-horn" x="${x + 64}" y="${cy - 34}" width="12" height="68" rx="6"/>
          <text class="silk-t" x="${x + w - 44}" y="${cy + 5}" text-anchor="end">SG90</text>`;
      }
      case 'rgb': case 'buzzers': case 'thermistor': case 'photocell': case 'tilt': case 'pot': return discreteArt(c, x, y, w, h);
      case 'l293d': case '74hc595': {
        return `<rect class="b-chip" x="${x}" y="${y}" width="${w}" height="${h}" rx="6"/><path class="notch" d="M${x} ${cy - 14} a14 14 0 0 1 0 28"/>
          <circle class="dim-dot" cx="${x + 22}" cy="${y + h - 16}" r="5"/><text class="chip-t" x="${cx}" y="${cy + 6}" text-anchor="middle">${esc(c.part)}</text>`;
      }
      case 'buttons': {
        return `<rect class="b-chip" x="${x + w / 2 - 50}" y="${y}" width="100" height="${h}" rx="6"/><circle class="b-cap" cx="${cx}" cy="${cy}" r="28"/>`;
      }
    }
    // modules: blue PCB with a feature drawn per part
    let s = `<rect class="b-pcb" x="${x}" y="${y}" width="${w}" height="${h}" rx="6"/>${label}`;
    const f = {
      hcsr04: () => [cx - 60, cx + 60].map(ex => `<circle class="f-can" cx="${ex}" cy="${cy + 6}" r="34"/><circle class="f-mesh" cx="${ex}" cy="${cy + 6}" r="24"/>`).join(''),
      dht11: () => `<rect class="f-cap" x="${cx - 34}" y="${y + 18}" width="68" height="${h - 30}" rx="4"/>` + [0, 1, 2, 3, 4].map(i => `<rect class="f-slot" x="${cx - 24}" y="${y + 28 + i * 12}" width="48" height="5"/>`).join(''),
      gy521: () => `<rect class="f-ic" x="${cx - 18}" y="${cy - 14}" width="36" height="36" rx="3"/><text class="tiny-t" x="${cx}" y="${cy + 8}" text-anchor="middle">MPU</text>`,
      hcsr501: () => `<circle class="f-dome" cx="${cx}" cy="${cy + 8}" r="38"/>`,
      water: () => [0, 1, 2, 3, 4, 5].map(i => `<rect class="f-trace" x="${x + 70 + i * 14}" y="${y + 28}" width="7" height="${h - 36}" rx="2"/>`).join(''),
      sound: () => `<circle class="f-can" cx="${cx - 40}" cy="${cy + 6}" r="24"/><rect class="f-pot" x="${cx + 20}" y="${cy - 8}" width="30" height="30" rx="3"/>`,
      rtc: () => `<circle class="f-cell" cx="${cx + 30}" cy="${cy + 6}" r="28"/><rect class="f-ic" x="${cx - 54}" y="${cy - 6}" width="30" height="24" rx="3"/>`,
      rc522: () => `<rect class="f-ant" x="${x + 170}" y="${y + 10}" width="${w - 190}" height="${h - 20}" rx="10"/><rect class="f-ant" x="${x + 184}" y="${y + 22}" width="${w - 218}" height="${h - 44}" rx="8"/>`,
      joystick: () => `<circle class="f-dome" cx="${cx + 20}" cy="${cy + 4}" r="36"/><circle class="f-knob" cx="${cx + 20}" cy="${cy + 4}" r="20"/>`,
      ir: () => `<rect class="f-ic" x="${cx - 16}" y="${cy - 16}" width="32" height="36" rx="4"/><circle class="f-irdome" cx="${cx}" cy="${cy}" r="11"/>`,
      encoder: () => `<rect class="f-ic" x="${cx - 26}" y="${cy - 20}" width="52" height="46" rx="4"/><circle class="f-knob" cx="${cx}" cy="${cy + 3}" r="16"/>`,
      max7219: () => { let d = ''; for (let i = 0; i < 64; i++) d += `<circle class="f-led" cx="${cx - 52 + (i % 8) * 15}" cy="${y + 16 + Math.floor(i / 8) * 9}" r="3.4"/>`; return d; },
      stepper: () => `<rect class="f-ic" x="${cx - 40}" y="${cy - 10}" width="80" height="30" rx="3"/><text class="tiny-t" x="${cx}" y="${cy + 10}" text-anchor="middle">ULN2003</text>` + [0, 1, 2, 3].map(i => `<circle class="f-led red" cx="${x + w - 70 + i * 14}" cy="${y + 26}" r="4"/>`).join(''),
      relay: () => `<rect class="f-relay" x="${cx - 60}" y="${y + 18}" width="120" height="${h - 30}" rx="4"/><text class="tiny-t dark" x="${cx}" y="${cy + 10}" text-anchor="middle">SRD-05VDC</text>`,
      power: () => `<rect class="f-jack" x="${x + 20}" y="${cy - 10}" width="46" height="34" rx="4"/><rect class="f-usb" x="${x + w - 80}" y="${cy - 6}" width="50" height="24" rx="3"/>`,
    }[c.id];
    if (f) s += f();
    return s;
  }
  function sevenSeg(x, y, w, h) {
    const t = 6, g = 2, hh = h / 2;
    const segs = [
      [x + t, y, w - 2 * t, t], [x + w - t, y + t + g, t, hh - t - 2 * g], [x + w - t, y + hh + g, t, hh - t - 2 * g],
      [x + t, y + h - t, w - 2 * t, t], [x, y + hh + g, t, hh - t - 2 * g], [x, y + t + g, t, hh - t - 2 * g], [x + t, y + hh - t / 2, w - 2 * t, t],
    ];
    const names = 'ABCDEFG';
    let s = segs.map(([a, b, cw, ch], i) => `<rect class="seg" x="${a}" y="${b}" width="${cw}" height="${ch}" rx="2"/><text class="seg-t" x="${a + cw / 2}" y="${b + ch / 2 + 4}" text-anchor="middle">${names[i]}</text>`).join('');
    return s + `<circle class="seg" cx="${x + w + 8}" cy="${y + h - 3}" r="3.5"/>`;
  }
  function discreteArt(c, x, y, w, h) {
    const cx = x + w / 2, cy = y + h / 2;
    switch (c.id) {
      case 'rgb': return `<path class="f-led-dome" d="M${cx - 34} ${y + h} V${cy - 6} a34 34 0 0 1 68 0 V${y + h} Z"/><text class="tiny-t dark" x="${cx}" y="${cy + 14}" text-anchor="middle">RGB</text>`;
      case 'buzzers': return `<circle class="f-buzz" cx="${cx}" cy="${cy}" r="${h / 2 - 4}"/><circle class="f-hole" cx="${cx}" cy="${cy}" r="5"/><text class="silk-t" x="${cx - 20}" y="${y + 18}">+</text>`;
      case 'thermistor': return `<circle class="f-bead" cx="${cx}" cy="${cy}" r="16"/><text class="tiny-t dark" x="${cx + 26}" y="${cy + 4}">10k NTC</text>`;
      case 'photocell': return `<circle class="f-ldr" cx="${cx}" cy="${cy}" r="${h / 2 - 6}"/><path class="f-squig" d="M${cx - 20} ${cy - 12} h40 v8 h-40 v8 h40 v8 h-40"/>`;
      case 'tilt': return `<rect class="f-tilt" x="${cx - 22}" y="${y + 6}" width="44" height="${h - 6}" rx="10"/>`;
      case 'pot': return `<rect class="f-potbody" x="${cx - 70}" y="${y + 10}" width="140" height="${h - 10}" rx="8"/><circle class="f-knob" cx="${cx}" cy="${cy + 4}" r="22"/><line class="f-tick" x1="${cx}" y1="${cy + 4}" x2="${cx}" y2="${cy - 16}"/>`;
    }
    return '';
  }

  function partDiagram(c) {
    const ps = c.pins;
    if (c.layout === 'dual') {
      const half = ps.length / 2, W = half * PITCH + 60, bodyH = c.id === 'buttons' ? 70 : c.id.endsWith('as') ? 120 : 84;
      const top = 54, bodyY = top + 22, botLeg = bodyY + bodyH, H = botLeg + 22 + 44 + 8;
      let s = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" class="part" role="img" aria-label="${esc(c.part)} pinout">`;
      for (let i = 0; i < half; i++) {
        const x = 30 + i * PITCH + PITCH / 2;
        s += leg(x, top, bodyY) + leg(x, botLeg, botLeg + 22);
        s += pinLabel(x, top, ps[ps.length - 1 - i], true);
        s += pinLabel(x, botLeg + 22, ps[i], false);
      }
      s += bodyArt(c, 20, bodyY, W - 40, bodyH);
      return s + '</svg>';
    }
    const n = ps.length, W = Math.max(n * PITCH + 40, c.id === 'lcd1602' ? 0 : 300);
    const bodyH = { lcd1602: 150, keypad: 190, sg90: 90, rc522: 110, max7219: 100 }[c.id] || (['rgb', 'buzzers', 'thermistor', 'photocell', 'tilt', 'pot'].includes(c.id) ? 80 : 96);
    const bodyY = 8, legTop = bodyY + bodyH, legBot = legTop + 26, H = legBot + 44 + 8;
    let s = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" class="part" role="img" aria-label="${esc(c.part)} pinout">`;
    const x0 = W / 2 - (n * PITCH) / 2;
    s += bodyArt(c, 10, bodyY, W - 20, bodyH);
    ps.forEach((p, i) => {
      const x = x0 + i * PITCH + PITCH / 2;
      s += leg(x, legTop, legBot, c.id === 'sg90' ? SERVO_WIRE[p[1]] : '');
      s += `<rect class="padsq" x="${x - 6}" y="${legTop - 6}" width="12" height="12" rx="2"/>`;
      s += pinLabel(x, legBot, p, false);
    });
    return s + '</svg>';
  }

  // Which Mega pin a part pin goes to in its first kit wiring set.
  function kitTarget(c, name) {
    for (const r of c.wiring[0].rows) {
      const head = r[0].split(/[\s(,]/)[0];
      if (r[0] === name || head === name || r[0] === 'Leg ' + name) return r[1];
    }
    return '';
  }

  const resSummary = c => {
    const r = RESISTORS[c.id];
    if (!r) return { none: true, text: 'No resistors needed' };
    if (/^None/.test(r[0][1])) return { none: true, text: 'No resistors (INPUT_PULLUP)' };
    return { none: false, text: 'Resistors: ' + r[0][1] };
  };

  function renderCatChips() {
    const counts = Object.fromEntries(CATEGORIES.map(c => [c, COMPONENTS.filter(x => x.cat === c).length]));
    $('#cat-chips').innerHTML = `<button class="chip-filter" data-cat="all" aria-pressed="true">All types</button>` +
      CATEGORIES.map(c => `<button class="chip-filter" data-cat="${esc(c)}" style="--c:${CAT_COLORS[c]}" aria-pressed="false">${esc(c)} (${counts[c]})</button>`).join('');
    $$('#cat-chips [data-cat]').forEach(b => b.addEventListener('click', () => {
      state.cat = b.dataset.cat;
      $$('#cat-chips [data-cat]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      renderGrid();
    }));
  }

  function renderGrid() {
    const ql = $('#comp-search').value.trim().toLowerCase();
    let html = '';
    for (const cat of CATEGORIES) {
      if (state.cat !== 'all' && state.cat !== cat) continue;
      const items = COMPONENTS.filter(c => c.cat === cat && (!ql || [c.name, c.part, c.blurb, 'lesson ' + c.lesson].join(' ').toLowerCase().includes(ql)));
      if (!items.length) continue;
      html += `<div class="cat-group" style="--cc:${CAT_COLORS[cat]}"><h2 class="cat-h"><i></i>${esc(cat)}</h2><div class="cards">` +
        items.map(c => {
          const r = resSummary(c);
          return `<a class="card" href="#part-${c.id}">
            <strong>${esc(c.name)}</strong>
            <span class="card-part">${esc(c.part)}</span>
            <span class="card-meta"><span>Lesson ${c.lesson}</span><span>${c.pins.length} pins</span></span>
            <span class="res-pill${r.none ? ' none' : ''}">${esc(r.text)}</span>
          </a>`;
        }).join('') + '</div></div>';
    }
    $('#comp-grid').innerHTML = html || '<p class="muted">No parts match. Try a part number like HC-SR04, or a lesson number.</p>';
  }

  const BAND = { black: '#1a1a1a', brown: '#7b4a26', red: '#d02b2b', orange: '#f07c1f', yellow: '#f2cf1d', green: '#2f9a43', blue: '#2563eb', violet: '#7c3aed', grey: '#8a8f98', white: '#f5f5f5', gold: '#c9a43a', silver: '#c0c4c8' };
  function resistorSvg(bands, w = 120) {
    const xs = [30, 40, 50, 60, 76];
    return `<svg class="resistor" viewBox="0 0 100 30" width="${w}" height="${w * 0.3}" aria-hidden="true">
      <line x1="0" y1="15" x2="100" y2="15" class="lead"/>
      <rect x="18" y="5" width="64" height="20" rx="8" class="rbody"/>
      ${bands.map((b, i) => `<rect x="${xs[i] - 2.5}" y="5" width="5" height="20" fill="${BAND[b]}"/>`).join('')}
    </svg>`;
  }
  // Colour bands for the first kit value named in a string such as "8 × 220Ω".
  function bandsFor(v) {
    const hit = KIT_RESISTORS.find(([name]) => new RegExp('(^|[^\\d.])' + name.replace('.', '\\.')).test(v));
    return hit ? resistorSvg(hit[1], 56) : '';
  }

  function resistorBlock(c) {
    const r = RESISTORS[c.id];
    if (!r) return `<section class="res-box none"><h3>Resistors</h3><p>${esc(RES_NONE[c.id] || 'None needed.')}</p></section>`;
    return `<section class="res-box"><h3>Resistors</h3><ul class="res-list">${r.map(([w, v, why]) =>
      `<li><div class="res-val">${bandsFor(v)}<span class="rv">${esc(v)}</span></div><div><p class="res-where">${esc(w)}</p><p class="small muted">${esc(why)}</p></div></li>`).join('')}</ul></section>`;
  }

  // ---------- wiring diagrams ----------
  // Each wiring row becomes one column: Mega pin box on top, a wire (with a resistor if the row has one), the part pin below.
  const OHM = '(\\d+(?:\\.\\d+)?[kM]?Ω)';
  function rowResistors(pin, note) {
    let series = null, pull = null, rest = note;
    let m;
    if ((m = new RegExp('^' + OHM + '(?: in series)?[, ]*').exec(note))) { series = m[1]; rest = note.slice(m[0].length).replace(/^\(|\)$/g, ''); }
    else if ((m = new RegExp('(?:one|each through) ' + OHM + '(?: per \\w+)?').exec(note))) { series = m[1] + ' each'; rest = note.replace(m[0], '').trim(); }
    if ((m = new RegExp('\\(\\+' + OHM + '\\)').exec(pin))) { series = m[1]; pin = pin.replace(m[0], '').trim(); }
    if ((m = /plus (\d+(?:\.\d+)?k?)Ω? resistor from \S+ to GND/.exec(note))) { pull = m[1] + 'Ω'; rest = ''; }
    return { pin, series, pull, rest };
  }
  function wrap(t, max = 12) {
    const out = [];
    for (const w of String(t).split(/\s+/)) {
      if (out.length && (out[out.length - 1] + ' ' + w).length <= max) out[out.length - 1] += ' ' + w;
      else out.push(w);
    }
    return out;
  }
  const tspans = (lines, x, y0, lh) => lines.map((l, i) => `<tspan x="${x}" y="${y0 + i * lh}">${esc(l)}</tspan>`).join('');
  const zig = (x, y) => `M${x} ${y} l7 4 l-14 8 l14 8 l-14 8 l14 8 l-14 8 l7 4`;   // 48 tall, vertical
  const zigH = (x, y) => `M${x} ${y} l4 -7 l8 14 l8 -14 l8 14 l8 -14 l8 14 l4 -7`;  // 48 wide, horizontal

  function wiringDiagram(c, w) {
    const cols = w.rows.map(([pin, mega, note]) => {
      const r = rowResistors(pin, note || '');
      const refs = refsOf(mega);
      const nc = mega === '—';
      let kindW = 'sig';
      if (/^(5V|3V3|VIN)$/.test(mega) || /Power module|Motor supply/.test(mega)) kindW = 'pwr';
      else if (mega === 'GND') kindW = 'gnd';
      const label = refs.length ? (/^D\d+–D\d+$/.test(mega) ? mega.replace(/D/g, '') : refs.map(refName).join(' · ')) : mega;
      return { ...r, mega, refs, nc, kindW, label, width: r.pull ? 128 : 92 };
    });
    const W = cols.reduce((a, c2) => a + c2.width, 0) + 24;
    const pinLines = cols.map(c2 => wrap(c2.pin));
    const maxPin = Math.max(...pinLines.map(l => l.length));
    const Y = { box: 10, boxH: 48, note: 76, wireTop: 58, wireBot: 244, body: 244, bodyH: 30, pin: 282 };
    const H = Y.pin + 16 + maxPin * 14 + 12;
    let s = `<svg class="wiring" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Wiring diagram: ${esc(c.part)} to the Mega, ${esc(w.title)}">`;
    // part body spanning all columns
    s += `<rect class="w-body" x="8" y="${Y.body}" width="${W - 16}" height="${Y.bodyH}" rx="6"/>`;
    s += `<text class="w-bodytext" x="${W / 2}" y="${Y.body + 20}" text-anchor="middle">${esc(c.part)}</text>`;
    let x0 = 12;
    for (let i = 0; i < cols.length; i++) {
      const k = cols[i], cx = x0 + k.width / 2 - (k.pull ? 16 : 0);
      const wireCls = `w-wire w-${k.kindW}`;
      // Mega box (or other target)
      const isMega = k.refs.length > 0;
      s += `<rect class="w-box ${isMega ? 'mega' : 'other'} w-${k.kindW}" x="${cx - 41}" y="${Y.box}" width="82" height="${Y.boxH}" rx="6"/>`;
      if (isMega) {
        s += `<text class="w-cap" x="${cx}" y="${Y.box + 15}" text-anchor="middle">MEGA</text>`;
        s += `<text class="w-pin" x="${cx}" y="${Y.box + 37}" text-anchor="middle">${esc(k.label)}</text>`;
      } else {
        const ll = wrap(k.nc ? 'not connected' : k.label, 12).slice(0, 3);
        s += `<text class="w-other" text-anchor="middle">${tspans(ll, cx, Y.box + 28 - (ll.length - 1) * 6, 13)}</text>`;
      }
      // note under the box
      if (k.rest) s += `<text class="w-note" text-anchor="middle">${tspans(wrap(k.rest, 15).slice(0, 3), cx, Y.note, 12)}</text>`;
      // wire
      if (!k.nc) {
        const y1 = Y.wireTop + (k.rest ? 34 : 0);
        if (k.series) {
          const zy = 150;
          s += `<path class="${wireCls}${isMega ? '' : ' dashed'}" d="M${cx} ${y1} V${zy} ${zig(cx, zy).slice(zig(cx, zy).indexOf('l'))} V${Y.wireBot}"/>`;
          s += `<rect class="w-rlabel-bg" x="${cx + 10}" y="${zy + 14}" width="${k.series.length * 7 + 8}" height="18" rx="4"/>`;
          s += `<text class="w-rlabel" x="${cx + 14}" y="${zy + 27}">${esc(k.series)}</text>`;
        } else {
          s += `<path class="${wireCls}${isMega ? '' : ' dashed'}" d="M${cx} ${y1} V${Y.wireBot}"/>`;
        }
        if (k.pull) {
          const py = 200;
          s += `<circle class="w-dot" cx="${cx}" cy="${py}" r="4"/>`;
          s += `<path class="w-wire w-gnd" d="M${cx} ${py} H${cx + 8} ${zigH(cx + 8, py).slice(zigH(cx + 8, py).indexOf('l'))} H${cx + 66} V${py + 14}"/>`;
          s += `<path class="w-wire w-gnd" d="M${cx + 56} ${py + 14} h20 M${cx + 60} ${py + 19} h12 M${cx + 64} ${py + 24} h4"/>`;
          s += `<text class="w-rlabel" x="${cx + 10}" y="${py - 12}">${esc(k.pull)} to GND</text>`;
        }
      }
      s += `<circle class="w-dot" cx="${cx}" cy="${Y.wireBot}" r="4"/>`;
      // part pin label
      s += `<rect class="w-pinbox w-${k.kindW}" x="${cx - 41}" y="${Y.pin}" width="82" height="${pinLines[i].length * 14 + 12}" rx="5"/>`;
      s += `<text class="w-partpin" text-anchor="middle">${tspans(pinLines[i], cx, Y.pin + 17, 14)}</text>`;
      x0 += k.width;
    }
    return s + '</svg>';
  }

  function wiringTable(c, w) {
    return `<div class="wire-set">
      <h4>${esc(w.title)}</h4>
      <div class="diagram-scroll">${wiringDiagram(c, w)}</div>
      <details class="as-table"><summary>Show as a table</summary>
      <div class="table-scroll"><table class="wiretable"><thead><tr><th>Part pin</th><th>Mega</th><th>Note</th></tr></thead>
      <tbody>${w.rows.map(([a, b, n]) => `<tr><td>${esc(a)}</td><td class="mega">${refsOf(b).length ? refsOf(b).map(r => `<span class="megapin">${esc(refName(r))}</span>`).join(' ') : esc(b)}</td><td>${esc(n)}</td></tr>`).join('')}</tbody></table></div></details>
    </div>`;
  }

  const linkItem = l => `<li><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>${l.local ? ' <span class="badge">PDF copy</span>' : ` <span class="host">${esc(new URL(l.url).hostname.replace(/^www\./, ''))}</span>`}</li>`;

  function showComp(id) {
    const i = COMPONENTS.findIndex(x => x.id === id);
    if (i < 0) { showView('parts'); return; }
    const c = COMPONENTS[i];
    state.comp = c;
    const prev = COMPONENTS[(i - 1 + COMPONENTS.length) % COMPONENTS.length], next = COMPONENTS[(i + 1) % COMPONENTS.length];
    const refs = compRefs(c);
    const det = $('#comp-detail');
    det.style.setProperty('--cc', CAT_COLORS[c.cat]);
    det.innerHTML = `
      <nav class="crumbs" aria-label="Part navigation">
        <a href="#parts">← All parts</a>
        <span class="pager"><a href="#part-${prev.id}">‹ ${esc(prev.name)}</a><a href="#part-${next.id}">${esc(next.name)} ›</a></span>
      </nav>
      <header class="detail-head">
        <span class="type-badge">${esc(c.cat)}</span>
        <h1>${esc(c.name)}</h1>
        <p class="part-no">${esc(c.part)} · Kit lesson ${c.lesson}</p>
        <p class="lede">${esc(c.blurb)}</p>
        ${refs.length ? `<button class="btn" id="show-on-board" type="button">Show its pins on the board</button>` : ''}
      </header>
      <section class="panel pinout-panel"><h3>Pinout</h3>
            <div class="diagram-scroll">${partDiagram(c)}</div>
            <p class="key small"><span class="k k-pwr">Power</span><span class="k k-gnd">Ground</span><span class="k k-sig">Signal</span></p>
            <div class="table-scroll"><table class="pintable"><thead><tr><th>Pin</th><th>Name</th><th>What it does</th><th>Kit wiring</th></tr></thead>
              <tbody>${c.pins.map(([n, nm, desc]) => { const t = kitTarget(c, nm); const r = refsOf(t);
                return `<tr><td>${n}</td><td class="k-${kind(desc)}">${esc(nm)}</td><td>${esc(desc)}</td><td>${r.length ? r.map(x => `<span class="megapin">${esc(refName(x))}</span>`).join(' ') : `<span class="muted">${esc(t || '—')}</span>`}</td></tr>`; }).join('')}</tbody></table></div>
          </section>
      <section class="panel wiring-panel"><h3>Wiring to the Mega</h3>
        <p class="key small"><span class="wk w-sig">Signal</span><span class="wk w-pwr">5V / power</span><span class="wk w-gnd">GND</span><span class="wk dashed">Not a Mega pin</span><span class="wk res">Resistor</span></p>
        ${c.wiring.map(w => wiringTable(c, w)).join('')}
      </section>
      <div class="detail-grid">
        <div class="detail-main">
          ${resistorBlock(c)}
          ${c.notes.length ? `<section class="panel"><h3>Notes</h3><ul class="notes">${c.notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul></section>` : ''}
        </div>
        <div class="detail-side">
          
          <section class="panel"><h3>Sources</h3><ul class="links">${c.links.map(linkItem).join('')}</ul></section>
        </div>
      </div>`;
    const b = $('#show-on-board');
    if (b) b.addEventListener('click', () => { state.highlight = refs; location.hash = '#board'; });
    $('#parts-list').hidden = true;
    det.hidden = false;
    document.title = c.name + ' · Mega Kit Pinouts';
  }

  // ---------- resistors view ----------
  const KIT_OHMS = [10, 100, 220, 330, 1000, 2000, 5100, 10000, 100000, 1000000];
  const fmtOhm = r => r >= 1e6 ? (r / 1e6) + 'MΩ' : r >= 1000 ? (r / 1000) + 'kΩ' : r + 'Ω';
  function renderCalc() {
    const vf = +$('#c-led').value, vs = +$('#c-v').value, ma = +$('#c-ma').value;
    $('#c-ma-out').textContent = ma + ' mA';
    const out = $('#calc-out');
    if (vs - vf < 0.5) { out.innerHTML = `<p>${vs}V is too close to this LED's ${vf}V to drive it reliably. Use the 5V pin.</p>`; return; }
    const r = (vs - vf) / (ma / 1000);
    const pick = KIT_OHMS.find(k => k >= r) || KIT_OHMS[KIT_OHMS.length - 1];
    const real = (vs - vf) / pick * 1000;
    const band = KIT_RESISTORS.find(([n]) => n === fmtOhm(pick));
    out.innerHTML = `<p class="calc-math">(${vs}V − ${vf}V) ÷ ${ma} mA = <strong>${Math.round(r)}Ω</strong></p>
      <div class="calc-pick">${band ? resistorSvg(band[1], 150) : ''}<div><p class="eyebrow">Closest kit value at or above</p><p class="rv big">${fmtOhm(pick)}</p><p class="small muted">gives ${real.toFixed(1)} mA</p></div></div>`;
  }
  function renderResistors() {
    $('#kit-res').innerHTML = KIT_RESISTORS.map(([n, b]) => `<figure>${resistorSvg(b, 130)}<figcaption><span class="rv">${n}</span><span class="small muted">${b.join(', ')}</span></figcaption></figure>`).join('');
    $('#all-res').innerHTML = `<thead><tr><th>Part</th><th>Where</th><th>Value</th></tr></thead><tbody>` + COMPONENTS.map(c => {
      const r = RESISTORS[c.id];
      const name = `<a href="#part-${c.id}" class="dotlink" style="--cc:${CAT_COLORS[c.cat]}"><i></i>${esc(c.name)}</a>`;
      if (!r) return `<tr><td>${name}</td><td colspan="2" class="muted">${esc(RES_NONE[c.id] || 'None needed.')}</td></tr>`;
      return r.map(([w, v], i) => `<tr>${i === 0 ? `<td rowspan="${r.length}">${name}</td>` : ''}<td>${esc(w)}</td><td><span class="rv">${esc(v)}</span></td></tr>`).join('');
    }).join('') + '</tbody>';
    ['#c-led', '#c-v', '#c-ma'].forEach(s => $(s).addEventListener('input', renderCalc));
    renderCalc();
  }

  function renderSources() {
    const groups = [
      ['Board (current Rev3 documents)', [SOURCES.megaDocs, SOURCES.megaSheet, SOURCES.megaPinout, SOURCES.megaSchem, SOURCES.avrSheet, SOURCES.elegooBoard]],
      ['Arduino language reference', [SOURCES.analogWrite, SOURCES.analogRead, SOURCES.attachInt, SOURCES.serial, SOURCES.wire, SOURCES.spi, SOURCES.shiftOut, SOURCES.tone]],
      ['Kit', [SOURCES.elegooPage, SOURCES.elegooTut]],
    ];
    const seen = new Set(groups.flatMap(g => g[1].map(l => l.url)));
    const partLinks = [];
    for (const c of COMPONENTS) for (const l of c.links) if (!seen.has(l.url)) { seen.add(l.url); partLinks.push(l); }
    groups.push(['Component datasheets and libraries', partLinks]);
    $('#sources-list').innerHTML = groups.map(([t, ls]) => `<div class="panel"><h2>${esc(t)}</h2><ul class="links">${ls.map(linkItem).join('')}</ul></div>`).join('');
  }

  // ---------- pin search ----------
  function findPin(q) {
    q = q.trim().toUpperCase().replace(/^PIN\s*/, '').replace(/^D(?=\d)/, '');
    if (!q) return null;
    if (/^\d+$/.test(q)) return pins.find(p => p.ref === 'D' + q && p.label === q) || (+q >= 54 && +q <= 69 ? pins.find(p => p.ref === 'A' + (+q - 54)) : null);
    const alias = { SDA: 'D20', SCL: 'D21', MISO: 'D50', CIPO: 'D50', MOSI: 'D51', COPI: 'D51', SCK: 'D52', SS: 'D53', CS: 'D53', LED: 'D13', '3.3V': '3V3', TX: 'D1', RX: 'D0' };
    const ref = alias[q] || q;
    return pins.find(p => p.ref === ref && p.label === refName(ref)) || pins.find(p => p.ref === ref) || pins.find(p => (p.label || '').toUpperCase() === q);
  }

  // ---------- routing ----------
  function showView(v) {
    ['board', 'parts', 'resistors', 'sources'].forEach(k => { $('#view-' + k).hidden = k !== v; });
    $$('.tabs a').forEach(a => a.setAttribute('aria-current', a.dataset.view === v ? 'page' : 'false'));
    if (v === 'parts') { $('#parts-list').hidden = false; $('#comp-detail').hidden = true; }
    document.title = 'Mega Kit Pinouts';
  }
  function route() {
    const h = location.hash.slice(1);
    const m = /^part-(.+)$/.exec(h);
    const pm = /^pin-(.+)$/.exec(h);
    if (m) { showView('parts'); showComp(m[1]); }
    else if (pm) { showView('board'); const p = findPin(decodeURIComponent(pm[1])); if (p) selectPin(p, false); else paint(); return; }
    else if (['parts', 'resistors', 'sources'].includes(h)) showView(h);
    else { showView('board'); paint(); }
    window.scrollTo(0, 0);
  }

  // ---------- theme switch, shortcuts, back to top ----------
  const THEMES = ['auto', 'light', 'dark'];
  const THEME_NAME = { auto: 'Auto', light: 'Light', dark: 'Dark' };
  function setTheme(t) {
    if (t === 'auto') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = t;
    try { if (t === 'auto') localStorage.removeItem('mkp-theme'); else localStorage.setItem('mkp-theme', t); } catch (e) {}
    $('#theme-label').textContent = THEME_NAME[t];
    $('#theme-btn').setAttribute('aria-label', 'Colour theme: ' + (t === 'auto' ? 'follow system' : t) + '. Click to change.');
  }
  const curTheme = () => document.documentElement.dataset.theme || 'auto';
  const cycleTheme = () => setTheme(THEMES[(THEMES.indexOf(curTheme()) + 1) % 3]);

  function initExtras() {
    setTheme(curTheme());
    $('#theme-btn').addEventListener('click', cycleTheme);

    const dlg = $('#keys-dlg');
    const openKeys = () => { if (!dlg.open) dlg.showModal(); };
    $$('[data-keys]').forEach(b => b.addEventListener('click', openKeys));

    const top = $('#to-top');
    const onScroll = () => top.classList.toggle('show', window.scrollY > 700);
    window.addEventListener('scroll', onScroll, { passive: true });
    top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }));

    // Enter in the parts filter opens the first match.
    $('#comp-search').addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      const first = $('#comp-grid .card');
      if (first) { e.preventDefault(); location.hash = first.getAttribute('href'); }
    });

    document.addEventListener('keydown', e => {
      if (e.ctrlKey || e.metaKey || e.altKey || dlg.open) return;
      const t = e.target;
      const typing = t.matches && t.matches('input, select, textarea, [contenteditable]');
      if (typing) {
        if (e.key === 'Escape' && t.type === 'search') { t.value = ''; t.dispatchEvent(new Event('input')); t.blur(); }
        return;
      }
      const onPart = !$('#comp-detail').hidden && !$('#view-parts').hidden;
      if (e.key === '/') {
        e.preventDefault();
        if (!$('#view-parts').hidden && !onPart) { $('#comp-search').focus(); return; }
        if ($('#view-board').hidden) location.hash = '#board';
        setTimeout(() => $('#pin-q').focus(), 0);
      } else if (/^[1-4]$/.test(e.key)) {
        location.hash = '#' + ['board', 'parts', 'resistors', 'sources'][+e.key - 1];
      } else if (e.key === '?') {
        openKeys();
      } else if (e.key === 't' || e.key === 'T') {
        cycleTheme();
      } else if (onPart && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        const a = $$('#comp-detail .pager a')[e.key === 'ArrowLeft' ? 0 : 1];
        if (a) location.hash = a.getAttribute('href');
      } else if (e.key === 'Escape') {
        if (onPart) location.hash = '#parts';
        else if (!$('#view-board').hidden) { state.highlight = null; state.filter = 'all'; paint(); }
      }
    });
  }

  function init() {
    buildBoard();
    renderRevision();
    $$('.chip-filter[data-f]').forEach(b => b.addEventListener('click', () => { state.filter = b.dataset.f; state.highlight = null; paint(); }));
    $('#hl-clear').addEventListener('click', () => { state.highlight = null; paint(); });
    $('#pin-search').addEventListener('submit', e => {
      e.preventDefault();
      const p = findPin($('#pin-q').value);
      $('#pin-q').setCustomValidity(p ? '' : 'No pin by that name. Try 20, A3, SDA or 5V.');
      if (p) selectPin(p); else $('#pin-q').reportValidity();
    });
    $('#pin-q').addEventListener('input', () => $('#pin-q').setCustomValidity(''));
    $('#comp-search').addEventListener('input', renderGrid);
    renderCatChips();
    renderGrid();
    renderResistors();
    renderSources();
    selectPin(findPin('20'), false);
    initExtras();
    window.addEventListener('hashchange', route);
    route();
  }
  init();
})();
