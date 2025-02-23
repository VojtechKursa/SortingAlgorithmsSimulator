import { SymbolicColor } from "../visualization/colors/SymbolicColor";
import { SymbolicColorHelper } from "../visualization/colors/SymbolicColorHelper";

/**
 * Controller class for managing and displaying the debugger in the simulator UI.
*/
export class DebuggerController {
	/**
	 * Constructs a new DebuggerController.
	 * @param debuggerElement - The div element into which the debugger's code lines will be displayed.
	 */
	public constructor(
		public readonly debuggerElement: HTMLDivElement
	) { }

	/**
	 * Sets the code lines to display in the debugger.
	 * @param lines - The lines of code to display in the debugger. Null to remove all lines.
	 */
	public setCode(lines: string[] | null): void {
		this.debuggerElement.textContent = "";

		if (lines == null)
			return;

		lines.forEach((codeLine, lineNum) => {
			let line = document.createElement("div");
			line.classList.add("code-line");

			let header = document.createElement("div");
			header.classList.add("code-header");
			header.textContent = (lineNum + 1).toString();

			let text = document.createElement("div");
			text.classList.add("code-text")
			text.textContent = codeLine.replace(/\t/g, " ".repeat(4));

			line.appendChild(header);
			line.appendChild(text);

			this.debuggerElement.appendChild(line);
		});
	}

	/**
	 * Adds line highlights to the selected lines in the debugger.
	 * @param lines - A map, mapping the line index to highlight to a SymbolicColor that should be used for the highlight.
	 * @see SymbolicColor
	 */
	public addHighlightedLines(lines: ReadonlyMap<number, SymbolicColor>): void {
		const highlightClass = SymbolicColorHelper.getCssClass(SymbolicColor.Code_ActiveLine);
		const debuggerLines = this.debuggerElement.children;

		lines.forEach((_, lineIndex) => debuggerLines[lineIndex].classList.add(highlightClass));
	}

	/**
	 * Clears all line highlights from the debugger.
	 */
	public clearHighlights(): void {
		const highlightClass = SymbolicColorHelper.getCssClass(SymbolicColor.Code_ActiveLine);

		this.debuggerElement.querySelectorAll(`.${highlightClass}`).forEach(element => element.classList.remove(highlightClass));
	}

	/**
	 * Sets the highlighted lines in the debugger.
	 * @param lines - A map, mapping the line index to highlight to a SymbolicColor that should be used for the highlight.
	 * @see SymbolicColor
	 */
	public setHighlightedLines(lines: ReadonlyMap<number, SymbolicColor>): void {
		this.clearHighlights();
		this.addHighlightedLines(lines);
	}
}