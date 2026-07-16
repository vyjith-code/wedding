# Akhil & Arya — Wedding Invitation Website

A two-page, mobile-first wedding invitation: a luxury envelope landing page with a
cinematic opening animation, followed by a full wedding details page. Built with
plain HTML5, CSS3, and vanilla JavaScript only — no frameworks, no build step.

## How to view it

Just open `index.html` in a browser. For the smoothest experience (some browsers
restrict `fetch`/module behavior on `file://`), serve it locally instead:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Folder structure

```
/
├── index.html          → Envelope landing page
├── invitation.html      → Wedding details page
├── css/
│   ├── style.css        → Envelope + opening animation styles
│   └── invitation.css   → Details page styles
├── js/
│   ├── animation.js      → Sequenced envelope-opening animation
│   └── app.js            → Countdown, music, RSVP modal, share, gallery
├── assets/
│   ├── images/           → Gallery photos (add your own, see below)
│   ├── icons/            → (all icons are inline SVG — folder kept for future use)
│   └── music/            → Background instrumental + sound effects (add your own)
└── fonts/                → (see "Fonts & true offline use" below)
```

## Adding your own content

- **Wedding details**: edit the text directly in `invitation.html` (names, date,
  time, venues, dress code) and the `WEDDING_DATE` constant at the top of
  `js/app.js` (used by the live countdown).
- **Phone numbers**: update the `href="tel:..."` and `href="https://wa.me/..."`
  values on the Call / WhatsApp buttons in `invitation.html`.
- **Gallery photos**: drop images into `assets/images/` named `gallery-1.jpg`,
  `gallery-2.jpg`, `gallery-3.jpg` (or update the `src` attributes). Slides
  without an image gracefully show an "Add your photo" placeholder instead of
  a broken image.
- **Sound**: drop `wax-seal-click.mp3` and `paper-open.mp3` into `assets/music/`
  for the envelope page, and `instrumental.mp3` for the background music on the
  details page. All audio is optional — the site works perfectly with no audio
  files present.

## Fonts & true offline use

This build loads **Great Vibes**, **Cormorant Garamond**, and **Playfair
Display** from Google Fonts, with a serif system-font fallback so the layout
still looks intentional if the CDN request fails. For a fully offline copy:

1. Download the three font families' `.woff2` files.
2. Place them in `fonts/`.
3. Replace the `<link>` tags in both HTML files with a small `@font-face`
   stylesheet pointing at `fonts/`.

## Notes on the animation

The envelope-opening sequence in `js/animation.js` only ever toggles CSS
classes — every visual change (press, fold, rise, zoom, fade) is a CSS
`transition`/`transform`, kept to `transform` and `opacity` for smooth 60fps
performance with no JavaScript animation libraries involved.
