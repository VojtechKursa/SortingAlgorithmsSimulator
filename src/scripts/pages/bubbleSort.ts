import { BubbleSort } from "../sorts/BubbleSort";
import { initSimulator } from "./simulator";

document.addEventListener("DOMContentLoaded", _ => initSimulator(new BubbleSort([])));
