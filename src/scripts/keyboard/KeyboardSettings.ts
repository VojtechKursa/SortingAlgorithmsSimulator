import { InterfaceAction, InterfaceActionData } from "./InterfaceAction";
import { KeyBind, KeyBindType } from "./KeyBind";
import { KeyPress } from "./KeyPress";

/**
 * A class representing keyboard settings of an application.
 */
export class KeyboardSettings {
	/**
	 * The key under which the keyboard settings should be stored in the local storage.
	 */
	public static readonly localStorageKey = "keyboardSettings";

	/**
	 * A map containing all hotkeys and their mapping to InterfaceActions,
	 * grouped by KeyBindType and resolved by a normalized trigger of a KeyBind.
	 *
	 * @see {@link KeyBind}
	 * @see {@link KeyBindType}
	 * @see {@link InterfaceAction}
	 */
	private readonly hotkeys: Map<KeyBindType, Map<string, InterfaceAction>>;

	/**
	 * @param initialHotkeys - Initial keyboard settings.
	 */
	public constructor(initialHotkeys?: Iterable<readonly [KeyBind, InterfaceAction]>) {
		this.hotkeys = new Map();

		if (initialHotkeys != undefined) {
			for (const hotkey of initialHotkeys) {
				this.setBind(hotkey[0], hotkey[1], true);
			}
		}
	}

	/**
	 * Returns the action associated with the given KeyPress.
	 *
	 * @param pressedKey - The pressed key.
	 * @returns The action associated with the given pressed key, if any.
	 */
	public getAction(pressedKey: KeyPress): InterfaceAction | undefined {
		for (const keyBind of pressedKey.matchingKeyBinds) {
			const result = this.hotkeys.get(keyBind.type)?.get(keyBind.normalizedTrigger);
			if (result != undefined) {
				return result;
			}
		}
	}

	/**
	 * Adds a key bind to the keyboard settings.
	 * (Sets the action associated with the given key bind.)
	 *
	 * @param keyBind The key bind to add.
	 * @param action The action to associate with the key bind.
	 * @param overwrite Whether to overwrite any existing action associated with the key bind.
	 *
	 * @returns True if the key bind was added successfully, false if the key bind already exists and overwrite is false.
	 *
	 * @see {@link KeyBind}
	 * @see {@link InterfaceAction}
	 */
	public setBind(keyBind: KeyBind, action: InterfaceAction, overwrite: boolean): boolean {
		const selectedMap = this.hotkeys.get(keyBind.type);

		if (selectedMap == undefined) {
			this.hotkeys.set(keyBind.type, new Map([[keyBind.normalizedTrigger, action]]));
		} else {
			if (selectedMap.get(keyBind.normalizedTrigger) != undefined && !overwrite) {
				return false;
			}

			selectedMap.set(keyBind.normalizedTrigger, action);
		}

		return true;
	}

	/**
	 * Clears all key binds from the keyboard settings.
	 */
	public clear(): void {
		this.hotkeys.clear()
	}

	/**
	 * Serializes the keyboard settings into a JSON string.
	 *
	 * @returns The serialized keyboard settings in a JSON format.
	 */
	public serialize(): string {
		let array: [string, InterfaceAction][] = [];

		for (const [_, bindMap] of this.hotkeys) {
			for (const [normalizedTrigger, action] of bindMap) {
				array.push([normalizedTrigger, action]);
			}
		}

		return JSON.stringify(array);
	}

	/**
	 * Deserializes the keyboard settings from a JSON string.
	 *
	 * @param json - The JSON string to deserialize.
	 * @returns The deserialized keyboard settings, or null if the JSON string is invalid.
	 */
	public static deserialize(json: string): KeyboardSettings | null {
		const parsed = JSON.parse(json);
		if (!Array.isArray(parsed)) {
			return null;
		}

		const hotkeys: [KeyBind, InterfaceAction][] = [];

		for (const arrayItem of parsed) {
			if (!Array.isArray(arrayItem) || arrayItem.length != 2) {
				continue;
			}

			const trigger = arrayItem[0];
			const action = InterfaceActionData.fromString(arrayItem[1]);

			if (typeof trigger !== "string" || action == undefined) {
				continue;
			}

			hotkeys.push([new KeyBind(trigger), action.action]);
		}

		return new KeyboardSettings(hotkeys);
	}

	/**
	 * Saves the keyboard settings to the local storage under the specified localStorageKey.
	 */
	public save(): void {
		localStorage.setItem(KeyboardSettings.localStorageKey, this.serialize());
	}

	/**
	 * Loads the keyboard settings from the local storage, from the specified localStorageKey.
	 *
	 * @param saveAfterLoad - Whether to save the settings after loading. Defaults to false.
	 * 							Use this to remove any inconsistencies from the saved data or save the initial keyboard settings.
	 *
	 * @returns The loaded keyboard settings, or a default set of keyboard settings if:
	 * 	- The local storage does not contain any settings
	 * 	- The data in the local storage are invalid (deserialization failed).
	 */
	public static load(saveAfterLoad: boolean = false): KeyboardSettings {
		const localStorageData = localStorage.getItem(KeyboardSettings.localStorageKey);

		let result: KeyboardSettings | undefined = undefined;

		if (localStorageData != null) {
			const deserialized = KeyboardSettings.deserialize(localStorageData);

			if (deserialized != null && deserialized.hotkeys.size > 0) {
				result = deserialized;
			}
		}

		if (result == undefined) {
			result = KeyboardSettings.getDefault();
		}

		if (saveAfterLoad) {
			result.save();
		}

		return result;
	}

	/**
	 * Returns the default set of keyboard settings.
	 *
	 * @returns The default set of keyboard settings.
	 */
	public static getDefault(): KeyboardSettings {
		return new KeyboardSettings([
			[new KeyBind("D"), InterfaceAction.Forward],
			[new KeyBind("A"), InterfaceAction.Backward],
			[new KeyBind("E"), InterfaceAction.Select_Next],
			[new KeyBind("Q"), InterfaceAction.Select_Previous],
			[new KeyBind(" "), InterfaceAction.PlayPause],
			[new KeyBind("Digit1"), InterfaceAction.Select_Code],
			[new KeyBind("Digit2"), InterfaceAction.Select_Sub],
			[new KeyBind("Digit3"), InterfaceAction.Select_Full],
		]);
	}
}