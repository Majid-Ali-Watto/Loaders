import resolve from "@rollup/plugin-node-resolve"; // Allows Rollup to find and bundle external modules from `node_modules`
import commonjs from "@rollup/plugin-commonjs"; // Converts CommonJS modules to ES6 so they can be included in the Rollup bundle
import { terser } from "rollup-plugin-terser"; // Minifies the output bundle to reduce file size
import postcss from "rollup-plugin-postcss"; // Handles CSS imports and optionally processes them with PostCSS plugins

export default {
	input: "src/index.js", // The entry point for the bundle, the main file Rollup will start from
	output: [
		{
			file: "dist/bundle.js", // Output path for the CommonJS (cjs) bundle
			format: "cjs", // Output format as CommonJS, typically used for Node.js environments
			sourcemap: true // Generates a sourcemap for easier debugging of the bundled code
		},
		{
			file: "dist/bundle.esm.js", // Output path for the ES module (esm) bundle
			format: "esm", // Output format as ES module, typically used for modern JavaScript bundlers
			sourcemap: true // Generates a sourcemap for this bundle as well
		}
	],
	plugins: [
		resolve(), // Enables resolving modules from `node_modules`, allowing third-party modules to be bundled
		commonjs(), // Converts CommonJS modules (like those in `node_modules`) to ES6 modules for bundling
		postcss({
			inject: true, // Automatically injects styles into the JavaScript bundle
			// extract: true, // Extracts the CSS into a separate file rather than injecting it into the JavaScript
			minimize: true // Minifies the CSS for reduced file size
		}),
		terser() // Minifies the JavaScript output for smaller bundle sizes and improved performance
	]
};
