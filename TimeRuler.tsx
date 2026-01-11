import { useMemo } from "react";
import { useGlobalStore } from "../../store/globalStore";
import { TIMELINE_SCALE } from "../../utils/time";
import { formatTime } from "../../utils/formatTime";

const RULER_HEIGHT = 36;
const BASE_INTERVAL = 5; // ✅ default 5-second ticks

export function TimeRuler() {
  const zoom = useGlobalStore((s) => s.zoomLevel);
  const duration = useGlobalStore((s) => s.duration);

  /* =========================
     CALCULATE TICKS
     ========================= */
  const ticks = useMemo(() => {
    if (!duration || duration <= 0) return [];

    const totalSeconds = Math.ceil(duration);
    const list: { sec: number; major: boolean }[] = [];

    for (let sec = 0; sec <= totalSeconds; sec++) {
      const isMajor = sec % BASE_INTERVAL === 0;
      list.push({ sec, major: isMajor });
    }

    return list;
  }, [duration]);

  return (
    <div
      style={{
        height: RULER_HEIGHT,
        position: "relative",
        background: "#111",
        borderBottom: "1px solid #2a2a2a",
        userSelect: "none",
        overflow: "hidden", // ✅ NO SCROLLBAR
      }}
    >
      {ticks.map(({ sec, major }) => {
        const x = sec * TIMELINE_SCALE * zoom;

        return (
          <div
            key={sec}
            style={{
              position: "absolute",
              left: x,
              bottom: 0,
              transform: "translateX(-50%)",
              pointerEvents: "none",
            }}
          >
            {/* TICK LINE */}
            <div
              style={{
                width: 1,
                height: major ? 14 : 8,
                background: major ? "#aaa" : "#555",
                margin: "0 auto",
              }}
            />

            {/* LABEL — ONLY MAJOR TICKS */}
            {major && (
              <div
                style={{
                  marginTop: 2,
                  fontSize: 11,
                  color: "#ddd",
                  whiteSpace: "nowrap",
                  textAlign: "center",
                }}
              >
                {formatTime(sec)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
