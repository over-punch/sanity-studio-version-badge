# sanity-studio-version-badge

[![npm version](https://img.shields.io/npm/v/@liiift-studio/sanity-studio-version-badge.svg)](https://www.npmjs.com/package/@liiift-studio/sanity-studio-version-badge)
[![Sanity Studio v3 – v6](https://img.shields.io/badge/Sanity%20Studio-v3%20%E2%80%93%20v6-f03e2f.svg)](#peer-dependencies)
[![license](https://img.shields.io/npm/l/@liiift-studio/sanity-studio-version-badge.svg)](./LICENSE)

Sanity Studio plugin that shows installed `@liiift-studio` package versions in a fixed bottom-right badge on the structure root page. Surfaces recently published packages and reminds the team when updates are available.

<!-- MAINTAINER TODO: replace this placeholder with a real screenshot of the badge in Studio.
     This is a Studio UI widget and cannot be captured headlessly. Suggested shots:
       1. assets/badge.png        — the default badge on the structure root
       2. assets/badge-new.png    — a package showing the green "new" label + a description tooltip
     Save under assets/ (already excluded from the npm tarball) and embed with an absolute
     raw.githubusercontent.com URL on `main`, e.g.:
       ![Version badge in Sanity Studio](https://raw.githubusercontent.com/Liiift-Studio/sanity-studio-version-badge/main/assets/badge.png?v=1)
-->
> **Screenshot pending** — a maintainer screenshot of the badge in Studio goes here. The diagram below documents exactly when it appears.

The badge only renders on the structure root, and only when it has something worth saying:

![When the version badge appears: it shows on the structure root — always on localhost, and in production only when a package version changed or more than 7 days passed since it was last seen.](https://raw.githubusercontent.com/Liiift-Studio/sanity-studio-version-badge/main/assets/visibility-flow.svg?v=1)

## Install

```bash
npm install @liiift-studio/sanity-studio-version-badge
```

## Usage

Add the plugin to your `sanity.config.ts`:

```typescript
import { defineConfig } from 'sanity'
import { liiiftVersionBadge } from '@liiift-studio/sanity-studio-version-badge'

export default defineConfig({
	projectId: 'your-project-id',
	dataset: 'production',
	plugins: [
		liiiftVersionBadge({
			packages: [
				{ name: '@liiift-studio/sanity-font-manager', version: '2.3.18' },
				{ name: '@liiift-studio/sanity-bulk-data-operations', version: '2.0.0' },
				{ name: '@liiift-studio/sanity-studio-version-badge', version: '2.3.3' },
			],
		}),
	],
})
```

Pass the currently installed version of each `@liiift-studio` package. The badge compares these against the latest npm releases to highlight updates.

### Keeping the versions in sync

The `packages` list is supplied by you — the plugin does not auto-detect installed versions. To avoid a hand-maintained list drifting out of date, import each package's `version` straight from its `package.json` so the badge always reflects what's actually installed:

```typescript
import fontManagerPkg from '@liiift-studio/sanity-font-manager/package.json'
import bulkOpsPkg from '@liiift-studio/sanity-bulk-data-operations/package.json'

liiiftVersionBadge({
	packages: [
		{ name: fontManagerPkg.name, version: fontManagerPkg.version },
		{ name: bulkOpsPkg.name, version: bulkOpsPkg.version },
	],
})
```

This requires `resolveJsonModule` in your `tsconfig.json`. If you prefer to hardcode versions, update them whenever you bump a dependency — a stale entry makes the badge report the wrong installed version.

## Visibility rules

| Environment | When shown |
|---|---|
| Localhost | Always visible on the structure root |
| Production | On version change, or if more than 7 days since last shown |

- Packages published within the last 7 days are labeled **new**
- npm descriptions are fetched asynchronously and shown in tooltips
- A close button dismisses the badge for 7 days (cookie-based)

## Peer Dependencies

| Package | Version |
|---|---|
| `@sanity/icons` | `>=2 <6` |
| `@sanity/ui` | `>=2 <5` |
| `react` | `>=18` |
| `sanity` | `>=3 <7` |

Together these ranges mean the plugin supports **Sanity Studio v3, v4, v5 and v6** from a single build.

Built and type-checked against `sanity` v5, `@sanity/ui` v4, `@sanity/icons` v5 and React 19.

### Why `@sanity/ui` stops at `<5` when `sanity` goes to `<7`

This looks like a mistake and is not one: **Studio v6 ships `@sanity/ui` v4, not v5.** The `@sanity/ui` cap tracks that library's own major, which lags the Studio's. `>=2 <5` is the correct range for a plugin that supports Studio v3 through v6.

This plugin is installed as `studio.components.layout`, so it wraps the **entire** Studio — a single unresolved component blanks the whole app rather than one tool. `@sanity/ui` and `@sanity/icons` are therefore reached through [`@liiift-studio/sanity-ui-compat`](https://www.npmjs.com/package/@liiift-studio/sanity-ui-compat) rather than imported directly: `@sanity/ui` v4 declares `Tooltip` as `never` and `@sanity/icons` v5 declares `CloseIcon` as `never`, both of which still type-check at the import site and are `undefined` at runtime. Do not replace these with direct named imports.

More broadly: `@sanity/ui` v4 moved `Tooltip`, `Menu`, `MenuButton`, `MenuItem`, `Code`, `Popover`, `Autocomplete`, `Toast` and `useToast` to subpath entries, and `@sanity/icons` v5 removed every named `*Icon` export — while both still declare the removed names as `never`. That is why a green build here proves the code *links*, not that it *renders*.

### Verification status

- ✅ `npm run typecheck` passes clean against `sanity` v5 / `@sanity/ui` v4 / `@sanity/icons` v5.
- ✅ Running in three in-house Studios (Darden, TDF, MCKL).
- ❌ **Not** exercised in a running Sanity v6 Studio beyond those. v6 support rests on the peer ranges and the compat layer, not on a certified v6 test pass.

## Network & privacy

The badge runs entirely client-side in the Studio. While it is shown, it:

- **Fetches the public npm registry** (`https://registry.npmjs.org/<package>`) once per listed package, a few seconds after load, to read each package's publish dates and description. These are direct requests from the browser; no proxy or server is involved. If a request fails (offline, private/unpublished package), that package simply shows no "new" label and no tooltip.
- **Stores one cookie**, `liiift_pkg_versions`, holding the last-seen version of each listed package and a timestamp. This drives the "shown on version change or after 7 days" logic and the 7-day dismissal. The cookie is `SameSite=Strict`, scoped to the Studio origin, with a 1-year expiry. No version data leaves the browser.

Because the registry lookup hits the **public** npm registry, descriptions and "new" labels only resolve for packages published publicly. Note that these requests reveal which packages you list to npm (and anyone observing the connection), since each package name appears in a request URL.

## License

MIT — see [LICENSE](./LICENSE).
