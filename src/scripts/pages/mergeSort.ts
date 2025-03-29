import { MergeSort } from "../sorts/MergeSort";
import { SvgMultiArrayRenderer } from "../visualization/rendering/svg/SvgMultiArrayRenderer";
import { getCurrentColorMap, getDefaultRenderers, initSimulator } from "./simulator";

document.addEventListener("DOMContentLoaded", () => {
	const colors = getCurrentColorMap();

	const defaultRenderers = getDefaultRenderers(colors);
	const renderers: SvgMultiArrayRenderer[] = [];

	for (const renderer of defaultRenderers) {
		renderers.push(new SvgMultiArrayRenderer(renderer))
	}

	initSimulator(new MergeSort([]), undefined, renderers)
});
