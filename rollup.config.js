import resolve from "@rollup/plugin-node-resolve"; // Allows Rollup to find and bundle external modules from `node_modules`
import commonjs from "@rollup/plugin-commonjs"; // Converts CommonJS modules to ES6 so they can be included in the Rollup bundle
import terser from "@rollup/plugin-terser"; // Minifies the output bundle to reduce file size
import postcss from "rollup-plugin-postcss"; // Handles CSS imports

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
	{
		input: { bundle: "src/index.js", core: "src/core.js", variants: "src/variants.js" },
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
	}
];
