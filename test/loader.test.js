// Runs against the built CommonJS bundle in a jsdom browser environment.
const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const { JSDOM } = require("jsdom");

const dom = new JSDOM("<!doctype html><html><head></head><body><div id='box'></div></body></html>");
global.window = dom.window;
global.document = dom.window.document;

const { Loader } = require("../dist/bundle.js");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const overlays = () => document.querySelectorAll(".loading-overlay");

beforeEach(() => Loader.forceClose());

test("adds no CSS on import, only on first start, at the top of <head>", () => {
	assert.equal(document.getElementById("circle-loader-core"), null);
	const pageStyle = document.createElement("style");
	document.head.appendChild(pageStyle);
	Loader.start();
	const core = document.getElementById("circle-loader-core");
	assert.ok(core.textContent.includes(".loading-overlay"));
	assert.equal(document.head.firstElementChild, core); // before the page's own CSS
	Loader.forceClose();
	Loader.start();
	assert.equal(document.querySelectorAll("#circle-loader-core").length, 1); // added once
});

test("start and close add and remove the overlay without leaving empty divs", () => {
	const before = document.body.children.length;
	Loader.start();
	assert.equal(overlays().length, 1);
	assert.equal(document.querySelector(".loading-text").textContent, "Loading...");
	Loader.close();
	assert.equal(overlays().length, 0);
	assert.equal(document.body.children.length, before);
});

test("text and styles work in either argument order", () => {
	Loader.start({ loadingTextStyles: { color: "red" } }, "Fetching");
	const p = document.querySelector(".loading-text");
	assert.equal(p.textContent, "Fetching");
	assert.equal(p.style.getPropertyValue("color"), "red");
	assert.equal(p.style.getPropertyPriority("color"), "important");
	Loader.close();
	Loader.start("Saving", { loadingOverlayStyles: { backgroundColor: "blue" } });
	assert.equal(document.querySelector(".loading-text").textContent, "Saving");
	assert.equal(document.querySelector(".loading-overlay").style.backgroundColor, "blue");
	assert.equal(document.querySelector(".loading-spinner").getAttribute("style"), null);
});

test("text is not parsed as HTML", () => {
	Loader.start("<img src=x onerror=alert(1)>");
	assert.equal(document.querySelector(".loading-overlay img"), null);
	assert.equal(document.querySelector(".loading-text").textContent, "<img src=x onerror=alert(1)>");
});

test("overlapping calls stay visible until every start is closed", () => {
	Loader.start("A");
	Loader.start("B");
	assert.equal(overlays().length, 1);
	assert.equal(document.querySelector(".loading-text").textContent, "B");
	Loader.close();
	assert.ok(Loader.isActive());
	assert.equal(overlays().length, 1);
	Loader.close();
	assert.ok(!Loader.isActive());
	assert.equal(overlays().length, 0);
	Loader.close(); // extra close is harmless
});

test("update changes the text", () => {
	Loader.start();
	Loader.update("50%");
	assert.equal(document.querySelector(".loading-text").textContent, "50%");
});

test("has screen reader attributes", () => {
	Loader.start();
	const o = document.querySelector(".loading-overlay");
	assert.equal(o.getAttribute("role"), "status");
	assert.equal(o.getAttribute("aria-live"), "polite");
});

test("delay: closing before the delay means it never shows", async () => {
	Loader.start({ delay: 40 });
	assert.ok(Loader.isActive());
	assert.equal(overlays().length, 0);
	Loader.close();
	await sleep(60);
	assert.equal(overlays().length, 0);
	Loader.start({ delay: 20 });
	await sleep(40);
	assert.equal(overlays().length, 1);
});

test("minDuration keeps it visible, and a restart cancels the pending hide", async () => {
	Loader.start({ minDuration: 60 });
	Loader.close();
	assert.equal(overlays().length, 1);
	await sleep(80);
	assert.equal(overlays().length, 0);

	Loader.start({ minDuration: 60 });
	Loader.close();
	Loader.start();
	await sleep(80);
	assert.equal(overlays().length, 1);
});

