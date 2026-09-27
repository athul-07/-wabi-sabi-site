# Wabi Sabi — shop showcase

A standalone boutique website built with HTML, CSS, and vanilla JavaScript.
No framework, frontend dependencies, or build step. It is separate from the shop's
staff finance application and does not expose the shop database.

## Open it

Double-click `index.html`, or from this directory run:

```sh
node serve.cjs
```

Open **http://localhost:4001**. The optional preview server requires Node.js.
The website can be deployed to any static hosting service by uploading
`index.html`, `styles.css`, `script.js`, `config.js`, and `assets/`.

## What's included

- Responsive fashion showcase with original editorial images stored locally.
- Bridal, groom, and celebration collections with working filters and detail dialogs.
- Favourites saved in the visitor's browser, with a wishlist dialog.
- Buy/rent introduction, brand story, moodboard, and expandable FAQs.
- Mobile navigation, keyboard-accessible dialogs, and reduced-motion support.
- A visit-planning form that downloads a styling note; it does not pretend to book
  an appointment or send an enquiry to an unconfigured destination.

## Set up your actual shop details

Edit `config.js` with the confirmed public address, hours, phone, map, and Instagram
link. Blank values are omitted. Once `whatsappNumber` contains an international
number with its country code, the form opens WhatsApp with the visitor's note.
The visitor reviews and sends it. Without a number, the form downloads a text note.
No personal form details are saved or submitted to a server by this site.

Replace the editorial pictures with the shop's own outfit photography when ready.
The site currently labels these images as styling inspiration, not actual stock.
No shop address, contact number, reviews, or stock availability has been invented.
Fonts are loaded from Google Fonts; serif and sans-serif fallbacks work offline.

## Images

Three original images were made with the built-in imagegen tool:
`assets/hero.png`, `assets/groom.png`, and `assets/celebration.png`.
The final prompts are in `assets/IMAGE-PROMPTS.md`.

## Development checks

From the parent application workspace, run:

```sh
node --test site-ws/tests/showcase.test.cjs
```

Browser checks use the existing parent workspace Playwright installation and
Microsoft Edge on Windows (Chromium on other operating systems). Tests do not
modify the finance app or shop records.
