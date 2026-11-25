# circle-loader

[![npm version](https://img.shields.io/npm/v/circle-loader)](https://www.npmjs.com/package/circle-loader)
[![license](https://img.shields.io/npm/l/circle-loader)](#license)
[![live demo](https://img.shields.io/badge/demo-live-3b82f6)](https://majid-ali-watto.github.io/Loaders/demo/)

**A lightweight JavaScript loading spinner library: 50 circular CSS loaders with one small API.** Show a loading overlay while data loads, over the whole page or inside one element, with an optional progress bar. No dependencies, SSR-safe, TypeScript types included. Works with React, Next.js, Vue, Nuxt, Angular, Svelte and plain JavaScript, or as a `<circle-loader>` web component.

**[Try the live playground →](https://majid-ali-watto.github.io/Loaders/demo/)** Pick a spinner, colors and text, then copy the code.

<p>
	<img src="docs/variants/circle.svg" width="48" height="48" alt="circle loader">
	<img src="docs/variants/ring.svg" width="48" height="48" alt="ring loader">
	<img src="docs/variants/dual.svg" width="48" height="48" alt="dual loader">
	<img src="docs/variants/dots.svg" width="48" height="48" alt="dots loader">
	<img src="docs/variants/arc.svg" width="48" height="48" alt="arc loader">
	<img src="docs/variants/comet.svg" width="48" height="48" alt="comet loader">
	<img src="docs/variants/glow.svg" width="48" height="48" alt="glow loader">
	<img src="docs/variants/planets.svg" width="48" height="48" alt="planets loader">
	<img src="docs/variants/flower.svg" width="48" height="48" alt="flower loader">
	<img src="docs/variants/donut.svg" width="48" height="48" alt="donut loader">
</p>

```javascript
import { Loader } from "circle-loader";

await Loader.wrap(fetch("/api/users"), { variant: "arc", color: "#10b981" }, "Loading users");
```

## Features

- **50 variants**, every one a circle, with animated previews [below](#variants).
- **One call does it:** `Loader.wrap(promise)` shows the loader and always closes it, even on errors.
- **Set your style once** with `Loader.configure()`, and use named presets where you need a different look.
- **Style options for everything:** colors, size, thickness, speed, background (dark, light, dim, blur, transparent or any color) and text.
- **No flicker:** `delay` skips the loader for fast requests, `minDuration` stops it blinking.
- **Overlapping requests just work:** calls are counted, so one request finishing doesn't hide another's loader.
- **Small and tree-shakable:** about 6 KB gzipped for the core plus one variant. Unused variants are left out of your bundle.
- **Safe for server rendering:** importing it never touches the page.
- **Progress:** show a bar and a percentage with `Loader.progress(42)`.
- **Accessible:** announced to screen readers, keyboard focus can't reach the page behind it, and slower for users who prefer reduced motion.
- **Works with a strict Content-Security-Policy:** pass a `nonce`, or it uses your page's.
- **A `<circle-loader>` element** for declarative use in any framework or plain HTML.
- **TypeScript types included.**

Try every option in the [live playground](https://majid-ali-watto.github.io/Loaders/demo/), in a light or dark theme. To run it locally, use `npm run demo` in this repository.

## Contents

- [Install](#install)
- [Quick start](#quick-start)
- [Set your defaults once](#set-your-defaults-once)
- [Options](#options)
- [Methods](#methods)
- [Variants](#variants)
- [Colors and sizes](#colors-and-sizes)
- [Text](#text)
- [Background](#background)
- [Speed](#speed)
- [Changing the look while it's showing](#changing-the-look-while-its-showing)
- [Progress](#progress)
- [Smaller bundles](#smaller-bundles-import-only-what-you-need)
- [Customizing with CSS](#customizing-with-css)
- [Frameworks: React, Next.js, Vue, Nuxt](#frameworks)
- [The `<circle-loader>` element](#the-circle-loader-element)
- [Accessibility](#accessibility)
- [Content-Security-Policy](#content-security-policy)
- [Development](#development)
- [Author](#author) · [License](#license)

## Install

```bash
npm install circle-loader
```

Or without a build step, from a CDN. Always pin the exact version:

```html
<script src="https://cdn.jsdelivr.net/npm/circle-loader@1.1.0/dist/circle-loader.min.js" crossorigin="anonymous"></script>
<script>
	const { Loader } = CircleLoader;
	Loader.start();
</script>
```

**Security:** an unpinned URL (`circle-loader` or `circle-loader@1`) runs whatever version is newest, on your page, without you seeing it. For production, also add [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity), so the browser refuses a file that was changed. jsDelivr shows the `integrity` value on the file's page, or work it out yourself:

```bash
curl -s https://cdn.jsdelivr.net/npm/circle-loader@1.1.0/dist/circle-loader.min.js | openssl dgst -sha384 -binary | openssl base64 -A
```

```html
<script src="https://cdn.jsdelivr.net/npm/circle-loader@1.1.0/dist/circle-loader.min.js" integrity="sha384-<the value>" crossorigin="anonymous"></script>
```

Releases are published from GitHub Actions with [npm provenance](https://docs.npmjs.com/generating-provenance-statements), so you can check a version was built from this repository: `npm audit signatures`.

That script has all 50 variants (about 10 KB gzipped). For less, load the core (about 5.5 KB) and only the variants you use (about 0.6 KB each), after it:

```html
<script src="https://cdn.jsdelivr.net/npm/circle-loader@1.1.0/dist/circle-loader.core.min.js" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/circle-loader@1.1.0/dist/variants/dots.min.js" crossorigin="anonymous"></script>
```

`circle-loader.element.min.js` is the full script plus the [`<circle-loader>` element](#the-circle-loader-element).

Two copies of the package on one page (two bundles, or a bundle and a CDN script) share their loaders, defaults, presets and variants, so one copy can close a loader the other opened.

## Quick start

```javascript
import { Loader } from "circle-loader";

Loader.start();   // show it
Loader.close();   // hide it
```

**Wrap a promise (recommended).** The loader shows while the promise or async function runs, and closes afterwards, even if it throws. You can't forget to close it:

```javascript
const users = await Loader.wrap(fetch("/api/users").then((r) => r.json()), "Loading users");

await Loader.wrap(async () => {
	await saveForm();
}, { variant: "dots" });
```

**Inside one element** instead of the whole page:

```javascript
Loader.start({ target: "#users-table", text: "Loading users" });
Loader.close("#users-table"); // pass the same target to close it
```

**No flicker:** skip the loader for fast requests, and keep it long enough not to blink:

```javascript
Loader.start({ delay: 200, minDuration: 400 });
```

**Text and options in any order.** `start()` takes a text string, an options object, or both:

```javascript
Loader.start("Saving...");
Loader.start("Saving...", { variant: "arc" });
Loader.start({ variant: "arc" }, "Saving...");
```

**Overlapping requests.** Calls are counted. The loader stays until every `start()` has a matching `close()`, so two requests running at once don't hide each other's loader:

```javascript
Loader.start();   // request A
Loader.start();   // request B
Loader.close();   // A finished: still showing
Loader.close();   // B finished: hidden
```

`Loader.forceClose()` removes it immediately, whatever the count. While a loader is showing, another `start()` only changes the text and keeps the first call's look. To change the look, use [`setStyle`](#changing-the-look-while-its-showing). For a differently styled loader at the same time, give it its own `target`.

## Set your defaults once

Call `Loader.configure()` once when your app starts. Every `start()` and `wrap()` afterwards uses those settings, so most calls pass nothing:

```javascript
// main.js (or wherever your app starts)
import { Loader } from "circle-loader";

Loader.configure({
	variant: "arc",
	background: "blur",
	color: "#10b981",
	delay: 200,
	minDuration: 400
});
```

```javascript
// anywhere in your app
Loader.start();                               // arc, blur, green, with the delay
Loader.start("Saving...");                    // same look, different text
await Loader.wrap(fetchUsers());              // same look
Loader.start({ variant: "dots" });            // a different loader here, only this call
Loader.start({ target: "#table", size: 30 }); // smaller, inside the table
```

**How settings combine:** built-in defaults, then your `configure()` defaults, then the preset (below), then the options passed to the call. Each layer only changes what it sets, so a call passing `{ variant: "dots" }` still gets your color, background and delay. Pass `null` to turn a default off for one call: `Loader.start({ color: null })`.

Every option can be a default except `target` and `preset`.

### Presets: a few named looks

If your app uses a few different loaders, name them once and pick one by name:

```javascript
Loader.configure({
	variant: "arc",                // the defaults
	color: "#10b981",
	presets: {
		save:  { variant: "dots", text: "Saving...", delay: 0 },
		page:  { background: "blur", size: 70, text: false },
		table: { target: "#users-table", variant: "spokes", text: false }
	}
});

Loader.start({ preset: "save" });                       // dots, "Saving...", green from the defaults
await Loader.wrap(loadPage(), { preset: "page" });
Loader.start({ preset: "table" });                      // inside #users-table
Loader.close({ preset: "table" });                      // closes that same one
Loader.start({ preset: "save", text: "Uploading..." }); // the call still wins
```

- A preset fills in on top of the defaults, so it only needs what's different.
- A preset can include a `target`. Pass `{ preset: "table" }` to `close()`, `setStyle()` or `isActive()` and they find the same element.
- `Loader.setStyle({ preset: "save" })` switches an open loader to that preset's look.
- An unknown preset name logs a warning, and the defaults are used.

### Changing the config

```javascript
Loader.configure({ color: "#f43f5e" });           // merges: only the color changes
Loader.configure({ delay: null });                // removes one default
Loader.configure({ presets: { page: null } });    // removes one preset
Loader.configure(null);                           // removes all defaults and presets

Loader.getConfig(); // { variant: "arc", color: "#f43f5e", presets: { save: {...}, table: {...} } }
```

- New settings apply to loaders started afterwards. An open loader keeps its look; use `setStyle` to change it.
- `configure()` doesn't touch the page, so it's safe during server rendering in Next.js and Nuxt.
- With `circle-loader/core`, pass variant objects: `Loader.configure({ variant: arc })`, in presets too.

## Options

Pass these to `start()`, `wrap()` or `configure()`:

| Option | Type | Description |
|---|---|---|
| `variant` | `string` or variant object | Spinner style: `circle` (default) or one of the other 49. See [Variants](#variants). |
| `text` | `string \| string[] \| false \| null` | Text under the spinner. A list of messages takes turns. `""`, `false` or `null` shows no text. Default `"Loading..."`. See [Text](#text). |
| `textInterval` | `number` (ms) | Time between messages when `text` is a list. Default `2000`. |
| `color` | `string` | Main spinner color, any CSS color. See [Colors and sizes](#colors-and-sizes). |
| `secondaryColor` | `string` | Second color for two-part variants. Default: same as `color`. |
| `trackColor` | `string` | The faint ring behind `ring`, `orbit`, `moon`, `halves`, `planets`, `pendulum`, `donut`, `atom`, `ball`, `stripes` and `typing`. |
| `textColor` | `string` | Text color. Turns off the automatic text color. |
| `size` | `number \| string` | Spinner width and height. A number means pixels. Default `50`. |
| `thickness` | `number \| string` | Line width of ring-style variants. A number means pixels. |
| `textSize` | `number \| string` | Text font size. A number means pixels. Default `18`. |
| `zIndex` | `number \| string` | Stacking order of the overlay. Default `1000`, or `10` inside a `target`. |
| `progress` | `number \| null` | 0 to 100: shows a bar and a percentage under the text. See [Progress](#progress). |
| `background` | `string` | `dark` (default), `light`, `dim`, `blur`, `transparent`, or any CSS color. See [Background](#background). |
| `speed` | `string \| number` | `slow`, `normal` (default), `fast`, or a multiplier such as `1.5`. See [Speed](#speed). |
| `target` | `Element \| string` | Show the loader inside this element (or CSS selector) instead of over the whole page. |
| `preset` | `string` | Use a named preset from [`configure()`](#presets-a-few-named-looks). Options passed next to it win. |
| `delay` | `number` (ms) | Wait before showing. If closed sooner, the loader never appears. |
| `minDuration` | `number` (ms) | Once shown, keep it visible at least this long. |
| `blockInput` | `boolean` | Make the content behind the overlay `inert`, so keyboard focus and screen readers can't reach it. Default `true`. See [Accessibility](#accessibility). |
| `nonce` | `string` | Nonce for the `<style>` tags the package adds. See [Content-Security-Policy](#content-security-policy). |
| `loadingOverlayStyles` | object | Inline styles for the overlay. See [Style objects](#style-objects). |
| `loadingSpinnerStyles` | object | Inline styles for the spinner. |
| `loadingTextStyles` | object | Inline styles for the text. |

## Methods

| Method | Description |
|---|---|
| `Loader.start(text?, options?)` | Show the loader. Text and options can go in either order. |
| `Loader.close(target?)` | Close one `start()`. Hides once every `start()` is closed. Pass the same target (or options) as `start()`. |
| `Loader.wrap(promiseOrFn, text?, options?)` | Show the loader while it runs, then close it, even if it throws. Returns the result. |
| `Loader.update(text, target?)` | Change the text of an open loader. Takes the same values as `text`. `update()` brings back the default text. |
| `Loader.progress(value, target?)` | Show progress (0 to 100) on an open loader. `null` hides it. |
| `Loader.setStyle(style, target?)` | Change the look of an open loader. See [Changing the look](#changing-the-look-while-its-showing). |
| `Loader.configure(config)` | Set defaults and presets for every later call. See [Set your defaults once](#set-your-defaults-once). |
| `Loader.getConfig()` | The current defaults and presets. |
| `Loader.register(...variants)` | Make variants usable by name, with `circle-loader/core`. See [Smaller bundles](#smaller-bundles-import-only-what-you-need). |
| `Loader.isActive(target?)` | `true` from `start()` until the loader is closed, including while waiting out `delay`. |
| `Loader.forceClose(target?)` | Remove it immediately, ignoring the count and `minDuration`. With no target, removes every loader. |

Lists for building your own pickers: `Loader.variants` (names), `Loader.backgrounds` (`['dark', 'light', 'dim', 'blur', 'transparent']`) and `Loader.speeds` (`{ slow: 0.5, normal: 1, fast: 2 }`).

## Variants

50 spinner styles, every one a circle. The previews are animated SVGs made from each variant's real CSS.

| Preview | Variant | Looks like |
|:---:|---|---|
| <img src="docs/variants/circle.svg" width="56" height="56" alt="circle loader"> | `circle` | The original spinning ring with red and blue sides (default) |
| <img src="docs/variants/ring.svg" width="56" height="56" alt="ring loader"> | `ring` | A thin ring with one colored arc spinning |
| <img src="docs/variants/dual.svg" width="56" height="56" alt="dual loader"> | `dual` | Two rings spinning in opposite directions |
| <img src="docs/variants/dots.svg" width="56" height="56" alt="dots loader"> | `dots` | Eight dots arranged in a circle, fading in turn |
| <img src="docs/variants/pulse.svg" width="56" height="56" alt="pulse loader"> | `pulse` | A circle that grows and fades |
| <img src="docs/variants/orbit.svg" width="56" height="56" alt="orbit loader"> | `orbit` | A dot travelling around a faint ring |
| <img src="docs/variants/ripple.svg" width="56" height="56" alt="ripple loader"> | `ripple` | Rings expanding outwards, one after another |
| <img src="docs/variants/comet.svg" width="56" height="56" alt="comet loader"> | `comet` | A ring with a fading tail |
| <img src="docs/variants/bounce.svg" width="56" height="56" alt="bounce loader"> | `bounce` | Two circles growing and shrinking in turn |
| <img src="docs/variants/spokes.svg" width="56" height="56" alt="spokes loader"> | `spokes` | Twelve short lines in a circle, fading in turn |
| <img src="docs/variants/arc.svg" width="56" height="56" alt="arc loader"> | `arc` | An arc that grows and shrinks while spinning |
| <img src="docs/variants/flip.svg" width="56" height="56" alt="flip loader"> | `flip` | A circle flipping like a coin |
| <img src="docs/variants/clock.svg" width="56" height="56" alt="clock loader"> | `clock` | Two hands sweeping round a clock face |
| <img src="docs/variants/gyro.svg" width="56" height="56" alt="gyro loader"> | `gyro` | Two rings tumbling in 3D on different axes |
| <img src="docs/variants/fill.svg" width="56" height="56" alt="fill loader"> | `fill` | A circle filling up and emptying |
| <img src="docs/variants/moon.svg" width="56" height="56" alt="moon loader"> | `moon` | A crescent going round a faint disc |
| <img src="docs/variants/chase.svg" width="56" height="56" alt="chase loader"> | `chase` | A trail of shrinking dots running round a circle |
| <img src="docs/variants/glow.svg" width="56" height="56" alt="glow loader"> | `glow` | A ring that glows brighter and dimmer |
| <img src="docs/variants/radar.svg" width="56" height="56" alt="radar loader"> | `radar` | A sweep turning inside a ring, like a radar screen |
| <img src="docs/variants/dashed.svg" width="56" height="56" alt="dashed loader"> | `dashed` | A dashed ring turning slowly |
| <img src="docs/variants/halves.svg" width="56" height="56" alt="halves loader"> | `halves` | A circle in two colors, turning with a pause |
| <img src="docs/variants/rings.svg" width="56" height="56" alt="rings loader"> | `rings` | Three rings inside each other, turning in alternate directions |
| <img src="docs/variants/planets.svg" width="56" height="56" alt="planets loader"> | `planets` | Three dots orbiting at different distances and speeds |
| <img src="docs/variants/squish.svg" width="56" height="56" alt="squish loader"> | `squish` | A circle squashing and stretching |
| <img src="docs/variants/eclipse.svg" width="56" height="56" alt="eclipse loader"> | `eclipse` | A shadow sliding across a disc |
| <img src="docs/variants/segments.svg" width="56" height="56" alt="segments loader"> | `segments` | A ring of segments in two colors, turning |
| <img src="docs/variants/flower.svg" width="56" height="56" alt="flower loader"> | `flower` | Six petals breathing in turn while the flower turns |
| <img src="docs/variants/target.svg" width="56" height="56" alt="target loader"> | `target` | Three rings lighting up from the outside in |
| <img src="docs/variants/pendulum.svg" width="56" height="56" alt="pendulum loader"> | `pendulum` | A ball swinging back and forth along the bottom of a ring |
| <img src="docs/variants/donut.svg" width="56" height="56" alt="donut loader"> | `donut` | A ring filling up all the way round, then starting again |
| <img src="docs/variants/wave.svg" width="56" height="56" alt="wave loader"> | `wave` | Eight dots in a circle, moving out and back in turn like a wave |
| <img src="docs/variants/heartbeat.svg" width="56" height="56" alt="heartbeat loader"> | `heartbeat` | A circle beating twice, then resting |
| <img src="docs/variants/yinyang.svg" width="56" height="56" alt="yinyang loader"> | `yinyang` | A yin-yang symbol turning |
| <img src="docs/variants/atom.svg" width="56" height="56" alt="atom loader"> | `atom` | Three tilted orbits round a nucleus, each with an electron running round |
| <img src="docs/variants/quarters.svg" width="56" height="56" alt="quarters loader"> | `quarters` | Four quarters of a circle appearing one after another, then fading |
| <img src="docs/variants/globe.svg" width="56" height="56" alt="globe loader"> | `globe` | A globe spinning, its lines of longitude turning |
| <img src="docs/variants/swap.svg" width="56" height="56" alt="swap loader"> | `swap` | Two dots trading places round a circle, with a pause |
| <img src="docs/variants/ball.svg" width="56" height="56" alt="ball loader"> | `ball` | A ball bouncing inside a ring |
| <img src="docs/variants/wheel.svg" width="56" height="56" alt="wheel loader"> | `wheel` | A spoked wheel rolling forward in bursts |
| <img src="docs/variants/fan.svg" width="56" height="56" alt="fan loader"> | `fan` | Three fan blades speeding up and slowing down |
| <img src="docs/variants/breathe.svg" width="56" height="56" alt="breathe loader"> | `breathe` | A ring thickening into a disc and thinning out again |
| <img src="docs/variants/gear.svg" width="56" height="56" alt="gear loader"> | `gear` | A toothed gear turning |
| <img src="docs/variants/split.svg" width="56" height="56" alt="split loader"> | `split` | A circle splitting into two halves and joining again while it turns |
| <img src="docs/variants/stripes.svg" width="56" height="56" alt="stripes loader"> | `stripes` | Diagonal stripes sliding across a disc |
| <img src="docs/variants/water.svg" width="56" height="56" alt="water loader"> | `water` | Waves rolling on the water inside a ring |
| <img src="docs/variants/tunnel.svg" width="56" height="56" alt="tunnel loader"> | `tunnel` | Rings shrinking into the middle, one after another |
| <img src="docs/variants/typing.svg" width="56" height="56" alt="typing loader"> | `typing` | Three dots bouncing inside a round bubble, like someone typing |
| <img src="docs/variants/eye.svg" width="56" height="56" alt="eye loader"> | `eye` | An eye looking left and right, blinking now and then |
| <img src="docs/variants/sun.svg" width="56" height="56" alt="sun loader"> | `sun` | A sun with rays turning and glowing |
| <img src="docs/variants/fizz.svg" width="56" height="56" alt="fizz loader"> | `fizz` | Bubbles rising inside a ring |

Pick one with `variant`. Without it you get `circle`, or your [`configure()`](#set-your-defaults-once) default:

```javascript
Loader.start({ variant: "dots" });
await Loader.wrap(saveForm(), { variant: "ripple" }, "Saving");
Loader.start({ variant: "ring", target: "#users-table" });
```

An unknown name logs a warning and falls back to `circle`. `Loader.variants` lists every name, handy for a settings dropdown.

## Colors and sizes

Each of these works with every variant:

| Option | What it changes | Default |
|---|---|---|
| `color` | Main spinner color | Blue `#3b82f6`. `circle` keeps its red and blue sides unless you set a color. |
| `secondaryColor` | The second part of two-part variants (table below) | Same as `color` |
| `trackColor` | The faint ring behind `ring`, `orbit`, `moon`, `halves`, `planets`, `pendulum`, `donut`, `atom`, `ball`, `stripes`, `typing` | Faint white, or faint black on the `light` background |
| `size` | Spinner width and height. Dots, spokes and other parts scale with it. | `50` (px) |
| `thickness` | Line width of `circle`, `ring`, `dual`, `orbit`, `ripple`, `comet`, `arc`, `clock`, `gyro`, `fill`, `glow`, `radar`, `dashed`, `rings`, `segments`, `target`, `pendulum`, `donut`, `atom`, `globe`, `ball`, `wheel`, `breathe`, `stripes`, `water`, `tunnel`, `typing`, `eye`, `fizz` | Depends on the variant (2–8px) |
| `textColor` | Text color | Light, or chosen automatically for a custom `background` |
| `textSize` | Text font size | `18` (px) |

Colors take any CSS color. Sizes take a number (pixels) or any CSS length, e.g. `"4rem"`.

```javascript
Loader.start({ variant: "ring", color: "#22c55e" });

Loader.start({
	variant: "dual",
	color: "#f43f5e",          // outer ring
	secondaryColor: "#fbbf24", // inner ring
	size: 80,
	thickness: 6
});

Loader.start({ variant: "glow", color: "hotpink", textColor: "#fff", textSize: 14 }, "Syncing");
```

**Which variants use `secondaryColor`:**

| Variant | `color` | `secondaryColor` |
|---|---|---|
| `circle` | Right side | Left side |
| `dual` | Outer ring | Inner ring |
| `ripple` | First ring | Second ring |
| `bounce` | First circle | Second circle |
| `clock` | Face | Hands |
| `gyro` | First ring | Second ring |
| `fill` | Outline | Filling |
| `radar` | Ring | Sweep |
| `halves` | First half | Second half (default: the track color) |
| `rings` | Outer and inner rings | Middle ring |
| `planets` | Outer and inner planets | Middle planet |
| `eclipse` | Disc | Shadow (default: translucent black) |
| `segments` | Every other segment | The segments in between |
| `flower` | Every other petal | The petals in between |
| `target` | Outer ring and center | Middle ring |
| `wave` | Every other dot | The dots in between |
| `yinyang` | One side | The other side (default: light grey) |
| `atom` | First and third orbits | Second orbit |
| `quarters` | First and third quarters | Second and fourth quarters |
| `globe` | Outline and equator | Lines of longitude |
| `swap` | First dot | Second dot |
| `wheel` | Rim and hub | Spokes |
| `fan` | Blades | Hub |
| `split` | Left half | Right half |
| `water` | Ring | Water |
| `tunnel` | First and third rings | Second ring |
| `eye` | Outline | Pupil |
| `sun` | Disc | Rays |
| `fizz` | Ring | Bubbles |

The other variants use only `color`.

**Note for `arc`:** its `thickness` is measured against a 50px spinner and grows with `size`. At `size: 100`, `thickness: 5` looks 10px wide.

## Text

The text under the spinner can be one message, several messages, or nothing:

```javascript
Loader.start("Fetching data");                     // one message (default: "Loading...")
Loader.start({ text: ["Loading...", "Almost there", "Just a moment"] });   // take turns every 2 s
Loader.start({ text: ["Uploading", "Processing"], textInterval: 3000 }); // every 3 s
Loader.start({ text: false });                     // no text: "", false or null
```

Change it while the loader is showing with `Loader.update`, which takes the same values:

```javascript
Loader.update("Uploading... 45%");         // show text
Loader.update(["Saving", "Still saving"]); // switch to changing messages
Loader.update(false);                      // hide the text
Loader.update();                           // back to "Loading..."
```

With no text, screen readers still hear "Loading".

## Background

| `background` | Looks like |
|---|---|
| `dark` | Solid dark grey (default) |
| `light` | Solid near-white, with dark text |
| `dim` | See-through black. The page shows through, darkened. |
| `blur` | See-through, and blurs the page behind it |
| `transparent` | No background. Only the spinner and text, in the page's own text color. |
| any CSS color | e.g. `"#4c1d95"`, `"rgb(0 0 0 / 0.3)"`, `"white"` |

```javascript
Loader.start({ background: "blur" });
Loader.start({ background: "light", variant: "arc" });
Loader.start({ background: "rgba(76, 29, 149, 0.9)" });
```

**Automatic text color:** with a custom color, the text color is chosen for you. Light backgrounds (`"white"`, `"gold"`, `"#fecaca"`...) get dark text, and the faint track ring turns dark too. Dark backgrounds keep the light text. Any CSS color format works. This also applies to `loadingOverlayStyles.backgroundColor`, which wins over `background`. Mostly see-through colors (under 50% opacity) keep the light text, because the page behind decides how they look. Set `textColor` to choose the color yourself.

## Speed

```javascript
Loader.start({ speed: "slow" });   // half speed
Loader.start({ speed: "fast" });   // twice as fast
Loader.start({ speed: 1.5 });      // any multiplier
```

It works for every variant. An invalid speed (0, negative, an unknown name) logs a warning and uses normal speed.

## Changing the look while it's showing

`Loader.setStyle` changes an open loader in place, without closing it:

| Can change | |
|---|---|
| Colors | `color`, `secondaryColor`, `trackColor`, `textColor` |
| Sizes | `size`, `thickness`, `textSize` |
| Look | `variant`, `speed`, `background`, `zIndex`, `progress`, `preset` |

```javascript
Loader.start({ variant: "ring", color: "#3b82f6" }, "Uploading");

Loader.setStyle({ color: "#ef4444", speed: "slow" }); // e.g. when something goes wrong
Loader.update("Retrying...");
Loader.setStyle({ variant: "pulse" });                // switch variant
Loader.setStyle({ color: null, speed: null });        // null resets to the default
Loader.setStyle({ color: "orange" }, "#chart");       // a loader inside an element
```

- Only the options you pass change. The text stays; change it with `Loader.update`.
- A new `background` works out the [automatic text color](#background) again.
- If the loader is still waiting out its `delay`, the new look is used when it appears.
- Options it can't change (such as `target` or `delay`) log a warning and are ignored.

## Progress

For uploads and other work with a known size, show a bar and a percentage under the text:

```javascript
Loader.start("Uploading", { progress: 0 });
upload.onprogress = (e) => Loader.progress((e.loaded / e.total) * 100);
upload.onload = () => Loader.close();
```

Values are clamped to 0 to 100. `Loader.progress(null)` hides the bar. Screen readers get it as a `progressbar`. The bar uses `color` and `trackColor`, and `--circle-loader-progress` holds the value for your own CSS.

## Smaller bundles: import only what you need

`import { Loader } from "circle-loader"` includes all 50 variants (about 10 KB gzipped). Most apps use one or two. Import the core and only the variants you use, and your bundler (Vite, webpack, Rollup, esbuild, Next.js, Nuxt...) leaves the rest out:

```javascript
import { Loader } from "circle-loader/core";       // the Loader and the default circle variant
import { dots, arc } from "circle-loader/variants"; // only these two are bundled

Loader.start({ variant: dots });   // pass the variant itself...
Loader.register(arc);              // ...or register it once,
Loader.start({ variant: "arc" });  // then use it by name anywhere
```

| You import | Bundle size (minified, gzipped, measured with Rollup) |
|---|---|
| `circle-loader` (everything) | 9.3 KB |
| `circle-loader/core` only | 4.3 KB |
| core + `dots` | 4.6 KB |
| core + `dots`, `arc`, `ring` | 4.9 KB |

- Each variant is its own export, with its CSS inside it. Variants you don't import are dropped, CSS included.
- **CSS is added on first use, not on import:** the core CSS when the first loader shows, and each variant's CSS when that variant first shows. Importing never changes the page.
- With `circle-loader/core`, a variant name that isn't registered logs a warning and falls back to `circle`.
- `circle-loader`, `circle-loader/core` and `circle-loader/variants` all share one `Loader`, so mixing them is fine.
- `allVariants` from `circle-loader/variants` lists every built-in variant, but importing it keeps them all in your bundle.

### Your own variants

A variant is a plain object, so you can make your own:

```javascript
import { Loader } from "circle-loader/core";

const heartbeat = {
	name: "heartbeat",        // class: loading-spinner--heartbeat
	css: `
		.loading-spinner.loading-spinner--heartbeat {
			border: none;
			background: var(--circle-loader-color, #3b82f6);
			animation: heartbeat calc(1s / var(--circle-loader-speed, 1)) ease-in-out infinite;
		}
		@keyframes heartbeat { 0%, 100% { transform: scale(0.7); } 50% { transform: scale(1); } }
	`,
	spans: 0,                 // optional: number of empty <span> children
	build: (spinner) => {}    // optional: add other children yourself
};

Loader.start({ variant: heartbeat, color: "crimson", speed: "fast" });
```

Use the `--circle-loader-*` variables in your CSS, as above, and the `color`, `size` and `speed` options work with your variant too.

## Customizing with CSS

### CSS variables

Set these in your own CSS to style every loader in your app. The matching options passed to `start()` or `configure()` win over them.

| Variable | Default | Option |
|---|---|---|
| `--circle-loader-color` | `#3b82f6` | `color` |
| `--circle-loader-secondary-color` | the main color | `secondaryColor` |
| `--circle-loader-track` | faint white | `trackColor` |
| `--circle-loader-size` | `50px` | `size` |
| `--circle-loader-thickness` | per variant | `thickness` |
| `--circle-loader-speed` | `1` | `speed` |
| `--circle-loader-text-color` | `#f9f9f9` | `textColor` |
| `--circle-loader-text-size` | `18px` | `textSize` |
| `--circle-loader-z-index` | `1000` (`10` in a target) | `zIndex` |

```css
.loading-overlay {
	--circle-loader-color: hotpink;
	--circle-loader-size: 64px;
}

/* only for the loader inside one element */
#users-table .loading-overlay { --circle-loader-color: orange; }
```

### Classes

| Class | Element |
|---|---|
| `.loading-overlay` | The overlay. `.loading-overlay--scoped` when inside a `target`, `.loading-overlay--light` etc. for backgrounds. |
| `.loading-spinner` and `.loading-spinner--<variant>` | The spinner, e.g. `.loading-spinner--arc` |
| `.loading-text` | The text |

Moving parts you can target:

| Variant | Parts |
|---|---|
| `dots`, `spokes`, `chase`, `gyro`, `rings`, `planets`, `target`, `flower`, `wave`, `atom`, `quarters`, `globe`, `swap`, `tunnel`, `typing`, `fizz` | `<span>` children: `.loading-spinner--dots > span` (the `atom` orbits are `span::before`) |
| `arc` | SVG circle: `.loading-spinner--arc circle` |
| `dual`, `ripple`, `bounce`, `fill`, `radar`, `eclipse`, `globe`, `ball`, `wheel`, `gear`, `split`, `water`, `eye`, `sun` | `::before` (and `::after` for ripple, bounce, split and water) |
| `clock` | Long hand `::before`, short hand `::after` |
| `orbit`, `pendulum` | The dot is `::after` |
| Others | The spinner element itself |

```css
.loading-spinner--arc circle { stroke-width: 8; }                    /* thicker arc */
.loading-spinner--dots > span { border-radius: 2px; }                /* square dots */
.loading-spinner.loading-spinner--ring { animation-duration: 2s; }   /* one variant slower */
```

The package's CSS is added at the top of `<head>`, so your rule wins when its selector is at least as specific as the package's. For the spinner element itself, use the doubled selector `.loading-spinner.loading-spinner--<variant>`.

### Style objects

For one-off inline styles, pass `loadingOverlayStyles`, `loadingSpinnerStyles` and `loadingTextStyles`. Keys are camelCase CSS properties or CSS variables, applied with `!important`:

```javascript
Loader.start({
	loadingOverlayStyles: { backgroundColor: "rgba(0, 128, 0, 0.8)" },
	loadingTextStyles: { color: "lightgreen", fontWeight: "bold" },
	loadingSpinnerStyles: { borderRadius: "5%" }
});
```

With `configure()`, these merge key by key, so a call can add one style without dropping the defaults. For variants other than `circle`, setting `border`, `background` or `animation` in `loadingSpinnerStyles` replaces the variant's own look; use the style options (`color`, `size`, `thickness`...) instead. Custom animations need your own `@keyframes`. The built-in spinner animation is called `spin`.

## Frameworks

Importing the package on the server is safe. Nothing touches the page until you call a method in the browser, and every method does nothing on the server. The package ships an ES module (`.mjs`) and a CommonJS build, so it loads on any Node version.

**The rule: call `Loader` from the browser,** in event handlers or after the component has mounted. Angular, Svelte and plain JavaScript work the same way as the examples below.

### React and Next.js

In Next.js (App Router), use it in a Client Component:

```jsx
"use client";
import { Loader } from "circle-loader";

export default function SaveButton() {
	const save = () => Loader.wrap(fetch("/api/save", { method: "POST" }), "Saving");
	return <button onClick={save}>Save</button>;
}
```

To show the loader while a component is on screen, start it in `useEffect` and close it in the cleanup. React's Strict Mode runs effects twice in development, and the cleanup keeps the count balanced:

```jsx
useEffect(() => {
	Loader.start({ target: "#chart" });
	return () => Loader.close("#chart");
}, []);
```

### Vue and Nuxt

Use it in event handlers or `onMounted`:

```vue
<script setup>
import { Loader } from "circle-loader";

const save = () => Loader.wrap($fetch("/api/save", { method: "POST" }), "Saving");
</script>

<template>
	<button @click="save">Save</button>
</template>
```

**Don't call `Loader.start()` at the top level of `<script setup>`.** That code runs on the server and again in the browser, so the loader opens in the browser with nothing to close it.

To show it on every page change in Nuxt, add a client-only plugin, `plugins/loader.client.js`:

```javascript
import { Loader } from "circle-loader";

export default defineNuxtPlugin((nuxtApp) => {
	let pageLoading = false;

	nuxtApp.hook("page:start", () => {
		if (pageLoading) return;
		pageLoading = true;
		Loader.start({ delay: 150 });
	});

	nuxtApp.hook("page:finish", () => {
		if (!pageLoading) return;
		pageLoading = false;
		Loader.close();
	});
});
```

`delay: 150` skips the loader on fast page changes. The `pageLoading` flag makes the plugin close only the loader it opened: Nuxt fires `page:finish` on the first page load without a `page:start`.

## The `<circle-loader>` element

For declarative use, import `circle-loader/element` (or load `circle-loader.element.min.js`). It defines a `<circle-loader>` element with every variant. While it has `active`, it covers its parent element; with `fullscreen`, the whole page. Removing `active` or removing the element closes it.

```html
<div class="card">
	<circle-loader active variant="dots" text="Saving..." progress="40"></circle-loader>
	...
</div>
```

Attributes: `active`, `fullscreen`, `text`, `variant`, `background`, `speed`, `color`, `secondary-color`, `track-color`, `text-color`, `size`, `thickness`, `text-size`, `z-index`, `progress`, `block-input`, `preset`, `text-interval`, `delay`, `min-duration`, `nonce`. Changing one on an open loader updates it. `active="false"` counts as off, so frameworks can bind booleans directly:

```jsx
// React (import "circle-loader/element" once, in the browser)
<div className="card">
	<circle-loader active={saving ? "true" : "false"} text="Saving" />
</div>
```

```vue
<!-- Vue: tell the compiler it's a custom element (compilerOptions.isCustomElement) -->
<div class="card">
	<circle-loader :active="saving" text="Saving" />
</div>
```

Importing it on the server defines nothing, so it's safe with SSR. `defineElement("my-loader")` defines it under another name.

## Accessibility

The loader has `role="status"` and `aria-live="polite"`, so screen readers announce the text. With no text, they hear "Loading". A `target` element gets `aria-busy="true"` while loading. Animations slow down for users who prefer reduced motion.

While a loader is shown, the content it covers is made `inert` (the rest of the page for a fullscreen loader, the target's content for a scoped one), so Tab and screen readers can't reach what's behind it. Focus goes back to where it was when it closes. Elements your page already made `inert` are left alone. Turn it off with `blockInput: false`.

## Content-Security-Policy

The package adds its CSS in `<style>` tags. With a `style-src` policy that has no `'unsafe-inline'`, pass your nonce:

```javascript
Loader.configure({ nonce: "your-page-nonce" });
```

Without the option, it uses the nonce of a `<script nonce>` (or `<style nonce>`) already on the page. The options it sets on elements use the CSSOM (`style.setProperty`), which a CSP doesn't block.

## Development

```bash
npm install
npm test            # builds, then runs the tests (Node's test runner + jsdom)
npm run build       # builds dist/ and the types
npm run demo        # builds and serves the playground at http://localhost:5173/demo/
npm run docs:svgs   # regenerates the variant previews in docs/variants/
```

The source is in `src/`: `core.js` (the Loader), `variants.js` (one export per variant), `element.js` (the `<circle-loader>` element) and `styles/` (core CSS plus one file per variant). Types are in `types/`. The playground is `demo/index.html`, a single file with no build step.

## Author

**Majid Ali**, Full Stack Web Developer (Vue.js, Nuxt.js, React, TypeScript, Python/FastAPI), Islamabad, Pakistan.

- Portfolio: [majidev.netlify.app](https://majidev.netlify.app)
- GitHub: [@Majid-Ali-Watto](https://github.com/Majid-Ali-Watto)
- LinkedIn: [majid-ali-074b97245](https://www.linkedin.com/in/majid-ali-074b97245/)
- Email: [majidaliqau@gmail.com](mailto:majidaliqau@gmail.com)
- Freelance: [Upwork](https://www.upwork.com/freelancers/~018c214d3139f0f30e)

Found a bug or have an idea? [Open an issue](https://github.com/Majid-Ali-Watto/Loaders/issues).

## License

ISC
