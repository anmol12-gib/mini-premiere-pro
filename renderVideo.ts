import { useGlobalStore } from "../store/globalStore";

/**
 * Temporary renderer
 * Returns raw video file as Uint8Array
 * (Later replaced with FFmpeg pipeline)
 */
export async function renderVideo(): Promise<Uint8Array> {
  const state = useGlobalStore.getState();

  if (state.clips.length === 0) {
    throw new Error("No clips to export");
  }

  const firstClip = state.clips[0];
  const media = state.mediaFiles.find(
    (m) => m.id === firstClip.mediaId
  );

  if (!media) {
    throw new Error("Media not found");
  }

  const res = await fetch(media.url);
  const buffer = await res.arrayBuffer();

  return new Uint8Array(buffer);
}
