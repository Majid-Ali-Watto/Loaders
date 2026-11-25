// Types for "circle-loader/core".
/** CSS properties in camelCase (e.g. `backgroundColor`) or custom properties (`--my-var`). */
export type LoaderStyles = { [property: string]: string | number | null | undefined };

/** An element, or a CSS selector for one. */
export type LoaderTarget = Element | string;

/** Spinner style. */
export type LoaderVariant =
	| "circle"
	| "ring"
	| "dual"
	| "dots"
	| "pulse"
	| "orbit"
	| "ripple"
	| "comet"
	| "bounce"
	| "spokes"
	| "arc"
	| "flip"
	| "clock"
	| "gyro"
	| "fill"
	| "moon"
	| "chase"
	| "glow"
	| "radar"
	| "dashed"
	| "halves"
	| "rings"
	| "planets"
	| "squish"
	| "eclipse"
	| "segments"
	| "flower"
	| "target"
	| "pendulum"
	| "donut"
	| "wave"
	| "heartbeat"
	| "yinyang"
	| "atom"
	| "quarters"
	| "globe"
	| "swap"
	| "ball"
	| "wheel"
	| "fan"
	| "breathe"
	| "gear"
	| "split"
	| "stripes"
	| "water"
	| "tunnel"
	| "typing"
	| "eye"
	| "sun"
	| "fizz";

/**
 * A variant object, as exported by "circle-loader/variants", or your own.
 * Pass it as the `variant` option or to Loader.register().
 */
export interface LoaderVariantDefinition {
	/** Name used in the class `loading-spinner--<name>` and with `variant: "<name>"` once registered. */
	readonly name: string;
	/** The variant's CSS, added to the page the first time it is shown. */
	readonly css: string;
	/** Number of empty <span> children the spinner gets. */
	readonly spans?: number;
	/** Adds other children to the spinner element. */
	readonly build?: (spinner: HTMLElement) => void;
}

/** Built-in overlay background. */
export type LoaderBackground = "dark" | "light" | "dim" | "blur" | "transparent";

/** Named speed, or a multiplier (2 = twice as fast, 0.5 = half speed). */
export type LoaderSpeed = "slow" | "normal" | "fast" | number;

/** One message, several messages shown in rotation, or ""/false/null for no text. */
export type LoaderText = string | string[] | false | null;

export interface LoaderOptions {
	/**
	 * Spinner style: a variant object (from "circle-loader/variants" or your own) or the name of a registered variant.
	 * With the main "circle-loader" import every built-in name works. Defaults to "circle".
	 */
	variant?: LoaderVariant | LoaderVariantDefinition | (string & {});
	/** Text under the spinner. A list rotates every `textInterval` ms. ""/false/null shows no text. Defaults to "Loading...". */
	text?: LoaderText;
	/** Milliseconds between messages when `text` is a list. Defaults to 2000. */
	textInterval?: number;
	/** Overlay background: a built-in name or any CSS color. Defaults to "dark". */
	background?: LoaderBackground | (string & {});
	/** Animation speed: "slow", "normal", "fast", or a multiplier. Defaults to "normal". */
	speed?: LoaderSpeed;
	/** Main spinner color (any CSS color). Defaults to blue; "circle" keeps its red and blue sides unless set. */
	color?: string;
	/** Second color for two-part variants (circle, dual, ripple, bounce, clock and others; see the README). Defaults to `color`. */
	secondaryColor?: string;
	/** Color of the faint ring behind ring, orbit, moon and others (see the README). */
	trackColor?: string;
	/** Text color. Set it to turn off the automatic text color. */
	textColor?: string;
	/** Spinner width and height. A number means pixels. Defaults to 50. */
	size?: number | string;
	/** Line width of ring-style variants. A number means pixels. The default depends on the variant. */
	thickness?: number | string;
	/** Font size of the text. A number means pixels. Defaults to 18. */
	textSize?: number | string;
	/** Stacking order of the overlay. Defaults to 1000 (fullscreen) or 10 (inside a target). */
	zIndex?: number | string;
	/** Progress from 0 to 100, shown as a bar and a percentage under the text. null hides it. */
	progress?: number | null;
	/**
	 * Make the content behind the overlay `inert` while it is shown, so keyboard focus and screen readers
	 * can't reach it. Focus goes back where it was afterwards. Defaults to true.
	 */
	blockInput?: boolean;
	/** Nonce for the <style> tags the package adds, for a Content-Security-Policy. Defaults to the nonce of a <script> or <style> on the page. */
	nonce?: string;
	/** Show the loader inside this element instead of covering the whole screen. */
	target?: LoaderTarget;
	/** Use a preset added with Loader.configure({ presets }). Options passed next to it win. */
	preset?: string;
	/** Wait this many milliseconds before showing. If closed sooner, the loader never appears. */
	delay?: number;
	/** Once shown, keep the loader visible for at least this many milliseconds. */
	minDuration?: number;
	/** Styles for the overlay that covers the screen (or target). */
	loadingOverlayStyles?: LoaderStyles;
	/** Styles for the spinner element. */
	loadingSpinnerStyles?: LoaderStyles;
	/** Styles for the loading text. */
	loadingTextStyles?: LoaderStyles;
}