test("target shows the loader inside an element and restores it afterwards", () => {
	const box = document.getElementById("box");
	Loader.start({ target: "#box" });
	assert.equal(box.querySelectorAll(".loading-overlay--scoped").length, 1);
	assert.equal(box.style.position, "relative");
	assert.equal(box.getAttribute("aria-busy"), "true");
	assert.ok(!Loader.isActive()); // fullscreen is separate
	Loader.close(box);
	assert.equal(box.children.length, 0);
	assert.equal(box.style.position, "");
	assert.equal(box.getAttribute("aria-busy"), null);
});

test("unknown selector does nothing", () => {
	const warn = console.warn;
	console.warn = () => {};
	Loader.start({ target: "#missing" });
	console.warn = warn;
	assert.equal(overlays().length, 0);
});

test("wrap closes after success and after an error", async () => {
	const p = Loader.wrap(async () => {
		assert.equal(overlays().length, 1);
		return 42;
	}, "Working");
	assert.equal(await p, 42);
	assert.equal(overlays().length, 0);

	await assert.rejects(Loader.wrap(Promise.reject(new Error("boom")), { target: "#box" }), /boom/);
	assert.equal(overlays().length, 0);
});

test("default variant is circle with no children", () => {
	Loader.start();
	const s = document.querySelector(".loading-spinner");
	assert.ok(s.classList.contains("loading-spinner--circle"));
	assert.equal(s.children.length, 0);
});

test("each variant gets its class and child elements", () => {
	const expected = { circle: 0, ring: 0, dual: 0, dots: 8, pulse: 0, orbit: 0, ripple: 0, comet: 0, bounce: 0, spokes: 12, arc: 1, flip: 0, clock: 0, gyro: 2, fill: 0, moon: 0, chase: 6, glow: 0, radar: 0, dashed: 0, halves: 0, rings: 3, planets: 3, squish: 0, eclipse: 0, segments: 0, flower: 6, target: 3, pendulum: 0, donut: 0, wave: 8, heartbeat: 0, yinyang: 0, atom: 3, quarters: 4, globe: 2, swap: 2, ball: 0, wheel: 0, fan: 0, breathe: 0, gear: 0, split: 0, stripes: 0, water: 0, tunnel: 3, typing: 3, eye: 0, sun: 0, fizz: 4 };
	assert.deepEqual([...Loader.variants], Object.keys(expected));
	for (const [variant, children] of Object.entries(expected)) {
		Loader.start({ variant });
		const s = document.querySelector(".loading-spinner");
		assert.ok(s.classList.contains(`loading-spinner--${variant}`), variant);
		assert.equal(s.children.length, children, variant);
		Loader.forceClose();
	}
});

test("each variant's CSS is added once, after the core CSS", () => {
	for (const v of Loader.variants.filter((v) => v !== "circle")) {
		const style = document.getElementById(`circle-loader-variant-${v}`);
		assert.ok(style && style.textContent.includes(`loading-spinner--${v}`), v);
		assert.ok(document.getElementById("circle-loader-core").compareDocumentPosition(style) & 4, v + " after core");
	}
	assert.equal(document.querySelectorAll('style[id^="circle-loader-variant-dots"]').length, 1);
});

test("arc variant draws an SVG circle", () => {
	Loader.start({ variant: "arc" });
	const circle = document.querySelector(".loading-spinner--arc svg circle");
	assert.ok(circle);
	assert.equal(circle.namespaceURI, "http://www.w3.org/2000/svg");
	assert.equal(circle.getAttribute("r"), "20");
});

test("unknown variant falls back to circle", () => {
	const warn = console.warn;
	let warned = false;
	console.warn = () => (warned = true);
	Loader.start({ variant: "nope" });
	console.warn = warn;
	assert.ok(warned);
	assert.ok(document.querySelector(".loading-spinner").classList.contains("loading-spinner--circle"));
});

