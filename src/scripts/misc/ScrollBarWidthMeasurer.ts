/**
 * Class for measuring the width of the page's scroll bar. Uses an invisible element inserted into the page.
 */
export class ScrollBarWidthMeasurer {
	private readonly measuringElement: HTMLDivElement;
	private elementInPage: boolean;

	private _keepMeasuringElementInPage: boolean;

	/**
	 * Whether to keep the element used to measure the scroll bar width in the page after measurement.
	 * If set to false, the element will be added into the page, measurement will be done and the element will be removed again.
	 * If set to true, the element will be kept in the page.
	 */
	public get keepMeasuringElementInPage(): boolean {
		return this._keepMeasuringElementInPage;
	}
	public set keepMeasuringElementInPage(value: boolean) {
		if (this.keepMeasuringElementInPage != value) {
			this._keepMeasuringElementInPage = value;

			if (value) {
				this.addElementIntoPage();
			} else {
				this.removeElementFromPage();
			}
		}
	}

	/**
	 * @param keepMeasuringElementInPage The initial value of the {@link ScrollBarWidthMeasurer.keepMeasuringElementInPage} property.
	 */
	public constructor(
		keepMeasuringElementInPage: boolean = false
	) {
		this._keepMeasuringElementInPage = keepMeasuringElementInPage;
		this.elementInPage = false;

		this.measuringElement = document.createElement("div");
		this.measuringElement.style.display = "block";
		this.measuringElement.style.width = "100%";
		this.measuringElement.style.height = "0px";

		this.measuringElement.style.marginRight = "calc(100vw - 100%)";

		this.keepMeasuringElementInPage = keepMeasuringElementInPage;
	}

	/**
	 * Retrieves the current width of the webpage's scrollbar.
	 *
	 * @returns The current width of the webpage's scrollbar.
	 */
	public get scrollBarWidth(): number {
		if (!this.elementInPage) {
			this.addElementIntoPage();
		}

		const result = Math.max(0, Number.parseFloat(getComputedStyle(this.measuringElement).marginRight));

		if (!this.keepMeasuringElementInPage) {
			this.removeElementFromPage();
		}

		return result;
	}

	private addElementIntoPage(): void {
		if (!this.elementInPage) {
			document.body.appendChild(this.measuringElement);
			this.elementInPage = true;
		}
	}

	private removeElementFromPage(): void {
		if (this.elementInPage) {
			document.body.removeChild(this.measuringElement);
			this.elementInPage = false;
		}
	}
}