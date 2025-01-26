import { FullStepResult } from "./FullStepResult";
import { StepResult } from "./StepResult";

export const enum StepKind {
	Full,
	Sub,
	Code
}

export class StepKindDescription {
	public constructor(
		public readonly machineName: string,
		public readonly displayName: string
	) { }
}

export class StepKindHelper {
	private static readonly map = new Map<StepKind, StepKindDescription>([
		[StepKind.Code, new StepKindDescription("code", "Code step")],
		[StepKind.Sub, new StepKindDescription("sub", "Sub-step")],
		[StepKind.Full, new StepKindDescription("full", "Full step")]
	]);

	public static getStepKind(step: StepResult): StepKind {
		if (step instanceof FullStepResult) {
			if (step.isLastSubstep)
				return StepKind.Full;
			else
				return StepKind.Sub;
		} else {
			return StepKind.Code;
		}
	}

	public static getHierarchicalIndex(value: StepKind | StepResult): number {
		let kind = value instanceof StepResult ? this.getStepKind(value) : value;

		switch (kind) {
			case StepKind.Code: return 0;
			case StepKind.Sub: return 1;
			case StepKind.Full: return 2;
		}
	}

	public static getStepKindsStrings(): StepKindDescription[] {
		let set = new Set<StepKind>();
		let result = new Array<StepKindDescription>();

		for (const keyPair of this.map) {
			if (!set.has(keyPair[0])) {
				set.add(keyPair[0]);
				result.push(keyPair[1]);
			}
		}

		return result;
	}

	public static fromString(text: string | null | undefined): StepKind | undefined {
		if (text == null || text == undefined)
			return undefined;

		for (const keyPair of this.map) {
			if (keyPair[1].machineName == text)
				return keyPair[0];
		}

		return undefined;
	}

	public static toString(kind: StepKind): StepKindDescription {
		let result = this.map.get(kind);

		if (result == undefined)
			throw new Error("StepKind without toString implementation");

		return result;
	}
}