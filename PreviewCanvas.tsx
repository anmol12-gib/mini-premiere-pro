import { useEffect, useRef } from "react";
import { useGlobalStore } from "../../store/globalStore";

export function PreviewCanvas() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastClipId = useRef<string | null>(null);

  const clips = useGlobalStore((s) => s.clips);
  const mediaFiles = useGlobalStore((s) => s.mediaFiles);
  const currentTime = useGlobalStore((s) => s.currentTime);
  const isPlaying = useGlobalStore((s) => s.isPlaying);

  // 🔍 Find active clip at current time
  const activeClip =
    clips.find(
      (c) => currentTime >= c.startTime && currentTime < c.endTime
    ) || null;

  const media = activeClip
    ? mediaFiles.find((m) => m.id === activeClip.mediaId)
    : null;

  /* =========================
     LOAD / SWITCH MEDIA
     ========================= */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // 🔲 No clip → black screen
    if (!activeClip || !media) {
      video.pause();
      video.removeAttribute("src");
      video.load();
      lastClipId.current = null;
      return;
    }

    // 🔁 Switch clip
    if (lastClipId.current !== activeClip.id) {
      lastClipId.current = activeClip.id;

      video.src = media.url;
      video.currentTime = Math.max(
        0,
        currentTime - activeClip.startTime
      );

      video.playbackRate = activeClip.playbackRate ?? 1;
      video.muted = !!activeClip.muted;

      if (isPlaying) {
        video.play().catch(() => {});
      }
    }
  }, [activeClip, media]);

  /* =========================
     SYNC TIME
     ========================= */
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeClip) return;

    const localTime = currentTime - activeClip.startTime;

    if (Math.abs(video.currentTime - localTime) > 0.08) {
      video.currentTime = localTime;
    }

    video.playbackRate = activeClip.playbackRate ?? 1;
    video.muted = !!activeClip.muted;
  }, [currentTime, activeClip]);

  /* =========================
     PLAY / PAUSE
     ========================= */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying]);

  return (
    <div className="preview-root">
      <div className="preview-aspect-frame">
        
        <video
          ref={videoRef}
          className="preview-video"
          playsInline
        /> 
      </div>
    </div>
  );
}
