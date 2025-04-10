export class ButtonFactory {
	public static makeButtonWithIcon(icon: string, classes?: readonly string[], button?: true): HTMLButtonElement;
	public static makeButtonWithIcon(icon: string, classes: readonly string[] | undefined, button: false): HTMLAnchorElement;
	public static makeButtonWithIcon(icon: string, classes: readonly string[] | undefined = undefined, button: boolean = true): HTMLButtonElement | HTMLAnchorElement {
		const result = document.createElement(button ? "button" : "a");
		if (classes != undefined) {
			result.classList.add(...classes);
		}

		const i = document.createElement("i");
		i.classList.add("bi", `bi-${icon}`);
		result.appendChild(i);

		return result;
	}
}