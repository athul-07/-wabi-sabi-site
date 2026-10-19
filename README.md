# Wabi Sabi launch invitation

A responsive, standalone invitation using the existing Wabi Sabi logo and burgundy/champagne branding. Plain HTML, CSS and JavaScript; no build step.

The launch is **28 October 2026 at 5:00 pm IST**, at **Kallampara, Nedumangad**. The countdown uses an explicit UTC+05:30 offset regardless of the visitor’s timezone, and stops at zero with a completed message.

The page includes an opening curtain animation, staggered text reveals, floating gold particles and animated countdown digits. A pause button and reduced-motion support are included. The invitation details remain available without JavaScript.

Run `node serve.cjs` to preview at http://localhost:4001. Deploy the root HTML, CSS, JS and assets to the existing host. The canonical domain remains https://www.wabisabibymk.com/.

Run `node --test tests/showcase.test.cjs` to check the countdown boundary, mobile layout, motion controls and no-JavaScript fallback. Tests use the existing Playwright installation and Microsoft Edge on Windows.

The former lookbook assets and config.js are retained on disk but are no longer loaded by the invitation.
