# Adding a store preview

A private preview shows the shared demo catalogue under a store's own name, logo and colours, at
`https://demo.ahmedouael.com/p/<slug>`. It is never indexed and every page says it is a proposal, not
the store's official site. About 15 minutes per store.

1. **Logo.** Save their Instagram profile picture as `public/brands/<slug>/logo.png` (or `.jpg`).
   `<slug>` is lowercase letters, digits and dashes, e.g. `advancedmedia`.
   Opening the profile page and copying the `og:image` link gives the picture; ask the store for a
   high-quality logo once they say yes.

2. **Brand file.** Copy `brands/advancedmedia.ts` (a private example; `brands/volta.ts` is the public one)
   to `brands/<slug>.ts` and set:
   - `slug`, `name`, `logo`, `logoAlt`, `visibility: "private"`;
   - `colors`, picked from the logo: `primary` (buttons), `onPrimary` (text on buttons), `accent`,
     `background`, `surface` (cards), `text`, `muted`;
   - `tagline` and `deliveryPromise` from their Instagram bio (French, no full stop);
   - `instagram`: their handle without `@`.

3. **Register and check.** Add it to the `BRANDS` list in `brands/index.ts`, then run `npm test`.
   The brand tests fail if a colour pair is below WCAG AA contrast (4.5:1), a colour isn't `#rrggbb`,
   the slug isn't lowercase, or the logo file is missing. Fix the colour the test names (usually make
   `text` or `primary` darker) and run again.

4. **Deploy.** Commit and push; Netlify deploys. Open `https://demo.ahmedouael.com/p/<slug>` on your
   phone and check the banner reads "Maquette proposée à <name> par Willou — pas une boutique officielle".

5. **Video.** Record 30 seconds in a phone-sized browser: search a product → product page → order with
   a wilaya ("Remplir avec des données de test") → the order in the dashboard (log in with the demo
   access shown on `/p/<slug>/admin/login`).

6. **Send.** Send the private link and the video in the DM thread.

Orders placed on a preview are stored with that store's slug and only appear in its dashboard. The
WhatsApp message they open starts with `[Démo <name>]`. Everything is wiped every night at 03:00 UTC
(`.github/workflows/reset-demo.yml`).

## One site per store (shorter link)

To send `https://<name>.netlify.app` instead of `/p/<slug>`, deploy the same repo as its own Netlify
site and set the environment variable `NEXT_PUBLIC_DEFAULT_BRAND=<slug>` before the build (changing it
needs a redeploy). That store then opens at the bare address, `/p/<slug>` links keep working, Volta and
every other brand return 404, and the whole site is noindex (robots.txt disallows everything, empty
sitemap). A slug that isn't in `brands/index.ts` fails the build.
