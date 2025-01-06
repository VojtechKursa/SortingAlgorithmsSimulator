import { BubbleSortOptimized } from "../sorts/BubbleSortOptimized";
import { initSimulator } from "./simulator";

document.addEventListener("DOMContentLoaded", _ => initSimulator(new BubbleSortOptimized([])));
