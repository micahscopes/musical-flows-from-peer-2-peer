import { currentTime } from "@most/scheduler";

class EventSourceMessage {
  constructor(url) {
    this.url = url
  }

  run(sink, scheduler) {
    this.eventSource = new EventSource(this.url);
    const send = (e) => tryEvent(currentTime(scheduler), e, sink);
    const dispose = () =>
      this.eventSource.removeEventListener('message', send);

    console.log('listening for events on', this.url)
    this.eventSource.addEventListener('message', send)
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

export const eventSourceSource = url => new EventSourceMessage(url);