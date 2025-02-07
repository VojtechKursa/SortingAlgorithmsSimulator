import { SpaceComplexity, TimeComplexity } from "./Complexity";

export interface SortProperties {
	readonly name: string;
	readonly nameMachine: string;
	readonly shortDescription: string;
	readonly longDescription: string;
	readonly timeComplexity: TimeComplexity;
	readonly spaceComplexity: SpaceComplexity;
	readonly stable: boolean;
	readonly inPlace: boolean;
};
