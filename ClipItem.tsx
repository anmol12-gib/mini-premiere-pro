import { useRef, useState, useEffect } from "react";
import { useGlobalStore } from "../../store/globalStore";
import type { Clip } from "../../types/editor";
import { TIMELINE_SCALE } from "../../utils/time";
import { extractThumbnails } from "../../utils/thumbnails";
import { snapTime } from "../../utils/snap";

type Props = {
  clip: Clip;
};

export function ClipItem({ clip }: Props) {
  const zoom = useGlobalStore((s) => s.zoomLevel);
  const clips = useGlobalStore((s) => s.clips);
  const mediaFiles = useGlobalStore((s) => s.mediaFiles);

  const updateClipProps = useGlobalStore((s) => s.updateClipProps);
  const selectClip = useGlobalStore((s) => s.selectClip);

  const deleteClip = useGlobalStore((s) => s.deleteClip);
  const duplicateClip = useGlobalStore((s) => s.duplicateClip);
  const splitClipAtTime = useGlobalStore((s) => s.splitClipAtTime);
  const toggleClipMute = useGlobalStore((s) => s.toggleClipMute);
  const currentTime = useGlobalStore((s) => s.currentTime);

  /* ======================
     MEDIA RESOLUTION
     ====================== */
  const media = mediaFiles.find((m) => m.id === clip.mediaId);

  /* ======================
     THUMBNAILS
     ====================== */
  const [thumbs, setThumbs] = useState<string[]>([]);
  const extractingRef = useRef(false);

  useEffect(() => {
    if (!media) return;
    if (extractingRef.current) return;

    extractingRef.current = true;

    extractThumbnails(
      media.url,
      clip.startTime,
      clip.endTime,
      Math.max(
        3,
        Math.floor((clip.endTime - clip.startTime) * 2)
      )
    )
      .then(setThumbs)
      .finally(() => {
        extractingRef.current = false;
      });
  }, [media, clip.startTime, clip.endTime]);

  /* ======================
     DRAG / TRIM
     ====================== */
  const dragStartX = useRef(0);
  const startRef = useRef(0);
  const endRef = useRef(0);
  const modeRef = useRef<"move" | "start" | "end" | null>(null);

  const siblings = clips
    .filter((c) => c.trackId === clip.trackId && c.id !== clip.id)
    .sort((a, b) => a.startTime - b.startTime);

  const prev = [...siblings].reverse().find(
    (c) => c.endTime <= clip.startTime
  );
  const next = siblings.find(
    (c) => c.startTime >= clip.endTime
  );

  const minStart = prev ? prev.endTime : 0;
  const maxEnd = next ? next.startTime : Infinity;

  const left = clip.startTime * TIMELINE_SCALE * zoom;
  const width =
    Math.max(0.1, clip.endTime - clip.startTime) *
    TIMELINE_SCALE *
    zoom;

  function onMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    const mode =
      (e.target as HTMLElement).dataset.trim ?? "move";

    e.stopPropagation();
    selectClip(clip.id);

    modeRef.current = mode as any;
    dragStartX.current = e.clientX;
    startRef.current = clip.startTime;
    endRef.current = clip.endTime;

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }

  function onMouseMove(e: MouseEvent) {
    if (!modeRef.current) return;

    const deltaPx = e.clientX - dragStartX.current;
    const delta = deltaPx / (TIMELINE_SCALE * zoom);
    const snapPoints: number[] = [];

    // Playhead snap
    snapPoints.push(currentTime);

    // Neighbor clips snap
    if (prev) snapPoints.push(prev.endTime);
    if (next) snapPoints.push(next.startTime);

    if (modeRef.current === "move") {
      const duration = endRef.current - startRef.current;
      let newStart = startRef.current + delta;
      newStart = snapTime(newStart, snapPoints);
      newStart = Math.max(minStart, newStart);
      newStart = Math.min(maxEnd - duration, newStart);

      updateClipProps(clip.id, {
        startTime: newStart,
        endTime: newStart + duration,
      });
    }

    if (modeRef.current === "start") {
      let newStart = startRef.current + delta;
      newStart = snapTime(newStart, snapPoints);
      newStart = Math.max(minStart, newStart);
      newStart = Math.min(endRef.current - 0.1, newStart);
      updateClipProps(clip.id, { startTime: newStart });
    }

    if (modeRef.current === "end") {
      let newEnd = endRef.current + delta;
      newEnd = snapTime(newEnd, snapPoints);
      newEnd = Math.max(startRef.current + 0.1, newEnd);
      newEnd = Math.min(maxEnd, newEnd);
      updateClipProps(clip.id, { endTime: newEnd });
    }
  }

  function onMouseUp(e: MouseEvent) {
  modeRef.current = null;

  const elements = document.elementsFromPoint(e.clientX, e.clientY);

  const trackEl = elements.find(
    (el) => (el as HTMLElement).dataset?.trackId
  ) as HTMLElement | undefined;

  if (trackEl) {
    const newTrackId = trackEl.dataset.trackId!;
    const deltaPx = e.clientX - dragStartX.current;
    const deltaTime = deltaPx / (TIMELINE_SCALE * zoom);

    const duration = endRef.current - startRef.current;
    let newStart = startRef.current + deltaTime;
    newStart = Math.max(0, newStart);

    updateClipProps(clip.id, {
      trackId: newTrackId,
      startTime: newStart,
      endTime: newStart + duration,
    });
  }

  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("mouseup", onMouseUp);
}


  /* ======================
     UI
     ====================== */
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
  onMouseDown={onMouseDown}
  style={{
    position: "absolute",
    left,
    width,
    top: 8,
    height: 40,
    borderRadius: 6,
    overflow: "visible",   // 🔥 IMPORTANT
    display: "flex",
    cursor: modeRef.current ? "grabbing" : "grab",
    background: "#1f2937",
  }}