test("color variable can be set through overlay styles", () => {
	Loader.start({ variant: "dots", loadingOverlayStyles: { "--circle-loader-color": "red" } });
	assert.equal(document.querySelector(".loading-overlay").style.getPropertyValue("--circle-loader-color"), "red");
});

const textEl = () => document.querySelector(".loading-text");

test("no text: empty string, false and null hide the text", () => {
	for (const text of ["", false, null]) {
		Loader.start({ text });
		assert.equal(textEl().hidden, true, String(text));
		assert.equal(textEl().textContent, "");
		assert.equal(document.querySelector(".loading-overlay").getAttribute("aria-label"), "Loading");
		Loader.forceClose();
	}
	Loader.start("");
	assert.equal(textEl().hidden, true);
});

test("update can hide, show and reset the text", () => {
	Loader.start({ text: false });
	Loader.update("Now visible");
	assert.equal(textEl().hidden, false);
	assert.equal(textEl().textContent, "Now visible");
	assert.equal(document.querySelector(".loading-overlay").getAttribute("aria-label"), null);
	Loader.update(null);
	assert.equal(textEl().hidden, true);
	Loader.update();
	assert.equal(textEl().textContent, "Loading...");
});

test("a list of texts rotates and stops when closed", async () => {
	Loader.start({ text: ["One", "Two", "Three"], textInterval: 100 });
	assert.equal(textEl().textContent, "One");
	await sleep(130);
	assert.equal(textEl().textContent, "Two");
	await sleep(100);
	assert.equal(textEl().textContent, "Three");
	await sleep(100);
	assert.equal(textEl().textContent, "One");
	Loader.update("Fixed");
	await sleep(130);
	assert.equal(textEl().textContent, "Fixed");
});

test("a string argument wins over options.text", () => {
	Loader.start("From arg", { text: ["From", "options"] });
	assert.equal(textEl().textContent, "From arg");
});

test("background presets add a class, other strings set the color", () => {
	assert.deepEqual([...Loader.backgrounds], ["dark", "light", "dim", "blur", "transparent"]);
	for (const background of Loader.backgrounds) {
		Loader.start({ background });
		assert.ok(document.querySelector(".loading-overlay").classList.contains(`loading-overlay--${background}`), background);
		Loader.forceClose();
	}
	Loader.start({ background: "rgb(10, 20, 30)" });
	const o = document.querySelector(".loading-overlay");
	assert.equal(o.style.backgroundColor, "rgb(10, 20, 30)");
	assert.equal(o.classList.length, 1);
});

test("loadingOverlayStyles still wins over background", () => {
	Loader.start({ background: "red", loadingOverlayStyles: { backgroundColor: "blue" } });
	assert.equal(document.querySelector(".loading-overlay").style.backgroundColor, "blue");
});

test("auto text color: light custom backgrounds get dark text", () => {
	const textVar = () => document.querySelector(".loading-overlay").style.getPropertyValue("--circle-loader-text-color");
	const trackVar = () => document.querySelector(".loading-overlay").style.getPropertyValue("--circle-loader-track");
	const cases = [
		[{ background: "#fef3c7" }, "#111827"], // light yellow
		[{ background: "rgb(255, 255, 255)" }, "#111827"],
		[{ background: "#4c1d95" }, ""], // dark purple keeps light text
		[{ background: "rgb(0, 128, 0)" }, ""],
		[{ background: "rgba(255, 255, 255, 0.3)" }, ""], // mostly see-through: unchanged
		[{ loadingOverlayStyles: { backgroundColor: "#e0f2fe" } }, "#111827"],
		[{ background: "light" }, ""], // presets handle their own text color
		[{}, ""]
	];
	for (const [options, want] of cases) {
		Loader.start(options);
		assert.equal(textVar(), want, JSON.stringify(options));
		if (want) assert.equal(trackVar(), "rgba(0, 0, 0, 0.12)");
		Loader.forceClose();
	}
});

