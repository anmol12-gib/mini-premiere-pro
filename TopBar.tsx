import { useState } from "react";
import { useGlobalStore } from "../../store/globalStore";
import { renderVideo } from "../../utils/renderVideo";

const menuItemStyle: React.CSSProperties = {
  padding: "10px 14px",
  cursor: "pointer",
  borderBottom: "1px solid #222",
  fontSize: 13,
};

export function TopBar() {
  // ✅ HOOK INSIDE COMPONENT (CORRECT)
  const [showShare, setShowShare] = useState(false);

  /* =========================
     EXPORT (PUBLIC LINK)
     ========================= */
  function handleExport() {
    const state = useGlobalStore.getState();

    const payload = {
      clips: state.clips,
      tracks: state.tracks,
      mediaFiles: state.mediaFiles.map((m) => ({
        id: m.id,
        name: m.name,
        type: m.type,
        duration: m.duration,
      })),
    };

    const encoded = btoa(JSON.stringify(payload));
    const link = `${window.location.origin}/view?project=${encoded}`;

    navigator.clipboard.writeText(link);
    alert("Share link copied to clipboard");
    setShowShare(false);
  }

  /* =========================
     DOWNLOAD MP4
     ========================= */
  async function handleDownload() {
    try {
      const buffer = await renderVideo(); // MUST return ArrayBuffer

      const blob = new Blob(
        [new Uint8Array(buffer)],
        { type: "video/mp4" }
      );

      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "export.mp4";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);
      setShowShare(false);
    } catch (err) {
      console.error(err);
      alert("Export failed");
    }
  }

  return (
    <div className="topbar">
      {/* LEFT */}
      <div className="topbar-left">
       Mini Premiere Pro
      </div>

      {/* CENTER */}
      <div className="topbar-center">
        Project: Demo Edit
      </div>

      {/* RIGHT */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setShowShare((v) => !v)}
          style={{
            padding: "6px 12px",
            marginLeft:"400px",
            borderRadius: 6,
            background: "#2563eb",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Share
        </button>

        {showShare && (
          <div
            style={{
              position: "absolute",
              top: "110%",
              right: 0,
              width: 220,
              background: "#111",
              border: "1px solid #333",
              borderRadius: 8,
              zIndex: 100,
              boxShadow: "0 10px 30px rgba(0,0,0,.4)",
            }}
          >
            <div onClick={handleExport} style={menuItemStyle}>
              Export (Public Link)
            </div>

            <div onClick={handleDownload} style={menuItemStyle}>
              Download MP4
            </div>
          </div>
        )}
      </div>
    </div>
  );
}