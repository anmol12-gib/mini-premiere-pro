import { useEffect, useRef, useState } from "react";
import { useGlobalStore } from "../../store/globalStore";

export function PreviewControls() {
  const currentTime = useGlobalStore((s) => s.currentTime);
  const duration = useGlobalStore((s) => s.duration);
  const isPlaying = useGlobalStore((s) => s.isPlaying);
  const play = useGlobalStore((s) => s.play);
  const pause = useGlobalStore((s) => s.pause);
  const setCurrentTime = useGlobalStore((s) => s.setCurrentTime);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [volume, setVolume] = useState(1);

  /* grab the preview video once */
  useEffect(() => {
    videoRef.current = document.querySelector(
      ".preview-video"
    ) as HTMLVideoElement | null;
  }, []);

  /* sync volume */
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  return (
    <div
      className="preview-controls"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "0 12px",
        height: 44,
        background: "#1a1a1a",
        borderTop: "1px solid #333",
      }}
    >
      {/* PLAY / PAUSE */}
      <button
        onClick={isPlaying ? pause : play}
        style={{ fontSize: 18 }}
      >
        {isPlaying ? "⏸" : "▶"}
      </button>

      {/* PROGRESS BAR (FULL WIDTH) */}
      <input
        type="range"
        min={0}
        max={duration || 0}
        step={0.01}
        value={currentTime}
        onChange={(e) =>
          setCurrentTime(Number(e.target.value))
        }
        style={{
          flex: 1,                // 🔴 THIS makes it full-width
          height: 4,
          width: 800,
          cursor: "pointer",
        }}
      />

      {/* TIME */}
      <span
        style={{
          fontSize: 12,
          opacity: 0.8,
          minWidth: 90,
          textAlign: "right",
        }}
      >
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>
    </div>
  );
}

/* =========================
   TIME FORMATTER
   ========================= */
function formatTime(sec: number) {
  if (!sec || sec < 0) return "00:00";
  const s = Math.floor(sec % 60)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((sec / 60) % 60)
    .toString()
    .padStart(2, "0");
  const h = Math.floor(sec / 3600);
  return h > 0
    ? `${h}:${m}:${s}`
    : `${m}:${s}`;
}
