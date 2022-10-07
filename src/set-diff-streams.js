import { filter, map, multicast, scan } from "@most/core";
import pipeline from "pipeline-operator";

const pairWindow = (slidingWindow, x) => slidingWindow.concat(x).slice(-2);

export const setDiffStreams = ($) => {
  const diff$ = scan(
    pairWindow,
    [new Set(), new Set()],
    map((els) => new Set([...els]), $)
  );

  return [
    // diff$,
    pipeline(
      diff$,
      map(
        ([last, current]) => new Set([...current].filter((k) => !last.has(k)))
      ),
      filter((e) => e.size > 0),
      multicast
    ),
    pipeline(
      diff$,
      map(
        ([last, current]) => new Set([...last].filter((k) => !current.has(k)))
      ),
      filter((e) => e.size > 0),
      multicast
    ),
  ];
};
