// Loader.configure(): defaults and presets. In its own process, since the config is global.
const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const { JSDOM } = require("jsdom");

const dom = new JSDOM("<!doctype html><html><head></head><body><div id='table'></div></body></html>");
global.window = dom.window;
global.document = dom.window.document;

const { Loader } = require("../dist/bundle.js");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const overlay = (sel = "body > .loading-overlay") => document.querySelector(sel);
const cssVar = (name, el = overlay()) => el.style.getPropertyValue(name);
const spinnerIs = (variant, el = overlay()) => el.querySelector(".loading-spinner").classList.contains(`loading-spinner--${variant}`);
const text = (el = overlay()) => el.querySelector(".loading-text").textContent;
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

beforeEach(() => {
	Loader.forceClose();
	Loader.configure(null);
});

test("defaults apply to every start() without passing anything", () => {
	Loader.configure({ variant: "arc", background: "light", color: "#10b981", size: 64, text: "Please wait" });
	Loader.start();
	assert.ok(spinnerIs("arc"));
	assert.ok(overlay().classList.contains("loading-overlay--light"));
	assert.equal(cssVar("--circle-loader-color"), "#10b981");
	assert.equal(cssVar("--circle-loader-size"), "64px");
	assert.equal(text(), "Please wait");
});

test("a call's own options win over the defaults, one option at a time", () => {
	Loader.configure({ variant: "arc", color: "#10b981", text: "Please wait" });
	Loader.start("Saving", { variant: "dots" });
	assert.ok(spinnerIs("dots"));
	assert.equal(cssVar("--circle-loader-color"), "#10b981"); // still from the defaults
	assert.equal(text(), "Saving");
});

test("null in a call turns a default off for that call", () => {
	Loader.configure({ color: "#10b981" });
	Loader.start({ color: null });
	assert.equal(cssVar("--circle-loader-color"), "");
});

test("configure() merges, null removes one default, configure(null) clears all", () => {
	Loader.configure({ variant: "arc", color: "red" });
	Loader.configure({ color: "blue" });
	assert.deepEqual(Loader.getConfig(), { variant: "arc", color: "blue", presets: {} });
	Loader.configure({ variant: null });
	assert.deepEqual(Loader.getConfig(), { color: "blue", presets: {} });
	Loader.configure({ presets: { a: { variant: "dots" } } });
	Loader.configure(null);
	assert.deepEqual(Loader.getConfig(), { presets: {} });
});

test("defaults are used for timing too: delay and minDuration", async () => {
	Loader.configure({ delay: 40 });
	Loader.start();
	assert.equal(overlay(), null);
	Loader.close();
	await sleep(60);
	assert.equal(overlay(), null); // closed before the delay: never shown
});

test("presets: named looks used with { preset }", () => {
	Loader.configure({
		color: "#111111",
		presets: {
			save: { variant: "dots", text: "Saving...", color: "#f43f5e" },
			page: { variant: "ring", background: "blur" }
		}
	});
	Loader.start({ preset: "save" });
	assert.ok(spinnerIs("dots"));
	assert.equal(text(), "Saving...");
	assert.equal(cssVar("--circle-loader-color"), "#f43f5e"); // preset beats defaults
	Loader.forceClose();
	Loader.start({ preset: "page" });
	assert.ok(spinnerIs("ring"));
	assert.equal(cssVar("--circle-loader-color"), "#111111"); // defaults fill in what the preset doesn't set
	Loader.forceClose();
	Loader.start("Almost done", { preset: "save", color: "green" }); // the call beats the preset
	assert.equal(text(), "Almost done");
	assert.equal(cssVar("--circle-loader-color"), "green");
});

test("a preset with a target: start, close and wrap find the same element", async () => {
	Loader.configure({ presets: { table: { target: "#table", variant: "spokes", text: false } } });
	Loader.start({ preset: "table" });
	assert.ok(overlay("#table .loading-overlay"));
	Loader.close({ preset: "table" });
	assert.equal(overlay("#table .loading-overlay"), null);

	await Loader.wrap(
		sleep(10).then(() => assert.ok(overlay("#table .loading-overlay"))),
		{ preset: "table" }
	);
	assert.equal(overlay("#table .loading-overlay"), null);
});

test("presets merge, and null removes one", () => {
	Loader.configure({ presets: { a: { variant: "dots" }, b: { variant: "ring" } } });
	Loader.configure({ presets: { b: null, c: { variant: "arc" } } });
	assert.deepEqual(Object.keys(Loader.getConfig().presets), ["a", "c"]);
});

test("an unknown preset warns and uses the defaults", () => {
	Loader.configure({ variant: "arc" });
	const warnings = quiet(() => Loader.start({ preset: "nope" }));
	assert.ok(spinnerIs("arc"));
	assert.match(warnings[0], /Unknown preset "nope"/);
});

test("target and preset can't be defaults", () => {
	const warnings = quiet(() => Loader.configure({ target: "#table", preset: "x", color: "red" }));
	assert.equal(warnings.length, 2);
	assert.deepEqual(Loader.getConfig(), { color: "red", presets: {} });
});

test("style objects merge key by key with the defaults", () => {
	Loader.configure({ loadingTextStyles: { color: "red", fontWeight: "bold" } });
	Loader.start({ loadingTextStyles: { color: "blue" } });
	const p = overlay().querySelector(".loading-text");
	assert.equal(p.style.color, "blue");
	assert.equal(p.style.fontWeight, "bold");
});

test("setStyle can switch an open loader to a preset", () => {
	Loader.configure({ presets: { alert: { variant: "pulse", color: "red", text: "ignored by setStyle" } } });
	Loader.start("Working");
	Loader.setStyle({ preset: "alert", speed: "fast" });
	assert.ok(spinnerIs("pulse"));
	assert.equal(cssVar("--circle-loader-color"), "red");
	assert.equal(cssVar("--circle-loader-speed"), "2");
	assert.equal(text(), "Working"); // text is not a style option
});

test("configure() changes later loaders, not the one already open", () => {
	Loader.start();
	Loader.configure({ color: "red" });
	assert.equal(cssVar("--circle-loader-color"), "");
	Loader.forceClose();
	Loader.start();
	assert.equal(cssVar("--circle-loader-color"), "red");
});

test("getConfig() returns copies", () => {
	Loader.configure({ color: "red", presets: { a: { variant: "dots" } } });
	const config = Loader.getConfig();
	config.color = "blue";
	config.presets.a.variant = "ring";
	assert.equal(Loader.getConfig().color, "red");
	assert.equal(Loader.getConfig().presets.a.variant, "dots");
});
