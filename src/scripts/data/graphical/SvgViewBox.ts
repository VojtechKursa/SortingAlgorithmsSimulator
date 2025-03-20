export class SvgViewBox {
	public startX: number = 0;
	public endX: number = 0;

	public startY: number = 0;
	public endY: number = 0;

	public get width(): number {
		return this.endX - this.startX;
	}
	public set width(value: number) {
		this.endX = this.startX + value;
	}

	public get height(): number {
		return this.endY - this.startY;
	}
	public set height(value: number) {
		this.endY = this.startY + value;
	}

	private _acceptedViewBox: boolean = false;
	protected set acceptedViewBox(value: boolean) {
		this._acceptedViewBox = value;
	}
	public get acceptedViewBox(): boolean {
		return this._acceptedViewBox;
	}

	public acceptViewBox(viewBox: SVGRect): void {
		this.startX = viewBox.x;
		this.startY = viewBox.y;
		this.width = viewBox.width;
		this.height = viewBox.height;

		this.acceptedViewBox = true;
	}

	public static fromViewBox(viewBox: SVGRect | SVGAnimatedRect): SvgViewBox {
		if (viewBox instanceof SVGAnimatedRect)
			viewBox = viewBox.baseVal;

		const result = new SvgViewBox();
		result.acceptViewBox(viewBox);
		return result;
	}

	public toString(): string {
		return `${this.startX} ${this.startY} ${this.width} ${this.height}`;
	}
}