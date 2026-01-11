import { useGlobalStore } from "../../store/globalStore";

export function InspectorPanel() {
  const clips = useGlobalStore((s) => s.clips);
  const selectedClipId = useGlobalStore((s) => s.selectedClipId);
  const updateClipProps = useGlobalStore((s) => s.updateClipProps);

  const clip = clips.find((c) => c.id === selectedClipId);

  if (!clip) {
    return <div style={{padding:80}}>Select a clip to edit</div>;
  }

  return (
    // Added overflow: 'hidden' to the main container as a safety measure
    <div style={{ display: "flex", flexDirection: "column", gap: 12, overflowX: "hidden" }}>
      <h4>Clip Inspector</h4>

      {/* --- Start Time --- */}
      <label>
        Start Time
        <input
          type="number"
          className="form-control inspector-input"
          step={0.1}
          value={clip.startTime}
          onChange={(e) =>
            updateClipProps(clip.id, {
              startTime: Number(e.target.value),
            })
          }
        />
      </label>
      <br />

      {/* --- End Time --- */}
      <label>
        End Time
        <input
          type="number"
          className="form-control inspector-input"
          step={0.1}
          value={clip.endTime}
          onChange={(e) =>
            updateClipProps(clip.id, {
              endTime: Number(e.target.value),
            })
          }
        />
      </label>
      <br />

      {/* --- Playback Speed --- */}
      <label>
        Playback Speed: <strong>{clip.playbackRate ?? 1}x</strong>
        <div style={{ display: "flex", gap: 15, marginTop: "8px" }}>
          {[0.25, 0.5, 1, 1.5, 2].map((v) => (
            <button
              key={v}
              onClick={() => updateClipProps(clip.id, { playbackRate: v })}
              style={{
                padding: "4px 6px",
                background: clip.playbackRate === v ? "#de5917" : "#333",
                color: "#fff",
                border: "1px solid #444",
                borderRadius: 8,
                cursor: "pointer",
                flex: 1, // Ensures buttons fit the width evenly
              }}
            >
              {v}x
            </button>
          ))}
        </div>
      </label>
      <br />

      {/* --- UPDATED OPACITY CONTROL --- */}
      <label style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Opacity</span>
            {/* Shows value so user knows it's working */}
            <span>{Math.round((clip.opacity ?? 1) * 100)}%</span>
        </div>
        
        <input
          type="range"
          className="op"
          min="0"
          max="1"
          step="0.01" // Makes the slider move smoothly
          value={clip.opacity ?? 1}
          // width: "100%" prevents the overflow
          // accentColor: "orange" styles the bar
          style={{ width: "100%", accentColor: "orange", cursor: "pointer" }}
          onChange={(e) =>
            updateClipProps(clip.id, {
              opacity: Number(e.target.value),
            })
          }
        />
      </label>
    </div>
  );
}