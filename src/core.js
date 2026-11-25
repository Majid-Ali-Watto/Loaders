// circle-loader core: the Loader and the default "circle" variant.
// Other variants live in variants.js. Import only the ones you use, so bundlers can drop the rest.
import coreCss from "./styles/core.css";

const DEFAULT_TEXT = "Loading...";
const DEFAULT_TEXT_INTERVAL = 2000;

// Built-in overlay backgrounds. Any other string is used as a CSS color.
const BACKGROUNDS = ["dark", "light", "dim", "blur", "transparent"];

// Named speeds, as multipliers of the normal animation speed.
const SPEEDS = { slow: 0.5, normal: 1, fast: 2 };

// ---- Variants ----
// A variant is { name, css, spans?, build? }:
//   css    its styles, added to the page the first time it is shown
//   spans  how many empty <span> children the spinner gets (for dots, spokes...)
//   build  optional function(spinner) that adds other children (arc adds an SVG)

/** The default variant. Its styles are part of the core CSS. */
export const circle = { name: "circle", css: "" };

const registry = new Map([["circle", circle]]);

const isVariant = (value) => !!value && typeof value === "object" && typeof value.name === "string" && value.name !== "";

function register(variant) {
	if (!isVariant(variant)) {
		console.warn('[circle-loader] Loader.register() needs variant objects, e.g. import { dots } from "circle-loader/variants".');
		return;
	}
	registry.set(variant.name, variant);
}

// Style options and the CSS variable each one sets on the overlay.
// Numbers become pixels for the size options.
const STYLE_OPTIONS = {
	color: "--circle-loader-color",
	secondaryColor: "--circle-loader-secondary-color",
	trackColor: "--circle-loader-track",
	textColor: "--circle-loader-text-color",
	size: "--circle-loader-size",
	thickness: "--circle-loader-thickness",
	textSize: "--circle-loader-text-size"
};
const PIXEL_OPTIONS = ["size", "thickness", "textSize"];

// Options setStyle() can change on an open loader.
const SETTABLE = Object.keys(STYLE_OPTIONS).concat(["variant", "speed", "background"]);

const isEmpty = (value) => value === undefined || value === null || value === "";

// Sets one style option's CSS variable, or removes it for an empty value (back to the default).
function setStyleVar(overlay, name, value) {
	if (isEmpty(value)) overlay.style.removeProperty(STYLE_OPTIONS[name]);
	else overlay.style.setProperty(STYLE_OPTIONS[name], typeof value === "number" && PIXEL_OPTIONS.includes(name) ? value + "px" : String(value));
}

function applyStyleOptions(overlay, options) {
	for (const name in STYLE_OPTIONS) {
		if (!isEmpty(options[name])) setStyleVar(overlay, name, options[name]);
	}
}

// Accepts a variant object (registered on first use) or the name of a registered variant.
function resolveVariant(variant) {
	if (variant === undefined || variant === null || variant === "") return circle;
	if (isVariant(variant)) {
		if (registry.get(variant.name) !== variant) register(variant);
		return variant;
	}
	const found = registry.get(variant);
	if (found) return found;
	const hint =
		registry.size === 1
			? ' With "circle-loader/core", import the variant from "circle-loader/variants" and pass it as the variant option or to Loader.register().'
			: "";
	console.warn(`[circle-loader] Unknown variant "${variant}".${hint} Available: ${Array.from(registry.keys()).join(", ")}.`);
	return circle;
}

// ---- CSS ----
// Styles are added on first use, never at import, so importing the package has no side effects.
// They go at the top of <head> (in the order used), so the page's own CSS wins on equal specificity.
let lastStyle = null;

function injectCss(id, css) {
	if (!css) return;
	const existing = document.getElementById(id);
	if (existing) {
		if (existing.textContent !== css) existing.textContent = css; // a re-registered variant
		return;
	}
	const head = document.head || document.documentElement;
	const style = document.createElement("style");
	style.id = id;
	style.textContent = css;
	if (lastStyle && lastStyle.parentNode === head) head.insertBefore(style, lastStyle.nextSibling);
	else head.insertBefore(style, head.firstChild);
	lastStyle = style;
}

