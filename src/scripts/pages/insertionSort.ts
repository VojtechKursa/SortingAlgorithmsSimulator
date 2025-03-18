import { InsertionSort } from "../sorts/InsertionSort";
import { initSimulator } from "./simulator";

document.addEventListener("DOMContentLoaded", () => initSimulator(new InsertionSort([])));
