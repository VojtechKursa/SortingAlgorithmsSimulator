export interface CommonSortProperties {
	readonly name: string;
	readonly nameMachine: string;
	readonly shortDescription: string;
	readonly longDescription: string;
	readonly stable: boolean | null;
	readonly inPlace: boolean | null;
}