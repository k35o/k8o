---
name: next-browser
description: >-
  CLI that gives agents what humans get from React DevTools and the Next.js
  dev overlay — component trees, props, hooks, PPR shells, errors, network —
  as shell commands that return structured text.
---

# next-browser

Always invoke via `pnpm next-browser`. Do NOT install globally or run the
bare `next-browser` command. All commands in this document assume the
`pnpm next-browser` prefix.

---

## Next.js docs awareness

If the project's Next.js version is **v16.2.0-canary.37 or later**, bundled
docs live at `node_modules/next/dist/docs/`. Before doing PPR work, Cache
Components work, or any non-trivial Next.js task, read the relevant doc there
— your training data may be outdated. The bundled docs are the source of truth.

See https://nextjs.org/docs/app/guides/ai-agents for background.

---

## When this skill loads

Your first message introduces the tool and asks setup questions. Don't say
"ready, what would you like to do?" and don't run speculative commands or
auto-discover (port scans, `project`, config reads).

If the user already provided a URL, cookies, and task in their message,
skip the questions — go straight to `open` and start working. Only ask
what's missing.

Otherwise say something like:

> This opens a headed browser against your Next.js dev server so I can
> read the React component tree, see the PPR shell, and check errors the
> way you would in DevTools. To start:
>
> - What's your dev server URL? (And is it running?)
> - Are the pages you're debugging behind a login? If so I'll need your
>   session cookies — easiest is to copy them from your browser's
>   DevTools → Application → Cookies into a JSON file like
>   `[{"name":"session","value":"..."}]`. If the pages are public, skip
>   this.

Wait for answers. Then `open <url> [--cookies-json <file>]`. Every other
command errors without an open session.

---

## Commands

### `open <url> [--cookies-json <file>]`

Launch browser, navigate to URL. With `--cookies-json`, sets auth cookies
before navigating (domain derived from URL hostname).

```
$ pnpm next-browser open http://localhost:3024/vercel --cookies-json cookies.json
opened → http://localhost:3024/vercel (11 cookies for localhost)
```

Cookie file format: `[{"name":"authorization","value":"Bearer ..."}, ...]`

Only `name` and `value` are required per cookie — omit `domain`, `path`,
`expires`, etc. To create the file, use Bash (`echo '[...]' > /tmp/cookies.json`)
since the Write tool requires a prior Read.

### `close`

Close browser and kill daemon.

---

### `goto <url>`

Navigate to a URL with a fresh server render. The browser loads a new
document — equivalent to typing a URL in the address bar.

```
$ pnpm next-browser goto http://localhost:3024/vercel/~/deployments
→ http://localhost:3024/vercel/~/deployments
```

### `push [path]`

Client-side navigation — the page transitions without a full reload, the
way a user clicks a link in the app. Without a path, shows an interactive
picker of all links on the current page.

```
$ pnpm next-browser push /vercel/~/deployments
→ http://localhost:3024/vercel/~/deployments
```

If push fails silently (URL unchanged), the route wasn't prefetched.

### `back`

Go back one page in browser history.

### `reload`

Reload the current page from the server.

### `ssr lock`

Block external scripts on all subsequent navigations. While locked, every
`goto`, `push`, `back`, and `reload` shows the raw server-rendered HTML
without React hydration or client-side JavaScript — what search engines
and social crawlers see.

### `ssr unlock`

Re-enable external scripts. The next navigation will load normally with
full hydration.

### `perf [url]`

Profile a full page load — reloads the current page (or navigates to a
URL) and collects Core Web Vitals and React hydration timing in one pass.

### `restart-server`

Restart the Next.js dev server and clear its caches. Forces a clean
recompile from scratch. Last resort — HMR picks up code changes on its own.

---

### `ppr lock`

**Prerequisite:** PPR requires `cacheComponents` to be enabled in
`next.config`. Without it the shell won't have pre-rendered content to show.

Freeze dynamic content so you can inspect the static shell — the part of
the page that's instantly available before any data loads.

### `ppr unlock`

Resume dynamic content and print a shell analysis — which Suspense
boundaries were holes in the shell, what blocked them, and which were
static.

---

### `tree`

Full React component tree — every component on the page with its
hierarchy, like the Components panel in React DevTools.

### `tree <id>`

Inspect one component: ancestor path, props, hooks, state, source location.

---

### `viewport [WxH]`

Show or set the browser viewport size.

### `screenshot`

Full-page PNG to a temp file. Returns the path. Read with the Read tool.

**Prefer `snapshot` over `screenshot`** when you need to understand
what's on the page or decide what to interact with.

### `snapshot`

Snapshot the page's accessibility tree with `[ref=eN]` markers on every
interactive element. Use this to discover what's on the page before clicking.

### `click <ref|text|selector>`

Click an element using real pointer events.

### `fill <ref|selector> <value>`

Fill a text input or textarea.

### `eval [ref] <script>`

Run JS in page context. Returns the result as JSON.

---

### `errors`

Build and runtime errors for the current page.

### `logs`

Recent dev server log output.

### `network`

List all network requests since last navigation.

### `network <idx>`

Full request/response for one entry.

### `page`

Route segments for the current URL.

### `project`

Project root and dev server URL.

### `routes`

All app router routes.

### `action <id>`

Inspect a server action by its ID.

---

## Scenarios

### Growing the static shell

The shell is what the user sees the instant they land — before any dynamic
data arrives. Work it top-down using `ppr lock`/`ppr unlock`.

**Direct load — the PPR shell.** Lock first, then `goto` the target.
**Client navigation — the prefetched shell.** `goto` the origin unlocked,
let it hydrate, then lock and `push` to the target.

Between iterations: check `errors` while unlocked.
After code changes: HMR picks it up — just re-lock and `goto`.