/** Options setStyle() can change. null or "" resets an option to its default. A preset applies its style options. */
export type LoaderStyleOptions = {
	[K in "variant" | "color" | "secondaryColor" | "trackColor" | "textColor" | "size" | "thickness" | "textSize" | "zIndex" | "progress" | "speed" | "background"]?:
		| LoaderOptions[K]
		| null;
} & { preset?: string };

/** Defaults for every start(): any option except target and preset. null removes a default. */
export type LoaderDefaults = {
	[K in Exclude<keyof LoaderOptions, "target" | "preset">]?: LoaderOptions[K] | null;
};

/** What Loader.configure() takes. Calls merge into the current config. */
export interface LoaderConfig extends LoaderDefaults {
	/** Named options to use with start({ preset: "name" }). A preset set to null is removed; presets: null removes all. */
	presets?: { [name: string]: Omit<LoaderOptions, "preset"> | null } | null;
}

/** The default variant. Its styles are part of the core. */
export declare const circle: LoaderVariantDefinition;

export declare class Loader {
	/** Names of the variants that can be used by name. */
	static readonly variants: readonly string[];
	/** Names of the built-in overlay backgrounds. */
	static readonly backgrounds: readonly LoaderBackground[];
	/** Named speeds and their multipliers. */
	static readonly speeds: Readonly<{ slow: number; normal: number; fast: number }>;

	/** Show the loader. Each start() needs a matching close(). */
	static start(): void;
	static start(text: string, options?: LoaderOptions): void;
	static start(options: LoaderOptions, text?: string): void;

	/** Close one start() call. Pass the same target (or options object) used in start(). */
	static close(target?: LoaderTarget | LoaderOptions): void;

	/** Remove the loader immediately, ignoring the call count and minDuration. No target removes every loader. */
	static forceClose(target?: LoaderTarget | LoaderOptions): void;

	/** Show progress (0 to 100) as a bar and a percentage on a loader that is already started. null hides it. */
	static progress(value: number | null, target?: LoaderTarget | LoaderOptions): void;

	/** Change the text of a loader that is already started. No text brings back the default. */
	static update(text?: LoaderText, target?: LoaderTarget | LoaderOptions): void;

	/**
	 * Change the look of a loader that is already started, without closing it.
	 * Pass the same target used in start(), or nothing for the fullscreen loader.
	 */
	static setStyle(style: LoaderStyleOptions, target?: LoaderTarget | LoaderOptions): void;

	/**
	 * Set defaults once, used by every later start() and wrap(). A call's own options still win.
	 * Calls merge into the current config. null removes one default or preset; configure(null) removes everything.
	 */
	static configure(config: LoaderConfig | null): void;

	/** The current defaults and presets, as copies. */
	static getConfig(): LoaderDefaults & { presets: { [name: string]: Omit<LoaderOptions, "preset"> } };

	/** Add variants so they can be used by name. Not needed with the main "circle-loader" import. */
	static register(...variants: LoaderVariantDefinition[]): void;

	/** True from start() until the loader is closed, including while waiting out `delay`. */
	static isActive(target?: LoaderTarget | LoaderOptions): boolean;

	/** Show the loader while the promise or async function runs, then close it, even if it throws. */
	static wrap<T>(task: Promise<T> | (() => T | Promise<T>), text?: string, options?: LoaderOptions): Promise<T>;
	static wrap<T>(task: Promise<T> | (() => T | Promise<T>), options?: LoaderOptions, text?: string): Promise<T>;
}
