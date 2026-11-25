// "circle-loader/element": a <circle-loader> custom element, for using the loader declaratively
// in any framework (React, Vue, Angular, Svelte) or plain HTML. Every built-in variant is registered.
//
//   <div class="card">
//     <circle-loader active variant="dots" text="Saving..."></circle-loader>
//   </div>
//
// While `active`, the loader covers the element's parent (or the whole screen with `fullscreen`).
// Removing `active` or removing the element closes it. Importing this file defines the element.
import { Loader } from "./index.js";

// Attribute -> option. Changing one of these on an open loader updates it in place.
const STYLE_ATTRIBUTES = {
	variant: "variant",
	background: "background",
	speed: "speed",
	color: "color",
	"secondary-color": "secondaryColor",
	"track-color": "trackColor",
	"text-color": "textColor",
	size: "size",
	thickness: "thickness",
	"text-size": "textSize",
	"z-index": "zIndex",
	progress: "progress"
};

// Attributes read when the loader opens.
const START_ATTRIBUTES = {
	preset: "preset",
	"text-interval": "textInterval",
	delay: "delay",
	"min-duration": "minDuration",
	nonce: "nonce"
};

const NUMBER = /^-?\d+(\.\d+)?$/;

// Present and not "false" (frameworks often write booleans as "true"/"false").
const isOn = (el, name) => el.hasAttribute(name) && el.getAttribute(name) !== "false";

// "60" -> 60, so size, thickness and textSize get pixels like numbers passed to start().
const readValue = (value) => (value !== null && NUMBER.test(value) ? Number(value) : value);

function readOptions(el, map) {
	const options = {};
	for (const attr in map) {
		if (el.hasAttribute(attr)) options[map[attr]] = readValue(el.getAttribute(attr));
	}
	return options;
}

function createElementClass(Base) {
	return class CircleLoaderElement extends Base {
		static get observedAttributes() {
			return ["active", "fullscreen", "text", "block-input"].concat(Object.keys(STYLE_ATTRIBUTES));
		}

		/** True while the loader is shown. Same as the `active` attribute. */
		get active() {
			return isOn(this, "active");
		}

		set active(value) {
			this.toggleAttribute("active", !!value);
		}

		connectedCallback() {
			// The element itself takes no space; the loader is drawn over its parent.
			if (!this.style.display) this.style.display = "none";
			this._sync();
		}

		disconnectedCallback() {
			this._close();
		}

		attributeChangedCallback(name, oldValue, newValue) {
			if (oldValue === newValue || !this.isConnected) return;
			if (name === "active" || name === "fullscreen" || name === "block-input" || !this._open) return this._sync(name === "fullscreen" || name === "block-input");
			if (name === "text") return Loader.update(this._text(), this._target);
			Loader.setStyle({ [STYLE_ATTRIBUTES[name]]: newValue === null ? null : readValue(newValue) }, this._target);
		}

		_text() {
			return this.hasAttribute("text") ? this.getAttribute("text") : undefined;
		}

		// Opens or closes to match `active`. `reopen` restarts an open loader (its target changed).
		_sync(reopen) {
			const on = this.isConnected && this.active;
			if (this._open && (!on || reopen)) this._close();
			if (!on || this._open) return;
			const target = isOn(this, "fullscreen") ? null : this.parentElement;
			const options = Object.assign(readOptions(this, START_ATTRIBUTES), readOptions(this, STYLE_ATTRIBUTES));
			options.target = target;
			if (this.hasAttribute("block-input")) options.blockInput = isOn(this, "block-input");
			const text = this._text();
			if (text !== undefined) options.text = text;
			this._target = target;
			this._open = true;
			Loader.start(options);
		}

		_close() {
			if (!this._open) return;
			this._open = false;
			Loader.close(this._target);
			this._target = null;
		}
	};
}

/**
 * Define the custom element. Runs on import with the name "circle-loader".
 * Call it yourself to use another name. Does nothing without a browser, or if the name is taken.
 */
export function defineElement(name = "circle-loader") {
	if (typeof window === "undefined" || !window.HTMLElement || !window.customElements) return;
	if (window.customElements.get(name)) return;
	window.customElements.define(name, createElementClass(window.HTMLElement));
}

defineElement();

export { Loader };
