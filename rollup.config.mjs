import resolve from "@rollup/plugin-node-resolve"; // Allows Rollup to find and bundle external modules from `node_modules`
import commonjs from "@rollup/plugin-commonjs"; // Converts CommonJS modules to ES6 so they can be included in the Rollup bundle
import terser from "@rollup/plugin-terser"; // Minifies the output bundle to reduce file size
import postcss from "rollup-plugin-postcss"; // Handles CSS imports
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const variantsFile = fileURLToPath(new URL("src/variants.js", import.meta.url));
// Every variant export except allVariants, for the per-variant CDN scripts.
const variantNames = Array.from(readFileSync(variantsFile, "utf8").matchAll(/^export const (\w+) = \{/gm), (m) => m[1]);

const plugins = () => [
	resolve(),
	commonjs(),
	postcss({
		inject: false, // `import css from "./x.css"` gives the CSS as a string. The code adds it to the page only when needed.
		minimize: true // Minifies the CSS for reduced file size
	}),
	terser()
];

export default [
	// The three entry points, as CommonJS (.js) and ES modules (.mjs). Code they share goes into dist/chunks/.
	//   bundle   = "circle-loader"          everything, every variant registered
	//   core     = "circle-loader/core"     the Loader and the default "circle" variant
	//   variants = "circle-loader/variants" each variant as a separate, tree-shakable export
	//   element  = "circle-loader/element"  the <circle-loader> custom element (with every variant)
	{
		input: { bundle: "src/index.js", core: "src/core.js", variants: "src/variants.js", element: "src/element.js" },
		output: [
			{ dir: "dist", format: "cjs", entryFileNames: "[name].js", chunkFileNames: "chunks/[name]-[hash].js", exports: "named", sourcemap: true },
			// .mjs so Node always reads it as ESM (Next/Nuxt servers)
			{ dir: "dist", format: "esm", entryFileNames: "[name].mjs", chunkFileNames: "chunks/[name]-[hash].mjs", sourcemap: true }
		],
		plugins: plugins()
	},
	// The <script> tag (IIFE) build for CDNs: everything, exposed as window.CircleLoader.Loader
	{
		input: "src/index.js",
		output: { file: "dist/circle-loader.min.js", format: "iife", name: "CircleLoader", sourcemap: true },
		plugins: plugins()
	},
	// The same, plus the <circle-loader> element.
	{
		input: "src/element.js",
		output: { file: "dist/circle-loader.element.min.js", format: "iife", name: "CircleLoader", sourcemap: true },
		plugins: plugins()
	},
	// Core only (the "circle" variant), for pages that add a few variants with the scripts below.
	{
		input: "src/core.js",
		output: { file: "dist/circle-loader.core.min.js", format: "iife", name: "CircleLoader", sourcemap: true },
		plugins: plugins()
	},
	// One script per variant (dist/variants/<name>.min.js). Each registers its variant with the
	// CircleLoader global, so load it after circle-loader.core.min.js.
	...variantNames.filter((name) => name !== "circle").map((name) => ({
		input: "\0variant:" + name,
		output: { file: `dist/variants/${name}.min.js`, format: "iife" },
		treeshake: { moduleSideEffects: false }, // keeps the core (imported for `circle`) out
		plugins: [
			{
				name: "variant-entry",
				resolveId: (id) => (id.startsWith("\0variant:") ? id : null),
				load: (id) =>
					id.startsWith("\0variant:")
						? `import { ${name} as variant } from ${JSON.stringify(variantsFile)};
var global = typeof window !== "undefined" ? window : undefined;
var Loader = global && global.CircleLoader && global.CircleLoader.Loader;
if (Loader) Loader.register(variant);
else if (global) console.warn("[circle-loader] Load circle-loader.core.min.js before variants/${name}.min.js.");`
						: null
			},
			...plugins()
		]
	}))
];
