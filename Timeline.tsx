import { useMemo, useRef, useEffect } from "react";
import { useGlobalStore } from "../../store/globalStore";
import { TrackRow } from "./TrackRow";
import { TimeRuler } from "./TimeRuler";
import { Playhead } from "./Playhead";
import { TIMELINE_SCALE } from "../../utils/time";
import { BASE_SCALE } from "../../utils/time";

const MIN_DURATION = 30;
const TRACK_BLOCK_HEIGHT = 76; // 20 label + 56 row
const RULER_HEIGHT = 36;

export function Timeline() {
  const tracks = useGlobalStore((s) => s.tracks);
  const clips = useGlobalStore((s) => s.clips);
  const zoom = useGlobalStore((s) => s.zoomLevel);
  const currentTime = useGlobalStore((s) => s.currentTime);
  const isPlaying = useGlobalStore((s) => s.isPlaying);
  const selectClip = useGlobalStore((s) => s.selectClip);
  const setCurrentTime = useGlobalStore((s) => s.setCurrentTime);
  const play = useGlobalStore((s) => s.play);
  const pause = useGlobalStore((s) => s.pause);


  const scrollRef = useRef<HTMLDivElement>(null);

  /* =========================
     TIMELINE DURATION
     ========================= */
  const duration = useMemo(() => {
    if (clips.length === 0) return MIN_DURATION;
    return Math.max(
      MIN_DURATION,
      Math.max(...clips.map((c) => c.endTime))
    );
  }, [clips]);

  const contentWidth =
  duration * BASE_SCALE * zoom + 200;


  const totalHeight =
    RULER_HEIGHT + tracks.length * TRACK_BLOCK_HEIGHT;

  /* =========================
     CLICK TO SEEK (EMPTY ONLY)
     ========================= */
  function handleTimelineClick(
  e: React.MouseEvent<HTMLDivElement>
) {
  if (!scrollRef.current) return;

  const bounds = scrollRef.current.getBoundingClientRect();
  const x =
    e.clientX -
    bounds.left +
    scrollRef.current.scrollLeft;

  const time =
    x / (TIMELINE_SCALE * zoom);

  const wasPlaying = isPlaying;

  setCurrentTime(
    Math.max(0, Math.min(time, duration))
  );

  if (wasPlaying) {
    play();
  } else {
    pause();
  }
}


  /* =========================
     AUTO SCROLL ON PLAY
     ========================= */
  useEffect(() => {
    if (!isPlaying || !scrollRef.current) return;

    const px =
      currentTime * TIMELINE_SCALE * zoom;

    const container = scrollRef.current;
    const left = container.scrollLeft;
    const right = left + container.clientWidth;

    if (px < left + 80) {
      container.scrollLeft = px - 80;
    } else if (px > right - 80) {
      container.scrollLeft =
        px - container.clientWidth + 80;
    }
  }, [currentTime, zoom, isPlaying]);

  return (
    <div
      className="editor-timeline"
      style={{ height: totalHeight }}
    >
      <div
        ref={scrollRef}
        style={{
          width: "100%",
          height: "100%",
          overflowX: "auto",
          overflowY: "auto",
        }}
        onMouseDown={handleTimelineClick}
      >
        <div
          style={{
            width: contentWidth,
            height: "100%",
            position: "relative",
          }}
        >
          <TimeRuler />
          <Playhead />

          {tracks.map(track => (
            <div
              key={track.id}
              data-track-id={track.id}   // ✅ THIS IS STEP C1
              style={{ position: "relative" }}
            >
              

              <TrackRow track={track} />
              </div>
            ))}

        </div>
      </div>
    </div>
  );
}
