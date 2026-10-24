# AC/DS-01 — Ananya Chepuri, Data Scientist

Personal portfolio styled as an instrument console / research journal.
Plain HTML, CSS and JavaScript, with no build step and no dependencies (fonts come from Google Fonts).

```
index.html    page structure and content
styles.css    design system: grid, type, console + print themes
script.js     clocks, grain, count-ups, SVG chart, works table, skill matrix, terminal
favicon.svg
.nojekyll     tells GitHub Pages to serve files as-is
```

## Before you publish

1. Open `script.js` and fill in the `CONTACT` block at the top (email, LinkedIn, GitHub).
2. Optional: commit your résumé as `assets/Ananya_Chepuri_Resume.pdf` and set `resume: 'assets/Ananya_Chepuri_Resume.pdf'`.

## Deploy to GitHub Pages

```bash
git add .
git commit -m "Launch portfolio"
git push origin main
```

Then on GitHub, go to **Settings → Pages → Build and deployment**, set Source to **Deploy from a branch**, choose `main` / `(root)`, and save.
The site goes live at `https://<username>.github.io/<repo-name>/`.
If you name the repo `<username>.github.io`, it's served at the root domain instead.

## Preview locally

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Interactions

- **Status bar:** live UTC clock (0.1 s resolution), New Jersey local time, cursor X·Y, current section, and a console/print theme toggle.
- **FIG. 01:** an SVG line chart built point by point from a seeded series, drawn on scroll, with a hover probe. It's a schematic; only the 92% endpoint is a reported figure.
- **§01 Index of Works:** filter, sort by year, and click a row to expand it into abstract, pipeline and spec.
- **§03 Instrumentation Matrix:** a skill × project grid with row and column totals. Hover to trace a row and column.
- **§06 Terminal:** press `/` from anywhere. Try `help`, `ls`, `open 1`, `contact`, `theme`.