test("auto text color leaves the user's own text color alone", () => {
	Loader.start({ background: "#ffffff", loadingOverlayStyles: { "--circle-loader-text-color": "red" } });
	assert.equal(document.querySelector(".loading-overlay").style.getPropertyValue("--circle-loader-text-color"), "red");
	Loader.forceClose();
	Loader.start({ background: "#ffffff", loadingTextStyles: { color: "blue" } });
	assert.equal(textEl().style.color, "blue"); // inline !important beats the variable
});

test("style options set CSS variables on the overlay", () => {
	Loader.start({
		color: "red",
		secondaryColor: "blue",
		trackColor: "rgba(0, 0, 0, 0.2)",
		textColor: "green",
		size: 80,
		thickness: "6px",
		textSize: 14
	});
	const o = document.querySelector(".loading-overlay");
	const v = (name) => o.style.getPropertyValue(name);
	assert.equal(v("--circle-loader-color"), "red");
	assert.equal(v("--circle-loader-secondary-color"), "blue");
	assert.equal(v("--circle-loader-track"), "rgba(0, 0, 0, 0.2)");
	assert.equal(v("--circle-loader-text-color"), "green");
	assert.equal(v("--circle-loader-size"), "80px");
	assert.equal(v("--circle-loader-thickness"), "6px");
	assert.equal(v("--circle-loader-text-size"), "14px");
});

test("unset style options leave the variables alone", () => {
	Loader.start({ color: "", size: null });
	const o = document.querySelector(".loading-overlay");
	assert.equal(o.style.getPropertyValue("--circle-loader-color"), "");
	assert.equal(o.style.getPropertyValue("--circle-loader-size"), "");
});

test("loadingOverlayStyles wins over style options", () => {
	Loader.start({ color: "red", loadingOverlayStyles: { "--circle-loader-color": "blue" } });
	assert.equal(document.querySelector(".loading-overlay").style.getPropertyValue("--circle-loader-color"), "blue");
});

test("textColor and trackColor turn off the automatic colors", () => {
	Loader.start({ background: "#ffffff", textColor: "orange", trackColor: "pink" });
	const o = document.querySelector(".loading-overlay");
	assert.equal(o.style.getPropertyValue("--circle-loader-text-color"), "orange");
	assert.equal(o.style.getPropertyValue("--circle-loader-track"), "pink");
});

const overlay = () => document.querySelector(".loading-overlay");
const cssVar = (name) => overlay().style.getPropertyValue(name);

test("setStyle changes colors and sizes of an open loader", () => {
	Loader.start({ color: "red" });
	const before = overlay();
	Loader.setStyle({ color: "blue", secondaryColor: "gold", size: 70, thickness: 5, textSize: 12 });
	assert.equal(overlay(), before); // same overlay, changed in place
	assert.equal(cssVar("--circle-loader-color"), "blue");
	assert.equal(cssVar("--circle-loader-secondary-color"), "gold");
	assert.equal(cssVar("--circle-loader-size"), "70px");
	assert.equal(cssVar("--circle-loader-thickness"), "5px");
	assert.equal(cssVar("--circle-loader-text-size"), "12px");
});

test("setStyle with null resets an option to its default", () => {
	Loader.start({ color: "red", size: 80, speed: "fast" });
	Loader.setStyle({ color: null, size: "", speed: null });
	assert.equal(cssVar("--circle-loader-color"), "");
	assert.equal(cssVar("--circle-loader-size"), "");
	assert.equal(cssVar("--circle-loader-speed"), "");
});

test("setStyle changes the variant and keeps the text", () => {
	Loader.start({ variant: "ring", text: "Keep me" });
	Loader.setStyle({ variant: "dots" });
	const spinners = document.querySelectorAll(".loading-spinner");
	assert.equal(spinners.length, 1);
	assert.ok(spinners[0].classList.contains("loading-spinner--dots"));
	assert.equal(spinners[0].children.length, 8);
	assert.equal(textEl().textContent, "Keep me");
	Loader.setStyle({ variant: "arc" });
	assert.ok(document.querySelector(".loading-spinner--arc svg circle"));
});

