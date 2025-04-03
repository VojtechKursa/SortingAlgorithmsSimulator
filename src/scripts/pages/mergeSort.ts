import { MergeSort } from "../sorts/MergeSort";
import { SvgMainAndSubArraysRenderer } from "../visualization/rendering/svg/SvgMainAndSubArraysRenderer";
import { getCurrentColorMap, getDefaultRenderers, initSimulator } from "./simulator";

document.addEventListener("DOMContentLoaded", () => {
	const colors = getCurrentColorMap();

	const defaultRenderers = getDefaultRenderers(colors, 2);
	const renderers: SvgMainAndSubArraysRenderer[] = [];

	for (const renderer of defaultRenderers) {
		renderers.push(new SvgMainAndSubArraysRenderer(renderer));
	}

	initSimulator(new MergeSort([]), undefined, renderers)
});
