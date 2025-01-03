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

	public copy(): CallStackFreezed {
		return new CallStackFreezed(this.array);
	}

	public top(): Variable[] | undefined {
		if (this.array.length > 0)
			return this.array[this.array.length - 1].slice();
		else
			return undefined;
	}

	[Symbol.iterator](): Iterator<Variable[]> {
		return new ReverseArrayIterator(this.copy().array);
	}
}

class ReverseArrayIterator<T> implements Iterator<T> {
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