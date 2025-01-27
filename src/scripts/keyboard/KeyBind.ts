export const enum KeyBindType {
	Key,
	Code,
}

export class KeyBind {
	public readonly type: KeyBindType;

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

	private get shouldTriggerBeUpperCase(): boolean {
		switch (this.type) {
			case KeyBindType.Key: return true;
			case KeyBindType.Code: return false;
		}
	}

	public get normalizedTrigger(): string {
		return this.shouldTriggerBeUpperCase ? this.trigger.toUpperCase() : this.trigger;
	}
}