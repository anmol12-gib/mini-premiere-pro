import { MediaPanel } from "../components/MediaPanel/MediaPanel";
import { PreviewCanvas } from "../components/PreviewCanvas/PreviewCanvas";
import { Timeline }  from "../components/Timeline/Timeline.tsx";

export function EditorApp() {
  return (
    <div>
      <h1>Mini Premiere Pro</h1>
      <MediaPanel />
      <PreviewCanvas />
      <Timeline />
    </div>
  );
}
