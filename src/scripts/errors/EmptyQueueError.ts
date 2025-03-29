export class EmptyQueueError extends Error {
	public constructor() {
		super("Dequeue operation unexpectedly returned empty result");
	}
}