function resolveSpeed(speed) {
	if (speed === undefined || speed === null) return 1;
	const factor = typeof speed === "string" && Object.prototype.hasOwnProperty.call(SPEEDS, speed) ? SPEEDS[speed] : Number(speed);
	if (typeof speed !== "boolean" && factor > 0 && Number.isFinite(factor)) return factor;
	console.warn(`[circle-loader] Invalid speed "${speed}". Use "slow", "normal", "fast" or a number above 0.`);
	return 1;
}

function applySpeed(overlay, speedOption) {
	const speed = resolveSpeed(speedOption);
	if (speed === 1) overlay.style.removeProperty("--circle-loader-speed");
	else overlay.style.setProperty("--circle-loader-speed", String(speed));
}

function clearBackground(overlay) {
	BACKGROUNDS.forEach((name) => overlay.classList.remove(`loading-overlay--${name}`));
	overlay.style.removeProperty("background-color");
}

function applyBackground(overlay, background) {
	if (background === undefined || background === null || background === "") return;
	if (typeof background !== "string") return;
	if (BACKGROUNDS.includes(background)) overlay.classList.add(`loading-overlay--${background}`);
	else overlay.style.setProperty("background-color", background);
}

// Reads "rgb(r, g, b)" / "rgba(r, g, b, a)" as the browser reports a computed color.
function parseRgb(color) {
	const match = /^rgba?\(([^)]+)\)$/.exec(String(color).trim());
	if (!match) return null;
	const parts = match[1].split(/[\s,/]+/).filter(Boolean).map(parseFloat);
	if (parts.length < 3 || parts.slice(0, 3).some((n) => !Number.isFinite(n))) return null;
	return { r: parts[0], g: parts[1], b: parts[2], a: Number.isFinite(parts[3]) ? parts[3] : 1 };
}

