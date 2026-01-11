export async function extractThumbnails(
  videoUrl: string,
  start: number,
  end: number,
  count = 8
): Promise<string[]> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.src = videoUrl;
    video.crossOrigin = "anonymous";
    video.muted = true;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const thumbnails: string[] = [];

    video.onloadedmetadata = async () => {
      canvas.width = 160;
      canvas.height = 90;

      const duration = end - start;
      const step = duration / count;

      for (let i = 0; i < count; i++) {
        video.currentTime = start + step * i;
        await new Promise((r) => (video.onseeked = r));

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        thumbnails.push(canvas.toDataURL("image/jpeg", 0.7));
      }

      resolve(thumbnails);
    };
  });
}
