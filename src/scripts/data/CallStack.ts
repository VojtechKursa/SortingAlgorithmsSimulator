import { Variable } from "./Variable";

export class CallStack implements Iterable<Variable[]> {
	private readonly array = new Array<Variable[]>();

	public push(level: Variable[]): void {
		this.array.push(level);
	}

	public pop(): Variable[] | undefined {
		return this.array.pop();
	}

	public top(): Variable[] | undefined {
		if (this.array.length > 0)
			return this.array[this.array.length - 1];
		else
			return undefined;
	}

	public freeze(): CallStackFreezed {
		return new CallStackFreezed(this.array);
	}

	[Symbol.iterator](): Iterator<Variable[]> {
		return new ReverseArrayIterator(this.array);
	}
}

export class CallStackFreezed implements Iterable<Variable[]> {
	private readonly array = new Array<Variable[]>();

	public constructor(stack: Array<Variable[]>) {
		stack.forEach(level => this.array.push(level.slice()));
	}

	public get depth(): number {
		return this.array.length
	}

	public copy(): CallStackFreezed {
		return new CallStackFreezed(this.array);
	}

	public top(): Variable[] | undefined {
		if (this.array.length > 0)
			return this.array[this.array.length - 1].slice();
		else
			return undefined;
	}

	public [Symbol.iterator]() {
		return this.fromTop();
	}

	public fromTop(): Iterator<Variable[], Variable[], Variable[]> {
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

			if (level1.length != level2.length)
				return false;

			let map1 = new Map<string, Variable>(level1.map(mappingFunction));
			let map2 = new Map<string, Variable>(level2.map(mappingFunction));

			for (const map1Entry of map1) {
				const map2Var = map2.get(map1Entry[0])

				if (map1Entry[1] != map2Var)
					return false;
			}
		}

		return true;
	}
}

class ReverseArrayIterator<T> implements Iterator<T, T, T> {
	private index: number;

	public constructor(private readonly array: Array<T>) {
		this.index = array.length;
	}

	public next(): IteratorResult<T, any> {
		this.index--;

		return {
			value: this.array[this.index],
			done: this.index <= 0
		};
	}
}