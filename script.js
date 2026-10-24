/* ==========================================================================
   AC/DS-01 — Instrument Console
   Vanilla JS, no dependencies.
   ========================================================================== */

/* ───────────── EDIT ME: contact channels ─────────────
   Replace the placeholder values below. Leave a value as "" to hide that row. */
const CONTACT = {
  email:    '',
  linkedin: '',
  github:   '',
  resume:   '',  // e.g. 'assets/Ananya_Chepuri_Resume.pdf' once the PDF is committed
};

(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pad = (n, w = 2) => String(n).padStart(w, '0');

  /* ───────────── theme / print mode ───────────── */
  const root = document.documentElement;
  const modeLabel = $('#mode-label');
  const syncMode = () => {
    const light = root.dataset.theme === 'light';
    modeLabel.textContent = light ? 'PRINT' : 'CONSOLE';
    $('meta[name="theme-color"]').setAttribute('content', light ? '#ece8de' : '#121214');
  };
  const toggleTheme = () => {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    try { localStorage.setItem('ac-theme', root.dataset.theme); } catch (e) {}
    syncMode();
    return root.dataset.theme;
  };
  $('#mode').addEventListener('click', toggleTheme);
  syncMode();

  /* ───────────── clocks ───────────── */
  const utcEl = $('#utc');
  const localEl = $('#local');
  const nyFmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hour12: false,
  });
  let lastTick = 0;
  const tick = (t) => {
    if (t - lastTick > 100) {
      lastTick = t;
      const d = new Date();
      utcEl.textContent =
        `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}.${Math.floor(d.getUTCMilliseconds() / 100)}`;
      utcEl.dateTime = d.toISOString();
      localEl.textContent = nyFmt.format(d);
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  $('#year').textContent = new Date().getFullYear();

  /* ───────────── cursor coordinate readout ───────────── */
  const xyEl = $('#xy');
  addEventListener('pointermove', (e) => {
    xyEl.textContent = `${pad(Math.round(e.pageX), 4)}·${pad(Math.round(e.pageY), 4)}`;
  }, { passive: true });

  /* ───────────── grain (canvas-generated noise tile) ───────────── */
  (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 180;
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(c.width, c.height);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255 | 0;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    $('.grain').style.backgroundImage = `url(${c.toDataURL('image/png')})`;
  })();

  /* ───────────── count-up metrics ───────────── */
  const fmt = (v, dec, sep) => {
    const s = v.toFixed(dec);
    return sep ? Number(s).toLocaleString('en-US', { minimumFractionDigits: dec }) : s;
  };
  const countUp = (el) => {
    const target = +el.dataset.count;
    const dec = +(el.dataset.dec || 0);
    const sep = !!el.dataset.sep;
    const metric = el.closest('.metric');
    if (reduced) { el.textContent = fmt(target, dec, sep); return; }
    const dur = 1600 + Math.random() * 500;
    const t0 = performance.now();
    metric && metric.classList.add('is-live');
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - p, 4);
      // jitter in the early phase so it reads like a sensor settling
      const jitter = p < .85 ? (Math.random() - .5) * target * .04 * (1 - p) : 0;
      el.textContent = fmt(Math.max(0, target * e + jitter), dec, sep);
      if (p < 1) requestAnimationFrame(step);
      else {
        el.textContent = fmt(target, dec, sep);
        setTimeout(() => metric && metric.classList.remove('is-live'), 900);
      }
    };
    requestAnimationFrame(step);
  };
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { countUp(en.target); countIO.unobserve(en.target); }
    });
  }, { threshold: .6 });
  $$('[data-count]').forEach((el) => countIO.observe(el));

  /* ───────────── FIG.01 — SVG line chart from raw path logic ───────────── */
  (() => {
    const NS = 'http://www.w3.org/2000/svg';
    const W = 640, H = 300, P = { l: 42, r: 70, t: 22, b: 30 };
    const EPOCHS = 40, Y0 = .4, Y1 = 1;
    const sx = (e) => P.l + (e / EPOCHS) * (W - P.l - P.r);
    const sy = (v) => P.t + (1 - (v - Y0) / (Y1 - Y0)) * (H - P.t - P.b);

    // deterministic PRNG so the trace is identical on every load
    let seed = 20260524;
    const rnd = () => {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
    const series = (floor, ceil, tau, noise) => {
      const out = [];
      for (let e = 0; e <= EPOCHS; e++) {
        const base = floor + (ceil - floor) * (1 - Math.exp(-e / tau));
        const n = (rnd() - .5) * noise * Math.exp(-e / 22);
        out.push(Math.min(.995, base + n));
      }
      return out;
    };
    const main = series(.5, .92, 7.5, .07);
    main[EPOCHS] = .92; // reported endpoint
    const base = series(.48, .83, 11, .05);

    const toPath = (arr) => arr.map((v, i) => `${i ? 'L' : 'M'}${sx(i).toFixed(1)},${sy(v).toFixed(1)}`).join('');

    const el = (tag, attrs, parent) => {
      const n = document.createElementNS(NS, tag);
      for (const k in attrs) n.setAttribute(k, attrs[k]);
      parent && parent.appendChild(n);
      return n;
    };

    // grid + axes
    const grid = $('#chart-grid');
    for (let v = .4; v <= 1.0001; v += .1) {
      const y = sy(v);
      el('line', { x1: P.l, x2: W - P.r, y1: y, y2: y, class: Math.abs(v - .9) < .001 ? 'major' : '' }, grid);
      el('text', { x: P.l - 8, y: y + 3, 'text-anchor': 'end' }, grid).textContent = v.toFixed(1);
    }
    for (let e = 0; e <= EPOCHS; e += 10) {
      const x = sx(e);
      el('line', { x1: x, x2: x, y1: H - P.b, y2: H - P.b + 5 }, grid);
      el('text', { x, y: H - P.b + 17, 'text-anchor': 'middle' }, grid).textContent = pad(e);
    }
    el('line', { x1: P.l, x2: W - P.r, y1: H - P.b, y2: H - P.b }, grid);
    el('line', { x1: P.l, x2: P.l, y1: P.t, y2: H - P.b }, grid);
    el('text', { x: W - P.r, y: H - 4, 'text-anchor': 'end' }, grid).textContent = 'EPOCH →';
    el('text', { x: P.l, y: 12, 'text-anchor': 'start' }, grid).textContent = 'ACC';

    const lm = $('#line-main'), lb = $('#line-base');
    lm.setAttribute('d', toPath(main));
    lb.setAttribute('d', toPath(base));

    // endpoint annotation
    const end = $('#chart-end');
    end.setAttribute('class', 'chart__end');
    const ex = sx(EPOCHS), ey = sy(.92);
    el('line', { x1: P.l, x2: ex, y1: ey, y2: ey }, end);
    const ring = el('circle', { cx: ex, cy: ey, r: 9, class: 'ring' }, end);
    el('circle', { cx: ex, cy: ey, r: 3.5 }, end);
    el('text', { x: ex + 12, y: ey + 4 }, end).textContent = '92.0%';
    end.style.opacity = 0;

    // draw-on animation
    const draw = () => {
      [lb, lm].forEach((p, i) => {
        const L = p.getTotalLength();
        p.style.strokeDasharray = i === 0 ? '3 3' : `${L} ${L}`;
        if (i === 1) {
          p.style.strokeDashoffset = L;
          p.getBoundingClientRect();
          p.style.transition = 'stroke-dashoffset 2.2s cubic-bezier(.2,.7,0,1)';
          p.style.strokeDashoffset = 0;
        } else {
          p.style.opacity = 0;
          p.style.transition = 'opacity 1.2s ease .3s';
          requestAnimationFrame(() => (p.style.opacity = .7));
        }
      });
      setTimeout(() => {
        end.style.transition = 'opacity .5s ease';
        end.style.opacity = 1;
        if (!reduced) ring.animate(
          [{ r: 4, opacity: 1 }, { r: 16, opacity: 0 }],
          { duration: 1800, iterations: Infinity, easing: 'ease-out' }
        );
      }, reduced ? 0 : 1900);
    };
    if (reduced) { end.style.opacity = 1; }
    else {
      const io = new IntersectionObserver(([en]) => {
        if (en.isIntersecting) { draw(); io.disconnect(); }
      }, { threshold: .4 });
      io.observe($('#chart'));
    }

    // hover probe
    const chart = $('#chart'), svg = $('svg', chart);
    const cur = $('#chart-cursor'), probe = $('#chart-probe'), ro = $('#chart-readout');
    const probeAt = (clientX) => {
      const r = svg.getBoundingClientRect();
      const x = ((clientX - r.left) / r.width) * W;
      const e = Math.round(Math.max(0, Math.min(EPOCHS, ((x - P.l) / (W - P.l - P.r)) * EPOCHS)));
      const px = sx(e), py = sy(main[e]);
      cur.setAttribute('x1', px); cur.setAttribute('x2', px);
      probe.setAttribute('cx', px); probe.setAttribute('cy', py);
      ro.innerHTML = `EP ${pad(e)} · ViT <span style="color:var(--accent)">${main[e].toFixed(3)}</span> · CNN ${base[e].toFixed(3)}`;
    };
    chart.addEventListener('pointermove', (e) => { chart.classList.add('is-probing'); probeAt(e.clientX); });
    chart.addEventListener('pointerleave', () => {
      chart.classList.remove('is-probing');
      ro.textContent = 'EP — · ACC —';
    });
  })();

  /* ───────────── §01 works: expand / filter / sort ───────────── */
  const list = $('#works-list');
  const works = $$('.work', list);

  const setOpen = (w, open) => {
    w.classList.toggle('is-open', open);
    $('.work__row', w).setAttribute('aria-expanded', open);
  };
  works.forEach((w) => {
    $('.work__row', w).addEventListener('click', () => {
      const open = !w.classList.contains('is-open');
      works.forEach((o) => o !== w && setOpen(o, false));
      setOpen(w, open);
    });
  });

  const chips = $$('.chip');
  const applyFilter = (f) => {
    chips.forEach((c) => c.classList.toggle('is-on', c.dataset.filter === f));
    let n = 0;
    works.forEach((w) => {
      const show = f === 'all' || w.dataset.tags.split(' ').includes(f);
      w.hidden = !show;
      if (!show) setOpen(w, false);
      n += show;
    });
    $('#works-count').textContent = pad(n);
  };
  chips.forEach((c) => c.addEventListener('click', () => applyFilter(c.dataset.filter)));

  let desc = true;
  $('#sort-year').addEventListener('click', () => {
    desc = !desc;
    $('#sort-dir').textContent = desc ? '↓' : '↑';
    works
      .slice()
      .sort((a, b) => (desc ? b.dataset.year - a.dataset.year : a.dataset.year - b.dataset.year) || a.dataset.id - b.dataset.id)
      .forEach((w) => list.appendChild(w));
  });

  /* ───────────── §03 instrumentation matrix ───────────── */
  // columns: P.01 Parkinson's · P.02 Energy · P.03 Green Coin · P.04 Voting · E.HH Hinge · E.SW Switcheko
  const MATRIX = [
    ['Python',                       [1, 1, 1, 0, 1, 1]],
    ['SQL',                          [0, 1, 0, 0, 1, 0]],
    ['PyTorch / TensorFlow',         [1, 0, 1, 0, 0, 0]],
    ['Vision Transformers',          [1, 0, 0, 0, 0, 0]],
    ['CNNs',                         [1, 0, 1, 0, 0, 0]],
    ['GANs (CycleGAN)',              [1, 0, 0, 0, 0, 0]],
    ['Classical ML (LR · DT · KNN)', [1, 0, 0, 0, 0, 0]],
    ['Computer Vision',              [1, 0, 1, 0, 1, 0]],
    ['ETL / Airflow',                [0, 1, 0, 0, 0, 0]],
    ['Data-quality checks',          [0, 1, 0, 0, 0, 0]],
    ['Tableau',                      [0, 1, 0, 0, 0, 0]],
    ['Power BI',                     [0, 0, 0, 0, 0, 1]],
    ['EDA & KPI design',             [0, 1, 0, 0, 0, 1]],
    ['Streamlit',                    [0, 0, 0, 0, 1, 0]],
    ['Docker',                       [0, 0, 0, 0, 1, 0]],
    ['AWS / CloudFormation CI/CD',   [0, 0, 0, 0, 1, 0]],
    ['SDK / API integration',        [0, 0, 0, 0, 1, 0]],
    ['IoT / Arduino / GPS',          [0, 0, 0, 1, 0, 0]],
  ];
  (() => {
    const body = $('#matrix-body'), foot = $('#matrix-foot');
    const colSums = Array(6).fill(0);
    body.innerHTML = MATRIX.map(([name, row], r) => {
      const sum = row.reduce((a, b) => a + b, 0);
      row.forEach((v, i) => (colSums[i] += v));
      const cells = row.map((v, c) =>
        `<td data-c="${c}">${v ? '<span class="mk" aria-label="used"></span>' : '<span class="dim" aria-hidden="true">·</span>'}</td>`
      ).join('');
      return `<tr data-r="${r}"><th scope="row" class="m-skill">${name}</th>${cells}<td class="m-sum">${pad(sum)}</td></tr>`;
    }).join('');
    foot.insertAdjacentHTML('beforeend',
      colSums.map((s, c) => `<td data-c="${c}">${pad(s)}</td>`).join('') +
      `<td class="m-sum">${pad(colSums.reduce((a, b) => a + b, 0))}</td>`);

    const table = $('#matrix-table');
    const heads = $$('thead th', table).slice(1, 7);
    const clear = () => $$('.is-x, .is-y, .is-cell', table).forEach((n) => n.classList.remove('is-x', 'is-y', 'is-cell'));
    table.addEventListener('pointerover', (e) => {
      const td = e.target.closest('td, th');
      if (!td || !table.contains(td)) return;
      clear();
      const tr = td.closest('tr');
      if (tr.parentElement.tagName === 'TBODY') tr.classList.add('is-y');
      const c = td.dataset.c ?? (heads.includes(td) ? String(heads.indexOf(td)) : null);
      if (c !== null && c !== undefined) {
        $$(`td[data-c="${c}"]`, table).forEach((n) => n.classList.add('is-x'));
        heads[+c].classList.add('is-x');
        if (td.tagName === 'TD') td.classList.add('is-cell');
      }
    });
    table.addEventListener('pointerleave', clear);
  })();

  /* ───────────── §06 contact links ───────────── */
  (() => {
    const rows = [
      ['EMAIL', CONTACT.email, CONTACT.email && `mailto:${CONTACT.email}`],
      ['LINKEDIN', CONTACT.linkedin && CONTACT.linkedin.replace(/^https?:\/\/(www\.)?/, ''), CONTACT.linkedin],
      ['GITHUB', CONTACT.github && CONTACT.github.replace(/^https?:\/\/(www\.)?/, ''), CONTACT.github],
      ['RÉSUMÉ', CONTACT.resume && 'Download PDF', CONTACT.resume],
    ].filter((r) => r[1]);
    $('#links').innerHTML = rows.map(([k, v, href]) => {
      const ext = /^https?:/.test(href) ? ' target="_blank" rel="noopener"' : '';
      return `<li><a href="${href}"${ext}><span class="k">${k}</span><span class="v">${v}</span><span class="arr">↗</span></a></li>`;
    }).join('');
  })();

  /* ───────────── §06 terminal ───────────── */
  const out = $('#term-out'), form = $('#term-form'), input = $('#term-input');
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const print = (html, cls = 'out') => {
    const d = document.createElement('div');
    d.className = cls; d.innerHTML = html;
    out.appendChild(d);
    out.scrollTop = out.scrollHeight;
  };
  const jump = (sel) => $(sel).scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });

  const COMMANDS = {
    help: () => [
      '<span class="hl">available commands</span>',
      '  whoami          identity record',
      '  ls              list works',
      '  open &lt;1-4&gt;      expand a work in §01',
      '  skills          instrument summary',
      '  edu             training record',
      '  contact         open a channel',
      '  theme           toggle console / print mode',
      '  date            current UTC timestamp',
      '  clear           clear the buffer',
    ].join('\n'),
    whoami: () =>
      'Ananya Chepuri — Data Scientist, NJ Department of Community Affairs (2026–)\nM.S. Data Science, Rutgers University (May 2026)\n' +
      'B.Tech ECE, Geethanjali College of Engineering & Technology (2024)\n' +
      'focus: ETL pipelines · dashboards · computer vision · workflow automation',
    ls: () => works.map((w) =>
      `${$('.c-id', w).textContent}  ${$('.c-year', w).textContent}  ${$('.c-title', w).textContent}`
    ).join('\n') + '\n\n<span class="dim">hint: open 1</span>',
    open: (arg) => {
      const w = works.find((x) => x.dataset.id === String(parseInt(arg, 10)));
      if (!w) return '<span class="err">usage: open &lt;1-4&gt;</span>';
      applyFilter('all');
      works.forEach((o) => setOpen(o, o === w));
      setTimeout(() => w.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' }), 50);
      return `expanding ${$('.c-id', w).textContent} — ${$('.c-title', w).textContent}`;
    },
    skills: () =>
      'languages   Python, SQL\n' +
      'ml          PyTorch, TensorFlow, ViT, CNN, CycleGAN, RF, SVM, LR, Bayesian\n' +
      'data eng    ETL, Airflow, warehousing, normalization, data-quality checks\n' +
      'bi          Power BI, Tableau, Plotly, Seaborn, Streamlit\n' +
      'infra       Docker, AWS, CloudFormation CI/CD, Git',
    edu: () => { jump('#edu'); return 'Rutgers University — M.S. Data Science, CGPA 3.5\nGCET — B.Tech ECE, CGPA 8.69'; },
    contact: () => {
      const lines = [];
      if (CONTACT.email) lines.push(`email     <a href="mailto:${esc(CONTACT.email)}">${esc(CONTACT.email)}</a>`);
      if (CONTACT.linkedin) lines.push(`linkedin  <a href="${esc(CONTACT.linkedin)}" target="_blank" rel="noopener">${esc(CONTACT.linkedin)}</a>`);
      if (CONTACT.github) lines.push(`github    <a href="${esc(CONTACT.github)}" target="_blank" rel="noopener">${esc(CONTACT.github)}</a>`);
      return lines.join('\n') || 'no channels configured';
    },
    theme: () => `mode → ${toggleTheme() === 'light' ? 'PRINT' : 'CONSOLE'}`,
    date: () => new Date().toISOString(),
    clear: () => { out.innerHTML = ''; return null; },
    sudo: (arg) => /hire/i.test(arg)
      ? '<span class="hl">[sudo] permission granted.</span> scheduling interview… run <b>contact</b> to proceed.'
      : '<span class="err">sudo: nice try.</span>',
  };
  COMMANDS.projects = COMMANDS.ls;
  COMMANDS['?'] = COMMANDS.help;

  const history = []; let hi = 0;
  const run = (raw) => {
    const line = raw.trim();
    if (!line) return;
    history.push(line); hi = history.length;
    print(esc(line), 'cmd');
    const [cmd, ...rest] = line.split(/\s+/);
    const fn = COMMANDS[cmd.toLowerCase()];
    if (!fn) { print(`<span class="err">command not found: ${esc(cmd)}</span> — try <b>help</b>`); return; }
    const res = fn(rest.join(' '));
    if (res !== null && res !== undefined) print(res);
  };
  form.addEventListener('submit', (e) => { e.preventDefault(); run(input.value); input.value = ''; });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' && hi > 0) { input.value = history[--hi]; e.preventDefault(); }
    if (e.key === 'ArrowDown') { hi = Math.min(history.length, hi + 1); input.value = history[hi] || ''; e.preventDefault(); }
  });
  addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== input && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) {
      e.preventDefault();
      jump('#contact');
      setTimeout(() => input.focus({ preventScroll: true }), reduced ? 0 : 450);
    }
  });

  // boot sequence
  const boot = [
    'AC/DS-01 instrument console — boot',
    `[ ok ] clock synced · ${new Date().toISOString().slice(0, 19)}Z`,
    '[ ok ] 4 works indexed · 2 field records · 18 instruments',
    '[ ok ] channel open',
    '',
    'type <b>help</b> to list commands.',
  ];
  print(boot.join('\n'));

  /* ───────────── section readout + reveal ───────────── */
  const secEl = $('#sec-readout');
  const secIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) secEl.textContent = `§${en.target.dataset.sec} / 06`; });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('[data-sec]').forEach((s) => secIO.observe(s));

  if (!reduced) {
    const targets = $$('.sec-head, .filters, .table, .log, .matrix-wrap, .edu, .refs, .contact');
    targets.forEach((t) => t.classList.add('reveal'));
    const revIO = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); revIO.unobserve(en.target); } });
    }, { threshold: .08 });
    targets.forEach((t) => revIO.observe(t));
  }
})();
