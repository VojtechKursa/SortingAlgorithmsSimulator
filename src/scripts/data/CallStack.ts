import { Variable } from "./Variable";

export class CallStackLevel {
	public readonly functionName: string;
	private readonly array: Variable[];

	public constructor(functionName: string, variables: Variable[]) {
		this.functionName = functionName;
		this.array = variables.slice();
	}

	public get variables(): Variable[] {
		return this.array.slice();
	}

	public copy() {
		return new CallStackLevel(this.functionName.slice(), this.array.slice());
	}
}

export class CallStack implements Iterable<CallStackLevel> {
	protected readonly array = new Array<CallStackLevel>();

	protected _currentFunctionName: string | undefined;
	public set currentFunctionName(value: string | undefined) {
		this._currentFunctionName = value;
	}
	public get currentFunctionName(): string | undefined {
		return this._currentFunctionName;
	}

	public constructor(initialFunctionName?: string) {
		this.currentFunctionName = initialFunctionName;
	}

	public push(level: CallStackLevel | Variable[], newFunctionName?: string): void {
		if (level instanceof Array) {
			if (this.currentFunctionName == undefined)
				throw new Error("Push called with variable array parameter on call stack where current function name is not defined.");

			level = new CallStackLevel(this.currentFunctionName, level);
		}

		this.array.push(level);
		this.currentFunctionName = newFunctionName;
	}

	public pop(): CallStackLevel | undefined {
		this.currentFunctionName = this.secondToTop()?.functionName;
		return this.array.pop();
	}

	public top(variables: Variable[]): CallStackLevel | undefined {
		if (this.currentFunctionName == undefined)
			throw new Error("Top called on call stack without a defined current function name");

		return new CallStackLevel(this.currentFunctionName, variables)
	}

	public secondToTop(): CallStackLevel | undefined {
		if (this.array.length > 0)
			return this.array[this.array.length - 1];
		else
			return undefined;
	}

	public freeze(): CallStackFrozen {
		return new CallStackFrozen(this.array, this.currentFunctionName);
	}

	/**
	 * @returns Iterator, which iterates over the stack from second-to-top to bottom as top isn't stored as an actual level.
	 */
	[Symbol.iterator](): Iterator<CallStackLevel> {
		return new ReverseArrayIterator(this.array);
	}
}

export class CallStackFrozen extends CallStack implements Iterable<CallStackLevel> {
	public constructor(
		stack: Array<CallStackLevel>,
		currentFunctionName?: string
	) {
		super();

		this._currentFunctionName = currentFunctionName;
		stack.forEach(level => this.array.push(level.copy()));
	}

	private override set currentFunctionName(_: string | undefined) { }
	public override get currentFunctionName(): string | undefined {
		return this._currentFunctionName;
	}

	public get depth(): number {
		return this.array.length;
	}

	public copy(): CallStackFrozen {
		return this.freeze();
	}

	public override[Symbol.iterator]() {
		return this.fromTop();
	}

	public fromTop(): Iterator<CallStackLevel, CallStackLevel> {
		return new ReverseArrayIterator(this.copy().array);
	}

	public static equalSimple(callStack1?: CallStackFrozen, callStack2?: CallStackFrozen): boolean {
		if (callStack1 == undefined || callStack2 == undefined) {
			return callStack1 == undefined && callStack2 == undefined;
		}

		return callStack1.depth === callStack2.depth && callStack1.currentFunctionName === callStack2.currentFunctionName;
	}

	public static equal(callStack1?: CallStackFrozen, callStack2?: CallStackFrozen): boolean {
		if (callStack1 == undefined || callStack2 == undefined) {
			return callStack1 == undefined && callStack2 == undefined;
		}

		if (callStack1.depth !== callStack2.depth || callStack1.currentFunctionName !== callStack2.currentFunctionName)
			return false;

		const mappingFunction: (variable: Variable) => [string, Variable] = (variable) => [variable.name, variable]

		const iterator1 = callStack1.fromTop();
		const iterator2 = callStack2.fromTop();

		for (let i = 0; i < callStack1.depth; i++) {
			let level1 = iterator1.next().value;
			let level2 = iterator2.next().value;

			if (level1.functionName != level2.functionName)
				return false;

			let variables1 = level1.variables;
			let variables2 = level2.variables

			if (variables1.length != variables2.length)
				return false;

			let map1 = new Map<string, Variable>(variables1.map(mappingFunction));
			let map2 = new Map<string, Variable>(variables2.map(mappingFunction));

			for (const map1Entry of map1) {
				const map2Var = map2.get(map1Entry[0])

				if (map1Entry[1] != map2Var)
					return false;
			}
		}

		return true;
	}
}

class ReverseArrayIterator<T> implements Iterator<T, T> {
	private index: number;

	public constructor(private readonly array: Array<T>) {
		this.index = array.length;
	}

	public next(): IteratorResult<T, any> {
		this.index--;

		return {
			value: this.array[this.index],
			done: this.index < 0
		};
	}
}