test("setStyle changes speed and background", () => {
	Loader.start({ background: "light" });
	Loader.setStyle({ speed: "slow", background: "blur" });
	assert.equal(cssVar("--circle-loader-speed"), "0.5");
	assert.ok(overlay().classList.contains("loading-overlay--blur"));
	assert.ok(!overlay().classList.contains("loading-overlay--light"));
	Loader.setStyle({ background: "rgb(1, 2, 3)" });
	assert.ok(!overlay().classList.contains("loading-overlay--blur"));
	assert.equal(overlay().style.backgroundColor, "rgb(1, 2, 3)");
	Loader.setStyle({ background: null });
	assert.equal(overlay().style.backgroundColor, "");
});

test("setStyle works out the automatic text color again", () => {
	Loader.start({ background: "#ffffff" });
	assert.equal(cssVar("--circle-loader-text-color"), "#111827");
	Loader.setStyle({ background: "#111111" }); // dark: back to light text
	assert.equal(cssVar("--circle-loader-text-color"), "");
	assert.equal(cssVar("--circle-loader-track"), "");
	Loader.setStyle({ background: "#fef3c7" }); // light again
	assert.equal(cssVar("--circle-loader-text-color"), "#111827");
	Loader.setStyle({ textColor: "red" }); // explicit color wins
	assert.equal(cssVar("--circle-loader-text-color"), "red");
	Loader.setStyle({ textColor: null }); // back to automatic
	assert.equal(cssVar("--circle-loader-text-color"), "#111827");
});

test("setStyle before a delayed loader appears is used when it shows", async () => {
	Loader.start({ delay: 30, variant: "ring" });
	Loader.setStyle({ variant: "pulse", color: "red" });
	await sleep(50);
	assert.ok(document.querySelector(".loading-spinner--pulse"));
	assert.equal(cssVar("--circle-loader-color"), "red");
});

test("setStyle targets one loader and does not change the caller's options", () => {
	const options = { target: "#box", color: "red" };
	Loader.start(options);
	Loader.start({ color: "green" });
	Loader.setStyle({ color: "blue" }, "#box");
	assert.equal(document.querySelector("#box .loading-overlay").style.getPropertyValue("--circle-loader-color"), "blue");
	assert.equal(document.querySelector("body > .loading-overlay").style.getPropertyValue("--circle-loader-color"), "green");
	assert.equal(options.color, "red");
});

test("setStyle warns about options it can't change and ignores missing loaders", () => {
	const warn = console.warn;
	const warnings = [];
	console.warn = (m) => warnings.push(m);
	Loader.setStyle({ color: "red" }); // no loader: nothing happens
	Loader.start();
	Loader.setStyle({ target: "#box", delay: 100, color: "red" });
	console.warn = warn;
	assert.equal(warnings.length, 2);
	assert.equal(cssVar("--circle-loader-color"), "red");
});

test("speed sets the speed variable", () => {
	const speedOf = () => document.querySelector(".loading-overlay").style.getPropertyValue("--circle-loader-speed");
	for (const [speed, want] of [["slow", "0.5"], ["fast", "2"], [3, "3"], ["1.5", "1.5"]]) {
		Loader.start({ speed });
		assert.equal(speedOf(), want, String(speed));
		Loader.forceClose();
	}
	Loader.start({ speed: "normal" });
	assert.equal(speedOf(), "");
});

test("invalid speed warns and uses normal speed", () => {
	const warn = console.warn;
	let warnings = 0;
	console.warn = () => warnings++;
	for (const speed of ["turbo", 0, -1, true]) {
		Loader.start({ speed });
		assert.equal(document.querySelector(".loading-overlay").style.getPropertyValue("--circle-loader-speed"), "");
		Loader.forceClose();
	}
	console.warn = warn;
	assert.equal(warnings, 4);
});

test("forceClose removes everything", () => {
	Loader.start();
	Loader.start();
	Loader.start({ target: "#box" });
	Loader.forceClose();
	assert.equal(overlays().length, 0);
	assert.ok(!Loader.isActive());
});