// WCAG relative luminance, 0 (black) to 1 (white).
function luminance({ r, g, b }) {
	const channel = (v) => {
		v /= 255;
		return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
	};
	return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

// For a custom background color, switch to dark text when the background is light.
// Runs after the overlay is in the page, so the browser has resolved any CSS color format.
function autoTextColor(inst) {
	const { options, el } = inst;
	const styles = options.loadingOverlayStyles || {};
	const customBackground =
		(typeof options.background === "string" && options.background !== "" && !BACKGROUNDS.includes(options.background)) ||
		styles.backgroundColor != null ||
		styles.background != null;
	if (!customBackground || styles["--circle-loader-text-color"] != null || options.textColor != null) return;

	const view = el.ownerDocument.defaultView;
	const color = view && parseRgb(view.getComputedStyle(el).backgroundColor);
	// Mostly see-through backgrounds show the page behind, so their own color can't decide.
	if (!color || color.a < 0.5) return;

	// Above 0.179, black text has more contrast than white text.
	if (luminance(color) > 0.179) {
		el.style.setProperty("--circle-loader-text-color", "#111827");
		inst.autoText = true;
		if (styles["--circle-loader-track"] == null && options.trackColor == null) {
			el.style.setProperty("--circle-loader-track", "rgba(0, 0, 0, 0.12)");
			inst.autoTrack = true;
		}
	}
}

// Undoes autoTextColor(), so it can be worked out again for a new background or text color.
function clearAutoColors(inst) {
	if (inst.autoText) inst.el.style.removeProperty("--circle-loader-text-color");
	if (inst.autoTrack) inst.el.style.removeProperty("--circle-loader-track");
	inst.autoText = inst.autoTrack = false;
}

// Text can be a string, a list of strings shown in rotation, or ""/false/null for no text.
function textList(text) {
	if (text === undefined) return [DEFAULT_TEXT];
	if (text === null || text === false) return [];
	if (Array.isArray(text)) return text.filter((t) => t !== null && t !== undefined && t !== "").map(String);
	text = String(text);
	return text ? [text] : [];
}

function renderText(inst) {
	clearInterval(inst.textTimer);
	inst.textTimer = null;
	const el = inst.textEl;
	if (!el) return;
	const list = textList(inst.text);
	if (!list.length) {
		el.textContent = "";
		el.hidden = true;
		inst.el.setAttribute("aria-label", "Loading");
		return;
	}
	el.hidden = false;
	inst.el.removeAttribute("aria-label");
	let index = 0;
	el.textContent = list[0];
	if (list.length > 1) {
		const interval = Math.max(100, Number(inst.options.textInterval) || DEFAULT_TEXT_INTERVAL);
		inst.textTimer = setInterval(() => {
			index = (index + 1) % list.length;
			el.textContent = list[index];
		}, interval);
	}
}

// ---- Defaults and presets (Loader.configure) ----
// Every start() merges, lowest to highest priority:
//   built-in defaults < configure() defaults < the named preset < the options passed to the call.
let defaults = {};
const presets = new Map();

// The style objects merge key by key, so a call can add one style without dropping the defaults.
const MERGED_STYLES = ["loadingOverlayStyles", "loadingSpinnerStyles", "loadingTextStyles"];

const isPlainObject = (value) => !!value && typeof value === "object" && !Array.isArray(value);

function mergeOptions(layers) {
	const out = {};
	for (const layer of layers) {
		if (!layer) continue;
		for (const key in layer) {
			const value = layer[key];
			if (value === undefined) continue; // undefined means "not set"; null means "use the built-in default"
			out[key] = MERGED_STYLES.includes(key) && isPlainObject(value) && isPlainObject(out[key]) ? Object.assign({}, out[key], value) : value;
		}
	}
	return out;
}

function findPreset(name, quiet) {
	if (name === undefined || name === null || name === "") return null;
	if (presets.has(name)) return presets.get(name);
	if (!quiet) {
		const known = Array.from(presets.keys());
		console.warn(`[circle-loader] Unknown preset "${name}". ${known.length ? "Presets: " + known.join(", ") + "." : "Add presets with Loader.configure({ presets: { ... } })."}`);
	}
	return null;
}

// The options a call actually uses: defaults, then its preset, then the call's own options.
function resolveOptions(options, quiet) {
	const merged = mergeOptions([defaults, findPreset(options.preset, quiet), options]);
	delete merged.preset;
	return merged;
}

function configurePresets(value) {
	if (value === null) return presets.clear();
	if (!isPlainObject(value)) {
		console.warn("[circle-loader] presets must be an object of named options, e.g. { save: { variant: \"dots\" } }.");
		return;
	}
	for (const name in value) {
		const preset = value[name];
		if (preset === null) presets.delete(name);
		else if (isPlainObject(preset)) {
			const copy = Object.assign({}, preset);
			delete copy.preset; // presets can't point at other presets
			presets.set(name, copy);
		} else console.warn(`[circle-loader] Preset "${name}" must be an options object, or null to remove it.`);
	}
}

// One loader instance per target. The fullscreen loader uses the key `null`.
const instances = new Map();

const hasDOM = () => typeof document !== "undefined";

// Accepts the original call style: up to two args, a text string and an
// options/styles object, in any order. The first of each type wins.
// `text` is undefined when no text was given (the default text is used then).
function parseArgs(args) {
	let text;
	let options;
	for (const arg of args.slice(0, 2)) {
		if (typeof arg === "string" && text === undefined) text = arg;
		else if (arg && typeof arg === "object" && !Array.isArray(arg) && options === undefined) options = arg;
	}
	options = options || {};
	if (text === undefined && options.text !== undefined) text = options.text;
	return { text, options };
}

// Returns an Element, `null` for fullscreen, or `undefined` if a selector matched nothing.
function resolveTarget(target) {
	// An options object: its own target, or its preset's target.
	if (target && typeof target === "object" && !target.nodeType) target = resolveOptions(target, true).target;
	if (!target) return null;
	if (typeof target === "string") {
		const el = document.querySelector(target);
		if (!el) console.warn(`[circle-loader] No element matches "${target}".`);
		return el || undefined;
	}
	return target.nodeType === 1 ? target : undefined;
}

function applyStyles(el, styles) {
	if (!styles || typeof styles !== "object") return;
	for (const prop in styles) {
		const value = styles[prop];
		if (value === null || value === undefined) continue;
		const name = prop.startsWith("--") ? prop : prop.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
		el.style.setProperty(name, String(value), "important");
	}
}

function createSpinner(options) {
	const spinner = document.createElement("div");
	const variant = resolveVariant(options.variant);
	injectCss(`circle-loader-variant-${variant.name}`, variant.css);
	spinner.className = `loading-spinner loading-spinner--${variant.name}`;
	spinner.setAttribute("aria-hidden", "true");
	for (let i = 0; i < (variant.spans || 0); i++) spinner.appendChild(document.createElement("span"));
	if (typeof variant.build === "function") variant.build(spinner);
	applyStyles(spinner, options.loadingSpinnerStyles);
	return spinner;
}

// Applies setStyle() changes to a loader that is on the page.
function restyle(inst, changes) {
	const { el, options } = inst;
	if ("variant" in changes) {
		const spinner = createSpinner(options);
		inst.spinnerEl.replaceWith(spinner);
		inst.spinnerEl = spinner;
	}
	if ("speed" in changes) applySpeed(el, options.speed);
	if ("background" in changes) {
		clearBackground(el);
		applyBackground(el, options.background);
	}
	const colorsChanged = "background" in changes || "textColor" in changes || "trackColor" in changes;
	if (colorsChanged) clearAutoColors(inst);
	for (const name in STYLE_OPTIONS) {
		if (name in changes) setStyleVar(el, name, options[name]);
	}
	if (colorsChanged) autoTextColor(inst);
}

function show(inst) {
	inst.showTimer = null;
	injectCss("circle-loader-core", coreCss);
	const { options, target } = inst;

	const overlay = document.createElement("div");
	overlay.className = target ? "loading-overlay loading-overlay--scoped" : "loading-overlay";
	overlay.setAttribute("role", "status");
	overlay.setAttribute("aria-live", "polite");
	applyBackground(overlay, options.background);
	applySpeed(overlay, options.speed);
	applyStyleOptions(overlay, options);

	const spinner = createSpinner(options);

	const textEl = document.createElement("p");
	textEl.className = "loading-text";

	applyStyles(overlay, options.loadingOverlayStyles);
	applyStyles(textEl, options.loadingTextStyles);

	overlay.append(spinner, textEl);

	if (target) {
		const view = target.ownerDocument.defaultView;
		const position = view ? view.getComputedStyle(target).position : "";
		if (!position || position === "static") {
			inst.restorePosition = target.style.position;
			target.style.position = "relative";
		}
		target.setAttribute("aria-busy", "true");
	}

	(target || document.body).appendChild(overlay);
	inst.el = overlay;
	inst.spinnerEl = spinner;
	inst.textEl = textEl;
	inst.shownAt = Date.now();
	autoTextColor(inst);
	renderText(inst);
}

function destroy(inst) {
	clearTimeout(inst.showTimer);
	clearTimeout(inst.hideTimer);
	clearInterval(inst.textTimer);
	if (inst.el) inst.el.remove();
	if (inst.target) {
		if (inst.restorePosition !== undefined) inst.target.style.position = inst.restorePosition;
		inst.target.removeAttribute("aria-busy");
	}
	if (instances.get(inst.key) === inst) instances.delete(inst.key);
}

function hide(inst) {
	if (!inst.el) return destroy(inst); // still waiting out `delay`: never shown
	const remaining = (Number(inst.options.minDuration) || 0) - (Date.now() - inst.shownAt);
	if (remaining > 0) inst.hideTimer = setTimeout(() => destroy(inst), remaining);
	else destroy(inst);
}

class Loader {
	/**
	 * Show the loader. Accepts a text string and/or an options object, in any order.
	 * Calls are counted: each start() needs a matching close().
	 */
	static start(...args) {
		if (!hasDOM()) return;
		const parsed = parseArgs(args);
		const options = resolveOptions(parsed.options);
		const text = parsed.text !== undefined ? parsed.text : options.text; // text from configure() or a preset
		const target = resolveTarget(options.target);
		if (target === undefined) return;

		const existing = instances.get(target);
		if (existing) {
			existing.count++;
			clearTimeout(existing.hideTimer);
			existing.hideTimer = null;
			if (text !== undefined) Loader.update(text, target);
			return;
		}

		const inst = {
			key: target,
			target,
			options,
			count: 1,
			text,
			el: null,
			spinnerEl: null,
			textEl: null,
			autoText: false,
			autoTrack: false,
			textTimer: null,
			showTimer: null,
			hideTimer: null,
			shownAt: 0,
			restorePosition: undefined
		};
		instances.set(target, inst);

		const delay = Math.max(0, Number(options.delay) || 0);
		if (delay > 0) inst.showTimer = setTimeout(() => show(inst), delay);
		else show(inst);
	}

	/** Close one start() call. The loader hides once every start() has been closed. */
	static close(target) {
		if (!hasDOM()) return;
		const inst = instances.get(resolveTarget(target));
		if (!inst || inst.count === 0) return;
		inst.count--;
		if (inst.count === 0) hide(inst);
	}

	/** Remove the loader immediately, ignoring the call count and minDuration. With no target, removes every loader. */
	static forceClose(target) {
		if (!hasDOM()) return;
		if (target === undefined) {
			Array.from(instances.values()).forEach(destroy);
			return;
		}
		const inst = instances.get(resolveTarget(target));
		if (inst) destroy(inst);
	}

	/** Change the text of a loader that is already started: a string, a list to rotate, or ""/false/null for none. */
	static update(text, target) {
		if (!hasDOM()) return;
		const inst = instances.get(resolveTarget(target));
		if (!inst) return;
		inst.text = text; // undefined brings back the default text
		renderText(inst);
	}

	/**
	 * Change the look of a loader that is already started: variant, colors, size, thickness, speed, background.
	 * Takes the same options as start(). null or "" resets an option to its default.
	 */
	static setStyle(style, target) {
		if (!hasDOM() || !style || typeof style !== "object") return;
		const inst = instances.get(resolveTarget(target));
		if (!inst) return;
		// A preset brings its style options; options passed next to it win.
		if (style.preset !== undefined) {
			const preset = findPreset(style.preset) || {};
			const fromPreset = {};
			for (const name in preset) if (SETTABLE.includes(name)) fromPreset[name] = preset[name];
			style = Object.assign(fromPreset, style);
			delete style.preset;
		}
		const changes = {};
		for (const name in style) {
			if (SETTABLE.includes(name)) changes[name] = style[name];
			else console.warn(`[circle-loader] setStyle() can't change "${name}". It can change: ${SETTABLE.join(", ")}.`);
		}
		// A copy, so the caller's options object is never changed.
		inst.options = Object.assign({}, inst.options, changes);
		if (inst.el) restyle(inst, changes); // not shown yet (delay): show() uses the new options
	}

	/**
	 * Set defaults once, used by every start() and wrap() afterwards. A call's own options still win.
	 *   Loader.configure({ variant: "arc", background: "blur", delay: 200 })
	 *   Loader.configure({ presets: { save: { variant: "dots", text: "Saving..." } } })  then  start({ preset: "save" })
	 * Calls merge into what is there. null removes one default (or one preset); configure(null) removes all.
	 */
	static configure(config) {
		if (config === null) {
			defaults = {};
			presets.clear();
			return;
		}
		if (!isPlainObject(config)) {
			console.warn("[circle-loader] Loader.configure() needs an options object, or null to clear everything.");
			return;
		}
		const next = Object.assign({}, defaults);
		for (const key in config) {
			const value = config[key];
			if (key === "presets") configurePresets(value);
			else if (key === "target" || key === "preset") {
				console.warn(`[circle-loader] "${key}" can't be a default. Pass it to start(), or put a target inside a preset.`);
			} else if (value === null) delete next[key];
			else if (value !== undefined) next[key] = value;
		}
		defaults = next;
	}

	/** The current defaults and presets (copies, so changing them has no effect). */
	static getConfig() {
		const copy = (o) => Object.assign({}, o);
		const presetCopies = {};
		presets.forEach((value, name) => (presetCopies[name] = copy(value)));
		return Object.assign(copy(defaults), { presets: presetCopies });
	}

	/**
	 * Add variants, so they can be used by name: Loader.register(dots, ring).
	 * Not needed with the main "circle-loader" import, which registers every built-in variant.
	 */
	static register(...variants) {
		variants.forEach(register);
	}

	/** Names of the variants that can be used by name. */
	static get variants() {
		return Object.freeze(Array.from(registry.keys()));
	}

	/** True from start() until the loader is closed (including while waiting out `delay`). */
	static isActive(target) {
		if (!hasDOM()) return false;
		const inst = instances.get(resolveTarget(target));
		return !!inst && inst.count > 0;
	}

	/** Show the loader while a promise (or async function) runs, then close it even if it throws. */
	static async wrap(task, ...args) {
		const { options } = parseArgs(args);
		Loader.start(...args);
		try {
			return await (typeof task === "function" ? task() : task);
		} finally {
			Loader.close(options); // the same target as start(), including one from a preset
		}
	}
}

/** Names of the built-in overlay backgrounds. */
Loader.backgrounds = Object.freeze(BACKGROUNDS.slice());

/** Named speeds and their multipliers. */
Loader.speeds = Object.freeze(Object.assign({}, SPEEDS));

export { Loader };
