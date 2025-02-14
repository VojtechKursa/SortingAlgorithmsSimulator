import { CommonSortProperties } from "./CommonSortProperties";
import { SortProperties } from "./SortProperties";

export interface SortFamilyProperties extends CommonSortProperties {
	readonly sorts: SortProperties[];
};