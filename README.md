# Wabi Sabi brand showcase

A standalone, responsive editorial website for Wabi Sabi. It uses plain HTML, CSS and JavaScript with no frontend build step or shopping flow.

## Preview

Open `index.html` directly, or run `node serve.cjs` and visit http://localhost:4001.

## Experience

- Burgundy and champagne visual direction with image-led storytelling
- Live launch countdown to November 15, 2026 at midnight India time (UTC+05:30), with a completed state after the launch date
- Centered launch modal after the intro, with a blurred backdrop, close and explore buttons, Escape support, and a smooth countdown transition into the homepage (instant with reduced motion)
- Short, skippable preloader with a reduced-motion alternative
- Supplied signature logo fitted to smooth SVG curves, with a steady handwriting reveal, compact responsive sizing, and the full matching logo as the favicon
- Four interactive lookbook chapters with keyboard navigation
- Scroll reveals, a moving editorial ribbon and a mobile menu
- Configurable boutique contact links and details

The images are editorial inspiration, not a record of current shop stock. Replace them with approved brand photography when available.

## Search visibility

The homepage targets dance dress rentals in Kerala and related dance costume rental searches through its title, description, visible heading and useful enquiry copy. Open Graph and Twitter metadata use the same positioning. Keep rental claims aligned with the actual service; the lookbook remains editorial inspiration.

The production URL is `https://www.wabisabibymk.com/`. The canonical link, Open Graph URL and `sitemap.xml` use that address; `robots.txt` allows crawling and points to the sitemap. Deploy both files at the domain root alongside `index.html`, and submit `https://www.wabisabibymk.com/sitemap.xml` in Google Search Console after deployment.

Add the verified town, address and contact details before introducing local business structured data; the current demo contact values are not suitable for it. Update the pre-launch descriptions and introductory copy when the shop opens.

## Boutique details

Edit `config.js` to add confirmed public details. Empty fields are hidden. A valid WhatsApp number adds a message button; otherwise a valid Instagram link adds an Instagram button. Phone, address, hours and map links appear only when supplied.

## Check

Run `node --test tests/showcase.test.cjs`. The browser test uses Playwright from a local installation or the sibling `ws-app` workspace, and Microsoft Edge on Windows.

The logo assets can be regenerated from the supplied `PROFILE.png` with `python tools/trace-logo.py path/to/PROFILE.png` (requires Pillow and NumPy). The trace preserves the original ink silhouette; the preloader animates a pen mask over it.
