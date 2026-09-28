# Wabi Sabi brand showcase

A standalone, responsive editorial website for Wabi Sabi. It uses plain HTML, CSS and JavaScript with no frontend build step or shopping flow.

## Preview

Open `index.html` directly, or run `node serve.cjs` and visit http://localhost:4001.

## Experience

- Burgundy and champagne visual direction with image-led storytelling
- Short, skippable preloader with a reduced-motion alternative
- Four interactive lookbook chapters with keyboard navigation
- Scroll reveals, a moving editorial ribbon and a mobile menu
- Configurable boutique contact links and details

The images are editorial inspiration, not a record of current shop stock. Replace them with approved brand photography when available.

## Boutique details

Edit `config.js` to add confirmed public details. Empty fields are hidden. A valid WhatsApp number adds a message button; otherwise a valid Instagram link adds an Instagram button. Phone, address, hours and map links appear only when supplied.

## Check

Run `node --test tests/showcase.test.cjs`. The browser test uses Playwright from a local installation or the sibling `ws-app` workspace, and Microsoft Edge on Windows.
