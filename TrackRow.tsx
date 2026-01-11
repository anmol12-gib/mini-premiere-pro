import { useGlobalStore } from "../../store/globalStore";
import type { Track } from "../../types/editor";
import { ClipItem } from "./ClipItem";

type Props = {
  track: Track;
};

export function TrackRow({ track }: Props) {
  const clips = useGlobalStore((s) => s.clips);

  const trackClips = clips.filter(
    (c) => c.trackId === track.id
  );

  return (
    <div
      data-track-id={track.id}   // 🔥 REQUIRED
      style={{
        height: 56,
        borderBottom: "1px solid #222",
        position: "relative",
        background: "#0f0f0f",
      }}
    >

      {trackClips.map((clip) => (
        <ClipItem key={clip.id} clip={clip} />
      ))}
    </div>
  );
}