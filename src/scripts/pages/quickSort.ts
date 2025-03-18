import { QuickSort } from "../sorts/QuickSort";
import { initSimulator } from "./simulator";

document.addEventListener("DOMContentLoaded", () => initSimulator(new QuickSort([])));