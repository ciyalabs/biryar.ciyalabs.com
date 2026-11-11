# biryar.ciyalabs.com

The Biryar homepage, documentation, and report series. Astro + Starlight,
deployed to GitHub Pages.

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # → dist/
```

**Requires Node 22.23.4 or newer.** Astro 7 sets that floor, and Ubuntu's apt
package is older than it — install Node from NodeSource or nvm, not apt.

## Layout

```
src/content/docs/     the documentation, one Markdown file per page
src/diagrams/         drawings used by this site's own pages
src/components/       Diagram.astro, which places a drawing in a page
src/styles/           the Biryar accent colour, and the drawings' colours
scripts/sync-docs.mjs pulls the guides from the product repository
public/reports/       the six technical reports, served as published
public/CNAME          the custom domain
astro.config.mjs      sidebar, title, social links
```

## Where a page comes from

Most guides are written in the product repository (`docs/` in
ciyalabs/biryar) and copied here by `node scripts/sync-docs.mjs ../biryar`.
Those files say so at the top; edit them there, not here. The pages that
belong to this site alone are the home page, Get Biryar, Support, Words
used here, Reports and BiryarBot.

**Push this site first, then the product repository.** The check runs on
the product's side: its Docs workflow compares the guides there with this
site as it stands on GitHub. Pushed in the other order, that check is red
until this site has caught up and the check is run again. The deploy here
checks nothing against the product repository, which is private and
cannot be read from this one.

## Drawings

Every drawing is an SVG placed inline in its page, so that it follows the
light and dark switch. A drawing is written against class names
(`d-ink`, `d-box`, `d-blue` and so on) whose colours are set once per
theme in `src/styles/biryar.css`; it never names a colour itself. Each
file also carries a small style block of its own, used only when the file
is opened by itself.

- In a guide from the product repository, write
  `![what it shows](img/name.svg "Caption")`. The sync puts the drawing
  into the page.
- In a page of this site, `<Diagram name="name" caption="..." />` does the
  same for a file in `src/diagrams/`.

The reports are standalone HTML with their own styling and citation widget.
They are served from `public/` untouched rather than ported into Markdown, so
the writing stays exactly as it was published.

## Deployment

`.github/workflows/deploy.yml` builds on every push to `main` and publishes to
GitHub Pages. Set **Settings → Pages → Source** to **GitHub Actions** once;
the other Ciya Labs sites deploy from a branch instead, which does not work for
a site that has to be built.

Pushing the workflow file needs a token with the `workflow` scope. If
`git push` is rejected for that reason, add the scope with
`gh auth refresh -h github.com -s workflow`.
