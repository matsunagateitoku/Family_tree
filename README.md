# Family Tree

A simple static website documenting the family: a generational tree view plus a page per person with bio, photo, and stories. No build tools, no database — just HTML, CSS, and JSON files, made to be hosted for free on GitHub Pages.

## How it's organized

```
family-tree/
  index.html          <- homepage, shows everyone grouped by generation
  person.html         <- profile page template (one page, reused for everyone)
  css/style.css        <- all styling
  js/tree.js           <- builds the homepage from the data
  js/person.js          <- builds a profile page from the data
  data/manifest.json    <- list of every person's ID (the site's table of contents)
  data/people/*.json    <- one file per person
  images/               <- photos go here
```

The five people currently in `data/people/` (Robert, Margaret, David, Susan, "You") are **placeholder/example data** so you can see the site working. Replace or delete them once you start adding real family members.

## How to add a person

1. Copy `data/people/_template.json` to a new file named after them, e.g. `data/people/jane-smith.json`.
   - The filename (minus `.json`) becomes their `id` — keep it lowercase with hyphens, no spaces.
2. Fill in the fields:
   - `parents`, `spouses`, `children` are arrays of *other people's IDs* (not names) — this is what links everyone together into a tree. Leave as `[]` if unknown.
   - `stories` is a list of short anecdotes — as many or as few as you like.
   - Dates use `YYYY-MM-DD`. If you only know the year, `YYYY-01-01` works fine as a placeholder — just make it consistent.
3. Add a photo to `images/` (matching the `photo` path in the JSON), or leave the `photo` field pointing at a file that doesn't exist yet — the site just hides broken images rather than erroring.
4. Add their new ID to `data/manifest.json`.
5. Commit and push. GitHub Pages will pick it up automatically.

You don't need to fill in every field. Blank/empty values are handled gracefully — add detail over time as you find it.

## Generations

The homepage automatically groups people into generations based on the `parents` links — no need to specify a generation number by hand. Anyone with no known parents in the data becomes a "root" (generation 1); everyone else is placed one generation below their parents.

## Local preview

Because the site loads JSON files with `fetch()`, opening `index.html` directly from your filesystem won't work in most browsers (CORS restrictions on local files). Two easy options:

- **VS Code / Codespaces**: use the "Live Server" extension, or
- Run a tiny local server from the project folder: `python3 -m http.server`, then visit `http://localhost:8000`

## Hosting on GitHub Pages

Settings → Pages → Source: `main` branch, `/root` folder. Your site will be live at `https://<username>.github.io/<repo-name>/`.
