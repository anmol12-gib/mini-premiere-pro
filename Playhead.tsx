import { useEffect, useRef, useState } from "react";
import { useGlobalStore } from "../../store/globalStore";
import { TIMELINE_SCALE } from "../../utils/time";

const RULER_HEIGHT = 36;
const TRACK_HEADER_HEIGHT = 40;
const TRACK_ROW_HEIGHT = 56;

export function Playhead() {
  const currentTime = useGlobalStore((s) => s.currentTime);
  const zoom = useGlobalStore((s) => s.zoomLevel);
  const setCurrentTime = useGlobalStore((s) => s.setCurrentTime);
  const clips = useGlobalStore((s) => s.clips);
  const tracks = useGlobalStore((s) => s.tracks);

  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const maxEnd =
    clips.length === 0
      ? Infinity
      : Math.max(...clips.map((c) => c.endTime));

  const x =
    Math.min(currentTime, maxEnd) *
    TIMELINE_SCALE *
    zoom;

  const playheadHeight =
    RULER_HEIGHT +
    tracks.length * (TRACK_HEADER_HEIGHT + TRACK_ROW_HEIGHT);

  

  /* =========================
     DRAG HANDLERS
     ========================= */
  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!dragging || !ref.current) return;

      const timeline =
        ref.current.parentElement?.parentElement;
      if (!timeline) return;

      const bounds =
        timeline.getBoundingClientRect();

      const scrollLeft =
        timeline.scrollLeft;

      const pos =
        e.clientX -
        bounds.left +
        scrollLeft;

      const time =
        pos / (TIMELINE_SCALE * zoom);

      setCurrentTime(
        Math.max(0, Math.min(time, maxEnd))
      );
    }

    function onUp() {
      setDragging(false);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, zoom, maxEnd, setCurrentTime]);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        left: x,
        top: 0,
        height: playheadHeight,
        width: 2,
        background: "red",
        pointerEvents: "none",
        zIndex: 10,
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        setDragging(true);
      }}
    />
  );
}
