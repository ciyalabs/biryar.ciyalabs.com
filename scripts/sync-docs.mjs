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
import { Buffer } from "node:buffer";
import { basename, dirname, join } from "node:path";

// The contents API rather than raw.githubusercontent.com. The raw host is
// CDN-cached for a few minutes, so a site deploy triggered right after a
// docs commit would compare against the previous version and fail for a
// reason that has nothing to do with the change. The API reflects a commit
// immediately. GITHUB_TOKEN is required rather than an optimisation: the
// product repository is private, so an unauthenticated read of it is
// indistinguishable from a repository that does not exist — the API
// answers 404 either way, which is deliberate on GitHub's part and
// confusing exactly once.
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
        (response.status === 404 && !process.env.GITHUB_TOKEN
          ? "The product repository is private, so an unauthenticated " +
            "read answers 404 whether or not the path exists. Set " +
            "GITHUB_TOKEN to a token with read access, or pass a local " +
            "checkout path."
          : response.status === 403
            ? "Rate limited; set GITHUB_TOKEN, or pass a local checkout path."
            : "Is the path still there?"),
    );
  }
  return response.text();
}

async function readBinary(source, from) {
  if (source) return readFile(join(source, from));

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
    throw new Error(`${url} -> HTTP ${response.status} ${response.statusText}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

/**
 * Where an image referenced from a document is served here.
 *
 * Images live beside their document in the product repository, so the paths
 * in the markdown are relative and mean nothing to this site. They are
 * copied under `public/docs/` at the same repository-relative path, which
 * keeps one obvious mapping in both directions and means two documents can
 * use the same screenshot without either knowing.
 */
// repoPath already begins with "docs/", so the root is just public/: the
// file lands at public/docs/... and is served at /docs/... . Rooting it at
// public/docs/ instead publishes it at /docs/docs/..., which the page's own
// link then misses — the write path and the URL are derived from the same
// string, which is why both live here.
const ASSET_ROOT = "public";

function assetUrl(repoPath) {
  // "docs/setup/img/x.jpg" -> "/docs/setup/img/x.jpg"
  return "/" + repoPath;
}

/**
 * Rewrite a repository-relative markdown link to its page on this site.
 *
 * A link whose target is not a page here used to point at the file on
 * github.com. The repository is private, so that destination now answers
 * 404 to everyone who is not a customer — and a link that cannot be
 * opened is worse than no link, because the reader spends the click
 * finding out. Those become inline code instead: the sentence still says
 * which file it means, and promises nothing.
 */
function rewriteLinks(body, from) {
  return body.replace(
    /\[([^\]]+)\]\(([^)\s]+\.md)(#[^)]*)?\)/g,
    (whole, text, target, hash) => {
      // Resolved against the directory of the document it is in, the way
      // a reader on GitHub would.
      const resolved = join(dirname(from), target).replaceAll("\\", "/");
      const page = LINK_TARGET.get(resolved);
      if (!page) return `\`${basename(resolved)}\``;
      return `[${text}](${page}${hash ?? ""})`;
    },
  );
}

/**
 * Rewrite image references and say which files have to be copied.
 *
 * Markdown images only: a link to an image is a link and is handled by
 * rewriteLinks, which sends anything that is not a page to GitHub.
 */
function rewriteImages(body, from, wanted) {
  return body.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (whole, alt, target) => {
    if (/^(https?:)?\/\//.test(target) || target.startsWith("/")) return whole;
    const resolved = join(dirname(from), target).replaceAll("\\", "/");
    wanted.add(resolved);
    return `![${alt}](${assetUrl(resolved)})`;
  });
}

function render(page, markdown, wanted) {
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
    rewriteImages(rewriteLinks(body, page.from), page.from, wanted).trimEnd() +
    "\n"
  );
}

const args = process.argv.slice(2);
const check = args.includes("--check");
const source = args.find((a) => !a.startsWith("--"));

let stale = [];
const wanted = new Set();
for (const page of PAGES) {
  const rendered = render(page, await read(source, page.from), wanted);
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

// Images second: the pages above are what say which ones are needed.
for (const repoPath of wanted) {
  const bytes = await readBinary(source, repoPath);
  const path = join(ASSET_ROOT, repoPath);

  const current = await readFile(path).catch(() => null);
  if (current !== null && current.equals(bytes)) continue;

  if (check) {
    stale.push(repoPath);
    continue;
  }
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, bytes);
  console.log(`${current === null ? "added" : "updated"} ${repoPath}`);
}

if (check && stale.length) {
  console.error(
    "These pages no longer match ciyalabs/biryar:\n  " +
      stale.join("\n  ") +
      "\n\nRun `node scripts/sync-docs.mjs` and commit the result.",
  );
  process.exit(1);
}
if (check) {
  console.log(
    `${PAGES.length} pages and ${wanted.size} images match the product repository.`,
  );
}
