import { KeyBind } from "./KeyBind";

/**
 * A class representing a key press.
 */
export class KeyPress {
	/**
	 * A cache of all key binds that match this key press event.
	 *
	 * @see KeyBind
	 */
	private readonly matchingKeyBindsCache: KeyBind[];

	/**
	 * The recognized matching KeyBind for this KeyPress matched on the key parameter of the KeyboardEvent.
	 */
	public readonly key?: KeyBind;

	/**
	 * The recognized matching KeyBind for this KeyPress matched on the code parameter of the KeyboardEvent.
	 */
	public readonly code?: KeyBind;

	/**
	 * Creates an instance of KeyPress.
	 *
	 * @param key - The key parameter of the KeyPress event.
	 * @param code - The code parameter of the KeyPress event.
	 */
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

	/**
	 * The key binds that match this key press event.
	 */
	public get matchingKeyBinds(): readonly KeyBind[] {
		return this.matchingKeyBindsCache;
	}

	/**
	 * Creates a KeyPress instance from a KeyboardEvent.
	 *
	 * @param event - The KeyboardEvent to create the KeyPress instance from.
	 * @returns The KeyPress instance created based on the KeyboardEvent.
	 */
	public static fromEvent(event: KeyboardEvent): KeyPress {
		return new KeyPress(event.key, event.code);
	}
}