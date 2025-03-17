import { BubbleSortWithLock } from "../sorts/BubbleSortWithLock";
import { initSimulator } from "./simulator";

document.addEventListener("DOMContentLoaded", _ => initSimulator(new BubbleSortWithLock([])));
