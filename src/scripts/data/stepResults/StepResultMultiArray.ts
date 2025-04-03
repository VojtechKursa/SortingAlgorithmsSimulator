import { SymbolicColor } from "../../visualization/colors/SymbolicColor";
import { ReadOnlyHighlights } from "../../visualization/Highlights";
import { CallStack, CallStackFrozen } from "../CallStack";
import { IndexedNumber } from "../IndexedNumber";
import { Variable } from "../Variable";
import { StepKind } from "./StepKind";
import { StepResult } from "./StepResult";
import { StepResultArray } from "./StepResultArray";

export class AnnotatedArray {
	public constructor(
		public readonly array: readonly IndexedNumber[],
		public readonly arrayHighlights: ReadOnlyHighlights | null = null,
		public readonly variables: readonly Variable[] = [],
		public readonly name: string | undefined = undefined,
		public readonly callStack: CallStack | CallStackFrozen | undefined = undefined
	) { }
}

export class AnnotatedStepResult {
	public constructor(
		public readonly step: StepResultArray,
		public readonly name: string | undefined = undefined,
	) { }
}

export class StepResultMultiArray extends StepResult {
	public readonly arrays: readonly AnnotatedStepResult[];

	public constructor(
		stepKind: StepKind,
		final: boolean = false,
		description: string = "",
		highlightedCodeLines: ReadOnlyHighlights | number | readonly number[] = new Map<number, SymbolicColor>(),
		arrays: readonly AnnotatedArray[],
		variables: Variable[] | undefined,
		stack: CallStack | CallStackFrozen | undefined = undefined,
	) {
		const discoveredVariables = new Set<string>();
		const variablesMerged: Variable[] = [];

		if (variables != undefined) {
			for (const variable of variables) {
				if (!discoveredVariables.has(variable.name)) {
					discoveredVariables.add(variable.name);
					variablesMerged.push(variable);
				}
			}
		}
		for (const array of arrays) {
			for (const variable of array.variables) {
				if (!discoveredVariables.has(variable.name)) {
					discoveredVariables.add(variable.name);
					variablesMerged.push(variable);
				}
			}
		}

		super(stepKind, final, description, highlightedCodeLines, variablesMerged, stack);

		const arraysInternal: AnnotatedStepResult[] = [];
		for (const array of arrays) {
			arraysInternal.push(new AnnotatedStepResult(
				new StepResultArray(stepKind, array.array, array.arrayHighlights, description, highlightedCodeLines, array.variables, final, array.callStack),
				array.name
			));
		}

		this.arrays = arraysInternal;
	}

	public override acceptEqualStepData(step: StepResult): void {
		super.acceptEqualStepData(step);

		if (!(step instanceof StepResultMultiArray))
			return;

		for (const localArray of this.arrays) {
			for (const remoteArray of step.arrays) {
				if (localArray.name == remoteArray.name) {
					localArray.step.acceptEqualStepData(remoteArray.step);
					break;
				}
			}
		}
	}
}