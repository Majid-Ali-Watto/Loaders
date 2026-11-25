// The <circle-loader> custom element ("circle-loader/element"), in jsdom.
const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const { JSDOM } = require("jsdom");

// Without a DOM, importing defines nothing and doesn't throw (SSR).
assert.doesNotThrow(() => require("../dist/element.js"));
for (const key of Object.keys(require.cache)) if (key.includes("/dist/")) delete require.cache[key];

const dom = new JSDOM("<!doctype html><html><head></head><body><div id='card'></div></body></html>");
global.window = dom.window;
global.document = dom.window.document;

const { Loader, defineElement } = require("../dist/element.js");
const card = document.getElementById("card");
const overlay = () => document.querySelector(".loading-overlay");

beforeEach(() => {
	card.innerHTML = "";
	Loader.forceClose();
});

test("the element is defined on import, and again under another name", () => {
	assert.ok(window.customElements.get("circle-loader"));
	defineElement("my-loader");
	assert.ok(window.customElements.get("my-loader"));
	assert.doesNotThrow(() => defineElement()); // already defined: no error
});

test("active shows the loader over the parent; removing it closes", () => {
	card.innerHTML = '<circle-loader active text="Saving" variant="dots" size="60"></circle-loader>';
	const el = card.firstElementChild;
	assert.equal(el.style.display, "none");
	assert.equal(overlay().parentElement, card);
	assert.equal(document.querySelector(".loading-text").textContent, "Saving");
	assert.ok(document.querySelector(".loading-spinner--dots"));
	assert.equal(overlay().style.getPropertyValue("--circle-loader-size"), "60px");
	el.removeAttribute("active");
	assert.equal(overlay(), null);
	el.active = true;
	assert.ok(overlay());
	el.remove();
	assert.equal(overlay(), null);
});

test('active="false" counts as off, and attributes update an open loader', () => {
	card.innerHTML = '<circle-loader active="false"></circle-loader>';
	const el = card.firstElementChild;
	assert.equal(overlay(), null);
	el.setAttribute("active", "true");
	assert.ok(overlay());
	el.setAttribute("text", "Almost");
	assert.equal(document.querySelector(".loading-text").textContent, "Almost");
	el.setAttribute("color", "red");
	assert.equal(overlay().style.getPropertyValue("--circle-loader-color"), "red");
	el.setAttribute("progress", "30");
	assert.equal(document.querySelector(".loading-progress").textContent, "30%");
	el.removeAttribute("progress");
	assert.equal(document.querySelector(".loading-progress"), null);
});

test("fullscreen covers the page, and toggling it moves the loader", () => {
	card.innerHTML = "<circle-loader active fullscreen></circle-loader>";
	assert.equal(overlay().parentElement, document.body);
	card.firstElementChild.removeAttribute("fullscreen");
	assert.equal(document.querySelectorAll(".loading-overlay").length, 1);
	assert.equal(overlay().parentElement, card);
});
