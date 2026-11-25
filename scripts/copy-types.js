// ESM builds (.mjs) need ESM types (.d.mts) for TypeScript's node16/nodenext/bundler modes.
// Each types/*.d.ts is the source; this writes a .d.mts copy whose relative imports point at the .mjs side.
const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "..", "types");
for (const file of fs.readdirSync(dir)) {
	if (!file.endsWith(".d.ts")) continue;
	const source = fs.readFileSync(path.join(dir, file), "utf8");
	const esm = source.replace(/(from\s+["']\.\/[\w-]+)\.js(["'])/g, "$1.mjs$2");
	fs.writeFileSync(path.join(dir, file.replace(/\.d\.ts$/, ".d.mts")), esm);
}
