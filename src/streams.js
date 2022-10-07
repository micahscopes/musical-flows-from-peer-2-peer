import { midiSourceSkipDuplicates } from "./midi-source";
import { newDefaultScheduler } from "@most/scheduler";
import pipeline from "pipeline-operator";
import {
  combineArray,
  constant,
  filter,
  map,
  merge,
  now,
  run,
  runEffects,
  sample,
  scan,
  skipRepeats,
  skipRepeatsWith,
  startWith,
  switchLatest,
  tap,
} from "@most/core";
import { isEqual } from "lodash-es";
import { is, isNot } from "./util";

export const noteOn$ = midiSourceSkipDuplicates("noteon");
export const noteOff$ = midiSourceSkipDuplicates("noteoff");
export const cc$ = midiSourceSkipDuplicates("controlchange");

export const pressedNotes$ = scan(
  (pressed, { type, note }) => {
    if (type === "noteon") {
      pressed.add(note.identifier);
    } else if (type === "noteoff") {
      pressed.delete(note.identifier);
    }
    return pressed;
  },
  new Set(),
  merge(noteOn$, noteOff$)
);

export const sustainPedal$ = pipeline(
  cc$,
  filter(({ subtype }) => subtype === "holdpedal")
);

export const sustainPedalDown$ = skipRepeats(
  map(({ value }) => value >= 0.5, sustainPedal$)
);

export const sustainedNotes$ = pipeline(
  map(
    (sustainPedalDown) =>
      sustainPedalDown
        ? scan(
            (sustainedNotes, newNotes) =>
              new Set([...sustainedNotes, ...newNotes]),
            new Set(),
            pressedNotes$
          )
        : now(new Set()),
    sustainPedalDown$
  ),
  switchLatest
);

export const sustenutoPedal$ = pipeline(
  cc$,
  filter(({ subtype }) => subtype === "sustenutopedal")
);

export const sustenutoDown$ = skipRepeats(map(({ value }) => value >= 0.5, sustenutoPedal$));

export const sustenutoNotes$ = merge(
  sample(pressedNotes$, is(sustenutoDown$)),
  constant(new Set(), isNot(sustenutoDown$))
);

export const activeNotes$ = pipeline(
  combineArray(
    (pressedNotes, sustainedNotes, sustenutoNotes) =>
      new Set([...pressedNotes, ...sustainedNotes, ...sustenutoNotes]),
    [
      startWith(new Set(), pressedNotes$),
      startWith(new Set(), sustainedNotes$),
      startWith(new Set(), sustenutoNotes$),
    ]
  ),
  skipRepeatsWith(isEqual)
);

