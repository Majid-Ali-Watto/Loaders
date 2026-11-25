// Serves the demo page and the built files from the project root.
// Usage: npm run demo  (builds first, then open the printed address)
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const allowed = ["demo", "dist"]; // only these folders are served
const types = {
	".html": "text/html; charset=utf-8",
	".js": "text/javascript; charset=utf-8",
	".map": "application/json; charset=utf-8",
	".css": "text/css; charset=utf-8"
};

const server = http.createServer((req, res) => {
	let url;
	try {
		url = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
	} catch {
		res.writeHead(400, { "Content-Type": "text/plain" });
		return res.end("Bad request"); // a malformed %-escape, which would otherwise crash the server
	}
	if (url === "/" || url === "/demo") {
		res.writeHead(302, { Location: "/demo/" });
		return res.end();
	}
	let file = path.normalize(path.join(root, url));
	if (url.endsWith("/")) file = path.join(file, "index.html");
	const insideAllowed = allowed.some((dir) => file.startsWith(path.join(root, dir) + path.sep));
	if (!insideAllowed || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
		res.writeHead(404, { "Content-Type": "text/plain" });
		return res.end("Not found");
	}
	res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
	fs.createReadStream(file).pipe(res);
});

function listen(port) {
	server.once("error", (err) => {
		if (err.code === "EADDRINUSE" && port < 5200) listen(port + 1);
		else throw err;
	});
	server.listen(port, "127.0.0.1", () => console.log(`Demo running at http://localhost:${port}/demo/  (Ctrl+C to stop)`));
}

listen(Number(process.env.PORT) || 5173);
