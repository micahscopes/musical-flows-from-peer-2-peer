import { runEffects, tap } from "@most/core";
import { newDefaultScheduler } from "@most/scheduler";
import { activeNotes$ } from "./streams";

const scheduler = newDefaultScheduler();

runEffects(tap(console.log, activeNotes$), scheduler)