import { SymbolicColor } from "../visualization/colors/SymbolicColor";
import { SymbolicColorHelper } from "../visualization/colors/SymbolicColorHelper";

export class DebuggerController {
	public constructor(
		public readonly debuggerElement: HTMLDivElement
	) { }

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

	public addHighlightedLines(lines: Map<number, SymbolicColor>): void {
		const highlightClass = SymbolicColorHelper.getCssClass(SymbolicColor.Code_ActiveLine);
		const debuggerLines = this.debuggerElement.children;

		lines.forEach((_, lineIndex) => debuggerLines[lineIndex].classList.add(highlightClass));
	}

	public clearHighlights(): void {
		const highlightClass = SymbolicColorHelper.getCssClass(SymbolicColor.Code_ActiveLine);
		
		this.debuggerElement.querySelectorAll(`.${highlightClass}`).forEach(element => element.classList.remove(highlightClass));
	}

	public setHighlightedLines(lines: Map<number, SymbolicColor>): void {
		this.clearHighlights();
		this.addHighlightedLines(lines);
	}
}