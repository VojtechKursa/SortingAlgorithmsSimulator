import { DarkModeHandler } from "../controllers/DarkModeHandler";

export class InitCommonResult {
	public constructor(
		public readonly darkModeHandler: DarkModeHandler
	) { }
}

export function initCommon(): InitCommonResult {
	let darkModeButton = document.getElementById("dark_mode-toggle") as HTMLButtonElement;
	let darkModeHandler = new DarkModeHandler(darkModeButton);

	return new InitCommonResult(darkModeHandler);
}

// TODO: Implement settings