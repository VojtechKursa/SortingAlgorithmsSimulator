import { Variable } from "./Variable";

/**
 * Represents a level of the call stack.
 */
export class CallStackLevel {
	/**
	 * The name of the function at the given call stack level.
	 */
	public readonly functionName: string;

	/**
	 * The variables local to the given call stack level.
	 */
	private readonly array: readonly Variable[];

	/**
	 * @param functionName - The name of the function at the given call stack level.
	 * @param variables - The variables local to the given call stack level.
	 */
	public constructor(functionName: string, variables: readonly Variable[]) {
		this.functionName = functionName;
		this.array = variables.slice();
	}

	/**
	 * Gets the variables local to the given call stack level.
	 * @returns The variables local to the given call stack level.
	 */
	public get variables(): Variable[] {
		return this.array.slice();
	}

	/**
	 * Creates a deep copy of the call stack level.
	 * @returns A deep copy of the call stack level.
	 */
	public copy() {
		return new CallStackLevel(this.functionName.slice(), this.array.slice());
	}
}

/**
 * Represents a call stack of an algorithm.
 *
 * The current function is not stored as a call stack level so, but instead just the function name is stored and related variables must be stored
 * outside the call stack. This is done to keep the ever-changing variables outside the call stack to enable stack reuse between steps
 * for the purposes of saving memory.
 */
export class CallStack implements Iterable<CallStackLevel> {
	/**
	 * The array of all the call stack levels in the call stack.
	 * @see {@link CallStackLevel}
	 */
	protected readonly array = new Array<CallStackLevel>();

	/**
	 * The name of the current function (that is virtually at the top of the call stack).
	 */
	protected _currentFunctionName: string | undefined;
	/**
	 * Sets the name of the current function (that is virtually at the top of the call stack).
	 */
	public set currentFunctionName(value: string | undefined) {
		this._currentFunctionName = value;
	}
	/**
	 * Gets the name of the current function (that is virtually at the top of the call stack).
	 */
	public get currentFunctionName(): string | undefined {
		return this._currentFunctionName;
	}

	/**
	 * @param initialFunctionName - The name of the function that initially at the top of the call stack.
	 */
	public constructor(initialFunctionName?: string) {
		this.currentFunctionName = initialFunctionName;
	}

	/**
	 * Pushes a new level into the call stack. Used to push the last function into the stack.
	 * @param level - The level to push into the call stack.
	 * @param newFunctionName - The name of the current function (that will virtually be at the top of the call stack after the push).
	 */
	public push(level: CallStackLevel | readonly Variable[], newFunctionName?: string): void {
		if (level instanceof Array) {
			if (this.currentFunctionName == undefined)
				throw new Error("Push called with variable array parameter on call stack where current function name is not defined.");

			level = new CallStackLevel(this.currentFunctionName, level);
		}

		this.array.push(level);
		this.currentFunctionName = newFunctionName;
	}

	/**
	 * Pops the top level from the call stack.
	 * @returns The popped level or undefined, if the stack is empty.
	 */
	public pop(): CallStackLevel | undefined {
		this.currentFunctionName = this.secondToTop()?.functionName;
		return this.array.pop();
	}

	/**
	 * Gets the top level of the call stack (the current function).
	 * See description of the CallStack class for explanation why variables have to be passed to this method.
	 * @see {@link CallStack}
	 * @param variables - The variables local to the top level.
	 * @returns The top level of the call stack.
	 */
	public top(variables: readonly Variable[]): CallStackLevel | undefined {
		if (this.currentFunctionName == undefined)
			throw new Error("Top called on call stack without a defined current function name");

		return new CallStackLevel(this.currentFunctionName, variables)
	}

