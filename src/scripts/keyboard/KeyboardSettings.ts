import { InterfaceAction } from "./InterfaceAction";
import { KeyBind, KeyBindType } from "./KeyBind";
import { KeyPress } from "./KeyPress";

export class KeyboardSettings {
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