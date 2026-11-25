// Generates an animated SVG preview of each variant into docs/variants/, for the README.
// The SVG wraps the variant's real HTML and CSS in a <foreignObject>, so previews always match the package.
// Usage: npm run docs:svgs  (builds first)
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const outDir = path.join(root, "docs", "variants");
// Comments and extra whitespace removed, to keep each preview small.
const coreCss = fs
	.readFileSync(path.join(root, "src", "styles", "core.css"), "utf8")
	.replace(/\/\*[\s\S]*?\*\//g, "")
	.replace(/\s+/g, " ");
const { allVariants } = require(path.join(root, "dist", "variants.js"));

const SIZE = 96;

// Lays the overlay out as a small rounded tile instead of covering the screen.
const previewCss = `
.loading-overlay { position: static; width: ${SIZE}px; height: ${SIZE}px; border-radius: 16px; }
`;

// Matches what each variant adds to the spinner element at runtime.
function spinnerChildren(variant) {
	if (variant.name === "arc") {
		return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><circle cx="25" cy="25" r="20"/></svg>';
	}
	return "<span></span>".repeat(variant.spans || 0);
}

function svgFor(variant) {
	const css = [coreCss, variant.css, previewCss].join("\n");
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" role="img" aria-label="${variant.name} loader">
	<foreignObject x="0" y="0" width="${SIZE}" height="${SIZE}">
		<div xmlns="http://www.w3.org/1999/xhtml">
			<style><![CDATA[${css}]]></style>
			<div class="loading-overlay">
				<div class="loading-spinner loading-spinner--${variant.name}">${spinnerChildren(variant)}</div>
			</div>
		</div>
	</foreignObject>
</svg>
`;
}

fs.mkdirSync(outDir, { recursive: true });
for (const file of fs.readdirSync(outDir)) {
	if (file.endsWith(".svg")) fs.unlinkSync(path.join(outDir, file)); // drop previews of removed variants
}
for (const variant of allVariants) {
	fs.writeFileSync(path.join(outDir, `${variant.name}.svg`), svgFor(variant));
}
console.log(`Wrote ${allVariants.length} previews to docs/variants/`);
