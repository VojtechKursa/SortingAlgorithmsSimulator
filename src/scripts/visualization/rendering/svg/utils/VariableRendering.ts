import { FontProperties } from "./FontProperties";

export class VariableRenderSettings {
	public constructor(
		public readonly chevronWidth: number,
		public readonly chevronHeight: number = chevronWidth / 2,
		public readonly chevronMargin: number = chevronHeight / 2,
		public readonly chevronStrokeWidth: number = 0.5,
		public readonly textFont: FontProperties = new FontProperties(2.5, 0.1),
		public readonly textMarginBottom: number = 1,
		public readonly textMarginTop: number = 0,
	) { }
}

export function getOneVariableVerticalSpace(variableSettings: VariableRenderSettings): number {
	return variableSettings.chevronMargin +
		variableSettings.chevronHeight +
		variableSettings.textMarginBottom +
		variableSettings.textFont.fontSize +
		variableSettings.textMarginTop
	;
}