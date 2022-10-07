import { midiStreamSkipDuplicates } from "./midi-stream";
import { newDefaultScheduler } from "@most/scheduler";
import pipeline from "pipeline-operator";
import { filter, map, run, runEffects, skipRepeatsWith, tap } from "@most/core";
import { isEqual } from "lodash-es";

const scheduler = newDefaultScheduler();


const tapConsole = tap(console.log);
const skipDuplicateMidiEvents = skipRepeatsWith((noteX, noteY) =>
  isEqual(noteX.rawData, noteY.rawData)
);

const noteOn$ = pipeline(
  midiStreamSkipDuplicates("noteon"),
  tapConsole
)

runEffects(
  noteOn$,
  scheduler
);

const noteOff$ = pipeline(
  midiStreamSkipDuplicates("noteoff"),
  tapConsole
)

runEffects(
  noteOff$,
  scheduler
);

const cc$ = pipeline(
  midiStreamSkipDuplicates('controlchange'),
  // tapConsole,
)

// runEffects(cc$, scheduler)

const holdPedal$ = pipeline(
  cc$,
  filter(({subtype}) => subtype === 'holdpedal'),
  tapConsole,
)

runEffects(holdPedal$, scheduler)

// const pedal$ = hold(
//   most
//     .from(
//       xs.create(
//         keyboardProducer('controlchange', 'all', function (e) {
//           if (e.data[1] != 64) return
//           if (e.value > 64) {
//             return 'sustainon'
//           } else if (e.value <= 64) {
//             return 'sustainoff'
//           }
//         })
//       )
//     )
//     .startWith('sustainoff')
//     .skipRepeats()
// )
// // .tap(logger('pedal'))

