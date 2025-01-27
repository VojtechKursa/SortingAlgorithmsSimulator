import { InterfaceAction, InterfaceActionData } from "./InterfaceAction";
import { KeyBind, KeyBindType } from "./KeyBind";
import { KeyPress } from "./KeyPress";

export class KeyboardSettings {
	public static readonly localStorageKey = "keyboardSettings";

	private readonly hotkeys: Map<KeyBindType, Map<string, InterfaceAction>>;

	public constructor(initialHotkeys?: Iterable<readonly [KeyBind, InterfaceAction]>) {
		this.hotkeys = new Map();

		if (initialHotkeys != undefined) {
			for (const hotkey of initialHotkeys) {
				this.setBind(hotkey[0], hotkey[1], true);
			}
		}
	}

	public getAction(pressedKey: KeyPress): InterfaceAction | undefined {
		for (const keyBind of pressedKey.matchingKeyBinds) {
			const result = this.hotkeys.get(keyBind.type)?.get(keyBind.normalizedTrigger);
			if (result != undefined) {
				return result;
			}
		}
	}

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

	public clear(): void {
		this.hotkeys.clear()
	}

	public serialize(): string {
		let array: [string, InterfaceAction][] = [];

		for (const [_, bindMap] of this.hotkeys) {
			for (const [normalizedTrigger, action] of bindMap) {
				array.push([normalizedTrigger, action]);
			}
		}

		return JSON.stringify(array);
	}

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

	public save(): void {
		localStorage.setItem(KeyboardSettings.localStorageKey, this.serialize());
	}

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