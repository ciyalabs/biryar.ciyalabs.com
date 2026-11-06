/**
 * Pull the documentation from the product repository.
 *
 * The site had its own copies of the setup guides. Within a day of going
 * public, the SP-API page here still told a seller to paste five values
 * including a refresh token, which the product had stopped doing several
 * commits earlier — so the public page was wrong about the one step it
 * exists to explain. Two hand-maintained copies of the same document drift,
 * and the one on the website is the copy strangers read.
 *
 * So `docs/` in ciyalabs/biryar is the source, and these pages are built
 * from it. The result is committed rather than fetched at build time: a
 * build should not depend on the network, and a diff should be reviewable.
 * CI runs this and fails if the committed copy differs, which is what makes
 * the single source of truth true rather than aspirational.
 *
 *   node scripts/sync-docs.mjs            # from GitHub (main)
 *   BIRYAR_DOCS_REF=v0.1.0 node scripts/sync-docs.mjs   # from a tag
 *   node scripts/sync-docs.mjs ../biryar  # from a local checkout
 *   node scripts/sync-docs.mjs --check    # fail if anything would change
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";

// The contents API rather than raw.githubusercontent.com. The raw host is
// CDN-cached for a few minutes, so a site deploy triggered right after a
// docs commit would compare against the previous version and fail for a
// reason that has nothing to do with the change. The API reflects a commit
// immediately. GITHUB_TOKEN, when present, only raises the rate limit; the
// repository is public and the script works without it.
const API = "https://api.github.com/repos/ciyalabs/biryar/contents";
const REF = process.env.BIRYAR_DOCS_REF ?? "main";
const OUT = "src/content/docs";

/**
 * Which documents become pages, and the front matter they get.
 *
 * Titles live here rather than in the source documents because they are a
 * property of this site's navigation, not of the document: the repository
 * calls the file sp-api.md and the sidebar calls it "Getting your SP-API
 * keys". Everything below the front matter is the repository's text,
 * unedited.
 */
const PAGES = [
  {
    from: "docs/setup/install.md",
    to: "setup/install.md",
    title: "Install",
    description: "Getting Biryar running on your own machine.",
    order: 1,
  },
  {
    from: "docs/setup/sp-api.md",
    to: "setup/sp-api.md",
    title: "Getting your SP-API keys",
    description:
      "Registering your own Amazon application and authorising it against your own seller account.",
    order: 2,
  },
  {
    from: "docs/setup/keepa.md",
    to: "setup/keepa.md",
    title: "Keepa",
    description: "Whether you need a Keepa subscription to use Biryar.",
    order: 3,
  },
  {
    from: "docs/methodology/fees.md",
    to: "methodology/fees.md",
    title: "How the fees are measured",
    description: "Why the real Amazon cut is not the one on the fee schedule.",
  },
  {
    from: "docs/architecture/tenancy.md",
    to: "architecture/tenancy.md",
    title: "How tenants are kept apart",
    description:
      "Why isolation is enforced by the database rather than by remembering to filter.",
  },
];

/** Where a relative link in the repository points on this site. */
const LINK_TARGET = new Map(
  PAGES.map(({ from, to }) => [from, "/" + to.replace(/\.md$/, "/")]),
);

async function read(source, from) {
  if (source) return readFile(join(source, from), "utf8");

  const url = `${API}/${from}?ref=${encodeURIComponent(REF)}`;
  const headers = {
    Accept: "application/vnd.github.raw",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(
      `${url} -> HTTP ${response.status} ${response.statusText}. ` +
        (response.status === 403
          ? "Rate limited; set GITHUB_TOKEN, or pass a local checkout path."
          : "Is the path still there?"),
    );
  }
  return response.text();
}

/** Rewrite a repository-relative markdown link to its page on this site. */
function rewriteLinks(body, from) {
  return body.replace(/\]\(([^)\s]+\.md)(#[^)]*)?\)/g, (whole, target, hash) => {
    // Resolve the link against the directory of the document it is in,
    // the way a reader on GitHub would.
    const resolved = join(dirname(from), target).replaceAll("\\", "/");
    const page = LINK_TARGET.get(resolved);
    if (!page) {
      // Not a page on this site: send the reader to the file on GitHub
      // rather than leaving a link that 404s here.
      return `](https://github.com/ciyalabs/biryar/blob/main/${resolved}${hash ?? ""})`;
    }
    return `](${page}${hash ?? ""})`;
  });
}

function render(page, markdown) {
  // A source document may carry its own front matter. Left in place it is
  // not read as front matter here — this file gets its own, above — so it
  // renders as a horizontal rule and a stray "title:" line in the middle of
  // the page. That shipped once, on the install guide.
  const withoutFrontMatter = markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n+/, "");

  // Starlight renders `title` as the h1, so the document's own h1 would be a
  // second one. Drop it and keep what follows.
  const body = withoutFrontMatter.replace(/^#\s+.*\n+/, "");

  const sidebar = page.order ? `sidebar:\n  order: ${page.order}\n` : "";
  return (
    "---\n" +
    `title: ${page.title}\n` +
    `description: ${page.description}\n` +
    sidebar +
    "---\n\n" +
    // An HTML comment, not `{/* */}`: these are .md pages, where MDX
    // expressions are not parsed and would render as visible text.
    "<!-- Generated by scripts/sync-docs.mjs from ciyalabs/biryar.\n" +
    "     Edit the document in that repository, not this file. -->\n\n" +
    rewriteLinks(body, page.from).trimEnd() +
    "\n"
  );
}

const args = process.argv.slice(2);
const check = args.includes("--check");
const source = args.find((a) => !a.startsWith("--"));

let stale = [];
for (const page of PAGES) {
  const rendered = render(page, await read(source, page.from));
  const path = join(OUT, page.to);

  const current = await readFile(path, "utf8").catch(() => null);
  if (current === rendered) continue;

  if (check) {
    stale.push(page.to);
    continue;
  }
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, rendered);
  console.log(`${current === null ? "added" : "updated"} ${page.to}`);
}

if (check && stale.length) {
  console.error(
    "These pages no longer match ciyalabs/biryar:\n  " +
      stale.join("\n  ") +
      "\n\nRun `node scripts/sync-docs.mjs` and commit the result.",
  );
  process.exit(1);
}
if (check) console.log(`${PAGES.length} pages match the product repository.`);
