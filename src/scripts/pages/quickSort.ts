import { QuickSort } from "../sorts/QuickSort";
import { initSimulator } from "./simulator";

document.addEventListener("DOMContentLoaded", _ => initSimulator(new QuickSort([])));