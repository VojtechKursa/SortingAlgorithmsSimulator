import { FamilySpaceComplexity, FamilyTimeComplexity } from "./Complexity";

export interface CommonSortProperties {
	readonly name: string;
	readonly nameMachine: string;
	readonly shortDescription: string;
	readonly longDescription: string;
	readonly timeComplexity: FamilyTimeComplexity;
	readonly spaceComplexity: FamilySpaceComplexity;
	readonly stable: boolean | null;
	readonly inPlace: boolean | null;
}