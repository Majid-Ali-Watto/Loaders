// Removes dist/ before a build, so files from older builds are never published.
const fs = require("fs");
const path = require("path");
fs.rmSync(path.join(__dirname, "..", "dist"), { recursive: true, force: true });
