import { InsertionSort } from "../sorts/InsertionSort";
import { initSimulator } from "./simulator";

document.addEventListener("DOMContentLoaded", _ => initSimulator(new InsertionSort([])));
