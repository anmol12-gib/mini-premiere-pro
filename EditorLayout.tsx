import { TopBar } from "../components/TopBar/TopBar";
import { MediaPanel } from "../components/MediaPanel/MediaPanel";
import { PreviewCanvas } from "../components/PreviewCanvas/PreviewCanvas";
import { Timeline } from "../components/Timeline/Timeline";
import { PreviewControls } from "../components/PreviewControls/PreviewControls.tsx";
import { InspectorPanel } from "../components/InspectorPanel/InspectorPanel";







export default function EditorLayout() {
  return (
    <div className="editor-root">
      {/* TOP BAR */}
      <TopBar />

      {/* MAIN WORK AREA */}
      <div className="editor-workspace">
        {/* LEFT MEDIA PANEL */}
        <aside className="editor-sidebar">
          <MediaPanel />
        </aside>

        {/* CENTER PREVIEW AREA */}
        <main className="editor-preview">
          <div className="preview-canvas-wrapper">
            <PreviewCanvas />
          </div>

          <div className="preview-controls-wrapper">
            <PreviewControls />
          </div>
        </main>

        {/* RIGHT INSPECTOR */}
        <div className="editor-inspector">
          <InspectorPanel />
        </div>

      </div>

      {/* TIMELINE (ALWAYS FIXED) */}
      <div className="editor-timeline">
        <Timeline />
      </div>
    </div>
  );
}