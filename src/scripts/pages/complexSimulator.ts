import { ColorMap } from "../visualization/colors/ColorMap";
import { SvgArrayBoxRenderer } from "../visualization/rendering/svg/SvgArrayBoxRenderer";
import { SvgArrayBarChartRenderer } from "../visualization/rendering/svg/SvgBarChartRenderer";
import { SvgMainAndSubArraysRenderer } from "../visualization/rendering/svg/SvgMainAndSubArraysRenderer";

export function getDefaultMainAndSubRenderers(colorMap: ColorMap, reservedVariableSpace: number | undefined = undefined) : SvgMainAndSubArraysRenderer[] {
	return [
		new SvgMainAndSubArraysRenderer(new SvgArrayBarChartRenderer(colorMap, 50, reservedVariableSpace), new SvgArrayBarChartRenderer(colorMap, 25), undefined, "Bar chart"),
		new SvgMainAndSubArraysRenderer(new SvgArrayBoxRenderer(colorMap, reservedVariableSpace)),
	];
}
