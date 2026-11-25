// zIndex, progress, blockInput, nonce and state shared between two copies of the package (full bundle, jsdom).
const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const { JSDOM } = require("jsdom");

const dom = new JSDOM("<!doctype html><html><head></head><body><button id='btn'>Go</button><div id='box'><input id='field'></div><aside inert id='own'></aside></body></html>");
global.window = dom.window;
global.document = dom.window.document;

const { Loader } = require("../dist/bundle.js");

const overlay = () => document.querySelector(".loading-overlay");
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

test("zIndex sets the z-index variable and setStyle can change it", () => {
	Loader.start({ zIndex: 5000 });
	assert.equal(overlay().style.getPropertyValue("--circle-loader-z-index"), "5000");
	Loader.setStyle({ zIndex: null });
	assert.equal(overlay().style.getPropertyValue("--circle-loader-z-index"), "");
	assert.match(document.getElementById("circle-loader-core").textContent, /z-index:var\(--circle-loader-z-index,1000\)/);
});

test("progress shows a progressbar, updates, clamps and hides", () => {
	Loader.start();
	assert.equal(document.querySelector(".loading-progress"), null);
	Loader.progress(42.4);
	const bar = document.querySelector(".loading-progress");
	assert.equal(bar.getAttribute("role"), "progressbar");
	assert.equal(bar.getAttribute("aria-valuenow"), "42");
	assert.equal(bar.textContent, "42%");
	assert.equal(overlay().style.getPropertyValue("--circle-loader-progress"), "42.4");
	Loader.progress(150);
	assert.equal(bar.textContent, "100%");
	Loader.progress(null);
	assert.equal(document.querySelector(".loading-progress"), null);
	assert.equal(overlay().style.getPropertyValue("--circle-loader-progress"), "");
	Loader.close();

	Loader.start({ progress: 10 });
	assert.equal(document.querySelector(".loading-progress").textContent, "10%");
	const warnings = quiet(() => Loader.progress("abc"));
	assert.match(warnings[0], /Invalid progress/);
	assert.equal(document.querySelector(".loading-progress"), null);
});

test("progress skips changes too small to see, and ignores missing loaders", () => {
	Loader.start({ progress: 10 });
	const label = document.querySelector(".loading-progress-label");
	let writes = 0;
	const observer = new window.MutationObserver((records) => (writes += records.length));
	observer.observe(overlay(), { attributes: true, childList: true, subtree: true, characterData: true });
	Loader.progress(10.01); // rounds to 10.0: nothing changes
	Loader.progress(10);
	assert.equal(observer.takeRecords().length + writes, 0);
	Loader.progress(10.4); // the bar moves, the label stays "10%"
	const records = observer.takeRecords();
	assert.ok(records.every((r) => r.target === overlay() && r.attributeName === "style"));
	assert.equal(label.textContent, "10%");
	observer.disconnect();
	assert.doesNotThrow(() => Loader.progress(50, "#nothing-here-" + Date.now()));
});

test("blockInput makes the content behind the overlay inert, then restores it", () => {
	const btn = document.getElementById("btn");
	btn.focus();
	Loader.start();
	assert.ok(btn.hasAttribute("inert"));
	assert.ok(document.getElementById("box").hasAttribute("inert"));
	assert.ok(!overlay().hasAttribute("inert"));
	assert.notEqual(document.activeElement, btn);
	Loader.close();
	assert.ok(!btn.hasAttribute("inert"));
	assert.ok(!document.getElementById("box").hasAttribute("inert"));
	assert.ok(document.getElementById("own").hasAttribute("inert")); // the page's own inert is kept
	assert.equal(document.activeElement, btn); // focus goes back
});

test("blockInput inside a target blocks only the target's content", () => {
	Loader.start({ target: "#box" });
	assert.ok(document.getElementById("field").hasAttribute("inert"));
	assert.ok(!document.getElementById("btn").hasAttribute("inert"));
	Loader.close("#box");
	assert.ok(!document.getElementById("field").hasAttribute("inert"));
});

test("blockInput is counted between loaders and can be turned off", () => {
	const box = document.getElementById("box");
	Loader.start(); // fullscreen: body's children inert
	Loader.start({ target: document.body }); // a second loader over the same children
	Loader.close();
	assert.ok(box.hasAttribute("inert")); // still blocked by the second one
	Loader.close(document.body);
	assert.ok(!box.hasAttribute("inert"));
	Loader.start({ blockInput: false });
	assert.ok(!box.hasAttribute("inert"));
	Loader.forceClose();
	Loader.configure({ blockInput: false });
	Loader.start();
	assert.ok(!box.hasAttribute("inert"));
});

test("nonce is set on added styles, from the option or from the page", () => {
	document.querySelectorAll("style").forEach((s) => s.remove());
	Loader.start({ nonce: "abc123", variant: "dots" });
	assert.equal(document.getElementById("circle-loader-core").getAttribute("nonce"), "abc123");
	assert.equal(document.getElementById("circle-loader-variant-dots").getAttribute("nonce"), "abc123");
	Loader.forceClose();
	const script = document.createElement("script");
	script.setAttribute("nonce", "fromPage");
	document.head.appendChild(script);
	Loader.start({ variant: "ring" });
	assert.equal(document.getElementById("circle-loader-variant-ring").getAttribute("nonce"), "fromPage");
	script.remove();
});

test("two copies of the package share loaders, config and variants", () => {
	Loader.configure({ text: "Shared" });
	Loader.start();
	// A second, separate copy of the package (as with two bundles on one page).
	for (const key of Object.keys(require.cache)) if (key.includes("/dist/")) delete require.cache[key];
	const Other = require("../dist/core.js").Loader;
	assert.notEqual(Other, Loader);
	assert.ok(Other.isActive());
	assert.equal(Other.getConfig().text, "Shared");
	assert.ok(Other.variants.includes("dots"));
	Other.close(); // closes the loader the first copy opened
	assert.equal(overlay(), null);
});
