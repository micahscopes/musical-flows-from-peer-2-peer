import { newDefaultScheduler } from "@most/scheduler";
import { filter, runEffects, tap } from "@most/core";

export const scheduler = newDefaultScheduler();

export const tapConsole = tap(console.log);
export const is = filter(x => x);
export const isNot = filter(x => !x);

export const inspectStream = ($, topic) => runEffects(tap(evt => console.log(topic, evt), $), scheduler)
