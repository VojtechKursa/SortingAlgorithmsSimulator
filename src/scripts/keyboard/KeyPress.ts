import { KeyBind } from "./KeyBind";

export class KeyPress {
	private readonly matchingKeyBindsCache: KeyBind[];

	public readonly key?: KeyBind;
	public readonly code?: KeyBind;

	public constructor(
		key?: string,
		code?: string,
	) {
		this.matchingKeyBindsCache = [];

		if (key != undefined) {
			this.key = new KeyBind(key);
			this.matchingKeyBindsCache.push(this.key);
		}

		if (code != undefined) {
			this.code = new KeyBind(code);
			this.matchingKeyBindsCache.push(this.code);
		}
	}

	public get matchingKeyBinds(): readonly KeyBind[] {
		return this.matchingKeyBindsCache;
	}

	public static fromEvent(event: KeyboardEvent): KeyPress {
		return new KeyPress(event.key, event.code);
	}
}