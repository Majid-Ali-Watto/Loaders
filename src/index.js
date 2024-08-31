import "./index.css";
class Loader {
	static start(...style) {
		let css = new Map();
		style.length > 2 ? (style.length = 2) : style.length;
		const loadingText = typeof style?.[0] == "string" ? style?.[0] : typeof style?.[1] == "string" ? style?.[1] : "Loading...";
		style = typeof style?.[0] == "object" ? style?.[0] : typeof style?.[1] == "object" ? style?.[1] : null;

		for (let key in style) {
			let cssProps = "";
			for (let prop in style[key]) {
				const cssProp = prop?.replace(/([A-Z])/g, "-$1")?.toLowerCase(); // Convert camelCase to kebab-case
				cssProps += `${cssProp}: ${style[key][prop]} !important;`;
			}
			if (!css.has(key)) {
				css.set(key, cssProps);
			}
		}

		if (!document.querySelector(".loading-overlay")) {
			const loaderContainer = document.createElement("div");
			loaderContainer.innerHTML = `
			<div class="loading-overlay" style="${css.get("loadingOverlayStyles")}">
			<div class="loading-spinner" style="${css.get("loadingSpinnerStyles")};"></div>
			<p style="${css.get("loadingTextStyles")}">${loadingText}</p>
			</div>`;
			document.body.appendChild(loaderContainer);
		}
	}

	static close() {
		const loader = document.querySelector(".loading-overlay");
		if (loader) {
			loader.remove();
		}
	}
}

export { Loader };
