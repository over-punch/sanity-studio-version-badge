import { defineConfig } from 'tsup'

export default defineConfig({
	entry: ['src/index.ts'],
	format: ['esm', 'cjs'],
	dts: false,
	clean: true,
	jsx: true,
	// esbuild matches externals exactly, so the compat's /icons subpath needs its own entry
	external: [
		'react',
		'react-dom',
		'sanity',
		'@sanity/ui',
		'@sanity/icons',
		'@overpunch/sanity-ui-compat',
		'@overpunch/sanity-ui-compat/icons',
	],
})
