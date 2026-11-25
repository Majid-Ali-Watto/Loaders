// circle-loader: the Loader with every built-in variant ready to use by name.
// For smaller bundles, import from "circle-loader/core" and "circle-loader/variants" instead.
import { Loader } from "./core.js";
import { allVariants } from "./variants.js";

Loader.register(...allVariants);

export { Loader };
