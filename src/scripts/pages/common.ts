import { DarkModeHandler } from "../controllers/DarkModeHandler";

export class InitCommonResult {
	public constructor(
		public readonly darkModeHandler: DarkModeHandler
	) { }
}

let initResult: InitCommonResult | undefined = undefined;

export function initCommon(): InitCommonResult {
	if (initResult == undefined) {
		let darkModeButton = document.getElementById("dark_mode-toggle") as HTMLButtonElement;
		let darkModeHandler = new DarkModeHandler(darkModeButton);
		initResult = new InitCommonResult(darkModeHandler);
	}

	return initResult;
}

// TODO: Implement settings