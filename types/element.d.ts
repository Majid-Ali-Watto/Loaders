// Types for "circle-loader/element": the <circle-loader> custom element, with every built-in variant registered.
// Importing it defines the element. Attributes: active, fullscreen, text, variant, background, speed, color,
// secondary-color, track-color, text-color, size, thickness, text-size, z-index, progress, block-input,
// preset, text-interval, delay, min-duration, nonce.
export { Loader } from "./core.js";
export type {
	LoaderBackground,
	LoaderConfig,
	LoaderDefaults,
	LoaderOptions,
	LoaderSpeed,
	LoaderStyleOptions,
	LoaderStyles,
	LoaderTarget,
	LoaderText,
	LoaderVariant,
	LoaderVariantDefinition
} from "./core.js";

/** Define the element under another name. Runs on import as "circle-loader". Does nothing without a browser or if the name is taken. */
export declare function defineElement(name?: string): void;

/** The <circle-loader> element. */
export interface CircleLoaderElement extends HTMLElement {
	/** True while the loader is shown. Same as the `active` attribute. */
	active: boolean;
}

declare global {
	interface HTMLElementTagNameMap {
		"circle-loader": CircleLoaderElement;
	}
}
