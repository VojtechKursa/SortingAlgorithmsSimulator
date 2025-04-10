import { MergeSort } from "../sorts/MergeSort";
import { getDefaultMainAndSubRenderers } from "./complexSimulator";
import { getCurrentColorMap, initSimulator } from "./simulator";

document.addEventListener("DOMContentLoaded", () => {
	const colors = getCurrentColorMap();

	const renderers = getDefaultMainAndSubRenderers(colors, 2);

	initSimulator(new MergeSort([]), undefined, renderers)
});
