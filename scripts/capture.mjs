// Reproducible asset harness — rasterizes the hand-authored README SVG(s) to PNG for local preview.
//
// The source of truth for each diagram is the committed, diffable SVG in assets/.
// GitHub and npm render the SVG directly, so a PNG is only needed for quick local preview.
// Edit the .svg, then run `npm run capture` to refresh the preview PNGs and bump the
// ?v=N cache-buster in README.md so GitHub/npm re-fetch the updated image.
//
// Usage: npm run capture
// Requires macOS `qlmanage` (preinstalled) — no extra dependencies. Skips gracefully elsewhere.

import {execFileSync} from 'node:child_process'
import {readdirSync, existsSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {dirname, join} from 'node:path'

/** Absolute path to the assets/ directory holding the source SVGs. */
const ASSETS_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets')

/** Rasterize every SVG in assets/ to a sibling .png preview using macOS qlmanage. */
function capture() {
	if (!existsSync(ASSETS_DIR)) {
		console.warn('No assets/ directory found — nothing to capture.')
		return
	}

	const svgs = readdirSync(ASSETS_DIR).filter((f) => f.endsWith('.svg'))
	if (svgs.length === 0) {
		console.warn('No .svg files in assets/ — nothing to capture.')
		return
	}

	let hasQlmanage = true
	try {
		execFileSync('command', ['-v', 'qlmanage'], {shell: '/bin/bash', stdio: 'ignore'})
	} catch {
		hasQlmanage = false
	}

	if (!hasQlmanage) {
		console.warn('qlmanage not available (non-macOS) — SVGs are committed as-is; skipping PNG preview.')
		return
	}

	for (const svg of svgs) {
		const src = join(ASSETS_DIR, svg)
		execFileSync('qlmanage', ['-t', '-s', '1520', '-o', '/tmp', src], {stdio: 'ignore'})
		console.log(`Rendered preview for ${svg} → /tmp/${svg}.png`)
	}

	console.log('Capture complete. Bump the ?v=N cache-buster in README.md when an image changed.')
}

capture()
