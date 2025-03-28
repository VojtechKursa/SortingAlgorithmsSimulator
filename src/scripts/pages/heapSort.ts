import { HeapSort } from "../sorts/HeapSort";
import { SvgArrayBoxRenderer } from "../visualization/rendering/svg/SvgArrayBoxRenderer";
import { SvgHeapAndArrayRenderer } from "../visualization/rendering/svg/SvgHeapAndArrayRenderer";
import { getCurrentColorMap, initSimulator } from "./simulator";

document.addEventListener("DOMContentLoaded", () => {
	const colors = getCurrentColorMap();

	const arrayRenderer = new SvgArrayBoxRenderer(colors);
	const heapAndArrayRenderer = new SvgHeapAndArrayRenderer(new SvgArrayBoxRenderer(colors, undefined, undefined, 1));

	initSimulator(new HeapSort([]), heapAndArrayRenderer, [arrayRenderer, heapAndArrayRenderer]);
});