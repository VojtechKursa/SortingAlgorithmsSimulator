import { InsertionSort } from "../sorts/InsertionSort";
import { getDefaultMainAndSubRenderers } from "./complexSimulator";
import { getCurrentColorMap, initSimulator } from "./simulator";

document.addEventListener("DOMContentLoaded", () => {
	const colors = getCurrentColorMap();

	const renderers = getDefaultMainAndSubRenderers(colors);

	initSimulator(new InsertionSort([]), undefined, renderers)
});
