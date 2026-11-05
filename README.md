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
src/styles/           the Biryar accent colour
public/reports/       the six technical reports, served as published
public/CNAME          the custom domain
astro.config.mjs      sidebar, title, social links
```

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
