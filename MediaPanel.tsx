import { useGlobalStore } from "../../store/globalStore";
import type { MediaFile } from "../../types/editor";

export function MediaPanel() {
  const mediaFiles = useGlobalStore((s) => s.mediaFiles);
  const addMedia = useGlobalStore((s) => s.addMedia);
  const addClip = useGlobalStore((s) => s.addClip);

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0];
  if (!file) return;

  const url = URL.createObjectURL(file);

  const video = document.createElement("video");
  video.src = url;

  video.onloadedmetadata = () => {
    const media: MediaFile = {
      id: crypto.randomUUID(),
      name: file.name,
      type: "video",
      duration: video.duration, // ✅ REAL duration
      url,
    };

    addMedia(media);

    addClip({
      id: crypto.randomUUID(),
      mediaId: media.id,
      trackId: "", // will be assigned in store
      startTime: 0,
      endTime: video.duration,
    });
  };
}


  return (
  <div style={{ padding: 12, textAlign: "center" }}>
    <h4 style={{ marginBottom: "15px" }}>Media</h4>

    {/* --- 1. Custom Import Button --- */}
    <input
      type="file"
      id="custom-file-upload"
      accept="video/*"
      style={{ display: "none" }} // Hides the ugly default input
      onChange={handleImport}
    />
    <label
      htmlFor="custom-file-upload"
      style={{
        backgroundColor: "green",
        color: "white",
        padding: "10px 20px",
        borderRadius: "5px",
        cursor: "pointer",
        display: "inline-block",
        fontWeight: "bold",
        marginBottom: "20px",
        transition: "background 0.2s", // Smooth hover effect
      }}
      // Optional: Add simple hover effect logic if you use a CSS file or styled-components
      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "darkgreen")}
      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "green")}
    >
      + Add Media
    </label>

    {/* --- 2. Styled File List --- */}
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {mediaFiles.map((m) => (
        <div
          key={m.id}
          style={{
            backgroundColor: "#333", // Dark gray background for list items
            color: "white",
            padding: "10px",
            borderRadius: "4px",
            textAlign: "left",
            fontSize: "14px",
            border: "1px solid #444", // Subtle border
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between", // Pushes delete icon to right if you add one later
          }}
        >
          {/* File Name Truncated if too long */}
          <span style={{ 
            whiteSpace: "nowrap", 
            overflow: "hidden", 
            textOverflow: "ellipsis",
            maxWidth: "100%" 
          }}>
            {m.name}
          </span>
        </div>
      ))}
      
      {mediaFiles.length === 0 && (
        <div style={{ color: "#666", fontSize: "12px", fontStyle: "italic" }}>
          No media imported yet.
        </div>
      )}
    </div>
  </div>
);
}