// "circle-loader/core" with variants imported one by one, in its own process (a fresh registry).
const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const { JSDOM } = require("jsdom");

const dom = new JSDOM("<!doctype html><html><head></head><body></body></html>");
global.window = dom.window;
global.document = dom.window.document;

const { Loader } = require("../dist/core.js");
const variants = require("../dist/variants.js");

const spinner = () => document.querySelector(".loading-spinner");
const quiet = (fn) => {
	const warn = console.warn;
	const warnings = [];
	console.warn = (m) => warnings.push(m);
	try {
		fn();
	} finally {
		console.warn = warn;
	}
	return warnings;
};

beforeEach(() => Loader.forceClose());

test("core knows only circle until variants are added", () => {
	assert.deepEqual([...Loader.variants], ["circle"]);
	Loader.start();
	assert.ok(spinner().classList.contains("loading-spinner--circle"));
});

test("an unknown name warns with a hint and falls back to circle", () => {
	const warnings = quiet(() => Loader.start({ variant: "dots" }));
	assert.ok(spinner().classList.contains("loading-spinner--circle"));
	assert.match(warnings[0], /circle-loader\/variants/);
});

test("a variant object works directly, adds its CSS, and becomes usable by name", () => {
	Loader.start({ variant: variants.dots });
	assert.ok(spinner().classList.contains("loading-spinner--dots"));
	assert.equal(spinner().children.length, 8);
	assert.ok(document.getElementById("circle-loader-variant-dots"));
	Loader.forceClose();
	Loader.start({ variant: "dots" });
	assert.ok(spinner().classList.contains("loading-spinner--dots"));
});

test("only the CSS of variants actually shown is added", () => {
	assert.equal(document.getElementById("circle-loader-variant-ring"), null);
	assert.equal(document.getElementById("circle-loader-variant-gyro"), null);
});

test("register() makes variants usable by name", () => {
	Loader.register(variants.ring, variants.arc);
	Loader.start({ variant: "arc" });
	assert.ok(document.querySelector(".loading-spinner--arc svg circle"));
	assert.ok(Loader.variants.includes("ring"));
});

test("register() warns about things that are not variants", () => {
	const warnings = quiet(() => Loader.register("dots", null, {}));
	assert.equal(warnings.length, 3);
});

test("setStyle can switch to a variant object", () => {
	Loader.start();
	Loader.setStyle({ variant: variants.planets });
	assert.equal(spinner().children.length, 3);
	assert.ok(document.getElementById("circle-loader-variant-planets"));
});

test("custom variants: your own name, CSS, spans and build", () => {
	const heart = {
		name: "my-heart",
		css: ".loading-spinner--my-heart { animation: none; }",
		spans: 2,
		build: (el) => el.setAttribute("data-built", "yes")
	};
	Loader.start({ variant: heart });
	assert.ok(spinner().classList.contains("loading-spinner--my-heart"));
	assert.equal(spinner().children.length, 2);
	assert.equal(spinner().getAttribute("data-built"), "yes");
	assert.equal(document.getElementById("circle-loader-variant-my-heart").textContent, heart.css);
});

test("allVariants lists every built-in variant", () => {
	assert.equal(variants.allVariants.length, 50);
	assert.equal(variants.allVariants[0], variants.circle);
});
