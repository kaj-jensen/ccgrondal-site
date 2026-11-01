# CC Grøndal website

Modern static one-page website for Cykle Club Grøndal.

## Structure

- `public/index.html` – main website
- `public/styles.css` – visual design and responsive layout
- `public/script.js` – navigation, scroll effects and next training date
- `public/robots.txt` and `public/sitemap.xml` – search engine files
- `wrangler.jsonc` – Cloudflare Worker static assets configuration

## Deployment

Google Analytics loads only after an explicit choice in the cookie panel. Visitors can refuse, or reopen Cookievalg in the footer to withdraw permission. Choices expire after 180 days. Withdrawing clears analytics cookies and reloads the page to stop analytics; Cloudflare security cookies are preserved. The site remains usable without analytics.

Run `node scripts/check-csp.mjs`, `node scripts/check-framework-policy.mjs`, and `node --test scripts/analytics-consent.test.mjs` before publication.

The `main` branch is connected to Cloudflare Workers. Every push automatically deploys the contents of `public`.

## Domain launch checklist

1. Review all club details and dates.
2. Test the `.workers.dev` preview on mobile and desktop.
3. Add the custom domain in Cloudflare.
4. Confirm all old WordPress redirects.
5. Submit `sitemap.xml` in Google Search Console.
