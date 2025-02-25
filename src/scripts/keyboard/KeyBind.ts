/**
 * An enum representing a type of a key bind. (How the key bind is recognized.)
 */
export const enum KeyBindType {
	Key,
	Code,
}

/**
 * A class representing a key bind.
 */
export class KeyBind {
	/**
	 * The type of the key bind.
	 * @see KeyBindType
	 */
	public readonly type: KeyBindType;

	/**
	 * Creates an instance of KeyBind.
	 *
	 * @param trigger - The key bind.
	 * @param type - The type of the key bind.
	 * 					Defaults to KeyBindType.Key for single-character triggers and KeyBindType.Code for multi-character triggers.
	 */
	public constructor(
		public readonly trigger: string,
		type?: KeyBindType,
	) {
		if (type == undefined) {
			this.type = trigger.length == 1 ? KeyBindType.Key : KeyBindType.Code;
		} else {
			this.type = type;
		}
	}

	/**
	 * Whether the trigger should be converted to uppercase when normalized for case-insensitive comparison.
	 */
	private get shouldTriggerBeUpperCase(): boolean {
		switch (this.type) {
			case KeyBindType.Key: return true;
			case KeyBindType.Code: return false;
		}
	}

	/**
	 * The normalized trigger of the key bind for case-insensitive comparison.
	 */
	public get normalizedTrigger(): string {
		return this.shouldTriggerBeUpperCase ? this.trigger.toUpperCase() : this.trigger;
	}
}