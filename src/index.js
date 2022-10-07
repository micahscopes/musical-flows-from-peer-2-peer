import {
  combine,
  delay,
  map,
  multicast,
  runEffects,
  scan,
  snapshot,
  startWith,
  switchLatest,
  tap,
} from "@most/core";
import { domEvent } from "@most/dom-event";
import { uniqueId } from "lodash-es";
import pipeline from "pipeline-operator";
import { eventSourceSource } from "./eventsource-source";
import { setDiffStreams } from "./set-diff-streams";
import { activeNotes$, noteOn$, pressedNotes$ } from "./streams";
import { inspectStream, scheduler, tapConsole } from "./util";

const id = uniqueId()

window.addEventListener('DOMContentLoaded', () => {
  console.log('ready')
})

const currentChannel$ = pipeline(
  domEvent("hashchange", window),
  map(() => location.hash),
  startWith(location.hash),
  map((hash) => hash?.substring(1)) 
)

runEffects(tap(
  channel => {
    document.querySelector('#channel').value = decodeURI(channel)
  },
  currentChannel$
), scheduler)

const currentChannelUrl$ = pipeline(
  currentChannel$,
  map((channel) => `pubsub://${channel}?format=json`)
);

// inspectStream(currentChannelUrl$)

const messagesOnCurrentChannel$ = pipeline(
  currentChannelUrl$,
  map(eventSourceSource),
  switchLatest,
  map(({ data }) => JSON.parse(data)),
  // tapConsole
);

const notesOnCurrentChannel$ = pipeline(
  messagesOnCurrentChannel$,
  scan((notes, {from, data}) => {
    notes[from] = data.notes
    return notes
  }, {}),
  map(notes => new Set(...Object.values(notes))),
  tapConsole,
  multicast
)

const [channelNotesAdded$, channelNotesRemoved$] = setDiffStreams(notesOnCurrentChannel$)

runEffects(tap(
  // (notesAdded) => document.querySelector('all-around-keyboard')?.keysPress([...notesAdded]),
  (notesAdded) => document.querySelector('all-around-keyboard')?.keysLight([...notesAdded]),
  // console.log,
  channelNotesAdded$
), scheduler);

runEffects(tap(
  // (notesRemoved) => document.querySelector('all-around-keyboard')?.keysRelease([...notesRemoved]),
  (notesRemoved) => document.querySelector('all-around-keyboard')?.keysDim([...notesRemoved]),
  // console.log,
  channelNotesRemoved$
), scheduler);

const [myNotesAdded$, myNotesRemoved$] = setDiffStreams(activeNotes$)

runEffects(tap(
  (notesAdded) => document.querySelector('all-around-keyboard')?.keysPress([...notesAdded]),
  // (notesAdded) => document.querySelector('all-around-keyboard')?.keysLight([...notesAdded]),
  // console.log,
  myNotesAdded$
), scheduler);

runEffects(tap(
  (notesRemoved) => document.querySelector('all-around-keyboard')?.keysRelease([...notesRemoved]),
  // (notesRemoved) => document.querySelector('all-around-keyboard')?.keysDim([...notesRemoved]),
  // console.log,
  myNotesRemoved$
), scheduler);

const greetOnLatestChannel$ = pipeline(
  currentChannelUrl$,
  delay(100),
  tap((url) => {
    // console.log('greeting on channel:', url)
    fetch(url, { method: "POST", body: JSON.stringify({message: 'hello!'}) });
  })
);
// runEffects(greetOnLatestChannel$, scheduler);

const sendActiveNotesToCurrentChannel$ = pipeline(
  combine(
    (currentChannelUrl, notes) => ({ currentChannelUrl, notes }),
    currentChannelUrl$,
    activeNotes$
  ),
  tap(({ currentChannelUrl, notes }) => {
    // console.log('sending notes to current channel', notes, currentChannelUrl)
    fetch(currentChannelUrl, { method: "POST", body: JSON.stringify({
      id,
      notes: [...notes]
    }) });
  })
);

runEffects(sendActiveNotesToCurrentChannel$, scheduler);





// inspectStream(noteOn$)