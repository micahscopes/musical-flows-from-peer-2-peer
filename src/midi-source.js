import { WebMidi } from "webmidi";
import { currentTime } from "@most/scheduler";
import { isEqual } from "lodash-es";
import { skipRepeatsWith } from "@most/core";

const ALL_CHANNELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

await WebMidi.enable();

class MidiSource {
  constructor(
    event,
    deviceOrDevices = null,
    channels = ALL_CHANNELS,
    capture = null
  ) {
    // use an array of device names + devices OR fall back on all devices
    this.devices = [deviceOrDevices || WebMidi.inputs]
      .flat()
      .map((device) =>
        typeof device === String
          ? [...WebMidi.inputs].filter((input) => input.name === device)
          : device
      )
      .flat();

    this.event = event;
    this.capture = capture;
    this.channels = channels;
  }

  run(sink, scheduler) {
    const send = (e) => tryEvent(currentTime(scheduler), e, sink);
    const dispose = () =>
      this.devices.forEach((device) => device.removeListener(this.event, send));

    // console.log(
    //   "setting up a stream for",
    //   this.devices,
    //   "on",
    //   this.event,
    //   "events"
    // );

    this.devices.forEach((device) =>
      device.addListener(this.event, send, {
        channels: this.channels || ALL_CHANNELS,
      })
    );

    return { dispose };
  }
}

function tryEvent(t, x, sink) {
  try {
    sink.event(t, x);
  } catch (e) {
    console.log(e);
    sink.error(t, e);
  }
}

export const midiSource = (event, device, channels) =>
  new MidiSource(event, device, channels);

const skipDuplicateMidiEvents = skipRepeatsWith((noteX, noteY) =>
  isEqual(noteX.rawData, noteY.rawData)
);

export const midiSourceSkipDuplicates = (event, device, channels) =>
  skipDuplicateMidiEvents(midiSource(event, device, channels));
