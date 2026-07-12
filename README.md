# CC Grøndal website

Modern static one-page website for Cykle Club Grøndal.

## Structure

- `public/index.html` – main website
- `public/styles.css` – visual design and responsive layout
- `public/script.js` – navigation, scroll effects and next training date
- `public/robots.txt` and `public/sitemap.xml` – search engine files
- `wrangler.jsonc` – Cloudflare Worker static assets configuration

## Deployment

The `main` branch is connected to Cloudflare Workers. Every push automatically deploys the contents of `public`.

## Domain launch checklist

1. Review all club details and dates.
2. Test the `.workers.dev` preview on mobile and desktop.
3. Add the custom domain in Cloudflare.
4. Confirm all old WordPress redirects.
5. Submit `sitemap.xml` in Google Search Console.
