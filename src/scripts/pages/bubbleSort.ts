import { BubbleSort } from "../sorts/BubbleSort";
import { initSimulator } from "./simulator";

document.addEventListener("DOMContentLoaded", () => initSimulator(new BubbleSort([])));