	/**
	 * Gets the second-to-top level of the call stack (the first level that is stored as a CallStackLevel).
	 * See description of the CallStack class for explanation why the second-to-top level is the first level stored as a CallStackLevel.
	 * @see {@link CallStack}
	 * @returns The second-to-top level of the call stack or undefined, if the stack is shallower than 2 level.
	 */
	public secondToTop(): CallStackLevel | undefined {
		if (this.array.length > 0)
			return this.array[this.array.length - 1];
		else
			return undefined;
	}

	/**
	 * Freezes the call stack into a CallStackFrozen object.
	 * @returns A CallStackFrozen object representing the call stack.
	 */
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

/**
 * Represents a frozen (read-only) call stack of an algorithm.
 *
 * The current function is not stored as a call stack level so, but instead just the function name is stored and related variables must be stored
 * outside the call stack. This is done to keep the ever-changing variables outside the call stack to enable stack reuse between steps
 * for the purposes of saving memory.
 */
export class CallStackFrozen extends CallStack implements Iterable<CallStackLevel> {
	/**
	 * @param stack - The array of all the call stack levels in the call stack.
	 * @param currentFunctionName - The name of the current function (that is virtually at the top of the call stack).
	 */
	public constructor(
		stack: Array<CallStackLevel>,
		currentFunctionName?: string
	) {
		super();

		this._currentFunctionName = currentFunctionName;
		stack.forEach(level => this.array.push(level.copy()));
	}

	/**
	 * Overrides parent's setter to prevent overwriting of the current function name.
	 */
	private override set currentFunctionName(_: string | undefined) { }

	/**
	 * Get the name of the current function (that is virtually at the top of the call stack).
	 */
	public override get currentFunctionName(): string | undefined {
		return this._currentFunctionName;
	}

	/**
	 * Gets the depth of the call stack.
	 */
	public get depth(): number {
		return this.array.length;
	}

	/**
	 * Creates a deep copy of the call stack.
	 * @returns A deep copy of the call stack.
	 */
	public copy(): CallStackFrozen {
		return this.freeze();
	}

	/**
	 * @returns Iterator, which iterates over the stack from top to bottom.
	 */
	public override[Symbol.iterator]() {
		return this.fromTop();
	}

	/**
	 * @returns Iterator, which iterates over the stack from top to bottom.
	 */
	public fromTop(): Iterator<CallStackLevel, CallStackLevel> {
		return new ReverseArrayIterator(this.copy().array);
	}

	/**
	 * Simplified, version of equality check between call stacks.
	 * Faster than it's complete counterpart and useful if it's used only for monitoring for changes.
	 *
	 * !!! Doesn't guarantee equality if used for purposes other than monitoring for changes!
	 *
	 * @see {@link CallStackFrozen.equal}
	 *
	 * @param callStack1 - The first call stack to compare.
	 * @param callStack2 - The second call stack to compare.
	 * @returns True if the call stacks are equal by simplified algorithm (have the same depth and current function name), false otherwise.
	 */
	public static equalSimple(callStack1?: CallStackFrozen, callStack2?: CallStackFrozen): boolean {
		if (callStack1 == undefined || callStack2 == undefined) {
			return callStack1 == undefined && callStack2 == undefined;
		}

		return callStack1.depth === callStack2.depth && callStack1.currentFunctionName === callStack2.currentFunctionName;
	}

	/**
	 * Checks whether two call stacks are equal.
	 * @param callStack1 - The first call stack to compare.
	 * @param callStack2 - The second call stack to compare.
	 * @returns True if the call stacks are equal, false otherwise.
	 */
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

/**
 * Iterator that iterates over a given array in reverse order.
 */
class ReverseArrayIterator<T> implements Iterator<T, T> {
	/**
	 * The current index of the iteration (the last returned index).
	 */
	private index: number;

	/**
	 * @param array - The array to iterate over.
	 */
	public constructor(private readonly array: readonly T[]) {
		this.index = array.length;
	}

	/**
	 * @returns The next value in the iteration.
	 */
	public next(): IteratorResult<T, any> {
		this.index--;

		return {
			value: this.array[this.index],
			done: this.index < 0
		};
	}
}