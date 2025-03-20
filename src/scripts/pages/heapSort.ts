import { HeapSort } from "../sorts/HeapSort";
import { SvgArrayBoxRenderer } from "../visualization/rendering/svg/SvgArrayBoxRenderer";
import { SvgHeapAndArrayRenderer } from "../visualization/rendering/svg/SvgHeapAndArrayRenderer";
import { getCurrentColorMap, initSimulator } from "./simulator";

document.addEventListener("DOMContentLoaded", () => {
	const colors = getCurrentColorMap();

	const arrayRenderer = new SvgArrayBoxRenderer(colors);
	const heapAndArrayRenderer = new SvgHeapAndArrayRenderer(colors);

	initSimulator(new HeapSort([]), heapAndArrayRenderer, [arrayRenderer, heapAndArrayRenderer]);
});