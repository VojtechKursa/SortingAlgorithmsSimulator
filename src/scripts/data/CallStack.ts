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
	private readonly array = new Array<CallStackLevel>();

	public push(level: CallStackLevel): void {
		this.array.push(level);
	}

	public pop(): CallStackLevel | undefined {
		return this.array.pop();
	}

	public top(): CallStackLevel | undefined {
		if (this.array.length > 0)
			return this.array[this.array.length - 1];
		else
			return undefined;
	}

	public freeze(): CallStackFreezed {
		return new CallStackFreezed(this.array);
	}

	[Symbol.iterator](): Iterator<CallStackLevel> {
		return new ReverseArrayIterator(this.array);
	}
}

export class CallStackFreezed implements Iterable<CallStackLevel> {
	private readonly array = new Array<CallStackLevel>();

	public constructor(stack: Array<CallStackLevel>) {
		stack.forEach(level => this.array.push(level.copy()));
	}

	public get depth(): number {
		return this.array.length
	}

	public copy(): CallStackFreezed {
		return new CallStackFreezed(this.array);
	}

	public top(): CallStackLevel | undefined {
		if (this.array.length > 0)
			return this.array[this.array.length - 1].copy();
		else
			return undefined;
	}

	public [Symbol.iterator]() {
		return this.fromTop();
	}

	public fromTop(): Iterator<CallStackLevel, CallStackLevel> {
		return new ReverseArrayIterator(this.copy().array);
	}

	public static equalSimple(callStack1?: CallStackFreezed, callStack2?: CallStackFreezed): boolean {
		if (callStack1 == undefined || callStack2 == undefined) {
			if (callStack1 == undefined && callStack2 == undefined)
				return true;
			else
				return false;
		}

		return callStack1.depth == callStack2.depth;
	}

	public static equal(callStack1?: CallStackFreezed, callStack2?: CallStackFreezed): boolean {
		if (callStack1 == undefined || callStack2 == undefined) {
			if (callStack1 == undefined && callStack2 == undefined)
				return true;
			else
				return false;
		}

		if (callStack1.depth != callStack2.depth)
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