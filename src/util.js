import { filter, tap } from "@most/core";

export const tapConsole = tap(console.log);
export const is = filter(x => x);
export const isNot = filter(x => !x);

