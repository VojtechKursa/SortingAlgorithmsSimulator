import { instance, Viz } from "@viz-js/viz";

export class DotLangInterface {
	public static readonly instanceBuilder = instance().then(val => this._renderer = val);
	private static _renderer: Viz | undefined;

	public static get renderer(): Viz {
		if (this._renderer == undefined)
			throw new Error("Renderer not initialized yet");

		return this._renderer;
	}

	public static async getRenderer(): Promise<Viz> {
		try {
			return this.renderer;
		} catch {
			return await this.instanceBuilder;
		}
	}
}