>
      {/* THUMBNAILS */}
      <div
  style={{
    display: "flex",
    height: "100%",
    width: "100%",
    overflow: "hidden",
    pointerEvents: "none",
  }}
>
  {thumbs.map((src, i) => (
    <img
      key={i}
      src={src}
      draggable={false}
      style={{
        height: "100%",
        width: `${100 / thumbs.length}%`,
        objectFit: "cover",
        flexShrink: 0,
        opacity: clip.muted ? 0.4 : 1,
      }}
    />
  ))}
</div>


      {/* MENU */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu((v) => !v);
        }}
        style={{
          position: "absolute",
          top: 2,
          opacity:"80%",
          backgroundColor:"#c4c4c0",
          left: 4,
          zIndex: 20,
          fontSize: 20,
          paddingBottom:10,
          marginTop:4,
          marginLeft:4,
          width:"20px",
          height:"30px",
          paddingLeft:5,
          cursor: "pointer",
          userSelect: "none",
          color: "#131313e0",
          border:2,
          borderStyle:"solid",
          borderRadius:8
        }}
      >
        ⋮
        {showMenu && (
  <div
    style={{
      position: "relative",
      top: 3,
      left: 4,
      zIndex: 100,              // 🔥 HIGHER THAN THUMBNAILS
      fontSize: 12,
      cursor: "pointer",
      userSelect: "none",
      color: "#fff",
      background: "rgba(0,0,0,0.6)",
      padding: "2px 4px",
      borderRadius: 4,
    }}
  >
    <div
  style={{
    padding: "8px 12px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  }}
  onClick={() => splitClipAtTime(currentTime)}
  onMouseEnter={(e) =>
    (e.currentTarget.style.background = "#222")
  }
  onMouseLeave={(e) =>
    (e.currentTarget.style.background = "transparent")
  }
>
  Split
</div>

<div
  style={{
    padding: "8px 12px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  }}
  onClick={() => duplicateClip(clip.id)}
  onMouseEnter={(e) =>
    (e.currentTarget.style.background = "#222")
  }
  onMouseLeave={(e) =>
    (e.currentTarget.style.background = "transparent")
  }
>
  Duplicate
</div>


<div
  style={{
    padding: "8px 12px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  }}
  onClick={() => toggleClipMute(clip.id)}
  onMouseEnter={(e) =>
    (e.currentTarget.style.background = "#222")
  }
  onMouseLeave={(e) =>
    (e.currentTarget.style.background = "transparent")
  }
>
  Mute
</div>


<div
  style={{
    padding: "8px 12px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    color: "#f87171",
  }}
  onClick={() => deleteClip(clip.id)}
  onMouseEnter={(e) =>
    (e.currentTarget.style.background = "#222")
  }
  onMouseLeave={(e) =>
    (e.currentTarget.style.background = "transparent")
  }
>
  Delete
</div>

  </div>
)}

  


      </div>

      {/* TRIM HANDLES */}
      <div data-trim="start" style={{ width: 6, cursor: "ew-resize" }} />
      <div style={{ flex: 1 }} />
      <div data-trim="end" style={{ width: 6, cursor: "ew-resize" }} />
    </div>
  );
}