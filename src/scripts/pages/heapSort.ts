import { HeapSort } from "../sorts/HeapSort";
import { SvgArrayBoxRenderer } from "../visualization/rendering/svg/SvgArrayBoxRenderer";
import { SvgHeapAndArrayRenderer } from "../visualization/rendering/svg/SvgHeapAndArrayRenderer";
import { getCurrentColorMap, getDefaultRenderers, initSimulator } from "./simulator";

document.addEventListener("DOMContentLoaded", () => {
	const colors = getCurrentColorMap();

	const renderers = getDefaultRenderers(colors);
	const heapAndArrayRenderer = new SvgHeapAndArrayRenderer(new SvgArrayBoxRenderer(colors, 1));

	initSimulator(new HeapSort([]), heapAndArrayRenderer, [heapAndArrayRenderer, ...renderers]);
});