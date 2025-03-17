import { SelectionSort } from "../sorts/SelectionSort";
import { initSimulator } from "./simulator";

document.addEventListener("DOMContentLoaded", () => initSimulator(new SelectionSort([])));
